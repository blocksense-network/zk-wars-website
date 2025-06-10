import { readFileSync } from 'fs';
import { join } from 'path';
import postcss from 'postcss';
import postcssImport from 'postcss-import';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// Cache the processed CSS to avoid reprocessing
let processedCSS: string | null = null;

/**
 * Process CSS using PostCSS with Tailwind, autoprefixer, and import resolution.
 * Results are cached to avoid reprocessing on subsequent calls.
 */
export async function getProcessedCSS(): Promise<string> {
  if (processedCSS) return processedCSS;
  
  // Use the main CSS entry point - single source of truth
  const mainCSS = readFileSync(join(process.cwd(), 'src/main.css'), 'utf-8');
  
  // Standard PostCSS processing using project configuration files
  const plugins = [
    postcssImport(), // Resolves @import statements
    tailwindcss(),   // Uses tailwind.config.js
    autoprefixer()   // Uses browserslist config
  ];
  
  const result = await postcss(plugins).process(mainCSS, {
    from: join(process.cwd(), 'src/main.css'),
    to: undefined
  });
  
  processedCSS = result.css;
  return processedCSS;
}

/**
 * Clear the CSS cache. Useful for development or when CSS needs to be reprocessed.
 */
export function clearCSSCache(): void {
  processedCSS = null;
}
