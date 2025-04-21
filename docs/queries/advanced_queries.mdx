# Advanced Analytical Queries

This document provides complex query examples for sophisticated analysis using the Quran Knowledge Graph.

## 1. Multi-dimensional Thematic Analysis

### Description
Performs a multi-dimensional analysis of how different themes intersect across the Quran, revealing complex thematic relationships.

### Query
```cypher
// Find verses that address multiple themes
MATCH (v:Verse)
MATCH (v)-[:ADDRESSES_TOPIC]->(t:Topic)
WHERE t.name IN $theme_list
WITH v, collect(DISTINCT t.name) AS themes
WHERE size(themes) >= $min_themes

// Get chapter information
MATCH (c:Chapter)-[:CONTAINS]->(v)

// Return results with theme combinations
RETURN v.verse_key, v.text_uthmani, 
       c.name_english AS chapter_name,
       c.revelation_place AS revelation_place,
       themes
ORDER BY size(themes) DESC, v.verse_key
LIMIT $limit
```

### Parameters
- `theme_list`: List of themes to analyze (e.g., ["Mercy", "Justice", "Faith", "Accountability"])
- `min_themes`: Minimum number of themes that must be present (e.g., 2)
- `limit`: Maximum number of verses to return (e.g., 30)

### Expected Results
A table showing verses that address multiple themes:
| verse_key | text_uthmani | chapter_name | revelation_place | themes |
|-----------|--------------|--------------|------------------|--------|
| 4:136 | يَا أَيُّهَا الَّذِينَ آمَنُوا آمِنُوا بِاللَّهِ وَرَسُولِهِ... | The Women | Medinan | ["Faith", "Accountability", "Justice"] |
| 2:177 | لَّيْسَ الْبِرَّ أَن تُوَلُّوا وُجُوهَكُمْ قِبَلَ الْمَشْرِقِ وَالْمَغْرِبِ... | The Cow | Medinan | ["Faith", "Mercy", "Justice"] |
| ... | ... | ... | ... | ... |

### Variations
- Analyze theme co-occurrence: `WITH themes, count(v) AS verse_count RETURN themes, verse_count ORDER BY verse_count DESC`
- Compare across revelation periods: `WITH c.revelation_place AS place, themes, count(v) AS verse_count RETURN place, themes, verse_count ORDER BY place, verse_count DESC`
- Create theme correlation matrix: `UNWIND themes AS theme1 UNWIND themes AS theme2 WHERE theme1 < theme2 WITH theme1, theme2, count(v) AS co_occurrences RETURN theme1, theme2, co_occurrences ORDER BY co_occurrences DESC`

---

## 2. Chronological Theme Evolution Analysis

### Description
Analyzes how themes evolve throughout the chronological order of revelation, revealing the development of concepts over time.

### Query
```cypher
// Match verses addressing the topic
MATCH (t:Topic {name: $topic_name})<-[:ADDRESSES_TOPIC]-(v:Verse)<-[:CONTAINS]-(c:Chapter)
WHERE c.revelation_order IS NOT NULL

// Group by revelation period
WITH c.revelation_order AS rev_order,
     CASE 
       WHEN c.revelation_order <= 30 THEN "Early Meccan"
       WHEN c.revelation_order <= 85 THEN "Late Meccan"
       ELSE "Medinan"
     END AS period,
     c.name_english AS chapter,
     count(v) AS verse_count,
     collect(v.verse_key) AS verses

// Calculate cumulative metrics
WITH period, rev_order, chapter, verse_count, verses
ORDER BY rev_order
WITH period, collect({rev_order: rev_order, chapter: chapter, verse_count: verse_count, verses: verses}) AS chapters
UNWIND chapters AS chapter_data

// Return detailed evolution data
RETURN period,
       chapter_data.rev_order AS revelation_order,
       chapter_data.chapter AS chapter_name,
       chapter_data.verse_count AS verse_count,
       chapter_data.verses[0..3] AS sample_verses
ORDER BY revelation_order
```

### Parameters
- `topic_name`: Name of the topic to analyze (e.g., "Faith")

### Expected Results
A table showing the evolution of the topic throughout revelation:
| period | revelation_order | chapter_name | verse_count | sample_verses |
|--------|------------------|--------------|-------------|---------------|
| Early Meccan | 1 | The Clot | 2 | ["96:1", "96:2"] |
| Early Meccan | 5 | The Wrapped One | 3 | ["73:2", "73:8", "73:9"] |
| ... | ... | ... | ... | ... |
| Late Meccan | 39 | The Groups | 8 | ["39:2", "39:11", "39:14"] |
| ... | ... | ... | ... | ... |
| Medinan | 87 | The Cow | 15 | ["2:3", "2:4", "2:8"] |
| ... | ... | ... | ... | ... |

