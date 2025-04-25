import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { processCommand } from '@/lib/terminal';
import { playSound } from '@/lib/audio';
import { useLocation } from 'wouter';

interface TerminalOutput {
  text: string;
  type: 'input' | 'output' | 'cursor';
}

interface TerminalProps {
  onRevealPuzzle: () => void;
  onRevealStation: (stationName: string) => void;
  onCorrectSequence: () => void;
  onCommand?: (command: string) => void; // Optional handler for terminal commands
}

const Terminal: React.FC<TerminalProps> = ({ onRevealPuzzle, onRevealStation, onCorrectSequence, onCommand }) => {
  const [terminalOutput, setTerminalOutput] = useState<TerminalOutput[]>([
    { text: '>DHARMA INITIATIVE - SWAN STATION TERMINAL', type: 'output' },
    { text: '>AWAITING INPUT...', type: 'output' },
    { text: '▋', type: 'cursor' }
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

  useEffect(() => {
    // Scroll to bottom of terminal output when new content is added
    if (terminalOutputRef.current) {
      terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // Add some ambient terminal messages at random intervals
  useEffect(() => {
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
            { text: '_', type: 'cursor' }
          ]);
          
          // Play subtle beep
          playSound('beep', 'short');
        }
      }, 30000); // Every 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [terminalOutput]);

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
    const response = processCommand(userInput, onRevealPuzzle, onRevealStation, onCorrectSequence);
    
    // If clear command, clear terminal
    if (userInput.toLowerCase() === 'clear') {
      setTerminalOutput([]);
    } else {
      // Add response to terminal
      response.forEach(line => {
        setTerminalOutput(prev => [
          ...prev,
          { text: line, type: 'output' }
        ]);
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
        { text: '_', type: 'cursor' }
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
      handleCorrectSequence();
      setTerminalStatus('SYSTEM RESET');
      playSound('success');
      setTimeout(() => setTerminalStatus('CONNECTED'), 3000);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="lg:col-span-2 dharma-panel"
    >
      <div className="dharma-panel-header">
        <h2 className="dharma-panel-title">TERMINAL</h2>
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--dharma-red))]"></div>
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--dharma-amber))]"></div>
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--dharma-green))]"></div>
        </div>
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
            <span className="mr-2">{'>'}</span>
            <input 
              ref={terminalInputRef}
              type="text" 
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (e.target.value.length > 0) {
                  playSound('typing', 'short');
                }
              }}
              className="bg-transparent flex-1 focus:outline-none" 
              placeholder=""
              autoComplete="off"
            />
            {!input && <span className="absolute left-0 animate-terminal-blink">▋</span>}
          </form>
        </div>
      </div>
      
      <div className="bg-[hsla(var(--dharma-gray),0.1)] p-2 text-xs text-[hsl(var(--dharma-green))] flex justify-between border-t border-[hsla(var(--dharma-gray),0.3)]">
        <span>Use command 'help' for available options</span>
        <span className={terminalStatus === 'ACCESS DENIED' 
          ? 'text-[hsl(var(--dharma-red))]' 
          : terminalStatus === 'ACCESS GRANTED' 
          ? 'text-[hsl(var(--dharma-bright-green))]' 
          : ''}
        >
          {terminalStatus}
        </span>
      </div>
    </motion.section>
  );
};

export default Terminal;
