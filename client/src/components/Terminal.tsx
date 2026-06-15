import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { processCommand } from '@/lib/terminal';
import { playSound } from '@/lib/audio';
import { useLocation } from 'wouter';

interface TerminalOutput {
  text: string;
  type: 'input' | 'output' | 'cursor';
  isTyping?: boolean; // Flag for text that should be typed out character by character
  fullText?: string;  // The complete text that will be typed out
}

interface TerminalProps {
  onRevealPuzzle: () => void;
  onRevealStation: (stationName: string) => void;
  onCorrectSequence: () => void;
  onCommand?: (command: string) => void; // Optional handler for terminal commands
  isSystemFailure?: boolean; // Flag indicating if system failure is active
}

const Terminal: React.FC<TerminalProps> = ({ onRevealPuzzle, onRevealStation, onCorrectSequence, onCommand, isSystemFailure = false }) => {
  const [terminalOutput, setTerminalOutput] = useState<TerminalOutput[]>([
    { text: '>DHARMA INITIATIVE - SWAN STATION TERMINAL', type: 'output' },
    { text: '>AWAITING INPUT...', type: 'output' },
    { text: '>:█', type: 'cursor' }
  ]);
  const [input, setInput] = useState('');
  const [terminalStatus, setTerminalStatus] = useState('CONNECTED');
  const [accessLevel, setAccessLevel] = useState(1);
  const terminalInputRef = useRef<HTMLInputElement>(null);
  const terminalOutputRef = useRef<HTMLDivElement>(null);
  const [_, setLocation] = useLocation();

  useEffect(() => {
    // Set focus to input when component mounts
    if (terminalInputRef.current) {
      terminalInputRef.current.focus();
    }
    
    // Check if user has previously activated system error
    try {
      const errorAllowed = localStorage.getItem('dharma_error_allowed');
      if (errorAllowed === 'true') {
        setAccessLevel(prev => Math.max(prev, 3));
      }
      
      // Check for Pearl access
      const pearlAccess = localStorage.getItem('dharma_pearl_access');
      if (pearlAccess === 'true') {
        setAccessLevel(prev => Math.max(prev, 4));
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  // Add typewriter effect
  useEffect(() => {
    // Find any terminal output items that need typing animation
    const typingItem = terminalOutput.find(item => item.isTyping && item.fullText && item.text.length < item.fullText.length);
    
    if (typingItem && typingItem.fullText) {
      // Set a timeout to add the next character
      const typingSpeed = Math.random() * 30 + 10; // 10-40ms per character, variable like old terminals
      const timeoutId = setTimeout(() => {
        setTerminalOutput(prev => 
          prev.map(item => {
            if (item === typingItem && item.fullText) {
              // Add one more character to the displayed text
              const nextCharIndex = item.text.length;
              if (nextCharIndex < item.fullText.length) {
                return {
                  ...item,
                  text: item.fullText.substring(0, nextCharIndex + 1),
                  isTyping: nextCharIndex + 1 < item.fullText.length
                };
              }
            }
            return item;
          })
        );
        
        // Play the typing sound occasionally (not for every character to avoid sound overlap)
        if (Math.random() < 0.3) {
          playSound('beep', 'short');
        }
      }, typingSpeed);
      
      return () => clearTimeout(timeoutId);
    }
  }, [terminalOutput]);

  // Scroll to bottom of terminal output when new content is added
  useEffect(() => {
    if (terminalOutputRef.current) {
      terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // Handle system failure state
  useEffect(() => {
    if (isSystemFailure) {
      // Clear existing cursor
      setTerminalOutput(prev => prev.filter(item => item.type !== 'cursor'));
      
      // Set terminal status to system failure
      setTerminalStatus('SYSTEM FAILURE');
      
      // Add system failure messages to terminal
      const systemFailureMessages = [
        '> [ALERT] ELECTROMAGNETIC CONTAINMENT BREACH',
        '> [CRITICAL] SYSTEM FAILURE DETECTED',
        '> [WARNING] DISCHARGE IMMINENT',
        '> [ALERT] EXECUTE PROTOCOL IMMEDIATELY',
        '> [CRITICAL] ENTER CODE: 4 8 15 16 23 42'
      ];
      
      // Display messages with delays
      systemFailureMessages.forEach((message, index) => {
        setTimeout(() => {
          // Remove cursor before adding new text
          setTerminalOutput(prev => prev.filter(item => item.type !== 'cursor'));
          
          // Add failure message
          setTerminalOutput(prev => [
            ...prev,
            { text: message, type: 'output' },
            { text: '>:█', type: 'cursor' }
          ]);
          
          // Play alarm sound with each message
          playSound('alarm');
        }, 1200 * index); // Spaced out messages
      });
      
      // Set up repeating SYSTEM FAILURE messages
      const intervalId = setInterval(() => {
        // Remove cursor before adding new text
        setTerminalOutput(prev => prev.filter(item => item.type !== 'cursor'));
        
        // Add repeating failure message
        setTerminalOutput(prev => [
          ...prev,
          { text: '> [SYSTEM FAILURE] ELECTROMAGNETIC DISCHARGE IMMINENT', type: 'output' },
          { text: '>:█', type: 'cursor' }
        ]);
        
        playSound('alarm');
      }, 8000); // Repeat every 8 seconds
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isSystemFailure]);

  // Add some ambient terminal messages at random intervals
  useEffect(() => {
    // Skip ambient messages if in system failure mode
    if (isSystemFailure) return;
    
    const ambientMessages = [
      '> [System monitoring active]',
      '> [Electromagnetic anomaly detected]',
      '> [Atmospheric analysis complete]',
      '> [Protocol verification required]'
    ];
    
    // Only show ambient messages if user has been active
    if (terminalOutput.length > 5) {
      const intervalId = setInterval(() => {
        // 10% chance to show message
        if (Math.random() < 0.1) {
          const message = ambientMessages[Math.floor(Math.random() * ambientMessages.length)];
          
          // Remove cursor
          setTerminalOutput(prev => prev.filter(item => item.type !== 'cursor'));
          
          // Add ambient message
          setTerminalOutput(prev => [
            ...prev,
            { text: message, type: 'output' },
            { text: '>:█', type: 'cursor' }
          ]);
          
          // Play subtle beep
          playSound('beep', 'short');
        }
      }, 30000); // Every 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [terminalOutput, isSystemFailure]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userInput = input.trim();
    setInput('');
    
    // Remove cursor for now
    setTerminalOutput(prev => prev.filter(item => item.type !== 'cursor'));
    
    // Add user input to terminal
    setTerminalOutput(prev => [
      ...prev,
      { text: `> ${userInput}`, type: 'input' }
    ]);

    // Process command and get response
    const response = processCommand(userInput, onRevealPuzzle, onRevealStation, onCorrectSequence, isSystemFailure);
    
    // If clear command, clear terminal
    if (userInput.toLowerCase() === 'clear') {
      setTerminalOutput([]);
    } else {
      // Add response to terminal with typewriter effect
      response.forEach((line, index) => {
        setTimeout(() => {
          setTerminalOutput(prev => [
            ...prev,
            // Initialize with empty string, but set fullText for typing effect
            { text: "", type: 'output', isTyping: true, fullText: line }
          ]);
        }, index * 50); // Stagger each line's appearance
      });
    }
    
    // Pass command to parent component if handler provided
    if (onCommand) {
      onCommand(userInput);
    }
    
    // Add cursor back
    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev,
        { text: '>:█', type: 'cursor' }
      ]);
    }, 100);
    
    // Update terminal status based on certain commands
    if (userInput.toLowerCase().includes('scan')) {
      setTerminalStatus('SCANNING...');
      setTimeout(() => setTerminalStatus('CONNECTED'), 3000);
    } else if (userInput.toLowerCase() === 'override system-error') {
      if (accessLevel >= 2) {
        // Reveal puzzle and navigate to system error
        onRevealPuzzle();
        setTimeout(() => {
          setLocation('/system-error');
        }, 2000);
      } else {
        setTerminalOutput(prev => [
          ...prev,
          { text: '> ACCESS DENIED: Requires security level 2', type: 'output' }
        ]);
      }
    } else if (userInput.toLowerCase().includes('login')) {
      // Check different login patterns
      if (userInput.includes('4815162342')) {
        setTerminalStatus('ACCESS GRANTED');
        setAccessLevel(prev => Math.max(prev, 3));
      } else if (userInput.includes('dharma77')) {
        setTerminalStatus('ACCESS GRANTED');
        setAccessLevel(prev => Math.max(prev, 2));
      } else if (userInput.includes('C22/DSTNGSHD-LBRT')) {
        setTerminalStatus('ACCESS GRANTED');
        setAccessLevel(prev => Math.max(prev, 4));
      } else {
        setTerminalStatus('ACCESS DENIED');
        setTimeout(() => setTerminalStatus('CONNECTED'), 3000);
      }
    } else if (userInput === '4 8 15 16 23 42') {
      // Reset the countdown
      onCorrectSequence();
      setTerminalStatus('SYSTEM RESET');
      playSound('success');
      setTimeout(() => setTerminalStatus('CONNECTED'), 3000);
    }
  };

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 10000,
    background: 'rgba(0,0,0,0.88)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const windowStyle: React.CSSProperties = {
    width: 560,
    maxWidth: '97vw',
    border: '1px solid var(--bd2)',
    background: 'var(--panel)',
    fontFamily: "'VT323', monospace",
  };

  const titleBarStyle: React.CSSProperties = {
    background: 'var(--ph-faint)',
    borderBottom: '1px solid var(--bd)',
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: "'VT323', monospace",
    fontSize: 13,
    letterSpacing: 2,
    color: 'var(--ph-dim)',
  };

  const outputStyle: React.CSSProperties = {
    height: 540,
    overflowY: 'auto',
    padding: '12px 14px',
    fontFamily: "'VT323', monospace",
    fontSize: 13,
    lineHeight: 1.8,
    background: '#010601',
    color: 'var(--ph-dim)',
  };

  const inputRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    borderTop: '1px solid var(--bd)',
    padding: '8px 14px',
    background: '#010601',
  };

  const promptStyle: React.CSSProperties = {
    fontFamily: "'VT323', monospace",
    fontSize: 14,
    color: 'var(--ph-mid)',
    marginRight: 6,
    flexShrink: 0,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: "'VT323', monospace",
    fontSize: 14,
    color: 'var(--ph)',
    textTransform: 'uppercase',
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="lg:col-span-2 dharma-panel"
    >
      <div className="dharma-panel-header border-b border-[hsla(var(--dharma-gray),0.5)]">
        <h2 className="dharma-panel-title tracking-[0.5em] text-sm">DHARMA TERMINAL v2.0</h2>
      </div>
      
      <div 
        ref={terminalOutputRef}
        className="dharma-panel-content h-72 overflow-auto font-terminal text-[hsl(var(--dharma-green))] text-lg relative"
      >
        <div className="space-y-2">
          {terminalOutput.filter(line => line.type !== 'cursor').map((line, index) => (
            <p key={index}>
              {line.text}
            </p>
          ))}
          <form onSubmit={handleSubmit} className="flex relative">
            <span className="mr-2">{'>:'}</span>
            <div className="relative flex-1">
              <input 
                ref={terminalInputRef}
                type="text" 
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (e.target.value.length > 0) {
                    playSound('beep', 'short');
                  }
                }}
                className="bg-transparent w-full focus:outline-none" 
                placeholder=""
                autoComplete="off"
              />
              {!input && <span className="absolute left-0 top-0 animate-terminal-blink">█</span>}
            </div>
          </form>
        </div>
      </div>
      
      {/* Terminal footer with status */}
      <div className="bg-[hsla(var(--dharma-gray),0.1)] p-2 text-xs text-[hsl(var(--dharma-green))] flex justify-between border-t border-[hsla(var(--dharma-gray),0.3)]">
        <span>Use command 'help' for available options</span>
        <span className={
          terminalStatus === 'ACCESS DENIED' 
            ? 'text-[hsl(var(--dharma-red))]' 
            : terminalStatus === 'ACCESS GRANTED' 
              ? 'text-[hsl(var(--dharma-bright-green))]' 
              : terminalStatus === 'SYSTEM FAILURE'
                ? 'text-[hsl(var(--dharma-red))] font-bold animate-terminal-blink'
                : ''
        }>
          {terminalStatus}
        </span>
      </div>
      
      {/* System Failure Overlay */}
      {isSystemFailure && (
        <div className="absolute top-2 left-2 right-2 z-10 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.7, 0.9, 0.7],
              y: [0, -3, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5 
            }}
            className="bg-transparent p-2 text-center"
          >
            <div className="font-terminal text-[hsl(var(--dharma-red))] text-4xl font-bold">
              
            </div>
          </motion.div>
        </div>
      )}
    </motion.section>
  );
};

export default Terminal;
