import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { processCommand } from '@/lib/terminal';
import { playSound } from '@/lib/audio';
import { getClearance, clearanceLabel } from '@/lib/clearance';
import { useLocation } from 'wouter';

interface TerminalOutput {
  text: string;
  type: 'input' | 'output' | 'cursor';
  isTyping?: boolean;
  fullText?: string;
}

interface TerminalProps {
  onRevealPuzzle: () => void;
  onRevealStation: (stationName: string) => void;
  onCorrectSequence: () => void;
  onCommand?: (command: string) => void;
  isSystemFailure?: boolean;
}

// Full-screen static noise canvas — shown after implosion
const StaticNoiseCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const img = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < img.data.length; i += 4) {
        const lit = Math.random() < 0.07;
        img.data[i]   = 0;
        img.data[i+1] = lit ? Math.floor(Math.random() * 200 + 55) : 3;
        img.data[i+2] = 0;
        img.data[i+3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    };

    draw();
    const id = setInterval(draw, 80);
    return () => clearInterval(id);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      style={{ width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated' }}
    />
  );
};

const Terminal: React.FC<TerminalProps> = ({ onRevealPuzzle, onRevealStation, onCorrectSequence, onCommand, isSystemFailure = false }) => {
  const [terminalOutput, setTerminalOutput] = useState<TerminalOutput[]>([]);
  const [input, setInput] = useState('');
  const [terminalStatus, setTerminalStatus] = useState('CONNECTED');
  const [clearance, setClearanceState] = useState(() => getClearance());
  const [upgrading, setUpgrading] = useState(false);
  const terminalInputRef = useRef<HTMLInputElement>(null);
  const terminalOutputRef = useRef<HTMLDivElement>(null);
  const [_, setLocation] = useLocation();

  // Glitch progression tracking
  const failureStartRef = useRef<number>(0);
  const [failureIntensity, setFailureIntensity] = useState<0 | 1 | 2 | 3>(0);
  const [isImploded, setIsImploded] = useState(false);

  // Global keydown buffer for failsafe during implosion
  const failsafeBufferRef = useRef('');

  useEffect(() => {
    if (terminalInputRef.current) terminalInputRef.current.focus();
  }, []);

  // Listen for clearance upgrades
  useEffect(() => {
    const handler = (e: Event) => {
      const { level } = (e as CustomEvent<{ level: number }>).detail;
      setClearanceState(level);
      setUpgrading(true);
      setTimeout(() => setUpgrading(false), 2500);
    };
    window.addEventListener('dharma-clearance-change', handler);
    return () => window.removeEventListener('dharma-clearance-change', handler);
  }, []);

  // Global keydown listener during implosion — catch FAILSAFE typed anywhere
  useEffect(() => {
    if (!isImploded) return;
    failsafeBufferRef.current = '';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (failsafeBufferRef.current.trim().toUpperCase() === 'FAILSAFE') {
          try { localStorage.setItem('dharma_failsafe_activated', 'true'); } catch {}
        }
        failsafeBufferRef.current = '';
      } else if (e.key === 'Backspace') {
        failsafeBufferRef.current = failsafeBufferRef.current.slice(0, -1);
      } else if (e.key.length === 1) {
        failsafeBufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isImploded]);

  // Typewriter effect
  useEffect(() => {
    const typingItem = terminalOutput.find(item => item.isTyping && item.fullText && item.text.length < item.fullText.length);

    if (typingItem && typingItem.fullText) {
      const typingSpeed = Math.random() * 30 + 10;
      const timeoutId = setTimeout(() => {
        setTerminalOutput(prev =>
          prev.map(item => {
            if (item === typingItem && item.fullText) {
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
        if (Math.random() < 0.3) {
          playSound('beep', 'short');
        }
      }, typingSpeed);

      return () => clearTimeout(timeoutId);
    }
  }, [terminalOutput]);

  // Auto-scroll
  useEffect(() => {
    if (terminalOutputRef.current) {
      terminalOutputRef.current.scrollTop = terminalOutputRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  // System failure: flood text + start glitch intensity timer
  useEffect(() => {
    if (isSystemFailure) {
      setTerminalStatus('SYSTEM FAILURE');
      failureStartRef.current = Date.now();
      setFailureIntensity(0);
      setIsImploded(false);
      const floodText = Array(200).fill('System Failure').join('');
      setTerminalOutput([
        { text: '', type: 'output', isTyping: true, fullText: floodText },
      ]);
    } else {
      setTerminalOutput([]);
      setTerminalStatus('CONNECTED');
      setFailureIntensity(0);
      setIsImploded(false);
    }
  }, [isSystemFailure]);

  // Glitch intensity progression: minute 1 scanlines, minute 2 jitter, minute 3 chromatic → implosion
  useEffect(() => {
    if (!isSystemFailure) return;

    const id = setInterval(() => {
      const mins = (Date.now() - failureStartRef.current) / 60000;
      const next = Math.min(3, Math.floor(mins)) as 0 | 1 | 2 | 3;
      setFailureIntensity(next);
      if (next >= 3) setIsImploded(true);
    }, 5000);

    return () => clearInterval(id);
  }, [isSystemFailure]);

  // Ambient messages
  useEffect(() => {
    if (isSystemFailure) return;

    const ambientMessages = [
      '> [System monitoring active]',
      '> [Electromagnetic anomaly detected]',
      '> [Atmospheric analysis complete]',
      '> [Protocol verification required]'
    ];

    if (terminalOutput.length > 5) {
      const intervalId = setInterval(() => {
        if (Math.random() < 0.1) {
          const message = ambientMessages[Math.floor(Math.random() * ambientMessages.length)];
          setTerminalOutput(prev => prev.filter(item => item.type !== 'cursor'));
          setTerminalOutput(prev => [
            ...prev,
            { text: message, type: 'output' },
            { text: '>:█', type: 'cursor' }
          ]);
          playSound('beep', 'short');
        }
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [terminalOutput, isSystemFailure]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isImploded) return;

    const userInput = input.trim();
    setInput('');

    setTerminalOutput(prev => prev.filter(item => item.type !== 'cursor'));
    setTerminalOutput(prev => [
      ...prev,
      { text: `> ${userInput}`, type: 'input' }
    ]);

    const correctSequenceWithClear = () => {
      setTerminalOutput([]);
      setTerminalStatus('CONNECTED');
      if (onCorrectSequence) onCorrectSequence();
    };

    const response = processCommand(userInput, onRevealPuzzle, onRevealStation, correctSequenceWithClear, isSystemFailure);

    if (userInput.toLowerCase() === 'clear') {
      setTerminalOutput([]);
    } else {
      response.forEach((line, index) => {
        setTimeout(() => {
          setTerminalOutput(prev => [
            ...prev,
            { text: "", type: 'output', isTyping: true, fullText: line }
          ]);
        }, index * 50);
      });
    }

    if (onCommand) {
      onCommand(userInput);
    }

    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev,
        { text: '>:█', type: 'cursor' }
      ]);
    }, 100);

    if (userInput.toLowerCase().includes('scan')) {
      setTerminalStatus('SCANNING...');
      setTimeout(() => setTerminalStatus('CONNECTED'), 3000);
    } else if (userInput.toLowerCase().includes('login')) {
      if (userInput.includes('4815162342') || userInput.includes('dharma77') || userInput.includes('C22/DSTNGSHD-LBRT')) {
        setTerminalStatus('ACCESS GRANTED');
        setTimeout(() => setTerminalStatus('CONNECTED'), 3000);
      } else {
        setTerminalStatus('ACCESS DENIED');
        setTimeout(() => setTerminalStatus('CONNECTED'), 3000);
      }
    }
  };

  return (
    <>
      {/* ── Full-screen glitch overlays ── rendered outside panel so they cover the whole page */}

      {/* Intensity 1+: scanlines */}
      {isSystemFailure && failureIntensity >= 1 && !isImploded && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9000, pointerEvents: 'none',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)',
          }}
        />
      )}

      {/* Intensity 2+: jitter — apply to whole page via class on a fixed wrapper */}
      {isSystemFailure && failureIntensity >= 2 && !isImploded && (
        <div
          className="animate-terminal-glitch"
          style={{ position: 'fixed', inset: 0, zIndex: 9001, pointerEvents: 'none' }}
        />
      )}

      {/* Intensity 3: chromatic aberration overlay */}
      {isSystemFailure && failureIntensity >= 3 && !isImploded && (
        <>
          <svg style={{ position: 'fixed', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 9002 }}>
            <defs>
              <filter id="dharma-ca-fullscreen" x="-10%" y="-10%" width="120%" height="120%">
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
                <feOffset in="r" dx="-4" result="r-off" />
                <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
                <feOffset in="b" dx="4" result="b-off" />
                <feMerge>
                  <feMergeNode in="r-off" />
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="b-off" />
                </feMerge>
              </filter>
            </defs>
          </svg>
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 9003, pointerEvents: 'none',
              filter: 'url(#dharma-ca-fullscreen)',
              background: 'transparent',
            }}
          />
        </>
      )}

      {/* Implosion: full-screen static noise + failsafe prompt */}
      {isImploded && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#000',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Static fills the screen */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <StaticNoiseCanvas />
          </div>
          {/* Failsafe prompt at bottom */}
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid rgba(51,255,51,0.3)',
              fontFamily: "'VT323', monospace",
              fontSize: 15,
              color: '#33ff33',
              letterSpacing: 2,
              textAlign: 'center',
              background: '#000',
            }}
          >
            SYSTEM IMPLODED — TYPE FAILSAFE + ENTER TO RESTORE
          </div>
        </div>
      )}

      {/* ── Terminal panel ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="lg:col-span-2 dharma-panel relative"
        style={upgrading ? { boxShadow: '0 0 24px 4px rgba(51,255,51,0.55)', transition: 'box-shadow 0.3s' } : {}}
      >
        <div className="dharma-panel-header border-b border-[hsla(var(--dharma-gray),0.5)] flex justify-between items-center">
          <h2 className="dharma-panel-title tracking-[0.5em] text-sm">DHARMA TERMINAL v2.0</h2>
          <span className="font-terminal text-xs tracking-widest" style={{ color: '#33ff33', opacity: 0.7 }}>
            CL-{clearance} {clearanceLabel(clearance)}
          </span>
        </div>

        {/* Clearance upgrade flash */}
        <AnimatePresence>
          {upgrading && (
            <motion.div
              key="upgrade-flash"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-x-0 top-10 z-20 pointer-events-none flex items-center justify-center"
              style={{ height: 36 }}
            >
              <div
                className="font-terminal text-sm tracking-widest animate-terminal-blink"
                style={{ color: '#33ff33', background: '#010601', padding: '4px 20px', border: '1px solid #33ff33' }}
              >
                ▲ CLEARANCE {clearance} — {clearanceLabel(clearance)} — GRANTED ▲
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terminal output */}
        <div
          ref={terminalOutputRef}
          className="dharma-panel-content h-72 overflow-auto font-terminal text-[hsl(var(--dharma-green))] text-lg relative"
        >
          <div className="space-y-2">
            {terminalOutput.filter(line => line.type !== 'cursor').map((line, index) => (
              <p key={index}>{line.text}</p>
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

        {/* Terminal footer */}
        <div
          className="bg-[hsla(var(--dharma-gray),0.1)] p-2 text-xs flex justify-between border-t border-[hsla(var(--dharma-gray),0.3)]"
          style={{ color: '#33ff33' }}
        >
          <span>Type HELP for commands · AUTHENTICATE to advance clearance</span>
          <span className={
            terminalStatus === 'ACCESS DENIED'
              ? 'text-[hsl(var(--dharma-red))]'
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
              animate={{ opacity: [0.7, 0.9, 0.7], y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="bg-transparent p-2 text-center"
            >
              <div className="font-terminal text-[hsl(var(--dharma-red))] text-4xl font-bold" />
            </motion.div>
          </div>
        )}
      </motion.section>
    </>
  );
};

export default Terminal;
