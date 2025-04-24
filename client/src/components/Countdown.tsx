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
  const [minutes, setMinutes] = useState(COUNTDOWN_MINUTES);
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (isReset) {
      setMinutes(COUNTDOWN_MINUTES);
      setSeconds(COUNTDOWN_SECONDS);
      setIsWarning(false);
      setIsReset(false);
      playSound('success');
    }
  }, [isReset, setIsReset]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else if (minutes > 0) {
        setMinutes(minutes - 1);
        setSeconds(59);
      } else {
        // Countdown finished
        onCountdownFinish();
        clearInterval(interval);
      }
      
      // Check if we're in warning threshold
      if (minutes === 0 && seconds <= WARNING_THRESHOLD && !isWarning) {
        setIsWarning(true);
        playSound('alarm');
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [minutes, seconds, isWarning, onCountdownFinish]);

  return (
    <div className="font-terminal text-[hsl(var(--dharma-amber))]">
      <div className="relative bg-[#1a1a1a] p-4 rounded-md border border-[#333] shadow-inner">
        <div className="flex gap-[2px]">
          {[...minutes.toString().padStart(3, '0'), ...seconds.toString().padStart(2, '0')].map((digit, i) => (
            <motion.div
              key={i}
              className={`relative w-12 h-16 bg-black rounded-sm flex items-center justify-center overflow-hidden
                ${i === 3 ? 'mr-[2px]' : ''}`}
              animate={isWarning ? { 
                backgroundColor: ['#1a1a1a', '#2a1515', '#1a1a1a'],
                boxShadow: ['inset 0 2px 4px rgba(0,0,0,0.5)', 'inset 0 2px 4px rgba(255,0,0,0.2)', 'inset 0 2px 4px rgba(0,0,0,0.5)']
              } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className={`font-mono text-3xl ${isWarning ? 'text-[hsl(var(--dharma-red))]' : 'text-[hsl(var(--dharma-amber))]'}`}>
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
