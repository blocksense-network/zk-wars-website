import fs from 'fs';
import path from 'path';
import { gatherData } from './lib.ts';
import { generateReactHTML } from './document.tsx';
import { getProcessedCSS } from './css-processor.ts';

const outDir = path.join(process.cwd(), 'build');

// Clean and create output directory
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

console.log('Gathering benchmark data...');
const data = gatherData();

console.log('Processing CSS...');
const processedCSS = await getProcessedCSS();

console.log('Generating HTML...');
const reactHtml = await generateReactHTML(data, processedCSS);
fs.writeFileSync(path.join(outDir, 'index.html'), reactHtml);

console.log('Copying assets...');
// Copy CSS files
const srcDir = path.join(process.cwd(), 'src');
fs.copyFileSync(path.join(srcDir, 'style.css'), path.join(outDir, 'style.css'));

// Generate client-side bundle data
const clientData = {
  systems: Object.keys(data),
  benchmarks: Array.from(new Set(
    Object.values(data).flatMap(system => Object.keys(system))
  )).sort(),
  toolchains: ['jolt', 'nexus', 'risc0', 'sp1', 'zkm', 'zkwasm'],
  data: data
};

fs.writeFileSync(
  path.join(outDir, 'data.json'), 
  JSON.stringify(clientData, null, 2)
);

console.log(`✅ Build complete! Generated files in ${outDir}`);
console.log(`📊 Processed ${Object.keys(data).length} systems with ${clientData.benchmarks.length} benchmarks`);
