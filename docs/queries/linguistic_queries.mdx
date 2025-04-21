# Linguistic Queries

This document provides query examples focused on analyzing linguistic features and patterns in the Quran Knowledge Graph.

## 1. Find Words with a Specific Root

### Description
Retrieves words derived from a specific root, showing the linguistic connections between related words.

### Query
```cypher
MATCH (r:Root {text_clean: $root_text})<-[:HAS_ROOT]-(w:Word)
RETURN w.id, w.text_uthmani, w.verse_key, w.position
ORDER BY w.verse_key, w.position
LIMIT $limit
```

### Parameters
- `root_text`: The root text to search for (e.g., "كتب" - the root for writing)
- `limit`: Maximum number of words to return (e.g., 50)

### Expected Results
A table of words derived from the specified root:
| id | text_uthmani | verse_key | position |
|----|--------------|-----------|----------|
| 2356 | الْكِتَابَ | 2:2 | 2 |
| 5487 | كُتِبَ | 2:178 | 1 |
| 5643 | كُتِبَ | 2:180 | 1 |
| ... | ... | ... | ... |

### Variations
- Include verse text for context: `MATCH (w)<-[:CONTAINS_WORD]-(v:Verse) RETURN w.text_uthmani, w.verse_key, v.text_uthmani`
- Group by chapter: `MATCH (w)<-[:CONTAINS_WORD]-(v:Verse)<-[:CONTAINS]-(c:Chapter) WITH c.name_english AS chapter, count(w) AS word_count RETURN chapter, word_count ORDER BY word_count DESC`
- Filter by specific chapter: `MATCH (w)<-[:CONTAINS_WORD]-(v:Verse)<-[:CONTAINS]-(c:Chapter {chapter_number: $chapter_number})`

---

## 2. Find Verses Containing Words with a Specific Root

### Description
Identifies verses that contain words derived from a specific root, useful for studying how concepts are used throughout the Quran.

### Query
```cypher
MATCH (r:Root {text_clean: $root_text})<-[:HAS_ROOT]-(w:Word)<-[:CONTAINS_WORD]-(v:Verse)
RETURN DISTINCT v.verse_key, v.text_uthmani
ORDER BY v.verse_key
LIMIT $limit
```

### Parameters
- `root_text`: The root text to search for (e.g., "علم" - the root for knowledge)
- `limit`: Maximum number of verses to return (e.g., 20)

### Expected Results
A table of verses containing words derived from the specified root:
| verse_key | text_uthmani |
|-----------|--------------|
| 1:1 | بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ |
| 2:22 | الَّذِي جَعَلَ لَكُمُ الْأَرْضَ فِرَاشًا وَالسَّمَاءَ بِنَاءً... |
| ... | ... |

### Variations
- Count occurrences within each verse: `WITH v, count(w) AS occurrences RETURN v.verse_key, v.text_uthmani, occurrences ORDER BY occurrences DESC`
- Find verses with multiple root occurrences: `WITH v, count(w) AS occurrences WHERE occurrences > 1 RETURN v.verse_key, v.text_uthmani, occurrences`
- Include highlighted words: `RETURN v.verse_key, v.text_uthmani, collect(w.text_uthmani) AS root_words`

---

## 3. Analyze Root Distribution Across Chapters

### Description
Analyzes how a specific linguistic root is distributed across different chapters of the Quran.

### Query
```cypher
MATCH (r:Root {text_clean: $root_text})<-[:HAS_ROOT]-(w:Word)<-[:CONTAINS_WORD]-(v:Verse)<-[:CONTAINS]-(c:Chapter)
WITH c, count(DISTINCT v) AS verse_count, count(w) AS word_count
RETURN c.chapter_number, c.name_english, verse_count, word_count
ORDER BY word_count DESC
LIMIT $limit
```

### Parameters
- `root_text`: The root text to analyze (e.g., "رحم" - the root for mercy)
- `limit`: Maximum number of chapters to return (e.g., 20)

