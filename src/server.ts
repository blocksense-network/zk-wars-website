import express from 'express';
import { gatherData } from './lib.ts';
import { generateReactHTML } from './document.tsx';
import { getProcessedCSS } from './css-processor.ts';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Cache the data at startup
console.log('📊 Gathering benchmark data...');
const cachedData = gatherData();
console.log('✅ Benchmark data cached successfully');

// Initialize CSS processing
console.log('🎨 Processing CSS...');
getProcessedCSS().then(() => {
  console.log('✅ CSS processed and cached');
}).catch(error => {
  console.warn('⚠️  CSS processing failed:', error);
});

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// API endpoints
app.get('/api/data', (req, res) => {
  res.json(cachedData);
});

app.get('/data.json', (req, res) => {
  res.json(cachedData);
});

// Main page with inlined CSS
app.get('/', async (req, res) => {
  try {
    const css = await getProcessedCSS();
    const html = await generateReactHTML(cachedData, css);
    res.type('html').send(html);
  } catch (error) {
    console.error('Error generating page:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`🚀 ZK Wars Benchmark server running at http://localhost:${port}`);
  console.log(`📊 Serving benchmark data with React + Blocksense UI`);
});
