import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@blocksense/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@blocksense/ui/Select';
import { Tabs, TabsList, TabsTrigger } from '@blocksense/ui/Tabs';
import { Badge } from '@blocksense/ui/Badge';
import { AllData, MetricType } from '../types.ts';
import { TOOLCHAINS } from '../lib.ts';

interface PerformanceChartProps {
  data: AllData;
  selectedSystem?: string;
  selectedMetric?: MetricType;
  onSystemChange?: (system: string) => void;
  onMetricChange?: (metric: MetricType) => void;
}

// Simple bar chart component using CSS
function SimpleBarChart({ 
  data, 
  title 
}: { 
  data: Array<{ name: string; value: number; color: string }>; 
  title: string;
}) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-16 text-sm font-mono text-right">
                <Badge variant="outline" className="text-xs">
                  {item.name}
                </Badge>
              </div>
              <div className="flex-1 relative">
                <div 
                  className="h-6 rounded transition-all duration-300"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color,
                    minWidth: '2px'
                  }}
                />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <span className="text-xs font-mono text-muted-foreground">
                    {item.value < 1 
                      ? `${(item.value * 1000).toFixed(1)}ms`
                      : `${item.value.toFixed(2)}s`
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PerformanceChart({ 
  data, 
  selectedSystem, 
  selectedMetric = 'compile',
  onSystemChange,
  onMetricChange: _onMetricChange 
}: PerformanceChartProps) {
  const systems = Object.keys(data).sort();
  const currentSystem = selectedSystem || systems[0] || '';
  const systemData = currentSystem ? data[currentSystem] : undefined;
  
  if (!systemData) {
    return <div>No data available</div>;
  }
  
  const benchmarks = Object.keys(systemData).sort();
  
  // Color palette for toolchains
  const colors = {
    jolt: '#3b82f6',
    nexus: '#10b981', 
    risc0: '#f59e0b',
    sp1: '#ef4444',
    zkm: '#8b5cf6',
    zkwasm: '#06b6d4'
  };
  
  const generateChartData = (benchmarkName: string) => {
    const benchData = systemData[benchmarkName];
    if (!benchData) return [];
    
    return TOOLCHAINS
      .map(toolchain => {
        const entry = benchData[toolchain];
        const metric = entry?.benchmarks[0]?.[selectedMetric];
        
        if (!metric) return null;
        
        return {
          name: toolchain,
          value: metric.mean,
          color: colors[toolchain] || '#6b7280'
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.value - b.value);
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
        
        <Tabs defaultValue={selectedMetric}>
          <TabsList>
            <TabsTrigger value="compile">Compile</TabsTrigger>
            <TabsTrigger value="prove">Prove</TabsTrigger>
            <TabsTrigger value="verify">Verify</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {benchmarks.slice(0, 8).map(benchmark => {
          const chartData = generateChartData(benchmark);
          if (chartData.length === 0) return null;
          
          return (
            <SimpleBarChart
              key={benchmark}
              title={benchmark.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              data={chartData}
            />
          );
        })}
      </div>
      
      {benchmarks.length > 8 && (
        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            Showing first 8 benchmarks • {benchmarks.length - 8} more available
          </Badge>
        </div>
      )}
    </div>
  );
}
