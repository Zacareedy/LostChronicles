import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import HieroglyphPuzzle from './HieroglyphPuzzle';
import RadioPuzzle from './RadioPuzzle';
import CoordinatesPuzzle from './CoordinatesPuzzle';
import SubnetInterface from './SubnetInterface';
import BlackBoxArchive from './BlackBoxArchive';
import ProjectCandle from './ProjectCandle';
import { playSound } from '@/lib/audio';

// Define puzzle types
enum PuzzleType {
  NONE = '',
  HIEROGLYPH = 'hieroglyph',
  RADIO = 'radio',
  COORDINATES = 'coordinates',
  SUBNET = 'subnet',
  BLACKBOX = 'blackbox',
  CANDLE = 'candle'
}

// Props for PuzzleController
interface PuzzleControllerProps {
  onRevealStation: (stationName: string) => void;
  onUnlockReport: (reportId: number) => void;
  onUnlockAudioLog: (logId: string) => void;
}

// Ref type for external access to controller methods
export interface PuzzleControllerRef {
  launchPuzzle: (puzzleId: string) => void;
}

// Main component using forwardRef
const PuzzleController = forwardRef<PuzzleControllerRef, PuzzleControllerProps>(function PuzzleController(props, ref) {
  const { onRevealStation, onUnlockReport, onUnlockAudioLog } = props;
  const [activePuzzle, setActivePuzzle] = useState<PuzzleType>(PuzzleType.NONE);
  
  // Helper function to map puzzle ID to PuzzleType
  const mapPuzzleIdToPuzzleType = (puzzleId: string): PuzzleType => {
    switch (puzzleId) {
      case 'hieroglyph': return PuzzleType.HIEROGLYPH;
      case 'radio': return PuzzleType.RADIO;
      case 'coordinates': return PuzzleType.COORDINATES;
      case 'subnet': return PuzzleType.SUBNET;
      case 'blackbox': return PuzzleType.BLACKBOX;
      case 'candle': return PuzzleType.CANDLE;
      default: return PuzzleType.NONE;
    }
  };
  
  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    launchPuzzle: (puzzleId: string) => {
      console.log(`PuzzleController: directly launching puzzle ${puzzleId}`);
      const puzzleType = mapPuzzleIdToPuzzleType(puzzleId);
      if (puzzleType !== PuzzleType.NONE) {
        openPuzzle(puzzleType);
      }
    }
  }));

  // Check for active puzzles in localStorage
  useEffect(() => {
    try {
      const puzzleToActivate = localStorage.getItem('dharma_active_puzzle');
      if (puzzleToActivate) {
        // Clear the flag
        localStorage.removeItem('dharma_active_puzzle');
        
        // Map the puzzle ID to a PuzzleType
        const puzzleType = mapPuzzleIdToPuzzleType(puzzleToActivate);
        
        if (puzzleType !== PuzzleType.NONE) {
          // Open the puzzle
          openPuzzle(puzzleType);
        }
      }
    } catch (e) {
      // Ignore localStorage errors but log them in dev
      console.error('Error checking for active puzzle:', e);
    }
  }, []);
  
  // Open a puzzle
  const openPuzzle = (puzzleType: PuzzleType) => {
    setActivePuzzle(puzzleType);
    playSound('beep');
  };
  
  // Close current puzzle
  const closePuzzle = () => {
    setActivePuzzle(PuzzleType.NONE);
    playSound('click');
  };
  
  // Handle puzzle completion
  const handleCompletePuzzle = (puzzleType: PuzzleType) => {
    // Process rewards based on completed puzzle
    switch (puzzleType) {
      case PuzzleType.HIEROGLYPH:
        // Hieroglyph puzzle rewards
        onRevealStation('Swan');
        onUnlockReport(1);
        break;
        
      case PuzzleType.RADIO:
        // Radio puzzle rewards
        onRevealStation('Flame');
        onUnlockAudioLog('orientation');
        
        // Add crash site to map after radio puzzle is completed
        try {
          localStorage.setItem('dharma_radio_puzzle_completed', 'true');
          
          // Add new hidden locations to the map
          const hiddenLocations = JSON.parse(localStorage.getItem('dharma_hidden_locations') || '[]');
          if (!hiddenLocations.includes('crash-site')) {
            hiddenLocations.push('crash-site');
            localStorage.setItem('dharma_hidden_locations', JSON.stringify(hiddenLocations));
          }
          
          // Show a terminal message about the crash site
          const terminalLogs = JSON.parse(localStorage.getItem('dharma_terminal_logs') || '[]');
          terminalLogs.push({
            message: '> [ALERT] Signal triangulation complete. Flight 815 crash site coordinates identified.',
            timestamp: Date.now()
          });
          localStorage.setItem('dharma_terminal_logs', JSON.stringify(terminalLogs));
        } catch (e) {
          console.error('Error storing radio puzzle completion state:', e);
        }
        break;
        
      case PuzzleType.COORDINATES:
        // Coordinates puzzle rewards
        onRevealStation('Pearl');
        onUnlockReport(2);
        break;
        
      case PuzzleType.SUBNET:
        // Subnet interface rewards
        onRevealStation('Arrow');
        onUnlockAudioLog('dharma_log_1');
        break;
        
      case PuzzleType.BLACKBOX:
        // Black box archive rewards
        onRevealStation('Staff');
        onUnlockReport(3);
        onUnlockAudioLog('system_failure');
        break;
        
      case PuzzleType.CANDLE:
        // Project Candle rewards
        onRevealStation('Orchid');
        onUnlockReport(4);
        onUnlockAudioLog('valenzetti');
        break;
    }
    
    // Close the puzzle
    closePuzzle();
  };
  
  // Helper to determine if a puzzle should be active
  const isPuzzleActive = (puzzleType: PuzzleType) => {
    return activePuzzle === puzzleType;
  };
  
  return (
    <>
      {/* Hieroglyph Puzzle */}
      <HieroglyphPuzzle
        isVisible={isPuzzleActive(PuzzleType.HIEROGLYPH)}
        onClose={closePuzzle}
        onComplete={() => handleCompletePuzzle(PuzzleType.HIEROGLYPH)}
      />
      
      {/* Radio Puzzle */}
      <RadioPuzzle
        isVisible={isPuzzleActive(PuzzleType.RADIO)}
        onClose={closePuzzle}
        onComplete={() => handleCompletePuzzle(PuzzleType.RADIO)}
      />
      
      {/* Coordinates Puzzle */}
      <CoordinatesPuzzle
        isVisible={isPuzzleActive(PuzzleType.COORDINATES)}
        onClose={closePuzzle}
        onComplete={() => handleCompletePuzzle(PuzzleType.COORDINATES)}
      />
      
      {/* Subnet Interface */}
      <SubnetInterface
        isVisible={isPuzzleActive(PuzzleType.SUBNET)}
        onClose={closePuzzle}
        onComplete={() => handleCompletePuzzle(PuzzleType.SUBNET)}
      />
      
      {/* Black Box Archive */}
      <BlackBoxArchive
        isVisible={isPuzzleActive(PuzzleType.BLACKBOX)}
        onClose={closePuzzle}
        onComplete={() => handleCompletePuzzle(PuzzleType.BLACKBOX)}
      />
      
      {/* Project Candle */}
      <ProjectCandle
        isVisible={isPuzzleActive(PuzzleType.CANDLE)}
        onClose={closePuzzle}
        onComplete={() => handleCompletePuzzle(PuzzleType.CANDLE)}
      />
    </>
  );
});

export default PuzzleController;