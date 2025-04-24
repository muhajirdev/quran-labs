import kuzu
import pandas as pd

# Initialize the database
db = kuzu.Database("quran_graph_db")
conn = kuzu.Connection(db)

# Query 1: Count tafsirs by source and language
print("Tafsirs by source and language:")
result = conn.execute(
    """
MATCH (t:Tafsir)
RETURN t.source, t.language, count(*) as count
ORDER BY count DESC
"""
)
print(result.get_as_df())
print()

# Query 2: Find verses with the most tafsirs
print("Verses with the most tafsirs:")
result = conn.execute(
    """
MATCH (v:Verse)-[:HAS_TAFSIR]->(t:Tafsir)
RETURN v.verse_key, count(t) as tafsir_count
ORDER BY tafsir_count DESC
LIMIT 10
"""
)
print(result.get_as_df())
print()

# Query 3: Find tafsirs for a specific verse (Al-Fatiha 1:1)
print("Tafsirs for verse 1:1 (Al-Fatiha):")
result = conn.execute(
    """
MATCH (v:Verse)-[:HAS_TAFSIR]->(t:Tafsir)
WHERE v.verse_key = '1:1'
RETURN t.source, t.language
"""
)
print(result.get_as_df())
print()

# Query 4: Find verses with Indonesian tafsir
print("Sample verses with Indonesian tafsir:")
result = conn.execute(
    """
MATCH (v:Verse)-[:HAS_TAFSIR]->(t:Tafsir)
WHERE t.language = 'indonesian'
RETURN v.verse_key, t.source
LIMIT 5
"""
)
print(result.get_as_df())
print()

# Query 5: Get a sample tafsir text
print("Sample tafsir text for verse 2:255 (Ayatul Kursi) from Ibn Kathir:")
result = conn.execute(
    """
MATCH (v:Verse)-[:HAS_TAFSIR]->(t:Tafsir)
WHERE v.verse_key = '2:255' AND t.source = 'Ibn Kathir Abridged'
RETURN substring(t.text, 0, 500) as text_preview
"""
)
print(result.get_as_df())
