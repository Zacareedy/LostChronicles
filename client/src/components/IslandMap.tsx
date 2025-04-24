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
          <img 
            src="https://images.unsplash.com/photo-1533153900060-648d6009884a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
            alt="Island Map" 
            className="w-full h-full object-cover brightness-75 contrast-125"
          />
          
          {/* Map locations */}
          {Object.entries(STATIONS).map(([key, station]) => (
            <motion.div
              key={key}
              className={`map-location ${discoveredStations.includes(key) ? '' : 'hidden'}`}
              style={{ top: station.position.top, left: station.position.left }}
              title={station.name}
              initial={{ scale: 0 }}
              animate={{ scale: discoveredStations.includes(key) ? 1 : 0 }}
              whileHover={{ scale: 1.2 }}
              onMouseEnter={() => handleStationHover(key)}
              onMouseLeave={() => handleStationHover(null)}
              onClick={() => handleStationClick(key)}
            />
          ))}
        </div>
      </div>
      
      <div className="bg-[hsla(var(--dharma-gray),0.1)] p-2 text-xs font-mono">
        <div className="text-[hsl(var(--dharma-amber))]">COORDINATES: {coordinates}</div>
        <div className="text-[hsl(var(--dharma-gray))]">{mapStatus}</div>
      </div>
    </motion.section>
  );
};

export default IslandMap;
