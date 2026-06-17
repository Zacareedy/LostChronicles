import React, { useState, useEffect, useRef, useCallback } from 'react';

interface RadioReceiverProps {
  isVisible: boolean;
  onClose: () => void;
}

const FREQ_MIN = 0.5;
const FREQ_MAX = 120;
const SNAP_RANGE = 0.35;
const TARGET_FREQS = [4.8, 8.0, 15.16, 23.42];

// Signal fragments embedded in each transmission — spell KRONOS when concatenated
const FREQ_FRAGMENTS: Record<number, string> = {
  4.8:   'K',
  8.0:   'R',
  15.16: 'ON',
  23.42: 'OS',
};

const TRANSMISSIONS: Record<number, string> = {
  4.8: [
    'DHARMA BEACON — 4.8 MHz — STATION ARROW',
    '',
    'Archaeological survey data transmitted.',
    'Temporal anomaly readings logged — Sector 4.',
    'Awaiting collection team confirmation.',
    '',
    '────────────────',
    `SECTOR TAG: ${FREQ_FRAGMENTS[4.8]}`,
    '────────────────',
    '... static ...',
  ].join('\n'),
  8.0: [
    'DHARMA BEACON — 8.0 MHz — STATION FLAME',
    '',
    'Communications relay operating at reduced capacity.',
    'Manual routing protocol engaged.',
    'All stations: verify intranet connectivity.',
    '',
    '────────────────',
    `ROUTING CODE: ${FREQ_FRAGMENTS[8.0]}`,
    '────────────────',
    '... static ...',
  ].join('\n'),
  15.16: [
    'DHARMA BEACON — 15.16 MHz — STATION PEARL',
    '',
    'Observation log cycle 108 complete.',
    'Swan operator behavioural patterns — anomalous.',
    'Recommend psychiatric review.',
    '',
    '────────────────',
    `CYCLE MARKER: ${FREQ_FRAGMENTS[15.16]}`,
    '────────────────',
    '... static ...',
  ].join('\n'),
  23.42: [
    'DHARMA BEACON — 23.42 MHz — STATION HYDRA',
    '',
    'Zoological specimens stable.',
    'Incident report filed: perimeter event.',
    'Entity designation on file — see Protocol 7-J.',
    '',
    '────────────────',
    `DESIGNATION SUFFIX: ${FREQ_FRAGMENTS[23.42]}`,
    '────────────────',
    '... static ...',
  ].join('\n'),
};

const ORCHID_TRANSMISSION = [
  'DHARMA ORCHID STATION — 108.0 MHz — ENCRYPTED',
  '────────────────────────────────────────────',
  '',
  'TO:   ALL STATION OPERATORS',
  'FROM: DR. EDGAR HALLOWAX',
  'RE:   PROTOCOL 7-J / CONTAINMENT UPDATE',
  '',
  '... TRANSMISSION BEGINS ...',
  '',
  'Anomalous entity — DHARMA designation THANATOS —',
  'confirmed active in Swan Station sector.',
  'Perimeter breach logged. Duration 11 minutes.',
  '',
  'If containment protocol fails, the name is the key.',
  'Encode accordingly. THANATOS. All station operators',
  'must be aware of this designation.',
  '',
  'The numbers must be entered. Every 108 minutes.',
  'Do not let the clock run out.',
  '',
  '... END OF TRANSMISSION ...',
  '────────────────────────────────────────────',
].join('\n');

const BTN: React.CSSProperties = {
  background: '#150f04',
  border: '1px solid #5a4518',
  color: '#c8a832',
  fontFamily: "'VT323', monospace",
  fontSize: 18,
  padding: '5px 12px',
  cursor: 'pointer',
  letterSpacing: 1,
  userSelect: 'none',
};

