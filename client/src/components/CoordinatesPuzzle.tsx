import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Compass, Navigation, BookOpen, Lock, Key, Check } from 'lucide-react';
import { playSound } from '@/lib/audio';

interface Coordinate {
  id: string;
  label: string;
  description: string;
  lat: string;
  long: string;
  clue: string;
}

interface CoordinatesPuzzleProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const CoordinatesPuzzle: React.FC<CoordinatesPuzzleProps> = ({ isVisible, onClose, onComplete }) => {
  // DHARMA station coordinates (with fictional coordinates for the ARG)
  const [coordinates, setCoordinates] = useState<Coordinate[]>([
    { 
      id: 'swan', 
      label: 'The Swan', 
      description: 'Electromagnetic research facility',
      lat: '4° 8\' 15.0"N', 
      long: '162° 16\' 23.0"W', 
      clue: 'Primary containment station. Requires regular protocol execution.' 
    },
    { 
      id: 'pearl', 
      label: 'The Pearl', 
      description: 'Psychological research/observation',
      lat: '4° 8\' 42.0"N', 
      long: '162° 15\' 42.0"W', 
      clue: 'Monitoring station for observing other facilities.' 
    },
    { 
      id: 'arrow', 
      label: 'The Arrow', 
      description: 'Development of defensive strategies',
      lat: '4° 9\' 23.0"N', 
      long: '162° 17\' 8.0"W', 
      clue: 'Originally designed for defense against hostile forces.' 
    },
    { 
      id: 'flame', 
      label: 'The Flame', 
      description: 'Communication with outside world',
      lat: '4° 10\' 16.0"N', 
      long: '162° 18\' 4.0"W', 
      clue: 'Houses equipment for off-island communications.' 
    },
    { 
      id: 'orchid', 
      label: 'The Orchid', 
      description: 'Space-time research facility',
      lat: '4° 9\' 42.0"N', 
      long: '162° 23\' 42.0"W', 
      clue: 'Exotic matter studies and time manipulation experiments.' 
    }
  ]);
  
  // User input for the final location
  const [userLat, setUserLat] = useState<string>('');
  const [userLong, setUserLong] = useState<string>('');
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const [currentClue, setCurrentClue] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [hints, setHints] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [journalEntries, setJournalEntries] = useState<string[]>([]);
  
  // The correct coordinates lead to the location of "The Looking Glass" station
  // 4° 8' 15.0"N, 162° 23' 42.0"W (which combines elements from other coordinates)
  const CORRECT_LAT = '4° 8\' 15.0"N';
  const CORRECT_LONG = '162° 23\' 42.0"W';
  
  // Add new journal entries as the puzzle progresses
  useEffect(() => {
    if (selectedStations.length === 2 && journalEntries.length === 0) {
      addJournalEntry("Log 1: Initial analysis shows that DHARMA coordinates follow a specific pattern. The numbers appear to be significant.");
    }
    
    if (selectedStations.length === 3 && journalEntries.length === 1) {
      addJournalEntry("Log 2: Multiple station coordinates contain the numbers from the Valenzetti Equation. This can't be coincidental.");
    }
    
    if (selectedStations.length === 4 && journalEntries.length === 2) {
      addJournalEntry("Log 3: According to recovered documents, an underwater station exists but was kept highly classified. Only high-level DHARMA personnel knew its exact location.");
    }
  }, [selectedStations, journalEntries.length]);
  
  // Add hints based on attempts
  useEffect(() => {
    if (attempts === 2 && hints.length === 0) {
      setHints(prev => [...prev, "Hint: The Swan station contains the core numbers of the Valenzetti Equation."]);
      playSound('beep');
    }
    
    if (attempts === 4 && hints.length === 1) {
      setHints(prev => [...prev, "Hint: The Orchid station's longitude points to a significant location."]);
      playSound('beep');
    }
    
    if (attempts === 6 && hints.length === 2) {
      setHints(prev => [...prev, "Hint: Combine the latitude from Swan with the longitude from Orchid."]);
      playSound('beep');
    }
  }, [attempts, hints.length]);
  
  // Toggle selection of a station
  const toggleStationSelection = (stationId: string) => {
    if (selectedStations.includes(stationId)) {
      setSelectedStations(prev => prev.filter(id => id !== stationId));
      setCurrentClue(null);
    } else {
      setSelectedStations(prev => [...prev, stationId]);
      const station = coordinates.find(c => c.id === stationId);
      if (station) {
        setCurrentClue(station.clue);
        playSound('beep', 'short');
      }
    }
  };
  
  // Add a journal entry
  const addJournalEntry = (entry: string) => {
    setJournalEntries(prev => [...prev, entry]);
    playSound('beep');
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userLat.trim() === CORRECT_LAT && userLong.trim() === CORRECT_LONG) {
      setIsCorrect(true);
      playSound('success');
      setTimeout(() => {
        onComplete();
      }, 3000);
    } else {
      setAttempts(prev => prev + 1);
      playSound('fail');
      
      // Give feedback on how close they are
      let feedback = "Incorrect coordinates. Try analyzing the station patterns more closely.";
      
      if (userLat.trim() === CORRECT_LAT) {
        feedback = "The latitude is correct. Focus on finding the right longitude.";
      } else if (userLong.trim() === CORRECT_LONG) {
        feedback = "The longitude is correct. Focus on finding the right latitude.";
      } else if (userLat.includes('4°') && userLat.includes('8\'') && userLong.includes('162°')) {
        feedback = "You're close. The coordinates contain elements from the existing stations.";
      }
      
      addJournalEntry(`Attempt ${attempts + 1}: ${feedback}`);
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-[hsl(var(--dharma-black))] border-2 border-[hsl(var(--dharma-gray))] p-5 rounded max-w-4xl w-full relative max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[hsl(var(--dharma-green))] font-terminal text-lg flex items-center gap-2">
            <Map className="h-5 w-5" />
            DHARMA CARTOGRAPHY PROJECT
          </h2>
          <button 
            onClick={onClose}
            className="text-[hsl(var(--dharma-gray))] hover:text-[hsl(var(--dharma-red))]"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left column: Coordinate map and data */}
          <div>
            <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 rounded mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-sm">STATION COORDINATES</h3>
                <Compass className="w-4 h-4 text-[hsl(var(--dharma-white))]" />
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {coordinates.map(coord => (
                  <div
                    key={coord.id}
                    onClick={() => toggleStationSelection(coord.id)}
                    className={`p-2 border cursor-pointer ${
                      selectedStations.includes(coord.id)
                        ? 'border-[hsl(var(--dharma-green))] bg-[hsla(var(--dharma-green),0.1)]'
                        : 'border-[hsl(var(--dharma-gray))] bg-[hsla(var(--dharma-gray),0.05)]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-[hsl(var(--dharma-white))] text-xs font-bold">
                        {coord.label}
                      </div>
                      <div className="text-[hsl(var(--dharma-amber))] text-xs">
                        {coord.description}
                      </div>
                    </div>
                    
                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <div className="text-[hsl(var(--dharma-green))] text-xs">
                        Lat: {coord.lat}
                      </div>
                      <div className="text-[hsl(var(--dharma-green))] text-xs">
                        Long: {coord.long}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Selected station clue */}
              {currentClue && (
                <div className="mt-3 p-2 bg-[hsla(var(--dharma-gray),0.05)] border border-[hsl(var(--dharma-amber))]">
                  <h4 className="text-[hsl(var(--dharma-amber))] text-xs mb-1">STATION NOTES:</h4>
                  <p className="text-[hsl(var(--dharma-white))] text-xs">{currentClue}</p>
                </div>
              )}
            </div>
            
            {/* Missing station input */}
            <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 rounded">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-sm">LOCATE THE LOOKING GLASS</h3>
                <Navigation className="w-4 h-4 text-[hsl(var(--dharma-amber))]" />
              </div>
              
              <p className="text-xs text-[hsl(var(--dharma-green))] mb-3">
                Based on your analysis of the coordinate patterns, determine the exact location of the hidden underwater station, "The Looking Glass."
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[hsl(var(--dharma-white))] text-xs mb-1 block">
                      Latitude:
                    </label>
                    <input
                      type="text"
                      value={userLat}
                      onChange={(e) => setUserLat(e.target.value)}
                      disabled={isCorrect}
                      className="w-full bg-[hsla(var(--dharma-black),0.5)] border border-[hsl(var(--dharma-gray))] p-2 text-xs text-[hsl(var(--dharma-green))]"
                      placeholder="0° 0' 0.0″N"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[hsl(var(--dharma-white))] text-xs mb-1 block">
                      Longitude:
                    </label>
                    <input
                      type="text"
                      value={userLong}
                      onChange={(e) => setUserLong(e.target.value)}
                      disabled={isCorrect}
                      className="w-full bg-[hsla(var(--dharma-black),0.5)] border border-[hsl(var(--dharma-gray))] p-2 text-xs text-[hsl(var(--dharma-green))]"
                      placeholder="0° 0' 0.0″W"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isCorrect || !userLat.trim() || !userLong.trim()}
                  className={`w-full py-2 text-xs flex items-center justify-center gap-2 ${
                    isCorrect || !userLat.trim() || !userLong.trim()
                      ? 'bg-[hsla(var(--dharma-gray),0.05)] text-[hsl(var(--dharma-gray))] border border-[hsl(var(--dharma-gray))]'
                      : 'bg-[hsla(var(--dharma-green),0.1)] text-[hsl(var(--dharma-green))] border border-[hsl(var(--dharma-green))] hover:bg-[hsla(var(--dharma-green),0.2)]'
                  }`}
                >
                  {isCorrect ? (
                    <>
                      <Check className="w-3 h-3" />
                      COORDINATES VERIFIED
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3 h-3" />
                      VERIFY COORDINATES
                    </>
                  )}
                </button>
              </form>
              
              {/* Success message */}
              {isCorrect && (
                <div className="mt-3 p-2 bg-[hsla(var(--dharma-green),0.1)] border border-[hsl(var(--dharma-bright-green))] text-center">
                  <p className="text-[hsl(var(--dharma-bright-green))] text-xs">
                    COORDINATES CONFIRMED. THE LOOKING GLASS STATION LOCATED.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column: Research journal and hints */}
          <div>
            <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 rounded mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-sm">RESEARCH JOURNAL</h3>
                <BookOpen className="w-4 h-4 text-[hsl(var(--dharma-white))]" />
              </div>
              
              <div className="bg-[hsla(var(--dharma-gray),0.05)] p-3 border border-[hsl(var(--dharma-gray))] h-64 overflow-y-auto">
                {journalEntries.length > 0 ? (
                  <div className="space-y-3">
                    {journalEntries.map((entry, index) => (
                      <div key={index} className="text-xs">
                        <span className="text-[hsl(var(--dharma-amber))]">{entry.split(':')[0]}:</span>
                        <span className="text-[hsl(var(--dharma-white))]">{entry.split(':').slice(1).join(':')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-[hsl(var(--dharma-gray))] text-xs">
                    Begin analyzing coordinate patterns to populate research journal.
                  </div>
                )}
              </div>
              
              <div className="mt-3 flex justify-between">
                <button
                  onClick={() => addJournalEntry("Personal Note: Looking for patterns in the numerical sequences. The numbers 4, 8, 15, 16, 23, 42 appear frequently in DHARMA research and station coordinates.")}
                  className="text-xs text-[hsl(var(--dharma-green))] hover:underline"
                >
                  ADD NOTE
                </button>
                
                <button
                  onClick={() => addJournalEntry("Analysis: The underwater station is mentioned in recovered documents as 'The Looking Glass' - used for communication blocking and submarine access.")}
                  className="text-xs text-[hsl(var(--dharma-amber))] hover:underline"
                >
                  ADD ANALYSIS
                </button>
              </div>
            </div>
            
            {/* Hints and clues */}
            <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 rounded">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-sm">CLASSIFIED INFORMATION</h3>
                <Lock className="w-4 h-4 text-[hsl(var(--dharma-red))]" />
              </div>
              
              {hints.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {hints.map((hint, index) => (
                    <div 
                      key={index}
                      className="p-2 bg-[hsla(var(--dharma-amber),0.05)] border border-[hsl(var(--dharma-amber))]"
                    >
                      <p className="text-[hsl(var(--dharma-amber))] text-xs">{hint}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-[hsl(var(--dharma-gray))] text-xs mb-3">
                  Additional information locked. Continue exploration to unlock hints.
                </div>
              )}
              
              <div className="bg-[hsla(var(--dharma-gray),0.05)] p-3 border border-[hsl(var(--dharma-gray))]">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-3 h-3 text-[hsl(var(--dharma-green))]" />
                  <h4 className="text-[hsl(var(--dharma-green))] text-xs">RECOVERED DOCUMENT FRAGMENT:</h4>
                </div>
                
                <p className="text-[hsl(var(--dharma-white))] text-xs mb-2">
                  "...The Looking Glass station serves as both a jamming station and the primary access point for the Galaga submarine. Its existence is classified even to most DHARMA personnel. Only those with the highest clearance know its exact coordinates..."
                </p>
                
                <p className="text-[hsl(var(--dharma-white))] text-xs mb-2">
                  "...Dr. Chang insisted that the coordinates be masked using elements from other station locations to maintain secrecy, yet still be retrievable in an emergency..."
                </p>
                
                <p className="text-[hsl(var(--dharma-white))] text-xs">
                  "...The Valenzetti Equation values remain central to all station placement decisions. This consistent pattern allows authorized personnel to extrapolate the coordinates of any facility when needed..."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CoordinatesPuzzle;