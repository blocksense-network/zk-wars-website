const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'test', 'example-data');
const toolchains = ['jolt', 'nexus', 'risc0', 'sp1', 'zkm', 'zkwasm'];

function gatherData() {
  const systems = fs.readdirSync(dataDir);
  const data = {};
  for (const sys of systems) {
    const benchRoot = path.join(dataDir, sys);
    const benchmarks = fs.readdirSync(benchRoot);
    data[sys] = {};
    for (const bench of benchmarks) {
      const benchDir = path.join(benchRoot, bench);
      const files = fs.readdirSync(benchDir).filter(f => f.endsWith('.json'));
      data[sys][bench] = {};
      for (const file of files) {
        const json = JSON.parse(fs.readFileSync(path.join(benchDir, file), 'utf8'));
        data[sys][bench][json.toolchain] = json;
      }
    }
  }
  return data;
}

function generateIndex(data) {
  let html =
    `<html><head><title>ZK Benchmarks</title>` +
    `<link rel="stylesheet" href="style.css"></head><body>` +
    `<h1>ZK Benchmarks</h1>`;
  for (const [sys, benches] of Object.entries(data)) {
    html += `<h2>${sys}</h2>`;
    html += `<table><tr><th>Benchmark</th>`;
    for (const t of toolchains) {
      html += `<th>${t} compile</th>`;
    }
    html += `</tr>`;
    for (const [bench, res] of Object.entries(benches)) {
      html += `<tr><td>${bench}</td>`;
      for (const t of toolchains) {
        const entry = res[t];
        if (entry) {
          const b = entry.benchmarks[0];
          html += `<td>${b.compile.mean}</td>`;
        } else {
          html += `<td>-</td>`;
        }
      }
      html += `</tr>`;
    }
    html += `</table>`;
  }
  html += `</body></html>`;
  return html;
}

module.exports = { gatherData, generateIndex };
