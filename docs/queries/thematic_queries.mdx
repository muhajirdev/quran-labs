# Thematic Queries

This document provides query examples focused on thematic exploration and analysis in the Quran Knowledge Graph.

## 1. Find Verses by Topic

### Description
Retrieves verses that address a specific topic, allowing exploration of thematic content.

### Query
```cypher
MATCH (t:Topic {name: $topic_name})<-[:ADDRESSES_TOPIC]-(v:Verse)
RETURN v.id, v.verse_key, v.text_uthmani
LIMIT $limit
```

### Parameters
- `topic_name`: Name of the topic to explore (e.g., "Patience")
- `limit`: Maximum number of verses to return (e.g., 20)

### Expected Results
A table of verses addressing the specified topic:
| id | verse_key | text_uthmani |
|----|-----------|--------------|
| 153| 2:45      | وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ... |
| 157| 2:153     | يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ... |
| ...| ...       | ...          |

### Variations
- Sort by relevance: `WITH v, t, EXISTS((v)-[:ADDRESSES_TOPIC {ontology: true}]->(t)) AS is_ontological ORDER BY is_ontological DESC, v.verse_key`
- Include chapter information: `MATCH (c:Chapter)-[:CONTAINS]->(v) RETURN c.name_english, v.verse_key, v.text_uthmani`
- Filter by revelation place: `MATCH (c:Chapter)-[:CONTAINS]->(v) WHERE c.revelation_place = "Meccan" RETURN v.verse_key, v.text_uthmani`

---

## 2. Find Topics Addressed in a Verse

### Description
Identifies all topics addressed in a specific verse, showing its thematic elements.

### Query
```cypher
MATCH (v:Verse {verse_key: $verse_key})-[:ADDRESSES_TOPIC]->(t:Topic)
RETURN t.id, t.name, t.arabic_name, t.depth
ORDER BY t.depth, t.name
```

### Parameters
- `verse_key`: Verse identifier in chapter:verse format (e.g., "2:255")

### Expected Results
A table of topics addressed in the specified verse:
| id | name | arabic_name | depth |
|----|------|-------------|-------|
| 12 | Divine Attributes | صفات الله | 0 |
| 45 | Monotheism | التوحيد | 1 |
| 67 | Knowledge | العلم | 1 |
| 89 | Divine Power | قدرة الله | 2 |

### Variations
- Filter by topic type: `WHERE EXISTS((v)-[:ADDRESSES_TOPIC {ontology: true}]->(t))`
- Include relevance score: `MATCH (v)-[r:ADDRESSES_TOPIC]->(t) RETURN t.name, r.relevance ORDER BY r.relevance DESC`
- Group by parent topics: `OPTIONAL MATCH (t)-[:SUBTOPIC_OF]->(parent:Topic) RETURN parent.name, collect(t.name) AS subtopics`

---

## 3. Explore Topic Hierarchy

### Description
Explores the hierarchical structure of topics, showing parent-child relationships.

### Query
```cypher
MATCH path = (t1:Topic {name: $topic_name})<-[:SUBTOPIC_OF*1..$max_depth]-(t2:Topic)
RETURN t1.name AS parent, t2.name AS child, length(path) AS depth
ORDER BY depth, child
```

### Parameters
- `topic_name`: Name of the root topic (e.g., "Faith")
- `max_depth`: Maximum depth to traverse in the hierarchy (e.g., 3)

### Expected Results
A table showing the hierarchical structure of topics:
| parent | child | depth |
|--------|-------|-------|
| Faith  | Belief in Allah | 1 |
| Faith  | Belief in Angels | 1 |
| Faith  | Belief in Prophets | 1 |
| Faith  | Belief in Allah | 1 |
| Faith  | Belief in Angels | 1 |
| Faith  | Belief in Prophets | 1 |
| Faith  | Belief in Divine Books | 1 |
| Faith  | Belief in the Last Day | 1 |
| Faith  | Belief in Destiny | 1 |
| Belief in Allah | Divine Names | 2 |
| Belief in Allah | Divine Attributes | 2 |
| Belief in Allah | Monotheism | 2 |
| ...    | ...   | ...   |

### Variations
- Get all top-level topics: `MATCH (t:Topic) WHERE NOT EXISTS((t)-[:SUBTOPIC_OF]->()) RETURN t.name`
- Get direct subtopics only: `MATCH (t1:Topic {name: $topic_name})<-[:SUBTOPIC_OF]-(t2:Topic) RETURN t1.name, t2.name`
- Include verse counts: `MATCH (t2)<-[:ADDRESSES_TOPIC]-(v:Verse) WITH t1, t2, depth, count(v) AS verse_count RETURN t1.name, t2.name, depth, verse_count`

---

## 4. Find Related Topics

