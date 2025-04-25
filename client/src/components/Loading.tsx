import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { LOADING_MESSAGES } from '@/lib/constants';
import { playSound } from '@/lib/audio';

// ASCII art for DHARMA Initiative logo
const dharmaAsciiArt = `
  ┌───────────────────────────────┐
  │                               │
  │            ╱╲                 │
  │           ╱  ╲                │
  │          ╱ ╔╗ ╲               │
  │         ╱ ╔╝║  ╲              │
  │        ╱  ╚╗║   ╲             │
  │       ╱    ╚╝    ╲            │
  │      ╱─────────────╲          │
  │      │     ┌┐      │          │
  │      │     └┘      │          │
  │      ╲─────────────╱          │
  │       ╲    ╔╗    ╱            │
  │        ╲   ║╚╗  ╱             │
  │         ╲  ║╔╝ ╱              │
  │          ╲ ╚╝ ╱               │
  │           ╲  ╱                │
  │            ╲╱                 │
  │                               │
  └───────────────────────────────┘
  
    T H E   D H A R M A   I N I T I A T I V E
          SWAN STATION TERMINAL V3.1
`;

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
          {/* ASCII Art Logo */}
          <div className="font-mono text-[hsl(var(--dharma-amber))] whitespace-pre mb-4 animate-flicker">
            {dharmaAsciiArt}
          </div>
          
          {/* Authentic terminal style loading indicators */}
          <div className="max-w-lg w-full px-8">
            <div className="text-left font-terminal text-[hsl(var(--dharma-green))] text-sm mb-2">
              SYSTEM INITIALIZATION: {Math.round(progress)}%
            </div>
            
            <div className="w-full h-6 border border-[hsl(var(--dharma-green))] relative overflow-hidden mb-4">
              <div 
                className="h-full bg-[hsl(var(--dharma-green))] transition-all"
                style={{ width: `${progress}%` }}
              ></div>
              <div 
                className="absolute top-0 left-0 h-full w-full flex items-center justify-center text-black font-terminal text-sm"
              >
                {progress >= 100 ? 'COMPLETE' : 'INITIALIZING...'}
              </div>
            </div>
            
            {/* Terminal-style log output */}
            <div className="font-mono text-sm text-[hsl(var(--dharma-gray))] bg-black p-2 border border-[hsl(var(--dharma-green))] h-32 overflow-y-auto text-left">
              {LOADING_MESSAGES.slice(0, messageIndex + 1).map((message, i) => (
                <div key={i} className="mb-1">
                  <span className="text-[hsl(var(--dharma-green))]">{'>'}</span> {message}
                </div>
              ))}
              {progress < 100 && (
                <div className="animate-pulse">
                  <span className="text-[hsl(var(--dharma-green))]">{'>'}</span> <span className="animate-blink">_</span>
                </div>
              )}
            </div>
            
            <div className="text-right mt-2 font-terminal text-[hsl(var(--dharma-amber))] text-xs">
              {progress >= 100 ? 'PRESS ANY KEY TO CONTINUE' : 'DO NOT POWER OFF SYSTEM'}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loading;
