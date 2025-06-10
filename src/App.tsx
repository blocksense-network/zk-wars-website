import React from 'react';
import { ZKBenchmarkDashboard } from './components/ZKBenchmarkDashboard.tsx';
import { AllData } from './types.ts';

interface AppProps {
  data: AllData;
}

export function App({ data }: AppProps) {
  return <ZKBenchmarkDashboard data={data} />;
}
