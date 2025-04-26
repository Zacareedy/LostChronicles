import React, { useState, useEffect } from 'react';
import HieroglyphPuzzle from './HieroglyphPuzzle';
import RadioPuzzle from './RadioPuzzle';
import CipherPuzzle from './CipherPuzzle';
import OrientationFilmPuzzle from './OrientationFilmPuzzle';
import CoordinatesPuzzle from './CoordinatesPuzzle';
import { useLore } from '@/contexts/LoreContext';
import { DHARMA_NUMBERS } from '@/lib/constants';

enum PuzzleType {
  NONE = '',
  HIEROGLYPH = 'hieroglyph',
  RADIO = 'radio',
  CIPHER = 'cipher',
  ORIENTATION_FILM = 'orientation_film',
  COORDINATES = 'coordinates'
}

interface PuzzleControllerProps {
  onRevealStation: (stationName: string) => void;
  onUnlockReport: (reportId: number) => void;
  onUnlockAudioLog: (logId: string) => void;
}

const PuzzleController: React.FC<PuzzleControllerProps> = ({ 
  onRevealStation, 
  onUnlockReport,
  onUnlockAudioLog
}) => {
  const [activePuzzle, setActivePuzzle] = useState<PuzzleType>(PuzzleType.NONE);
  const [completedPuzzles, setCompletedPuzzles] = useState<PuzzleType[]>([]);
  const { triggerLoreEvent, storylineFlags, terminalHistory } = useLore();
  
  // Trigger puzzles based on user's interactions in the terminal
  useEffect(() => {
    // Don't check if no new commands have been entered
    if (!terminalHistory.length) return;
    
    // Get the most recent command
    const latestCommand = terminalHistory[terminalHistory.length - 1].toLowerCase();
    
    // Check for commands that might trigger puzzles
    if (latestCommand.includes('scan') && !completedPuzzles.includes(PuzzleType.RADIO)) {
      // Radio puzzle can be triggered by the scan command, but only if not yet completed
      const randomChance = Math.random();
      if (randomChance > 0.7) {
        setTimeout(() => {
          setActivePuzzle(PuzzleType.RADIO);
        }, 1500);
      }
    } else if (latestCommand === 'decrypt valenzetti' && !completedPuzzles.includes(PuzzleType.CIPHER)) {
      // Cipher puzzle is triggered by trying to decrypt the Valenzetti file
      setTimeout(() => {
        setActivePuzzle(PuzzleType.CIPHER);
      }, 1000);
    } else if (latestCommand.includes('locate') && !completedPuzzles.includes(PuzzleType.COORDINATES)) {
      // Coordinates puzzle can be triggered by the locate command
      const randomChance = Math.random();
      if (randomChance > 0.7) {
        setTimeout(() => {
          setActivePuzzle(PuzzleType.COORDINATES);
        }, 1500);
      }
    } else if (latestCommand === '4 8 15 16 23 42' && !completedPuzzles.includes(PuzzleType.HIEROGLYPH)) {
      // Hieroglyph puzzle is triggered by entering the numbers directly
      const randomChance = Math.random();
      if (randomChance > 0.5) {
        setTimeout(() => {
          setActivePuzzle(PuzzleType.HIEROGLYPH);
        }, 1000);
      }
    } else if (latestCommand.includes('pearl-surveillance') && !completedPuzzles.includes(PuzzleType.ORIENTATION_FILM)) {
      // Orientation film puzzle is triggered by accessing Pearl surveillance
      setTimeout(() => {
        setActivePuzzle(PuzzleType.ORIENTATION_FILM);
      }, 1500);
    }
  }, [terminalHistory, completedPuzzles]);
  
  // Special story flags can also trigger puzzles
  useEffect(() => {
    if (storylineFlags['systemFailure'] && !completedPuzzles.includes(PuzzleType.HIEROGLYPH)) {
      // System failure can trigger the hieroglyph puzzle
      setTimeout(() => {
        setActivePuzzle(PuzzleType.HIEROGLYPH);
      }, 3000);
    }
    
    if (storylineFlags['pearlAccess'] && !completedPuzzles.includes(PuzzleType.ORIENTATION_FILM)) {
      // Pearl access can trigger the orientation film puzzle
      setTimeout(() => {
        setActivePuzzle(PuzzleType.ORIENTATION_FILM);
      }, 3000);
    }
  }, [storylineFlags, completedPuzzles]);
  
  // Handle puzzle closure
  const handleClosePuzzle = () => {
    setActivePuzzle(PuzzleType.NONE);
  };
  
  // Handle puzzle completion with appropriate rewards
  const handleCompletePuzzle = (puzzleType: PuzzleType) => {
    // Mark puzzle as completed
    setCompletedPuzzles(prev => [...prev, puzzleType]);
    
    // Close the puzzle
    setActivePuzzle(PuzzleType.NONE);
    
    // Determine the reward based on puzzle type
    switch (puzzleType) {
      case PuzzleType.HIEROGLYPH:
        // Completing hieroglyph puzzle reveals the Orchid station
        onRevealStation('orchid');
        // Also unlocks the incident report
        onUnlockReport(1);
        triggerLoreEvent('puzzleCompleted', { type: 'hieroglyph' });
        break;
        
      case PuzzleType.RADIO:
        // Completing radio puzzle unlocks the distress signal audio log
        onUnlockAudioLog('distressSignal');
        // Also reveals the Flame station
        onRevealStation('flame');
        triggerLoreEvent('puzzleCompleted', { type: 'radio' });
        break;
        
      case PuzzleType.CIPHER:
        // Completing cipher puzzle unlocks several reports
        onUnlockReport(2);
        onUnlockReport(3);
        triggerLoreEvent('puzzleCompleted', { type: 'cipher' });
        break;
        
      case PuzzleType.ORIENTATION_FILM:
        // Completing orientation film puzzle reveals all stations
        onRevealStation('swan');
        onRevealStation('pearl');
        onRevealStation('flame');
        onRevealStation('arrow');
        onRevealStation('staff');
        onRevealStation('orchid');
        // Also unlocks the orientation video
        onUnlockAudioLog('orientationVideo');
        triggerLoreEvent('puzzleCompleted', { type: 'orientation' });
        break;
        
      case PuzzleType.COORDINATES:
        // Completing coordinates puzzle unlocks a special audio log
        onUnlockAudioLog('unknownSource');
        // Also reveals a special station
        onRevealStation('staff');
        triggerLoreEvent('puzzleCompleted', { type: 'coordinates' });
        break;
    }
  };
  
  return (
    <>
      {/* Hieroglyph Puzzle */}
      <HieroglyphPuzzle 
        isVisible={activePuzzle === PuzzleType.HIEROGLYPH}
        onClose={handleClosePuzzle}
        onComplete={() => handleCompletePuzzle(PuzzleType.HIEROGLYPH)}
      />
      
      {/* Radio Puzzle */}
      <RadioPuzzle 
        isVisible={activePuzzle === PuzzleType.RADIO}
        onClose={handleClosePuzzle}
        onComplete={() => handleCompletePuzzle(PuzzleType.RADIO)}
      />
      
      {/* Cipher Puzzle */}
      <CipherPuzzle 
        isVisible={activePuzzle === PuzzleType.CIPHER}
        onClose={handleClosePuzzle}
        onComplete={() => handleCompletePuzzle(PuzzleType.CIPHER)}
      />
      
      {/* Orientation Film Puzzle */}
      <OrientationFilmPuzzle 
        isVisible={activePuzzle === PuzzleType.ORIENTATION_FILM}
        onClose={handleClosePuzzle}
        onComplete={() => handleCompletePuzzle(PuzzleType.ORIENTATION_FILM)}
      />
      
      {/* Coordinates Puzzle */}
      <CoordinatesPuzzle 
        isVisible={activePuzzle === PuzzleType.COORDINATES}
        onClose={handleClosePuzzle}
        onComplete={() => handleCompletePuzzle(PuzzleType.COORDINATES)}
      />
    </>
  );
};

export default PuzzleController;