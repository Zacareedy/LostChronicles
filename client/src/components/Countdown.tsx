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
      <div className="relative bg-[#242424] p-3 rounded-sm border-2 border-[#333] shadow-lg">
        <div className="flex">
          {[...displayMinutes.toString().padStart(3, '0'), ...(displaySeconds ? seconds.toString().padStart(2, '0') : '00')].map((digit, i) => (
            <motion.div
              key={i}
              className={`relative w-10 h-14 bg-black flex items-center justify-center overflow-hidden border-r border-[#1a1a1a]
                ${i === 3 ? 'mr-[2px] border-r-2 border-r-[#333]' : ''}`}
              animate={isWarning ? { 
                backgroundColor: ['#1a1a1a', '#2a1515', '#1a1a1a'],
                boxShadow: ['inset 0 0 8px rgba(0,0,0,0.8)', 'inset 0 0 8px rgba(255,0,0,0.3)', 'inset 0 0 8px rgba(0,0,0,0.8)']
              } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className={`font-mono text-2xl font-bold ${isWarning ? 'text-[hsl(var(--dharma-red))]' : 'text-[#e6e6e6]'}`}>
                {digit}
              </span>
              <div className="absolute inset-x-0 top-[45%] h-[1px] bg-[#111] opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-20" />
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-black via-[#333] to-black opacity-70" />
            </motion.div>
          ))}
        </div>
        <div className="mt-3 text-xs text-center text-[hsl(var(--dharma-gray))] tracking-[0.2em] opacity-80">SYSTEM PROTOCOL</div>
      </div>
    </div>
  );
};

export default Countdown;
