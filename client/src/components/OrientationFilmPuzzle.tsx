import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Film, Clock, FileText, RefreshCw, Play, Pause, RotateCcw, Check } from 'lucide-react';
import { playSound } from '@/lib/audio';

interface FilmSegment {
  id: string;
  title: string;
  content: string;
  isPlaceholder: boolean;
  position: number | null;
}

interface OrientationFilmPuzzleProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OrientationFilmPuzzle: React.FC<OrientationFilmPuzzleProps> = ({ isVisible, onClose, onComplete }) => {
  // The full film has segments, some of which are missing (represented as placeholders)
  const [filmSegments, setFilmSegments] = useState<FilmSegment[]>([
    { id: 'intro', title: 'Introduction', content: 'Welcome to the DHARMA Initiative. This film was created to help you better understand our purpose and goals. I am Dr. Marvin Candle, and I will be your guide.', isPlaceholder: false, position: 0 },
    { id: 'history', title: 'DHARMA History', content: 'The DHARMA Initiative was founded in 1970 by Gerald and Karen DeGroot, two doctoral candidates at the University of Michigan. With funding from the Hanso Foundation, they established this research facility.', isPlaceholder: false, position: 1 },
    { id: 'missing1', title: '[MISSING SEGMENT]', content: '', isPlaceholder: true, position: null },
    { id: 'stations', title: 'Station Network', content: 'The DHARMA Initiative operates a series of research stations across the island, each dedicated to a different area of scientific study. Each station plays a vital role in our overall mission.', isPlaceholder: false, position: 3 },
    { id: 'missing2', title: '[MISSING SEGMENT]', content: '', isPlaceholder: true, position: null },
    { id: 'protocol', title: 'Button Protocol', content: 'The most important aspect of your responsibilities will be the regular pressing of the button. Every 108 minutes, the button must be pushed to prevent a potentially catastrophic incident.', isPlaceholder: false, position: 5 },
    { id: 'missing3', title: '[MISSING SEGMENT]', content: '', isPlaceholder: true, position: null },
    { id: 'conclusion', title: 'Conclusion', content: 'We thank you for your attention and dedication to this important work. Remember, regular pushing of the button is essential. From all of us at the DHARMA Initiative: Namaste, and good luck.', isPlaceholder: false, position: 7 }
  ]);
  
  // Available film segments to insert
  const [availableSegments, setAvailableSegments] = useState<FilmSegment[]>([
    { id: 'numbers', title: 'The Numbers', content: 'The core values of the Valenzetti Equation are represented by the numbers 4, 8, 15, 16, 23, and 42. Our work here aims to change at least one of these values, thereby changing the outcome predicted by the equation.', isPlaceholder: false, position: null },
    { id: 'magnetic', title: 'Magnetic Anomaly', content: 'The Swan station was constructed over an electromagnetic anomaly. The nature of this energy is still being studied, but it possesses unique properties unlike anything seen elsewhere in the world.', isPlaceholder: false, position: null },
    { id: 'incident', title: 'The Incident', content: 'Following the incident that occurred during the drilling operation in 1977, containment protocols were established. The button serves to discharge the accumulated energy and prevent another incident.', isPlaceholder: false, position: null },
    { id: 'wildlife', title: 'Island Wildlife', content: 'You may encounter unique wildlife specimens during your time here. The island hosts several species that have evolved unusual characteristics. Keep a safe distance from any unfamiliar animals.', isPlaceholder: false, position: null },
    { id: 'hostiles', title: 'Island Inhabitants', content: 'Be aware that the island had prior inhabitants before our arrival. We maintain a tenuous truce with these people. Do not engage with them if encountered. Report any sightings immediately.', isPlaceholder: false, position: null }
  ]);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Puzzle state
  const [draggedSegment, setDraggedSegment] = useState<FilmSegment | null>(null);
  const [missingSlots, setMissingSlots] = useState<number[]>([2, 4, 6]);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [hints, setHints] = useState<string[]>([]);
  
  // The correct segments to insert are 'numbers', 'magnetic', and 'incident'
  const correctSegmentIds = ['numbers', 'magnetic', 'incident'];
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Check if film is complete (all segments are in place)
  useEffect(() => {
    const isFilmComplete = filmSegments.every(segment => !segment.isPlaceholder);
    
    if (isFilmComplete) {
      // Check if the correct segments are in the right places
      const missingSegmentIds = filmSegments
        .filter((_, index) => missingSlots.includes(index))
        .map(segment => segment.id);
      
      // Check if user placed the correct segments (order doesn't matter)
      const allCorrect = correctSegmentIds.every(id => missingSegmentIds.includes(id));
      
      setIsComplete(allCorrect);
      
      if (allCorrect) {
        playSound('success');
        setTimeout(() => {
          onComplete();
        }, 3000);
      }
    }
  }, [filmSegments, missingSlots]);
  
  // Simulation of playing the film
  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    
    setIsPlaying(true);
    
    // Advance through segments
    timerRef.current = setInterval(() => {
      setCurrentSegmentIndex(prev => {
        if (prev < filmSegments.length - 1) {
          // Skip placeholder segments
          let nextIndex = prev + 1;
          while (nextIndex < filmSegments.length && filmSegments[nextIndex].isPlaceholder) {
            nextIndex++;
          }
          
          if (nextIndex < filmSegments.length) {
            return nextIndex;
          }
          // Stop at the end
          setIsPlaying(false);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return prev;
        }
        // Stop at the end
        setIsPlaying(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return prev;
      });
      
      // Update progress
      setProgress(prev => Math.min(prev + 10, 100));
    }, 3000);
  };
  
  // Reset film playback
  const resetPlayback = () => {
    setIsPlaying(false);
    setCurrentSegmentIndex(0);
    setProgress(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    playSound('beep');
  };
  
  // Handle drag start
  const handleDragStart = (segment: FilmSegment) => {
    setDraggedSegment(segment);
  };
  
  // Handle dropping a segment into a placeholder slot
  const handleDrop = (targetIndex: number) => {
    if (!draggedSegment) return;
    
    // Insert the segment into the film at the target position
    const updatedFilm = [...filmSegments];
    updatedFilm[targetIndex] = { ...draggedSegment, position: targetIndex };
    setFilmSegments(updatedFilm);
    
    // Remove from available segments
    setAvailableSegments(prev => prev.filter(seg => seg.id !== draggedSegment.id));
    
    // Clear drag state
    setDraggedSegment(null);
    
    playSound('beep');
    
    // Add hint after 2 segments are placed
    const placedCount = updatedFilm.filter(s => !s.isPlaceholder).length;
    if (placedCount === 5 && hints.length < 1) {
      setHints(prev => [...prev, "Dr. Chang mentions 'the incident' in one film. This event led to the button protocol."]);
    } else if (placedCount === 6 && hints.length < 2) {
      setHints(prev => [...prev, "The Valenzetti Equation and its core numbers are central to the DHARMA Initiative's mission."]);
    }
  };
  
  // Remove a segment from the film
  const removeSegment = (index: number) => {
    const segmentToRemove = filmSegments[index];
    
    // Only allow removing segments that were placed by the user (not original segments)
    if (!missingSlots.includes(index)) return;
    
    // Remove from film and replace with placeholder
    const updatedFilm = [...filmSegments];
    updatedFilm[index] = { 
      id: `missing${missingSlots.indexOf(index) + 1}`, 
      title: '[MISSING SEGMENT]', 
      content: '', 
      isPlaceholder: true, 
      position: null 
    };
    setFilmSegments(updatedFilm);
    
    // Add back to available segments
    setAvailableSegments(prev => [...prev, { ...segmentToRemove, position: null }]);
    
    playSound('beep', 'short');
  };
  
  // Find a hint
  const findHint = () => {
    if (hints.length < 3) {
      setHints(prev => [
        ...prev, 
        "According to recovered notes, the incident involved the electromagnetic anomaly beneath the Swan station."
      ]);
      playSound('beep');
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
            <Film className="h-5 w-5" />
            DHARMA ORIENTATION FILM RESTORATION
          </h2>
          <button 
            onClick={onClose}
            className="text-[hsl(var(--dharma-gray))] hover:text-[hsl(var(--dharma-red))]"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left column: Film player */}
          <div>
            <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 rounded mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-sm">FILM PLAYER</h3>
                <Clock className="w-4 h-4 text-[hsl(var(--dharma-amber))]" />
              </div>
              
              {/* Film viewer */}
              <div className="bg-[hsl(var(--dharma-black))] border border-[hsl(var(--dharma-gray))] p-4 mb-4">
                <div className="mb-3 flex justify-between items-center">
                  <span className="text-[hsl(var(--dharma-green))] text-xs">
                    SEGMENT: {currentSegmentIndex + 1}/{filmSegments.length}
                  </span>
                  <span className="text-[hsl(var(--dharma-green))] text-xs">
                    RUN TIME: {Math.floor(progress / 10)}:00
                  </span>
                </div>
                
                <div className="h-40 flex flex-col justify-center">
                  {filmSegments[currentSegmentIndex].isPlaceholder ? (
                    <div className="text-center">
                      <div className="text-[hsl(var(--dharma-red))] text-sm mb-2">MISSING FILM SEGMENT</div>
                      <div className="text-[hsl(var(--dharma-amber))] text-xs">
                        This portion of the orientation film has been damaged or removed.
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-[hsl(var(--dharma-green))] text-sm mb-2">
                        {filmSegments[currentSegmentIndex].title}
                      </h4>
                      <p className="text-[hsl(var(--dharma-white))] text-xs">
                        {filmSegments[currentSegmentIndex].content}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-[hsla(var(--dharma-gray),0.2)] h-1 mt-4">
                  <div 
                    className="bg-[hsl(var(--dharma-green))] h-1"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Playback controls */}
              <div className="flex justify-between">
                <button
                  onClick={togglePlayback}
                  className="px-3 py-1 bg-[hsla(var(--dharma-gray),0.1)] border border-[hsl(var(--dharma-gray))] text-xs flex items-center gap-1 text-[hsl(var(--dharma-green))] hover:bg-[hsla(var(--dharma-gray),0.2)]"
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {isPlaying ? 'PAUSE' : 'PLAY'} FILM
                </button>
                
                <button
                  onClick={resetPlayback}
                  className="px-3 py-1 bg-[hsla(var(--dharma-gray),0.1)] border border-[hsl(var(--dharma-gray))] text-xs flex items-center gap-1 text-[hsl(var(--dharma-amber))] hover:bg-[hsla(var(--dharma-gray),0.2)]"
                >
                  <RotateCw className="w-3 h-3" />
                  REWIND
                </button>
              </div>
            </div>
            
            {/* Film sequence */}
            <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 rounded">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-sm">FILM SEQUENCE</h3>
                <FileText className="w-4 h-4 text-[hsl(var(--dharma-white))]" />
              </div>
              
              <div className="space-y-2">
                {filmSegments.map((segment, index) => (
                  <div
                    key={index}
                    className={`p-2 border ${segment.isPlaceholder 
                      ? 'border-dashed border-[hsl(var(--dharma-amber))] bg-[hsla(var(--dharma-amber),0.05)]' 
                      : 'border-[hsl(var(--dharma-gray))] bg-[hsla(var(--dharma-gray),0.1)]'
                    }`}
                    onDragOver={(e) => {
                      if (segment.isPlaceholder) {
                        e.preventDefault();
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (segment.isPlaceholder) {
                        handleDrop(index);
                      }
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[hsl(var(--dharma-green))] text-xs">{index + 1}</span>
                        <span className={`text-xs ${segment.isPlaceholder ? 'text-[hsl(var(--dharma-amber))]' : 'text-[hsl(var(--dharma-white))]'}`}>
                          {segment.title}
                        </span>
                      </div>
                      
                      {missingSlots.includes(index) && !segment.isPlaceholder && (
                        <button
                          onClick={() => removeSegment(index)}
                          className="text-[hsl(var(--dharma-gray))] hover:text-[hsl(var(--dharma-red))] text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right column: Film fragments and hints */}
          <div>
            <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 rounded mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-sm">RECOVERED FILM FRAGMENTS</h3>
                <RefreshCw className="w-4 h-4 text-[hsl(var(--dharma-green))]" />
              </div>
              
              <p className="text-xs text-[hsl(var(--dharma-green))] mb-3">
                Drag and drop these film segments into the correct positions to restore the orientation film.
              </p>
              
              <div className="space-y-2">
                {availableSegments.map((segment, index) => (
                  <div
                    key={segment.id}
                    draggable
                    onDragStart={() => handleDragStart(segment)}
                    className="p-2 border border-[hsl(var(--dharma-green))] bg-[hsla(var(--dharma-green),0.05)] cursor-move"
                  >
                    <div className="text-[hsl(var(--dharma-white))] text-xs font-bold mb-1">
                      {segment.title}
                    </div>
                    <div className="text-[hsl(var(--dharma-gray))] text-xs line-clamp-2">
                      {segment.content.substring(0, 80)}...
                    </div>
                  </div>
                ))}
                
                {availableSegments.length === 0 && (
                  <div className="p-3 text-center text-[hsl(var(--dharma-gray))] text-xs">
                    All film fragments have been placed.
                  </div>
                )}
              </div>
              
              {/* Hint section */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-xs">RESEARCHER NOTES</h3>
                  <button
                    onClick={findHint}
                    className="text-[hsl(var(--dharma-amber))] text-xs hover:underline"
                  >
                    FIND NOTE
                  </button>
                </div>
                
                <div className="bg-[hsla(var(--dharma-gray),0.05)] p-2 border border-[hsl(var(--dharma-gray))] max-h-40 overflow-y-auto">
                  {hints.length > 0 ? (
                    <ul className="space-y-2">
                      {hints.map((hint, index) => (
                        <li key={index} className="text-[hsl(var(--dharma-amber))] text-xs">
                          &gt; {hint}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-[hsl(var(--dharma-gray))] text-xs p-3">
                      No research notes found.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Verification panel */}
            <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 rounded">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-sm">FILM RESTORATION VERIFICATION</h3>
                {isComplete ? (
                  <Check className="w-4 h-4 text-[hsl(var(--dharma-bright-green))]" />
                ) : (
                  <span className="text-[hsl(var(--dharma-amber))] text-xs">IN PROGRESS</span>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${filmSegments.some(s => s.id === 'numbers') ? 'bg-[hsl(var(--dharma-bright-green))]' : 'bg-[hsl(var(--dharma-gray))]'}`}></div>
                  <span className="text-xs text-[hsl(var(--dharma-white))]">Valenzetti segment restored</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${filmSegments.some(s => s.id === 'magnetic') ? 'bg-[hsl(var(--dharma-bright-green))]' : 'bg-[hsl(var(--dharma-gray))]'}`}></div>
                  <span className="text-xs text-[hsl(var(--dharma-white))]">Electromagnetic research segment restored</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${filmSegments.some(s => s.id === 'incident') ? 'bg-[hsl(var(--dharma-bright-green))]' : 'bg-[hsl(var(--dharma-gray))]'}`}></div>
                  <span className="text-xs text-[hsl(var(--dharma-white))]">Incident protocol segment restored</span>
                </div>
              </div>
              
              {isComplete && (
                <div className="mt-4 p-2 bg-[hsla(var(--dharma-green),0.1)] border border-[hsl(var(--dharma-bright-green))] text-[hsl(var(--dharma-bright-green))] text-xs text-center">
                  FILM RESTORATION COMPLETE. ACCESSING DHARMA ARCHIVES...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrientationFilmPuzzle;