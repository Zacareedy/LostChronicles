import React, { useState, useEffect, useRef } from 'react';

interface SystemFailureScreenProps {
  isActive: boolean;
}

// "System Failure" repeated enough to flood any screen resolution
const PHRASE = 'System Failure';
const FULL_TEXT = Array(600).fill(PHRASE).join('');

const CHARS_PER_TICK = 5;   // characters revealed per interval
const TICK_MS = 18;          // ms between ticks — fast enough to look like a flood

export default function SystemFailureScreen({ isActive }: SystemFailureScreenProps) {
  const [charCount, setCharCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!isActive) {
      clearInterval(intervalRef.current);
      setCharCount(0);
      return;
    }

    // Small head-start delay to let alarm + terminal messages fire first
    const startDelay = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setCharCount(prev => {
          const next = prev + CHARS_PER_TICK;
          if (next >= FULL_TEXT.length) {
            clearInterval(intervalRef.current);
            return FULL_TEXT.length;
          }
          return next;
        });
      }, TICK_MS);
    }, 800);

    return () => {
      clearTimeout(startDelay);
      clearInterval(intervalRef.current);
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 48000,
        background: '#000',
        overflow: 'hidden',
        // Pass pointer events through so the terminal input below stays usable
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          color: '#4dff7c',
          textShadow: '0 0 8px #4dff7c, 0 0 20px #00cc3388',
          lineHeight: 1.05,
          wordBreak: 'break-all',
          whiteSpace: 'pre-wrap',
          padding: '0.2em',
          letterSpacing: '0.01em',
          // CRT scanline overlay
          background:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)',
        }}
      >
        {FULL_TEXT.slice(0, charCount)}
      </div>
    </div>
  );
}
