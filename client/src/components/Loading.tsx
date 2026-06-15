import React, { useState, useEffect } from 'react';
import dharmaLogoSvg from '@/assets/dharma-logo-fixed.svg';

interface LoadingProps {
  onLoadComplete: () => void;
}

const BOOT_LINES = [
  'DHARMA INITIATIVE — INTRANET NODE SWN-7',
  'SWAN STATION — SUBLEVEL B — SYSTEM BOOT',
  'INITIALISING PROTOCOL 23...',
  'EM CONTAINMENT STATUS: NOMINAL',
  'LOADING OPERATOR INTERFACE...',
  'READY — CLEARANCE LEVEL 4',
];

const Loading: React.FC<LoadingProps> = ({ onLoadComplete }) => {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show each line with 600ms delay
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((_, i) => {
      const t = setTimeout(() => {
        setVisibleLines(i + 1);
      }, 600 * (i + 1));
      timers.push(t);
    });

    // After last line, wait 1.5s then fade and call onLoadComplete
    const finalTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onLoadComplete();
      }, 600);
    }, 600 * BOOT_LINES.length + 1500);

    timers.push(finalTimer);

    return () => timers.forEach(clearTimeout);
  }, [onLoadComplete]);

  if (!isVisible) return null;

  return (
    <div
      id="splash"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'var(--bg, #010a02)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'VT323', monospace",
      }}
    >
      {/* Swan logo */}
      <div style={{ marginBottom: 40, width: 160, height: 160 }}>
        <img
          src={dharmaLogoSvg}
          alt="DHARMA Initiative Logo"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Boot lines */}
      <div style={{
        width: '100%',
        maxWidth: 520,
        padding: '0 20px',
      }}>
        {BOOT_LINES.map((line, i) => (
          <div
            key={i}
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: 16,
              letterSpacing: 2,
              lineHeight: 2,
              color: i === BOOT_LINES.length - 1 ? 'var(--ph, #4dff7c)' : 'var(--ph-dim, #0f5a25)',
              opacity: i < visibleLines ? 1 : 0,
              transition: 'opacity 0.2s',
            }}
          >
            {i < visibleLines ? `> ${line}` : ''}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;
