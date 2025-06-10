import React, { useEffect, useState } from 'react';
import { Card } from '@blocksense/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@blocksense/ui/Table';
import { Badge } from '@blocksense/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@blocksense/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@blocksense/ui/Tabs';
import { AllData, MetricType } from '../types.ts';
import { TOOLCHAINS } from '../lib.ts';

interface BenchmarkTableProps {
  data: AllData;
  selectedSystem?: string;
  selectedMetric?: MetricType;
  onSystemChange?: (system: string) => void;
  onMetricChange?: (metric: MetricType) => void;
}

export function BenchmarkTable({ 
  data, 
  selectedSystem, 
    selectedMetric = 'compile',
  onSystemChange,
  onMetricChange: _onMetricChange 
}: BenchmarkTableProps) {
  const systems = Object.keys(data).sort();
  const currentSystem = selectedSystem || systems[0] || '';
  const systemData = currentSystem ? data[currentSystem] : undefined;
  
  const [activeMetric, setActiveMetric] = useState<MetricType>(selectedMetric);
  
  useEffect(() => {
    setActiveMetric(selectedMetric);
  }, [selectedMetric]);
  
  if (!systemData) {
    return <div>No data available</div>;
  }
  
  const formatDuration = (seconds: number): string => {
    if (seconds < 1) {
      return `${(seconds * 1000).toFixed(1)}ms`;
    } else if (seconds < 60) {
      return `${seconds.toFixed(2)}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
    }
  };
  
  const formatMemory = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <Select value={currentSystem} onValueChangeAction={onSystemChange || (() => {})}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select system" />
          </SelectTrigger>
          <SelectContent>
            {systems.map(system => (
              <SelectItem key={system} value={system}>
                {system.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Tabs defaultValue={activeMetric}>
          <TabsList>
            <TabsTrigger value="compile">Compile</TabsTrigger>
            <TabsTrigger value="prove">Prove</TabsTrigger>
            <TabsTrigger value="verify">Verify</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compile">
            {activeMetric === 'compile' && renderTable('compile')}
          </TabsContent>
          <TabsContent value="prove">
            {activeMetric === 'prove' && renderTable('prove')}
          </TabsContent>
          <TabsContent value="verify">
            {activeMetric === 'verify' && renderTable('verify')}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
  
  function renderTable(metric: MetricType) {
    if (!systemData) {
      return <div>No data available</div>;
    }
    
    const benchmarks = Object.keys(systemData).sort();
    
    return (
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Benchmark</TableHead>
              {TOOLCHAINS.map(toolchain => (
                <TableHead key={toolchain} className="text-center font-semibold">
                  <Badge variant="outline" className="font-mono text-xs">
                    {toolchain}
                  </Badge>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {benchmarks.map(benchmark => {
              const benchData = systemData[benchmark];
              return (
                <TableRow key={benchmark}>
                  <TableCell className="font-medium">
                    {benchmark.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </TableCell>
                  {TOOLCHAINS.map(toolchain => {
                    const entry = benchData?.[toolchain];
                    const metricData = entry?.benchmarks[0]?.[metric];
                    
                    if (!metricData) {
                      return (
                        <TableCell key={toolchain} className="text-center text-muted-foreground">
                          -
                        </TableCell>
                      );
                    }
                    
                    return (
                      <TableCell key={toolchain} className="text-center">
                        <div className="space-y-1">
                          <div className="font-mono text-sm">
                            {formatDuration(metricData.mean)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatMemory(metricData.memory)}
                          </div>
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    );
  }
}