### Variations
- Calculate density metrics: `WITH period, sum(chapter_data.verse_count) AS period_verses, count(chapter_data) AS period_chapters RETURN period, period_verses, period_chapters, period_verses * 1.0 / period_chapters AS verses_per_chapter`
- Compare multiple topics: `MATCH (t:Topic)<-[:ADDRESSES_TOPIC]-(v:Verse)<-[:CONTAINS]-(c:Chapter) WHERE t.name IN $topic_list AND c.revelation_order IS NOT NULL WITH t.name AS topic, c.revelation_order AS rev_order, count(v) AS verse_count ORDER BY rev_order, topic RETURN rev_order, collect({topic: topic, count: verse_count}) AS topic_counts`
- Analyze linguistic changes: `MATCH (t:Topic {name: $topic_name})<-[:ADDRESSES_TOPIC]-(v:Verse)-[:CONTAINS_WORD]->(w:Word)-[:HAS_ROOT]->(r:Root) WITH period, r.text_clean AS root, count(w) AS occurrences WHERE occurrences > 3 RETURN period, collect({root: root, count: occurrences}) AS root_usage ORDER BY period`

---

## 3. Structural Pattern Analysis

### Description
Analyzes structural patterns in the Quran, such as verse length distribution, to identify potential literary or rhetorical patterns.

### Query
```cypher
// Get verse word counts
MATCH (c:Chapter)-[:CONTAINS]->(v:Verse)-[:CONTAINS_WORD]->(w:Word)
WITH c, v, count(w) AS word_count

// Calculate chapter statistics
WITH c, avg(word_count) AS avg_length, 
     min(word_count) AS min_length,
     max(word_count) AS max_length,
     stDev(word_count) AS std_dev,
     percentileCont(word_count, 0.5) AS median_length,
     count(v) AS verse_count

// Return chapter statistics
RETURN c.chapter_number, c.name_english, c.revelation_place,
       avg_length, median_length, min_length, max_length, std_dev,
       verse_count
ORDER BY c.chapter_number
```

### Parameters
None required

### Expected Results
A table showing structural patterns across chapters:
| chapter_number | name_english | revelation_place | avg_length | median_length | min_length | max_length | std_dev | verse_count |
|----------------|--------------|------------------|------------|---------------|------------|------------|---------|-------------|
| 1 | The Opening | Meccan | 4.0 | 4.0 | 3 | 5 | 0.82 | 7 |
| 2 | The Cow | Medinan | 16.2 | 14.0 | 3 | 128 | 12.4 | 286 |
| ... | ... | ... | ... | ... | ... | ... | ... | ... |

### Variations
- Analyze verse position patterns: `WITH c, v.verse_number AS position, word_count ORDER BY c.chapter_number, position WITH c.chapter_number AS chapter, collect({position: position, length: word_count}) AS verse_lengths RETURN chapter, verse_lengths`
- Find structural anomalies: `WITH c, v, word_count, avg(word_count) OVER (PARTITION BY c.id) AS chapter_avg WHERE abs(word_count - chapter_avg) > 2 * stDev(word_count) OVER (PARTITION BY c.id) RETURN c.name_english, v.verse_key, word_count, chapter_avg, word_count - chapter_avg AS deviation`
- Compare Meccan vs Medinan structure: `WITH c.revelation_place AS place, avg(word_count) AS avg_length, stDev(word_count) AS std_dev RETURN place, avg_length, std_dev`

---

## 4. Semantic Coherence Analysis

### Description
Analyzes the semantic coherence of chapters by measuring the similarity between adjacent verses and identifying thematic transitions.

### Query
```cypher
// Get verses in a specific chapter
MATCH (c:Chapter {chapter_number: $chapter_number})-[:CONTAINS]->(v:Verse)
WITH c, v
ORDER BY v.verse_number

// Collect verses with their embeddings
WITH c, collect({key: v.verse_key, number: v.verse_number, embedding: v.embedding}) AS verses

// Calculate similarity between adjacent verses
UNWIND range(0, size(verses)-2) AS i
WITH c, verses, i,
     verses[i].key AS verse1,
     verses[i].number AS number1,
     verses[i+1].key AS verse2,
     verses[i+1].number AS number2,
     vector_similarity(verses[i].embedding, verses[i+1].embedding) AS similarity

// Identify significant transitions (low similarity points)
WITH c, verse1, number1, verse2, number2, similarity,
     avg(similarity) OVER () AS avg_similarity,
     stDev(similarity) OVER () AS std_dev
WHERE similarity < avg_similarity - $transition_threshold * std_dev

// Return potential thematic transitions
RETURN verse1, verse2, similarity,
       avg_similarity, std_dev,
       (avg_similarity - similarity) / std_dev AS transition_strength
ORDER BY transition_strength DESC
LIMIT $limit
```

