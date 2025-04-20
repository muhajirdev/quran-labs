# Quran Knowledge Graph - Database Schema, Relationships, and Implementation Plan

## 1. Overview

The Quran Knowledge Graph is a graph database representation of the Quran that captures the complex relationships between chapters, verses, words, linguistic features, and thematic elements. Using Kuzu as the graph database, this project aims to enable powerful semantic search, thematic discovery, and linguistic analysis of the Quranic text.

## 2. Node Types (Entities)

### 2.1 Chapter (Surah)
- **Properties**:
  - `id`: Unique identifier
  - `chapter_number`: The number of the chapter (1-114)
  - `name_arabic`: Arabic name of the chapter
  - `name_english`: English name of the chapter
  - `name_simple`: Simplified name
  - `revelation_place`: Where the chapter was revealed (Mecca or Medina)
  - `revelation_order`: Chronological order of revelation
  - `verses_count`: Number of verses in the chapter
  - `bismillah_pre`: Whether the chapter starts with Bismillah

### 2.2 Verse (Ayah)
- **Properties**:
  - `id`: Unique identifier
  - `verse_key`: Chapter:verse format (e.g., "1:1")
  - `verse_number`: Number of the verse within its chapter
  - `verse_index`: Global index across the entire Quran
  - `text_uthmani`: Text in Uthmani script
  - `text_indopak`: Text in Indo-Pak script
  - `juz_number`: Juz number (1-30)
  - `hizb_number`: Hizb number
  - `rub_number`: Rub number
  - `page_number`: Page number in the standard Mushaf
  - `embedding`: Vector embedding for semantic search (768-dimensional)

### 2.3 Word
- **Properties**:
  - `id`: Unique identifier
  - `position`: Position within the verse
  - `text_uthmani`: Text in Uthmani script
  - `text_indopak`: Text in Indo-Pak script
  - `verse_key`: Chapter:verse format
  - `page_number`: Page number in the standard Mushaf
  - `line_number`: Line number on the page
  - `code_v1`: Character code (version 1)
  - `code_v2`: Character code (version 2)
  - `embedding`: Vector embedding (768-dimensional)

### 2.4 Root
- **Properties**:
  - `id`: Unique identifier
  - `value`: Root value
  - `text_clean`: Cleaned text
  - `text_uthmani`: Text in Uthmani script
  - `english_trilateral`: English representation of trilateral root
  - `arabic_trilateral`: Arabic representation of trilateral root
  - `words_count`: Number of words derived from this root

### 2.5 Lemma
- **Properties**:
  - `id`: Unique identifier
  - `text_madani`: Text in Madani script
  - `text_clean`: Cleaned text
  - `words_count`: Number of words with this lemma

### 2.6 Stem
- **Properties**:
  - `id`: Unique identifier
  - `text_madani`: Text in Madani script
  - `text_clean`: Cleaned text
  - `words_count`: Number of words with this stem

### 2.7 Topic
- **Properties**:
  - `id`: Unique identifier
  - `name`: Topic name in English
  - `arabic_name`: Topic name in Arabic
  - `parent_id`: ID of parent topic (for hierarchical structure)
  - `ontology`: Whether it's part of an ontological structure
  - `thematic`: Whether it's a thematic classification
  - `depth`: Depth in the topic hierarchy
  - `embedding`: Vector embedding (768-dimensional)

### 2.8 Translation
- **Properties**:
  - `id`: Unique identifier
  - `text`: Translated text
  - `language_id`: Language identifier
  - `language_name`: Language name
  - `resource_id`: Resource identifier
  - `resource_name`: Name of the translation resource

### 2.9 Tafsir
- **Properties**:
  - `id`: Unique identifier
  - `text`: Exegesis text
  - `language_id`: Language identifier
  - `language_name`: Language name
  - `resource_id`: Resource identifier
  - `resource_name`: Name of the tafsir resource

## 3. Relationship Types (Edges)

### 3.1 CONTAINS
- **From**: Chapter
- **To**: Verse
- **Properties**:
  - `verse_order`: Order of the verse within the chapter

### 3.2 CONTAINS_WORD
- **From**: Verse
- **To**: Word
- **Properties**:
  - `position`: Position of the word within the verse

### 3.3 HAS_ROOT
- **From**: Word
- **To**: Root
- **Properties**: None

