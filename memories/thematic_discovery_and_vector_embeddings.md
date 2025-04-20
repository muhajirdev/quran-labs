# Thematic Discovery and Vector Embeddings in the Quran Knowledge Graph

## 1. Introduction to Vector Embeddings

Vector embeddings are numerical representations of text that capture semantic meaning in a high-dimensional space. In the Quran Knowledge Graph, we use vector embeddings to enable:

1. **Semantic Search**: Finding verses based on meaning rather than keywords
2. **Thematic Discovery**: Identifying related verses and topics
3. **Similarity Analysis**: Measuring semantic relationships between verses

## 2. Embedding Models for Quranic Text

### 2.1 Base Model Selection

For the Quran Knowledge Graph, we use the following embedding models:

1. **BERT Multilingual**: `bert-base-multilingual-cased`
   - Advantages: Supports both Arabic and English
   - Dimensions: 768
   - Context window: 512 tokens

2. **Arabic-Specific Models** (alternatives):
   - AraBERT: Specialized for Modern Standard Arabic
   - CAMeLBERT: Trained on Classical Arabic
   - MARBERT: Dialectal Arabic model

### 2.2 Fine-tuning Considerations

To improve embedding quality for Quranic text:

1. **Domain Adaptation**: Fine-tune on Quranic Arabic corpus
2. **Task-Specific Tuning**: Optimize for verse similarity tasks
3. **Contrastive Learning**: Train with similar verse pairs

### 2.3 Embedding Generation Process

```python
def generate_embedding(text):
    """Generate embedding for text using BERT"""
    # Tokenize text
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    
    # Generate embeddings
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Use CLS token embedding as sentence representation
    embedding = outputs.last_hidden_state[:, 0, :].numpy()
    return embedding.flatten()
```

## 3. Entity Embeddings in the Knowledge Graph

### 3.1 Verse Embeddings

Verse embeddings capture the semantic meaning of complete verses:

```python
# Generate embedding for verse
verse_embedding = generate_embedding(verse_text)

# Store in database
conn.execute(
    "MATCH (v:Verse {verse_key: $verse_key}) SET v.embedding = $embedding",
    {"verse_key": verse_key, "embedding": verse_embedding}
)
```

### 3.2 Word Embeddings

Word embeddings represent individual words in context:

```python
# Generate embedding for word in context
word_embedding = generate_embedding(word_text)

# Store in database
conn.execute(
    "MATCH (w:Word {id: $word_id}) SET w.embedding = $embedding",
    {"word_id": word_id, "embedding": word_embedding}
)
```

### 3.3 Topic Embeddings

Topic embeddings aggregate verse embeddings to represent thematic concepts:

```python
# Calculate topic embedding as average of verse embeddings
conn.execute("""
MATCH (t:Topic {id: $topic_id})<-[:ADDRESSES_TOPIC]-(v:Verse)
WITH t, collect(v.embedding) AS verse_embeddings
SET t.embedding = reduce(s = verse_embeddings[0], e IN verse_embeddings[1..] | [i IN range(0, size(s)-1) | s[i] + e[i]]) / size(verse_embeddings)
""", {"topic_id": topic_id})
```

## 4. Semantic Search Implementation

### 4.1 Vector Similarity Functions

Kuzu supports vector similarity functions for embedding comparison:

```python
# Cosine similarity search
result = conn.execute("""
MATCH (v:Verse)
WHERE vector_similarity(v.embedding, $query_embedding) > $threshold
RETURN v.verse_key, v.text_uthmani, vector_similarity(v.embedding, $query_embedding) AS similarity
ORDER BY similarity DESC
LIMIT $limit
""", {
    "query_embedding": query_embedding,
    "threshold": 0.7,
    "limit": 10
})
```

### 4.2 Hybrid Search

Combining keyword and semantic search:

```python
# Hybrid search with both keyword and semantic components
result = conn.execute("""
MATCH (v:Verse)
WHERE v.text_uthmani CONTAINS $keyword OR vector_similarity(v.embedding, $query_embedding) > $threshold
RETURN v.verse_key, v.text_uthmani, 
       CASE WHEN v.text_uthmani CONTAINS $keyword THEN 1 ELSE 0 END AS keyword_match,
       vector_similarity(v.embedding, $query_embedding) AS semantic_similarity,
       (CASE WHEN v.text_uthmani CONTAINS $keyword THEN 1 ELSE 0 END) * 0.3 + 
       vector_similarity(v.embedding, $query_embedding) * 0.7 AS combined_score
ORDER BY combined_score DESC
LIMIT $limit
""", {
    "keyword": keyword,
    "query_embedding": query_embedding,
    "threshold": 0.5,
    "limit": 20
})
```

### 4.3 Contextual Search

Search considering thematic context:

```python
# Search within a specific thematic context
result = conn.execute("""
MATCH (t:Topic {name: $topic_name})<-[:ADDRESSES_TOPIC]-(v:Verse)
WHERE vector_similarity(v.embedding, $query_embedding) > $threshold
RETURN v.verse_key, v.text_uthmani, vector_similarity(v.embedding, $query_embedding) AS similarity
ORDER BY similarity DESC
LIMIT $limit
""", {
    "topic_name": topic_name,
    "query_embedding": query_embedding,
    "threshold": 0.6,
    "limit": 10
})
```

## 5. Thematic Discovery Techniques

### 5.1 Leveraging Existing Topic Structure

The Quran Knowledge Graph leverages the existing topic structure from qul.tarteel.ai:

```python
# Import topics
topics_df = pd.read_sql("SELECT * FROM quran.topics", sqlite_conn)
for _, row in topics_df.iterrows():
    conn.execute(
        "INSERT INTO Topic (id, name, arabic_name, parent_id, ontology, thematic, depth) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        {"1": row['id'], "2": row['name'], "3": row.get('arabic_name', ''), 
         "4": row.get('parent_id', 0), "5": row.get('ontology', False),
         "6": row.get('thematic', False), "7": row.get('depth', 0)}
    )

# Import verse-topic relationships
verse_topics_df = pd.read_sql("SELECT * FROM quran.verse_topics", sqlite_conn)
for _, row in verse_topics_df.iterrows():
    conn.execute(
        "INSERT INTO ADDRESSES_TOPIC (FROM, TO, ontology, thematic) VALUES ($1, $2, $3, $4)",
        {"1": row['verse_id'], "2": row['topic_id'], 
         "3": row.get('ontology', False), "4": row.get('thematic', False)}
    )
```

### 5.2 Topic Hierarchy Exploration

Exploring the hierarchical structure of topics:

```python
# Get topic hierarchy
result = conn.execute("""
MATCH path = (t1:Topic {name: $topic_name})<-[:SUBTOPIC_OF*1..$max_depth]-(t2:Topic)
RETURN t1.name AS parent, t2.name AS child, length(path) AS depth
ORDER BY depth, child
""", {"topic_name": topic_name, "max_depth": 3})
```

### 5.3 Topic Similarity Analysis

Finding similar topics based on verse overlap and embedding similarity:

```python
# Find similar topics based on embedding similarity
result = conn.execute("""
MATCH (t1:Topic {name: $topic_name})
MATCH (t2:Topic) WHERE t1 <> t2
RETURN t2.name, t2.arabic_name, vector_similarity(t1.embedding, t2.embedding) AS similarity
ORDER BY similarity DESC
LIMIT 10
""", {"topic_name": topic_name})

# Find similar topics based on verse overlap
result = conn.execute("""
MATCH (t1:Topic {name: $topic_name})<-[:ADDRESSES_TOPIC]-(v:Verse)-[:ADDRESSES_TOPIC]->(t2:Topic)
WHERE t1 <> t2
WITH t2, count(v) AS shared_verses
RETURN t2.name, t2.arabic_name, shared_verses
ORDER BY shared_verses DESC
LIMIT 10
""", {"topic_name": topic_name})
```

## 6. Advanced Thematic Discovery

### 6.1 Unsupervised Theme Detection

Using clustering to discover latent themes:

```python
from sklearn.cluster import DBSCAN
import numpy as np

# Get verse embeddings
result = conn.execute("MATCH (v:Verse) RETURN v.verse_key, v.embedding")
verse_keys = []
embeddings = []
for row in result.fetchall():
    verse_keys.append(row[0])
    embeddings.append(row[1])

# Convert to numpy array
X = np.array(embeddings)

# Perform clustering
clustering = DBSCAN(eps=0.3, min_samples=5, metric='cosine').fit(X)

# Create new topics based on clusters
for cluster_id in set(clustering.labels_):
    if cluster_id == -1:  # Skip noise points
        continue
        
    # Get verses in this cluster
    cluster_verses = [verse_keys[i] for i in range(len(verse_keys)) if clustering.labels_[i] == cluster_id]
    
    # Create new topic
    topic_id = f"discovered_cluster_{cluster_id}"
    topic_name = f"Discovered Theme {cluster_id}"
    
    conn.execute(
        "CREATE (t:Topic {id: $id, name: $name, discovered: true})",
        {"id": topic_id, "name": topic_name}
    )
    
    # Connect verses to new topic
    for verse_key in cluster_verses:
        conn.execute("""
        MATCH (v:Verse {verse_key: $verse_key}), (t:Topic {id: $topic_id})
        CREATE (v)-[:ADDRESSES_TOPIC {discovered: true}]->(t)
        """, {"verse_key": verse_key, "topic_id": topic_id})
```

### 6.2 Topic Refinement

Validating and refining existing topic assignments:

```python
# Identify verses that might be incorrectly categorized
result = conn.execute("""
MATCH (v:Verse)-[:ADDRESSES_TOPIC]->(t1:Topic)
MATCH (t2:Topic)
WHERE t1 <> t2 AND vector_similarity(v.embedding, t2.embedding) > vector_similarity(v.embedding, t1.embedding) + 0.2
RETURN v.verse_key, t1.name AS current_topic, t2.name AS suggested_topic,
       vector_similarity(v.embedding, t1.embedding) AS current_similarity,
       vector_similarity(v.embedding, t2.embedding) AS suggested_similarity
ORDER BY (suggested_similarity - current_similarity) DESC
LIMIT 20
""")
```

### 6.3 Topic Gap Analysis

Identifying potential new topics:

```python
# Find verses not strongly associated with any existing topic
result = conn.execute("""
MATCH (v:Verse)
OPTIONAL MATCH (v)-[:ADDRESSES_TOPIC]->(t:Topic)
WITH v, collect(t) AS topics
WHERE size(topics) = 0 OR max([t IN topics | vector_similarity(v.embedding, t.embedding)]) < 0.5
RETURN v.verse_key, v.text_uthmani
LIMIT 50
""")
```

## 7. Thematic Relationship Discovery

### 7.1 Verse-to-Verse Relationships

Discovering semantic relationships between verses:

```python
# Create SIMILAR_TO relationships between semantically similar verses
conn.execute("""
MATCH (v1:Verse)
MATCH (v2:Verse)
WHERE v1.id < v2.id AND vector_similarity(v1.embedding, v2.embedding) > 0.8
CREATE (v1)-[:SIMILAR_TO {similarity_score: vector_similarity(v1.embedding, v2.embedding)}]->(v2)
""")
```

### 7.2 Thematic Paths

Finding thematic connections between verses:

```python
# Find thematic paths between verses
result = conn.execute("""
MATCH path = shortestPath((v1:Verse {verse_key: $start_key})-[:ADDRESSES_TOPIC|SIMILAR_TO*1..5]-(v2:Verse {verse_key: $end_key}))
UNWIND relationships(path) AS r
RETURN 
    CASE type(r)
        WHEN 'ADDRESSES_TOPIC' THEN endNode(r).name
        WHEN 'SIMILAR_TO' THEN 'Similar Verse: ' + endNode(r).verse_key
    END AS connection,
    type(r) AS relationship_type
""", {"start_key": start_verse_key, "end_key": end_verse_key})
```

### 7.3 Thematic Evolution Analysis

Analyzing how themes evolve through the chronological order of revelation:

```python
# Analyze theme distribution by revelation period
result = conn.execute("""
MATCH (c:Chapter)-[:CONTAINS]->(v:Verse)-[:ADDRESSES_TOPIC]->(t:Topic {name: $topic_name})
RETURN c.revelation_place, COUNT(v) as verse_count
ORDER BY verse_count DESC
""", {"topic_name": topic_name})

# Analyze theme evolution over time
result = conn.execute("""
MATCH (c:Chapter)-[:CONTAINS]->(v:Verse)-[:ADDRESSES_TOPIC]->(t:Topic {name: $topic_name})
RETURN c.revelation_order, c.name_english, COUNT(v) as verse_count
ORDER BY c.revelation_order
""", {"topic_name": topic_name})
```

## 8. Visualization of Thematic Relationships

### 8.1 Topic Network Visualization

```python
import networkx as nx
import matplotlib.pyplot as plt

# Get topic relationships
result = conn.execute("""
MATCH (t1:Topic)-[:SUBTOPIC_OF]->(t2:Topic)
RETURN t1.name, t2.name
""")

# Create graph
G = nx.DiGraph()
for row in result.fetchall():
    G.add_edge(row[1], row[0])  # parent -> child

# Visualize
plt.figure(figsize=(15, 10))
pos = nx.spring_layout(G)
nx.draw_networkx(G, pos, with_labels=True, node_color='lightblue', node_size=500, font_size=8)
plt.axis('off')
plt.title('Topic Hierarchy Network')
plt.show()
```

### 8.2 Verse Similarity Map

```python
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt
import numpy as np

# Get verse embeddings
result = conn.execute("""
MATCH (v:Verse)
WHERE v.verse_key STARTS WITH $chapter
RETURN v.verse_key, v.embedding
""", {"chapter": "1"})

verse_keys = []
embeddings = []
for row in result.fetchall():
    verse_keys.append(row[0])
    embeddings.append(row[1])

# Convert to numpy array
X = np.array(embeddings)

# Apply t-SNE for dimensionality reduction
tsne = TSNE(n_components=2, perplexity=5, random_state=42)
X_tsne = tsne.fit_transform(X)

# Plot
plt.figure(figsize=(10, 8))
plt.scatter(X_tsne[:, 0], X_tsne[:, 1], alpha=0.7)
for i, verse_key in enumerate(verse_keys):
    plt.annotate(verse_key, (X_tsne[i, 0], X_tsne[i, 1]))
plt.title('Verse Similarity Map (t-SNE)')
plt.show()
```

### 8.3 Thematic Heatmap

```python
import seaborn as sns
import pandas as pd
import matplotlib.pyplot as plt

# Get topic distribution across chapters
result = conn.execute("""
MATCH (c:Chapter)-[:CONTAINS]->(v:Verse)-[:ADDRESSES_TOPIC]->(t:Topic)
WHERE c.chapter_number <= 10
RETURN c.chapter_number, t.name, COUNT(v) AS verse_count
ORDER BY c.chapter_number, verse_count DESC
""")

# Create matrix
df = pd.DataFrame([(row[0], row[1], row[2]) for row in result.fetchall()], 
                  columns=['chapter', 'topic', 'count'])
pivot_df = df.pivot_table(index='topic', columns='chapter', values='count', fill_value=0)

# Plot heatmap
plt.figure(figsize=(12, 10))
sns.heatmap(pivot_df, cmap='YlGnBu', annot=False)
plt.title('Topic Distribution Across Chapters')
plt.show()
```

## 9. Practical Applications of Thematic Discovery

### 9.1 Thematic Study Guide

Creating a thematic study guide for the Quran:

```python
# Generate thematic study guide
result = conn.execute("""
MATCH (t:Topic)
WHERE NOT EXISTS((t)-[:SUBTOPIC_OF]->())  // Top-level topics
OPTIONAL MATCH (t)<-[:SUBTOPIC_OF*1..3]-(st:Topic)  // Subtopics up to 3 levels
WITH t, collect(st) AS subtopics
OPTIONAL MATCH (t)<-[:ADDRESSES_TOPIC]-(v:Verse)
WITH t, subtopics, collect(v.verse_key) AS verses
RETURN t.name AS main_topic, 
       [s IN subtopics | s.name] AS related_topics,
       verses[..10] AS key_verses,
       size(verses) AS total_verses
ORDER BY total_verses DESC
LIMIT 20
""")
```

### 9.2 Contextual Understanding

Providing context for a specific verse:

```python
# Get thematic context for a verse
result = conn.execute("""
MATCH (v:Verse {verse_key: $verse_key})-[:ADDRESSES_TOPIC]->(t:Topic)
OPTIONAL MATCH (t)<-[:ADDRESSES_TOPIC]-(v2:Verse)
WHERE v <> v2
WITH t, collect(v2.verse_key)[..5] AS related_verses
RETURN t.name AS topic, related_verses, size(related_verses) AS verse_count
ORDER BY verse_count DESC
""", {"verse_key": verse_key})
```

### 9.3 Comparative Analysis

Comparing thematic treatment across different parts of the Quran:

```python
# Compare theme treatment in Meccan vs Medinan surahs
result = conn.execute("""
MATCH (c:Chapter)-[:CONTAINS]->(v:Verse)-[:ADDRESSES_TOPIC]->(t:Topic {name: $topic_name})
WITH c.revelation_place AS place, collect(v.verse_key) AS verses
RETURN place, size(verses) AS verse_count, 
       verses[..5] AS sample_verses
ORDER BY place
""", {"topic_name": topic_name})
```

## 10. Future Directions for Thematic Discovery

### 10.1 Fine-tuned Embedding Models

Developing specialized embedding models for Quranic text:

1. **Quranic Arabic BERT**: Fine-tune on Quranic Arabic corpus
2. **Thematic Embeddings**: Train with thematic supervision
3. **Multi-task Learning**: Optimize for multiple Quranic analysis tasks

### 10.2 Advanced Clustering Techniques

Implementing more sophisticated clustering for theme discovery:

1. **Hierarchical Clustering**: Discover nested thematic structures
2. **Topic Modeling**: Apply LDA or BERTopic for theme extraction
3. **Dynamic Clustering**: Track theme evolution across revelation order

### 10.3 Interactive Thematic Exploration

Developing interactive tools for thematic exploration:

1. **Thematic Navigator**: Interactive visualization of thematic connections
2. **Semantic Search Interface**: Natural language query interface
3. **Personalized Thematic Paths**: Custom thematic exploration based on user interests

## 11. Conclusion

Vector embeddings and thematic discovery are central to the Quran Knowledge Graph, enabling powerful semantic search and thematic analysis capabilities. By combining existing topic structures with advanced embedding techniques, we can create a rich, nuanced representation of the thematic landscape of the Quran.

The approaches outlined in this document provide a foundation for implementing these capabilities in the Quran Knowledge Graph, with potential for further refinement and extension as the project evolves.