### Expected Results
A table showing the distribution of the root across chapters:
| chapter_number | name_english | verse_count | word_count |
|----------------|--------------|-------------|------------|
| 55 | The Beneficent | 31 | 31 |
| 1 | The Opening | 2 | 2 |
| 2 | The Cow | 15 | 20 |
| ... | ... | ... | ... |

### Variations
- Calculate density (occurrences per verse): `WITH c, verse_count, word_count, c.verses_count AS total_verses RETURN c.name_english, word_count, word_count * 1.0 / total_verses AS density ORDER BY density DESC`
- Group by revelation place: `WITH c.revelation_place AS place, sum(word_count) AS total_occurrences RETURN place, total_occurrences`
- Compare multiple roots: `MATCH (r:Root)<-[:HAS_ROOT]-(w:Word)<-[:CONTAINS_WORD]-(v:Verse)<-[:CONTAINS]-(c:Chapter) WHERE r.text_clean IN $root_list WITH r.text_clean AS root, c.name_english AS chapter, count(w) AS occurrences RETURN chapter, collect({root: root, count: occurrences}) AS root_counts ORDER BY chapter`

---

## 4. Find Co-occurring Roots

### Description
Identifies roots that frequently co-occur in the same verses, revealing linguistic patterns and conceptual relationships.

### Query
```cypher
MATCH (r1:Root {text_clean: $root_text})<-[:HAS_ROOT]-(w1:Word)<-[:CONTAINS_WORD]-(v:Verse)-[:CONTAINS_WORD]->(w2:Word)-[:HAS_ROOT]->(r2:Root)
WHERE r1 <> r2
WITH r2, count(DISTINCT v) AS shared_verses
RETURN r2.text_clean, r2.english_trilateral, shared_verses
ORDER BY shared_verses DESC
LIMIT $limit
```

### Parameters
- `root_text`: The root text to find co-occurrences for (e.g., "قول" - the root for saying)
- `limit`: Maximum number of co-occurring roots to return (e.g., 15)

### Expected Results
A table of roots that co-occur with the specified root:
| text_clean | english_trilateral | shared_verses |
|------------|-------------------|---------------|
| علم | 'ilm | 45 |
| كون | kwn | 38 |
| أمر | 'mr | 32 |
| ... | ... | ... |

### Variations
- Calculate co-occurrence strength: `MATCH (r1)<-[:HAS_ROOT]-(:Word)<-[:CONTAINS_WORD]-(v:Verse) WITH r1, count(DISTINCT v) AS r1_verses MATCH (r1)<-[:HAS_ROOT]-(:Word)<-[:CONTAINS_WORD]-(v:Verse)-[:CONTAINS_WORD]->(:Word)-[:HAS_ROOT]->(r2:Root) WHERE r1 <> r2 WITH r1, r2, count(DISTINCT v) AS shared_verses, r1_verses RETURN r2.text_clean, shared_verses, shared_verses * 1.0 / r1_verses AS strength ORDER BY strength DESC`
- Find verses with specific root co-occurrences: `MATCH (r1:Root {text_clean: $root1})<-[:HAS_ROOT]-(:Word)<-[:CONTAINS_WORD]-(v:Verse)-[:CONTAINS_WORD]->(:Word)-[:HAS_ROOT]->(r2:Root {text_clean: $root2}) RETURN DISTINCT v.verse_key, v.text_uthmani`
- Create root co-occurrence network: `MATCH (r1:Root)<-[:HAS_ROOT]-(:Word)<-[:CONTAINS_WORD]-(v:Verse)-[:CONTAINS_WORD]->(:Word)-[:HAS_ROOT]->(r2:Root) WHERE r1 <> r2 WITH r1, r2, count(DISTINCT v) AS weight WHERE weight > $threshold RETURN r1.text_clean AS source, r2.text_clean AS target, weight`

---

## 5. Analyze Lemma Usage

### Description
Analyzes the usage of a specific lemma (dictionary form of a word) throughout the Quran.

