import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { STATIONS } from '@/lib/constants';
import { playSound } from '@/lib/audio';
import { DharmaLogos } from '@/assets/dharma-logos';
// Import actual map image
import plainIslandMap from '@/assets/island_maps/plain_lost_map.jpeg';
// Add scanline effect specifically for the map
import '@/styles/map-effects.css';

interface Station {
  name: string;
  code: string;
  description: string;
  coordinates: string;
  position: { top: string; left: string };
}

interface Coordinate {
  lat: string;
  long: string;
  description: string;
}

interface HiddenLocation {
  id: string;
  name: string;
  description: string;
  coordinates: string;
  position: { top: string; left: string };
  discoveryMethod: 'coordinates' | 'puzzle' | 'time' | 'weather';
  discoveryRequirement: string;
  isDiscovered: boolean;
}

interface IslandMapProps {
  discoveredStations: string[];
  onStationClick: (stationName: string) => void;
  onSecretDiscovery?: (secretId: string) => void;
}

const HIDDEN_LOCATIONS = [
  {
    id: 'crash-site',
    name: 'Flight 815 Crash Site',
    description: 'Location where the fuselage of Oceanic 815 crashed',
    coordinates: '23° 4′ 20″ N, 16° 53′ 42″ W',
    position: { top: '58%', left: '27%' },
    discoveryMethod: 'puzzle' as const,
    discoveryRequirement: 'radio',
    isDiscovered: false
  },
  {
    id: 'caves',
    name: 'The Caves',
    description: 'Fresh water source and temporary shelter',
    coordinates: '15° 33′ 42″ N, 12° 14′ 8″ W',
    position: { top: '33%', left: '32%' },
    discoveryMethod: 'coordinates' as const,
    discoveryRequirement: '15.33N, 12.14W',
    isDiscovered: false
  },
  {
    id: 'radio-tower',
    name: 'Radio Tower',
    description: 'Source of Rousseau\'s transmission',
    coordinates: '42° 33′ 15″ N, 15° 8′ 4″ W',
    position: { top: '18%', left: '72%' },
    discoveryMethod: 'puzzle' as const,
    discoveryRequirement: 'radio',
    isDiscovered: false
  },
  {
    id: 'hatch-exterior',
    name: 'The Hatch Exterior',
    description: 'Original entrance to the Swan Station',
    coordinates: '4° 18′ 15″ N, 16° 53′ 42″ W',
    position: { top: '74%', left: '30%' },
    discoveryMethod: 'time' as const,
    discoveryRequirement: '108',
    isDiscovered: false
  },
  {
    id: 'lighthouse',
    name: 'The Lighthouse',
    description: 'Jacob\'s lighthouse with the mirrored signal beacon',
    coordinates: '23° 42′ 8″ N, 42° 15′ 16″ W',
    position: { top: '22%', left: '85%' },
    discoveryMethod: 'weather' as const,
    discoveryRequirement: 'storm',
    isDiscovered: false
  }
];

// Weather states
type WeatherState = 'clear' | 'fog' | 'rain' | 'storm';

