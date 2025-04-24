/**
 * Script to run the data generation and save the output to a file
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create the data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', 'apps', 'web', 'public', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Run the generation script and save the output
try {
  console.log('Generating 1000 data points for the Quran Knowledge Graph...');
  const output = execSync('node scripts/generate_graph_data.js');
  
  // Parse the output to ensure it's valid JSON
  const graphData = JSON.parse(output.toString());
  
  // Convert the data to the format expected by react-force-graph
  // The library expects 'links' to have 'source' and 'target' properties
  // that reference the actual node objects, not just their IDs
  const formattedData = {
    nodes: graphData.nodes,
    links: graphData.links.map(link => ({
      source: link.source,
      target: link.target,
      value: link.value,
      type: link.type
    }))
  };
  
  // Save the data to a file
  const outputPath = path.join(dataDir, 'quran_graph_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(formattedData, null, 2));
  
  console.log(`Successfully generated ${graphData.nodes.length} nodes and ${graphData.links.length} links`);
  console.log(`Data saved to ${outputPath}`);
} catch (error) {
  console.error('Error generating or saving graph data:', error);
  process.exit(1);
}