### Parameters
- `chapter_number`: Chapter number to analyze (e.g., 2)
- `transition_threshold`: Number of standard deviations below average to identify transitions (e.g., 1.5)
- `limit`: Maximum number of transitions to return (e.g., 10)

### Expected Results
A table showing potential thematic transitions within the chapter:
| verse1 | verse2 | similarity | avg_similarity | std_dev | transition_strength |
|--------|--------|------------|----------------|---------|---------------------|
| 2:141 | 2:142 | 0.32 | 0.78 | 0.15 | 3.07 |
| 2:176 | 2:177 | 0.41 | 0.78 | 0.15 | 2.47 |
| ... | ... | ... | ... | ... | ... |

### Variations
- Identify coherent sections: `WHERE similarity > avg_similarity + $coherence_threshold * std_dev WITH verse1, verse2, similarity ORDER BY verse1 WITH collect({start: verse1, end: verse2, similarity: similarity}) AS coherent_pairs`
- Compare with topic transitions: `MATCH (v1:Verse {verse_key: verse1})-[:ADDRESSES_TOPIC]->(t1:Topic) WITH verse1, verse2, similarity, transition_strength, collect(DISTINCT t1.name) AS topics1 MATCH (v2:Verse {verse_key: verse2})-[:ADDRESSES_TOPIC]->(t2:Topic) WITH verse1, verse2, similarity, transition_strength, topics1, collect(DISTINCT t2.name) AS topics2 RETURN verse1, verse2, similarity, transition_strength, topics1, topics2, size([x IN topics1 WHERE NOT x IN topics2]) AS topic_changes`
- Analyze global coherence: `WITH c.chapter_number AS chapter, avg(similarity) AS coherence, min(similarity) AS min_coherence, max(similarity) AS max_coherence RETURN chapter, coherence, min_coherence, max_coherence ORDER BY coherence DESC`

---

## 5. Network Analysis of Thematic Relationships

### Description
Performs network analysis on the thematic structure of the Quran, identifying central themes and their relationships.

### Query
```cypher
// Calculate how many verses address each topic
MATCH (t:Topic)<-[:ADDRESSES_TOPIC]-(v:Verse)
WITH t, count(v) AS verse_count

// Find relationships between topics based on co-occurrence in verses
MATCH (t)-[:ADDRESSES_TOPIC]-(v:Verse)-[:ADDRESSES_TOPIC]->(t2:Topic)
WHERE t <> t2
WITH t, t2, count(v) AS shared_verses, verse_count

// Calculate relationship strength
WITH t.name AS topic1, t2.name AS topic2, 
     shared_verses, verse_count,
     shared_verses * 1.0 / verse_count AS relationship_strength
WHERE relationship_strength > $strength_threshold

// Calculate network metrics
WITH topic1, collect({topic: topic2, strength: relationship_strength}) AS connections,
     count(*) AS degree
ORDER BY degree DESC

// Return network analysis results
RETURN topic1 AS topic,
       degree AS connection_count,
       connections[0..5] AS strongest_connections
LIMIT $limit
```

### Parameters
- `strength_threshold`: Minimum relationship strength to include (e.g., 0.2)
- `limit`: Maximum number of topics to return (e.g., 20)

### Expected Results
A table showing network analysis of thematic relationships:
| topic | connection_count | strongest_connections |
|-------|------------------|------------------------|
| Faith | 18 | [{topic: "Belief in Allah", strength: 0.85}, {topic: "Guidance", strength: 0.72}, ...] |
| Justice | 15 | [{topic: "Rights", strength: 0.78}, {topic: "Accountability", strength: 0.65}, ...] |
| ... | ... | ... |

### Variations
- Calculate centrality metrics: `WITH topic1, degree, connections, size(connections) * 1.0 / $total_topics AS centrality RETURN topic1, degree, centrality, connections`
- Identify thematic communities: This would require implementing community detection algorithms in application code using the relationship data
- Analyze second-degree connections: `WITH topic1, connections UNWIND connections AS conn WITH topic1, conn.topic AS intermediate MATCH (t:Topic {name: intermediate})<-[:ADDRESSES_TOPIC]-(v:Verse)-[:ADDRESSES_TOPIC]->(t2:Topic) WHERE t2.name <> topic1 AND t2.name <> intermediate WITH topic1, intermediate, t2.name AS topic2, count(v) AS indirect_strength RETURN topic1, intermediate, topic2, indirect_strength ORDER BY indirect_strength DESC LIMIT 20`

