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
}

const Terminal: React.FC<TerminalProps> = ({ onRevealPuzzle, onRevealStation, onCorrectSequence }) => {
  const [terminalOutput, setTerminalOutput] = useState<TerminalOutput[]>([
    { text: '> DHARMA INITIATIVE - SWAN STATION TERMINAL', type: 'output' },
    { text: '> AWAITING INPUT...', type: 'output' },
    { text: '_', type: 'cursor' }
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
      // Handle system error navigation
      setTimeout(() => {
        setLocation('/system-error');
      }, 2000);
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
    } else if (userInput.toLowerCase() === '4 8 15 16 23 42') {
      // Handle the numbers
      setTerminalStatus('SYSTEM RESET');
      setTimeout(() => setTerminalStatus('CONNECTED'), 3000);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="lg:col-span-2 bg-[hsl(var(--dharma-black))] border border-[hsla(var(--dharma-gray),0.3)] rounded-lg overflow-hidden"
    >
      <div className="bg-[hsla(var(--dharma-gray),0.2)] p-2 flex justify-between items-center">
        <h2 className="font-terminal text-[hsl(var(--dharma-amber))]">TERMINAL</h2>
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--dharma-red))]"></div>
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--dharma-amber))]"></div>
          <div className="w-3 h-3 rounded-full bg-[hsl(var(--dharma-green))]"></div>
        </div>
      </div>
      
      <div 
        ref={terminalOutputRef}
        className="p-4 h-72 overflow-auto font-terminal text-[hsl(var(--dharma-amber))] text-lg relative"
      >
        <div className="space-y-2">
          {terminalOutput.map((line, index) => (
            <p key={index} className={line.type === 'cursor' ? 'animate-terminal-blink' : ''}>
              {line.text}
            </p>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-[hsla(var(--dharma-gray),0.3)]">
          <form onSubmit={handleSubmit} className="flex">
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
              placeholder="Enter command"
              autoComplete="off"
            />
          </form>
        </div>
      </div>
      
      <div className="bg-[hsla(var(--dharma-gray),0.1)] p-2 text-xs text-[hsl(var(--dharma-gray))] flex justify-between">
        <span>Use command 'help' for available options</span>
        <span className={terminalStatus === 'ACCESS DENIED' 
          ? 'text-[hsl(var(--dharma-red))]' 
          : terminalStatus === 'ACCESS GRANTED' 
          ? 'text-[hsl(var(--dharma-green))]' 
          : ''}
        >
          {terminalStatus}
        </span>
      </div>
    </motion.section>
  );
};

export default Terminal;
