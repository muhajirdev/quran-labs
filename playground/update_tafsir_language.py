import kuzu

# Initialize the database
db = kuzu.Database("quran_graph_db")
conn = kuzu.Connection(db)

# Check if there are any Tafsir Jalalayn entries in the database
result = conn.execute("""
MATCH (t:Tafsir)
WHERE t.source = 'Jalalayn'
RETURN count(t) as count
""")

count = result.get_as_df().iloc[0]['count']
print(f"Found {count} entries for Tafsir Jalalayn")

if count > 0:
    # Update the language of Tafsir Jalalayn to Indonesian
    result = conn.execute("""
    MATCH (t:Tafsir)
    WHERE t.source = 'Jalalayn'
    SET t.language = 'indonesian'
    RETURN count(t) as updated_count
    """)
    
    updated_count = result.get_as_df().iloc[0]['updated_count']
    print(f"Updated {updated_count} entries to language 'indonesian'")
else:
    print("No entries found for Tafsir Jalalayn, no updates needed")

# Verify the language distribution in the database
result = conn.execute("""
MATCH (t:Tafsir)
RETURN t.source, t.language, count(*) as count
ORDER BY count DESC
""")

print("\nTafsir language distribution after update:")
print(result.get_as_df())
