import React, { useState, useEffect, useRef } from 'react';

interface PearlStationLogProps {
  isVisible: boolean;
  timestamp: string;
  onClose?: () => void;
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
    width: 360,
    zIndex: 40000,
    border: '1px solid #bbb',
    background: '#f7f4ee',
    fontFamily: "'VT323', monospace",
    boxShadow: '2px 4px 16px rgba(0,0,0,0.45)',
  };

  const titleBar: React.CSSProperties = {
    borderBottom: '1px solid #ccc',
    background: '#ece9e1',
    padding: '4px 10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 11,
    letterSpacing: 3,
    color: '#444',
  };

  const lineColor = (line: string): string => {
    if (line.startsWith('ERROR')) return '#111';
    if (line.startsWith('WARNING')) return '#333';
    if (line.startsWith('META')) return '#555';
    if (line.startsWith('PEARL') || line.startsWith('SYS') || line.startsWith('P_LOG')) return '#000';
    if (line.startsWith('———')) return '#999';
    return '#222';
  };

  const lineFontWeight = (line: string): string => {
    if (line.startsWith('ERROR') || line.startsWith('PEARL') || line.startsWith('SYS') || line.startsWith('P_LOG')) return 'bold';
    return 'normal';
  };

  return (
    <div style={container}>
      <div style={titleBar}>
        <span>DHARMA INITIATIVE · PEARL · PRINT OUTPUT</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontFamily: "'VT323', monospace", fontSize: 13 }}>
          [X]
        </button>
      </div>

      {/* Perforation strip top */}
      <div style={{
        height: 8,
        background: 'repeating-linear-gradient(90deg, #e0ddd5 0px, #e0ddd5 6px, #f7f4ee 6px, #f7f4ee 12px)',
        borderBottom: '1px dashed #ccc',
      }} />

      <div
        ref={scrollRef}
        style={{
          height: 220,
          overflowY: 'auto',
          padding: '8px 14px',
          fontSize: 12,
          lineHeight: 1.65,
          background: '#f7f4ee',
        }}
      >
        {visibleLines.map((line, i) => (
          <div key={i} style={{
            color: lineColor(line),
            fontWeight: lineFontWeight(line),
            letterSpacing: 0.5,
          }}>
            {line}
          </div>
        ))}
        {isPrinting && (
          <span className="animate-terminal-blink" style={{ color: '#666' }}>_</span>
        )}
      </div>

      {/* Perforation strip bottom */}
      <div style={{
        height: 8,
        background: 'repeating-linear-gradient(90deg, #e0ddd5 0px, #e0ddd5 6px, #f7f4ee 6px, #f7f4ee 12px)',
        borderTop: '1px dashed #ccc',
      }} />

      <div style={{
        borderTop: '1px solid #ccc',
        background: '#ece9e1',
        padding: '4px 10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 10,
        letterSpacing: 2,
        color: '#666',
      }}>
        <span>DHARMA INITIATIVE © 1977</span>
        {isPrinting && (
          <span className="animate-terminal-blink" style={{ color: '#333' }}>■ PRINTING</span>
        )}
        {!isPrinting && <span style={{ color: '#888' }}>■ COMPLETE</span>}
      </div>
    </div>
  );
}
