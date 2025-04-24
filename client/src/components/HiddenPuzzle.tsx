import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DHARMA_NUMBERS } from '@/lib/constants';
import { playSound } from '@/lib/audio';

interface HiddenPuzzleProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const HiddenPuzzle: React.FC<HiddenPuzzleProps> = ({ isVisible, onClose, onComplete }) => {
  const [numbers, setNumbers] = useState<number[]>([...DHARMA_NUMBERS].sort(() => Math.random() - 0.5));
  const [sequence, setSequence] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    playSound('button');
    dragItem.current = index;
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    
    // Add the dropped number to the sequence
    if (dragItem.current !== null && dragItem.current < numbers.length) {
      const droppedNumber = numbers[dragItem.current];
      
      // Create a new sequence with the dropped number
      const newSequence = [...sequence];
      newSequence[index] = droppedNumber;
      setSequence(newSequence);
      
      // Remove the number from the available numbers
      const newNumbers = [...numbers];
      newNumbers.splice(dragItem.current, 1);
      setNumbers(newNumbers);
      
      playSound('button');
    }
    
    dragItem.current = null;
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleReset = () => {
    // Reset the puzzle
    setNumbers([...DHARMA_NUMBERS].sort(() => Math.random() - 0.5));
    setSequence([]);
    setIsCorrect(null);
    playSound('button');
  };

  const handleVerify = () => {
    // Check if all numbers are placed
    if (sequence.filter(Boolean).length !== 6) {
      playSound('fail');
      setIsCorrect(false);
      return;
    }
    
    // Check if sequence matches DHARMA_NUMBERS
    const isSequenceCorrect = sequence.every((num, index) => num === DHARMA_NUMBERS[index]);
    
    if (isSequenceCorrect) {
      playSound('success');
      setIsCorrect(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } else {
      playSound('fail');
      setIsCorrect(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-[hsla(var(--dharma-black),0.9)] flex items-center justify-center"
        >
          <motion.div 
            className="max-w-2xl w-full bg-[hsl(var(--dharma-black))] border border-[hsla(var(--dharma-gray),0.3)] rounded-lg p-6 relative"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <button 
              onClick={() => {
                playSound('button');
                onClose();
              }}
              className="absolute top-4 right-4 text-[hsl(var(--dharma-amber))] hover:text-[hsl(var(--dharma-red))]"
            >
              ×
            </button>
            
            <h2 className="font-terminal text-[hsl(var(--dharma-amber))] text-xl mb-4">VALENZETTI EQUATION</h2>
            
            <div className="border border-[hsla(var(--dharma-gray),0.3)] p-4 font-mono">
              <p className="text-[hsl(var(--dharma-gray))] mb-4">Arrange the factors in the correct sequence to unlock the failsafe:</p>
              
              <div className="grid grid-cols-6 gap-2 mb-6">
                {/* Draggable Number Tiles */}
                {numbers.map((number, index) => (
                  <motion.div
                    key={index}
                    className="border border-[hsla(var(--dharma-gray),0.5)] rounded p-2 text-center text-[hsl(var(--dharma-amber))] bg-[hsla(var(--dharma-gray),0.2)] cursor-move"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {number}
                  </motion.div>
                ))}
                
                {/* Fill empty slots if there are less than 6 numbers */}
                {Array(6 - numbers.length).fill(0).map((_, index) => (
                  <div 
                    key={`empty-${index}`}
                    className="border border-[hsla(var(--dharma-gray),0.2)] rounded p-2 h-10"
                  />
                ))}
              </div>
              
              <div className="grid grid-cols-6 gap-2 mb-6">
                {/* Droppable Target Areas */}
                {Array(6).fill(0).map((_, index) => (
                  <div 
                    key={`target-${index}`}
                    className={`border border-dashed border-[hsla(var(--dharma-gray),0.3)] rounded p-2 h-10 flex items-center justify-center ${sequence[index] ? 'border-solid border-[hsla(var(--dharma-amber),0.5)]' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    {sequence[index] !== undefined && (
                      <span className="text-[hsl(var(--dharma-amber))]">{sequence[index]}</span>
                    )}
                  </div>
                ))}
              </div>
              
              {isCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mb-4 text-center ${isCorrect ? 'text-[hsl(var(--dharma-green))]' : 'text-[hsl(var(--dharma-red))]'}`}
                >
                  {isCorrect ? 'SEQUENCE CORRECT - FAILSAFE UNLOCKED' : 'SEQUENCE INCORRECT - TRY AGAIN'}
                </motion.div>
              )}
              
              <div className="flex justify-center space-x-4">
                <motion.button 
                  className="px-4 py-2 bg-[hsla(var(--dharma-gray),0.2)] border border-[hsla(var(--dharma-gray),0.5)] text-[hsl(var(--dharma-amber))] hover:bg-[hsla(var(--dharma-red),0.2)] transition-colors"
                  onClick={handleReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  RESET
                </motion.button>
                
                <motion.button 
                  className="px-4 py-2 bg-[hsla(var(--dharma-gray),0.2)] border border-[hsla(var(--dharma-gray),0.5)] text-[hsl(var(--dharma-amber))] hover:bg-[hsla(var(--dharma-green),0.2)] transition-colors"
                  onClick={handleVerify}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  VERIFY SEQUENCE
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HiddenPuzzle;
