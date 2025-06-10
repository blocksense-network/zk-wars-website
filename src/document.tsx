import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App.tsx';
import { AllData } from './types.ts';

// This will be injected by the server
export async function generateReactHTML(data: AllData, inlinedCSS?: string): Promise<string> {
  const appHtml = renderToString(<App data={data} />);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZK Wars Benchmark Dashboard</title>
  <meta name="description" content="Comprehensive performance analysis of zero-knowledge proof systems">
  ${inlinedCSS ? `<style>${inlinedCSS}</style>` : ''}
  <script type="application/json" id="benchmark-data">${JSON.stringify(data)}</script>
</head>
<body>
  <div id="root">${appHtml}</div>
  <script type="module" src="client.js"></script>
</body>
</html>`;
}
