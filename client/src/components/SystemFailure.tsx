import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DHARMA_NUMBERS } from '@/lib/constants';
import { playSound, stopSound } from '@/lib/audio';

// Define types for the hieroglyphs
type Hieroglyph = {
  name: string;
  symbol: string;
  type: 'red' | 'black';
};

interface SystemFailureProps {
  isActive: boolean;
  onResetSequence: () => void;
  onFailsafeTrigger?: () => void;
}

const HIEROGLYPHS: Hieroglyph[] = [
  { name: 'folded cloth', symbol: '𓇌', type: 'red' }, // S29
  { name: 'curl', symbol: '𓏭', type: 'red' }, // Z7
  { name: 'fire drill', symbol: '𓎯', type: 'red' }, // U29
  { name: 'vulture', symbol: '𓄿', type: 'black' }, // G1
  { name: 'stick', symbol: '𓏮', type: 'black' }, // Z6
];

// Create a female voice announcement using the Web Speech API
const announceSystemFailure = () => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance('System failure. System failure.');
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
    utterance.volume = 0.8;
    
    // Try to get a female voice
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => voice.name.includes('female'));
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    speechSynthesis.speak(utterance);
  }
};

const SystemFailure: React.FC<SystemFailureProps> = ({ isActive, onResetSequence, onFailsafeTrigger }) => {
  const [phase, setPhase] = useState<number>(0);
  const [showHieroglyphs, setShowHieroglyphs] = useState<boolean>(false);
  const [currentHieroglyphIndex, setCurrentHieroglyphIndex] = useState<number>(-1);
  const [isResettable, setIsResettable] = useState<boolean>(false);
  const [showFailsafePrompt, setShowFailsafePrompt] = useState<boolean>(false);
  const [userInputBuffer, setUserInputBuffer] = useState<string>('');
  const [errorCount, setErrorCount] = useState<number>(0);
  
  // Refs for system failure elements
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Handle component lifecycle
  useEffect(() => {
    if (isActive) {
      startFailureSequence();
    } else {
      // Reset states when not active
      setPhase(0);
      setShowHieroglyphs(false);
      setCurrentHieroglyphIndex(-1);
      setIsResettable(false);
      setShowFailsafePrompt(false);
      setUserInputBuffer('');
      setErrorCount(0);
      
      // Stop any ongoing sounds
      stopSound('alarm');
    }
    
    return () => {
      // Clean up on unmount
      stopSound('alarm');
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isActive]);
  
  // Process the system failure sequence
  const startFailureSequence = () => {
    // Phase 1: Initial System Failure 
    setPhase(1);
    playSound('alarm');
    announceSystemFailure();
    
    // Set an interval to repeat the announcement
    const announcementInterval = setInterval(() => {
      announceSystemFailure();
    }, 5000);
    
    // Phase 2: Hieroglyphs after a few seconds
    setTimeout(() => {
      setPhase(2);
      setShowHieroglyphs(true);
      
      // Gradually reveal hieroglyphs one by one
      const hieroglyphRevealInterval = setInterval(() => {
        setCurrentHieroglyphIndex(prev => {
          const nextIndex = prev + 1;
          if (nextIndex >= HIEROGLYPHS.length) {
            clearInterval(hieroglyphRevealInterval);
            
            // Enable reset option after all hieroglyphs are shown
            setTimeout(() => {
              setIsResettable(true);
              
              // Phase 3: Remote Log Transmission happens elsewhere in the app
              setPhase(3);
              
              // Phase 4: Last Chance Protocol
              setTimeout(() => {
                setPhase(4);
                
                // After a while, show the failsafe key prompt if no reset sequence
                const failsafeTimeout = setTimeout(() => {
                  setShowFailsafePrompt(true);
                }, 30000);
                
                return () => clearTimeout(failsafeTimeout);
              }, 5000);
            }, 3000);
          }
          return nextIndex;
        });
      }, 1200); // Each hieroglyph appears with a delay
      
      return () => {
        clearInterval(hieroglyphRevealInterval);
        clearInterval(announcementInterval);
      };
    }, 6000);
  };
  
  // Handle keyboard input during system failure
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive || !isResettable) return;
      
      // Handle keypress for number sequence or failsafe
      if (showFailsafePrompt) {
        if (e.key.toLowerCase() === 'y') {
          triggerFailsafe();
        } else if (e.key.toLowerCase() === 'n') {
          setShowFailsafePrompt(false);
        }
      } else {
        // Process number sequence
        if (/^[0-9\s]$/.test(e.key)) {
          setUserInputBuffer(prev => prev + e.key);
          playSound('typing', 'short');
        } else if (e.key === 'Enter') {
          validateInput();
        } else if (e.key === 'Backspace') {
          setUserInputBuffer(prev => prev.slice(0, -1));
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isResettable, showFailsafePrompt, userInputBuffer]);
  
  // Validate the entered sequence
  const validateInput = () => {
    const numbersString = DHARMA_NUMBERS.join(' ');
    const cleanInput = userInputBuffer.trim();
    
    if (cleanInput === numbersString || cleanInput === DHARMA_NUMBERS.join('')) {
      // Correct sequence
      playSound('success');
      onResetSequence();
      setUserInputBuffer('');
    } else {
      // Incorrect sequence
      playSound('fail');
      setUserInputBuffer('');
      setErrorCount(prev => prev + 1);
      
      // After 3 errors, show failsafe option
      if (errorCount >= 2) {
        setShowFailsafePrompt(true);
      }
    }
  };
  
  // Handle failsafe key
  const triggerFailsafe = () => {
    if (onFailsafeTrigger) {
      // Dramatic effect before triggering failsafe
      playSound('alarm');
      
      // Flash effect
      const flashEffect = document.createElement('div');
      flashEffect.className = 'fixed inset-0 bg-white z-[9999] animate-flash';
      document.body.appendChild(flashEffect);
      
      // Remove the flash effect after animation
      setTimeout(() => {
        document.body.removeChild(flashEffect);
        onFailsafeTrigger();
      }, 1500);
    }
  };
  
  if (!isActive) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="w-full max-w-3xl">
        {/* System Failure Display */}
        <div 
          ref={terminalRef}
          className="bg-[hsl(var(--dharma-black))] border-4 border-[hsl(var(--dharma-red))] p-6 rounded-lg shadow-xl overflow-hidden"
        >
          {/* Phase 1: Scrolling SYSTEM FAILURE text */}
          {phase >= 1 && (
            <div className="overflow-hidden h-16 mb-8">
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [-50, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "linear"
                }}
                className="text-center"
              >
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="font-terminal text-[hsl(var(--dharma-red))] text-4xl my-2 font-bold">
                    SYSTEM FAILURE
                  </div>
                ))}
              </motion.div>
            </div>
          )}
          
          {/* Phase 2: Hieroglyph display */}
          {phase >= 2 && showHieroglyphs && (
            <div className="flex justify-center items-center space-x-2 my-8">
              <AnimatePresence>
                {HIEROGLYPHS.map((glyph, index) => (
                  currentHieroglyphIndex >= index && (
                    <motion.div
                      key={`hieroglyph-${index}`}
                      initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      transition={{ duration: 0.5 }}
                      className={`w-16 h-16 flex items-center justify-center text-4xl font-bold border-2 
                        ${glyph.type === 'red' 
                          ? 'bg-[hsl(var(--dharma-red))] text-black border-black' 
                          : 'bg-black text-[hsl(var(--dharma-red))] border-[hsl(var(--dharma-red))]'}`}
                    >
                      {glyph.symbol}
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            </div>
          )}
          
          {/* Phase 4: Last Chance Protocol - Number Input */}
          {phase >= 4 && isResettable && !showFailsafePrompt && (
            <div className="my-6">
              <p className="font-terminal text-[hsl(var(--dharma-amber))] text-xl mb-2 animate-pulse">
                SYSTEM OVERRIDE PROTOCOL
              </p>
              <div className="flex space-x-2 items-center mb-4">
                <span className="text-[hsl(var(--dharma-green))]">{'>'}</span>
                <div className="relative flex-1 bg-[hsla(var(--dharma-gray),0.2)] border border-[hsla(var(--dharma-gray),0.5)] h-10 px-2 flex items-center">
                  <span className="font-terminal text-[hsl(var(--dharma-green))]">{userInputBuffer}</span>
                  <span className="h-5 w-2 bg-[hsl(var(--dharma-green))] opacity-70 ml-1 animate-terminal-blink"></span>
                </div>
              </div>
              <p className="text-[hsl(var(--dharma-amber))] text-sm italic">
                Enter code sequence and press ENTER to execute protocol
              </p>
            </div>
          )}
          
          {/* Failsafe Key Prompt */}
          {showFailsafePrompt && (
            <div className="my-6 animate-pulse">
              <p className="font-terminal text-[hsl(var(--dharma-red))] text-2xl mb-4 text-center">
                TERMINAL PROTOCOL FAILURE
              </p>
              <p className="font-terminal text-[hsl(var(--dharma-amber))] text-xl mb-4 text-center">
                TURN FAILSAFE KEY? (Y/N)
              </p>
              <p className="text-[hsl(var(--dharma-green))] text-sm text-center italic">
                WARNING: Executing failsafe will cause catastrophic electromagnetic discharge
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemFailure;