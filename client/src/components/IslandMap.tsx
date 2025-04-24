import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { STATIONS } from '@/lib/constants';
import { playSound } from '@/lib/audio';

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
      setMapStatus(`STATION: ${stationName.toUpperCase()}`);
    } else {
      setHoveredStation(null);
      setCoordinates('--° --′ --″ N, --° --′ --″ W');
      setMapStatus('SCANNING FOR SIGNALS...');
    }
  };

  const handleStationClick = (stationName: string) => {
    playSound('button');
    onStationClick(stationName);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-[hsl(var(--dharma-black))] border border-[hsla(var(--dharma-gray),0.3)] rounded-lg overflow-hidden"
    >
      <div className="bg-[hsla(var(--dharma-gray),0.2)] p-2">
        <h2 className="font-terminal text-[hsl(var(--dharma-amber))]">ISLAND MAP</h2>
      </div>
      
      <div className="p-4 relative h-72">
        <div className="absolute inset-0 m-4 rounded overflow-hidden border border-[hsla(var(--dharma-gray),0.3)]">
          {/* Add a more mysterious island map with fog overlay */}
          <div className="relative w-full h-full">
            <img 
              src="https://images.unsplash.com/photo-1533153900060-648d6009884a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="Island Map" 
              className="w-full h-full object-cover brightness-75 contrast-125"
            />
            
            {/* Mysterious fog overlay that partially clears based on discovered stations */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-[rgba(0,0,0,0.8)] to-[rgba(0,0,0,0.5)]"
              style={{ 
                opacity: Math.max(0.9 - (discoveredStations.length * 0.15), 0.1)
              }}
            />
            
            {/* Grid patterns suggesting more locations */}
            <div className="absolute inset-0 grid-pattern opacity-30"></div>
            
            {/* Map locations */}
            {Object.entries(STATIONS).map(([key, station]) => {
              const isDiscovered = discoveredStations.includes(key);
              
              return (
                <motion.div
                  key={key}
                  className={`map-location ${isDiscovered ? 'discovered' : 'undiscovered'}`}
                  style={{ 
                    top: station.position.top, 
                    left: station.position.left,
                    opacity: isDiscovered ? 1 : 0,
                    pointerEvents: isDiscovered ? 'auto' : 'none'
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
                />
              );
            })}
            
            {/* Mysterious signal indicators for undiscovered stations */}
            {discoveredStations.length > 0 && discoveredStations.length < Object.keys(STATIONS).length && (
              <div className="absolute inset-0 pointer-events-none">
                {Object.entries(STATIONS)
                  .filter(([key]) => !discoveredStations.includes(key))
                  .map(([key, station], index) => (
                    <motion.div
                      key={`signal-${key}`}
                      className="absolute w-2 h-2 bg-[hsla(var(--dharma-amber),0.4)] rounded-full"
                      style={{ 
                        top: `calc(${station.position.top} + ${Math.sin(Date.now() * 0.001 + index) * 20}px)`, 
                        left: `calc(${station.position.left} + ${Math.cos(Date.now() * 0.001 + index) * 20}px)`,
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
      
      <div className="bg-[hsla(var(--dharma-gray),0.1)] p-2 text-xs font-mono">
        <div className="text-[hsl(var(--dharma-amber))]">
          {discoveredStations.length > 0 ? `COORDINATES: ${coordinates}` : 'COORDINATES: --° --′ --″ N, --° --′ --″ W'}
        </div>
        <div className="text-[hsl(var(--dharma-gray))]">
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
