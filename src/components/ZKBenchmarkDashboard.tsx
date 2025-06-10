import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@blocksense/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@blocksense/ui/Tabs';
import { Badge } from '@blocksense/ui/Badge';
import { Separator } from '@blocksense/ui/Separator';
import { AllData, MetricType } from '../types.ts';
import { BenchmarkTable } from './BenchmarkTable.tsx';
import { PerformanceChart } from './PerformanceChart.tsx';

interface ZKBenchmarkDashboardProps {
  data: AllData;
}

export function ZKBenchmarkDashboard({ data }: ZKBenchmarkDashboardProps) {
  const [selectedSystem, setSelectedSystem] = useState<string>();
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('compile');
  
  const systems = Object.keys(data).sort();
  const totalBenchmarks = new Set(
    Object.values(data).flatMap(system => Object.keys(system))
  ).size;
  const totalToolchains = new Set(
    Object.values(data)
      .flatMap(system => Object.values(system))
      .flatMap(benchmark => Object.keys(benchmark))
  ).size;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            ZK Wars Benchmark Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive performance analysis of zero-knowledge proof systems
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Systems</CardTitle>
              <Badge variant="outline">{systems.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systems.length}</div>
              <p className="text-xs text-muted-foreground">
                Hardware configurations tested
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Benchmarks</CardTitle>
              <Badge variant="outline">{totalBenchmarks}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBenchmarks}</div>
              <p className="text-xs text-muted-foreground">
                Cryptographic operations tested
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toolchains</CardTitle>
              <Badge variant="outline">{totalToolchains}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalToolchains}</div>
              <p className="text-xs text-muted-foreground">
                ZK frameworks evaluated
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="table">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="table">Data Table</TabsTrigger>
            <TabsTrigger value="charts">Performance Charts</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <BenchmarkTable
              data={data}
              selectedSystem={selectedSystem}
              selectedMetric={selectedMetric}
              onSystemChange={setSelectedSystem}
              onMetricChange={setSelectedMetric}
            />
          </TabsContent>

          <TabsContent value="charts">
            <PerformanceChart
              data={data}
              selectedSystem={selectedSystem}
              selectedMetric={selectedMetric}
              onSystemChange={setSelectedSystem}
              onMetricChange={setSelectedMetric}
            />
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />

        <footer className="text-center text-sm text-muted-foreground">
          <p>
            ZK Wars Benchmark Dashboard • Built with{' '}
            <Badge variant="outline" className="text-xs">
              Blocksense UI
            </Badge>
          </p>
        </footer>
      </div>
    </div>
  );
}
