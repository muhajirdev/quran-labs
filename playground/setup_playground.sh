#!/bin/bash

# Setup script for Quran Knowledge Graph playground

echo "Setting up Quran Knowledge Graph playground environment..."

# Create a virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
    echo "Virtual environment created."
else
    echo "Virtual environment already exists."
fi

# Activate the virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing required packages..."
pip install -r requirements.txt

# Create data directory if it doesn't exist
if [ ! -d "../data" ]; then
    echo "Creating data directory..."
    mkdir -p ../data
fi

echo "Setup complete! You can now run Jupyter Notebook:"
echo "cd playground"
echo "source venv/bin/activate"
echo "jupyter notebook"
echo ""
echo "This will open Jupyter in your browser. Open quran_graph_exploration.ipynb to get started."
