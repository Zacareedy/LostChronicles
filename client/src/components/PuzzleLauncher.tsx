import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Puzzle, 
  Radio, 
  MapPin, 
  Network, 
  Package, 
  Flame, 
  FileQuestion,
  X,
  Terminal
} from 'lucide-react';
import { playSound } from '@/lib/audio';

interface PuzzleLauncherProps {
  onLaunchPuzzle: (puzzleId: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

const PuzzleLauncher: React.FC<PuzzleLauncherProps> = ({ 
  onLaunchPuzzle, 
  isVisible, 
  onClose 
}) => {
  const [devMode, setDevMode] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  // Password for dev mode is "dharma"
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.toLowerCase() === 'dharma') {
      setDevMode(true);
      playSound('success');
    } else {
      playSound('error');
    }
    setPasswordInput('');
  };
  
  const puzzles = [
    { 
      id: 'hieroglyph', 
      name: 'Hieroglyph Decoder', 
      description: 'Decode the mysterious hieroglyphs from the Swan Station countdown.', 
      icon: <Puzzle className="h-5 w-5" />,
      difficulty: 'Easy'
    },
    { 
      id: 'radio', 
      name: 'Numbers Transmission', 
      description: 'Tune into the special frequencies to hear the Numbers broadcast.', 
      icon: <Radio className="h-5 w-5" />,
      difficulty: 'Medium'
    },
    { 
      id: 'coordinates', 
      name: 'Station Coordinates', 
      description: 'Plot coordinates to discover hidden DHARMA stations.', 
      icon: <MapPin className="h-5 w-5" />,
      difficulty: 'Medium'
    },
    { 
      id: 'subnet', 
      name: 'Subnet Protocol', 
      description: 'Access the hidden DHARMA communication system.', 
      icon: <Network className="h-5 w-5" />,
      difficulty: 'Hard'
    },
    { 
      id: 'blackbox', 
      name: 'Black Box Archive', 
      description: 'Recover data from the crashed DHARMA plane.', 
      icon: <Package className="h-5 w-5" />,
      difficulty: 'Hard',
      requiresDevMode: true
    },
    { 
      id: 'candle', 
      name: 'Project Candle', 
      description: 'Synchronize multiple stations to activate Protocol Candle.', 
      icon: <Flame className="h-5 w-5" />,
      difficulty: 'Very Hard',
      requiresDevMode: true
    },
    { 
      id: 'void', 
      name: 'The Void Directory', 
      description: 'Communicate with the mysterious entity beyond the system.', 
      icon: <FileQuestion className="h-5 w-5" />,
      difficulty: 'Extreme',
      requiresDevMode: true
    }
  ];
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-[hsl(var(--dharma-black))] border-2 border-[hsl(var(--dharma-gray))] p-5 rounded max-w-4xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[hsl(var(--dharma-amber))] font-terminal text-lg flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            DHARMA INITIATIVE PUZZLE INTERFACE
          </h2>
          
          <button 
            onClick={onClose}
            className="text-[hsl(var(--dharma-gray))] hover:text-[hsl(var(--dharma-red))]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {!devMode && (
          <div className="mb-6 bg-[hsla(var(--dharma-amber),0.1)] p-3 border border-[hsl(var(--dharma-amber))] rounded">
            <p className="text-[hsl(var(--dharma-amber))] text-sm">
              NOTICE: Some experimental puzzles require developer mode access.
            </p>
            <form onSubmit={handlePasswordSubmit} className="mt-2 flex gap-2">
              <input
                type="password"
                placeholder="Enter access code"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="flex-1 bg-[hsla(var(--dharma-black),0.7)] border border-[hsl(var(--dharma-gray))] p-2 text-xs text-[hsl(var(--dharma-green))]"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-[hsla(var(--dharma-amber),0.1)] text-[hsl(var(--dharma-amber))] border border-[hsl(var(--dharma-amber))] text-xs"
              >
                ENABLE DEV MODE
              </button>
            </form>
          </div>
        )}
        
        {devMode && (
          <div className="mb-6 bg-[hsla(var(--dharma-green),0.1)] p-3 border border-[hsl(var(--dharma-green))] rounded">
            <p className="text-[hsl(var(--dharma-green))] text-sm flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-[hsl(var(--dharma-green))] rounded-full animate-pulse"></span>
              DEVELOPER MODE ACTIVE - All puzzles accessible
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {puzzles.map((puzzle) => (
            <div 
              key={puzzle.id}
              className={`border p-4 rounded ${
                (!puzzle.requiresDevMode || devMode)
                  ? 'border-[hsl(var(--dharma-gray))] hover:border-[hsl(var(--dharma-amber))] cursor-pointer'
                  : 'border-[hsla(var(--dharma-gray),0.3)] opacity-50 cursor-not-allowed'
              }`}
              onClick={() => {
                if (!puzzle.requiresDevMode || devMode) {
                  onLaunchPuzzle(puzzle.id);
                  playSound('click');
                  onClose();
                } else {
                  playSound('error');
                }
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 ${
                  (!puzzle.requiresDevMode || devMode)
                    ? 'text-[hsl(var(--dharma-amber))]'
                    : 'text-[hsl(var(--dharma-gray))]'
                }`}>
                  {puzzle.icon}
                </div>
                
                <div>
                  <h3 className={`${
                    (!puzzle.requiresDevMode || devMode)
                      ? 'text-[hsl(var(--dharma-white))]'
                      : 'text-[hsl(var(--dharma-gray))]'
                  } font-terminal text-sm mb-1`}>
                    {puzzle.name}
                    {puzzle.requiresDevMode && !devMode && (
                      <span className="ml-2 text-[hsl(var(--dharma-gray))] text-xs">[LOCKED]</span>
                    )}
                  </h3>
                  
                  <p className={`${
                    (!puzzle.requiresDevMode || devMode)
                      ? 'text-[hsl(var(--dharma-gray))]'
                      : 'text-[hsla(var(--dharma-gray),0.5)]'
                  } text-xs mb-2`}>
                    {puzzle.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${
                      puzzle.difficulty === 'Easy' 
                        ? 'text-[hsl(var(--dharma-green))]' 
                        : puzzle.difficulty === 'Medium'
                          ? 'text-[hsl(var(--dharma-amber))]'
                          : puzzle.difficulty === 'Hard'
                            ? 'text-[hsl(var(--dharma-yellow))]'
                            : 'text-[hsl(var(--dharma-red))]'
                    }`}>
                      Difficulty: {puzzle.difficulty}
                    </span>
                    
                    {puzzle.requiresDevMode && (
                      <span className="text-xs text-[hsl(var(--dharma-gray))]">
                        Developer access required
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center text-[hsl(var(--dharma-gray))] text-xs">
          DHARMA Initiative Terminal Module v4.8.15.16.23.42
        </div>
      </div>
    </motion.div>
  );
};

export default PuzzleLauncher;