### Description
Identifies topics that are related to a given topic based on co-occurrence in verses.

### Query
```cypher
MATCH (t1:Topic {name: $topic_name})<-[:ADDRESSES_TOPIC]-(v:Verse)-[:ADDRESSES_TOPIC]->(t2:Topic)
WHERE t1 <> t2
WITH t2, count(v) AS shared_verses
RETURN t2.id, t2.name, shared_verses
ORDER BY shared_verses DESC
LIMIT $limit
```

### Parameters
- `topic_name`: Name of the topic to find related topics for (e.g., "Prayer")
- `limit`: Maximum number of related topics to return (e.g., 15)

### Expected Results
A table of topics related to the specified topic, ordered by strength of relationship:
| id | name | shared_verses |
|----|------|---------------|
| 23 | Worship | 45 |
| 56 | Remembrance | 32 |
| 78 | Purification | 28 |
| ... | ... | ... |

### Variations
- Filter by minimum relationship strength: `WHERE shared_verses > 10`
- Calculate relationship strength as percentage: `WITH t2, shared_verses, count((:Verse)-[:ADDRESSES_TOPIC]->(t1)) AS t1_verses RETURN t2.name, shared_verses, shared_verses * 100.0 / t1_verses AS percentage`
- Exclude subtopics: `WHERE NOT EXISTS((t2)-[:SUBTOPIC_OF]->(t1))`

---

## 5. Thematic Distribution Across Chapters

### Description
Analyzes how a specific theme is distributed across different chapters of the Quran.

### Query
```cypher
MATCH (t:Topic {name: $topic_name})<-[:ADDRESSES_TOPIC]-(v:Verse)<-[:CONTAINS]-(c:Chapter)
WITH c, count(v) AS verse_count
RETURN c.chapter_number, c.name_english, verse_count
ORDER BY verse_count DESC
LIMIT $limit
```

### Parameters
- `topic_name`: Name of the topic to analyze (e.g., "Justice")
- `limit`: Maximum number of chapters to return (e.g., 20)

### Expected Results
A table showing the distribution of the topic across chapters:
| chapter_number | name_english | verse_count |
|----------------|--------------|-------------|
| 4              | The Women    | 15          |
| 2              | The Cow      | 12          |
| 5              | The Table Spread | 10      |
| ...            | ...          | ...         |

### Variations
- Calculate percentage of chapter: `WITH c, count(v) AS verse_count, c.verses_count AS total_verses RETURN c.name_english, verse_count, verse_count * 100.0 / total_verses AS percentage`
- Group by revelation place: `WITH c.revelation_place AS place, count(v) AS verse_count RETURN place, verse_count ORDER BY verse_count DESC`
- Analyze chronologically: `RETURN c.revelation_order, c.name_english, verse_count ORDER BY c.revelation_order`

---

## 6. Find Thematic Paths Between Verses

### Description
Discovers thematic connections between two verses by finding common topics they address.

### Query
```cypher
MATCH path = (v1:Verse {verse_key: $start_key})-[:ADDRESSES_TOPIC]->(t:Topic)<-[:ADDRESSES_TOPIC]-(v2:Verse {verse_key: $end_key})
RETURN v1.verse_key AS start_verse, t.name AS connecting_topic, v2.verse_key AS end_verse
LIMIT 10
```

### Parameters
- `start_key`: Verse key for the starting verse (e.g., "2:255")
- `end_key`: Verse key for the ending verse (e.g., "59:23")

### Expected Results
A table showing thematic connections between the verses:
| start_verse | connecting_topic | end_verse |
|-------------|------------------|-----------|
| 2:255       | Divine Attributes | 59:23    |
| 2:255       | Divine Knowledge | 59:23    |
| 2:255       | Monotheism       | 59:23    |
| ...         | ...              | ...       |

### Variations
- Find multi-hop paths: `MATCH path = (v1:Verse {verse_key: $start_key})-[:ADDRESSES_TOPIC]->(:Topic)<-[:ADDRESSES_TOPIC]-(:Verse)-[:ADDRESSES_TOPIC]->(:Topic)<-[:ADDRESSES_TOPIC]-(v2:Verse {verse_key: $end_key})`
- Find shortest thematic path: `MATCH path = shortestPath((v1:Verse {verse_key: $start_key})-[:ADDRESSES_TOPIC|:SIMILAR_TO*..5]-(v2:Verse {verse_key: $end_key}))`
- Include path length: `RETURN v1.verse_key, v2.verse_key, [node IN nodes(path) WHERE node:Topic | node.name] AS connecting_topics, length(path) AS path_length`

---

## 7. Comparative Thematic Analysis

### Description
Compares the thematic content of two chapters to identify similarities and differences.

