import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TapeSquare } from 'lucide-react';
import { playSound } from '@/lib/audio';

// Map of DHARMA-related hieroglyphs
const HIEROGLYPHS = [
  { symbol: '𓇋', name: 'reed', meaning: 'time', type: 'black' },
  { symbol: '𓂀', name: 'eye', meaning: 'sight', type: 'black' },
  { symbol: '𓇯', name: 'sun', meaning: 'life', type: 'black' },
  { symbol: '𓈖', name: 'water', meaning: 'rebirth', type: 'black' },
  { symbol: '𓅱', name: 'quail chick', meaning: 'beginning', type: 'black' },
  { symbol: '𓊪', name: 'square', meaning: 'containment', type: 'black' },
  { symbol: '𓄿', name: 'arm', meaning: 'power', type: 'red' },
  { symbol: '𓁶', name: 'face', meaning: 'witness', type: 'red' },
  { symbol: '𓃀', name: 'leg', meaning: 'journey', type: 'red' },
  { symbol: '𓆣', name: 'cobra', meaning: 'danger', type: 'red' },
  { symbol: '𓆓', name: 'seal', meaning: 'protection', type: 'red' },
  { symbol: '𓂧', name: 'hand', meaning: 'action', type: 'red' },
];

// The correct sequence that represents "power containment rebirth danger"
const CORRECT_SEQUENCE = ['𓄿', '𓊪', '𓈖', '𓆣'];

interface HieroglyphPuzzleProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const HieroglyphPuzzle: React.FC<HieroglyphPuzzleProps> = ({ isVisible, onClose, onComplete }) => {
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [shuffledHieroglyphs, setShuffledHieroglyphs] = useState<typeof HIEROGLYPHS>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [clueFound, setClueFound] = useState(false);
  
  // Shuffle the hieroglyphs on mount
  useEffect(() => {
    const shuffled = [...HIEROGLYPHS].sort(() => Math.random() - 0.5);
    setShuffledHieroglyphs(shuffled);
  }, []);
  
  // Check if the selected sequence matches the correct sequence
  useEffect(() => {
    if (selectedSymbols.length === 4) {
      if (selectedSymbols.join('') === CORRECT_SEQUENCE.join('')) {
        setIsCorrect(true);
        playSound('success');
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        setError('Incorrect sequence. Try again.');
        playSound('fail');
        setAttempts(prev => prev + 1);
        setTimeout(() => {
          setSelectedSymbols([]);
          setError(null);
        }, 1500);
      }
    }
  }, [selectedSymbols, onComplete]);
  
  // Show hints based on number of attempts
  useEffect(() => {
    if (attempts === 3) {
      setHint('Hint: The sequence represents "power containment rebirth danger"');
    } else if (attempts === 5) {
      setHint('Hint: Look for the arm, square, water, and cobra symbols');
    } else if (attempts === 7) {
      setHint('Hint: The order is arm, square, water, cobra');
    }
  }, [attempts]);
  
  // Handle symbol click
  const handleSymbolClick = (symbol: string) => {
    if (selectedSymbols.length < 4 && !isCorrect) {
      setSelectedSymbols(prev => [...prev, symbol]);
      playSound('beep', 'short');
    }
  };
  
  // Reset the puzzle
  const handleReset = () => {
    setSelectedSymbols([]);
    setError(null);
    playSound('beep');
  };
  
  // Find additional clue
  const findClue = () => {
    setClueFound(true);
    playSound('beep');
  };
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-[hsl(var(--dharma-black))] border-2 border-[hsl(var(--dharma-gray))] p-5 rounded max-w-lg w-full relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[hsl(var(--dharma-green))] font-terminal text-lg">DHARMA HIEROGLYPHS</h2>
          <button 
            onClick={onClose}
            className="text-[hsl(var(--dharma-gray))] hover:text-[hsl(var(--dharma-red))]"
          >
            ✕
          </button>
        </div>
        
