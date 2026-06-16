import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { COUNTDOWN_MINUTES, COUNTDOWN_SECONDS, DHARMA_NUMBERS } from '@/lib/constants';
import { playSound } from '@/lib/audio';

type Hieroglyph = {
  name: string;
  symbol: string;
  type: 'red' | 'black';
};

interface CountdownProps {
  onCountdownFinish: () => void;
  isReset: boolean;
  setIsReset: (value: boolean) => void;
}

const HIEROGLYPHS: Hieroglyph[] = [
  { name: 'folded cloth',      symbol: '𓋴', type: 'red'   },
  { name: 'twisted flax wick', symbol: '𓏲', type: 'red'   },
  { name: 'fire drill',        symbol: '𓍒', type: 'red'   },
  { name: 'Egyptian vulture',  symbol: '𓄿', type: 'black' },
  { name: 'stroke',            symbol: '𓏱', type: 'black' },
];

// Characters that cycle through during the split-flap spinning phase
const SPIN_CHARS = ['𓋴', '𓏲', '𓍒', '𓄿', '𓏱', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '█', '#', '?'];

const ALARM_WARNING  = 240;
const ALARM_INTENSE  = 60;
const ALARM_CRITICAL = 10;

// Stage 3 = fast alarm (10s down to 0). No stage 4 — post-zero tracked separately.
type AlarmStage = 0 | 1 | 2 | 3;

function stageFor(remaining: number): AlarmStage {
  if (remaining <= ALARM_CRITICAL) return 3;
  if (remaining <= ALARM_INTENSE)  return 2;
  if (remaining <= ALARM_WARNING)  return 1;
  return 0;
}

function calcRemaining(): number {
  const startTime = localStorage.getItem('countdown_start');
  if (!startTime) {
    localStorage.setItem('countdown_start', Date.now().toString());
    return COUNTDOWN_MINUTES * 60 + COUNTDOWN_SECONDS;
  }
  const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
  return Math.max(0, (COUNTDOWN_MINUTES * 60 + COUNTDOWN_SECONDS) - elapsed);
}

