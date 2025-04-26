import React, { useState, useEffect } from 'react';
import HieroglyphPuzzle from './HieroglyphPuzzle';
import RadioPuzzle from './RadioPuzzle';
import CoordinatesPuzzle from './CoordinatesPuzzle';
import SubnetInterface from './SubnetInterface';
import BlackBoxArchive from './BlackBoxArchive';
import ProjectCandle from './ProjectCandle';
import VoidDirectory from './VoidDirectory';
import { playSound } from '@/lib/audio';

enum PuzzleType {
  NONE = '',
  HIEROGLYPH = 'hieroglyph',
  RADIO = 'radio',
  COORDINATES = 'coordinates',
  SUBNET = 'subnet',
  BLACKBOX = 'blackbox',
  CANDLE = 'candle',
  VOID = 'void'
}

interface PuzzleControllerProps {
  onRevealStation: (stationName: string) => void;
  onUnlockReport: (reportId: number) => void;
  onUnlockAudioLog: (logId: string) => void;
}

const PuzzleController: React.FC<PuzzleControllerProps> = ({
  onRevealStation,
  onUnlockReport,
  onUnlockAudioLog,
}) => {
  const [activePuzzle, setActivePuzzle] = useState<PuzzleType>(PuzzleType.NONE);
  const [loopCount, setLoopCount] = useState<number>(0);
  
  // Check if a puzzle should be opened from localStorage flags
  useEffect(() => {
    try {
      const puzzleToActivate = localStorage.getItem('dharma_active_puzzle');
      if (puzzleToActivate) {
        // Clear the flag
        localStorage.removeItem('dharma_active_puzzle');
        
        // Map the puzzle ID to a PuzzleType
        let puzzleType: PuzzleType = PuzzleType.NONE;
        
        switch (puzzleToActivate) {
          case 'hieroglyph':
            puzzleType = PuzzleType.HIEROGLYPH;
            break;
          case 'radio':
            puzzleType = PuzzleType.RADIO;
            break;
          case 'coordinates':
            puzzleType = PuzzleType.COORDINATES;
            break;
          case 'subnet':
            puzzleType = PuzzleType.SUBNET;
            break;
          case 'blackbox':
            puzzleType = PuzzleType.BLACKBOX;
            break;
          case 'candle':
            puzzleType = PuzzleType.CANDLE;
            break;
          case 'void':
            puzzleType = PuzzleType.VOID;
            break;
        }
        
        if (puzzleType !== PuzzleType.NONE) {
          // Open the puzzle
          openPuzzle(puzzleType);
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);
  
  const openPuzzle = (puzzleType: PuzzleType) => {
    setActivePuzzle(puzzleType);
    playSound('beep');
  };
  
  const closePuzzle = () => {
    setActivePuzzle(PuzzleType.NONE);
    playSound('click');
  };
  
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
        
      case PuzzleType.VOID:
        // Void directory rewards - increments loop count
        setLoopCount(prev => prev + 1);
        onUnlockReport(5);
        onUnlockAudioLog('whisper');
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
      
      {/* Void Directory */}
      <VoidDirectory
        isVisible={isPuzzleActive(PuzzleType.VOID)}
        onClose={closePuzzle}
        onComplete={() => handleCompletePuzzle(PuzzleType.VOID)}
        loopCount={loopCount}
      />
    </>
  );
};

export default PuzzleController;