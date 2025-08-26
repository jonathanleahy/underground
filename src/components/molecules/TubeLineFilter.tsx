import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TubeLine {
  id: string;
  name: string;
  color: string;
  stations?: number;
}

interface TubeLineFilterProps {
  lines: TubeLine[];
  selectedLines: Set<string>;
  onLineToggle: (lineId: string) => void;
  variant?: 'list' | 'chips' | 'grid';
  showStationCount?: boolean;
  className?: string;
}

export const TubeLineFilter: React.FC<TubeLineFilterProps> = ({
  lines,
  selectedLines,
  onLineToggle,
  variant = 'list',
  showStationCount = false,
  className,
}) => {
  if (variant === 'chips') {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {lines.map((line) => (
          <Badge
            key={line.id}
            variant={selectedLines.has(line.id) ? "default" : "outline"}
            className="cursor-pointer transition-all hover:scale-105"
            style={{
              backgroundColor: selectedLines.has(line.id) ? line.color : undefined,
              borderColor: line.color,
              color: selectedLines.has(line.id) ? 'white' : line.color,
            }}
            onClick={() => onLineToggle(line.id)}
          >
            <div
              className="w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: selectedLines.has(line.id) ? 'white' : line.color }}
            />
            {line.name}
            {showStationCount && line.stations && (
              <span className="ml-1 opacity-80">({line.stations})</span>
            )}
          </Badge>
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={cn("grid grid-cols-2 gap-2", className)}>
        {lines.map((line) => (
          <div
            key={line.id}
            className={cn(
              "p-2 rounded-lg border cursor-pointer transition-all",
              selectedLines.has(line.id)
                ? "border-2 bg-gray-50"
                : "border hover:bg-gray-50"
            )}
            style={{
              borderColor: selectedLines.has(line.id) ? line.color : undefined,
            }}
            onClick={() => onLineToggle(line.id)}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: line.color }}
              />
              <span className="text-sm font-medium">{line.name}</span>
            </div>
            {showStationCount && line.stations && (
              <span className="text-xs text-gray-500 ml-5">
                {line.stations} stations
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Default list variant
  return (
    <div className={cn("space-y-3", className)}>
      {lines.map((line) => (
        <div key={line.id} className="flex items-center justify-between">
          <Label
            htmlFor={`line-${line.id}`}
            className="flex items-center gap-3 cursor-pointer flex-1"
          >
            <div
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: line.color }}
            />
            <div className="flex-1">
              <span className="font-medium">{line.name} Line</span>
              {showStationCount && line.stations && (
                <span className="text-xs text-gray-500 ml-2">
                  {line.stations} stations
                </span>
              )}
            </div>
          </Label>
          <Switch
            id={`line-${line.id}`}
            checked={selectedLines.has(line.id)}
            onCheckedChange={() => onLineToggle(line.id)}
            className="data-[state=checked]:bg-indigo-600"
          />
        </div>
      ))}
    </div>
  );
};