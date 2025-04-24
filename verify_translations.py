import kuzu

# Initialize the database
db_path = "playground/quran_graph_db"
print(f"Checking database at {db_path}")
db = kuzu.Database(db_path)
conn = kuzu.Connection(db)

# Check if Translation table exists and has data
try:
    result = conn.execute("MATCH (t:Translation) RETURN count(t) AS count").get_as_df()
    translation_count = result.iloc[0]["count"]
    print(f"Found {translation_count} translation entries in the database")

    if translation_count > 0:
        # Count translations by language
        result = conn.execute(
            """
        MATCH (t:Translation)
        RETURN t.language, count(t) AS count
        ORDER BY count DESC
        """
        ).get_as_df()
        print("\nTranslations by language:")
        print(result)

        # Count translations by translator
        result = conn.execute(
            """
        MATCH (t:Translation)
        RETURN t.translator, t.language, count(t) AS count
        ORDER BY count DESC
        """
        ).get_as_df()
        print("\nTranslations by translator:")
        print(result)

        # Check HAS_TRANSLATION relationships
        result = conn.execute(
            "MATCH ()-[r:HAS_TRANSLATION]->() RETURN count(r) AS count"
        ).get_as_df()
        rel_count = result.iloc[0]["count"]
        print(f"\nFound {rel_count} HAS_TRANSLATION relationships in the database")

        # Sample translations for verse 1:1
        result = conn.execute(
            """
        MATCH (v:Verse)-[:HAS_TRANSLATION]->(t:Translation)
        WHERE v.verse_key = '1:1'
        RETURN t.translator, t.language, t.text
        """
        ).get_as_df()
        print("\nSample translations for verse 1:1:")
        print(result)

        print("\nTranslation data verification complete!")
        print("✅ Translations have been successfully added to the graph database.")
    else:
        print("\n❌ No translations found in the database.")
except Exception as e:
    print(f"\n❌ Error checking Translation table: {e}")
    print("Translations may not have been added to the graph database.")
