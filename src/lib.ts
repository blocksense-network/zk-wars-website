import fs from 'fs';
import path from 'path';
import { AllData, BenchmarkData, ToolchainName } from './types.ts';

const dataDir = path.join(process.cwd(), 'test', 'example-data');
export const TOOLCHAINS: ToolchainName[] = ['jolt', 'nexus', 'risc0', 'sp1', 'zkm', 'zkwasm'];

export function gatherData(): AllData {
  const systems = fs.readdirSync(dataDir);
  const data: AllData = {};
  
  for (const sys of systems) {
    const benchRoot = path.join(dataDir, sys);
    if (!fs.statSync(benchRoot).isDirectory()) continue;
    
    const benchmarks = fs.readdirSync(benchRoot);
    data[sys] = {};
    
    for (const bench of benchmarks) {
      const benchDir = path.join(benchRoot, bench);
      if (!fs.statSync(benchDir).isDirectory()) continue;
      
      const files = fs.readdirSync(benchDir).filter(f => f.endsWith('.json'));
      data[sys][bench] = {};
      
      for (const file of files) {
        try {
          const json: BenchmarkData = JSON.parse(
            fs.readFileSync(path.join(benchDir, file), 'utf8')
          );
          if (TOOLCHAINS.includes(json.toolchain)) {
            data[sys][bench][json.toolchain] = json;
          }
        } catch (error) {
          console.warn(`Error parsing ${file}:`, error);
        }
      }
    }
  }
  
  return data;
}

export function getSystems(data: AllData): string[] {
  return Object.keys(data).sort();
}

export function getBenchmarks(data: AllData): string[] {
  const benchmarks = new Set<string>();
  for (const system of Object.values(data)) {
    for (const benchmark of Object.keys(system)) {
      benchmarks.add(benchmark);
    }
  }
  return Array.from(benchmarks).sort();
}

export function getAvailableToolchains(
  data: AllData, 
  system?: string, 
  benchmark?: string
): ToolchainName[] {
  const toolchains = new Set<ToolchainName>();
  
  if (system && benchmark && data[system]?.[benchmark]) {
    return Object.keys(data[system][benchmark]) as ToolchainName[];
  }
  
  if (system && data[system]) {
    for (const benchData of Object.values(data[system])) {
      for (const toolchain of Object.keys(benchData)) {
        toolchains.add(toolchain as ToolchainName);
      }
    }
  } else {
    for (const systemData of Object.values(data)) {
      for (const benchData of Object.values(systemData)) {
        for (const toolchain of Object.keys(benchData)) {
          toolchains.add(toolchain as ToolchainName);
        }
      }
    }
  }
  
  return Array.from(toolchains).sort();
}
