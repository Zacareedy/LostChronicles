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
          <div className="font-terminal text-[hsl(var(--dharma-green))] flex items-center gap-2">
            <span>LOADING</span>
            <div className="w-48 inline-flex">
              {Array.from({ length: Math.ceil((progress / 100) * 20) }).map((_, i) => (
                <span key={i}>.</span>
              ))}
            </div>
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
