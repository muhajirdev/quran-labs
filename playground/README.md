# Quran Knowledge Graph Playground

This directory contains Jupyter notebooks and scripts for exploring and experimenting with the Quran Knowledge Graph.

## Getting Started

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Setup

1. Run the setup script to create a virtual environment and install dependencies:

```bash
# Make the script executable
chmod +x setup_playground.sh

# Run the setup script
./setup_playground.sh
```

2. Start Jupyter Notebook:

```bash
# Activate the virtual environment (if not already activated)
source venv/bin/activate

# Launch Jupyter Notebook
jupyter notebook
```

3. Open `quran_graph_exploration.ipynb` in the Jupyter interface that appears in your browser.

## Available Notebooks

- **quran_graph_exploration.ipynb**: Basic exploration of the Quran Knowledge Graph using Kuzu queries.

## Adding Your Own Notebooks

Feel free to create additional notebooks in this directory for your own experiments. Make sure to:

1. Keep the virtual environment activated when running notebooks
2. Document your notebooks with clear markdown cells
3. Share interesting findings with the community

## Troubleshooting

If you encounter any issues:

- Make sure your Python version is 3.8 or higher
- Check that all dependencies are installed correctly
- Ensure the database path in the notebook is correct
- If the database doesn't exist yet, you'll need to create it first using the data processing scripts

For more help, contact muhammad@muhajir.dev
