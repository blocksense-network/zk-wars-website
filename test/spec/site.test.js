const { execSync } = require('child_process');
const fs = require('fs');
const assert = require('assert');

execSync('node src/build.js');
const html = fs.readFileSync('build/index.html', 'utf8');

assert(html.includes('single-cpu'), 'index should contain system name');
