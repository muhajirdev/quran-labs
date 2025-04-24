/**
 * Script to procedurally generate 1000 data points for the Quran Knowledge Graph visualization
 * This generates synthetic data following the schema defined in the project
 */

// Define node types based on the schema
const NODE_TYPES = {
  SURAH: 'surah',
  VERSE: 'verse',
  WORD: 'word',
  ROOT: 'root',
  TOPIC: 'topic',
  TAFSIR: 'tafsir',
  TRANSLATION: 'translation'
};

// Define relationship types
const REL_TYPES = {
  CONTAINS: 'contains',
  HAS_ROOT: 'has_root',
  ADDRESSES_TOPIC: 'addresses_topic',
  HAS_TAFSIR: 'has_tafsir',
  HAS_TRANSLATION: 'has_translation',
  SIMILAR_TO: 'similar_to'
};

// Colors for different node types
const NODE_COLORS = {
  [NODE_TYPES.SURAH]: '#4285F4',      // Blue
  [NODE_TYPES.VERSE]: '#34A853',      // Green
  [NODE_TYPES.WORD]: '#FBBC05',       // Yellow
  [NODE_TYPES.ROOT]: '#EA4335',       // Red
  [NODE_TYPES.TOPIC]: '#8E24AA',      // Purple
  [NODE_TYPES.TAFSIR]: '#00ACC1',     // Cyan
  [NODE_TYPES.TRANSLATION]: '#FB8C00' // Orange
};

// Node sizes for different types
const NODE_SIZES = {
  [NODE_TYPES.SURAH]: 10,
  [NODE_TYPES.VERSE]: 6,
  [NODE_TYPES.WORD]: 3,
  [NODE_TYPES.ROOT]: 5,
  [NODE_TYPES.TOPIC]: 8,
  [NODE_TYPES.TAFSIR]: 4,
  [NODE_TYPES.TRANSLATION]: 4
};

// Generate a random integer between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a random float between min and max
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// Pick a random element from an array
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate a random surah node
function generateSurah(id) {
  const surahNumber = id;
  return {
    id: `surah-${surahNumber}`,
    name: `S${surahNumber}`,
    group: NODE_TYPES.SURAH,
    val: NODE_SIZES[NODE_TYPES.SURAH],
    color: NODE_COLORS[NODE_TYPES.SURAH],
    properties: {
      surahNumber,
      revelationPlace: randomChoice(['Mecca', 'Medina']),
      verseCount: randomInt(3, 286)
    }
  };
}

// Generate a random verse node
function generateVerse(surahId, verseNumber) {
  const surahNumber = parseInt(surahId.split('-')[1]);
  return {
    id: `${surahNumber}:${verseNumber}`,
    name: `${surahNumber}:${verseNumber}`,
    group: NODE_TYPES.VERSE,
    val: NODE_SIZES[NODE_TYPES.VERSE],
    color: NODE_COLORS[NODE_TYPES.VERSE],
    properties: {
      surahNumber,
      verseNumber,
      juz: randomInt(1, 30),
      hizb: randomInt(1, 60)
    }
  };
}

// Generate a random word node
function generateWord(verseId, position) {
  return {
    id: `word-${verseId}-${position}`,
    name: `W${position}`,
    group: NODE_TYPES.WORD,
    val: NODE_SIZES[NODE_TYPES.WORD],
    color: NODE_COLORS[NODE_TYPES.WORD],
    properties: {
      verseId,
      position
    }
  };
}

// Generate a random root word node
function generateRoot(id) {
  return {
    id: `root-${id}`,
    name: `R${id}`,
    group: NODE_TYPES.ROOT,
    val: NODE_SIZES[NODE_TYPES.ROOT],
    color: NODE_COLORS[NODE_TYPES.ROOT],
    properties: {
      meaning: `Meaning of root ${id}`
    }
  };
}

