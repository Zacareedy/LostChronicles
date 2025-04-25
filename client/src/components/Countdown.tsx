import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { COUNTDOWN_MINUTES, COUNTDOWN_SECONDS, WARNING_THRESHOLD, DHARMA_NUMBERS } from '@/lib/constants';
import { playSound } from '@/lib/audio';

interface CountdownProps {
  onCountdownFinish: () => void;
  isReset: boolean;
  setIsReset: (value: boolean) => void;
}

const Countdown: React.FC<CountdownProps> = ({ onCountdownFinish, isReset, setIsReset }) => {
  const [isWarning, setIsWarning] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [devTimeInput, setDevTimeInput] = useState('');
  const devModeKeySequence = useRef<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(() => {
    const startTime = localStorage.getItem('countdown_start');
    if (!startTime) {
      const now = Date.now();
      localStorage.setItem('countdown_start', now.toString());
      return COUNTDOWN_MINUTES * 60 + COUNTDOWN_SECONDS;
    }
    
    const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
    const remaining = (COUNTDOWN_MINUTES * 60 + COUNTDOWN_SECONDS) - elapsed;
    return Math.max(0, remaining);
  });

  useEffect(() => {
    if (isReset) {
      const now = Date.now();
      localStorage.setItem('countdown_start', now.toString());
      setTimeRemaining(COUNTDOWN_MINUTES * 60 + COUNTDOWN_SECONDS);
      setIsWarning(false);
      setIsReset(false);
      playSound('success');
    }
  }, [isReset, setIsReset]);

  // Handle dev mode activation with The Numbers sequence
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Convert key to number if it's a digit
      const keyNum = parseInt(e.key);
      if (!isNaN(keyNum) && e.ctrlKey && e.altKey) {
        // Add to sequence
        devModeKeySequence.current.push(keyNum);
        
        // Check if we have 6 numbers
        if (devModeKeySequence.current.length > 6) {
          devModeKeySequence.current.shift(); // Remove oldest number
        }
        
        // Check if sequence matches The Numbers
        if (devModeKeySequence.current.length === 6) {
          const isMatch = devModeKeySequence.current.every((num, index) => num === DHARMA_NUMBERS[index]);
          if (isMatch) {
            setIsDevMode(prev => !prev);
            playSound('success');
            devModeKeySequence.current = []; // Reset sequence
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Handle dev time input
  const handleDevTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const timeInSeconds = parseInt(devTimeInput);
    if (!isNaN(timeInSeconds) && timeInSeconds >= 0) {
      // Calculate a new start time that would result in this remaining time
      const now = Date.now();
      const calculatedStartTime = now - ((COUNTDOWN_MINUTES * 60 + COUNTDOWN_SECONDS) - timeInSeconds) * 1000;
      
      // Set the new start time
      localStorage.setItem('countdown_start', calculatedStartTime.toString());
      setTimeRemaining(timeInSeconds);
      setIsWarning(timeInSeconds <= WARNING_THRESHOLD);
      setDevTimeInput('');
      playSound('beep');
    }
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      // Skip timer updates if dev mode is active
      if (isDevMode) return;
      
      const startTime = localStorage.getItem('countdown_start');
      if (startTime) {
        const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
        const remaining = (COUNTDOWN_MINUTES * 60 + COUNTDOWN_SECONDS) - elapsed;
        const newRemaining = Math.max(0, remaining);
        
        setTimeRemaining(newRemaining);
        
        if (newRemaining === 0) {
          onCountdownFinish();
          clearInterval(interval);
        }
        
        // Check if we're in warning threshold
        if (newRemaining <= WARNING_THRESHOLD && !isWarning) {
          setIsWarning(true);
          playSound('alarm');
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isWarning, onCountdownFinish, isDevMode]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  // Only show seconds in last 4 minutes
  const displaySeconds = minutes < 4;
  // Add 1 minute delay before showing 107
  const displayMinutes = Math.min(minutes, 108);

  return (
    <div className="font-terminal text-[hsl(var(--dharma-green))]">
      <div className="relative bg-[#1a1a1a] p-2 border-2 border-[hsla(var(--dharma-green),0.3)] shadow-inner">
        <div className="flex">
          {/* Timer display */}
          {Array.from(displayMinutes.toString().padStart(3, '0')).concat(
            displaySeconds ? Array.from(seconds.toString().padStart(2, '0')) : ['0', '0']
          ).map((digit, i) => (
            <motion.div
              key={i}
              className={`relative w-10 h-14 flex items-center justify-center overflow-hidden border-r border-[#1a1a1a]
                ${i > 2 ? 'bg-[#e6e6e6]' : 'bg-black'} 
                ${i === 3 ? 'mr-[2px] border-r-2 border-r-[#333]' : ''}`}
              animate={isWarning ? { 
                backgroundColor: i > 2 ? ['#e6e6e6', '#ffcccc', '#e6e6e6'] : ['#1a1a1a', '#2a1515', '#1a1a1a'],
                boxShadow: ['inset 0 0 8px rgba(0,0,0,0.8)', 'inset 0 0 8px rgba(255,0,0,0.3)', 'inset 0 0 8px rgba(0,0,0,0.8)']
              } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className={`font-mono text-2xl font-bold ${i > 2 ? 'text-black' : (isWarning ? 'text-[hsl(var(--dharma-red))]' : 'text-white')}`}>
                {digit}
              </span>
              <div className="absolute inset-x-0 top-[45%] h-[1px] bg-[#111] opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-20" />
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-black via-[#333] to-black opacity-70" />
            </motion.div>
          ))}
        </div>
        
        {/* Dev mode indicator and controls - activated with Ctrl+Alt+4+8+1+5+1+6+2+3+4+2 */}
        {isDevMode && (
          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-black border border-[hsl(var(--dharma-amber))] z-50">
            <div className="text-center text-xs mb-2 text-[hsl(var(--dharma-amber))]">
              <span className="animate-pulse">● </span>
              DEVELOPER MODE ACTIVE
              <span className="animate-pulse"> ●</span>
            </div>
            <form onSubmit={handleDevTimeSubmit} className="flex items-center space-x-2">
              <input
                type="number"
                value={devTimeInput}
                onChange={(e) => setDevTimeInput(e.target.value)}
                placeholder="Seconds remaining"
                min="0"
                className="flex-1 bg-black border border-[hsl(var(--dharma-green))] text-[hsl(var(--dharma-green))] px-2 py-1 text-xs"
              />
              <button 
                type="submit"
                className="bg-[hsla(var(--dharma-green),0.2)] text-[hsl(var(--dharma-green))] border border-[hsl(var(--dharma-green))] px-2 py-1 text-xs"
              >
                SET
              </button>
              <div 
                className="text-[hsl(var(--dharma-amber))] cursor-pointer border border-[hsl(var(--dharma-amber))] px-2 py-1 text-xs"
                onClick={() => {
                  setIsDevMode(false);
                  playSound('beep');
                }}
              >
                ×
              </div>
            </form>
            <div className="mt-2 text-[hsl(var(--dharma-green))] text-xs">
              <div className="flex justify-between">
                <button 
                  onClick={() => handleDevTimeSubmit({ preventDefault: () => {} } as any)}
                  className="border border-[hsl(var(--dharma-green))] px-1 hover:bg-[hsla(var(--dharma-green),0.1)]"
                  onMouseDown={() => setDevTimeInput("10")}
                >
                  10s
                </button>
                <button 
                  onClick={() => handleDevTimeSubmit({ preventDefault: () => {} } as any)}
                  className="border border-[hsl(var(--dharma-green))] px-1 hover:bg-[hsla(var(--dharma-green),0.1)]"
                  onMouseDown={() => setDevTimeInput("30")}
                >
                  30s
                </button>
                <button 
                  onClick={() => handleDevTimeSubmit({ preventDefault: () => {} } as any)}
                  className="border border-[hsl(var(--dharma-green))] px-1 hover:bg-[hsla(var(--dharma-green),0.1)]"
                  onMouseDown={() => setDevTimeInput("60")}
                >
                  60s
                </button>
                <button 
                  onClick={() => handleDevTimeSubmit({ preventDefault: () => {} } as any)}
                  className="border border-[hsl(var(--dharma-amber))] px-1 hover:bg-[hsla(var(--dharma-amber),0.1)] text-[hsl(var(--dharma-amber))]"
                  onMouseDown={() => setDevTimeInput("0")}
                >
                  0s (FAILURE)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Countdown;
