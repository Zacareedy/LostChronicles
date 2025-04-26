import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, PencilRuler, History, Key } from 'lucide-react';
import { playSound } from '@/lib/audio';

interface HieroglyphPuzzleProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type Hieroglyph = {
  id: string;
  symbol: string;
  meaning: string;
  clue: string;
};

const HieroglyphPuzzle: React.FC<HieroglyphPuzzleProps> = ({ isVisible, onClose, onComplete }) => {
  // The hieroglyphs that need to be arranged in the correct order
  const [hieroglyphs, setHieroglyphs] = useState<Hieroglyph[]>([
    {
      id: 'ankh',
      symbol: '☥',
      meaning: 'Life',
      clue: 'The beginning of all things'
    },
    {
      id: 'eye',
      symbol: '𓂀',
      meaning: 'Sight',
      clue: 'To observe and record'
    },
    {
      id: 'djed',
      symbol: '𓊽',
      meaning: 'Stability',
      clue: 'The pillar that sustains'
    },
    {
      id: 'scarab',
      symbol: '𓆣',
      meaning: 'Transformation',
      clue: 'Renewal through change'
    },
    {
      id: 'falcon',
      symbol: '𓅓',
      meaning: 'Vision',
      clue: 'The highest perspective'
    }
  ]);
  
  // The sequence the user is building
  const [selectedSequence, setSelectedSequence] = useState<string[]>([]);
  // Whether the submitted sequence is correct
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  // Number of attempts
  const [attempts, setAttempts] = useState<number>(0);
  // Show solution hint after several failed attempts
  const [showHint, setShowHint] = useState<boolean>(false);
  
  // The correct sequence IDs
  const CORRECT_SEQUENCE = ['ankh', 'eye', 'falcon', 'scarab', 'djed'];
  
  // Check if the right number of attempts has been made to show a hint
  useEffect(() => {
    if (attempts >= 3 && !showHint) {
      setShowHint(true);
    }
  }, [attempts]);
  
  // Add a hieroglyph to the sequence
  const addToSequence = (id: string) => {
    // Only allow adding if we haven't already found the correct sequence
    if (isCorrect) return;
    
    // Don't add if already in the sequence
    if (selectedSequence.includes(id)) return;
    
    // Add to the sequence
    setSelectedSequence(prev => [...prev, id]);
    playSound('beep', 'short');
  };
  
  // Remove a hieroglyph from the sequence
  const removeFromSequence = (index: number) => {
    // Only allow removing if we haven't already found the correct sequence
    if (isCorrect) return;
    
    setSelectedSequence(prev => prev.filter((_, i) => i !== index));
    playSound('beep', 'short');
  };
  
  // Clear the entire sequence
  const clearSequence = () => {
    // Only allow clearing if we haven't already found the correct sequence
    if (isCorrect) return;
    
    setSelectedSequence([]);
    playSound('beep');
  };
  
  // Check if the sequence is correct
  const checkSequence = () => {
    // Only proceed if all spots are filled
    if (selectedSequence.length !== CORRECT_SEQUENCE.length) return;
    
    // Check if it matches the correct sequence
    const isSequenceCorrect = selectedSequence.every((id, index) => id === CORRECT_SEQUENCE[index]);
    
    if (isSequenceCorrect) {
      setIsCorrect(true);
      playSound('success');
      
      // Trigger completion after a brief delay
      setTimeout(() => {
        onComplete();
      }, 2000);
    } else {
      // Increment attempts
      setAttempts(prev => prev + 1);
      playSound('fail');
      
      // Clear the sequence after a failure
      setTimeout(() => {
        setSelectedSequence([]);
      }, 1500);
    }
  };
  
  // Get the hieroglyph data from its ID
  const getHieroglyphById = (id: string): Hieroglyph | undefined => {
    return hieroglyphs.find(glyph => glyph.id === id);
  };
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-[hsl(var(--dharma-black))] border-2 border-[hsl(var(--dharma-gray))] p-5 rounded max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[hsl(var(--dharma-green))] font-terminal text-lg flex items-center gap-2">
            <PencilRuler className="h-5 w-5" />
            DHARMA HIEROGLYPHICS DECODER
          </h2>
          <button 
            onClick={onClose}
            className="text-[hsl(var(--dharma-gray))] hover:text-[hsl(var(--dharma-red))]"
          >
            ✕
          </button>
        </div>
        
        {/* Main puzzle area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column: Hieroglyphs and their meanings */}
          <div>
            <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 border border-[hsl(var(--dharma-gray))] mb-4">
              <h3 className="text-[hsl(var(--dharma-white))] text-sm mb-3">AVAILABLE HIEROGLYPHS</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {hieroglyphs.map(glyph => (
                  <div 
                    key={glyph.id}
                    onClick={() => addToSequence(glyph.id)}
                    className={`p-2 border cursor-pointer transition-colors ${
                      selectedSequence.includes(glyph.id)
                        ? 'border-[hsl(var(--dharma-amber))] bg-[hsla(var(--dharma-amber),0.1)]'
                        : 'border-[hsl(var(--dharma-gray))] bg-[hsla(var(--dharma-gray),0.05)] hover:bg-[hsla(var(--dharma-gray),0.1)]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-hieroglyph text-3xl text-[hsl(var(--dharma-white))]">
                        {glyph.symbol}
                      </div>
                      <div className="text-xs">
                        <div className="text-[hsl(var(--dharma-green))]">{glyph.meaning}</div>
                        <div className="text-[hsl(var(--dharma-gray))]">{glyph.clue}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Instructions */}
            <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 border border-[hsl(var(--dharma-gray))]">
              <div className="flex items-start gap-2 mb-2">
                <History className="h-4 w-4 mt-0.5 text-[hsl(var(--dharma-amber))]" />
                <h3 className="text-[hsl(var(--dharma-amber))] text-sm">DHARMA PROTOCOL NOTE:</h3>
              </div>
              
              <p className="text-[hsl(var(--dharma-white))] text-xs mb-2">
                Ancient hieroglyphs were discovered in the chamber beneath the Swan station. According to DHARMA records, they appear during electromagnetic anomalies and correspond to a specific sequence representing the facility's purpose.
              </p>
              
              <p className="text-[hsl(var(--dharma-white))] text-xs">
                Arrange the symbols in the correct order to access restricted information about the station's true function. Click on a symbol to add it to the sequence.
              </p>
            </div>
          </div>
          
          {/* Right column: Sequence selection and submission */}
          <div>
            <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 border border-[hsl(var(--dharma-gray))] mb-4">
              <h3 className="text-[hsl(var(--dharma-white))] text-sm mb-3">SELECTED SEQUENCE</h3>
              
              <div className="grid grid-cols-5 gap-2 mb-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div 
                    key={index}
                    onClick={() => selectedSequence[index] && removeFromSequence(index)}
                    className={`h-16 flex items-center justify-center border transition-colors ${
                      selectedSequence[index]
                        ? 'border-[hsl(var(--dharma-green))] bg-[hsla(var(--dharma-green),0.05)] cursor-pointer'
                        : 'border-[hsl(var(--dharma-gray))] bg-[hsla(var(--dharma-gray),0.05)]'
                    }`}
                  >
                    {selectedSequence[index] && (
                      <div className="font-hieroglyph text-3xl text-[hsl(var(--dharma-white))]">
                        {getHieroglyphById(selectedSequence[index])?.symbol}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={clearSequence}
                  disabled={selectedSequence.length === 0 || isCorrect}
                  className={`px-3 py-1 text-xs ${
                    selectedSequence.length === 0 || isCorrect
                      ? 'bg-[hsla(var(--dharma-gray),0.05)] text-[hsl(var(--dharma-gray))] border border-[hsl(var(--dharma-gray))]'
                      : 'bg-[hsla(var(--dharma-amber),0.1)] text-[hsl(var(--dharma-amber))] border border-[hsl(var(--dharma-amber))] hover:bg-[hsla(var(--dharma-amber),0.2)]'
                  }`}
                >
                  CLEAR SEQUENCE
                </button>
                
                <button
                  onClick={checkSequence}
                  disabled={selectedSequence.length !== 5 || isCorrect}
                  className={`px-3 py-1 text-xs ${
                    selectedSequence.length !== 5 || isCorrect
                      ? 'bg-[hsla(var(--dharma-gray),0.05)] text-[hsl(var(--dharma-gray))] border border-[hsl(var(--dharma-gray))]'
                      : 'bg-[hsla(var(--dharma-green),0.1)] text-[hsl(var(--dharma-green))] border border-[hsl(var(--dharma-green))] hover:bg-[hsla(var(--dharma-green),0.2)]'
                  }`}
                >
                  VALIDATE SEQUENCE
                </button>
              </div>
            </div>
            
            {/* Attempt counter and hints */}
            <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 border border-[hsl(var(--dharma-gray))]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[hsl(var(--dharma-white))] text-sm">DECODER STATUS</h3>
                <div className="text-xs text-[hsl(var(--dharma-gray))]">
                  Attempts: <span className="text-[hsl(var(--dharma-amber))]">{attempts}</span>
                </div>
              </div>
              
              {/* Status message */}
              {isCorrect ? (
                <div className="p-2 bg-[hsla(var(--dharma-green),0.1)] border border-[hsl(var(--dharma-bright-green))] text-center mb-3">
                  <div className="flex items-center justify-center gap-2 text-[hsl(var(--dharma-bright-green))] text-sm">
                    <Check className="h-4 w-4" />
                    <span>SEQUENCE VERIFIED</span>
                  </div>
                  <p className="text-[hsl(var(--dharma-green))] text-xs mt-1">
                    Accessing classified DHARMA Initiative records...
                  </p>
                </div>
              ) : (
                <div className={`p-2 ${
                  attempts > 0
                    ? 'bg-[hsla(var(--dharma-red),0.05)] border border-[hsl(var(--dharma-red))]'
                    : 'bg-[hsla(var(--dharma-gray),0.05)] border border-[hsl(var(--dharma-gray))]'
                } mb-3`}>
                  <p className={`text-xs ${
                    attempts > 0 ? 'text-[hsl(var(--dharma-red))]' : 'text-[hsl(var(--dharma-gray))]'
                  }`}>
                    {attempts > 0
                      ? `Invalid sequence. ${attempts >= 3 ? 'System lockout imminent.' : 'Please try again.'}`
                      : 'Awaiting sequence validation...'}
                  </p>
                </div>
              )}
              
              {/* Hint after multiple failed attempts */}
              {showHint && !isCorrect && (
                <div className="flex items-start gap-2 p-2 bg-[hsla(var(--dharma-amber),0.05)] border border-[hsl(var(--dharma-amber))]">
                  <Key className="h-3 w-3 mt-0.5 text-[hsl(var(--dharma-amber))]" />
                  <div className="text-xs text-[hsl(var(--dharma-amber))]">
                    <p className="font-bold mb-1">HINT:</p>
                    <p>
                      The sequence represents the DHARMA journey: It begins with life, continues through observation and elevated understanding, leading to transformation, and ends with stability.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HieroglyphPuzzle;