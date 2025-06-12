// @ts-check
const fs = require('fs');
const path = require('path');

// Read the existing app.json file
let appJson;
try {
  const appJsonPath = path.join(__dirname, 'app.json');
  const appJsonContent = fs.readFileSync(appJsonPath, 'utf8');
  appJson = JSON.parse(appJsonContent);
} catch (error) {
  console.error('Error reading app.json:', error);
  // Provide a basic default configuration if app.json cannot be read
  appJson = {
    expo: {
      name: 'MilkMatrix',
      slug: 'milk-matrix'
    }
  };
}

// Export the configuration with modifications
module.exports = {
  ...appJson
};
