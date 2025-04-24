import kuzu
import os
import re
import pandas as pd
import time
import sqlite3

# Initialize the database
db_path = "quran_graph_db"
if not os.path.exists(db_path):
    print(f"Creating new database at {db_path}")
    db = kuzu.Database(db_path)
else:
    print(f"Using existing database at {db_path}")
    db = kuzu.Database(db_path)

conn = kuzu.Connection(db)

# Install and load SQLite extension if not already loaded
try:
    conn.execute("INSTALL sqlite")
    conn.execute("LOAD sqlite")
    print("SQLite extension installed and loaded")
except Exception as e:
    print(f"SQLite extension already loaded or error: {e}")

# Check if Verse table exists, if not create it
try:
    result = conn.execute("MATCH (v:Verse) RETURN count(v) AS count").get_as_df()
    verse_count = result.iloc[0]["count"]
    print(f"Found {verse_count} existing verses in the database")
except Exception as e:
    print(f"Verse table not found, creating and loading from ayah.sqlite: {e}")
    # Attach ayah.sqlite and create Verse node table
    conn.execute("ATTACH './raw_data/ayah.sqlite' as ayah (dbtype sqlite)")
    conn.execute(
        """
    CREATE NODE TABLE Verse (
        id INT64,
        surah_number INT64,
        ayah_number INT64,
        verse_key STRING PRIMARY KEY,
        text STRING)
    """
    )
    conn.execute("COPY Verse FROM ayah.verses")
    verse_count = (
        conn.execute("MATCH (v:Verse) RETURN count(v) AS count")
        .get_as_df()
        .iloc[0]["count"]
    )
    print(f"Loaded {verse_count} verses into Kuzu")

# Create Tafsir node table if it doesn't exist
try:
    result = conn.execute("MATCH (t:Tafsir) RETURN count(t) AS count").get_as_df()
    tafsir_count = result.iloc[0]["count"]
    print(f"Found {tafsir_count} existing tafsir entries in the database")
except Exception as e:
    print(f"Tafsir table not found, creating: {e}")
    conn.execute(
        """
    CREATE NODE TABLE Tafsir (
        id INT64 PRIMARY KEY,
        verse_key STRING,
        text STRING,
        language STRING,
        source STRING,
        group_ayah_key STRING,
        from_ayah STRING,
        to_ayah STRING
    )
    """
    )
    print("Created Tafsir node table")

# Create HAS_TAFSIR relationship table if it doesn't exist
try:
    result = conn.execute(
        "MATCH ()-[r:HAS_TAFSIR]->() RETURN count(r) AS count"
    ).get_as_df()
    rel_count = result.iloc[0]["count"]
    print(f"Found {rel_count} existing HAS_TAFSIR relationships in the database")
except Exception as e:
    print(f"HAS_TAFSIR relationship table not found, creating: {e}")
    conn.execute(
        """
    CREATE REL TABLE HAS_TAFSIR (
        FROM Verse TO Tafsir
    )
    """
    )
    print("Created HAS_TAFSIR relationship table")


# Function to extract language and source from filename
def extract_language_and_source(filename):
    # Remove 'tafsir_' prefix and '.sqlite' suffix
    name = filename.replace("tafsir_", "").replace(".sqlite", "")

    # Extract language and source based on the filename
    if "english" in name:
        language = "english"
        source = name.replace("_english", "")
    elif "indonesian" in name:
        language = "indonesian"
        source = name.replace("_indonesian", "")
    else:
        # Default to English if no language specified
        language = "english"
        source = name

    # Clean up source name
    source = source.replace("_", " ").title()

    return language, source


# Load tafsir data from SQLite files
raw_data_dir = "./raw_data"
tafsir_files = [
    f
    for f in os.listdir(raw_data_dir)
    if f.startswith("tafsir_") and f.endswith(".sqlite")
]

print(f"Found {len(tafsir_files)} tafsir files to process")

# Generate a unique ID for each tafsir entry
try:
    # Get the maximum ID from existing tafsir entries
    max_id_result = conn.execute(
        "MATCH (t:Tafsir) RETURN MAX(t.id) AS max_id"
    ).get_as_df()
    next_id = (
        int(max_id_result.iloc[0]["max_id"]) + 1
        if not max_id_result.iloc[0]["max_id"] is None
        else 1
    )
    print(f"Starting with ID {next_id} based on existing entries")
except Exception as e:
    next_id = 1
    print(f"Starting with ID 1: {e}")