### Query
```cypher
MATCH (l:Lemma {text_clean: $lemma_text})<-[:HAS_LEMMA]-(w:Word)<-[:CONTAINS_WORD]-(v:Verse)
RETURN v.verse_key, v.text_uthmani, w.text_uthmani AS lemma_word, w.position
ORDER BY v.verse_key, w.position
LIMIT $limit
```

### Parameters
- `lemma_text`: The lemma text to analyze (e.g., "قلب" - heart)
- `limit`: Maximum number of occurrences to return (e.g., 30)

### Expected Results
A table showing occurrences of the specified lemma:
| verse_key | text_uthmani | lemma_word | position |
|-----------|--------------|------------|----------|
| 2:7 | خَتَمَ اللَّهُ عَلَىٰ قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ... | قُلُوبِهِمْ | 4 |
| 2:10 | فِي قُلُوبِهِم مَّرَضٌ فَزَادَهُمُ اللَّهُ مَرَضًا... | قُلُوبِهِم | 2 |
| ... | ... | ... | ... |

### Variations
- Group by morphological form: `WITH w.text_uthmani AS word_form, count(*) AS occurrences RETURN word_form, occurrences ORDER BY occurrences DESC`
- Analyze contextual usage: `MATCH (w)<-[:CONTAINS_WORD]-(v)-[:CONTAINS_WORD]->(context:Word) WHERE abs(w.position - context.position) <= 2 RETURN context.text_uthmani, count(*) AS frequency ORDER BY frequency DESC LIMIT 20`
- Compare usage across revelation periods: `MATCH (v)<-[:CONTAINS]-(c:Chapter) WITH c.revelation_place AS place, count(w) AS occurrences RETURN place, occurrences ORDER BY occurrences DESC`

---

## 6. Find Linguistic Patterns in Topics

### Description
Identifies linguistic patterns (root usage) within verses addressing a specific topic.

### Query
```cypher
MATCH (t:Topic {name: $topic_name})<-[:ADDRESSES_TOPIC]-(v:Verse)-[:CONTAINS_WORD]->(w:Word)-[:HAS_ROOT]->(r:Root)
WITH r, count(DISTINCT v) AS verse_count, count(w) AS word_count
RETURN r.text_clean, r.english_trilateral, verse_count, word_count
ORDER BY word_count DESC
LIMIT $limit
```

### Parameters
- `topic_name`: Name of the topic to analyze (e.g., "Prayer")
- `limit`: Maximum number of roots to return (e.g., 20)

### Expected Results
A table showing the most common roots in verses about the specified topic:
| text_clean | english_trilateral | verse_count | word_count |
|------------|-------------------|-------------|------------|
| صلو | slw | 45 | 67 |
| قوم | qwm | 32 | 38 |
| ذكر | dhkr | 28 | 35 |
| ... | ... | ... | ... |

### Variations
- Calculate specificity to topic: `MATCH (r)<-[:HAS_ROOT]-(:Word)<-[:CONTAINS_WORD]-(v:Verse) WITH r, count(DISTINCT v) AS total_verses MATCH (t:Topic {name: $topic_name})<-[:ADDRESSES_TOPIC]-(v:Verse)-[:CONTAINS_WORD]->(:Word)-[:HAS_ROOT]->(r) WITH r, count(DISTINCT v) AS topic_verses, total_verses RETURN r.text_clean, topic_verses, topic_verses * 1.0 / total_verses AS specificity ORDER BY specificity DESC`
- Compare linguistic patterns across topics: `MATCH (t:Topic)<-[:ADDRESSES_TOPIC]-(v:Verse)-[:CONTAINS_WORD]->(w:Word)-[:HAS_ROOT]->(r:Root) WHERE t.name IN $topic_list WITH t.name AS topic, r.text_clean AS root, count(w) AS occurrences RETURN topic, collect({root: root, count: occurrences}) AS root_counts`
- Find distinctive roots for a topic: `MATCH (t:Topic {name: $topic_name})<-[:ADDRESSES_TOPIC]-(v:Verse)-[:CONTAINS_WORD]->(w:Word)-[:HAS_ROOT]->(r:Root) WITH r, count(w) AS topic_occurrences MATCH (r)<-[:HAS_ROOT]-(w:Word) WITH r, topic_occurrences, count(w) AS total_occurrences RETURN r.text_clean, topic_occurrences, total_occurrences, topic_occurrences * 1.0 / total_occurrences AS topic_specificity ORDER BY topic_specificity DESC`

