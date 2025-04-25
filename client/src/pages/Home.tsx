import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import Loading from '@/components/Loading';
import Terminal from '@/components/Terminal';
import IslandMap from '@/components/IslandMap';
import LorePanel from '@/components/LorePanel';
import Countdown from '@/components/Countdown';
import HiddenPuzzle from '@/components/HiddenPuzzle';
import SystemFailure from '@/components/SystemFailure';
import PearlStationLog from '@/components/PearlStationLog';
import { STATIONS } from '@/lib/constants';
import { playSound, stopSound } from '@/lib/audio';
import { useLore } from '@/contexts/LoreContext';

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPuzzleVisible, setIsPuzzleVisible] = useState(false);
  const [isCountdownReset, setIsCountdownReset] = useState(false);
  
  // System failure states
  const [isSystemFailure, setIsSystemFailure] = useState(false);
  const [showPearlLog, setShowPearlLog] = useState(false);
  const [failureTimestamp, setFailureTimestamp] = useState('');
  const [showFailsafeContent, setShowFailsafeContent] = useState(false);

  // Get all state and actions from the LoreContext
  const { 
    discoveredStations, 
    unlockedAudioLogs, 
    unlockedReports, 
    systemStatus,
    revealStation,
    unlockAudioLog,
    unlockReport,
    recordTerminalCommand,
    triggerLoreEvent,
    triggerSystemStatus
  } = useLore();

  useEffect(() => {
    // Clean up audio when component unmounts
    return () => {
      stopSound('static');
    };
  }, []);

  const handleLoadComplete = () => {
    setIsLoading(false);
    // Start ambient effects
    stopSound('static');
  };

  const handleRevealPuzzle = () => {
    playSound('success');
    setIsPuzzleVisible(true);
  };

  const handleRevealStation = (stationName: string) => {
    // Use the lore context function
    revealStation(stationName);
    // Trigger an event to signal that a station was visited
    triggerLoreEvent('visit_station', stationName);
  };

  // Event handler for audio log playback
  const handleLogPlay = (logId: string) => {
    if (logId === 'scan') {
      playSound('beep');
      setTimeout(() => {
        playSound('static', 'short');
        triggerSystemStatus('SIGNAL ANALYSIS COMPLETE', 3000);
      }, 1500);
    }
  };

  // Handle terminal commands
  const handleTerminalCommand = (command: string) => {
    // Record command in the lore context
    recordTerminalCommand(command);
  };

  const handleCorrectSequence = () => {
    // Reset countdown when correct sequence is entered
    setIsCountdownReset(true);

    // Trigger lore event for sequence completion
    triggerLoreEvent('correct_sequence_entered');
  };

  const handleCountdownFinish = () => {
    // Trigger system failure state
    playSound('alarm');
    triggerSystemStatus('SYSTEM FAILURE', 0); // 0 means don't auto-reset
    
    // Generate timestamp for failure
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
    setFailureTimestamp(timestamp);
    
    // Activate system failure sequence
    setIsSystemFailure(true);
    
    // If Pearl Station is unlocked, show the logging printout
    if (discoveredStations.includes('pearl')) {
      setTimeout(() => {
        setShowPearlLog(true);
      }, 5000);
    }
  };
  
  // Reset system after correct sequence entry during failure
  const handleSystemReset = () => {
    setIsSystemFailure(false);
    setShowPearlLog(false);
    setIsCountdownReset(true);
    triggerSystemStatus('SYSTEM REBOOTING', 3000);
  };
  
  // Handle failsafe key trigger
  const handleFailsafeTrigger = () => {
    setIsSystemFailure(false);
    setShowPearlLog(false);
    setShowFailsafeContent(true);
    
    // Unlock special content
    unlockReport(3); // Unlock special incident report
    unlockAudioLog('blackRockLog'); // Unlock special audio log
    triggerLoreEvent('failsafe_triggered');
    
    // Trigger special event for failsafe
    triggerSystemStatus('ELECTROMAGNETIC DISCHARGE INITIATED', 5000);
  };

  const handlePuzzleComplete = () => {
    // Trigger lore event for puzzle completion
    triggerLoreEvent('puzzle_complete');

    // Close the puzzle modal
    setIsPuzzleVisible(false);
  };

  if (isLoading) {
    return <Loading onLoadComplete={handleLoadComplete} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* CRT Overlay effects - keeping only the subtle CRT effect, removing scanline */}
      <div className="absolute inset-0 crt pointer-events-none z-50"></div>

      {/* Header with Dharma Logo */}
      <header className="pt-6 pb-2 px-6 flex justify-between items-center border-b border-[hsla(var(--dharma-gray),0.3)]">
        <div className="flex items-center">
          <Logo className="mr-4" />
          <div>
            <h1 className="font-terminal text-[hsl(var(--dharma-amber))] text-2xl tracking-wider">THE SWAN</h1>
            <p className="text-xs text-[hsl(var(--dharma-gray))]">STATION 3 · SECURITY LEVEL: 4</p>
          </div>
        </div>
        <Countdown 
          onCountdownFinish={handleCountdownFinish} 
          isReset={isCountdownReset} 
          setIsReset={setIsCountdownReset} 
        />
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Terminal 
          onRevealPuzzle={handleRevealPuzzle} 
          onRevealStation={handleRevealStation}
          onCorrectSequence={handleCorrectSequence}
          onCommand={handleTerminalCommand}
        />

        <IslandMap 
          discoveredStations={discoveredStations} 
          onStationClick={handleRevealStation} 
        />

        {/* Combined DHARMA Panel (for mobile) */}
        <div className="md:hidden mt-4">
          <LorePanel 
            className="w-full" 
            defaultSection="stations"
          />
        </div>
        
        {/* Individual Panels (for desktop) */}
        <div className="hidden md:block">
          {/* Locations Panel */}
          <LorePanel 
            className="lg:col-span-3 mt-4" 
            defaultSection="stations" 
            showOnly="stations"
          />

          {/* Databank Panel */}
          <LorePanel 
            className="lg:col-span-3 mt-4" 
            defaultSection="files" 
            showOnly="files" 
          />

          {/* Comms Panel */}
          <LorePanel 
            className="lg:col-span-3 mt-4" 
            defaultSection="signals" 
            showOnly="signals"
          />
        </div>
      </main>

      {/* Footer with Station Info */}
      <footer className="mt-6 p-4 border-t border-[hsla(var(--dharma-gray),0.3)] text-[hsl(var(--dharma-gray))] text-xs">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center relative">
          <div>DHARMA INITIATIVE · STATION 3: THE SWAN · ESTABLISHED 1977</div>
          <div 
            className={`font-terminal ${systemStatus === 'PROTOCOL EXECUTION REQUIRED' ? 'text-[hsl(var(--dharma-red))] animate-terminal-blink' : 'text-[hsl(var(--dharma-amber))]'}`}
          >
            {systemStatus}
          </div>
          <div>SECURITY CLEARANCE LEVEL 4 · USER ID: [REDACTED]</div>

          {/* Hidden Dharma Symbol for secret interaction */}
          <FooterEasterEgg onUnlockLog={() => unlockAudioLog('unknownSource')} />
        </div>
      </footer>

      {/* Hidden Puzzle Modal */}
      <HiddenPuzzle 
        isVisible={isPuzzleVisible} 
        onClose={() => setIsPuzzleVisible(false)} 
        onComplete={handlePuzzleComplete}
      />
      
      {/* System Failure Sequence */}
      <SystemFailure 
        isActive={isSystemFailure}
        onResetSequence={handleSystemReset}
        onFailsafeTrigger={handleFailsafeTrigger}
      />
      
      {/* Pearl Station Printout Log */}
      <PearlStationLog 
        isVisible={showPearlLog}
        timestamp={failureTimestamp}
      />
      
      {/* Failsafe Key Result Content - Only shown after triggering failsafe */}
      {showFailsafeContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="max-w-2xl p-8 text-center text-white"
          >
            <h2 className="text-3xl font-terminal text-[hsl(var(--dharma-amber))] mb-6">FAILSAFE PROTOCOL EXECUTED</h2>
            <p className="mb-4">The electromagnetic energy has been discharged.</p>
            <p className="mb-8">New information has been unlocked in your databank.</p>
            <button 
              onClick={() => setShowFailsafeContent(false)}
              className="px-6 py-2 bg-[hsla(var(--dharma-amber),0.2)] border border-[hsl(var(--dharma-amber))] text-[hsl(var(--dharma-amber))] rounded"
            >
              CONTINUE
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Hidden easter egg component for footer
interface FooterEasterEggProps {
  onUnlockLog: () => void;
}

const FooterEasterEgg: React.FC<FooterEasterEggProps> = ({ onUnlockLog }) => {
  const [clicks, setClicks] = useState(0);
  const { triggerSystemStatus } = useLore();

  // Reset clicks after a period of inactivity
  useEffect(() => {
    if (clicks > 0) {
      const timeout = setTimeout(() => {
        setClicks(0);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [clicks]);

  // Check for the correct sequence: 4-8-15-16-23-42 of clicks
  useEffect(() => {
    // Specifically looking for the 6th click (index 5)
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
      <div className="w-10 h-10 flex items-center justify-center text-[hsl(var(--dharma-amber))]">
        ⓘ
      </div>
    </div>
  );
};

export default Home;