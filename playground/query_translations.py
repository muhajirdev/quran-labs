import kuzu
import pandas as pd

# Initialize the database
db = kuzu.Database("quran_graph_db")
conn = kuzu.Connection(db)

# Query 1: Get translations of a specific verse in multiple languages
print("Query 1: Translations of Surah Al-Fatiha (1:1) in multiple languages")
result = conn.execute("""
MATCH (v:Verse)-[:HAS_TRANSLATION]->(t:Translation)
WHERE v.verse_key = '1:1'
RETURN t.language, t.translator, t.text
ORDER BY t.language, t.translator
""")
df = result.get_as_df()
print(df)
print()

# Query 2: Compare translations of a verse across different translators
print("Query 2: Comparing translations of Ayatul Kursi (2:255) across different translators")
result = conn.execute("""
MATCH (v:Verse)-[:HAS_TRANSLATION]->(t:Translation)
WHERE v.verse_key = '2:255'
RETURN t.translator, t.language, t.text
ORDER BY t.language, t.translator
""")
df = result.get_as_df()
# Display only the first 100 characters of each translation for brevity
df['t.text'] = df['t.text'].str[:100] + '...'
print(df)
print()

# Query 3: Find verses containing a specific word in translation
search_term = "mercy"
print(f"Query 3: Finding verses containing '{search_term}' in English translations")
result = conn.execute(f"""
MATCH (v:Verse)-[:HAS_TRANSLATION]->(t:Translation)
WHERE t.language = 'english' AND t.text CONTAINS '{search_term}'
RETURN v.verse_key, t.translator, t.text
LIMIT 5
""")
df = result.get_as_df()
# Display only the first 100 characters of each translation for brevity
df['t.text'] = df['t.text'].str[:100] + '...'
print(df)
print()

# Query 4: Count verses by translator
print("Query 4: Number of verses translated by each translator")
result = conn.execute("""
MATCH (v:Verse)-[:HAS_TRANSLATION]->(t:Translation)
RETURN t.translator, t.language, count(v) as verse_count
ORDER BY verse_count DESC
""")
print(result.get_as_df())
print()

# Query 5: Get both translation and tafsir for a verse
print("Query 5: Translation and Tafsir for verse 1:1")
try:
    result = conn.execute("""
    MATCH (v:Verse)-[:HAS_TRANSLATION]->(tr:Translation)
    MATCH (v)-[:HAS_TAFSIR]->(ta:Tafsir)
    WHERE v.verse_key = '1:1' AND tr.language = 'english' AND tr.translator = 'Saheeh International'
    RETURN tr.text as translation, ta.source as tafsir_source, substring(ta.text, 0, 100) as tafsir_preview
    LIMIT 1
    """)
    print(result.get_as_df())
except Exception as e:
    print(f"Error executing query: {e}")
    print("Note: This query requires both Translation and Tafsir tables to exist.")
