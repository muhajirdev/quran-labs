import kuzu
import os
import pandas as pd
import time
import sqlite3
import re

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
    verse_count = result.iloc[0]['count']
    print(f"Found {verse_count} existing verses in the database")
except Exception as e:
    print(f"Verse table not found, creating and loading from ayah.sqlite: {e}")
    # Attach ayah.sqlite and create Verse node table
    conn.execute("ATTACH './raw_data/ayah.sqlite' as ayah (dbtype sqlite)")
    conn.execute("""
    CREATE NODE TABLE Verse (
        id INT64,
        surah_number INT64,
        ayah_number INT64,
        verse_key STRING PRIMARY KEY,
        text STRING)
    """)
    conn.execute("COPY Verse FROM ayah.verses")
    verse_count = conn.execute("MATCH (v:Verse) RETURN count(v) AS count").get_as_df().iloc[0]['count']
    print(f"Loaded {verse_count} verses into Kuzu")

# Create Translation node table if it doesn't exist
try:
    result = conn.execute("MATCH (t:Translation) RETURN count(t) AS count").get_as_df()
    translation_count = result.iloc[0]['count']
    print(f"Found {translation_count} existing translation entries in the database")
except Exception as e:
    print(f"Translation table not found, creating: {e}")
    conn.execute("""
    CREATE NODE TABLE Translation (
        id INT64 PRIMARY KEY,
        verse_key STRING,
        text STRING,
        language STRING,
        translator STRING
    )
    """)
    print("Created Translation node table")

# Create HAS_TRANSLATION relationship table if it doesn't exist
try:
    result = conn.execute("MATCH ()-[r:HAS_TRANSLATION]->() RETURN count(r) AS count").get_as_df()
    rel_count = result.iloc[0]['count']
    print(f"Found {rel_count} existing HAS_TRANSLATION relationships in the database")
except Exception as e:
    print(f"HAS_TRANSLATION relationship table not found, creating: {e}")
    conn.execute("""
    CREATE REL TABLE HAS_TRANSLATION (
        FROM Verse TO Translation
    )
    """)
    print("Created HAS_TRANSLATION relationship table")

# Function to extract language and translator from filename
def extract_language_and_translator(filename):
    # Remove '.sqlite' suffix
    name = filename.replace('.sqlite', '')
    
    # Extract language from the filename
    if name.endswith('_english'):
        language = 'english'
        translator = name.replace('_english', '')
    elif name.endswith('_indonesian'):
        language = 'indonesian'
        translator = name.replace('_indonesian', '')
    else:
        # Default to English if no language specified
        language = 'english'
        translator = name
    
    # Clean up translator name
    translator = translator.replace('_', ' ').title()
    
    return language, translator

# Load translation data from SQLite files
translations_dir = './raw_data/translations'
translation_files = [f for f in os.listdir(translations_dir) if f.endswith('.sqlite')]

print(f"Found {len(translation_files)} translation files to process")

# Generate a unique ID for each translation entry
try:
    # Get the maximum ID from existing translation entries
    max_id_result = conn.execute("MATCH (t:Translation) RETURN MAX(t.id) AS max_id").get_as_df()
    next_id = int(max_id_result.iloc[0]['max_id']) + 1 if not max_id_result.iloc[0]['max_id'] is None else 1
    print(f"Starting with ID {next_id} based on existing entries")
except Exception as e:
    next_id = 1
    print(f"Starting with ID 1: {e}")

# Process each translation file
for translation_file in translation_files:
    file_path = os.path.join(translations_dir, translation_file)
    language, translator = extract_language_and_translator(translation_file)
    
    # Check if this translator has already been processed
    try:
        count_result = conn.execute(f"MATCH (t:Translation) WHERE t.translator = '{translator}' AND t.language = '{language}' RETURN count(t) AS count").get_as_df()
        count = count_result.iloc[0]['count']
        if count > 0:
            print(f"Skipping {translation_file} - Already processed {count} entries for {translator} in {language}")
            continue
    except Exception as e:
        print(f"Error checking for existing entries: {e}")
    
    print(f"Processing {translation_file} - Language: {language}, Translator: {translator}")
    
    # Connect to the SQLite database
    sqlite_conn = sqlite3.connect(file_path)
    cursor = sqlite_conn.cursor()
    
    # Get the total number of entries
    cursor.execute("SELECT COUNT(*) FROM translation")
    total_entries = cursor.fetchone()[0]
    print(f"  Total entries: {total_entries}")
    
    # Fetch all translation entries
    cursor.execute("SELECT sura, ayah, ayah_key, text FROM translation")
    
    # Process in batches to avoid memory issues
    batch_size = 1000
    processed = 0
    start_time = time.time()
    
    while True:
        rows = cursor.fetchmany(batch_size)
        if not rows:
            break
        
        # Prepare data for insertion
        translation_data = []
        for row in rows:
            sura, ayah, ayah_key, text = row
            
            # Skip entries with empty text
            if not text:
                continue
                
            translation_data.append({
                'id': next_id,
                'verse_key': ayah_key,
                'text': text,
                'language': language,
                'translator': translator
            })
            next_id += 1
        
        if not translation_data:
            processed += len(rows)
            continue
            
        # Create a temporary file for bulk loading
        temp_df = pd.DataFrame(translation_data)
        temp_csv = f"temp_translation_{language}_{translator.replace(' ', '_')}.csv"
        temp_df.to_csv(temp_csv, index=False)
        
        # Load data into Kuzu
        conn.execute(f"COPY Translation FROM '{temp_csv}' (HEADER = true, DELIMITER = ',', PARALLEL = FALSE)")
        
        # Create relationships
        for entry in translation_data:
            try:
                conn.execute(f"""
                MATCH (v:Verse), (t:Translation)
                WHERE v.verse_key = '{entry['verse_key']}' AND t.id = {entry['id']}
                CREATE (v)-[:HAS_TRANSLATION]->(t)
                """)
            except Exception as e:
                print(f"Error creating relationship for verse {entry['verse_key']}: {e}")
        
        # Clean up
        os.remove(temp_csv)
        
        processed += len(rows)
        print(f"  Processed {processed}/{total_entries} entries ({processed/total_entries*100:.1f}%)")
    
    sqlite_conn.close()
    
    elapsed_time = time.time() - start_time
    print(f"  Completed in {elapsed_time:.2f} seconds")

# Count the number of translation nodes and relationships
translation_count = conn.execute("MATCH (t:Translation) RETURN count(t) AS count").get_as_df().iloc[0]['count']
rel_count = conn.execute("MATCH ()-[r:HAS_TRANSLATION]->() RETURN count(r) AS count").get_as_df().iloc[0]['count']

print(f"\nGraph Statistics:")
print(f"Translation nodes: {translation_count}")
print(f"HAS_TRANSLATION relationships: {rel_count}")

# Example query: Find translations for a specific verse
print("\nExample: Translations for verse 1:1")
result = conn.execute("""
MATCH (v:Verse)-[:HAS_TRANSLATION]->(t:Translation)
WHERE v.verse_key = '1:1'
RETURN t.translator, t.language, t.text
""")
print(result.get_as_df())

# Example query: Find verses with Indonesian translation
print("\nExample: Verses with Indonesian translation")
result = conn.execute("""
MATCH (v:Verse)-[:HAS_TRANSLATION]->(t:Translation)
WHERE t.language = 'indonesian'
RETURN v.verse_key, t.translator
LIMIT 5
""")
print(result.get_as_df())

print("\nTranslation data integration complete!")