---

## 7. Analyze Word Position Patterns

### Description
Analyzes patterns in word positions within verses, revealing structural linguistic patterns.

### Query
```cypher
MATCH (w:Word)-[:HAS_ROOT]->(r:Root {text_clean: $root_text})
WITH w.position AS position, count(*) AS occurrences
RETURN position, occurrences
ORDER BY position
LIMIT 20
```

### Parameters
- `root_text`: The root text to analyze position patterns for (e.g., "إله" - deity)

### Expected Results
A table showing the distribution of the root across different word positions:
| position | occurrences |
|----------|-------------|
| 1 | 15 |
| 2 | 87 |
| 3 | 124 |
| 4 | 56 |
| ... | ... |

### Variations
- Analyze position relative to verse length: `MATCH (w)<-[:CONTAINS_WORD]-(v:Verse) WITH v, count(w) AS verse_length MATCH (v)-[:CONTAINS_WORD]->(w)-[:HAS_ROOT]->(r:Root {text_clean: $root_text}) WITH w.position * 1.0 / verse_length AS relative_position RETURN floor(relative_position * 10) / 10 AS position_decile, count(*) AS occurrences ORDER BY position_decile`
- Compare position patterns across different roots: `MATCH (w:Word)-[:HAS_ROOT]->(r:Root) WHERE r.text_clean IN $root_list WITH r.text_clean AS root, w.position AS position, count(*) AS occurrences RETURN root, position, occurrences ORDER BY root, position`
- Analyze position in specific chapter: `MATCH (c:Chapter {chapter_number: $chapter_number})-[:CONTAINS]->(v:Verse)-[:CONTAINS_WORD]->(w:Word)-[:HAS_ROOT]->(r:Root {text_clean: $root_text}) RETURN w.position, count(*) AS occurrences ORDER BY w.position`

---

## 8. Find Collocations (Word Pairs)

### Description
Identifies common word pairs (collocations) in the Quranic text, revealing linguistic patterns.

### Query
```cypher
MATCH (v:Verse)-[:CONTAINS_WORD]->(w1:Word)
MATCH (v)-[:CONTAINS_WORD]->(w2:Word)
WHERE w1.position = w2.position - 1
WITH w1.text_uthmani + " " + w2.text_uthmani AS collocation, count(*) AS frequency
WHERE frequency > $min_frequency
RETURN collocation, frequency
ORDER BY frequency DESC
LIMIT $limit
```

### Parameters
- `min_frequency`: Minimum frequency threshold for collocations (e.g., 5)
- `limit`: Maximum number of collocations to return (e.g., 30)

### Expected Results
A table of common word pairs in the Quran:
| collocation | frequency |
|-------------|-----------|
| بِسْمِ اللَّهِ | 114 |
| الرَّحْمَٰنِ الرَّحِيمِ | 114 |
| يَا أَيُّهَا | 89 |
| ... | ... |

### Variations
- Find collocations with specific words: `WHERE w1.text_uthmani = $word OR w2.text_uthmani = $word`
- Find collocations by root: `MATCH (w1)-[:HAS_ROOT]->(r:Root {text_clean: $root_text}) WITH w1, r MATCH (v:Verse)-[:CONTAINS_WORD]->(w1) MATCH (v)-[:CONTAINS_WORD]->(w2:Word) WHERE w1.position = w2.position - 1 OR w1.position = w2.position + 1`
- Analyze collocation by chapter type: `MATCH (c:Chapter)-[:CONTAINS]->(v:Verse) WHERE c.revelation_place = $place MATCH (v)-[:CONTAINS_WORD]->(w1:Word) MATCH (v)-[:CONTAINS_WORD]->(w2:Word) WHERE w1.position = w2.position - 1`
