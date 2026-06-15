import React, { useState, useEffect, useCallback, useRef } from 'react';
import Loading from '@/components/Loading';
import Terminal from '@/components/Terminal';
import Countdown from '@/components/Countdown';
import SystemFailure from '@/components/SystemFailure';
import ActivityLog from '@/components/ActivityLog';
import NumberInput from '@/components/NumberInput';
import SecretBanner from '@/components/SecretBanner';
import HiddenEye from '@/components/HiddenEye';
import SubnetInterface from '@/components/SubnetInterface';
import IncidentReports from '@/components/IncidentReports';
import PearlStationLog from '@/components/PearlStationLog';
import dharmaLogoSvg from '@/assets/dharma-logo-fixed.svg';

// Extend Window for cl5 flag
declare global {
  interface Window {
    cl5: boolean;
  }
}

interface LogEntry {
  text: string;
  cls: 'normal' | 'hi' | 'am' | 'er';
  time: string;
}

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
];

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isSubnetOpen, setIsSubnetOpen] = useState(false);
  const [isIncidentOpen, setIsIncidentOpen] = useState(false);
  const [isPearlLogVisible, setIsPearlLogVisible] = useState(false);
  const [failureTimestamp, setFailureTimestamp] = useState('');
  const [cl5Unlocked, setCl5Unlocked] = useState(false);
  const [isCountdownReset, setIsCountdownReset] = useState(false);
  const [isSystemFailure, setIsSystemFailure] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [morseClicks, setMorseClicks] = useState(0);
  const [cipherClicks, setCipherClicks] = useState(0);
  const [morseDecoded, setMorseDecoded] = useState(false);
  const [cipherDecoded, setCipherDecoded] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [execCount, setExecCount] = useState(0);
  const [konamiIdx, setKonamiIdx] = useState(0);
  const [lastActTime, setLastActTime] = useState(Date.now());

  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inactivityRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inactWarnedRef = useRef<{ mid: boolean; high: boolean }>({ mid: false, high: false });

  // ---- helpers ----

  const addLog = useCallback((msg: string, cls: 'normal' | 'hi' | 'am' | 'er' = 'normal') => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 8);
    setLogEntries(prev => [...prev, { text: msg, cls, time }]);
  }, []);

  const showBanner = useCallback((msg: string) => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    setBannerMessage(msg);
    bannerTimerRef.current = setTimeout(() => setBannerMessage(null), 7000);
  }, []);

  const updateActivity = useCallback(() => {
    setLastActTime(Date.now());
  }, []);

  // ---- initial log entries ----
  useEffect(() => {
    if (!isLoading) {
      addLog('INTRANET NODE SWN-7 — ONLINE', 'hi');
      addLog('DHARMA INITIATIVE — SWAN STATION — CYCLE 10894', 'normal');
      addLog('PROTOCOL 23 — SEQUENCE INPUT REQUIRED', 'am');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // ---- inactivity monitor ----
  useEffect(() => {
    if (isLoading) return;
    inactivityRef.current = setInterval(() => {
      const elapsed = (Date.now() - lastActTime) / 1000;
      if (elapsed >= 120 && elapsed < 125 && !inactWarnedRef.current.mid) {
        inactWarnedRef.current.mid = true;
        const minLeft = Math.ceil((300 - elapsed) / 60);
        addLog(`PRESENCE CHECK: Are you still there? Window closes in ${minLeft} min.`, 'am');
      }
      if (elapsed >= 300 && elapsed < 305 && !inactWarnedRef.current.high) {
        inactWarnedRef.current.high = true;
        addLog('!! OPERATOR ABSENCE — ATTEND TO INPUT TERMINAL IMMEDIATELY !!', 'er');
      }
    }, 5000);
    return () => {
      if (inactivityRef.current) clearInterval(inactivityRef.current);
    };
  }, [isLoading, lastActTime, addLog]);

  // Reset inactivity warn flags when activity happens
  useEffect(() => {
    inactWarnedRef.current = { mid: false, high: false };
  }, [lastActTime]);

  // ---- global activity listeners ----
  useEffect(() => {
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, [updateActivity]);

  // ---- Konami code ----
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const expected = KONAMI[konamiIdx];
      if (e.key === expected) {
        const nextIdx = konamiIdx + 1;
        if (nextIdx === KONAMI.length) {
          // Konami complete!
          window.cl5 = true;
          setCl5Unlocked(true);
          setKonamiIdx(0);
          addLog('!!! KONAMI SEQUENCE — CLEARANCE LEVEL 5 GRANTED !!!', 'hi');
          showBanner('// ↑↑↓↓←→←→BA — CLEARANCE 5 GRANTED — READ /FILES/VK-108.TXT IN TERMINAL //');
          setIsTerminalOpen(true);
        } else {
          setKonamiIdx(nextIdx);
        }
      } else {
        setKonamiIdx(0);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [konamiIdx, addLog, showBanner]);

  // ---- Morse clicks ----
  useEffect(() => {
    if (morseClicks >= 5 && !morseDecoded) {
      setMorseDecoded(true);
      addLog('MORSE DECODED: "THE NUMBERS ARE REAL". You are paying attention.', 'hi');
      showBanner('// MORSE DECODED — "THE NUMBERS ARE REAL" — V.K. — Check the terminal. //');
    }
  }, [morseClicks, morseDecoded, addLog, showBanner]);

  // ---- Cipher clicks ----
  useEffect(() => {
    if (cipherClicks >= 3 && !cipherDecoded) {
      setCipherDecoded(true);
      addLog('CIPHER DECODED: Message from I.P. — "Maintain silence."', 'am');
    }
  }, [cipherClicks, cipherDecoded, addLog]);

  // ---- Logo clicks ----
  useEffect(() => {
    if (logoClicks === 7) {
      addLog('NOTICE: Multiple manifest accesses. Operator flagged.', 'am');
      showBanner('// Have you checked the bottom-right corner? Something is watching. //');
    }
  }, [logoClicks, addLog, showBanner]);

  // ---- handlers ----

  const handleLoadComplete = () => setIsLoading(false);

  const handleSuccess = (vals: number[]) => {
    setIsCountdownReset(true);
    const newCount = execCount + 1;
    setExecCount(newCount);
    addLog(`SEQUENCE ACCEPTED — PROTOCOL EXECUTED — CYCLE ${10894 + newCount}`, 'hi');
    if (newCount === 3) showBanner('// ACHIEVEMENT UNLOCKED: THE CANDIDATE — 3 SEQUENCES EXECUTED //');
    if (newCount === 108) showBanner('// DHARMA COMMENDATION: UNWAVERING DUTY — 108 SEQUENCES COMPLETE //');
    void vals;
  };

  const handleWrong = (_vals: number[], special: string | null) => {
    if (special === 'null_sequence') {
      addLog('NULL SEQUENCE ENTRY: Do not enter zeros. This is not a test.', 'er');
    } else if (special === 'inverted') {
      addLog('ANOMALY: Inverted sequence detected. Cross-reference Incident 10801.', 'am');
    } else {
      addLog('INCORRECT SEQUENCE — SYSTEM INTEGRITY MAINTAINED', 'er');
    }
  };

  const handleCountdownFinish = () => {
    addLog('!! CONTAINMENT FAILURE — SEQUENCE NOT EXECUTED — EM DISCHARGE DETECTED !!', 'er');
    const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 15);
    setFailureTimestamp(ts);
    setTimeout(() => {
      setIsSystemFailure(true);
      setIsPearlLogVisible(true);
    }, 800);
  };

  const handleSystemReset = () => {
    setIsSystemFailure(false);
    setIsPearlLogVisible(false);
    setIsCountdownReset(true);
    addLog('EMERGENCY RESET EXECUTED — PROTOCOL 23B — SYSTEM REBOOTING', 'am');
  };

  const handleSubnetComplete = () => {
    addLog('SUBNET LOGS ARCHIVED — Access code OVERRIDE-D108 extracted.', 'hi');
    showBanner('// SUBNET DATA RECOVERED — Use code OVERRIDE-D108 in INCIDENT ARCHIVE //');
  };

  const handleEyeFound = () => {
    addLog('// You found the Eye. The island is always watching. //', 'am');
    showBanner('// THE EYE HAS SEEN YOU — Type DHARMA in the terminal. //');
  };

  const handleTickerClick = () => {
    addLog('BROADCAST: External communications remain blocked. No exceptions. §7-B.', 'normal');
  };

  const handleCycleTagClick = () => {
    addLog('CYCLE 10894: If you read this, the previous operator did not complete their rotation.', 'am');
  };

  if (isLoading) {
    return <Loading onLoadComplete={handleLoadComplete} />;
  }

  // ---- layout styles ----
  const wrapStyle: React.CSSProperties = {
    maxWidth: 1020,
    margin: '0 auto',
    padding: '0 16px',
  };

  const hdrStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 0 10px',
    borderBottom: '1px solid var(--bd)',
    marginBottom: 8,
  };

  const tickerStyle: React.CSSProperties = {
    fontFamily: "'VT323', monospace",
    fontSize: 12,
    letterSpacing: 3,
    color: 'var(--ph-dim)',
    padding: '5px 10px',
    borderBottom: '1px solid var(--bd)',
    cursor: 'pointer',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  };

  const stripStyle = (decoded: boolean): React.CSSProperties => ({
    fontFamily: "'VT323', monospace",
    fontSize: 11,
    letterSpacing: 2,
    color: decoded ? 'var(--am)' : 'var(--ph-faint)',
    padding: '4px 10px',
    borderBottom: '1px solid var(--bd)',
    cursor: 'pointer',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  });

  const bodyGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: 16,
    marginTop: 12,
  };

  const panelTitleStyle: React.CSSProperties = {
    fontFamily: "'VT323', monospace",
    fontSize: 9,
    letterSpacing: 5,
    textTransform: 'uppercase',
    color: 'var(--ph-dim)',
    marginBottom: 12,
  };

  const sidePanelStyle: React.CSSProperties = {
    border: '1px solid var(--bd)',
    background: 'var(--panel2)',
    padding: '13px 15px',
    marginBottom: 12,
    fontFamily: "'VT323', monospace",
    fontSize: 13,
    color: 'var(--ph-dim)',
  };

  const openTermBtnStyle: React.CSSProperties = {
    width: '100%',
    fontFamily: "'VT323', monospace",
    fontSize: 16,
    letterSpacing: 3,
    padding: '10px 0',
    border: '1px solid var(--bd2)',
    background: 'var(--ph-faint)',
    color: 'var(--ph)',
    cursor: 'pointer',
    textAlign: 'center',
    marginBottom: 12,
  };

  const footerStyle: React.CSSProperties = {
    borderTop: '1px solid var(--bd)',
    padding: '10px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: "'VT323', monospace",
    fontSize: 11,
    letterSpacing: 2,
    color: 'var(--ph-faint)',
    marginTop: 16,
  };

  return (
    <>
      {/* Moving scanline */}
      <div
        className="scanline"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '2px',
          background: 'rgba(77,255,124,0.06)',
          zIndex: 9997,
          animation: 'scan 4s linear infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Countdown widget (fixed top-right) */}
      <Countdown
        onCountdownFinish={handleCountdownFinish}
        isReset={isCountdownReset}
        setIsReset={setIsCountdownReset}
      />

      {/* Secret banner (fixed top) */}
      <SecretBanner message={bannerMessage} onDismiss={() => setBannerMessage(null)} />

      {/* Terminal overlay */}
      <Terminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        onCorrectSequence={() => {
          setIsCountdownReset(true);
          addLog('TERMINAL: Sequence accepted via terminal.', 'hi');
        }}
        cl5Unlocked={cl5Unlocked}
        onOpenSubnet={() => {
          addLog('SUBNET: Establishing connection to PEARL-3 subnet node...', 'am');
          setIsSubnetOpen(true);
        }}
        onOpenIncidentArchive={() => {
          addLog('INCIDENT ARCHIVE: Accessing classified records...', 'am');
          setIsIncidentOpen(true);
        }}
      />

      {/* Subnet interface overlay */}
      <SubnetInterface
        isVisible={isSubnetOpen}
        onClose={() => setIsSubnetOpen(false)}
        onComplete={handleSubnetComplete}
      />

      {/* Incident archive modal */}
      <IncidentReports
        isVisible={isIncidentOpen}
        onClose={() => setIsIncidentOpen(false)}
      />

      {/* Pearl Station printout log */}
      <PearlStationLog
        isVisible={isPearlLogVisible}
        timestamp={failureTimestamp}
        onClose={() => setIsPearlLogVisible(false)}
      />

      {/* Hidden eye (fixed bottom-right) */}
      <HiddenEye onFound={handleEyeFound} />

      {/* System failure overlay */}
      <SystemFailure isActive={isSystemFailure} onReset={handleSystemReset} />

      {/* Main content */}
      <div id="mainContent">
        <div className="wrap" style={wrapStyle}>

          {/* Header */}
          <header className="s-hdr" style={hdrStyle}>
            {/* Left: logo */}
            <div
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
              onClick={() => setLogoClicks(prev => prev + 1)}
            >
              <img
                src={dharmaLogoSvg}
                alt="DHARMA Swan"
                style={{ width: 52, height: 52 }}
              />
            </div>

            {/* Center: station name */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'VT323', monospace",
                fontSize: 26,
                letterSpacing: 6,
                color: 'var(--ph)',
              }}>
                SWAN STATION
              </div>
              <div style={{
                fontFamily: "'VT323', monospace",
                fontSize: 11,
                letterSpacing: 4,
                color: 'var(--ph-dim)',
              }}>
                STATION 3 · INTRANET NODE SWN-7
              </div>
            </div>

            {/* Right: cycle tag */}
            <div
              id="cycleTag"
              onClick={handleCycleTagClick}
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: 13,
                letterSpacing: 3,
                color: 'var(--ph-dim)',
                cursor: 'pointer',
                textAlign: 'right',
                paddingRight: 100, /* leave room for countdown widget */
              }}
            >
              CYCLE: 10894
            </div>
          </header>

          {/* Broadcast ticker */}
          <div
            className="ticker"
            id="ticker"
            style={tickerStyle}
            onClick={handleTickerClick}
          >
            ◈ BROADCAST — DHARMA INITIATIVE INTERNAL ONLY — CYCLE 10894 — EXTERNAL COMMS BLOCKED §7-B — SEQUENCE INPUT PENDING ◈
          </div>

          {/* Morse strip */}
          <div
            className="morse"
            style={stripStyle(morseDecoded)}
            onClick={() => setMorseClicks(prev => prev + 1)}
          >
            {morseDecoded
              ? '// DECODED: "THE NUMBERS ARE REAL" — V. KELVIN — CYCLE 9341 //'
              : '— — —  · · ·  — ·  · · ·  — — —  · — ·  — ·  — — —  · —  · · ·  · — ·  · · — ·  · — ·  · — ·  · · —'}
          </div>

          {/* Cipher bar */}
          <div
            className="cipher"
            style={stripStyle(cipherDecoded)}
            onClick={() => setCipherClicks(prev => prev + 1)}
          >
            {cipherDecoded
              ? 'EXECUTE THE PROTOCOL · MAINTAIN SILENCE · DO NOT LEAVE THE STATION · -I.P.'
              : '[ROT13]: RKRPHGR GUR CEBGBPBY · ZNVAGNVA FVYRAPR · QB ABG YRNIR GUR FGNGVBA · -V.C.'}
          </div>

          {/* Body grid */}
          <div className="body-grid" style={bodyGridStyle}>

            {/* Main column */}
            <div className="col-main">

              {/* Number input panel */}
              <div className="s-panel" style={{
                border: '1px solid var(--bd)',
                background: 'var(--panel)',
                padding: '16px 20px',
                marginBottom: 12,
              }}>
                <div style={panelTitleStyle}>PROTOCOL 23 — SEQUENCE INPUT</div>
                <NumberInput onSuccess={handleSuccess} onWrong={handleWrong} />
              </div>

              {/* Status table */}
              <div className="s-panel" style={{
                border: '1px solid var(--bd)',
                background: 'var(--panel)',
                padding: '16px 20px',
                marginBottom: 12,
                fontFamily: "'VT323', monospace",
                fontSize: 13,
              }}>
                <div style={panelTitleStyle}>SYSTEM STATUS</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {[
                      ['EM CONTAINMENT', 'NORMAL', 'tm'],
                      ['FAILSAFE KEY', 'ARMED', 'tm'],
                      ['INTRANET NODE', 'SWN-7', 'tm'],
                      ['SONAR ARRAY', 'DEGRADED', 'ta'],
                      ['EM ANOMALY', 'DETECTED', 'ta'],
                      ['PROTOCOL', '23', 'tm'],
                      ['EXTERNAL COMMS', 'BLOCKED §7-B', 'tr'],
                      ['QUARANTINE', 'ACTIVE', 'ta'],
                    ].map(([label, val, cls]) => (
                      <tr key={label} style={{ borderBottom: '1px solid var(--bd)' }}>
                        <td style={{ padding: '3px 0', color: 'var(--dim)', width: '55%' }}>{label}</td>
                        <td style={{
                          padding: '3px 0',
                          color: cls === 'tm' ? 'var(--ph-dim)' : cls === 'ta' ? 'var(--am)' : 'var(--red)',
                        }}>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Activity log */}
              <ActivityLog entries={logEntries} />
            </div>

            {/* Side column */}
            <div className="col-side">

              {/* EM Readings */}
              <div className="s-panel-side" style={sidePanelStyle}>
                <div style={panelTitleStyle}>EM READINGS</div>
                <div>EM FIELD: 73% GAUSS</div>
                <div style={{ color: 'var(--am)' }}>SONAR: DEGRADED</div>
                <div style={{ color: 'var(--am)' }}>ANOMALY: DETECTED</div>
                <div>FAILSAFE: ARMED</div>
              </div>

              {/* Personnel roster */}
              <div className="s-panel-side" style={sidePanelStyle}>
                <div style={panelTitleStyle}>PERSONNEL</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2px 8px' }}>
                  <span>WICKMUND, G.</span><span style={{ color: 'var(--am)' }}>CHIEF</span>
                  <span>CANDLE, M.</span><span style={{ color: 'var(--ph-dim)' }}>TECH</span>
                  <span style={{ color: 'var(--dim)' }}>[CLASSIFIED]</span><span style={{ color: 'var(--dim)' }}>OPS-A</span>
                  <span style={{ color: 'var(--dim)' }}>[CLASSIFIED]</span><span style={{ color: 'var(--dim)' }}>OPS-B</span>
                </div>
                <div style={{ marginTop: 8, color: 'var(--ph-faint)', fontSize: 11 }}>RELIEF: 540HRS</div>
              </div>

              {/* Open terminal button */}
              <div style={{ marginBottom: 12 }}>
                <button
                  style={openTermBtnStyle}
                  onClick={() => setIsTerminalOpen(true)}
                >
                  [ OPEN TERMINAL ]
                </button>
              </div>

              {/* Comms status */}
              <div className="s-panel-side" style={sidePanelStyle}>
                <div style={panelTitleStyle}>COMMS</div>
                <div style={{ color: 'var(--red)' }}>COMMS: BLOCKED §7-B</div>
                <div>LAST CONTACT: 10891</div>
                <div style={{ color: 'var(--am)' }}>PEARL FEED: TIMEOUT</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="s-footer" style={footerStyle}>
            <div>DHARMA INITIATIVE · STATION 3: THE SWAN · ESTABLISHED 1977</div>
            <div className="animate-terminal-blink" style={{ color: 'var(--ph-dim)', letterSpacing: 3 }}>
              [ ↑↑↓↓←→←→ ]
            </div>
          </footer>

        </div>
      </div>
    </>
  );
};

export default Home;
