const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'test', 'example-data');

function gatherData() {
  const systems = fs.readdirSync(dataDir);
  const data = {};
  for (const sys of systems) {
    const benchmarks = fs.readdirSync(path.join(dataDir, sys));
    data[sys] = {};
    for (const bench of benchmarks) {
      const resultPath = path.join(dataDir, sys, bench, 'results.json');
      const json = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
      data[sys][bench] = json;
    }
  }
  return data;
}

function generateIndex(data) {
  let html = `<html><head><title>ZK Benchmarks</title>` +
             `<link rel="stylesheet" href="style.css"></head><body>` +
             `<h1>ZK Benchmarks</h1>`;
  for (const [sys, benches] of Object.entries(data)) {
    html += `<h2>${sys}</h2>`;
    html += `<table><tr><th>Benchmark</th>` +
            `<th>Compile mean</th><th>Prove mean</th>` +
            `<th>Verify mean</th></tr>`;
    for (const [bench, res] of Object.entries(benches)) {
      const b = res.benchmarking[0];
      html += `<tr><td>${bench}</td>` +
              `<td>${b.compile.mean}</td>` +
              `<td>${b.prove.mean}</td>` +
              `<td>${b.verify.mean}</td></tr>`;
    }
    html += `</table>`;
  }
  html += `</body></html>`;
  return html;
}

module.exports = { gatherData, generateIndex };
