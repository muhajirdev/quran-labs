import kuzu
import sqlite3

# Initialize the database
db = kuzu.Database("quran_graph_db")
conn = kuzu.Connection(db)

# Connect to the SQLite database
sqlite_conn = sqlite3.connect("./raw_data/tafsir_ibn_kathir_abridged.sqlite")
cursor = sqlite_conn.cursor()

# Get a sample tafsir text
cursor.execute("SELECT ayah_key, text FROM tafsir WHERE ayah_key = '2:255'")
row = cursor.fetchone()

if row:
    ayah_key, text = row
    print(f"Tafsir for verse {ayah_key} from Ibn Kathir:")
    print(f"Text length: {len(text)} characters")
    print("First 500 characters:")
    print(text[:500])
else:
    print("No tafsir found for verse 2:255")

sqlite_conn.close()
