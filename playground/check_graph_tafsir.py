import kuzu

# Initialize the database
db = kuzu.Database("quran_graph_db")
conn = kuzu.Connection(db)

# Check if the tafsir text is properly stored in the graph database
result = conn.execute(
    """
MATCH (v:Verse)-[:HAS_TAFSIR]->(t:Tafsir)
WHERE v.verse_key = '2:255' AND t.source = 'Ibn Kathir Abridged'
RETURN t.id, t.text
"""
)

df = result.get_as_df()

if not df.empty:
    text = df.iloc[0]["t.text"]
    text_length = len(text) if text else 0
    print(f"\nTafsir ID: {df.iloc[0]['t.id']}")
    print(f"Text length: {text_length} characters")

    if text_length > 0:
        print("\nFirst 200 characters:")
        print(text[:200])
        print("\nText is properly stored in the graph database.")
    else:
        print("\nText might not be properly stored in the graph database.")

        # Check if there's an issue with HTML content
        result = conn.execute(
            """
        MATCH (t:Tafsir)
        WHERE t.source = 'Ibn Kathir Abridged'
        RETURN t.id, t.verse_key
        LIMIT 5
        """
        )

        print("\nSample tafsir entries from Ibn Kathir:")
        print(result.get_as_df())
else:
    print("\nNo tafsir found for verse 2:255 from Ibn Kathir Abridged.")
