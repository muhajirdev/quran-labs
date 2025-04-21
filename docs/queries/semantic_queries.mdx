# Semantic Queries

This document provides query examples leveraging vector embeddings for semantic search and analysis in the Quran Knowledge Graph.

## 1. Basic Semantic Search

### Description
Performs a semantic search to find verses that are conceptually similar to a query, even if they don't share the same keywords.

### Query
```cypher
MATCH (v:Verse)
WHERE vector_similarity(v.embedding, $query_embedding) > $threshold
RETURN v.verse_key, v.text_uthmani, vector_similarity(v.embedding, $query_embedding) AS similarity
ORDER BY similarity DESC
LIMIT $limit
```

### Parameters
- `query_embedding`: Vector embedding of the search query (generated from text)
- `threshold`: Minimum similarity threshold (e.g., 0.7)
- `limit`: Maximum number of results to return (e.g., 10)

### Expected Results
A table of verses semantically similar to the query:
| verse_key | text_uthmani | similarity |
|-----------|--------------|------------|
| 2:186 | وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ... | 0.89 |
| 50:16 | وَلَقَدْ خَلَقْنَا الْإِنسَانَ وَنَعْلَمُ مَا تُوَسْوِسُ بِهِ نَفْسُهُ... | 0.85 |
| ... | ... | ... |

### Variations
- Include chapter information: `MATCH (c:Chapter)-[:CONTAINS]->(v) RETURN c.name_english, v.verse_key, v.text_uthmani, similarity`
- Filter by chapter: `MATCH (c:Chapter {revelation_place: $place})-[:CONTAINS]->(v)`
- Include translations: `OPTIONAL MATCH (v)-[:HAS_TRANSLATION]->(t:Translation {language_name: "English"}) RETURN v.verse_key, v.text_uthmani, t.text, similarity`

---

## 2. Find Similar Verses

### Description
Identifies verses that are semantically similar to a specific verse, revealing conceptual connections across the Quran.

### Query
```cypher
MATCH (v1:Verse {verse_key: $verse_key})
MATCH (v2:Verse)
WHERE v1 <> v2 AND vector_similarity(v1.embedding, v2.embedding) > $threshold
RETURN v2.verse_key, v2.text_uthmani, vector_similarity(v1.embedding, v2.embedding) AS similarity
ORDER BY similarity DESC
LIMIT $limit
```

### Parameters
- `verse_key`: Verse key to find similar verses for (e.g., "2:255")
- `threshold`: Minimum similarity threshold (e.g., 0.75)
- `limit`: Maximum number of similar verses to return (e.g., 10)

### Expected Results
A table of verses similar to the specified verse:
| verse_key | text_uthmani | similarity |
|-----------|--------------|------------|
| 59:23 | هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ... | 0.92 |
| 3:18 | شَهِدَ اللَّهُ أَنَّهُ لَا إِلَٰهَ إِلَّا هُوَ... | 0.88 |
| ... | ... | ... |

### Variations
- Group by chapter: `WITH v2.verse_key, v2.text_uthmani, similarity, split(v2.verse_key, ":")[0] AS chapter_num ORDER BY similarity DESC RETURN chapter_num, collect({verse_key: v2.verse_key, text: v2.text_uthmani, similarity: similarity})[..3] AS top_verses`
- Find verses with similar topics: `MATCH (v1)-[:ADDRESSES_TOPIC]->(t:Topic) WITH v1, collect(t.id) AS v1_topics MATCH (v2:Verse) WHERE v1 <> v2 WITH v1, v2, v1_topics, vector_similarity(v1.embedding, v2.embedding) AS embedding_similarity MATCH (v2)-[:ADDRESSES_TOPIC]->(t2:Topic) WITH v1, v2, v1_topics, embedding_similarity, collect(t2.id) AS v2_topics RETURN v2.verse_key, embedding_similarity, size([x IN v1_topics WHERE x IN v2_topics]) * 1.0 / size(v1_topics + v2_topics - [x IN v1_topics WHERE x IN v2_topics]) AS topic_similarity ORDER BY (embedding_similarity + topic_similarity) / 2 DESC`
- Compare with explicit connections: `OPTIONAL MATCH path = (v1)-[:SIMILAR_TO]-(v2) RETURN v2.verse_key, similarity, CASE WHEN path IS NULL THEN "Implicit" ELSE "Explicit" END AS connection_type`

---

## 3. Topic-Based Semantic Search

### Description
Performs a semantic search within verses addressing a specific topic, combining thematic and semantic filtering.

### Query
```cypher
MATCH (t:Topic {name: $topic_name})<-[:ADDRESSES_TOPIC]-(v:Verse)
WHERE vector_similarity(v.embedding, $query_embedding) > $threshold
RETURN v.verse_key, v.text_uthmani, vector_similarity(v.embedding, $query_embedding) AS similarity
ORDER BY similarity DESC
LIMIT $limit
```

### Parameters
- `topic_name`: Name of the topic to search within (e.g., "Prayer")
- `query_embedding`: Vector embedding of the search query
- `threshold`: Minimum similarity threshold (e.g., 0.6)
- `limit`: Maximum number of results to return (e.g., 15)

### Expected Results
A table of verses about the specified topic that are semantically similar to the query:
| verse_key | text_uthmani | similarity |
|-----------|--------------|------------|
| 2:238 | حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ... | 0.88 |
| 20:14 | إِنَّنِي أَنَا اللَّهُ لَا إِلَٰهَ إِلَّا أَنَا فَاعْبُدْنِي وَأَقِمِ الصَّلَاةَ لِذِكْرِي | 0.82 |
| ... | ... | ... |

### Variations
- Search across multiple topics: `MATCH (t:Topic)<-[:ADDRESSES_TOPIC]-(v:Verse) WHERE t.name IN $topic_list`
- Include topic relevance: `MATCH (v)-[r:ADDRESSES_TOPIC]->(t) RETURN v.verse_key, v.text_uthmani, similarity, r.relevance AS topic_relevance, similarity * r.relevance AS combined_score ORDER BY combined_score DESC`
- Filter by subtopics: `MATCH (t)<-[:SUBTOPIC_OF*0..2]-(st:Topic)<-[:ADDRESSES_TOPIC]-(v:Verse)`

---

## 4. Hybrid Keyword and Semantic Search

### Description
Combines traditional keyword search with semantic search for more comprehensive results.

### Query
```cypher
MATCH (v:Verse)
WHERE v.text_uthmani CONTAINS $keyword OR vector_similarity(v.embedding, $query_embedding) > $threshold
WITH v, 
     CASE WHEN v.text_uthmani CONTAINS $keyword THEN 1 ELSE 0 END AS keyword_match,
     vector_similarity(v.embedding, $query_embedding) AS semantic_similarity
RETURN v.verse_key, v.text_uthmani, 
       keyword_match,
       semantic_similarity,
       keyword_match * $keyword_weight + semantic_similarity * $semantic_weight AS combined_score
ORDER BY combined_score DESC
LIMIT $limit
```

### Parameters
- `keyword`: Keyword to search for (e.g., "mercy")
- `query_embedding`: Vector embedding of the search query
- `threshold`: Minimum semantic similarity threshold (e.g., 0.5)
- `keyword_weight`: Weight for keyword matches (e.g., 0.3)
- `semantic_weight`: Weight for semantic similarity (e.g., 0.7)
- `limit`: Maximum number of results to return (e.g., 20)

### Expected Results
A table combining keyword and semantic search results:
| verse_key | text_uthmani | keyword_match | semantic_similarity | combined_score |
|-----------|--------------|---------------|---------------------|----------------|
| 7:156 | وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ... | 1 | 0.92 | 0.944 |
| 6:12 | كَتَبَ عَلَىٰ نَفْسِهِ الرَّحْمَةَ... | 1 | 0.85 | 0.895 |
| 39:53 | إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا... | 0 | 0.89 | 0.623 |
| ... | ... | ... | ... | ... |

### Variations
- Adjust weights dynamically: `WITH v, keyword_match, semantic_similarity, CASE WHEN keyword_match = 1 THEN 0.6 ELSE 0.4 END AS semantic_weight RETURN v.verse_key, v.text_uthmani, keyword_match * (1 - semantic_weight) + semantic_similarity * semantic_weight AS score`
- Include morphological variants: `WHERE EXISTS((v)-[:CONTAINS_WORD]->(:Word)-[:HAS_ROOT]->(:Root {text_clean: $root_text})) OR vector_similarity(v.embedding, $query_embedding) > $threshold`
- Boost by topic relevance: `OPTIONAL MATCH (v)-[:ADDRESSES_TOPIC]->(t:Topic {name: $related_topic}) WITH v, keyword_match, semantic_similarity, CASE WHEN t IS NOT NULL THEN 0.2 ELSE 0 END AS topic_boost RETURN v.verse_key, v.text_uthmani, keyword_match * 0.3 + semantic_similarity * 0.5 + topic_boost AS score`

---

## 5. Semantic Clustering of Verses

### Description
Groups verses into semantic clusters based on their embedding similarity, revealing thematic patterns.

### Query
```cypher
MATCH (v:Verse)
WHERE v.verse_key STARTS WITH $chapter_prefix
WITH collect({key: v.verse_key, embedding: v.embedding}) AS verses
UNWIND range(0, size(verses)-2) AS i
UNWIND range(i+1, size(verses)-1) AS j
WITH verses[i].key AS verse1, verses[j].key AS verse2, 
     vector_similarity(verses[i].embedding, verses[j].embedding) AS similarity
WHERE similarity > $threshold
RETURN verse1, verse2, similarity
ORDER BY similarity DESC
LIMIT $limit
```

### Parameters
- `chapter_prefix`: Chapter prefix to filter verses (e.g., "55:" for Surah Ar-Rahman)
- `threshold`: Minimum similarity threshold for clustering (e.g., 0.8)
- `limit`: Maximum number of verse pairs to return (e.g., 100)

### Expected Results
A table of verse pairs with high semantic similarity:
| verse1 | verse2 | similarity |
|--------|--------|------------|
| 55:46 | 55:62 | 0.95 |
| 55:13 | 55:16 | 0.93 |
| ... | ... | ... |

### Variations
- Create explicit clusters: This query provides pairs, but in application code you would use these pairs to build clusters using algorithms like connected components or community detection
- Compare across chapters: `WHERE v.verse_key STARTS WITH $chapter1 OR v.verse_key STARTS WITH $chapter2`
- Include topic information: `MATCH (v)-[:ADDRESSES_TOPIC]->(t:Topic) WITH v, collect(t.name) AS topics WITH collect({key: v.verse_key, embedding: v.embedding, topics: topics}) AS verses`

---

## 6. Semantic Topic Mapping

### Description
Maps verses to topics based on semantic similarity rather than explicit annotations, discovering potential new thematic connections.

### Query
```cypher
MATCH (v:Verse {verse_key: $verse_key})
MATCH (t:Topic)
WHERE NOT EXISTS((v)-[:ADDRESSES_TOPIC]->(t))
WITH v, t, vector_similarity(v.embedding, t.embedding) AS similarity
WHERE similarity > $threshold
RETURN t.name, t.arabic_name, similarity
ORDER BY similarity DESC
LIMIT $limit
```

### Parameters
- `verse_key`: Verse key to find potential topic connections for (e.g., "2:255")
- `threshold`: Minimum similarity threshold (e.g., 0.7)
- `limit`: Maximum number of potential topics to return (e.g., 10)

### Expected Results
A table of topics semantically related to the verse but not explicitly connected:
| name | arabic_name | similarity |
|------|-------------|------------|
| Divine Power | قدرة الله | 0.88 |
| Sovereignty | الملك | 0.85 |
| Knowledge | العلم | 0.82 |
| ... | ... | ... |

### Variations
- Compare with existing topics: `OPTIONAL MATCH (v)-[:ADDRESSES_TOPIC]->(existing:Topic) WITH v, collect(existing.name) AS existing_topics MATCH (t:Topic) WHERE NOT t.name IN existing_topics`
- Find verses for potential topic assignment: `MATCH (t:Topic {name: $topic_name}) MATCH (v:Verse) WHERE NOT EXISTS((v)-[:ADDRESSES_TOPIC]->(t)) WITH v, t, vector_similarity(v.embedding, t.embedding) AS similarity WHERE similarity > $threshold RETURN v.verse_key, v.text_uthmani, similarity ORDER BY similarity DESC`
- Validate existing connections: `MATCH (v:Verse)-[r:ADDRESSES_TOPIC]->(t:Topic) WITH v, t, r, vector_similarity(v.embedding, t.embedding) AS similarity RETURN v.verse_key, t.name, r.relevance, similarity, similarity - r.relevance AS discrepancy ORDER BY abs(discrepancy) DESC`

---

## 7. Cross-Language Semantic Search

### Description
Performs semantic search across translations in different languages, finding conceptually similar content regardless of language.

### Query
```cypher
MATCH (v:Verse)-[:HAS_TRANSLATION]->(t:Translation {language_name: $language})
WHERE vector_similarity(t.embedding, $query_embedding) > $threshold
RETURN v.verse_key, v.text_uthmani, t.text AS translation, 
       vector_similarity(t.embedding, $query_embedding) AS similarity
ORDER BY similarity DESC
LIMIT $limit
```

### Parameters
- `language`: Target language for search (e.g., "English")
- `query_embedding`: Vector embedding of the search query (in any language)
- `threshold`: Minimum similarity threshold (e.g., 0.65)
- `limit`: Maximum number of results to return (e.g., 15)

### Expected Results
A table of verses with translations semantically similar to the query:
| verse_key | text_uthmani | translation | similarity |
|-----------|--------------|-------------|------------|
| 2:186 | وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ... | And when My servants ask you concerning Me - indeed I am near... | 0.89 |
| ... | ... | ... | ... |

### Variations
- Search across multiple languages: `WHERE t.language_name IN $languages`
- Compare similarity across languages: `MATCH (v:Verse)-[:HAS_TRANSLATION]->(t1:Translation {language_name: $language1}) MATCH (v)-[:HAS_TRANSLATION]->(t2:Translation {language_name: $language2}) RETURN v.verse_key, vector_similarity(t1.embedding, $query_embedding) AS similarity1, vector_similarity(t2.embedding, $query_embedding) AS similarity2`
- Find translation discrepancies: `MATCH (v:Verse)-[:HAS_TRANSLATION]->(t1:Translation {language_name: $language1}) MATCH (v)-[:HAS_TRANSLATION]->(t2:Translation {language_name: $language2}) WITH v, t1, t2, vector_similarity(t1.embedding, t2.embedding) AS translation_similarity RETURN v.verse_key, t1.text, t2.text, translation_similarity ORDER BY translation_similarity`

---

## 8. Contextual Verse Recommendation

### Description
Recommends verses based on a combination of thematic and semantic similarity to a user's interests or reading history.

### Query
```cypher
// Find verses similar to user's interests
MATCH (v:Verse)
WHERE vector_similarity(v.embedding, $interest_embedding) > $similarity_threshold

// Boost verses from topics of interest
OPTIONAL MATCH (v)-[:ADDRESSES_TOPIC]->(t:Topic)
WHERE t.name IN $topic_interests

// Calculate combined score
WITH v, vector_similarity(v.embedding, $interest_embedding) AS semantic_score,
     CASE WHEN t IS NOT NULL THEN 1 ELSE 0 END AS topic_match
     
// Exclude already read verses
WHERE NOT v.verse_key IN $read_verses

RETURN v.verse_key, v.text_uthmani,
       semantic_score * $semantic_weight + topic_match * $topic_weight AS relevance_score
ORDER BY relevance_score DESC
LIMIT $limit
```

### Parameters
- `interest_embedding`: Vector embedding representing user's interests
- `similarity_threshold`: Minimum semantic similarity threshold (e.g., 0.6)
- `topic_interests`: List of topics the user is interested in (e.g., ["Mercy", "Faith", "Ethics"])
- `read_verses`: List of verse keys the user has already read
- `semantic_weight`: Weight for semantic similarity (e.g., 0.7)
- `topic_weight`: Weight for topic matches (e.g., 0.3)
- `limit`: Maximum number of recommendations to return (e.g., 10)

### Expected Results
A table of recommended verses based on user interests:
| verse_key | text_uthmani | relevance_score |
|-----------|--------------|-----------------|
| 39:53 | قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ... | 0.93 |
| 3:159 | فَبِمَا رَحْمَةٍ مِّنَ اللَّهِ لِنتَ لَهُمْ... | 0.88 |
| ... | ... | ... |

### Variations
- Include reading difficulty: `WITH v, semantic_score, topic_match, CASE WHEN v.complexity_score <= $max_complexity THEN 1 ELSE 0.5 END AS complexity_factor RETURN v.verse_key, v.text_uthmani, (semantic_score * $semantic_weight + topic_match * $topic_weight) * complexity_factor AS relevance_score`
- Diversify recommendations: `WITH v, semantic_score, topic_match, split(v.verse_key, ":")[0] AS chapter ORDER BY relevance_score DESC WITH chapter, collect({verse_key: v.verse_key, text: v.text_uthmani, score: semantic_score * $semantic_weight + topic_match * $topic_weight})[0] AS top_verse RETURN top_verse.verse_key, top_verse.text, top_verse.score ORDER BY top_verse.score DESC`
- Include contextual verses: `WITH v AS central_verse, semantic_score * $semantic_weight + topic_match * $topic_weight AS relevance_score ORDER BY relevance_score DESC LIMIT 5 MATCH (c:Chapter)-[:CONTAINS]->(central_verse) MATCH (c)-[:CONTAINS]->(context_verse) WHERE abs(context_verse.verse_number - central_verse.verse_number) <= 2 RETURN central_verse.verse_key, collect(context_verse.verse_key) AS context`