        <div className="bg-[hsla(var(--dharma-gray),0.1)] p-4 rounded mb-4">
          <p className="text-[hsl(var(--dharma-green))] font-terminal text-sm mb-2">
            DECODE THE HIEROGLYPHIC SEQUENCE FROM ANCIENT CHAMBER BENEATH THE SWAN STATION.
          </p>
          
          <p className="text-[hsl(var(--dharma-amber))] font-terminal text-xs mb-4">
            SELECT 4 SYMBOLS IN THE CORRECT ORDER.
          </p>
          
          {/* Selected symbols display */}
          <div className="flex justify-center gap-4 mb-6 h-16 items-center">
            {[0, 1, 2, 3].map((index) => (
              <div 
                key={index}
                className={`w-14 h-14 border border-[hsl(var(--dharma-gray))] flex items-center justify-center text-3xl
                  ${selectedSymbols[index] ? 'bg-[hsla(var(--dharma-gray),0.2)]' : 'bg-[hsla(var(--dharma-gray),0.05)]'}`}
              >
                {selectedSymbols[index] || ''}
              </div>
            ))}
          </div>
          
          {error && (
            <div className="text-[hsl(var(--dharma-red))] text-center font-terminal text-sm mb-4">
              {error}
            </div>
          )}
          
          {hint && (
            <div className="text-[hsl(var(--dharma-amber))] text-center font-terminal text-xs mb-4">
              {hint}
            </div>
          )}
          
          {isCorrect && (
            <div className="text-[hsl(var(--dharma-bright-green))] text-center font-terminal text-sm mb-4">
              SEQUENCE ACCEPTED. ACCESSING SWAN STATION PROTOCOLS.
            </div>
          )}
          
          {/* Hieroglyphs grid */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {shuffledHieroglyphs.map((glyph, index) => (
              <button
                key={index}
                onClick={() => handleSymbolClick(glyph.symbol)}
                disabled={isCorrect}
                className={`w-full aspect-square border border-[hsl(var(--dharma-gray))] flex items-center justify-center text-3xl
                  ${glyph.type === 'red' ? 'text-[hsl(var(--dharma-red))]' : 'text-[hsl(var(--dharma-green))]'}
                  ${selectedSymbols.includes(glyph.symbol) ? 'opacity-40' : 'hover:bg-[hsla(var(--dharma-gray),0.2)]'}`}
              >
                {glyph.symbol}
              </button>
            ))}
          </div>
          
          {/* Clue and reset buttons */}
          <div className="flex justify-between">
            <button
              onClick={findClue}
              disabled={clueFound}
              className={`px-3 py-1 bg-[hsla(var(--dharma-gray),0.1)] border border-[hsl(var(--dharma-gray))] text-xs
                ${clueFound ? 'text-[hsl(var(--dharma-gray))]' : 'text-[hsl(var(--dharma-amber))] hover:bg-[hsla(var(--dharma-gray),0.2)]'}`}
            >
              FIND CLUE
            </button>
            
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-[hsla(var(--dharma-gray),0.1)] border border-[hsl(var(--dharma-gray))] text-xs text-[hsl(var(--dharma-green))] hover:bg-[hsla(var(--dharma-gray),0.2)]"
            >
              RESET
            </button>
          </div>
        </div>
        
        {/* Display clue when found */}
        {clueFound && (
          <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 rounded mb-4 border border-[hsl(var(--dharma-amber))]">
            <div className="flex items-center gap-2 mb-2">
              <TapeSquare className="h-4 w-4 text-[hsl(var(--dharma-amber))]" />
              <h3 className="text-[hsl(var(--dharma-amber))] font-terminal text-sm">RECOVERED JOURNAL EXCERPT:</h3>
            </div>
            <p className="text-[hsl(var(--dharma-white))] font-terminal text-xs leading-relaxed">
              "...discovered the chamber beneath the Swan. The wall contains hieroglyphs describing the containment protocols.
              The sequence represents the core function: <span className="text-[hsl(var(--dharma-bright-green))]">to harness power, contain it safely, ensure rebirth of normal conditions, and prevent the danger of release</span>.
              Alpert claims these same symbols appear on the ancient temple walls..."
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HieroglyphPuzzle;