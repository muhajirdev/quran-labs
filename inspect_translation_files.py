import os
import sqlite3
import re

# Path to translations directory
translations_dir = "playground/raw_data/translations"

# Function to detect language based on text sample
def detect_language(text):
    # Simple language detection based on common words and characters
    if not text:
        return "unknown"
    
    # Check for Indonesian-specific words or patterns
    indonesian_patterns = [
        r'\bdan\b', r'\byang\b', r'\bitu\b', r'\bdi\b', r'\bdari\b',
        r'\bAllah Yang Maha\b', r'\bkepada\b', r'\bmereka\b'
    ]
    
    indonesian_count = sum(1 for pattern in indonesian_patterns if re.search(pattern, text))
    
    # If multiple Indonesian patterns are found, likely Indonesian
    if indonesian_count >= 3:
        return "indonesian"
    
    # Default to English if no specific patterns are matched
    return "english"

# List all translation files
translation_files = [f for f in os.listdir(translations_dir) if f.endswith('.sqlite')]

print(f"Found {len(translation_files)} translation files")

# Inspect each file
for filename in translation_files:
    file_path = os.path.join(translations_dir, filename)
    
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(file_path)
        cursor = conn.cursor()
        
        # Get the total number of entries
        cursor.execute("SELECT COUNT(*) FROM translation")
        total_entries = cursor.fetchone()[0]
        
        # Get a sample of text for language detection
        cursor.execute("SELECT text FROM translation WHERE text IS NOT NULL LIMIT 10")
        samples = cursor.fetchall()
        sample_text = " ".join([sample[0] for sample in samples if sample[0]])
        
        # Detect language
        language = detect_language(sample_text)
        
        # Get the first few entries as examples
        cursor.execute("SELECT sura, ayah, ayah_key, text FROM translation LIMIT 3")
        examples = cursor.fetchall()
        
        print(f"\nFile: {filename}")
        print(f"  Total entries: {total_entries}")
        print(f"  Detected language: {language}")
        print("  Sample entries:")
        for example in examples:
            print(f"    {example[2]}: {example[3][:100]}...")
        
        conn.close()
    except Exception as e:
        print(f"\nError inspecting {filename}: {e}")

print("\nInspection complete!")
