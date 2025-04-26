import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '@/lib/audio';
import dharmaLogoSvg from '@/assets/dharma-logo-fixed.svg';

interface LoadingProps {
  onLoadComplete: () => void;
}

const Loading: React.FC<LoadingProps> = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Play static sound during loading
    playSound('static');

    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 15;
        const newProgress = prev + increment;
        
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
  }, [onLoadComplete]);

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
          <div className="mb-12 relative w-64 h-64">
            <img 
              src={dharmaLogoSvg} 
              alt="DHARMA Initiative Logo" 
              className="w-full h-full" 
            />
            
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
          
          {/* Simplified progress dots */}
          <div className="w-full max-w-md px-4 mt-8">
            <div className="flex justify-center space-x-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-3 h-3 rounded-full ${
                    i < Math.floor(progress / 12.5) 
                      ? 'bg-[hsl(var(--dharma-green))]' 
                      : 'bg-[hsla(var(--dharma-gray),0.3)]'
                  } transition-colors duration-300`}
                />
              ))}
            </div>
            <div className="text-center font-terminal text-[hsl(var(--dharma-amber))] mt-4">
              {progress >= 100 ? 'SYSTEM READY' : 'LOADING...'}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loading;
