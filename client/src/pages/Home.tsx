import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import dharmaLogoSvg from '@/assets/dharma-logo-fixed.svg';
import Loading from '@/components/Loading';
import Terminal from '@/components/Terminal';
import Countdown from '@/components/Countdown';
import HiddenPuzzle from '@/components/HiddenPuzzle';
import SystemFailure from '@/components/SystemFailure';
import PearlStationLog from '@/components/PearlStationLog';
import IncidentReports from '@/components/IncidentReports';
import SubnetInterface from '@/components/SubnetInterface';
import PuzzleController, { PuzzleControllerRef } from '@/components/PuzzleController';
import PuzzleLauncher from '@/components/PuzzleLauncher';
import { playSound, stopSound } from '@/lib/audio';
import { useLore } from '@/contexts/LoreContext';

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPuzzleVisible, setIsPuzzleVisible] = useState(false);
  const [isCountdownReset, setIsCountdownReset] = useState(false);

  // Puzzle launcher state
  const [isPuzzleMenuVisible, setIsPuzzleMenuVisible] = useState(false);
  const [activePuzzleId, setActivePuzzleId] = useState<string | null>(null);
  const puzzleControllerRef = useRef<PuzzleControllerRef>(null);

  // System failure states
  const [isSystemFailure, setIsSystemFailure] = useState(false);
  const [showPearlLog, setShowPearlLog] = useState(false);
  const [failureTimestamp, setFailureTimestamp] = useState('');
  const [showFailsafeContent, setShowFailsafeContent] = useState(false);

  // Incident archive state
  const [isIncidentOpen, setIsIncidentOpen] = useState(false);

  // Subnet interface state
  const [isSubnetOpen, setIsSubnetOpen] = useState(false);

  // Get all state and actions from the LoreContext
  const {
    discoveredStations,
    systemStatus,
    revealStation,
    unlockAudioLog,
    unlockReport,
    recordTerminalCommand,
    triggerLoreEvent,
    triggerSystemStatus
  } = useLore();

  useEffect(() => {
    return () => {
      stopSound('static');
    };
  }, []);

  // Check for puzzle launch flags in localStorage
  useEffect(() => {
    if (isLoading) return;

    try {
      const launchPuzzleMenu = localStorage.getItem('dharma_launch_puzzle_menu');
      if (launchPuzzleMenu === 'true') {
        localStorage.removeItem('dharma_launch_puzzle_menu');
        setIsPuzzleMenuVisible(true);
        triggerSystemStatus('DIAGNOSTIC INTERFACE ACTIVE', 3000);
      }

      const puzzleToLaunch = localStorage.getItem('dharma_launch_puzzle');
      if (puzzleToLaunch) {
        localStorage.removeItem('dharma_launch_puzzle');
        localStorage.setItem('dharma_active_puzzle', puzzleToLaunch);
        setActivePuzzleId(puzzleToLaunch);

        if (puzzleControllerRef.current && typeof puzzleControllerRef.current.launchPuzzle === 'function') {
          setTimeout(() => {
            if (puzzleControllerRef.current) {
              puzzleControllerRef.current.launchPuzzle(puzzleToLaunch);
            }
          }, 100);
        }

        triggerSystemStatus(`LAUNCHING ${puzzleToLaunch.toUpperCase()} INTERFACE`, 3000);
      }
    } catch (e) {
      console.error('Error launching puzzle:', e);
    }
  }, [isLoading, triggerSystemStatus]);

  // Poll for overlay open flags set by terminal commands
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      try {
        const incidentFlag = localStorage.getItem('dharma_incident_archive');
        if (incidentFlag === 'true') {
          localStorage.removeItem('dharma_incident_archive');
          setIsIncidentOpen(true);
        }
        const subnetFlag = localStorage.getItem('dharma_subnet_access');
        if (subnetFlag === 'true') {
          localStorage.removeItem('dharma_subnet_access');
          setIsSubnetOpen(true);
        }
      } catch (e) {}
    }, 500);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleLoadComplete = () => {
    setIsLoading(false);
    stopSound('static');
  };

  const handleRevealPuzzle = () => {
    playSound('success');
    setIsPuzzleVisible(true);
  };

  const handleRevealStation = (stationName: string) => {
    revealStation(stationName);
    triggerLoreEvent('visit_station', stationName);
  };

  const handleTerminalCommand = (command: string) => {
    recordTerminalCommand(command);
  };

  const handleCorrectSequence = () => {
    setIsCountdownReset(true);
    setIsSystemFailure(false);
    setShowPearlLog(false);
    triggerLoreEvent('correct_sequence_entered');
  };

  const handleCountdownFinish = () => {
    playSound('alarm');
    triggerSystemStatus('PROTOCOL REQUIRED', 0);

    const timestamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
    setFailureTimestamp(timestamp);
    setIsSystemFailure(true);

    setTimeout(() => {
      setShowPearlLog(true);
    }, 5000);
  };

  const handleSystemReset = () => {
    setIsSystemFailure(false);
    setShowPearlLog(false);
    setIsCountdownReset(true);
    triggerSystemStatus('SYSTEM REBOOTING', 3000);
  };

  const handleFailsafeTrigger = () => {
    setIsSystemFailure(false);
    setShowPearlLog(false);
    setShowFailsafeContent(true);

    unlockReport(3);
    unlockAudioLog('blackRockLog');
    triggerLoreEvent('failsafe_triggered');
    triggerSystemStatus('ELECTROMAGNETIC DISCHARGE INITIATED', 5000);
  };

  const handlePuzzleComplete = () => {
    triggerLoreEvent('puzzle_complete');
    setIsPuzzleVisible(false);
  };

  const handleLaunchPuzzle = (puzzleId: string) => {
    setActivePuzzleId(puzzleId);
    triggerSystemStatus(`LAUNCHING ${puzzleId.toUpperCase()} INTERFACE`, 3000);
    playSound('click');
  };

  useEffect(() => {
    if (!activePuzzleId) return;
    try {
      localStorage.setItem('dharma_active_puzzle', activePuzzleId);
      setActivePuzzleId(null);
    } catch (e) {}
  }, [activePuzzleId]);

  if (isLoading) {
    return <Loading onLoadComplete={handleLoadComplete} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 crt pointer-events-none z-50"></div>

      <header className="pt-6 pb-2 px-6 flex justify-between items-center border-b border-[hsla(var(--dharma-gray),0.3)]">
        <div className="flex items-center">
          <img src={dharmaLogoSvg} alt="DHARMA Initiative" className="w-12 h-12 mr-4" />
          <div>
            <h1 className="font-terminal text-[hsl(var(--dharma-green))] text-2xl tracking-wider">THE SWAN</h1>
            <p className="text-xs" style={{ color: 'var(--ph-mid)' }}>STATION 3 · SECURITY LEVEL: 4</p>
          </div>
        </div>
        <Countdown
          onCountdownFinish={handleCountdownFinish}
          isReset={isCountdownReset}
          setIsReset={setIsCountdownReset}
        />
      </header>

      <main className="container mx-auto p-4">
        <Terminal
          onRevealPuzzle={handleRevealPuzzle}
          onRevealStation={handleRevealStation}
          onCorrectSequence={handleCorrectSequence}
          onCommand={handleTerminalCommand}
          isSystemFailure={isSystemFailure}
        />
      </main>

      <footer className="mt-6 p-4 border-t border-[hsla(var(--dharma-gray),0.3)] text-xs" style={{ color: 'var(--ph-mid)' }}>
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center relative">
          <div>DHARMA INITIATIVE · STATION 3: THE SWAN · ESTABLISHED 1977</div>
          <div
            className={`font-terminal ${systemStatus === 'PROTOCOL EXECUTION REQUIRED' ? 'text-[hsl(var(--dharma-red))] animate-terminal-blink' : 'text-[hsl(var(--dharma-green))]'}`}
          >
            {systemStatus}
          </div>
          <div>SECURITY CLEARANCE LEVEL 4 · USER ID: [REDACTED]</div>

          <FooterEasterEgg onUnlockLog={() => unlockAudioLog('unknownSource')} />
        </div>
      </footer>

      <HiddenPuzzle
        isVisible={isPuzzleVisible}
        onClose={() => setIsPuzzleVisible(false)}
        onComplete={handlePuzzleComplete}
      />

      <SystemFailure
        isActive={isSystemFailure}
        onResetSequence={handleSystemReset}
        onFailsafeTrigger={handleFailsafeTrigger}
      />

      {/* Pearl Station Log — paper printout triggered on countdown failure */}
      <PearlStationLog
        isVisible={showPearlLog}
        timestamp={failureTimestamp}
        onClose={() => setShowPearlLog(false)}
      />

      {/* Incident Archive — opened via terminal "INCIDENT ARCHIVE" command */}
      <IncidentReports
        isVisible={isIncidentOpen}
        onClose={() => setIsIncidentOpen(false)}
      />

      {/* Subnet Interface — opened via terminal "SUBNET" command (L3+) */}
      <SubnetInterface
        isVisible={isSubnetOpen}
        onClose={() => setIsSubnetOpen(false)}
        onComplete={() => {
          try { localStorage.setItem('dharma_subnet_complete', 'true'); } catch {}
        }}
      />

      <PuzzleController
        ref={puzzleControllerRef}
        onRevealStation={handleRevealStation}
        onUnlockReport={unlockReport}
        onUnlockAudioLog={unlockAudioLog}
      />

      <PuzzleLauncher
        isVisible={isPuzzleMenuVisible}
        onClose={() => setIsPuzzleMenuVisible(false)}
        onLaunchPuzzle={handleLaunchPuzzle}
        unlockedPuzzles={(() => {
          const puzzles: string[] = [];
          if (discoveredStations.includes('arrow')) {
            puzzles.push('subnet');
          }
          return puzzles;
        })()}
      />

      {showFailsafeContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="max-w-2xl p-8 text-center text-white"
          >
            <h2 className="text-3xl font-terminal text-[hsl(var(--dharma-green))] mb-6">FAILSAFE PROTOCOL EXECUTED</h2>
            <p className="mb-4">The electromagnetic energy has been discharged.</p>
            <p className="mb-8">New information has been unlocked in your databank.</p>
            <button
              onClick={() => setShowFailsafeContent(false)}
              className="px-6 py-2 bg-[hsla(var(--dharma-green),0.2)] border border-[hsl(var(--dharma-green))] text-[hsl(var(--dharma-green))]"
            >
              CONTINUE
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

interface FooterEasterEggProps {
  onUnlockLog: () => void;
}

const FooterEasterEgg: React.FC<FooterEasterEggProps> = ({ onUnlockLog }) => {
  const [clicks, setClicks] = useState(0);
  const { triggerSystemStatus } = useLore();

  useEffect(() => {
    if (clicks > 0) {
      const timeout = setTimeout(() => {
        setClicks(0);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [clicks]);

  useEffect(() => {
    if (clicks === 6) {
      onUnlockLog();
      triggerSystemStatus('UNKNOWN TRANSMISSION DETECTED', 3000);
    }
  }, [clicks, onUnlockLog, triggerSystemStatus]);

  const handleClick = () => {
    playSound('beep', 'short');
    setClicks(prev => Math.min(prev + 1, 6));
  };

  return (
    <div
      className="absolute bottom-0 right-0 opacity-10 hover:opacity-30 cursor-pointer transition-opacity"
      onClick={handleClick}
    >
      <div className="w-10 h-10 flex items-center justify-center text-[hsl(var(--dharma-green))]">
        ⓘ
      </div>
    </div>
  );
};

export default Home;
