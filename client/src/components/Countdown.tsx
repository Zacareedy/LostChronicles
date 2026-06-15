import React, { useState, useEffect } from 'react';

interface CountdownProps {
  onCountdownFinish: () => void;
  isReset: boolean;
  setIsReset: (v: boolean) => void;
}

const TOTAL_SECONDS = 6480; // 108 minutes

const Countdown: React.FC<CountdownProps> = ({ onCountdownFinish, isReset, setIsReset }) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    const startTime = localStorage.getItem('countdown_start');
    if (!startTime) {
      const now = Date.now();
      localStorage.setItem('countdown_start', now.toString());
      return TOTAL_SECONDS;
    }
    const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
    return Math.max(0, TOTAL_SECONDS - elapsed);
  });

  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (isReset) {
      const now = Date.now();
      localStorage.setItem('countdown_start', now.toString());
      setTimeRemaining(TOTAL_SECONDS);
      setFinished(false);
      setIsReset(false);
    }
  }, [isReset, setIsReset]);

  useEffect(() => {
    const interval = setInterval(() => {
      const startTime = localStorage.getItem('countdown_start');
      if (!startTime) return;
      const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
      const remaining = Math.max(0, TOTAL_SECONDS - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0 && !finished) {
        setFinished(true);
        onCountdownFinish();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onCountdownFinish, finished]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const isCritical = timeRemaining <= 60;
  const isWarning = timeRemaining <= 300 && timeRemaining > 60;

  const digitColor = isCritical ? '#ff1a00' : isWarning ? '#25b84a' : '#4dff7c';

  const minStr = minutes.toString().padStart(3, '0');
  const secStr = seconds.toString().padStart(2, '0');
  const digits = minStr.split('').concat([':']).concat(secStr.split(''));

  const outerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 16,
    right: 16,
    zIndex: 1000,
    background: '#000',
    border: '2px solid #111',
    boxShadow: '0 0 0 3px #050505, inset 0 0 30px #000',
    padding: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 0,
  };

  const digitCellStyle: React.CSSProperties = {
    width: 38,
    height: 62,
    background: '#020200',
    border: '1px solid #0d0d00',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'VT323', monospace",
    fontSize: 54,
    color: digitColor,
    position: 'relative',
    animation: isCritical ? 'digit-flash 0.4s step-end infinite' : 'none',
  };

  const colonStyle: React.CSSProperties = {
    width: 20,
    height: 62,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'VT323', monospace",
    fontSize: 46,
    color: digitColor,
    animation: 'blink 1s step-end infinite',
  };

  return (
    <div id="cdWidget" style={outerStyle}>
      {minStr.split('').map((d, i) => (
        <div key={`m${i}`} style={digitCellStyle}>
          {d}
          <div style={{
            position: 'absolute',
            top: '45%',
            left: 0,
            right: 0,
            height: 1,
            background: 'rgba(0,0,0,0.55)',
          }} />
        </div>
      ))}
      <div style={colonStyle}>:</div>
      {secStr.split('').map((d, i) => (
        <div key={`s${i}`} style={digitCellStyle}>
          {d}
          <div style={{
            position: 'absolute',
            top: '45%',
            left: 0,
            right: 0,
            height: 1,
            background: 'rgba(0,0,0,0.55)',
          }} />
        </div>
      ))}
    </div>
  );
};

export default Countdown;
