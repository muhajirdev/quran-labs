# Basic Queries

This document provides fundamental query examples for retrieving and filtering data from the Quran Knowledge Graph.

## 1. Retrieve Chapters (Surahs)

### Description
Retrieves basic information about chapters (surahs) in the Quran, including their names, revelation place, and verse count.

### Query
```cypher
MATCH (c:Chapter)
RETURN c.id, c.chapter_number, c.name_english, c.name_arabic, 
       c.revelation_place, c.verses_count
ORDER BY c.chapter_number
LIMIT $limit
```

### Parameters
- `limit`: Maximum number of chapters to return (e.g., 10)

### Expected Results
A table of chapters with their basic information, ordered by chapter number:
| id | chapter_number | name_english | name_arabic | revelation_place | verses_count |
|----|----------------|--------------|-------------|------------------|--------------|
| 1  | 1              | The Opening  | الفاتحة     | Meccan           | 7            |
| 2  | 2              | The Cow      | البقرة      | Medinan          | 286          |
| ...| ...            | ...          | ...         | ...              | ...          |

### Variations
- Filter chapters by revelation place: `WHERE c.revelation_place = "Meccan"`
- Sort by verses count: `ORDER BY c.verses_count DESC`
- Get only chapter names: `RETURN c.chapter_number, c.name_english`

---

## 2. Get Verses from a Chapter

### Description
Retrieves verses from a specific chapter, including their text and position information.

### Query
```cypher
MATCH (c:Chapter {id: $chapter_id})-[:CONTAINS]->(v:Verse)
RETURN v.id, v.verse_key, v.verse_number, v.text_uthmani
ORDER BY v.verse_number
LIMIT $limit
```

### Parameters
- `chapter_id`: ID of the chapter (e.g., 1 for Al-Fatiha)
- `limit`: Maximum number of verses to return (e.g., 20)

### Expected Results
A table of verses from the specified chapter:
| id | verse_key | verse_number | text_uthmani |
|----|-----------|--------------|--------------|
| 1  | 1:1       | 1            | بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ |
| 2  | 1:2       | 2            | الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ |
| ...| ...       | ...          | ...          |

### Variations
- Include additional verse properties: `RETURN v.id, v.verse_key, v.juz_number, v.page_number`
- Filter by verse number range: `WHERE v.verse_number BETWEEN 1 AND 10`
- Include translation: `OPTIONAL MATCH (v)-[:HAS_TRANSLATION]->(t:Translation) RETURN v.verse_key, v.text_uthmani, t.text`

---

## 3. Get a Specific Verse by Key

### Description
Retrieves detailed information about a specific verse identified by its verse key (chapter:verse format).

### Query
```cypher
MATCH (v:Verse {verse_key: $verse_key})
RETURN v.id, v.verse_key, v.text_uthmani, v.text_indopak
```

### Parameters
- `verse_key`: Verse identifier in chapter:verse format (e.g., "2:255" for Ayatul Kursi)

### Expected Results
Detailed information about the specified verse:
| id | verse_key | text_uthmani | text_indopak |
|----|-----------|--------------|--------------|
| 262| 2:255     | اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ... | اللہ لا الہ الا ھو الحی القیوم... |

### Variations
- Include additional metadata: `RETURN v.verse_key, v.juz_number, v.hizb_number, v.page_number`
- Get verse with translation: `MATCH (v:Verse {verse_key: $verse_key})-[:HAS_TRANSLATION]->(t:Translation) RETURN v.text_uthmani, t.text, t.language_name`
- Get verse with tafsir: `MATCH (v:Verse {verse_key: $verse_key})-[:HAS_TAFSIR]->(t:Tafsir) RETURN v.text_uthmani, t.text, t.resource_name`

---

## 4. Get Words in a Verse

### Description
Retrieves the individual words in a specific verse, including their position and text.

### Query
```cypher
MATCH (v:Verse {verse_key: $verse_key})-[:CONTAINS_WORD]->(w:Word)
RETURN w.id, w.position, w.text_uthmani
ORDER BY w.position
LIMIT $limit
```

### Parameters
- `verse_key`: Verse identifier in chapter:verse format (e.g., "1:1")
- `limit`: Maximum number of words to return (e.g., 30)

