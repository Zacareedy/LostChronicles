import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LOADING_MESSAGES } from '@/lib/constants';
import { playSound } from '@/lib/audio';
import dharmaLogoSvg from '@/assets/dharma-logo-custom.svg';

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
          {/* DHARMA Logo SVG */}
          <div className="mb-8 animate-pulse relative w-64 h-64">
            <img 
              src={dharmaLogoSvg} 
              alt="DHARMA Initiative Logo" 
              className="w-full h-full" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.2)] to-transparent pointer-events-none"></div>
            
            {/* Text below SVG */}
            <div className="absolute -bottom-8 left-0 right-0 text-center">
              <div className="font-terminal text-[hsl(var(--dharma-amber))] text-xl tracking-wider">
                DHARMA INITIATIVE
              </div>
              <div className="font-terminal text-[hsl(var(--dharma-green))] text-sm">
                SWAN STATION TERMINAL V3.1
              </div>
            </div>
          </div>
          
          {/* Authentic 70s/80s era terminal style loading indicators */}
          <div className="w-full max-w-3xl px-4">
            <div className="text-left font-mono text-[hsl(var(--dharma-green))] text-sm mb-2 flex">
              <div className="w-20">INIT:</div>
              <div className="flex-1 overflow-hidden">
                <div className="w-full h-4 relative overflow-hidden font-mono flex items-center">
                  <div className="relative flex">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <span key={i} className={`text-sm ${i < Math.round(progress / 2) ? 'text-[hsl(var(--dharma-green))]' : 'text-[rgba(0,0,0,0)]'}`}>█</span>
                    ))}
                  </div>
                  <div className="absolute right-0 text-[hsl(var(--dharma-amber))]">
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-left font-mono text-[hsl(var(--dharma-green))] text-sm mb-2 flex">
              <div className="w-20">STATUS:</div>
              <div className="flex-1 uppercase">
                {progress >= 100 ? 'SYSTEM READY' : 'LOADING DHARMA OS v2.3.03'}
              </div>
            </div>
            
            {/* Terminal-style log output - authentic 80-column display */}
            <div className="relative font-mono text-sm text-[hsl(var(--dharma-gray))] bg-black p-2 border border-[hsl(var(--dharma-green))] h-48 overflow-y-auto text-left whitespace-pre">
              {/* Column guide (common in old terminals) */}
              <div className="absolute top-0 w-full opacity-10 pointer-events-none text-[hsl(var(--dharma-green))] text-[8px] select-none">
                {Array.from({ length: 8 }).map((_, i) => (
                  <span key={i} className="inline-block w-[10ch] text-center">{(i+1)*10}</span>
                ))}
              </div>
              
              {/* Vertical line separator (common in old mainframes) */}
              <div className="absolute left-[5ch] top-0 bottom-0 w-px bg-[hsl(var(--dharma-green))] opacity-10"></div>
              
              {LOADING_MESSAGES.slice(0, messageIndex + 1).map((message, i) => (
                <div key={i} className="mb-1 flex">
                  <span className="text-[hsl(var(--dharma-amber))] w-[5ch] text-right pr-2">{(i+1).toString().padStart(2, '0')}:</span>
                  <span>{message}</span>
                </div>
              ))}
              {progress < 100 && (
                <div className="flex">
                  <span className="text-[hsl(var(--dharma-amber))] w-[5ch] text-right pr-2">{(messageIndex+2).toString().padStart(2, '0')}:</span>
                  <span className="animate-blink">_</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-2 font-mono text-[hsl(var(--dharma-green))] text-xs border-t border-b border-[hsla(var(--dharma-green),0.3)] py-1">
              <div>DHARMA INITIATIVE © 1977-1984</div>
              <div>SYSTEM LOAD: {(Math.min(progress/100, 0.95) + Math.random() * 0.05).toFixed(2)}</div>
              <div className="text-[hsl(var(--dharma-amber))]">
                {progress >= 100 ? '*** PRESS ANY KEY TO CONTINUE ***' : 'DO NOT POWER OFF SYSTEM'}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loading;
