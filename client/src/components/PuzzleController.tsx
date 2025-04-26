import React, { useState } from 'react';
import { useLore } from '@/contexts/LoreContext';
import HieroglyphPuzzle from './HieroglyphPuzzle';
import RadioPuzzle from './RadioPuzzle';
import CoordinatesPuzzle from './CoordinatesPuzzle';
import { playSound } from '@/lib/audio';

enum PuzzleType {
  NONE = '',
  HIEROGLYPH = 'hieroglyph',
  RADIO = 'radio',
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
  const { completePuzzle } = useLore();
  const [activePuzzle, setActivePuzzle] = useState<PuzzleType>(PuzzleType.NONE);
  
  // Called to open a puzzle interface
  const openPuzzle = (puzzleType: PuzzleType) => {
    setActivePuzzle(puzzleType);
    playSound('select');
  };
  
  // Called when the user closes a puzzle interface
  const closePuzzle = () => {
    setActivePuzzle(PuzzleType.NONE);
    playSound('click');
  };
  
  // Called when a puzzle is completed successfully
  const handleCompletePuzzle = (puzzleType: PuzzleType) => {
    playSound('success');
    
    // Mark the puzzle as completed in the LoreContext
    completePuzzle(puzzleType);
    
    // Process rewards based on which puzzle was completed
    switch (puzzleType) {
      case PuzzleType.HIEROGLYPH:
        // Reveal the Swan station
        onRevealStation('swan');
        // Unlock an incident report
        onUnlockReport(1);
        break;
        
      case PuzzleType.RADIO:
        // Reveal the Flame station
        onRevealStation('flame');
        // Unlock an audio log
        onUnlockAudioLog('orientation_recording');
        break;
        
      case PuzzleType.COORDINATES:
        // Reveal the Looking Glass station
        onRevealStation('looking_glass');
        // Unlock a related report
        onUnlockReport(3);
        break;
    }
    
    // Close the puzzle interface
    closePuzzle();
  };
  
  return (
    <>
      {/* Hieroglyph Puzzle */}
      <HieroglyphPuzzle
        isVisible={activePuzzle === PuzzleType.HIEROGLYPH}
        onClose={closePuzzle}
        onComplete={() => handleCompletePuzzle(PuzzleType.HIEROGLYPH)}
      />
      
      {/* Radio Signal Puzzle */}
      <RadioPuzzle
        isVisible={activePuzzle === PuzzleType.RADIO}
        onClose={closePuzzle}
        onComplete={() => handleCompletePuzzle(PuzzleType.RADIO)}
      />
      
      {/* Coordinates Puzzle */}
      <CoordinatesPuzzle
        isVisible={activePuzzle === PuzzleType.COORDINATES}
        onClose={closePuzzle}
        onComplete={() => handleCompletePuzzle(PuzzleType.COORDINATES)}
      />
      
      {/* This would normally be rendered elsewhere in the application as buttons or triggers */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 p-2 bg-black bg-opacity-70 rounded z-40">
          <div className="text-white text-xs mb-2">Developer Controls</div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => openPuzzle(PuzzleType.HIEROGLYPH)}
              className="px-2 py-1 bg-blue-800 text-white text-xs rounded"
            >
              Open Hieroglyph Puzzle
            </button>
            <button
              onClick={() => openPuzzle(PuzzleType.RADIO)}
              className="px-2 py-1 bg-blue-800 text-white text-xs rounded"
            >
              Open Radio Puzzle
            </button>
            <button
              onClick={() => openPuzzle(PuzzleType.COORDINATES)}
              className="px-2 py-1 bg-blue-800 text-white text-xs rounded"
            >
              Open Coordinates Puzzle
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PuzzleController;