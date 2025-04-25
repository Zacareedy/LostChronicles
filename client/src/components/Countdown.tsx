import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { COUNTDOWN_MINUTES, COUNTDOWN_SECONDS, WARNING_THRESHOLD } from '@/lib/constants';
import { playSound } from '@/lib/audio';

interface CountdownProps {
  onCountdownFinish: () => void;
  isReset: boolean;
  setIsReset: (value: boolean) => void;
}

const Countdown: React.FC<CountdownProps> = ({ onCountdownFinish, isReset, setIsReset }) => {
  const [isWarning, setIsWarning] = useState(false);
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

  useEffect(() => {
    const interval = setInterval(() => {
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
  }, [isWarning, onCountdownFinish]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  // Only show seconds in last 4 minutes
  const displaySeconds = minutes < 4;
  // Add 1 minute delay before showing 107
  const displayMinutes = Math.min(minutes, 108);

  return (
    <div className="font-terminal text-[hsl(var(--dharma-amber))]">
      <div className="relative bg-[#1a1a1a] p-2 rounded-md border border-[#333] shadow-inner">
        <div className="flex gap-[1px]">
          {[...displayMinutes.toString().padStart(3, '0'), ...(displaySeconds ? seconds.toString().padStart(2, '0') : '00')].map((digit, i) => (
            <motion.div
              key={i}
              className={`relative w-8 h-10 bg-black rounded-sm flex items-center justify-center overflow-hidden
                ${i === 3 ? 'mr-[1px]' : ''}`}
              animate={isWarning ? { 
                backgroundColor: ['#1a1a1a', '#2a1515', '#1a1a1a'],
                boxShadow: ['inset 0 2px 4px rgba(0,0,0,0.5)', 'inset 0 2px 4px rgba(255,0,0,0.2)', 'inset 0 2px 4px rgba(0,0,0,0.5)']
              } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className={`font-mono text-xl ${isWarning ? 'text-[hsl(var(--dharma-red))]' : 'text-[hsl(var(--dharma-amber))]'}`}>
                {digit}
              </span>
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#444] to-transparent opacity-50" />
              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-[#444] to-transparent opacity-50" />
            </motion.div>
          ))}
        </div>
        <div className="mt-2 text-xs text-center text-[hsl(var(--dharma-gray))] tracking-wider">SYSTEM PROTOCOL</div>
      </div>
    </div>
  );
};

export default Countdown;
