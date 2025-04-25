import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { LOADING_MESSAGES } from '@/lib/constants';
import { playSound } from '@/lib/audio';

interface LoadingProps {
  onLoadComplete: () => void;
}

const Loading: React.FC<LoadingProps> = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Play static sound during loading
    playSound('static');

    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 15;
        const newProgress = prev + increment;
        
        // Update message based on progress
        const newMessageIndex = Math.min(
          Math.floor((newProgress / 100) * LOADING_MESSAGES.length),
          LOADING_MESSAGES.length - 1
        );
        
        if (newMessageIndex !== messageIndex) {
          setMessageIndex(newMessageIndex);
          playSound('beep');
        }
        
        // Loading complete
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            playSound('success');
            setIsVisible(false);
            setTimeout(() => {
              onLoadComplete();
            }, 1000);
          }, 1000);
          return 100;
        }
        
        return newProgress;
      });
    }, 400);

    return () => {
      clearInterval(interval);
    };
  }, [messageIndex, onLoadComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[hsl(var(--dharma-black))]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <Logo size="lg" className="mb-8 animate-flicker" />
          <div className="font-terminal text-[hsl(var(--dharma-amber))] text-3xl mb-8">DHARMA INITIATIVE</div>
          <div className="font-terminal text-[hsl(var(--dharma-amber))] text-xl mb-4">LOADING SYSTEM...</div>
          <div className="w-64 h-6 bg-[#0a0a0a] border-2 border-[hsla(var(--dharma-green),0.15)] overflow-hidden font-terminal text-xs flex items-center">
            <motion.div 
              className="h-full bg-[hsla(var(--dharma-green),0.2)] relative flex items-center"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "steps(15)" }}
            >
              <div className="absolute inset-0 flex items-center">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div key={i} className="h-full w-[2px] bg-[hsl(var(--dharma-green))] mx-[6px]" />
                ))}
              </div>
            </motion.div>
            <span className="absolute w-full text-center text-[hsl(var(--dharma-green))]">
              {Math.floor(progress)}%
            </span>
          </div>
          <div className="font-mono text-sm text-[hsl(var(--dharma-gray))] mt-4">
            {LOADING_MESSAGES[messageIndex]}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loading;
