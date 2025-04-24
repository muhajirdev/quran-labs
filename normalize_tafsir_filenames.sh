#!/bin/bash

# Navigate to the raw_data directory
cd playground/raw_data

# Rename each tafsir file according to the new convention
# Tafsir English Al-Mukhtasar.sqlite -> tafsir_al_mukhtasar_english.sqlite
mv "Tafsir English Al-Mukhtasar.sqlite" "tafsir_al_mukhtasar_english.sqlite"

# Tafsir Ibn Kathir (abridged).sqlite -> tafsir_ibn_kathir_abridged.sqlite
mv "Tafsir Ibn Kathir (abridged).sqlite" "tafsir_ibn_kathir_abridged.sqlite"

# Tafsir Indoniesua Al-Mukhtasar in Interpreting the Noble Quran.sqlite -> tafsir_al_mukhtasar_indonesian.sqlite
mv "Tafsir Indoniesua Al-Mukhtasar in Interpreting the Noble Quran.sqlite" "tafsir_al_mukhtasar_indonesian.sqlite"

# Tafsir Jalalayn.sqlite -> tafsir_jalalayn.sqlite
mv "Tafsir Jalalayn.sqlite" "tafsir_jalalayn.sqlite"

# Tafsir Maarif-ul-Quran.sqlite -> tafsir_maarif_ul_quran.sqlite
mv "Tafsir Maarif-ul-Quran.sqlite" "tafsir_maarif_ul_quran.sqlite"

# Tafsir Tazkirul Quran(Maulana Wahiduddin Khan).sqlite -> tafsir_tazkirul_quran_wahiduddin_khan.sqlite
mv "Tafsir Tazkirul Quran(Maulana Wahiduddin Khan).sqlite" "tafsir_tazkirul_quran_wahiduddin_khan.sqlite"

echo "Tafsir filenames have been normalized."