### 3.4 HAS_LEMMA
- **From**: Word
- **To**: Lemma
- **Properties**: None

### 3.5 HAS_STEM
- **From**: Word
- **To**: Stem
- **Properties**: None

### 3.6 ADDRESSES_TOPIC
- **From**: Verse
- **To**: Topic
- **Properties**:
  - `relevance`: Relevance score (0-1)
  - `ontology`: Whether it's an ontological relationship
  - `thematic`: Whether it's a thematic relationship

### 3.7 SUBTOPIC_OF
- **From**: Topic
- **To**: Topic
- **Properties**: None

### 3.8 HAS_TRANSLATION
- **From**: Verse
- **To**: Translation
- **Properties**: None

### 3.9 HAS_TAFSIR
- **From**: Verse
- **To**: Tafsir
- **Properties**: None

### 3.10 SIMILAR_TO
- **From**: Verse
- **To**: Verse
- **Properties**:
  - `similarity_score`: Similarity score (0-1)

## 4. Schema Definition in Kuzu

```python
# Chapter (Surah) node
conn.execute("""
CREATE NODE TABLE Chapter(
    id INT64, 
    chapter_number INT64,
    name_arabic STRING, 
    name_english STRING, 
    name_simple STRING,
    revelation_place STRING,
    revelation_order INT64,
    verses_count INT64,
    bismillah_pre BOOLEAN,
    PRIMARY KEY (id)
)
""")

# Verse (Ayah) node
conn.execute("""
CREATE NODE TABLE Verse(
    id INT64, 
    verse_key STRING, 
    verse_number INT64,
    verse_index INT64,
    text_uthmani STRING, 
    text_indopak STRING,
    juz_number INT64,
    hizb_number INT64,
    rub_number INT64,
    page_number INT64,
    embedding FLOAT[768],
    PRIMARY KEY (id)
)
""")

# Word node
conn.execute("""
CREATE NODE TABLE Word(
    id INT64, 
    position INT64,
    text_uthmani STRING,
    text_indopak STRING,
    verse_key STRING,
    page_number INT64,
    line_number INT64,
    code_v1 STRING,
    code_v2 STRING,
    embedding FLOAT[768],
    PRIMARY KEY (id)
)
""")

# Root node
conn.execute("""
CREATE NODE TABLE Root(
    id INT64,
    value STRING,
    text_clean STRING,
    text_uthmani STRING,
    english_trilateral STRING,
    arabic_trilateral STRING,
    words_count INT64,
    PRIMARY KEY (id)
)
""")

# Lemma node
conn.execute("""
CREATE NODE TABLE Lemma(
    id INT64,
    text_madani STRING,
    text_clean STRING,
    words_count INT64,
    PRIMARY KEY (id)
)
""")

# Stem node
conn.execute("""
CREATE NODE TABLE Stem(
    id INT64,
    text_madani STRING,
    text_clean STRING,
    words_count INT64,
    PRIMARY KEY (id)
)
""")

# Topic node
conn.execute("""
CREATE NODE TABLE Topic(
    id INT64, 
    name STRING, 
    arabic_name STRING,
    parent_id INT64,
    ontology BOOLEAN,
    thematic BOOLEAN,
    depth INT64,
    embedding FLOAT[768],
    PRIMARY KEY (id)
)
""")

# Translation node
conn.execute("""
CREATE NODE TABLE Translation(
    id INT64,
    text STRING,
    language_id INT64,
    language_name STRING,
    resource_id INT64,
    resource_name STRING,
    PRIMARY KEY (id)
)
""")

# Tafsir node
conn.execute("""
CREATE NODE TABLE Tafsir(
    id INT64,
    text STRING,
    language_id INT64,
    language_name STRING,
    resource_id INT64,
    resource_name STRING,
    PRIMARY KEY (id)
)
""")

# Chapter contains Verse
conn.execute("""
CREATE REL TABLE CONTAINS(
    FROM Chapter TO Verse, 
    verse_order INT64
)
""")

# Verse contains Word
conn.execute("""
CREATE REL TABLE CONTAINS_WORD(
    FROM Verse TO Word, 
    position INT64
)
""")

# Word has Root
conn.execute("""
CREATE REL TABLE HAS_ROOT(
    FROM Word TO Root
)
""")

# Word has Lemma
conn.execute("""
CREATE REL TABLE HAS_LEMMA(
    FROM Word TO Lemma
)
""")

# Word has Stem
conn.execute("""
CREATE REL TABLE HAS_STEM(
    FROM Word TO Stem
)
""")

# Verse addresses Topic
conn.execute("""
CREATE REL TABLE ADDRESSES_TOPIC(
    FROM Verse TO Topic, 
    relevance FLOAT,
    ontology BOOLEAN,
    thematic BOOLEAN
)
""")

# Topic is subtopic of Topic
conn.execute("""
CREATE REL TABLE SUBTOPIC_OF(
    FROM Topic TO Topic
)
""")

# Verse has Translation
conn.execute("""
CREATE REL TABLE HAS_TRANSLATION(
    FROM Verse TO Translation
)
""")

# Verse has Tafsir
conn.execute("""
CREATE REL TABLE HAS_TAFSIR(
    FROM Verse TO Tafsir
)
""")

# Verse is similar to Verse
conn.execute("""
CREATE REL TABLE SIMILAR_TO(
    FROM Verse TO Verse,
    similarity_score FLOAT
)
""")
```

