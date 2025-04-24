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
      <motion.div 
        className={`text-2xl ${isWarning ? 'text-[hsl(var(--dharma-red))] animate-terminal-blink' : ''}`}
        animate={isWarning ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {`${minutes.toString().padStart(3, '0')}:${seconds.toString().padStart(2, '0')}`}
      </motion.div>
      <div className="text-xs text-[hsl(var(--dharma-gray))]">SYSTEM PROTOCOL</div>
    </div>
  );
};

export default Countdown;
