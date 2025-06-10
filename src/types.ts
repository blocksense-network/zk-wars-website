export interface BenchmarkRun {
  timeStarted: string;
  runs: number;
  totalDuration: number;
  mean: number;
  deviation: number;
  min: number;
  max: number;
  memory: number;
  size: number;
}

export interface Benchmark {
  name: string;
  compile: BenchmarkRun;
  prove: BenchmarkRun;
  verify: BenchmarkRun;
}

export interface HardwareSpec {
  cpu: Array<{
    model: string;
    cores: number;
    speed: number;
  }>;
  memory: {
    model: string;
    size: number;
    speed: number;
  };
  hardwareAcceleration: Array<{
    model: string;
    cores: number;
    speed: number;
  }>;
  accelerated: boolean;
}

export interface BenchmarkData {
  toolchain: ToolchainName;
  benchmarks: Benchmark[];
  hardware: HardwareSpec;
}

export type ToolchainName = 'jolt' | 'nexus' | 'risc0' | 'sp1' | 'zkm' | 'zkwasm';

export interface SystemData {
  [benchmarkName: string]: {
    [toolchain in ToolchainName]?: BenchmarkData;
  };
}

export interface AllData {
  [systemName: string]: SystemData;
}

export type MetricType = 'compile' | 'prove' | 'verify';
export type StatType = 'mean' | 'min' | 'max' | 'totalDuration';
