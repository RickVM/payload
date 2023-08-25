import path, { dirname } from 'path';
import fs from 'fs';
import { generateTypes } from '../src/bin/generateTypes';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const _dirname = dirname(__filename);

const [testConfigDir] = process.argv.slice(2);

let testDir;
if (testConfigDir) {
  testDir = path.resolve(_dirname, testConfigDir);
  setPaths(testDir);
  generateTypes();
} else {
  // Generate types for entire directory
  testDir = _dirname;

  fs.readdirSync(_dirname, { withFileTypes: true })
    .filter((f) => f.isDirectory())
    .forEach((dir) => {
      const suiteDir = path.resolve(testDir, dir.name);
      const configFound = setPaths(suiteDir);
      if (configFound) generateTypes();
    });
}

// Set config path and TS output path using test dir
function setPaths(dir) {
  const configPath = path.resolve(dir, 'config.ts');
  const outputPath = path.resolve(dir, 'payload-types.ts');
  if (fs.existsSync(configPath)) {
    process.env.PAYLOAD_CONFIG_PATH = configPath;
    process.env.PAYLOAD_TS_OUTPUT_PATH = outputPath;
    return true;
  }
  return false;
}