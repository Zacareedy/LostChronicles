import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { playSound } from '@/lib/audio';

const SystemError: React.FC = () => {
  const [secretVisible, setSecretVisible] = useState(false);
  const [clipboardMessage, setClipboardMessage] = useState('');
  const [_, setLocation] = useLocation();

  useEffect(() => {
    // Play error sound when component mounts
    playSound('fail');
    
    // Simulate system glitches
    const glitchInterval = setInterval(() => {
      playSound('static', 'short');
    }, 8000);
    
    return () => clearInterval(glitchInterval);
  }, []);

  // Secret coordinates that appear to be a system error but are actually Pearl station coordinates
  const secretCode = 'C22/DSTNGSHD-LBRT';
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setClipboardMessage('Copied to clipboard');
        setTimeout(() => setClipboardMessage(''), 2000);
      })
      .catch(() => {
        setClipboardMessage('Failed to copy');
        setTimeout(() => setClipboardMessage(''), 2000);
      });
  };

  const handleGlitchClick = () => {
    playSound('beep');
    setSecretVisible(!secretVisible);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--dharma-black))] text-[hsl(var(--dharma-red))] overflow-hidden">
      {/* CRT Overlay effects */}
      <div className="absolute inset-0 crt pointer-events-none z-50"></div>
      <div className="scanline absolute inset-0 pointer-events-none z-40"></div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto py-12 px-4"
      >
        <div className="text-center">
          <h1 className="font-terminal text-6xl mb-8 animate-terminal-glitch">SYSTEM ERROR</h1>
          <div className="border border-[hsl(var(--dharma-red))] p-8 mb-8">
            <p className="font-terminal text-2xl mb-4">FATAL EXCEPTION 0x000000D1</p>
            <p className="mb-6">The Dharma Initiative Operating System has encountered a critical error.</p>
            <pre className="text-left bg-[hsla(var(--dharma-gray),0.1)] p-4 mb-6 overflow-x-auto font-terminal text-sm">
              <code>
{`0xC0000005: Access Violation at 0x0108:0x00000042
DS:0023 ES:0023 FS:1100 GS:0000
EIP:0108:00000042 ESP:0023:00004815 EBP:0023:00001623
CR2:00001516 SS:0023 DR6:FFFFEFFF DR7:FFFF0155
ERROR CODE: 00000000
PANIC: [[ DO NOT ATTEMPT TO USE THIS SYSTEM ]]
`}
              </code>
            </pre>
            
            <div className="text-left text-sm">
              <p className="mb-2">
                <span className="font-bold">DEBUG INFO:</span> Memory allocation failed at 0x4815162342
              </p>
              <p className="mb-2">
                <span className="font-bold">MODULE:</span> dharma_protocol.sys
              </p>
              <p className="mb-2">
                <span className="font-bold">STATION:</span> [CLASSIFIED]
              </p>
              
              {/* Hidden message that appears to be system debug but contains vital clue */}
              <div 
                className="mt-8 text-xs font-mono overflow-hidden relative cursor-pointer"
                onClick={handleGlitchClick}
              >
                <div className="animate-terminal-scan absolute h-4 w-full bg-[hsla(var(--dharma-amber),0.1)] pointer-events-none"></div>
                <p className="animate-terminal-flicker">MEMORY DUMP SECTOR [7-418] @ 0x8631</p>
                
                {secretVisible && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-2 bg-[hsla(var(--dharma-gray),0.15)] border-l-2 border-[hsl(var(--dharma-amber))]"
                  >
                    <p className="text-[hsl(var(--dharma-amber))] mb-2">PEARL STATION ACCESS CODE FOUND:</p>
                    <div className="flex items-center">
                      <code className="font-terminal">{secretCode}</code>
                      <button 
                        onClick={() => copyToClipboard(secretCode)}
                        className="ml-2 text-[hsl(var(--dharma-gray))] hover:text-[hsl(var(--dharma-amber))] text-xs"
                      >
                        [COPY]
                      </button>
                      {clipboardMessage && (
                        <span className="ml-2 text-xs text-[hsl(var(--dharma-amber))]">{clipboardMessage}</span>
                      )}
                    </div>
                    <p className="mt-2 text-[hsl(var(--dharma-gray))]">
                      <span className="text-[hsl(var(--dharma-red))]">NOTE:</span> This appears to be a Distinguished Liberty protocol code. May be relevant to observation station.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => {
                playSound('typing', 'short');
                setTimeout(() => setLocation('/'), 500);
              }}
              className="bg-[hsla(var(--dharma-gray),0.2)] border border-[hsl(var(--dharma-red))] px-6 py-3 hover:bg-[hsla(var(--dharma-gray),0.3)]"
            >
              RETURN TO MAIN SYSTEM
            </button>
            
            {/* Hidden button in plain sight - doesn't look like a button */}
            <div 
              className="invisible-button w-6 h-6" 
              onClick={() => {
                playSound('success');
                // Store the fact that user found this hidden button
                localStorage.setItem('dharma_hidden_1', 'found');
                alert('Something changed in the system...');
              }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SystemError;