const IslandMap: React.FC<IslandMapProps> = ({ discoveredStations, onStationClick, onSecretDiscovery }) => {
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState('--° --′ --″ N, --° --′ --″ W');
  const [mapStatus, setMapStatus] = useState('SCANNING FOR SIGNALS...');

  // New state for enhanced map features
  const [hiddenLocations, setHiddenLocations] = useState(HIDDEN_LOCATIONS);
  const [currentWeather, setCurrentWeather] = useState<WeatherState>('clear');
  const [showCoordinateGrid, setShowCoordinateGrid] = useState(false);
  const [flashingSignals, setFlashingSignals] = useState<string[]>([]);
  const [timePhase, setTimePhase] = useState(0); // 0-107 minutes
  const [mapEntities, setMapEntities] = useState<{id: string, position: {top: string, left: string}, isTracked: boolean}[]>([]);
  const [targetCoordinates, setTargetCoordinates] = useState<{lat: string, long: string} | null>(null);

  // Check for newly unlocked locations based on puzzle completions
  useEffect(() => {
    try {
      // Check if radio puzzle was completed
      const radioPuzzleCompleted = localStorage.getItem('dharma_radio_puzzle_completed') === 'true';

      if (radioPuzzleCompleted) {
        // Update crash site and radio tower locations
        setHiddenLocations(prev => 
          prev.map(loc => {
            if ((loc.id === 'crash-site' || loc.id === 'radio-tower') && 
                loc.discoveryMethod === 'puzzle' && 
                loc.discoveryRequirement === 'radio') {

              // Play discovery sound for newly discovered locations
              if (!loc.isDiscovered) {
                playSound('success');

                // Special handling for crash site
                if (loc.id === 'crash-site') {
                  setMapStatus('ALERT: Aircraft wreckage detected');
                  setTimeout(() => setMapStatus('SCANNING FOR SIGNALS...'), 5000);
                }
              }

              return { ...loc, isDiscovered: true };
            }
            return loc;
          })
        );
      }
    } catch (e) {
      console.error('Error checking for puzzle completions:', e);
    }
  }, []);

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
    playSound('click');
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

  // Render station marker with DHARMA logo
  const renderMarker = (stationKey: string, markerStyle: any) => {
    // Use station-specific DHARMA logo if it's a station
    if (Object.keys(STATIONS).includes(stationKey)) {
      // Map station key to logo variant
      const stationToLogo: Record<string, string> = {
        'swan': 'swan',
        'pearl': 'pearl',
        'flame': 'flame',
        'arrow': 'arrow',
        'staff': 'staff',
        'orchid': 'orchid',
        'hydra': 'dharma', // Use default for hydra
        'lookingGlass': 'dharma', // Use default for looking glass
      };

      // Get the logo variant for this station
      const logoVariant = stationToLogo[stationKey] || 'dharma';

      return (
        <div className="w-full h-full flex items-center justify-center dharma-station-marker 
                        bg-black bg-opacity-60 rounded-full border-2 border-[hsl(var(--dharma-amber))]">
          {DharmaLogos[logoVariant as keyof typeof DharmaLogos]({ className: "w-full h-full p-0.5" })}
        </div>
      );
    }

    // Fallback to original marker types for non-stations
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

  // Handle map zoom with grid coordinates visibility
  const handleMapZoomIn = () => {
    if (mapZoom < MAX_ZOOM) {
      setMapZoom(prev => Math.min(MAX_ZOOM, prev + 0.1));
      playSound('beep', 'short');

      // Show coordinate grid when zoomed in past a certain threshold
      if (mapZoom >= 1.5 && !showCoordinateGrid) {
        setShowCoordinateGrid(true);
      }
    }
  };

  const handleMapZoomOut = () => {
    if (mapZoom > MIN_ZOOM) {
      setMapZoom(prev => Math.max(MIN_ZOOM, prev - 0.1));
      playSound('beep', 'short');

      // Hide coordinate grid when zoomed out
      if (mapZoom < 1.5 && showCoordinateGrid) {
        setShowCoordinateGrid(false);
      }
    }
  };

  // Handle weather changes
  useEffect(() => {
    // Random weather changes
    const weatherInterval = setInterval(() => {
      const weatherOptions: WeatherState[] = ['clear', 'fog', 'rain', 'storm'];
      const randomWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];

      // More likely to be clear weather
      if (Math.random() < 0.7 && randomWeather !== 'clear') {
        setCurrentWeather('clear');
      } else {
        setCurrentWeather(randomWeather);

        // Show notification about weather change
        setMapStatus(`WEATHER UPDATE: ${randomWeather.toUpperCase()}`);
        setTimeout(() => {
          setMapStatus('SCANNING FOR SIGNALS...');
        }, 3000);
      }
    }, 120000); // Every 2 minutes

    return () => clearInterval(weatherInterval);
  }, []);

  // Handle time-based events (108-minute cycle)
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setTimePhase(prev => (prev + 1) % 108);

      // Special events at certain time intervals
      if (timePhase === 107) {
        // End of cycle
        setFlashingSignals(['swan']);
        setTimeout(() => setFlashingSignals([]), 5000);
      } else if (timePhase % 27 === 0) {
        // Every 27 minutes
        setMapStatus('PROTOCOL WARNING: SYSTEM CHECK REQUIRED');
        setTimeout(() => setMapStatus('SCANNING FOR SIGNALS...'), 5000);
      }
    }, 60000); // Update every minute, simulating the countdown

    return () => clearInterval(timeInterval);
  }, [timePhase]);

  // Initialize moving entities
  useEffect(() => {
    // Create initial entities
    setMapEntities([
      {
        id: 'entity-001',
        position: { top: '45%', left: '30%' },
        isTracked: false
      },
      {
        id: 'entity-004', // Radinsky entity
        position: { top: '60%', left: '40%' },
        isTracked: false
      }
    ]);

    // Move entities randomly
    const entityInterval = setInterval(() => {
      setMapEntities(prev => prev.map(entity => {
        // Don't move tracked entities - they follow a predetermined path
        if (entity.isTracked) return entity;

        // Random movement
        const currentTop = parseInt(entity.position.top);
        const currentLeft = parseInt(entity.position.left);

        return {
          ...entity,
          position: {
            top: `${Math.max(10, Math.min(90, currentTop + (Math.random() * 10 - 5)))}%`,
            left: `${Math.max(10, Math.min(90, currentLeft + (Math.random() * 10 - 5)))}%`
          }
        };
      }));
    }, 30000);

    return () => clearInterval(entityInterval);
  }, []);

  // Method to navigate to specific coordinates
  const navigateToCoordinates = (lat: string, long: string) => {
    setTargetCoordinates({ lat, long });

    // Convert coordinates to approximate position
    // This would need a more sophisticated algorithm in a real app
    // For demo purposes, we'll just show a marker

    // Check if these coordinates match any hidden locations
    const matchedLocation = hiddenLocations.find(loc => 
      loc.discoveryMethod === 'coordinates' && 
      loc.discoveryRequirement.includes(lat) && 
      loc.discoveryRequirement.includes(long)
    );

    if (matchedLocation) {
      // Mark as discovered
      setHiddenLocations(prev => prev.map(loc => 
        loc.id === matchedLocation.id ? { ...loc, isDiscovered: true } : loc
      ));

      // Notify parent component
      if (onSecretDiscovery) {
        onSecretDiscovery(matchedLocation.id);
      }

      // Set map status to show discovery
      setMapStatus(`LOCATION DISCOVERED: ${matchedLocation.name.toUpperCase()}`);
      playSound('success');

      // Reset map offset to focus on the discovered location
      const top = parseInt(matchedLocation.position.top);
      const left = parseInt(matchedLocation.position.left);

      setMapOffset({
        x: -(left - 50) * 5, // Approximate centering
        y: -(top - 50) * 5
      });
      setMapZoom(2.0); // Zoom in on discovery
    }
  };

  // Method to handle entity tracking
  const trackEntity = (entityId: string) => {
    setMapEntities(prev => prev.map(entity => 
      entity.id === entityId ? { ...entity, isTracked: true } : entity
    ));

    setMapStatus(`TRACKING ENTITY: ${entityId}`);

    // For demo purposes, if entity-004 is tracked, it leads to a special discovery
    if (entityId === 'entity-004') {
      // This would trigger the Radinsky discovery event
      setTimeout(() => {
        // Reveal swan station blueprints
        setMapStatus('ENTITY TRACKING COMPLETE: SWAN STATION BLUEPRINTS UNLOCKED');
        playSound('success');

        // In a real app, we would unlock a document or blueprint here
      }, 10000);
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

                {/* Add map-specific scanline effect */}
                <div className="map-scanline absolute inset-0 z-10 pointer-events-none"></div>

                {/* Station markers */}
                {Object.entries(STATIONS).map(([key, station]) => {
                  const isDiscovered = discoveredStations.includes(key);
                  const markerStyle = getMarkerStyle(station.code);
                  const isFlashing = flashingSignals.includes(key);

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
                        scale: isDiscovered ? (isFlashing ? [1, 1.3, 1] : 1) : 0,
                        opacity: isDiscovered ? (isFlashing ? [1, 0.5, 1] : 1) : 0
                      }}
                      transition={{
                        type: isFlashing ? "tween" : "spring",
                        stiffness: 260,
                        damping: 20,
                        repeat: isFlashing ? Infinity : 0,
                        duration: isFlashing ? 0.5 : 0.3
                      }}
                      whileHover={{ scale: 1.2 }}
                      onMouseEnter={() => handleStationHover(key)}
                      onMouseLeave={() => handleStationHover(null)}
                      onClick={() => handleStationClick(key)}
                    >
                      {/* Render station markers using the Dharma logo components */}
                      {Object.keys(STATIONS).includes(key) ? (
                        renderMarker(key, markerStyle)
                      ) : (
                        <div className="w-full h-full rounded-full bg-black border-2 border-white flex items-center justify-center text-white">
                          ?
                        </div>
                      )}

                      {/* Show station name on hover */}
                      {isDiscovered && hoveredStation === key && (
                        <div className="absolute whitespace-nowrap top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-black bg-opacity-80 text-xs rounded text-white z-50">
                          {station.name}
                          {isFlashing && (
                            <span className="ml-2 text-[hsl(var(--dharma-red))]">ALERT</span>
                          )}
                        </div>
                      )}

                      {/* Show time-phase specific alternate names */}
                      {isDiscovered && key === 'swan' && timePhase === 54 && (
                        <div className="absolute whitespace-nowrap top-0 left-1/2 transform -translate-x-1/2 -mt-5 px-2 py-1 bg-black bg-opacity-80 text-[9px] rounded text-[hsl(var(--dharma-amber))] animate-pulse z-50">
                          THE HATCH - PRIMARY FIELD SITE
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Hidden locations */}
                {hiddenLocations.map((location) => (
                  <motion.div
                    key={location.id}
                    className={`absolute ${location.isDiscovered ? 'cursor-pointer' : ''}`}
                    style={{ 
                      top: location.position.top, 
                      left: location.position.left,
                      width: '24px',
                      height: '24px',
                      opacity: location.isDiscovered ? 0.9 : 0,
                      pointerEvents: location.isDiscovered ? 'auto' : 'none',
                      zIndex: 19,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: location.isDiscovered ? 1 : 0,
                      opacity: location.isDiscovered ? [0.7, 0.9, 0.7] : 0
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: location.isDiscovered ? Infinity : 0,
                      repeatType: "reverse"
                    }}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => {
                      if (location.isDiscovered && onSecretDiscovery) {
                        // Special handling for crash site - launch the BlackBox puzzle
                        if (location.id === 'crash-site') {
                          // Show a recover modal
                          if (confirm("Wreckage discovered. Recover black box?")) {
                            playSound('success');

                            // Add the recovered file to the virtual filesystem
                            try {
                              // Set a flag to indicate the black box was recovered
                              localStorage.setItem('dharma_blackbox_recovered', 'true');

                              // Add message to terminal logs
                              const terminalLogs = JSON.parse(localStorage.getItem('dharma_terminal_logs') || '[]');
                              terminalLogs.push({
                                message: '> Black box data recovered: /recovered/flightpath.mp4',
                                timestamp: Date.now()
                              });
                              localStorage.setItem('dharma_terminal_logs', JSON.stringify(terminalLogs));

                              // Launch the black box puzzle
                              localStorage.setItem('dharma_launch_puzzle', 'blackbox');

                              // Notify puzzle controller
                              onSecretDiscovery('blackbox');
                            } catch (e) {
                              console.error('Error storing black box recovery:', e);
                            }
                          }
                        } else {
                          // Regular location click
                          onSecretDiscovery(location.id);
                        }
                      }
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-[hsla(var(--dharma-amber),0.6)] border border-white flex items-center justify-center">
                      <span className="text-white text-[10px]">?</span>
                    </div>

                    {location.isDiscovered && (
                      <div className="absolute whitespace-nowrap top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-0.5 bg-black bg-opacity-80 text-[9px] rounded text-white z-50">
                        {location.name}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Moving entities */}
                {mapEntities.map((entity) => (
                  <motion.div
                    key={entity.id}
                    className="absolute w-3 h-3 rounded-full"
                    style={{ 
                      top: entity.position.top, 
                      left: entity.position.left,
                      backgroundColor: entity.isTracked ? 'hsl(var(--dharma-bright-green))' : 'hsl(var(--dharma-amber))',
                      zIndex: 18,
                      opacity: 0.7
                    }}
                    animate={{
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  />
                ))}

                {/* Target coordinates marker */}
                {targetCoordinates && (
                  <motion.div
                    className="absolute w-16 h-16 rounded-full pointer-events-none"
                    style={{ 
                      top: '50%',
                      left: '50%',
                      marginTop: '-32px',
                      marginLeft: '-32px',
                      zIndex: 15
                    }}
                    initial={{ scale: 0 }}
                    animate={{
                      scale: [0, 1.5, 1],
                      opacity: [0, 0.8, 0]
                    }}
                    transition={{
                      duration: 2,
                      times: [0, 0.3, 1]
                    }}
                  >
                    <div className="w-full h-full border-2 border-[hsl(var(--dharma-green))] rounded-full flex items-center justify-center animate-ping">
                      <div className="w-1/2 h-1/2 border border-[hsl(var(--dharma-green))] rounded-full" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Scan line effect */}
              <div 
                className="absolute inset-0 z-10 animate-terminal-scan" 
                style={{ 
                  boxShadow: 'inset 0 0 10px rgba(227, 188, 77, 0.3)',
                }}
              ></div>

              {/* Weather Effects */}
              {currentWeather === 'fog' && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{ 
                    transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
                    zIndex: 40,
                    mixBlendMode: 'overlay'
                  }}
                >
                  <div className="absolute inset-0 bg-white opacity-20 animate-fog"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-10"></div>
                </div>
              )}

              {currentWeather === 'rain' && (
                <div 
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                  style={{ 
                    transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
                    zIndex: 40
                  }}
                >
                  {[...Array(100)].map((_, i) => (
                    <div 
                      key={`rain-${i}`}
                      className="absolute w-px h-8 bg-cyan-400 opacity-20 animate-rain"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${0.5 + Math.random() * 0.5}s`
                      }}
                    ></div>
                  ))}
                </div>
              )}

              {currentWeather === 'storm' && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{ 
                    transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
                    zIndex: 40
                  }}
                >
                  {/* Rain */}
                  {[...Array(150)].map((_, i) => (
                    <div 
                      key={`storm-rain-${i}`}
                      className="absolute w-px h-10 bg-cyan-400 opacity-30 animate-rain"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${0.3 + Math.random() * 0.3}s`
                      }}
                    ></div>
                  ))}

                  {/* Lightning flashes that reveal hidden locations */}
                  <div 
                    className="absolute inset-0 bg-white animate-lightning opacity-0"
                    style={{ mixBlendMode: 'overlay' }}
                  >
                    {/* During lightning, show the lighthouse location */}
                    {hiddenLocations.find(loc => loc.id === 'lighthouse' && !loc.isDiscovered) && (
                      <div 
                        className="absolute w-6 h-6 border-2 border-white rounded-full animate-pulse"
                        style={{ 
                          top: hiddenLocations.find(loc => loc.id === 'lighthouse')?.position.top || '22%', 
                          left: hiddenLocations.find(loc => loc.id === 'lighthouse')?.position.left || '85%' 
                        }}
                      ></div>
                    )}
                  </div>
                </div>
              )}

              {/* Station connections when multiple stations are discovered */}
              {discoveredStations.length >= 2 && (
                <svg 
                  className="absolute inset-0 z-15 pointer-events-none"
                  style={{ transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)` }}
                >
                  {/* Connection between Swan and Pearl */}
                  {discoveredStations.includes('swan') && discoveredStations.includes('pearl') && (
                    <line 
                      x1={STATIONS.swan.position.left.replace('%', '') + '%'} 
                      y1={STATIONS.swan.position.top.replace('%', '') + '%'} 
                      x2={STATIONS.pearl.position.left.replace('%', '') + '%'} 
                      y2={STATIONS.pearl.position.top.replace('%', '') + '%'} 
                      stroke="hsla(var(--dharma-amber), 0.4)" 
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      className="station-connection"
                    />
                  )}

                  {/* Connection between Pearl and Flame */}
                  {discoveredStations.includes('pearl') && discoveredStations.includes('flame') && (
                    <line 
                      x1={STATIONS.pearl.position.left.replace('%', '') + '%'} 
                      y1={STATIONS.pearl.position.top.replace('%', '') + '%'} 
                      x2={STATIONS.flame.position.left.replace('%', '') + '%'} 
                      y2={STATIONS.flame.position.top.replace('%', '') + '%'} 
                      stroke="hsla(var(--dharma-amber), 0.4)" 
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  )}

                  {/* Connection between Flame and Swan - forms a triangle */}
                  {discoveredStations.includes('flame') && discoveredStations.includes('swan') && (
                    <line 
                      x1={STATIONS.flame.position.left.replace('%', '') + '%'} 
                      y1={STATIONS.flame.position.top.replace('%', '') + '%'} 
                      x2={STATIONS.swan.position.left.replace('%', '') + '%'} 
                      y2={STATIONS.swan.position.top.replace('%', '') + '%'} 
                      stroke="hsla(var(--dharma-amber), 0.4)" 
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  )}

                  {/* If all three stations are connected, show a hint at the center */}
                  {discoveredStations.includes('swan') && 
                   discoveredStations.includes('pearl') && 
                   discoveredStations.includes('flame') && (
                    <>
                      {/* Calculate center of triangle */}
                      <circle
                        cx={(parseFloat(STATIONS.swan.position.left) + 
                             parseFloat(STATIONS.pearl.position.left) + 
                             parseFloat(STATIONS.flame.position.left)) / 3 + '%'}
                        cy={(parseFloat(STATIONS.swan.position.top) + 
                             parseFloat(STATIONS.pearl.position.top) + 
                             parseFloat(STATIONS.flame.position.top)) / 3 + '%'}
                        r="8"
                        fill="hsla(var(--dharma-red), 0.2)"
                        stroke="hsla(var(--dharma-red), 0.5)"
                        strokeWidth="1"
                        className="animate-pulse"
                      />

                      {/* Add a ? marker to hint at a hidden location */}
                      <text
                        x={(parseFloat(STATIONS.swan.position.left) + 
                             parseFloat(STATIONS.pearl.position.left) + 
                             parseFloat(STATIONS.flame.position.left)) / 3 + '%'}
                        y={(parseFloat(STATIONS.swan.position.top) + 
                             parseFloat(STATIONS.pearl.position.top) + 
                             parseFloat(STATIONS.flame.position.top)) / 3 + '%'}
                        fontSize="10"
                        fill="white"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        ?
                      </text>
                    </>
                  )}
                </svg>
              )}

              {/* Coordinate grid that appears on zoom */}
              {showCoordinateGrid && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{ 
                    transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
                    zIndex: 30 
                  }}
                >
                  {/* Horizontal grid lines */}
                  {[...Array(10)].map((_, i) => (
                    <div 
                      key={`h-grid-${i}`}
                      className="absolute left-0 right-0 h-px bg-[hsla(var(--dharma-green),0.2)]"
                      style={{ top: `${i * 10 + 5}%` }}
                    >
                      <span className="absolute left-1 top-1 text-[8px] text-[hsla(var(--dharma-green),0.7)]">
                        {`${45 - i * 5}°N`}
                      </span>
                    </div>
                  ))}

                  {/* Vertical grid lines */}
                  {[...Array(10)].map((_, i) => (
                    <div 
                      key={`v-grid-${i}`}
                      className="absolute top-0 bottom-0 w-px bg-[hsla(var(--dharma-green),0.2)]"
                      style={{ left: `${i * 10 + 5}%` }}
                    >
                      <span className="absolute top-1 left-1 text-[8px] text-[hsla(var(--dharma-green),0.7)]">
                        {`${170 - i * 15}°W`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Mysterious fog overlay that partially clears based on discovered stations */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-[rgba(0,0,0,0.7)] to-[rgba(0,0,0,0.4)]"
                style={{ 
                  opacity: Math.max(0.9 - (discoveredStations.length * 0.15), 0.1),
                  transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
                  zIndex: currentWeather === 'fog' ? 25 : 35
                }}
              />

              {/* Grid patterns suggesting more locations */}
              <div 
                className="absolute inset-0 grid-pattern opacity-30"
                style={{ 
                  transform: `translate(${mapOffset.x}px, ${mapOffset.y}px)`,
                  zIndex: 20
                }}
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