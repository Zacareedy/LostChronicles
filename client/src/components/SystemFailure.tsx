import React, { useState, useEffect, useRef } from 'react';

interface SystemFailureProps {
  isActive: boolean;
  onReset: () => void;
}

const SystemFailure: React.FC<SystemFailureProps> = ({ isActive, onReset }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [flashPhase, setFlashPhase] = useState<'idle' | 'flashing' | 'done'>('idle');
  const flashRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isActive) {
      setShowOverlay(false);
      setFlashPhase('idle');
      return;
    }

    // Flash sequence: 7 cycles × 180ms
    setFlashPhase('flashing');
    let count = 0;
    const maxFlashes = 7;
    let on = true;

    if (flashRef.current) {
      flashRef.current.style.background = '#3a0000';
    }

    const flashInterval = setInterval(() => {
      count++;
      on = !on;
      if (flashRef.current) {
        flashRef.current.style.background = on ? '#3a0000' : '#000';
        flashRef.current.style.opacity = on ? '1' : '0.3';
      }
      if (count >= maxFlashes * 2) {
        clearInterval(flashInterval);
        if (flashRef.current) {
          flashRef.current.style.background = '#000';
          flashRef.current.style.opacity = '0';
        }
        setFlashPhase('done');
        setShowOverlay(true);
      }
    }, 180);

    return () => clearInterval(flashInterval);
  }, [isActive]);

  if (!isActive) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 60000,
    background: '#000',
    display: showOverlay ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const boxStyle: React.CSSProperties = {
    width: 340,
    border: '3px solid #300',
    background: '#050000',
    boxShadow: '0 0 40px #ff000044, inset 0 0 30px #1a000044',
    padding: '30px 24px',
    textAlign: 'center',
    fontFamily: "'VT323', monospace",
  };

  const glyphStyle: React.CSSProperties = {
    fontSize: 72,
    color: '#cc2200',
    textShadow: '0 0 24px #ff0000, 0 0 48px #660000',
    fontFamily: "'Segoe UI Historic', 'Noto Sans Egyptian Hieroglyphs', 'Apple Symbols', serif",
    display: 'block',
    lineHeight: 1.1,
  };

  return (
    <>
      {/* Flash overlay */}
      <div
        ref={flashRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9000,
          background: '#000',
          opacity: 0,
          pointerEvents: 'none',
          transition: 'none',
        }}
      />

      {/* Main hieroglyph screen */}
      <div id="hieroScreen" style={overlayStyle}>
        <div className="hiero-box" style={boxStyle}>
          {/* Two columns of glyphs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 20 }}>
            <span
              className="h-glyph"
              style={{
                ...glyphStyle,
                animation: 'glyph-spin-a 1.6s steps(1) infinite',
              }}
            >
              𓆣
            </span>
            <span
              className="h-glyph"
              style={{
                ...glyphStyle,
                animation: 'glyph-spin-b 1.1s steps(1) infinite',
              }}
            >
              𓆙
            </span>
          </div>

          <div style={{
            color: '#ff2200',
            fontSize: 22,
            letterSpacing: 3,
            fontFamily: "'VT323', monospace",
            marginBottom: 12,
          }}>
            !! EM CONTAINMENT FAILURE !!
          </div>

          <div style={{
            color: '#aa1500',
            fontSize: 14,
            fontFamily: "'VT323', monospace",
            letterSpacing: 2,
            marginBottom: 24,
          }}>
            INPUT SEQUENCE WAS NOT EXECUTED IN TIME
          </div>

          <button
            onClick={onReset}
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: 16,
              padding: '8px 16px',
              background: '#0a0000',
              border: '1px solid #500',
              color: '#ff4422',
              cursor: 'pointer',
              letterSpacing: 2,
            }}
          >
            [ EMERGENCY RESET — PROTOCOL 23B ]
          </button>
        </div>
      </div>
    </>
  );
};

export default SystemFailure;