## 5. Vector Embeddings

Vector embeddings are a crucial component of the Quran Knowledge Graph, enabling semantic search and thematic discovery. We use BERT (bert-base-multilingual-cased) to generate 768-dimensional embeddings for:

1. **Verses**: Capturing the semantic meaning of complete verses
2. **Words**: Representing individual words in context
3. **Topics**: Aggregating verse embeddings to represent topic semantics

The embedding generation process:

```python
def generate_embedding(text):
    """Generate embedding for text using BERT"""
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Use CLS token embedding
    embedding = outputs.last_hidden_state[:, 0, :].numpy()
    return embedding.flatten()
```

## 6. Query Capabilities

The Quran Knowledge Graph enables powerful queries using OpenCypher:

### 6.1 Basic Queries

```cypher
// Get all chapters
MATCH (c:Chapter)
RETURN c.id, c.chapter_number, c.name_english, c.name_arabic, 
       c.revelation_place, c.verses_count
ORDER BY c.chapter_number
LIMIT 10

// Get verses from a specific chapter
MATCH (c:Chapter {id: $chapter_id})-[:CONTAINS]->(v:Verse)
RETURN v.id, v.verse_key, v.verse_number, v.text_uthmani
ORDER BY v.verse_number
LIMIT 20

// Get a specific verse by key
MATCH (v:Verse {verse_key: $verse_key})
RETURN v.id, v.verse_key, v.text_uthmani, v.text_indopak
```

### 6.2 Linguistic Queries

```cypher
// Find all words with a specific root
MATCH (r:Root {text_clean: $root_text})<-[:HAS_ROOT]-(w:Word)
RETURN w.text_uthmani, w.verse_key
ORDER BY w.verse_key
LIMIT 50

// Find verses containing words with a specific root
MATCH (r:Root {text_clean: $root_text})<-[:HAS_ROOT]-(w:Word)<-[:CONTAINS_WORD]-(v:Verse)
RETURN DISTINCT v.verse_key, v.text_uthmani
ORDER BY v.verse_key
LIMIT 20
```

### 6.3 Thematic Queries

```cypher
// Find verses about a specific topic
MATCH (t:Topic {name: $topic_name})<-[:ADDRESSES_TOPIC]-(v:Verse)
RETURN v.verse_key, v.text_uthmani
LIMIT 20

// Find topics addressed in a specific verse
MATCH (v:Verse {verse_key: $verse_key})-[:ADDRESSES_TOPIC]->(t:Topic)
RETURN t.name, t.arabic_name
ORDER BY t.name
```

### 6.4 Semantic Search

```cypher
// Find verses semantically similar to a query
MATCH (v:Verse)
WHERE vector_similarity(v.embedding, $query_embedding) > $threshold
RETURN v.verse_key, v.text_uthmani, vector_similarity(v.embedding, $query_embedding) AS similarity
ORDER BY similarity DESC
LIMIT 10

// Find verses similar to a specific verse
MATCH (v:Verse)
WHERE v.verse_key <> $verse_key AND vector_similarity(v.embedding, $verse_embedding) > $threshold
RETURN v.verse_key, v.text_uthmani, vector_similarity(v.embedding, $verse_embedding) AS similarity
ORDER BY similarity DESC
LIMIT 10
```

