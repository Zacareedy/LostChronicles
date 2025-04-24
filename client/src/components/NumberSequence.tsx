import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DHARMA_NUMBERS } from '@/lib/constants';
import { playSound } from '@/lib/audio';

interface NumberSequenceProps {
  onCorrectSequence: () => void;
}

const NumberSequence: React.FC<NumberSequenceProps> = ({ onCorrectSequence }) => {
  const [numbers, setNumbers] = useState<(number | null)[]>(Array(6).fill(null));
  const [response, setResponse] = useState<{ message: string; success: boolean } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  const validateNumberSequence = (index: number, value: string) => {
    const num = value === '' ? null : parseInt(value, 10);
    
    // Update the number at this index
    const newNumbers = [...numbers];
    newNumbers[index] = num;
    setNumbers(newNumbers);
    
    // Move to next input if there's a value and not the last input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const executeSequence = () => {
    // Check if all numbers are entered
    if (numbers.some(num => num === null)) {
      setResponse({ 
        message: 'INCOMPLETE SEQUENCE - ALL NUMBERS REQUIRED', 
        success: false 
      });
      playSound('fail');
      return;
    }
    
    // Check if sequence matches DHARMA_NUMBERS
    const isCorrect = numbers.every((num, index) => num === DHARMA_NUMBERS[index]);
    
    if (isCorrect) {
      setResponse({ 
        message: 'SEQUENCE ACCEPTED - PROTOCOL EXECUTED', 
        success: true 
      });
      playSound('success');
      onCorrectSequence();
    } else {
      setResponse({ 
        message: 'SYSTEM FAILURE - INCORRECT SEQUENCE', 
        success: false 
      });
      playSound('fail');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Allow only numbers, backspace, delete, and arrow keys
    if (
      !/^\d$/.test(e.key) && 
      e.key !== 'Backspace' && 
      e.key !== 'Delete' && 
      e.key !== 'ArrowLeft' && 
      e.key !== 'ArrowRight' && 
      e.key !== 'Tab'
    ) {
      e.preventDefault();
    }
    
    // Handle backspace to previous input
    if (e.key === 'Backspace' && (e.target as HTMLInputElement).value === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle right arrow to next input
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Handle left arrow to previous input
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="lg:col-span-2 bg-[hsl(var(--dharma-black))] border border-[hsla(var(--dharma-gray),0.3)] rounded-lg overflow-hidden"
    >
      <div className="bg-[hsla(var(--dharma-gray),0.2)] p-2">
        <h2 className="font-terminal text-[hsl(var(--dharma-amber))]">SYSTEM PROTOCOL</h2>
      </div>
      
      <div className="p-4 font-terminal">
        <p className="text-[hsl(var(--dharma-gray))] mb-4">Execute protocol sequence every 108 minutes:</p>
        
        <div className="grid grid-cols-6 gap-2 mb-4">
          {DHARMA_NUMBERS.map((_, index) => (
            <input 
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text" 
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              className="w-full bg-[hsl(var(--dharma-black))] border border-[hsla(var(--dharma-gray),0.5)] rounded p-2 text-center text-[hsl(var(--dharma-amber))] text-xl focus:border-[hsl(var(--dharma-green))] focus:outline-none" 
              placeholder="?"
              value={numbers[index] === null ? '' : numbers[index]!.toString()}
              onChange={(e) => validateNumberSequence(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            />
          ))}
        </div>
        
        <motion.button 
          className="w-full py-2 bg-[hsla(var(--dharma-gray),0.2)] border border-[hsla(var(--dharma-gray),0.5)] text-[hsl(var(--dharma-amber))] hover:bg-[hsla(var(--dharma-green),0.2)] transition-colors focus:outline-none"
          onClick={executeSequence}
          whileHover={{ backgroundColor: 'hsla(var(--dharma-green), 0.3)' }}
          whileTap={{ scale: 0.98 }}
        >
          EXECUTE
        </motion.button>
        
        {response && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`mt-4 ${response.success ? 'text-[hsl(var(--dharma-green))]' : 'text-[hsl(var(--dharma-red))]'}`}
          >
            {response.message}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default NumberSequence;