---

## 6. Comparative Analysis of Divine Attributes

### Description
Analyzes how divine attributes are presented across different parts of the Quran, revealing patterns in the description of God.

### Query
```cypher
// Find verses addressing divine attributes
MATCH (t:Topic {name: "Divine Attributes"})<-[:ADDRESSES_TOPIC]-(v:Verse)<-[:CONTAINS]-(c:Chapter)

// Extract specific attributes using word roots
MATCH (v)-[:CONTAINS_WORD]->(w:Word)-[:HAS_ROOT]->(r:Root)
WHERE r.text_clean IN $attribute_roots

// Group by revelation period and attribute
WITH c.revelation_place AS place,
     r.text_clean AS attribute_root,
     r.english_trilateral AS attribute_name,
     count(DISTINCT v) AS verse_count,
     collect(DISTINCT v.verse_key)[0..3] AS sample_verses

// Return comparative analysis
RETURN place, attribute_root, attribute_name, verse_count, sample_verses
ORDER BY place, verse_count DESC
```

### Parameters
- `attribute_roots`: List of root words representing divine attributes (e.g., ["رحم", "علم", "قدر", "حكم"])

### Expected Results
A table comparing divine attributes across revelation periods:
| place | attribute_root | attribute_name | verse_count | sample_verses |
|-------|---------------|----------------|-------------|---------------|
| Meccan | رحم | rhm (mercy) | 45 | ["7:156", "6:12", "6:54"] |
| Meccan | علم | 'lm (knowledge) | 38 | ["6:59", "10:61", "20:98"] |
| ... | ... | ... | ... | ... |
| Medinan | حكم | hkm (wisdom) | 28 | ["2:129", "4:26", "5:38"] |
| ... | ... | ... | ... | ... |

### Variations
- Calculate relative frequency: `WITH place, attribute_root, attribute_name, verse_count, sample_verses, sum(verse_count) OVER (PARTITION BY place) AS total_attributes RETURN place, attribute_root, attribute_name, verse_count, verse_count * 100.0 / total_attributes AS percentage, sample_verses`
- Analyze contextual associations: `MATCH (v)-[:ADDRESSES_TOPIC]->(other:Topic) WHERE other.name <> "Divine Attributes" WITH attribute_root, other.name AS associated_topic, count(v) AS co_occurrences RETURN attribute_root, collect({topic: associated_topic, count: co_occurrences})[0..5] AS context`
- Compare with explicit names: `MATCH (v)-[:CONTAINS_WORD]->(w:Word) WHERE w.text_uthmani IN $divine_names WITH place, w.text_uthmani AS divine_name, count(DISTINCT v) AS name_occurrences RETURN place, divine_name, name_occurrences ORDER BY place, name_occurrences DESC`

---

## 7. Narrative Structure Analysis

### Description
Analyzes the structure of narrative passages in the Quran, identifying patterns in storytelling and narrative elements.

### Query
```cypher
// Find verses related to prophetic narratives
MATCH (t:Topic {name: "Prophets"})<-[:ADDRESSES_TOPIC]-(v:Verse)

// Identify specific prophets mentioned
MATCH (v)-[:ADDRESSES_TOPIC]->(prophet:Topic)
WHERE prophet.name IN $prophet_names

// Identify narrative elements
MATCH (v)-[:ADDRESSES_TOPIC]->(element:Topic)
WHERE element.name IN ["Birth", "Childhood", "Mission", "Challenges", "Resolution", "Lessons"]

// Group by prophet and analyze narrative structure
WITH prophet.name AS prophet_name,
     collect(DISTINCT {verse: v.verse_key, element: element.name, position: v.verse_number}) AS narrative_elements
ORDER BY prophet_name

// Organize narrative elements by position
WITH prophet_name,
     apoc.coll.sortMulti(narrative_elements, ["position"]) AS sorted_elements

// Extract narrative structure
RETURN prophet_name,
       [elem IN sorted_elements | elem.element] AS narrative_structure,
       [elem IN sorted_elements | elem.verse] AS narrative_verses
```

### Parameters
- `prophet_names`: List of prophets to analyze (e.g., ["Noah", "Abraham", "Moses", "Jesus"])

### Expected Results
A table showing narrative structures for different prophetic stories:
| prophet_name | narrative_structure | narrative_verses |
|--------------|---------------------|------------------|
| Abraham | ["Birth", "Childhood", "Mission", "Challenges", "Challenges", "Resolution", "Lessons"] | ["19:41", "21:51", "21:52", "21:57", "37:97", "37:108", "60:4"] |
| Moses | ["Birth", "Childhood", "Mission", "Challenges", "Challenges", "Resolution", "Lessons"] | ["28:4", "28:13", "20:13", "20:17", "26:63", "28:40", "28:43"] |
| ... | ... | ... |

### Variations
- Compare narrative lengths: `WITH prophet_name, size(narrative_elements) AS narrative_length RETURN prophet_name, narrative_length ORDER BY narrative_length DESC`
- Analyze narrative element distribution: `UNWIND narrative_elements AS element WITH element.element AS narrative_element, count(*) AS frequency RETURN narrative_element, frequency ORDER BY frequency DESC`
- Identify common narrative patterns: `WITH collect(narrative_structure) AS all_structures UNWIND all_structures AS structure WITH structure, count(*) AS frequency WHERE frequency > 1 RETURN structure, frequency ORDER BY frequency DESC`

---

## 8. Contextual Interpretation Analysis

### Description
Analyzes how the interpretation of specific concepts varies based on their textual and thematic context.

### Query
```cypher
// Find verses containing a specific concept
MATCH (v:Verse)-[:CONTAINS_WORD]->(w:Word)-[:HAS_ROOT]->(r:Root {text_clean: $concept_root})

// Get thematic context
MATCH (v)-[:ADDRESSES_TOPIC]->(t:Topic)
WHERE NOT t.name IN ["Prophets", "Stories", "Parables"] // Exclude general categories

// Get textual context (surrounding words)
MATCH (v)-[:CONTAINS_WORD]->(context_word:Word)
WHERE abs(context_word.position - w.position) <= 3 AND context_word <> w

// Group by thematic context
WITH t.name AS theme,
     collect(DISTINCT v.verse_key) AS verses,
     collect(DISTINCT context_word.text_uthmani) AS contextual_words

// Calculate contextual statistics
WITH theme, verses, contextual_words,
     size(verses) AS verse_count,
     size(contextual_words) AS vocabulary_size

// Return contextual analysis
RETURN theme,
       verse_count,
       vocabulary_size,
       verses[0..3] AS sample_verses,
       contextual_words[0..10] AS common_context
ORDER BY verse_count DESC
LIMIT $limit
```

### Parameters
- `concept_root`: Root word representing the concept to analyze (e.g., "عدل" for justice)
- `limit`: Maximum number of thematic contexts to return (e.g., 15)

### Expected Results
A table showing how the concept is used in different thematic contexts:
| theme | verse_count | vocabulary_size | sample_verses | common_context |
|-------|-------------|-----------------|---------------|----------------|
| Law | 28 | 156 | ["4:58", "5:8", "5:42"] | ["حكم", "قسط", "شهد", "حق", "ميزان", "قضى", "ناس", "بين"] |
| Faith | 15 | 89 | ["16:90", "7:29", "57:25"] | ["أمر", "قسط", "دين", "رب", "حق", "أقام"] |
| ... | ... | ... | ... | ... |

### Variations
- Analyze semantic variation: `MATCH (v:Verse)-[:CONTAINS_WORD]->(w:Word)-[:HAS_ROOT]->(r:Root {text_clean: $concept_root}) WITH v, w, avg(v.embedding) OVER (PARTITION BY t.name) AS theme_centroid, v.embedding AS verse_embedding RETURN t.name AS theme, vector_similarity(theme_centroid, verse_embedding) AS semantic_coherence`
- Compare with translation variations: `MATCH (v)-[:HAS_TRANSLATION]->(trans:Translation {language_name: "English"}) WITH theme, collect(DISTINCT trans.text) AS translations RETURN theme, [word IN apoc.text.keywords(apoc.text.join(translations, " "), {minSize: 4}) WHERE NOT word IN $stop_words | word] AS translation_keywords`
- Identify contextual antonyms: `MATCH (v)-[:CONTAINS_WORD]->(opposite:Word)-[:HAS_ROOT]->(opp_root:Root) WHERE opp_root.text_clean IN $opposite_roots WITH theme, opp_root.text_clean AS opposite_concept, count(DISTINCT v) AS co_occurrences RETURN theme, collect({concept: opposite_concept, count: co_occurrences}) AS opposing_concepts`