### 6.5 Complex Relationship Queries

```cypher
// Find thematic connections between verses
MATCH path = (v1:Verse {verse_key: $start_key})-[:ADDRESSES_TOPIC]->(t:Topic)<-[:ADDRESSES_TOPIC]-(v2:Verse {verse_key: $end_key})
RETURN v1.verse_key AS start_verse, t.name AS topic, v2.verse_key AS end_verse

// Find topic hierarchy
MATCH path = (t1:Topic {name: $topic_name})<-[:SUBTOPIC_OF*1..$max_depth]-(t2:Topic)
RETURN t1.name AS parent, t2.name AS child, length(path) AS depth
ORDER BY depth, child
```

## 7. Implementation Plan

### 7.1 Phase 1: Setup and Basic Structure

1. **Environment Setup**:
   - Install Kuzu and dependencies
   - Set up project structure

2. **Schema Definition**:
   - Define node and relationship tables
   - Create indices for efficient queries

3. **Data Import - Core Structure**:
   - Import chapters and verses
   - Create CONTAINS relationships

### 7.2 Phase 2: Linguistic Features

1. **Word Import**:
   - Import words and their properties
   - Create CONTAINS_WORD relationships

2. **Morphological Data**:
   - Import roots, lemmas, and stems
   - Create HAS_ROOT, HAS_LEMMA, and HAS_STEM relationships

### 7.3 Phase 3: Thematic Elements

1. **Topic Import**:
   - Import topics and their hierarchy
   - Create SUBTOPIC_OF relationships

2. **Verse-Topic Relationships**:
   - Import verse-topic mappings
   - Create ADDRESSES_TOPIC relationships

### 7.4 Phase 4: Vector Embeddings

1. **Embedding Generation**:
   - Generate embeddings for verses
   - Generate embeddings for words
   - Generate embeddings for topics

2. **Vector Index Creation**:
   - Create vector indices for efficient similarity search

### 7.5 Phase 5: Advanced Features

1. **Similar Verses**:
   - Calculate verse similarity based on embeddings
   - Create SIMILAR_TO relationships

2. **Translations and Tafsirs**:
   - Import translations in multiple languages
   - Import tafsirs from different scholars
   - Create HAS_TRANSLATION and HAS_TAFSIR relationships

### 7.6 Phase 6: Query Interface

1. **Python API**:
   - Develop query utility functions
   - Create semantic search capabilities

2. **Demo Application**:
   - Create a demonstration script
   - Showcase various query capabilities

## 8. Data Sources

The primary data source for the Quran Knowledge Graph is qul.tarteel.ai, which provides:

1. **Quran Text**:
   - Multiple scripts (Uthmani, Indo-Pak)
   - Chapter and verse metadata

2. **Linguistic Data**:
   - Word-by-word analysis
   - Roots, lemmas, and stems
   - Morphological features

3. **Thematic Data**:
   - Topic classifications
   - Ontological relationships

4. **Interpretive Content**:
   - Translations in multiple languages
   - Tafsirs from various scholars

## 9. Future Extensions

1. **Enhanced Embeddings**:
   - Fine-tune Arabic-specific models on Quranic text
   - Develop specialized embeddings for different aspects (linguistic, thematic)

2. **Advanced Thematic Discovery**:
   - Implement unsupervised theme detection
   - Develop algorithms for discovering implicit thematic connections

3. **User Contributions**:
   - Allow users to add annotations and relationships
   - Implement a validation system for user contributions

4. **Multimodal Integration**:
   - Link to audio recitations
   - Connect to visual representations

5. **Cross-Reference with Other Texts**:
   - Link to Hadith literature
   - Connect to other Islamic scholarly works

## 10. Conclusion

The Quran Knowledge Graph using Kuzu provides a powerful framework for exploring the rich, interconnected nature of the Quranic text. By representing the Quran as a network of entities and relationships, enhanced with vector embeddings for semantic understanding, we enable deeper exploration, analysis, and understanding of its content, structure, and meaning.

This graph-based approach is particularly well-suited for representing the complex relationships within the Quran, allowing users to navigate between verses, topics, linguistic features, and interpretations in an intuitive and meaningful way.
