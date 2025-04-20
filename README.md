# Quran Knowledge Graph

A comprehensive graph database representation of the Quran that captures the complex relationships between chapters, verses, words, linguistic features, and thematic elements. This project uses Kuzu as the graph database and incorporates vector embeddings for semantic search and thematic discovery.

## Overview

The Quran Knowledge Graph project aims to:

1. Create a rich, interconnected representation of the Quranic text
2. Enable powerful semantic search and thematic exploration
3. Facilitate linguistic analysis and pattern discovery
4. Support scholarly research and personal study
5. Provide a foundation for AI-enhanced Quranic applications

## Features

- **Graph-Based Representation**: Captures the interconnected nature of the Quranic text
- **Vector Embeddings**: Enables semantic search and similarity analysis
- **Thematic Mapping**: Represents the rich thematic structure of the Quran
- **Linguistic Analysis**: Connects words to their roots, lemmas, and stems
- **AI Enhancement**: Leverages artificial intelligence for deeper insights

## Project Structure

- `docs/`: Comprehensive documentation of products, queries, and scholarly approaches
- `quran_graph/`: Core Python package for the Quran Knowledge Graph
  - `scripts/`: Utility scripts for data processing and graph operations
  - `models/`: Data models and schema definitions
  - `db/`: Database configuration and connection utilities
- `data/`: Data files and resources
- `memories/`: Documentation of database schema, relationships, and implementation plans

## Getting Started

### Prerequisites

- Python 3.8+
- Kuzu graph database
- Required Python packages (see requirements.txt)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/muhajirdev/quran-labs.git
   cd quran-knowledge-graph
   ```

2. Install dependencies
   ```
   pip install -r requirements.txt
   ```

3. Initialize the database
   ```
   python -m quran_graph.scripts.init_db
   ```

4. Import data
   ```
   python -m quran_graph.scripts.import_data
   ```

## Documentation

For detailed documentation, see the `docs/` directory:

- [Products and Use Cases](docs/products/README.md)
- [Example Queries](docs/queries/README.md)
- [Scholarly Approaches](docs/scholarly_approaches.md)

## Data Sources

The primary data source for this project is [qul.tarteel.ai](https://qul.tarteel.ai), which provides:

- Quranic text in multiple scripts
- Chapter and verse metadata
- Word-by-word analysis
- Linguistic features (roots, lemmas, stems)
- Thematic classifications

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [appropriate license] - see the LICENSE file for details.

## Acknowledgments

- [qul.tarteel.ai](https://qul.tarteel.ai) for providing the data
- The Kuzu team for the graph database
- All contributors and researchers who have contributed to Quranic studies
