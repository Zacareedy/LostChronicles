import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '@/lib/audio';
import mapImage from '@assets/island_map_satellite.jpg';
import { MAP_SIGNAL_MARKERS, MAP_STATIONS } from '@/lib/mapCoordinates';
import { isPointInIsland } from '@/lib/islandBoundary';

// ─── Types ────────────────────────────────────────────────────────────────────

type WeatherState = 'clear' | 'fog' | 'rain' | 'storm';

interface SignalMarker {
  id: string;
  position: { top: string; left: string };
  coordinates: string;
  statusLabel: string;
  minClearance: number;
  weather?: WeatherState;
  timeWindow?: { min: number; max: number };
}

// ─── Signal marker definitions ────────────────────────────────────────────────

const SIGNAL_MARKERS: SignalMarker[] = [
  {
    id: 'swan-signal',
    position: { top: MAP_SIGNAL_MARKERS['swan-signal'].top, left: MAP_SIGNAL_MARKERS['swan-signal'].left },
    coordinates: 'N 4°815′ W 162°342′',
    statusLabel: 'UNVERIFIED NODE — ENTER COORDINATES TO CONFIRM',
    minClearance: 1,
  },
  {
    id: 'storm-cache',
    position: { top: MAP_SIGNAL_MARKERS['storm-cache'].top, left: MAP_SIGNAL_MARKERS['storm-cache'].left },
    coordinates: 'N 23°42′ W 108°15′',
    statusLabel: 'SIGNAL ANOMALY — METEOROLOGICAL INTERFERENCE',
    minClearance: 3,
    weather: 'storm',
  },
  {
    id: 'hatch-exterior',
    position: { top: MAP_SIGNAL_MARKERS['hatch-exterior'].top, left: MAP_SIGNAL_MARKERS['hatch-exterior'].left },
    coordinates: 'N 4°18′ W 16°342′',
    statusLabel: 'TRANSIENT SIGNAL — VERIFY IMMEDIATELY',
    minClearance: 4,
    timeWindow: { min: 6000, max: 6480 },
  },
];

// ─── Station reference markers (L5 / devmode only) ───────────────────────────

const STATION_MARKERS = Object.entries(MAP_STATIONS).map(([key, s]) => ({
  id: `station-${key}`,
  position: { top: `${s.top}%`, left: `${s.left}%` },
  label: s.name,
  dharmaCoords: s.dharmaCoords,
}));

// ─── Fog of war overlay ───────────────────────────────────────────────────────

interface FogZone {
  id: string;
  cx: number; // % of container
  cy: number;
  rx: number; // horizontal radius %
  ry: number; // vertical radius %
}

function buildFogZones(clearance: number, entityTracked: boolean): FogZone[] {
  const z: FogZone[] = [];
  // Always give a tiny seed reveal so the island shape is hinted
  z.push({ id: 'seed', cx: 42, cy: 55, rx: 6, ry: 5 });
  if (clearance >= 1) z.push({ id: 'swan', cx: 32.2, cy: 77.7, rx: 22, ry: 17 });
  if (entityTracked)  z.push({ id: 'entity', cx: 56, cy: 37, rx: 18, ry: 14 });
  if (clearance >= 3) z.push({ id: 'blackrock', cx: 63.9, cy: 27.1, rx: 17, ry: 13 });
  if (clearance >= 4) z.push({ id: 'north', cx: 44.1, cy: 21, rx: 22, ry: 17 });
  return z;
}

const FogOverlay: React.FC<{ clearance: number; entityTracked: boolean }> = ({
  clearance,
  entityTracked,
}) => {
  if (clearance >= 5) return null;

  const zones = buildFogZones(clearance, entityTracked);

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 3,
        overflow: 'visible',
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft-edge blur for reveal holes in the mask */}
        <filter id="fog-reveal-blur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="14" />
        </filter>

        {/* Animated turbulence displacement — makes fog edges look like drifting mist */}
        <filter id="fog-drift" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.020 0.013"
            numOctaves="4"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              values="0.020 0.013;0.026 0.017;0.020 0.013"
              dur="24s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="30"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Slower, larger-scale turbulence for the wisp layer */}
        <filter id="fog-wisp" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.010 0.007"
            numOctaves="3"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              values="0.010 0.007;0.015 0.010;0.010 0.007"
              dur="38s"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="45"
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feGaussianBlur stdDeviation="2" />
        </filter>

        {/* Mask: white = fog visible, black = terrain revealed */}
        <mask id="fog-mask">
          <rect width="100%" height="100%" fill="white" />
          {zones.map(z => (
            <ellipse
              key={z.id}
              cx={`${z.cx}%`}
              cy={`${z.cy}%`}
              rx={`${z.rx}%`}
              ry={`${z.ry}%`}
              fill="black"
              filter="url(#fog-reveal-blur)"
            />
          ))}
        </mask>
      </defs>

      {/* Primary deep-dark fog layer */}
      <rect
        width="100%"
        height="100%"
        fill="rgb(4, 9, 18)"
        opacity="0.89"
        mask="url(#fog-mask)"
        filter="url(#fog-drift)"
      />

      {/* Mid grey-blue mist — drifting slowly, creates the "foggy" texture at edges */}
      <rect
        width="100%"
        height="100%"
        fill="rgb(130, 158, 175)"
        opacity="0.16"
        mask="url(#fog-mask)"
        filter="url(#fog-wisp)"
      />

      {/* Light wisp highlight — softer, larger displacement for depth */}
      <rect
        width="100%"
        height="100%"
        fill="rgb(190, 210, 220)"
        opacity="0.08"
        mask="url(#fog-mask)"
        filter="url(#fog-wisp)"
      />
    </svg>
  );
};

// ─── Moving entity (L2→L3 puzzle) ────────────────────────────────────────────

function useEntityPosition(active: boolean) {
  // Start near Swan Station — guaranteed inside island boundary
  const [pos, setPos] = useState({ x: 36, y: 72 });
  const dirRef = useRef({ dx: 0.045, dy: 0.025 });

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setPos(prev => {
        const { dx, dy } = dirRef.current;
        const nx = prev.x + dx;
        const ny = prev.y + dy;

        if (isPointInIsland(nx, ny)) {
          return { x: nx, y: ny };
        }

        // Hit coastline — pick a random new heading and stay put this tick
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.hypot(dx, dy);
        dirRef.current = {
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
        };
        return prev;
      });
    }, 200);
    return () => clearInterval(id);
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

  const [weather, setWeather] = useState<WeatherState>('clear');

  const entityPos = useEntityPosition(clearance >= 2);
  const [entityVisited, setEntityVisited] = useState(() =>
    localStorage.getItem('dharma_entity_tracked') === 'true'
  );

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 5;

  // Weather cycle: writes to localStorage every ~90s
  useEffect(() => {
    const CYCLE: WeatherState[] = ['clear', 'clear', 'fog', 'clear', 'rain', 'clear', 'storm', 'clear'];
    let i = 0;
    if (!localStorage.getItem('dharma_weather_state')) {
      try { localStorage.setItem('dharma_weather_state', 'clear'); } catch {}
    }
    const id = setInterval(() => {
      i = (i + 1) % CYCLE.length;
      try { localStorage.setItem('dharma_weather_state', CYCLE[i]); } catch {}
    }, 90000);
    return () => clearInterval(id);
  }, []);

  // Poll localStorage every 2s — lets SETWEATHER terminal command take effect immediately
  useEffect(() => {
    const VALID: WeatherState[] = ['clear', 'fog', 'rain', 'storm'];
    const poll = setInterval(() => {
      const stored = localStorage.getItem('dharma_weather_state') as WeatherState | null;
      if (stored && VALID.includes(stored)) setWeather(stored);
    }, 2000);
    return () => clearInterval(poll);
  }, []);

  // Entity target zone: top≈38%, left≈55% — L2→L3 clue location
  useEffect(() => {
    if (clearance < 2 || entityVisited) return;
    const inZone = entityPos.x > 50 && entityPos.x < 62 && entityPos.y > 32 && entityPos.y < 44;
    if (inZone) {
      try { localStorage.setItem('dharma_entity_tracked', 'true'); } catch {}
      setEntityVisited(true);
      setMapStatus('ENTITY AT GRID REF — N 15°16′ W 23°42′ — LOG ENTRY GENERATED');
      playSound('beep', 'short');
      setTimeout(() => setMapStatus('SCANNING FOR SIGNALS...'), 45000);
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

  const masterAccess = clearance >= 5;

  const visibleMarkers = SIGNAL_MARKERS.filter(m => {
    if (clearance < m.minClearance) return false;
    if (m.weather && m.weather !== weather && !masterAccess) return false;
    if (m.timeWindow && !masterAccess) {
      const inWindow = timeRemaining >= m.timeWindow.min && timeRemaining <= m.timeWindow.max;
      if (!inWindow) return false;
    }
    return true;
  });

  const weatherOverlay: Record<WeatherState, string> = {
    clear: 'transparent',
    fog:   'rgba(160,185,160,0.35)',
    rain:  'rgba(40,60,110,0.45)',
    storm: 'rgba(5,5,30,0.65)',
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
          {/* Map image + markers + fog — all inside the zoom/pan transform */}
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

            {/* Fog of war — above image/weather, below markers and entity */}
            <FogOverlay clearance={clearance} entityTracked={entityVisited} />

            {/* Static signal markers (z-index 10, above fog) */}
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

            {/* Station reference markers (L5 / devmode) — amber dots */}
            {masterAccess && STATION_MARKERS.map(s => (
              <div
                key={s.id}
                className="absolute"
                style={{ top: s.position.top, left: s.position.left, transform: 'translate(-50%,-50%)', zIndex: 8 }}
                onMouseEnter={() => { setHoveredId(s.id); setCoordinates(s.dharmaCoords); setMapStatus(`STATION: ${s.label}`); }}
                onMouseLeave={markerLeave}
              >
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#ffaa00',
                  boxShadow: '0 0 4px #ffaa00, 0 0 10px #ffaa0055',
                  cursor: 'crosshair',
                  opacity: 0.8,
                }} />
              </div>
            ))}

            {/* Entity target zone — visible at L2+ until tracked */}
            {clearance >= 2 && !entityVisited && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: '50%',
                  top: '32%',
                  width: '12%',
                  height: '12%',
                  zIndex: 8,
                  border: '1px dashed rgba(255, 68, 68, 0.45)',
                  boxShadow: 'inset 0 0 12px rgba(255,68,68,0.08)',
                }}
              >
                <span style={{
                  position: 'absolute',
                  top: '-14px',
                  left: '0',
                  fontSize: '7px',
                  color: 'rgba(255,68,68,0.55)',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}>
                  GRID REF
                </span>
              </div>
            )}

            {/* Moving entity (clearance 2+) — z-index 9, always visible above fog */}
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
