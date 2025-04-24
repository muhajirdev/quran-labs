import kuzu
import os

# Check if the database exists
db_path = "quran_graph_db"
if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

# Initialize the database
db = kuzu.Database(db_path)
conn = kuzu.Connection(db)

# Try to query the Verse table
try:
    result = conn.execute("MATCH (v:Verse) RETURN count(v) AS verse_count")
    verse_count = result.get_as_df().iloc[0]['verse_count']
    print(f"Found {verse_count} verses in the database")
except Exception as e:
    print(f"Error querying Verse table: {e}")

# Try to query the Tafsir table
try:
    result = conn.execute("MATCH (t:Tafsir) RETURN count(t) AS tafsir_count")
    tafsir_count = result.get_as_df().iloc[0]['tafsir_count']
    print(f"Found {tafsir_count} tafsir entries in the database")
except Exception as e:
    print(f"Error querying Tafsir table: {e}")

# Try to query the HAS_TAFSIR relationship
try:
    result = conn.execute("MATCH ()-[r:HAS_TAFSIR]->() RETURN count(r) AS rel_count")
    rel_count = result.get_as_df().iloc[0]['rel_count']
    print(f"Found {rel_count} HAS_TAFSIR relationships in the database")
except Exception as e:
    print(f"Error querying HAS_TAFSIR relationship: {e}")

# Try to list all node labels
try:
    result = conn.execute("MATCH (n) RETURN DISTINCT labels(n)[0] AS node_type")
    node_types = result.get_as_df()
    print("\nNode types in the database:")
    print(node_types)
except Exception as e:
    print(f"Error listing node types: {e}")

# Try to list all relationship types
try:
    result = conn.execute("MATCH ()-[r]->() RETURN DISTINCT type(r) AS rel_type")
    rel_types = result.get_as_df()
    print("\nRelationship types in the database:")
    print(rel_types)
except Exception as e:
    print(f"Error listing relationship types: {e}")