export default function RadioReceiver({ isVisible, onClose }: RadioReceiverProps) {
  const [freq, setFreq] = useState(50.0);
  const [lockedFreqs, setLockedFreqs] = useState<number[]>([]);
  const [finalUnlocked, setFinalUnlocked] = useState(false);
  const [transmission, setTransmission] = useState<string | null>(null);
  const isDragging = useRef(false);
  const lastX = useRef(0);

  const allLocked = TARGET_FREQS.every(t => lockedFreqs.includes(t));

  const nearTarget = [...TARGET_FREQS, ...(allLocked ? [108.0] : [])].find(
    t => Math.abs(freq - t) < SNAP_RANGE
  );

  const signalStrength = (() => {
    const targets = [...TARGET_FREQS, ...(allLocked ? [108.0] : [])];
    const closest = targets.reduce((min, t) => Math.min(min, Math.abs(freq - t)), Infinity);
    if (closest < SNAP_RANGE) return 20;
    if (closest < 1.5) return Math.round(20 * (1 - closest / 1.5));
    return 0;
  })();

  useEffect(() => {
    if (allLocked) {
      // All four frequencies tuned in this session — set fragment completion flag
      try { localStorage.setItem('dharma_radio_fragments_complete', 'true'); } catch {}
    }
  }, [allLocked]);

  useEffect(() => {
    if (allLocked && Math.abs(freq - 108.0) < SNAP_RANGE && !finalUnlocked) {
      setFinalUnlocked(true);
      const combined = TARGET_FREQS.map(f => FREQ_FRAGMENTS[f]).join('');
      setTransmission(
        ORCHID_TRANSMISSION + '\n\n────────────────\n' +
        'SECTOR CODES ASSEMBLED: ' +
        TARGET_FREQS.map(f => FREQ_FRAGMENTS[f]).join(' · ') +
        '\nCOMPLETE DESIGNATION: ' + combined +
        '\n────────────────'
      );
    }
  }, [freq, allLocked, finalUnlocked]);

  const nudgeFreq = useCallback((delta: number) => {
    setFreq(prev => {
      const next = Math.max(FREQ_MIN, Math.min(FREQ_MAX, +(prev + delta).toFixed(2)));
      return next;
    });
  }, []);

  const handleKnobDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastX.current = e.clientX;
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = (e.clientX - lastX.current) * 0.12;
      lastX.current = e.clientX;
      nudgeFreq(delta);
    };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [nudgeFreq]);

  const handleLock = () => {
    if (!nearTarget || lockedFreqs.includes(nearTarget)) return;
    if (nearTarget === 108.0) return; // handled by useEffect
    const next = [...lockedFreqs, nearTarget];
    setLockedFreqs(next);
    setTransmission(TRANSMISSIONS[nearTarget] ?? null);
    setTimeout(() => setTransmission(prev => prev === TRANSMISSIONS[nearTarget] ? null : prev), 7000);
  };

  const dialAngle = ((freq - FREQ_MIN) / (FREQ_MAX - FREQ_MIN)) * 270 - 135;

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50000,
      background: 'rgba(0,0,0,0.96)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Radio chassis */}
      <div style={{
        background: 'linear-gradient(160deg, #1c1408 0%, #120e04 100%)',
        border: '3px solid #4a3810',
        borderRadius: 10,
        padding: '24px 28px',
        width: 600,
        boxShadow: '0 0 60px #0008, inset 0 1px 0 #ffffff0a',
        fontFamily: "'VT323', monospace",
      }}>

        {/* Header plate */}
        <div style={{
          borderBottom: '1px solid #3a2c0a', paddingBottom: 12, marginBottom: 18,
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        }}>
          <div>
            <div style={{ color: '#c8a832', fontSize: 22, letterSpacing: 6 }}>DHARMA INITIATIVE</div>
            <div style={{ color: '#7a5a18', fontSize: 14, letterSpacing: 4 }}>MULTI-BAND FIELD RECEIVER — DI-77</div>
          </div>
          <div style={{ color: '#4a3a12', fontSize: 11, letterSpacing: 2, textAlign: 'right' }}>
            <div>SWN-7</div>
            <div>FIELD UNIT</div>
          </div>
        </div>

        {/* Frequency display */}
        <div style={{
          background: '#050d05', border: '2px solid #1a2a1a',
          borderRadius: 4, padding: '10px 16px', marginBottom: 18,
          boxShadow: 'inset 0 2px 8px #000a',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
            <div style={{ color: '#4dff7c', fontSize: 48, letterSpacing: 2, lineHeight: 1 }}>
              {freq.toFixed(2)}
            </div>
            <div style={{ color: '#25b84a', fontSize: 20, marginBottom: 4 }}>MHz</div>
          </div>

          {/* Signal bars */}
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 20 }}>
            {Array.from({ length: 24 }).map((_, i) => {
              const threshold = Math.round((i / 24) * 20);
              const lit = threshold < signalStrength;
              const barH = 4 + i * 0.65;
              return (
                <div key={i} style={{
                  width: 7, height: barH,
                  background: lit
                    ? (i < 14 ? '#4dff7c' : i < 20 ? '#e8c830' : '#ff4444')
                    : '#0d1a0d',
                  transition: 'background 0.06s',
                  alignSelf: 'flex-end',
                }} />
              );
            })}
            <div style={{ flex: 1 }} />
            {nearTarget !== undefined && (
              <div style={{ color: '#4dff7c', fontSize: 12, letterSpacing: 2, alignSelf: 'flex-end', marginLeft: 4 }}>
                ● SIGNAL
              </div>
            )}
          </div>
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 18 }}>
          {/* Tuning knob */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div
              onMouseDown={handleKnobDown}
              style={{
                width: 90, height: 90, borderRadius: '50%',
                background: 'radial-gradient(circle at 38% 35%, #6a5428, #2a1c08)',
                border: '3px solid #7a6030',
                boxShadow: '0 3px 12px #0008, inset 0 1px 4px #ffffff18',
                cursor: 'ew-resize', position: 'relative', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                width: '40%', height: 3,
                background: 'linear-gradient(90deg, #c8a832, #8a6818)',
                transformOrigin: '0 50%',
                transform: `rotate(${dialAngle}deg)`,
                borderRadius: 2,
              }} />
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 12, height: 12, borderRadius: '50%',
                background: '#1a1008', border: '1px solid #5a4010',
              }} />
            </div>
            <div style={{ color: '#5a4010', fontSize: 11, letterSpacing: 3 }}>TUNING</div>
          </div>

          {/* Fine tune + lock */}
          <div style={{ flex: 1 }}>
            <div style={{ color: '#5a4010', fontSize: 11, letterSpacing: 3, marginBottom: 8 }}>FINE TUNE</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <button style={BTN} onClick={() => nudgeFreq(-1)}>◄◄</button>
              <button style={BTN} onClick={() => nudgeFreq(-0.1)}>◄</button>
              <button style={BTN} onClick={() => nudgeFreq(0.1)}>►</button>
              <button style={BTN} onClick={() => nudgeFreq(1)}>►►</button>
            </div>

            <button
              onClick={handleLock}
              disabled={!nearTarget || (nearTarget !== 108.0 && lockedFreqs.includes(nearTarget))}
              style={{
                ...BTN,
                fontSize: 16,
                padding: '6px 20px',
                background: nearTarget && !(nearTarget !== 108.0 && lockedFreqs.includes(nearTarget))
                  ? '#0a2010' : '#0a0a08',
                color: nearTarget && !(nearTarget !== 108.0 && lockedFreqs.includes(nearTarget))
                  ? '#4dff7c' : '#2a2218',
                border: '1px solid',
                borderColor: nearTarget && !(nearTarget !== 108.0 && lockedFreqs.includes(nearTarget))
                  ? '#4dff7c' : '#2a1c08',
              }}
            >
              LOCK FREQUENCY
            </button>
          </div>

          {/* Static noise visual */}
          <div style={{
            width: 70, height: 90, background: '#050a05',
            border: '1px solid #1a2a1a', borderRadius: 4,
            overflow: 'hidden', position: 'relative', flexShrink: 0,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              opacity: signalStrength > 10 ? 0.1 : 0.6,
              background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, #0f1a0f 2px, #0f1a0f 3px)',
              transition: 'opacity 0.2s',
            }} />
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: signalStrength > 15 ? '#4dff7c' : '#1a2a1a',
              fontSize: 28, transition: 'color 0.2s',
            }}>
              {signalStrength > 15 ? '◉' : '○'}
            </div>
          </div>
        </div>

        {/* Locked frequencies panel */}
        <div style={{ borderTop: '1px solid #2a1c08', paddingTop: 12, marginBottom: 14 }}>
          <div style={{ color: '#5a4010', fontSize: 11, letterSpacing: 3, marginBottom: 8 }}>LOCKED CHANNELS</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TARGET_FREQS.map(t => {
              const locked = lockedFreqs.includes(t);
              return (
                <div key={t} style={{
                  padding: '3px 10px', border: '1px solid',
                  borderColor: locked ? '#4dff7c' : '#2a1c08',
                  color: locked ? '#4dff7c' : '#2a2218',
                  fontSize: 14, letterSpacing: 1,
                  transition: 'all 0.3s',
                }}>
                  {t.toFixed(2)} MHz {locked ? '✓' : '—'}
                </div>
              );
            })}
            <div style={{
              padding: '3px 10px', border: '1px solid',
              borderColor: finalUnlocked ? '#e8c830' : (allLocked ? '#4a3810' : '#1a1208'),
              color: finalUnlocked ? '#e8c830' : (allLocked ? '#6a5818' : '#1e1810'),
              fontSize: 14, letterSpacing: 1,
              transition: 'all 0.3s',
            }}>
              108.00 MHz {finalUnlocked ? '✓' : (allLocked ? '???' : '—')}
            </div>
          </div>
          {allLocked && !finalUnlocked && (
            <div style={{ color: '#c8a832', fontSize: 13, marginTop: 8, letterSpacing: 1 }}>
              ALL BEACONS SYNCHRONIZED — SCANNING FOR ADDITIONAL FREQUENCIES...
            </div>
          )}
        </div>

        {/* Transmission display */}
        {transmission && (
          <div style={{
            background: '#030803', border: '1px solid #1a2a1a', borderRadius: 4,
            padding: '10px 14px', marginBottom: 14,
            fontSize: 12, color: '#25b84a', lineHeight: 1.65,
            letterSpacing: 0.5, whiteSpace: 'pre-wrap',
            maxHeight: 180, overflowY: 'auto',
            fontFamily: "'Courier New', monospace",
          }}>
            {transmission}
          </div>
        )}

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #2a1c08', paddingTop: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ color: '#3a2c0a', fontSize: 10, letterSpacing: 2 }}>
            DHARMA INITIATIVE © 1977 — FIELD EQUIPMENT
          </span>
          <button
            onClick={onClose}
            style={{ ...BTN, color: '#7a5a18', borderColor: '#3a2c0a', fontSize: 14 }}
          >
            POWER OFF
          </button>
        </div>
      </div>
    </div>
  );
}