const Countdown: React.FC<CountdownProps> = ({ onCountdownFinish, isReset, setIsReset }) => {
  const [timeRemaining, setTimeRemaining] = useState(calcRemaining);
  const [alarmStage, setAlarmStage] = useState<AlarmStage>(() => stageFor(calcRemaining()));
  const [isDevMode, setIsDevMode] = useState(false);
  const [devTimeInput, setDevTimeInput] = useState('');
  const devModeKeySequence = useRef<number[]>([]);
  const failureTriggered = useRef(false);

  // Post-zero phase: 10 seconds after timer hits 0, hieroglyphs lock in one by one
  const [isPostZero, setIsPostZero] = useState(false);
  const [postZeroElapsed, setPostZeroElapsed] = useState(0);
  const [spinFrame, setSpinFrame] = useState(0);
  const postZeroStarted = useRef(false);
  const postZeroIntervalRef = useRef<ReturnType<typeof setInterval>>();

  // During post-zero: one hieroglyph slot locks every 2 seconds (0 locked at t=0, 5 locked at t=10)
  const hieroglyphsLocked = isPostZero ? Math.min(5, Math.floor(postZeroElapsed / 2)) : 0;

  // Reset handler
  useEffect(() => {
    if (!isReset) return;
    clearInterval(postZeroIntervalRef.current);
    localStorage.setItem('countdown_start', Date.now().toString());
    localStorage.removeItem('dharma_alarm_active');
    setTimeRemaining(COUNTDOWN_MINUTES * 60 + COUNTDOWN_SECONDS);
    setAlarmStage(0);
    setIsPostZero(false);
    setPostZeroElapsed(0);
    setSpinFrame(0);
    postZeroStarted.current = false;
    failureTriggered.current = false;
    setIsReset(false);
    playSound('success');
  }, [isReset, setIsReset]);

  // Post-zero: keep alarm_active set so numbers still work, count seconds until all glyphs lock
  useEffect(() => {
    if (!isPostZero) return;
    localStorage.setItem('dharma_alarm_active', 'true');

    postZeroIntervalRef.current = setInterval(() => {
      setPostZeroElapsed(prev => {
        const next = prev + 1;
        if (next >= 10 && !failureTriggered.current) {
          clearInterval(postZeroIntervalRef.current);
          failureTriggered.current = true;
          setTimeout(() => onCountdownFinish(), 0);
        }
        return Math.min(next, 10);
      });
    }, 1000);

    return () => clearInterval(postZeroIntervalRef.current);
  }, [isPostZero, onCountdownFinish]);

  // Spin animation: rapid frame counter while post-zero is active
  useEffect(() => {
    if (!isPostZero) return;
    const id = setInterval(() => setSpinFrame(f => f + 1), 80);
    return () => clearInterval(id);
  }, [isPostZero]);

  // Side effects on alarm stage change
  useEffect(() => {
    if (alarmStage >= 1) {
      localStorage.setItem('dharma_alarm_active', 'true');
    } else {
      localStorage.removeItem('dharma_alarm_active');
      failureTriggered.current = false;
    }
    if (alarmStage === 1) playSound('alarm');
    if (alarmStage === 2) playSound('beep', 'warning');
    if (alarmStage === 3) playSound('alarm');
  }, [alarmStage]);

  // Dev mode via localStorage polling + keyboard shortcut
  useEffect(() => {
    const checkDevMode = () => {
      try {
        const active = localStorage.getItem('dharma_devmode_active') === 'true';
        if (active !== isDevMode) {
          setIsDevMode(active);
          if (active) playSound('success');
        }
        const wasSet = localStorage.getItem('countdown_was_set') === 'true';
        if (wasSet) {
          localStorage.removeItem('countdown_was_set');
          const r = calcRemaining();
          setTimeRemaining(r);
          setAlarmStage(s => Math.max(s, stageFor(r)) as AlarmStage);
        }
      } catch { /* ignore */ }
    };
    checkDevMode();
    const id = setInterval(checkDevMode, 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      const n = parseInt(e.key);
      if (!isNaN(n) && e.ctrlKey && e.altKey) {
        devModeKeySequence.current.push(n);
        if (devModeKeySequence.current.length > 6) devModeKeySequence.current.shift();
        if (devModeKeySequence.current.length === 6) {
          const match = devModeKeySequence.current.every((v, i) => v === DHARMA_NUMBERS[i]);
          if (match) {
            const next = !isDevMode;
            setIsDevMode(next);
            try {
              if (next) localStorage.setItem('dharma_devmode_active', 'true');
              else localStorage.removeItem('dharma_devmode_active');
            } catch { /* ignore */ }
            playSound('success');
            devModeKeySequence.current = [];
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { clearInterval(id); window.removeEventListener('keydown', handleKeyDown); };
  }, [isDevMode]);

  // Main countdown tick
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDevMode) return;
      const remaining = calcRemaining();

      // When countdown hits zero, start the post-zero phase instead of calling onCountdownFinish
      if (remaining <= 0 && !postZeroStarted.current) {
        postZeroStarted.current = true;
        setTimeRemaining(0);
        setAlarmStage(3); // keep fast alarm during post-zero
        setIsPostZero(true);
        return;
      }

      if (remaining > 0) {
        setTimeRemaining(remaining);
        setAlarmStage(prev => {
          const next = stageFor(remaining);
          return (next > prev ? next : prev) as AlarmStage;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isDevMode]);

  const handleDevTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const secs = parseInt(devTimeInput);
    if (!isNaN(secs) && secs >= 0) {
      // Reset post-zero state so triggering 0s always re-enters the post-zero phase
      clearInterval(postZeroIntervalRef.current);
      postZeroStarted.current = false;
      setIsPostZero(false);
      setPostZeroElapsed(0);
      setSpinFrame(0);
      failureTriggered.current = false;

      const calculatedStart = Date.now() - ((COUNTDOWN_MINUTES * 60 + COUNTDOWN_SECONDS) - secs) * 1000;
      localStorage.setItem('countdown_start', calculatedStart.toString());
      setTimeRemaining(secs);
      setDevTimeInput('');
      playSound('beep');
    }
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const displaySeconds = isPostZero || minutes < 4;
  const displayMinutes = isPostZero ? 0 : Math.min(minutes, 108);
  const digitStr = isPostZero
    ? '00000'
    : displayMinutes.toString().padStart(3, '0') + (displaySeconds ? seconds.toString().padStart(2, '0') : '00');
  const digits = Array.from(digitStr);

  const pulseDuration = alarmStage >= 2 ? 0.6 : 1.8;

  return (
    <div className="font-terminal text-[hsl(var(--dharma-green))]">
      <div className="relative bg-[#1a1a1a] p-2 border-2 border-[hsla(var(--dharma-green),0.3)] shadow-inner">
        <div className="flex">
          {digits.map((digit, i) => {
            const isLocked = isPostZero && i < hieroglyphsLocked;
            const isSpinning = isPostZero && !isLocked;
            const hieroglyph = HIEROGLYPHS[i];
            const isSecondSlot = i > 2;
            const isWarning = alarmStage >= 1;

            // Each slot spins at a different offset so they look independent
            const spinChar = isSpinning
              ? SPIN_CHARS[(spinFrame + i * 3) % SPIN_CHARS.length]
              : digit;

            return (
              <motion.div
                // Key change triggers flip-in animation when slot locks to a hieroglyph
                key={`slot-${i}-${isLocked ? 'glyph' : isSpinning ? 'spin' : 'digit'}`}
                className={`relative w-10 h-14 flex items-center justify-center overflow-hidden border-r border-[#1a1a1a]
                  ${isLocked
                    ? (hieroglyph.type === 'red' ? 'bg-[hsl(var(--dharma-red))]' : 'bg-black')
                    : (isSecondSlot ? 'bg-[#e6e6e6]' : 'bg-black')
                  }
                  ${i === 2 ? 'mr-[2px] border-r-2 border-r-[#333]' : ''}`}
                initial={isLocked ? { scaleY: 0, opacity: 0 } : false}
                animate={
                  isLocked
                    ? { scaleY: 1, opacity: 1 }
                    : isWarning
                      ? {
                          backgroundColor: isSecondSlot
                            ? ['#e6e6e6', '#ffcccc', '#e6e6e6']
                            : ['#1a1a1a', '#2a1515', '#1a1a1a'],
                          boxShadow: [
                            'inset 0 0 8px rgba(0,0,0,0.8)',
                            'inset 0 0 8px rgba(255,0,0,0.3)',
                            'inset 0 0 8px rgba(0,0,0,0.8)',
                          ],
                        }
                      : {}
                }
                transition={
                  isLocked
                    ? { duration: 0.35, ease: 'easeOut' }
                    : { repeat: Infinity, duration: pulseDuration }
                }
              >
                {isLocked ? (
                  <span className={`font-mono text-3xl font-bold
                    ${hieroglyph.type === 'red' ? 'text-black' : 'text-[hsl(var(--dharma-red))]'}`}>
                    {hieroglyph.symbol}
                  </span>
                ) : (
                  <span className={`font-mono text-2xl font-bold ${
                    isSecondSlot
                      ? 'text-black'
                      : (isWarning ? 'text-[hsl(var(--dharma-red))]' : 'text-white')
                  }`}>
                    {spinChar}
                  </span>
                )}
                <div className="absolute inset-x-0 top-[45%] h-[1px] bg-[#111] opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-20" />
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-black via-[#333] to-black opacity-70" />
              </motion.div>
            );
          })}
        </div>

        {/* Dev mode panel */}
        {isDevMode && (
          <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-black border border-[hsl(var(--dharma-amber))] z-50">
            <div className="text-center text-xs mb-2 text-[hsl(var(--dharma-amber))]">
              <span className="animate-pulse">● </span>
              DEVELOPER MODE ACTIVE
              <span className="animate-pulse"> ●</span>
            </div>
            <form onSubmit={handleDevTimeSubmit} className="flex items-center space-x-2">
              <input
                type="number"
                value={devTimeInput}
                onChange={(e) => setDevTimeInput(e.target.value)}
                placeholder="Seconds remaining"
                min="0"
                className="flex-1 bg-black border border-[hsl(var(--dharma-green))] text-[hsl(var(--dharma-green))] px-2 py-1 text-xs"
              />
              <button
                type="submit"
                className="bg-[hsla(var(--dharma-green),0.2)] text-[hsl(var(--dharma-green))] border border-[hsl(var(--dharma-green))] px-2 py-1 text-xs"
              >
                SET
              </button>
              <div
                className="text-[hsl(var(--dharma-amber))] cursor-pointer border border-[hsl(var(--dharma-amber))] px-2 py-1 text-xs"
                onClick={() => {
                  setIsDevMode(false);
                  playSound('beep');
                  try { localStorage.removeItem('dharma_devmode_active'); } catch { /* ignore */ }
                }}
              >
                ×
              </div>
            </form>
            <div className="mt-2 text-[hsl(var(--dharma-green))] text-xs">
              <div className="flex justify-between">
                {[['10s', '10'], ['30s', '30'], ['60s', '60']].map(([label, val]) => (
                  <button
                    key={label}
                    className="border border-[hsl(var(--dharma-green))] px-1 hover:bg-[hsla(var(--dharma-green),0.1)]"
                    onMouseDown={() => setDevTimeInput(val)}
                    onClick={() => handleDevTimeSubmit({ preventDefault: () => {} } as React.FormEvent)}
                  >
                    {label}
                  </button>
                ))}
                <button
                  className="border border-[hsl(var(--dharma-amber))] px-1 hover:bg-[hsla(var(--dharma-amber),0.1)] text-[hsl(var(--dharma-amber))]"
                  onMouseDown={() => setDevTimeInput('0')}
                  onClick={() => handleDevTimeSubmit({ preventDefault: () => {} } as React.FormEvent)}
                >
                  0s (POST-ZERO)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Countdown;
