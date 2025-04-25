import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { STATIONS } from '@/lib/constants';
import { playSound } from '@/lib/audio';
// Import actual map image
import plainIslandMap from '@/assets/island_maps/plain_lost_map.jpeg';

interface Station {
  name: string;
  code: string;
  description: string;
  coordinates: string;
  position: { top: string; left: string };
}

interface IslandMapProps {
  discoveredStations: string[];
  onStationClick: (stationName: string) => void;
}

const IslandMap: React.FC<IslandMapProps> = ({ discoveredStations, onStationClick }) => {
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState('--° --′ --″ N, --° --′ --″ W');
  const [mapStatus, setMapStatus] = useState('SCANNING FOR SIGNALS...');

  useEffect(() => {
    // Initial scan effect
    let scanInterval: NodeJS.Timeout;

    if (discoveredStations.length > 0) {
      scanInterval = setInterval(() => {
        const randomStation = discoveredStations[Math.floor(Math.random() * discoveredStations.length)];
        setMapStatus(`SIGNAL DETECTED: ${randomStation.toUpperCase()}`);
        setTimeout(() => {
          setMapStatus('SCANNING FOR SIGNALS...');
        }, 3000);
      }, 10000);
    }

    return () => {
      if (scanInterval) clearInterval(scanInterval);
    };
  }, [discoveredStations]);

  const handleStationHover = (stationName: string | null) => {
    if (stationName) {
      const station = STATIONS[stationName as keyof typeof STATIONS];
      setHoveredStation(stationName);
      setCoordinates(station.coordinates);
      setMapStatus(`STATION: ${station.name.toUpperCase()} (${station.code})`);
    } else {
      setHoveredStation(null);
      setCoordinates('--° --′ --″ N, --° --′ --″ W');
      setMapStatus(discoveredStations.length > 0 ? 'SCANNING FOR SIGNALS...' : 'NO SIGNALS DETECTED');
    }
  };

  const handleStationClick = (stationName: string) => {
    playSound('button');
    onStationClick(stationName);
  };

  // Create refs for map panning
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
  const [mapZoom, setMapZoom] = useState(1);
  const MIN_ZOOM = 1; // Prevent zooming out
  const MAX_ZOOM = 2.5; // Increased max zoom per user request

  // Get marker style based on station type
  const getMarkerStyle = (locationType: string) => {
    if (locationType === 'Shipwreck') {
      return {
        background: 'hsla(0, 70%, 40%, 0.8)',
        borderColor: '#fff',
        shape: 'square',
        content: '⚓'
      };
    } else if (locationType === 'Position') {
      return {
        background: 'hsla(200, 70%, 40%, 0.8)',
        borderColor: '#fff',
        shape: 'triangle',
        content: '📡'
      };
    } else {
      return {
        background: 'hsla(var(--dharma-amber),0.8)',
        borderColor: '#fff',
        shape: 'circle',
        content: locationType.replace('Station ', '')
      };
    }
  };

  // Handle map dragging
  const handleMapMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartDragPos({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newOffset = {
      x: e.clientX - startDragPos.x,
      y: e.clientY - startDragPos.y
    };
    setMapOffset(newOffset);
  };

  const handleMapMouseUp = () => {
    setIsDragging(false);
  };

  // Render marker based on style
  const renderMarker = (markerStyle: any) => {
    if (markerStyle.shape === 'circle') {
      return (
        <div 
          className="w-full h-full rounded-full flex items-center justify-center border-2 dharma-station-marker"
          style={{ 
            backgroundColor: markerStyle.background, 
            borderColor: markerStyle.borderColor 
          }}
        >
          <span className="text-black font-bold text-xs">
            {markerStyle.content}
          </span>
        </div>
      );
    }

    if (markerStyle.shape === 'square') {
      return (
        <div 
          className="w-full h-full rounded-sm flex items-center justify-center border-2 dharma-station-marker"
          style={{ 
            backgroundColor: markerStyle.background, 
            borderColor: markerStyle.borderColor 
          }}
        >
          <span className="text-white font-bold text-xs">
            {markerStyle.content}
          </span>
        </div>
      );
    }

    if (markerStyle.shape === 'triangle') {
      return (
        <div 
          className="w-full h-full rounded-sm flex items-center justify-center border-2 dharma-station-marker"
          style={{ 
            backgroundColor: markerStyle.background, 
            borderColor: markerStyle.borderColor,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        >
          <span className="text-white font-bold text-xs translate-y-2">
            {markerStyle.content}
          </span>
        </div>
      );
    }
  };

  // Handle map zoom
  const handleMapZoomIn = () => {
    if (mapZoom < MAX_ZOOM) {
      setMapZoom(prev => Math.min(MAX_ZOOM, prev + 0.1));
      playSound('beep', 'short');
    }
  };

  const handleMapZoomOut = () => {
    if (mapZoom > MIN_ZOOM) {
      setMapZoom(prev => Math.max(MIN_ZOOM, prev - 0.1));
      playSound('beep', 'short');
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="dharma-panel shadow-[0_0_15px_rgba(0,255,0,0.15)] relative before:content-[''] before:absolute before:inset-0 before:pointer-events-none before:z-50 before:bg-[var(--crt-overlay)]"
    >
      <div className="dharma-panel-header border-b-2 border-[hsla(var(--dharma-green),0.3)] bg-[hsla(var(--dharma-green),0.1)]">
        <h2 className="dharma-panel-title text-[hsl(var(--dharma-green))]">ISLAND MAP</h2>
        <div className="flex space-x-2">
          <button 
            onClick={handleMapZoomIn}
            className="w-6 h-6 flex items-center justify-center bg-[hsla(var(--dharma-gray),0.2)] text-[hsl(var(--dharma-green))] hover:bg-[hsla(var(--dharma-gray),0.3)]"
          >+</button>
          <button 
            onClick={handleMapZoomOut}
            className="w-6 h-6 flex items-center justify-center bg-[hsla(var(--dharma-gray),0.2)] text-[hsl(var(--dharma-green))] hover:bg-[hsla(var(--dharma-gray),0.3)]"
          >-</button>
        </div>
      </div>

      <div className="p-4 relative h-80">
        <div 
          className="absolute inset-0 m-2 rounded overflow-hidden border border-[hsla(var(--dharma-gray),0.3)] bg-black"
          ref={mapContainerRef}
          onMouseDown={handleMapMouseDown}
          onMouseMove={handleMapMouseMove}
          onMouseUp={handleMapMouseUp}
          onMouseLeave={handleMapMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Map container with panning/zooming */}
          <div className="relative w-full h-full overflow-hidden">
            <div 
              className="relative w-full h-full bg-black"
              style={{ 
                transform: `scale(${mapZoom})`,
                transformOrigin: 'center',
                transition: 'transform 0.3s ease'
              }}
            >
              {/* Island map image */}
              <div 
                className="relative w-full h-full bg-black"
                style={{ 
                  transform: `scale(${mapZoom}) translate(${mapOffset.x / mapZoom}px, ${mapOffset.y / mapZoom}px)`,
                  willChange: 'transform',
                  transformOrigin: 'center',
                }}
              >
                <img 
                  src={plainIslandMap} 
                  alt="LOST Island Map" 
                  className="w-full h-full object-contain"
                  style={{
                    filter: 'contrast(1.1) brightness(0.9)'
                  }}
                />

                {/* Station markers */}
                {Object.entries(STATIONS).map(([key, station]) => {
                  const isDiscovered = discoveredStations.includes(key);
                  const markerStyle = getMarkerStyle(station.code);

                  return (
                    <motion.div
                      key={key}
                      className={`absolute ${isDiscovered ? 'cursor-pointer' : ''}`}
                      style={{ 
                        top: station.position.top, 
                        left: station.position.left,
                        width: '32px',
                        height: '32px',
                        opacity: isDiscovered ? 1 : 0,
                        pointerEvents: isDiscovered ? 'auto' : 'none',
                        zIndex: 20,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: isDiscovered ? 1 : 0,
                        opacity: isDiscovered ? 1 : 0
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20
                      }}
                      whileHover={{ scale: 1.2 }}
                      onMouseEnter={() => handleStationHover(key)}
                      onMouseLeave={() => handleStationHover(null)}
                      onClick={() => handleStationClick(key)}
                    >
                      {renderMarker(markerStyle)}

                      {isDiscovered && hoveredStation === key && (
                        <div className="absolute whitespace-nowrap top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-black bg-opacity-80 text-xs rounded text-white z-50">
                          {station.name}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Scan line effect */}
              <div 
                className="absolute inset-0 z-10 animate-terminal-scan" 
                style={{ 
                  boxShadow: 'inset 0 0 10px rgba(227, 188, 77, 0.3)',
                }}
              ></div>

              {/* Mysterious fog overlay that partially clears based on discovered stations */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-[rgba(0,0,0,0.7)] to-[rgba(0,0,0,0.4)]"
                style={{ 
                  opacity: Math.max(0.9 - (discoveredStations.length * 0.15), 0.1),
                  transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`
                }}
              />

              {/* Grid patterns suggesting more locations */}
              <div 
                className="absolute inset-0 grid-pattern opacity-30"
                style={{ transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)` }}
              ></div>


              {/* Mysterious signal indicators for undiscovered stations */}
              {discoveredStations.length > 0 && discoveredStations.length < Object.keys(STATIONS).length && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{ transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)` }}
                >
                  {Object.entries(STATIONS)
                    .filter(([key]) => !discoveredStations.includes(key))
                    .map(([key, station], index) => (
                      <motion.div
                        key={`signal-${key}`}
                        className="absolute w-2 h-2 bg-[hsla(var(--dharma-amber),0.4)] rounded-full"
                        style={{ 
                          top: `calc(${station.position.top} + ${Math.sin(Date.now() * 0.001 + index) * 20}px)`, 
                          left: `calc(${station.position.left} + ${Math.cos(Date.now() * 0.001 + index) * 20}px)`,
                          zIndex: 15
                        }}
                        animate={{
                          opacity: [0, 0.7, 0],
                          scale: [0.2, 1.5, 0.2],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 3 + index,
                          repeatType: "loop",
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[hsla(var(--dharma-green),0.1)] p-2 text-xs font-mono border-t-2 border-[hsla(var(--dharma-green),0.3)]">
        <div className="text-[hsl(var(--dharma-green))] tracking-wide">
          {discoveredStations.length > 0 ? `COORDINATES: ${coordinates}` : 'COORDINATES: --° --′ --″ N, --° --′ --″ W'}
        </div>
        <div className="text-[hsl(var(--dharma-dim-green))]">
          {discoveredStations.length === 0 
            ? 'NO SIGNALS DETECTED' 
            : discoveredStations.length === Object.keys(STATIONS).length 
              ? 'ALL STATIONS LOCATED' 
              : mapStatus}
        </div>
      </div>
    </motion.section>
  );
};

export default IslandMap;