// Generate a random topic node
function generateTopic(id) {
  const topics = [
    'Mercy', 'Guidance', 'Faith', 'Prayer', 'Charity',
    'Patience', 'Justice', 'Knowledge', 'Wisdom', 'Gratitude',
    'Forgiveness', 'Repentance', 'Paradise', 'Hell', 'Angels',
    'Prophets', 'Creation', 'Death', 'Resurrection', 'Judgment'
  ];

  const topicName = id <= topics.length ? topics[id - 1] : `T${id}`;

  return {
    id: `topic-${id}`,
    name: topicName,
    group: NODE_TYPES.TOPIC,
    val: NODE_SIZES[NODE_TYPES.TOPIC],
    color: NODE_COLORS[NODE_TYPES.TOPIC],
    properties: {
      description: `Description of ${topicName}`
    }
  };
}

// Generate a random tafsir node
function generateTafsir(verseId, id) {
  const scholars = ['Ibn Kathir', 'Al-Tabari', 'Al-Qurtubi', 'Al-Jalalayn', 'Sayyid Qutb'];
  const scholar = randomChoice(scholars);
  const shortName = scholar.split(' ')[0];

  return {
    id: `tafsir-${verseId}-${id}`,
    name: `${shortName}`,
    group: NODE_TYPES.TAFSIR,
    val: NODE_SIZES[NODE_TYPES.TAFSIR],
    color: NODE_COLORS[NODE_TYPES.TAFSIR],
    properties: {
      verseId,
      author: scholar
    }
  };
}

// Generate a random translation node
function generateTranslation(verseId, id) {
  const translators = ['Yusuf Ali', 'Pickthall', 'Sahih International', 'Muhammad Asad', 'Arberry'];
  const languages = ['English', 'French', 'Spanish', 'German', 'Indonesian'];
  const translator = randomChoice(translators);
  const language = randomChoice(languages);

  return {
    id: `translation-${verseId}-${id}`,
    name: `${translator.split(' ')[0]}`,
    group: NODE_TYPES.TRANSLATION,
    val: NODE_SIZES[NODE_TYPES.TRANSLATION],
    color: NODE_COLORS[NODE_TYPES.TRANSLATION],
    properties: {
      verseId,
      translator,
      language
    }
  };
}

// Generate a link between two nodes
function generateLink(source, target, type, value = 1) {
  return {
    source,
    target,
    type,
    value
  };
}

// Main function to generate the graph data
function generateGraphData(nodeCount = 1000) {
  const nodes = [];
  const links = [];

  // Track created nodes by type for easier relationship creation
  const nodesByType = {
    [NODE_TYPES.SURAH]: [],
    [NODE_TYPES.VERSE]: [],
    [NODE_TYPES.WORD]: [],
    [NODE_TYPES.ROOT]: [],
    [NODE_TYPES.TOPIC]: [],
    [NODE_TYPES.TAFSIR]: [],
    [NODE_TYPES.TRANSLATION]: []
  };

  // Determine how many of each node type to create
  // We'll use a distribution that makes sense for the Quran structure
  const surahCount = Math.min(114, Math.ceil(nodeCount * 0.05)); // Max 114 surahs in Quran
  const verseCount = Math.ceil(nodeCount * 0.3);
  const wordCount = Math.ceil(nodeCount * 0.3);
  const rootCount = Math.ceil(nodeCount * 0.05);
  const topicCount = Math.ceil(nodeCount * 0.1);
  const tafsirCount = Math.ceil(nodeCount * 0.1);
  const translationCount = Math.ceil(nodeCount * 0.1);

  // Generate surah nodes
  for (let i = 1; i <= surahCount; i++) {
    const surah = generateSurah(i);
    nodes.push(surah);
    nodesByType[NODE_TYPES.SURAH].push(surah);
  }

  // Generate verse nodes and connect to surahs
  for (let i = 1; i <= verseCount; i++) {
    const surah = randomChoice(nodesByType[NODE_TYPES.SURAH]);
    const verseNumber = randomInt(1, 20);
    const verse = generateVerse(surah.id, verseNumber);
    nodes.push(verse);
    nodesByType[NODE_TYPES.VERSE].push(verse);

    // Link verse to surah (CONTAINS relationship)
    links.push(generateLink(surah.id, verse.id, REL_TYPES.CONTAINS));
  }

  // Generate word nodes and connect to verses
  for (let i = 1; i <= wordCount; i++) {
    if (nodesByType[NODE_TYPES.VERSE].length === 0) continue;

    const verse = randomChoice(nodesByType[NODE_TYPES.VERSE]);
    const position = randomInt(1, 10);
    const word = generateWord(verse.id, position);
    nodes.push(word);
    nodesByType[NODE_TYPES.WORD].push(word);

    // Link word to verse (CONTAINS relationship)
    links.push(generateLink(verse.id, word.id, REL_TYPES.CONTAINS));
  }

  // Generate root nodes
  for (let i = 1; i <= rootCount; i++) {
    const root = generateRoot(i);
    nodes.push(root);
    nodesByType[NODE_TYPES.ROOT].push(root);
  }

  // Connect words to roots
  for (const word of nodesByType[NODE_TYPES.WORD]) {
    if (nodesByType[NODE_TYPES.ROOT].length === 0) continue;

    const root = randomChoice(nodesByType[NODE_TYPES.ROOT]);
    links.push(generateLink(word.id, root.id, REL_TYPES.HAS_ROOT));
  }

  // Generate topic nodes
  for (let i = 1; i <= topicCount; i++) {
    const topic = generateTopic(i);
    nodes.push(topic);
    nodesByType[NODE_TYPES.TOPIC].push(topic);
  }

  // Connect verses to topics
  for (const verse of nodesByType[NODE_TYPES.VERSE]) {
    if (nodesByType[NODE_TYPES.TOPIC].length === 0) continue;

    // Each verse addresses 1-3 topics
    const topicCount = randomInt(1, 3);
    const selectedTopics = new Set();

    for (let i = 0; i < topicCount; i++) {
      const topic = randomChoice(nodesByType[NODE_TYPES.TOPIC]);
      if (selectedTopics.has(topic.id)) continue;

      selectedTopics.add(topic.id);
      const relevance = randomFloat(0.1, 1.0).toFixed(2);
      links.push(generateLink(verse.id, topic.id, REL_TYPES.ADDRESSES_TOPIC, relevance));
    }
  }

  // Generate tafsir nodes and connect to verses
  for (let i = 1; i <= tafsirCount; i++) {
    if (nodesByType[NODE_TYPES.VERSE].length === 0) continue;

    const verse = randomChoice(nodesByType[NODE_TYPES.VERSE]);
    const tafsir = generateTafsir(verse.id, i);
    nodes.push(tafsir);
    nodesByType[NODE_TYPES.TAFSIR].push(tafsir);

    // Link tafsir to verse
    links.push(generateLink(verse.id, tafsir.id, REL_TYPES.HAS_TAFSIR));
  }

  // Generate translation nodes and connect to verses
  for (let i = 1; i <= translationCount; i++) {
    if (nodesByType[NODE_TYPES.VERSE].length === 0) continue;

    const verse = randomChoice(nodesByType[NODE_TYPES.VERSE]);
    const translation = generateTranslation(verse.id, i);
    nodes.push(translation);
    nodesByType[NODE_TYPES.TRANSLATION].push(translation);

    // Link translation to verse
    links.push(generateLink(verse.id, translation.id, REL_TYPES.HAS_TRANSLATION));
  }

  // Add some SIMILAR_TO relationships between verses
  const similarityCount = Math.min(verseCount, 50);
  for (let i = 0; i < similarityCount; i++) {
    if (nodesByType[NODE_TYPES.VERSE].length < 2) continue;

    const verse1 = randomChoice(nodesByType[NODE_TYPES.VERSE]);
    let verse2 = randomChoice(nodesByType[NODE_TYPES.VERSE]);

    // Make sure we don't connect a verse to itself
    while (verse1.id === verse2.id) {
      verse2 = randomChoice(nodesByType[NODE_TYPES.VERSE]);
    }

    const similarityScore = randomFloat(0.5, 0.95).toFixed(2);
    links.push(generateLink(verse1.id, verse2.id, REL_TYPES.SIMILAR_TO, similarityScore));
  }

  return {
    nodes,
    links
  };
}

// Generate the data
const graphData = generateGraphData(1000);

// Output the data as JSON
console.log(JSON.stringify(graphData, null, 2));
