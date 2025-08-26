/**
 * London Underground Routing Service
 * Finds optimal routes between stations including line changes
 */

import { Station } from '../types/underground';
import undergroundData from '../data/underground-data.json';
import { lineConnections } from '../data/line-connections';

export interface RouteSegment {
  line: string;
  color: string;
  stations: string[];
  stationDetails: Station[];
}

export interface Route {
  from: string;
  to: string;
  segments: RouteSegment[];
  totalStations: number;
  changes: number;
  estimatedTime: number; // in minutes
}

interface GraphNode {
  station: string;
  line: string;
  distance: number;
  previous: GraphNode | null;
  visited: boolean;
}

// Build adjacency graph for the underground network
class UndergroundGraph {
  private adjacencyList: Map<string, Set<string>>;
  private stationLines: Map<string, Set<string>>;
  private lineColors: Map<string, string>;
  
  constructor() {
    this.adjacencyList = new Map();
    this.stationLines = new Map();
    this.lineColors = new Map([
      ['bakerloo', '#894E24'],
      ['central', '#DC241F'],
      ['circle', '#FFCE00'],
      ['district', '#007229'],
      ['hammersmith-city', '#EC9BAD'],
      ['jubilee', '#6C7278'],
      ['metropolitan', '#751056'],
      ['northern', '#000000'],
      ['piccadilly', '#0019A8'],
      ['victoria', '#00A0E2'],
      ['waterloo-city', '#76D0BD'],
      ['dlr', '#00AFAD'],
      ['elizabeth', '#60399E']
    ]);
    
    this.buildGraph();
  }
  
  private buildGraph() {
    // Build station connections and line associations
    Object.entries(lineConnections).forEach(([lineName, branches]) => {
      branches.forEach(branch => {
        for (let i = 0; i < branch.length; i++) {
          const station = branch[i];
          
          // Initialize station in adjacency list
          if (!this.adjacencyList.has(station)) {
            this.adjacencyList.set(station, new Set());
          }
          
          // Track which lines serve this station
          if (!this.stationLines.has(station)) {
            this.stationLines.set(station, new Set());
          }
          this.stationLines.get(station)!.add(lineName);
          
          // Add bidirectional connections
          if (i > 0) {
            const prevStation = branch[i - 1];
            this.adjacencyList.get(station)!.add(prevStation);
            
            if (!this.adjacencyList.has(prevStation)) {
              this.adjacencyList.set(prevStation, new Set());
            }
            this.adjacencyList.get(prevStation)!.add(station);
          }
        }
      });
    });
  }
  
  // Find all lines that connect two adjacent stations
  private getConnectionLines(station1: string, station2: string): Set<string> {
    const lines = new Set<string>();
    
    Object.entries(lineConnections).forEach(([lineName, branches]) => {
      branches.forEach(branch => {
        for (let i = 0; i < branch.length - 1; i++) {
          if ((branch[i] === station1 && branch[i + 1] === station2) ||
              (branch[i] === station2 && branch[i + 1] === station1)) {
            lines.add(lineName);
          }
        }
      });
    });
    
    return lines;
  }
  
  // Dijkstra's algorithm with line change penalty
  findShortestRoute(fromStation: string, toStation: string): Route | null {
    // Validate stations exist
    if (!this.adjacencyList.has(fromStation) || !this.adjacencyList.has(toStation)) {
      return null;
    }
    
    if (fromStation === toStation) {
      return {
        from: fromStation,
        to: toStation,
        segments: [],
        totalStations: 0,
        changes: 0,
        estimatedTime: 0
      };
    }
    
    // Priority queue for Dijkstra's algorithm
    const nodes: Map<string, GraphNode> = new Map();
    const unvisited: Set<string> = new Set();
    
    // Initialize all nodes
    this.adjacencyList.forEach((_, station) => {
      const node: GraphNode = {
        station,
        line: '',
        distance: station === fromStation ? 0 : Infinity,
        previous: null,
        visited: false
      };
      nodes.set(station, node);
      unvisited.add(station);
    });
    
    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let currentNode: GraphNode | null = null;
      let minDistance = Infinity;
      
      unvisited.forEach(station => {
        const node = nodes.get(station)!;
        if (node.distance < minDistance) {
          minDistance = node.distance;
          currentNode = node;
        }
      });
      
      if (!currentNode || currentNode.distance === Infinity) {
        break;
      }
      
      // Check if we reached destination
      if (currentNode.station === toStation) {
        break;
      }
      
      // Mark as visited
      currentNode.visited = true;
      unvisited.delete(currentNode.station);
      
      // Update distances to neighbors
      const neighbors = this.adjacencyList.get(currentNode.station)!;
      neighbors.forEach(neighbor => {
        const neighborNode = nodes.get(neighbor)!;
        if (!neighborNode.visited) {
          // Base cost is 1 for moving to adjacent station
          let newDistance = currentNode!.distance + 1;
          
          // Add penalty for line changes (equivalent to 3 stations)
          if (currentNode!.previous) {
            const currentLines = this.getConnectionLines(
              currentNode!.previous.station,
              currentNode!.station
            );
            const nextLines = this.getConnectionLines(
              currentNode!.station,
              neighbor
            );
            
            // Check if we need to change lines
            const commonLines = new Set([...currentLines].filter(x => nextLines.has(x)));
            if (commonLines.size === 0) {
              newDistance += 3; // Penalty for changing lines
            }
          }
          
          if (newDistance < neighborNode.distance) {
            neighborNode.distance = newDistance;
            neighborNode.previous = currentNode;
          }
        }
      });
    }
    
    // Reconstruct path
    const destinationNode = nodes.get(toStation);
    if (!destinationNode || !destinationNode.previous) {
      return null;
    }
    
    // Build path from destination to source
    const path: string[] = [];
    let current: GraphNode | null = destinationNode;
    
    while (current) {
      path.unshift(current.station);
      current = current.previous;
    }
    
    // Convert path to route segments
    return this.buildRouteSegments(path);
  }
  
  private buildRouteSegments(path: string[]): Route {
    if (path.length === 0) {
      return {
        from: '',
        to: '',
        segments: [],
        totalStations: 0,
        changes: 0,
        estimatedTime: 0
      };
    }
    
    const segments: RouteSegment[] = [];
    let currentSegment: RouteSegment | null = null;
    let currentLine: string | null = null;
    
    for (let i = 0; i < path.length - 1; i++) {
      const station = path[i];
      const nextStation = path[i + 1];
      const connectionLines = this.getConnectionLines(station, nextStation);
      
      // Choose the best line (prefer current line if available)
      let selectedLine: string;
      if (currentLine && connectionLines.has(currentLine)) {
        selectedLine = currentLine;
      } else {
        selectedLine = Array.from(connectionLines)[0];
      }
      
      // Check if we need to start a new segment
      if (selectedLine !== currentLine) {
        if (currentSegment) {
          currentSegment.stations.push(station);
          segments.push(currentSegment);
        }
        
        currentSegment = {
          line: selectedLine,
          color: this.lineColors.get(selectedLine) || '#999999',
          stations: [station],
          stationDetails: []
        };
        currentLine = selectedLine;
      } else if (currentSegment) {
        currentSegment.stations.push(station);
      }
    }
    
    // Add the last station
    if (currentSegment && path.length > 0) {
      currentSegment.stations.push(path[path.length - 1]);
      segments.push(currentSegment);
    }
    
    // Add station details
    const stationMap = new Map(
      undergroundData.stations.map(s => [s.id, s])
    );
    
    segments.forEach(segment => {
      segment.stationDetails = segment.stations
        .map(id => stationMap.get(id))
        .filter(s => s !== undefined) as Station[];
    });
    
    // Calculate summary statistics
    const totalStations = path.length;
    const changes = Math.max(0, segments.length - 1);
    const estimatedTime = (totalStations - 1) * 2 + changes * 3; // 2 min per station, 3 min per change
    
    return {
      from: path[0],
      to: path[path.length - 1],
      segments,
      totalStations,
      changes,
      estimatedTime
    };
  }
  
  // Get interchange stations (stations served by multiple lines)
  getInterchangeStations(): Map<string, string[]> {
    const interchanges = new Map<string, string[]>();
    
    this.stationLines.forEach((lines, station) => {
      if (lines.size > 1) {
        interchanges.set(station, Array.from(lines));
      }
    });
    
    return interchanges;
  }
}

// Singleton instance
let graphInstance: UndergroundGraph | null = null;

export function getUndergroundGraph(): UndergroundGraph {
  if (!graphInstance) {
    graphInstance = new UndergroundGraph();
  }
  return graphInstance;
}

export function findRoute(fromStation: string, toStation: string): Route | null {
  const graph = getUndergroundGraph();
  return graph.findShortestRoute(fromStation, toStation);
}

export function getInterchanges(): Map<string, string[]> {
  const graph = getUndergroundGraph();
  return graph.getInterchangeStations();
}