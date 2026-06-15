import React, { useState, useEffect, useRef } from 'react';

interface PearlStationLogProps {
  isVisible: boolean;
  timestamp: string;
  onClose: () => void;
}

const LOG_LINES = [
  'PEARL STATION — OBSERVATION LOG — SYS_AUTO',
  '————————————————————————————',
  'SUBJECT: SWAN STATION OPERATOR',
  'EVENT: PROTOCOL 23 — INPUT FAILURE',
  '————————————————————————————',
  'META: Electromagnetic containment breach detected',
  'META: Discharge event initiated — uncontrolled',
  'ERROR: Swan station input terminal — NO RESPONSE',
  'ERROR: Failsafe protocol not executed in time',
  'META: Temporal variance — sector 23 — anomalous',
  'META: Radiation levels exceeding safe parameters',
  'META: Pearl monitoring systems — reduced capacity',
  'META: Automated alert transmitted — all stations',
  'WARNING: Remote terminal access — LOST',
  'WARNING: Swan operator behavioural pattern — ERRATIC',
  'ERROR: Data corruption detected — logs 10881–10894',
  '————————————————————————————',
  'Pearl observers note: operator did not appear to',
  'be under duress. Subject appeared to be listening.',
  'To what, we cannot determine. Recommend review.',
  '————————————————————————————',
  'P_LOG.23.42 — RECORDING COMPLETE',
];

export default function PearlStationLog({ isVisible, timestamp, onClose }: PearlStationLogProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible) {
      setVisibleLines([]);
      setIsPrinting(false);
      return;
    }

    setIsPrinting(true);
    setVisibleLines([`SYS_FAIL_${timestamp || Date.now()}`]);

    const timers: ReturnType<typeof setTimeout>[] = [];
    LOG_LINES.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleLines(prev => [...prev, line]);
      }, 600 + i * 700);
      timers.push(t);
    });

    const done = setTimeout(() => setIsPrinting(false), 600 + LOG_LINES.length * 700 + 800);
    timers.push(done);

    return () => timers.forEach(clearTimeout);
  }, [isVisible, timestamp]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLines]);

  if (!isVisible) return null;

  const container: React.CSSProperties = {
    position: 'fixed',
    bottom: 20,
    right: 20,
    width: 340,
    zIndex: 40000,
    border: '1px solid var(--bd2)',
    background: 'var(--panel2)',
    fontFamily: "'VT323', monospace",
  };

  const titleBar: React.CSSProperties = {
    borderBottom: '1px solid var(--bd)',
    background: 'var(--ph-faint)',
    padding: '4px 10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 11,
    letterSpacing: 3,
    color: 'var(--ph-dim)',
  };

  return (
    <div style={container}>
      <div style={titleBar}>
        <span>PEARL STATION · PRINT TERMINAL</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ph-dim)', fontFamily: "'VT323', monospace", fontSize: 13 }}>
          [X]
        </button>
      </div>

      <div
        ref={scrollRef}
        style={{
          height: 220,
          overflowY: 'auto',
          padding: '8px 10px',
          fontSize: 11,
          lineHeight: 1.7,
          color: 'var(--ph-dim)',
        }}
      >
        {visibleLines.map((line, i) => (
          <div key={i} style={{
            color: line.startsWith('ERROR') ? 'var(--red)'
              : line.startsWith('WARNING') ? 'var(--am)'
              : line.startsWith('META') ? 'var(--ph-dim)'
              : line.startsWith('PEARL') || line.startsWith('SYS') ? 'var(--ph)'
              : line.startsWith('———') ? 'var(--bd2)'
              : 'var(--dim)',
          }}>
            {line}
          </div>
        ))}
        {isPrinting && (
          <span className="animate-terminal-blink" style={{ color: 'var(--ph-dim)' }}>_</span>
        )}
      </div>

      <div style={{
        borderTop: '1px solid var(--bd)',
        padding: '4px 10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 10,
        letterSpacing: 2,
        color: 'var(--dim)',
      }}>
        <span>DHARMA INITIATIVE © 1977</span>
        {isPrinting && (
          <span className="animate-terminal-blink" style={{ color: 'var(--am)' }}>■ RECORDING</span>
        )}
        {!isPrinting && <span style={{ color: 'var(--ph-dim)' }}>■ COMPLETE</span>}
      </div>
    </div>
  );
}