# Process each tafsir file
for tafsir_file in tafsir_files:
    file_path = os.path.join(raw_data_dir, tafsir_file)
    language, source = extract_language_and_source(tafsir_file)

    # Check if this tafsir source has already been processed
    try:
        count_result = conn.execute(
            f"MATCH (t:Tafsir) WHERE t.source = '{source}' AND t.language = '{language}' RETURN count(t) AS count"
        ).get_as_df()
        count = count_result.iloc[0]["count"]
        if count > 0:
            print(
                f"Skipping {tafsir_file} - Already processed {count} entries for {source} in {language}"
            )
            continue
    except Exception as e:
        print(f"Error checking for existing entries: {e}")

    print(f"Processing {tafsir_file} - Language: {language}, Source: {source}")

    # Connect to the SQLite database
    sqlite_conn = sqlite3.connect(file_path)
    cursor = sqlite_conn.cursor()

    # Get the total number of entries
    cursor.execute("SELECT COUNT(*) FROM tafsir")
    total_entries = cursor.fetchone()[0]
    print(f"  Total entries: {total_entries}")

    # Fetch all tafsir entries
    cursor.execute(
        "SELECT ayah_key, group_ayah_key, from_ayah, to_ayah, ayah_keys, text FROM tafsir"
    )

    # Process in batches to avoid memory issues
    batch_size = 1000
    processed = 0
    start_time = time.time()

    while True:
        rows = cursor.fetchmany(batch_size)
        if not rows:
            break

        # Prepare data for insertion
        tafsir_data = []
        for row in rows:
            ayah_key, group_ayah_key, from_ayah, to_ayah, ayah_keys, text = row

            # Skip entries with empty text
            if not text:
                continue

            tafsir_data.append(
                {
                    "id": next_id,
                    "verse_key": ayah_key,
                    "text": text,
                    "language": language,
                    "source": source,
                    "group_ayah_key": group_ayah_key if group_ayah_key else "",
                    "from_ayah": from_ayah if from_ayah else "",
                    "to_ayah": to_ayah if to_ayah else "",
                }
            )
            next_id += 1

        if not tafsir_data:
            processed += len(rows)
            continue

        # Create a temporary file for bulk loading
        temp_df = pd.DataFrame(tafsir_data)
        temp_csv = f"temp_tafsir_{language}_{source.replace(' ', '_')}.csv"
        temp_df.to_csv(temp_csv, index=False)

        # Load data into Kuzu
        conn.execute(
            f"COPY Tafsir FROM '{temp_csv}' (HEADER = true, DELIMITER = ',', PARALLEL = FALSE)"
        )

        # Create relationships
        for entry in tafsir_data:
            try:
                conn.execute(
                    f"""
                MATCH (v:Verse), (t:Tafsir)
                WHERE v.verse_key = '{entry['verse_key']}' AND t.id = {entry['id']}
                CREATE (v)-[:HAS_TAFSIR]->(t)
                """
                )
            except Exception as e:
                print(
                    f"Error creating relationship for verse {entry['verse_key']}: {e}"
                )

        # Clean up
        os.remove(temp_csv)

        processed += len(rows)
        print(
            f"  Processed {processed}/{total_entries} entries ({processed/total_entries*100:.1f}%)"
        )

    sqlite_conn.close()

    elapsed_time = time.time() - start_time
    print(f"  Completed in {elapsed_time:.2f} seconds")

# Count the number of tafsir nodes and relationships
tafsir_count = (
    conn.execute("MATCH (t:Tafsir) RETURN count(t) AS count")
    .get_as_df()
    .iloc[0]["count"]
)
rel_count = (
    conn.execute("MATCH ()-[r:HAS_TAFSIR]->() RETURN count(r) AS count")
    .get_as_df()
    .iloc[0]["count"]
)

print(f"\nGraph Statistics:")
print(f"Tafsir nodes: {tafsir_count}")
print(f"HAS_TAFSIR relationships: {rel_count}")

# Example query: Find tafsirs for a specific verse
print("\nExample: Tafsirs for verse 1:1")
result = conn.execute(
    """
MATCH (v:Verse)-[:HAS_TAFSIR]->(t:Tafsir)
WHERE v.verse_key = '1:1'
RETURN t.source, t.language, substring(t.text, 0, 100) as text_preview
"""
)
print(result.get_as_df())

# Example query: Find verses with tafsir in Indonesian
print("\nExample: Verses with Indonesian tafsir")
result = conn.execute(
    """
MATCH (v:Verse)-[:HAS_TAFSIR]->(t:Tafsir)
WHERE t.language = 'indonesian'
RETURN v.verse_key, t.source
LIMIT 5
"""
)
print(result.get_as_df())

print("\nTafsir data integration complete!")
