import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';

// Get the benchmark data from the script tag
const dataElement = document.getElementById('benchmark-data');
const data = dataElement ? JSON.parse(dataElement.textContent || '{}') : {};

// Hydrate the React app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App data={data} />);
}
