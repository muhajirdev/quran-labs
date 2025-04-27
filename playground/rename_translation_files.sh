#!/bin/bash

# Navigate to the translations directory
cd playground/raw_data/translations

# Rename files to include language information
# English translations
mv "Abdul Haleem.simple.sqlite" "abdul_haleem_english.sqlite"
mv "Dr. T. B. Irving.simple.sqlite" "dr_tb_irving_english.sqlite"
mv "Maarif-ul-Quran.simple.sqlite" "maarif_ul_quran_english.sqlite"
mv "Ruwwad Center.simple.sqlite" "ruwwad_center_english.sqlite"
mv "Saheeh International.simple.sqlite" "saheeh_international_english.sqlite"

# Indonesian translations
mv "King Fahad Quran Complex.simple.sqlite" "king_fahad_quran_complex_indonesian.sqlite"
mv "The Sabiq company.simple.sqlite" "the_sabiq_company_indonesian.sqlite"
mv "Indonesian Islamic affairs ministry.simple.sqlite" "indonesian_islamic_affairs_ministry_indonesian.sqlite"

# List the renamed files
echo "Translation files have been renamed:"
ls -la *.sqlite
