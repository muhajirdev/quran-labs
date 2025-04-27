#!/bin/bash

# Navigate to the raw_data directory
cd playground/raw_data

# Rename tafsir_jalalayn.sqlite to tafsir_jalalayn_indonesian.sqlite
# Since it appears to be empty, we'll mark it as indonesian based on your information
mv "tafsir_jalalayn.sqlite" "tafsir_jalalayn_indonesian.sqlite"

# Check if the other files already have language information
# If not, we'll add it based on our analysis
if [ -f "tafsir_ibn_kathir_abridged.sqlite" ]; then
    mv "tafsir_ibn_kathir_abridged.sqlite" "tafsir_ibn_kathir_abridged_english.sqlite"
fi

if [ -f "tafsir_maarif_ul_quran.sqlite" ]; then
    mv "tafsir_maarif_ul_quran.sqlite" "tafsir_maarif_ul_quran_english.sqlite"
fi

if [ -f "tafsir_tazkirul_quran_wahiduddin_khan.sqlite" ]; then
    mv "tafsir_tazkirul_quran_wahiduddin_khan.sqlite" "tafsir_tazkirul_quran_wahiduddin_khan_english.sqlite"
fi

# List the renamed files
echo "Tafsir files have been renamed:"
ls -la tafsir_*.sqlite
