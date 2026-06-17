import React, { useState, useMemo } from 'react';
import { playSound } from '@/lib/audio';

interface WaveformPuzzleProps {
  isVisible: boolean;
  onClose: () => void;
  onSolve: () => void;
}

// Generate a simple waveform SVG path from a seed array of amplitudes
function waveformPath(amps: number[], w: number, h: number): string {
  const mid = h / 2;
  const step = w / (amps.length - 1);
  const points = amps.map((a, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(mid - a * mid * 0.85).toFixed(1)}`);
  return points.join(' ');
}

// Six distinct waveform signatures — defined by amplitude arrays
const SIGNATURES = [
  [0, 0.8, 0.1, -0.9, 0.3, 0.7, -0.2, 0.5, -0.8, 0.1, 0],          // A
  [0, 0.4, 0.9, 0.4, 0, -0.4, -0.9, -0.4, 0, 0.4, 0.9],             // B — sine-like
  [0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 0.5, 0],         // C — square-like
  [0, 0.2, 0.9, -0.3, 0.6, -0.8, 0.1, 0.7, -0.5, 0.3, 0],          // D
  [0, -0.5, 0.7, 0.9, -0.2, -0.9, 0.3, 0.6, -0.7, 0.1, 0],         // E
  [0, 0.6, -0.4, 0.8, -0.9, 0.2, 0.7, -0.6, 0.3, -0.1, 0],         // F
];

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Seed from session start time — rotates the correct answer per session
function getCorrectIndex(): number {
  try {
    const start = parseInt(localStorage.getItem('countdown_start') || '0');
    return start % SIGNATURES.length;
  } catch {
    return 0;
  }
}

export default function WaveformPuzzle({ isVisible, onClose, onSolve }: WaveformPuzzleProps) {
  const correctIdx = useMemo(getCorrectIndex, []);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [attempts, setAttempts] = useState(0);

  if (!isVisible) return null;

  const W = 120;
  const H = 54;

  const handleSelect = (idx: number) => {
    if (result === 'correct') return;
    setSelected(idx);
    setAttempts(a => a + 1);
    if (idx === correctIdx) {
      setResult('correct');
      try { localStorage.setItem('dharma_waveform_solved', 'true'); } catch {}
      playSound('success');
      setTimeout(onSolve, 1800);
    } else {
      setResult('wrong');
      playSound('beep');
      setTimeout(() => { setResult(null); setSelected(null); }, 900);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50000,
      background: 'rgba(0,0,0,0.97)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Header */}
      <div style={{ color: '#4dff7c', fontFamily: "'VT323', monospace", fontSize: 14, letterSpacing: 5, marginBottom: 6 }}>
        CARRIER WAVE ANALYSIS — COMMS NODE SWN-7
      </div>
      <div style={{ color: '#33ff3388', fontFamily: 'monospace', fontSize: 11, letterSpacing: 2, marginBottom: 18 }}>
        MATCH THE APPROVED CARRIER SIGNATURE TO RESTORE OPERATOR UPLINK
      </div>

      {/* Reference waveform */}
      <div style={{ marginBottom: 18, textAlign: 'center' }}>
        <div style={{ color: '#009933', fontFamily: 'monospace', fontSize: 10, letterSpacing: 3, marginBottom: 6 }}>
          REFERENCE SIGNATURE — APPROVED CARRIER
        </div>
        <div style={{
          background: '#050f05', border: '1px solid #00aa33',
          padding: '8px 20px', display: 'inline-block',
        }}>
          <svg viewBox={`0 0 ${W} ${H}`} width={W * 2} height={H * 2}>
            <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#00330f" strokeWidth="0.5" />
            <path
              d={waveformPath(SIGNATURES[correctIdx], W, H)}
              fill="none" stroke="#00ff55" strokeWidth="1.5"
              style={{ filter: 'drop-shadow(0 0 3px #00ff5588)' }}
            />
          </svg>
        </div>
      </div>

      {/* Six candidate waveforms */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 10, marginBottom: 20 }}>
        {SIGNATURES.map((sig, idx) => {
          const isSelected = selected === idx;
          const isCorrect = result === 'correct' && isSelected;
          const isWrong = result === 'wrong' && isSelected;
          const borderColor = isCorrect ? '#00ff55' : isWrong ? '#ff3333' : isSelected ? '#33ff33' : '#1a3320';
          const glowColor = isCorrect ? '#00ff5544' : isWrong ? '#ff333344' : 'transparent';

          return (
            <div
              key={idx}
              onClick={() => handleSelect(idx)}
              style={{
                background: '#050f05',
                border: `1px solid ${borderColor}`,
                padding: '6px 10px',
                cursor: result === 'correct' ? 'default' : 'pointer',
                boxShadow: isSelected ? `0 0 8px ${glowColor}` : 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
            >
              <div style={{ color: '#005522', fontFamily: 'monospace', fontSize: 9, marginBottom: 3, letterSpacing: 2 }}>
                SIG-{LABELS[idx]}
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
                <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#001a08" strokeWidth="0.5" />
                <path
                  d={waveformPath(sig, W, H)}
                  fill="none"
                  stroke={isCorrect ? '#00ff55' : isWrong ? '#ff4444' : '#00bb44'}
                  strokeWidth="1.2"
                />
              </svg>
            </div>
          );
        })}
      </div>

      {/* Status */}
      <div style={{ height: 20, fontFamily: 'monospace', fontSize: 11, letterSpacing: 3 }}>
        {result === 'correct' && <span style={{ color: '#00ff55' }}>SIGNATURE VERIFIED — UPLINK RESTORED</span>}
        {result === 'wrong'   && <span style={{ color: '#ff4444' }}>MISMATCH — RETRY</span>}
        {!result && attempts > 0 && <span style={{ color: '#336633' }}>ATTEMPTS: {attempts}</span>}
      </div>

      <button
        onClick={onClose}
        style={{
          marginTop: 16, background: 'none', border: '1px solid #4dff7c',
          color: '#4dff7c', fontFamily: "'VT323', monospace",
          fontSize: 15, letterSpacing: 3, padding: '3px 16px', cursor: 'pointer',
        }}
      >
        CLOSE
      </button>
    </div>
  );
}
