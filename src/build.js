const fs = require('fs');
const path = require('path');
const { gatherData, generateIndex } = require('./lib');

const outDir = path.join(__dirname, '..', 'build');

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const data = gatherData();
fs.writeFileSync(path.join(outDir, 'index.html'), generateIndex(data));
fs.copyFileSync(path.join(__dirname, 'style.css'), path.join(outDir, 'style.css'));