### Expected Results
A table of words from the specified verse, ordered by position:
| id | position | text_uthmani |
|----|----------|--------------|
| 1  | 1        | بِسْمِ       |
| 2  | 2        | اللَّهِ      |
| 3  | 3        | الرَّحْمَٰنِ  |
| 4  | 4        | الرَّحِيمِ    |

### Variations
- Include word morphology: `MATCH (w)-[:HAS_ROOT]->(r:Root) RETURN w.text_uthmani, r.text_clean`
- Get words with specific properties: `WHERE w.text_uthmani CONTAINS "الله"`
- Include page and line information: `RETURN w.text_uthmani, w.page_number, w.line_number`

---

## 5. Get Topics

### Description
Retrieves topics from the knowledge graph, including their names and hierarchical information.

### Query
```cypher
MATCH (t:Topic)
RETURN t.id, t.name, t.arabic_name, t.parent_id, t.depth
ORDER BY t.id
LIMIT $limit
```

### Parameters
- `limit`: Maximum number of topics to return (e.g., 20)

### Expected Results
A table of topics with their basic information:
| id | name | arabic_name | parent_id | depth |
|----|------|-------------|-----------|-------|
| 1  | Faith | الإيمان     | null      | 0     |
| 2  | Worship | العبادة    | null      | 0     |
| 3  | Ethics | الأخلاق    | null      | 0     |
| ...| ...  | ...         | ...       | ...   |

### Variations
- Filter by parent topic: `WHERE t.parent_id = $parent_id`
- Get only top-level topics: `WHERE t.parent_id IS NULL OR t.parent_id = 0`
- Sort by name: `ORDER BY t.name`

---

## 6. Get Translations for a Verse

### Description
Retrieves available translations for a specific verse in different languages.

### Query
```cypher
MATCH (v:Verse {verse_key: $verse_key})-[:HAS_TRANSLATION]->(t:Translation)
RETURN t.language_name, t.resource_name, t.text
ORDER BY t.language_name, t.resource_name
```

### Parameters
- `verse_key`: Verse identifier in chapter:verse format (e.g., "1:1")

### Expected Results
A table of translations for the specified verse:
| language_name | resource_name | text |
|---------------|---------------|------|
| English       | Sahih International | In the name of Allah, the Entirely Merciful, the Especially Merciful |
| English       | Yusuf Ali    | In the name of Allah, Most Gracious, Most Merciful |
| French        | Muhammad Hamidullah | Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux |
| ...           | ...          | ...  |

### Variations
- Filter by language: `WHERE t.language_name = "English"`
- Filter by translator: `WHERE t.resource_name = "Sahih International"`
- Include original text: `RETURN v.text_uthmani, t.language_name, t.text`

---

## 7. Get Adjacent Verses

### Description
Retrieves verses that come before and after a specific verse, providing context.

### Query
```cypher
MATCH (v:Verse {verse_key: $verse_key})
MATCH (c:Chapter)-[:CONTAINS]->(v)
MATCH (c)-[:CONTAINS]->(v_context)
WHERE v_context.verse_number >= v.verse_number - $context_size
  AND v_context.verse_number <= v.verse_number + $context_size
RETURN v_context.verse_key, v_context.verse_number, v_context.text_uthmani,
       CASE WHEN v_context.verse_key = $verse_key THEN true ELSE false END AS is_target_verse
ORDER BY v_context.verse_number
```

### Parameters
- `verse_key`: Verse identifier in chapter:verse format (e.g., "2:255")
- `context_size`: Number of verses to include before and after (e.g., 2)

### Expected Results
A table of verses providing context around the specified verse:
| verse_key | verse_number | text_uthmani | is_target_verse |
|-----------|--------------|--------------|-----------------|
| 2:253     | 253          | تِلْكَ الرُّسُلُ... | false |
| 2:254     | 254          | يَا أَيُّهَا الَّذِينَ آمَنُوا... | false |
| 2:255     | 255          | اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ... | true |
| 2:256     | 256          | لَا إِكْرَاهَ فِي الدِّينِ... | false |
| 2:257     | 257          | اللَّهُ وَلِيُّ الَّذِينَ آمَنُوا... | false |

### Variations
- Include translations: `OPTIONAL MATCH (v_context)-[:HAS_TRANSLATION]->(t:Translation) WHERE t.language_name = "English" RETURN v_context.verse_key, v_context.text_uthmani, t.text`
- Adjust context size dynamically: Use different values for before and after
- Include chapter information: `RETURN c.name_english, v_context.verse_key, v_context.text_uthmani`