### Query
```cypher
// Get topics in first chapter
MATCH (c1:Chapter {chapter_number: $chapter1})-[:CONTAINS]->(v1:Verse)-[:ADDRESSES_TOPIC]->(t:Topic)
WITH c1, collect(DISTINCT t.id) AS c1_topics

// Get topics in second chapter
MATCH (c2:Chapter {chapter_number: $chapter2})-[:CONTAINS]->(v2:Verse)-[:ADDRESSES_TOPIC]->(t2:Topic)
WITH c1, c2, c1_topics, collect(DISTINCT t2.id) AS c2_topics

// Find common and unique topics
MATCH (t:Topic)
WHERE t.id IN c1_topics OR t.id IN c2_topics
RETURN t.name AS topic,
       CASE WHEN t.id IN c1_topics THEN true ELSE false END AS in_chapter1,
       CASE WHEN t.id IN c2_topics THEN true ELSE false END AS in_chapter2
ORDER BY in_chapter1 AND in_chapter2 DESC, t.name
```

### Parameters
- `chapter1`: Chapter number for first chapter (e.g., 1)
- `chapter2`: Chapter number for second chapter (e.g., 112)

### Expected Results
A table comparing the thematic content of two chapters:
| topic | in_chapter1 | in_chapter2 |
|-------|-------------|-------------|
| Divine Attributes | true | true |
| Monotheism | true | true |
| Worship | true | true |
| Guidance | true | false |
| Prayer | true | false |
| Divine Unity | false | true |
| ...     | ...       | ...         |

### Variations
- Calculate Jaccard similarity: `RETURN size([x IN c1_topics WHERE x IN c2_topics]) * 1.0 / size(c1_topics + c2_topics - [x IN c1_topics WHERE x IN c2_topics]) AS similarity`
- Compare by topic categories: `WITH t, in_chapter1, in_chapter2 MATCH (t)-[:SUBTOPIC_OF*0..]->(parent:Topic) WHERE NOT EXISTS((parent)-[:SUBTOPIC_OF]->()) RETURN parent.name, count(CASE WHEN in_chapter1 THEN 1 END) AS c1_count, count(CASE WHEN in_chapter2 THEN 1 END) AS c2_count`
- Include verse counts: `MATCH (c1)-[:CONTAINS]->(v1)-[:ADDRESSES_TOPIC]->(t) WITH t, count(v1) AS c1_count MATCH (c2)-[:CONTAINS]->(v2)-[:ADDRESSES_TOPIC]->(t) WITH t, c1_count, count(v2) AS c2_count RETURN t.name, c1_count, c2_count`

---

## 8. Thematic Evolution Analysis

### Description
Analyzes how a theme evolves throughout the chronological order of revelation.

### Query
```cypher
MATCH (t:Topic {name: $topic_name})<-[:ADDRESSES_TOPIC]-(v:Verse)<-[:CONTAINS]-(c:Chapter)
WITH c.revelation_order AS rev_order, c.name_english AS chapter, count(v) AS verse_count
WHERE rev_order IS NOT NULL
RETURN rev_order, chapter, verse_count
ORDER BY rev_order
```

### Parameters
- `topic_name`: Name of the topic to analyze (e.g., "Faith")

### Expected Results
A table showing the evolution of the topic throughout revelation:
| rev_order | chapter | verse_count |
|-----------|---------|-------------|
| 1         | The Clot | 2          |
| 2         | The Pen  | 1          |
| 3         | The Wrapped One | 3   |
| ...       | ...     | ...         |

### Variations
- Group by early/middle/late periods: `WITH CASE WHEN c.revelation_order <= 38 THEN "Early Meccan" WHEN c.revelation_order <= 86 THEN "Late Meccan" ELSE "Medinan" END AS period, count(v) AS verse_count RETURN period, verse_count ORDER BY CASE period WHEN "Early Meccan" THEN 1 WHEN "Late Meccan" THEN 2 ELSE 3 END`
- Calculate running total: `WITH rev_order, chapter, verse_count ORDER BY rev_order WITH collect({rev_order: rev_order, chapter: chapter, verse_count: verse_count}) AS data UNWIND range(0, size(data)-1) AS i RETURN data[i].rev_order, data[i].chapter, data[i].verse_count, reduce(s = 0, j IN range(0, i) | s + data[j].verse_count) AS cumulative_count`
- Compare multiple topics: `MATCH (t:Topic)<-[:ADDRESSES_TOPIC]-(v:Verse)<-[:CONTAINS]-(c:Chapter) WHERE t.name IN $topic_list WITH t.name AS topic, c.revelation_order AS rev_order, count(v) AS verse_count WHERE rev_order IS NOT NULL RETURN rev_order, collect({topic: topic, count: verse_count}) AS topic_counts ORDER BY rev_order`
