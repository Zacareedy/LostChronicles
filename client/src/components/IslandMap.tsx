import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '@/lib/audio';
import mapImage from '@assets/final_lost_map.jpeg';

// ─── Types ────────────────────────────────────────────────────────────────────

type WeatherState = 'clear' | 'fog' | 'rain' | 'storm';

interface SignalMarker {
  id: string;
  position: { top: string; left: string };
  coordinates: string;
  statusLabel: string;
  minClearance: number;
  // weather: only shown during this weather state (undefined = always)
  weather?: WeatherState;
  // timeWindow: only shown when countdown seconds remaining is within [min, max]
  timeWindow?: { min: number; max: number };
}

// ─── Signal marker definitions ────────────────────────────────────────────────
// Each puzzle that uses the map adds its marker here.

const SIGNAL_MARKERS: SignalMarker[] = [
  // L1→L2: Coordinate entry puzzle — always visible
  {
    id: 'swan-signal',
    position: { top: '64%', left: '44%' },
    coordinates: 'N 4°815′ W 162°342′',
    statusLabel: 'UNVERIFIED NODE — ENTER COORDINATES TO CONFIRM',
    minClearance: 1,
  },

  // L2→L3: Entity tracking — visible when an entity marker is near (handled separately)
  // placeholder; the moving entity is rendered as its own element

  // L3→L4: Weather event — visible only during storm
  {
    id: 'storm-cache',
    position: { top: '28%', left: '61%' },
    coordinates: 'N 23°42′ W 108°15′',
    statusLabel: 'SIGNAL ANOMALY — METEOROLOGICAL INTERFERENCE',
    minClearance: 3,
    weather: 'storm',
  },

  // L4→L5: Time gate — visible only when countdown is in first 8 minutes (480–6480s window)
  {
    id: 'hatch-exterior',
    position: { top: '74%', left: '34%' },
    coordinates: 'N 4°18′ W 16°342′',
    statusLabel: 'TRANSIENT SIGNAL — VERIFY IMMEDIATELY',
    minClearance: 4,
    timeWindow: { min: 6000, max: 6480 }, // last 8 minutes of 108-min countdown
  },
];

// ─── Moving entity (L2→L3 puzzle) ────────────────────────────────────────────

function useEntityPosition(active: boolean) {
  const [pos, setPos] = useState({ x: 15, y: 55 }); // % across map
  const dirRef = useRef({ dx: 0.04, dy: 0.02 });
  const frameRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!active) return;
    frameRef.current = setInterval(() => {
      setPos(prev => {
        let { dx, dy } = dirRef.current;
        let nx = prev.x + dx;
        let ny = prev.y + dy;
        // Bounce off edges
        if (nx < 10 || nx > 85) { dx = -dx; nx = Math.max(10, Math.min(85, nx)); }
        if (ny < 15 || ny > 80) { dy = -dy; ny = Math.max(15, Math.min(80, ny)); }
        dirRef.current = { dx, dy };
        return { x: nx, y: ny };
      });
    }, 200);
    return () => clearInterval(frameRef.current);
  }, [active]);

  return pos;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface IslandMapProps {
  clearance: number;
  timeRemaining?: number;
}

const IslandMap: React.FC<IslandMapProps> = ({ clearance, timeRemaining = 9999 }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
  const [mapZoom, setMapZoom] = useState(1);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mapStatus, setMapStatus] = useState('SCANNING FOR SIGNALS...');
  const [coordinates, setCoordinates] = useState('--°--′ N  --°--′ W');

  // Weather cycles — used for L3→L4 storm puzzle
  const [weather, setWeather] = useState<WeatherState>('clear');

  // Entity active when clearance >= 2
  const entityPos = useEntityPosition(clearance >= 2);
  // Track whether entity has ever entered the target zone (L2→L3)
  const [entityVisited, setEntityVisited] = useState(() =>
    localStorage.getItem('dharma_entity_tracked') === 'true'
  );

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 2.5;

  // Weather cycle: changes every ~90 seconds; storm is rare
  useEffect(() => {
    const CYCLE: WeatherState[] = ['clear', 'clear', 'fog', 'clear', 'rain', 'clear', 'storm', 'clear'];
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % CYCLE.length;
      const next = CYCLE[i];
      setWeather(next);
      try { localStorage.setItem('dharma_weather_state', next); } catch {}
    }, 90000);
    // Write initial state
    try { localStorage.setItem('dharma_weather_state', 'clear'); } catch {}
    return () => clearInterval(id);
  }, []);

  // Entity target zone: top≈38%, left≈55% — L2→L3 clue location
  // When entity enters that zone, set flag and update status
  useEffect(() => {
    if (clearance < 2 || entityVisited) return;
    const inZone = entityPos.x > 50 && entityPos.x < 62 && entityPos.y > 32 && entityPos.y < 44;
    if (inZone) {
      try { localStorage.setItem('dharma_entity_tracked', 'true'); } catch {}
      setEntityVisited(true);
      setMapStatus('ENTITY AT GRID REF — N 15°16′ W 23°42′ — LOG ENTRY GENERATED');
      playSound('beep', 'short');
      setTimeout(() => setMapStatus('SCANNING FOR SIGNALS...'), 8000);
    }
  }, [entityPos, clearance, entityVisited]);

  const clampOffset = (offset: { x: number; y: number }, zoom: number) => {
    if (!mapContainerRef.current) return offset;
    const { clientWidth: w, clientHeight: h } = mapContainerRef.current;
    const maxX = (w * (zoom - 1)) / 2;
    const maxY = (h * (zoom - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, offset.x)),
      y: Math.max(-maxY, Math.min(maxY, offset.y)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartDragPos({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMapOffset(clampOffset({ x: e.clientX - startDragPos.x, y: e.clientY - startDragPos.y }, mapZoom));
  };

  const handleMouseUp = () => setIsDragging(false);

  const zoomIn = () => {
    if (mapZoom >= MAX_ZOOM) return;
    setMapZoom(z => Math.min(MAX_ZOOM, z + 0.15));
    playSound('beep', 'short');
  };

  const zoomOut = () => {
    const next = Math.max(MIN_ZOOM, mapZoom - 0.15);
    setMapZoom(next);
    setMapOffset(o => clampOffset(o, next));
    playSound('beep', 'short');
  };

  const markerEnter = (m: SignalMarker) => {
    setHoveredId(m.id);
    setCoordinates(m.coordinates);
    setMapStatus(m.statusLabel);
  };

  const markerLeave = () => {
    setHoveredId(null);
    setCoordinates('--°--′ N  --°--′ W');
    setMapStatus('SCANNING FOR SIGNALS...');
  };

  // Which static markers are currently visible
  const visibleMarkers = SIGNAL_MARKERS.filter(m => {
    if (clearance < m.minClearance) return false;
    if (m.weather && m.weather !== weather) return false;
    if (m.timeWindow) {
      const inWindow = timeRemaining >= m.timeWindow.min && timeRemaining <= m.timeWindow.max;
      if (!inWindow) return false;
    }
    return true;
  });

  // Weather tint overlay
  const weatherOverlay: Record<WeatherState, string> = {
    clear: 'transparent',
    fog:   'rgba(180,200,180,0.18)',
    rain:  'rgba(60,80,120,0.22)',
    storm: 'rgba(20,20,60,0.38)',
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="dharma-panel"
    >
      <div className="dharma-panel-header border-b border-[hsla(var(--dharma-gray),0.5)] flex justify-between items-center">
        <h2 className="dharma-panel-title tracking-[0.5em] text-sm">
          ISLAND SURVEY — SECTOR 7
          {weather !== 'clear' && (
            <span className="ml-3 text-[10px] opacity-60 tracking-widest">
              [{weather.toUpperCase()}]
            </span>
          )}
        </h2>
        <div className="flex gap-1">
          <button onClick={zoomIn}  className="w-6 h-6 flex items-center justify-center border border-[hsla(var(--dharma-green),0.4)] text-[hsl(var(--dharma-green))] hover:bg-[hsla(var(--dharma-green),0.1)] text-xs">+</button>
          <button onClick={zoomOut} className="w-6 h-6 flex items-center justify-center border border-[hsla(var(--dharma-green),0.4)] text-[hsl(var(--dharma-green))] hover:bg-[hsla(var(--dharma-green),0.1)] text-xs">−</button>
        </div>
      </div>

      {/* Map viewport */}
      <div className="relative" style={{ aspectRatio: '4/3' }}>
        <div
          ref={mapContainerRef}
          className="absolute inset-2 overflow-hidden border border-[hsla(var(--dharma-gray),0.3)] bg-black"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Map image + markers */}
          <div
            className="relative w-full h-full"
            style={{
              transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${mapZoom})`,
              transformOrigin: 'center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            <img
              src={mapImage}
              alt="Island survey"
              className="w-full h-full object-cover select-none pointer-events-none"
              style={{ filter: 'contrast(1.05) brightness(0.8) saturate(0.75)' }}
            />

            {/* Weather tint */}
            <div
              className="absolute inset-0 pointer-events-none transition-colors duration-[3000ms]"
              style={{ background: weatherOverlay[weather] }}
            />

            {/* Static signal markers */}
            {visibleMarkers.map(m => (
              <div
                key={m.id}
                className="absolute"
                style={{ top: m.position.top, left: m.position.left, transform: 'translate(-50%,-50%)', zIndex: 10 }}
                onMouseEnter={() => markerEnter(m)}
                onMouseLeave={markerLeave}
              >
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#33ff33',
                  boxShadow: '0 0 6px #33ff33, 0 0 14px #33ff3366',
                  cursor: 'crosshair',
                  animation: 'pulse 1.4s ease-in-out infinite',
                }} />
              </div>
            ))}

            {/* Moving entity (clearance 2+) */}
            {clearance >= 2 && (
              <div
                className="absolute pointer-events-none"
                style={{
                  top: `${entityPos.y}%`,
                  left: `${entityPos.x}%`,
                  transform: 'translate(-50%,-50%)',
                  zIndex: 9,
                }}
              >
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#ff4444',
                  boxShadow: '0 0 4px #ff4444, 0 0 10px #ff444466',
                  animation: 'pulse 0.8s ease-in-out infinite',
                }} />
              </div>
            )}
          </div>
        </div>

        {/* Scanlines */}
        <div
          className="absolute inset-2 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)',
          }}
        />
      </div>

      {/* Status bar */}
      <div className="px-3 pb-2 flex justify-between items-center font-terminal text-[10px] tracking-wider" style={{ color: '#33ff33', opacity: 0.85 }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[hsl(var(--dharma-green))] animate-pulse" />
          <span>{mapStatus}</span>
        </div>
        <div className="font-mono" style={{ opacity: hoveredId ? 1 : 0.35 }}>{coordinates}</div>
      </div>
    </motion.section>
  );
};

export default IslandMap;
