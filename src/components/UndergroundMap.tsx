import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Station, Line, UndergroundData } from '../types/underground';
import { latLngToScreen, findNearestStation, clamp } from '../utils/mapUtils';
import undergroundData from '../data/underground-data.json';
import './UndergroundMap.css';

const typedData = undergroundData as UndergroundData;

export const UndergroundMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewport, setViewport] = useState({
    zoom: 1,
    offsetX: 0,
    offsetY: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredStation, setHoveredStation] = useState<Station | null>(null);
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set());
  const [showAllStations, setShowAllStations] = useState(true);

  // Draw the map
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up canvas dimensions
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Draw background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines for reference
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i <= height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Filter stations to display
    const stationsToShow = showAllStations 
      ? typedData.stations 
      : typedData.stations.filter(station => 
          selectedLines.size === 0 || 
          station.lines.some(line => selectedLines.has(line))
        );

    // Draw connections between stations (lines)
    if (selectedLines.size > 0) {
      selectedLines.forEach(lineId => {
        const line = typedData.lines.find(l => l.id === lineId);
        if (!line) return;

        ctx.strokeStyle = line.color;
        ctx.lineWidth = 3 * viewport.zoom;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw connections between consecutive stations
        for (let i = 0; i < line.stations.length - 1; i++) {
          const station1 = typedData.stations.find(s => s.id === line.stations[i]);
          const station2 = typedData.stations.find(s => s.id === line.stations[i + 1]);
          
          if (station1 && station2) {
            const p1 = latLngToScreen(
              station1.lat,
              station1.lng,
              typedData.bounds,
              width,
              height,
              viewport
            );
            const p2 = latLngToScreen(
              station2.lat,
              station2.lng,
              typedData.bounds,
              width,
              height,
              viewport
            );

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
    }

    // Draw stations
    stationsToShow.forEach(station => {
      const point = latLngToScreen(
        station.lat,
        station.lng,
        typedData.bounds,
        width,
        height,
        viewport
      );

      // Skip if point is outside viewport
      if (point.x < -20 || point.x > width + 20 || 
          point.y < -20 || point.y > height + 20) {
        return;
      }

      // Determine station color
      let stationColor = '#ffffff';
      let borderColor = '#333333';
      
      if (selectedLines.size > 0 && station.lines.some(line => selectedLines.has(line))) {
        const activeLine = station.lines.find(line => selectedLines.has(line));
        if (activeLine) {
          const lineData = typedData.lines.find(l => l.id === activeLine);
          if (lineData) {
            borderColor = lineData.color;
          }
        }
      }

      // Draw station circle
      ctx.beginPath();
      ctx.arc(point.x, point.y, 6 * Math.sqrt(viewport.zoom), 0, Math.PI * 2);
      ctx.fillStyle = stationColor;
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw interchange indicator if station has multiple lines
      if (station.lines.length > 1) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3 * Math.sqrt(viewport.zoom), 0, Math.PI * 2);
        ctx.fillStyle = borderColor;
        ctx.fill();
      }

      // Draw station name if zoomed in enough or if it's hovered
      if (viewport.zoom > 1.5 || station === hoveredStation) {
        ctx.fillStyle = '#333333';
        ctx.font = `${10 * Math.sqrt(viewport.zoom)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        // Add text background for readability
        const textMetrics = ctx.measureText(station.name);
        const textHeight = 12 * Math.sqrt(viewport.zoom);
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(
          point.x - textMetrics.width / 2 - 2,
          point.y - textHeight - 12,
          textMetrics.width + 4,
          textHeight + 4
        );
        
        ctx.fillStyle = '#333333';
        ctx.fillText(station.name, point.x, point.y - 8);
      }
    });

    // Draw hovered station highlight
    if (hoveredStation) {
      const point = latLngToScreen(
        hoveredStation.lat,
        hoveredStation.lng,
        typedData.bounds,
        width,
        height,
        viewport
      );

      ctx.beginPath();
      ctx.arc(point.x, point.y, 10 * Math.sqrt(viewport.zoom), 0, Math.PI * 2);
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [viewport, hoveredStation, selectedLines, showAllStations]);

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - viewport.offsetX, y: e.clientY - viewport.offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      setViewport(prev => ({
        ...prev,
        offsetX: e.clientX - dragStart.x,
        offsetY: e.clientY - dragStart.y
      }));
    } else {
      // Find nearest station for hover effect
      const nearest = findNearestStation(
        { x, y },
        typedData.stations,
        typedData.bounds,
        rect.width,
        rect.height,
        viewport
      );
      setHoveredStation(nearest);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = clamp(viewport.zoom * zoomFactor, 0.5, 5);

    // Zoom towards mouse position
    const zoomRatio = newZoom / viewport.zoom;
    const newOffsetX = x - (x - viewport.offsetX) * zoomRatio;
    const newOffsetY = y - (y - viewport.offsetY) * zoomRatio;

    setViewport({
      zoom: newZoom,
      offsetX: newOffsetX,
      offsetY: newOffsetY
    });
  };

  // Toggle line selection
  const toggleLine = (lineId: string) => {
    setSelectedLines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lineId)) {
        newSet.delete(lineId);
      } else {
        newSet.add(lineId);
      }
      return newSet;
    });
  };

  // Reset view
  const resetView = () => {
    setViewport({ zoom: 1, offsetX: 0, offsetY: 0 });
    setSelectedLines(new Set());
  };

  useEffect(() => {
    drawMap();
  }, [drawMap]);

  useEffect(() => {
    const handleResize = () => drawMap();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawMap]);

  return (
    <div className="underground-map-container">
      <div className="controls">
        <div className="controls-section">
          <h3>Lines</h3>
          <div className="line-buttons">
            {typedData.lines.map(line => (
              <button
                key={line.id}
                className={`line-button ${selectedLines.has(line.id) ? 'active' : ''}`}
                style={{
                  borderColor: line.color,
                  backgroundColor: selectedLines.has(line.id) ? line.color : 'transparent',
                  color: selectedLines.has(line.id) ? '#fff' : line.color
                }}
                onClick={() => toggleLine(line.id)}
              >
                {line.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="controls-section">
          <label>
            <input
              type="checkbox"
              checked={showAllStations}
              onChange={(e) => setShowAllStations(e.target.checked)}
            />
            Show all stations
          </label>
        </div>

        <div className="controls-section">
          <button onClick={resetView} className="reset-button">
            Reset View
          </button>
          <div className="zoom-controls">
            <button onClick={() => setViewport(v => ({ ...v, zoom: clamp(v.zoom * 1.2, 0.5, 5) }))}>
              Zoom In
            </button>
            <span>{Math.round(viewport.zoom * 100)}%</span>
            <button onClick={() => setViewport(v => ({ ...v, zoom: clamp(v.zoom * 0.8, 0.5, 5) }))}>
              Zoom Out
            </button>
          </div>
        </div>
        
        {hoveredStation && (
          <div className="station-info">
            <h4>{hoveredStation.name}</h4>
            <p>Lines: {hoveredStation.lines.join(', ')}</p>
            {hoveredStation.zone.length > 0 && (
              <p>Zone: {hoveredStation.zone.join(', ')}</p>
            )}
          </div>
        )}
      </div>
      
      <canvas
        ref={canvasRef}
        className="underground-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
    </div>
  );
};