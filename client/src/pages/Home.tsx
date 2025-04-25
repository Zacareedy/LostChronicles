import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import Loading from '@/components/Loading';
import Terminal from '@/components/Terminal';
import IslandMap from '@/components/IslandMap';
import AudioLogs from '@/components/AudioLogs';
import IncidentReports from '@/components/IncidentReports';
import LorePanel from '@/components/LorePanel';
import Countdown from '@/components/Countdown';
import HiddenPuzzle from '@/components/HiddenPuzzle';
import { STATIONS } from '@/lib/constants';
import { playSound, stopSound } from '@/lib/audio';
import { useLore } from '@/contexts/LoreContext';

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPuzzleVisible, setIsPuzzleVisible] = useState(false);
  const [isCountdownReset, setIsCountdownReset] = useState(false);
  
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
    triggerSystemStatus('PROTOCOL EXECUTION REQUIRED', 0); // 0 means don't auto-reset
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
      {/* CRT Overlay effects */}
      <div className="absolute inset-0 crt pointer-events-none z-50"></div>
      <div className="scanline absolute inset-0 pointer-events-none z-40"></div>
      
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
        
        {/* Archives Panel */}
        <LorePanel className="lg:col-span-3 mt-4" />
        
        {/* Audio Logs Panel */}
        <AudioLogs 
          unlockedLogs={unlockedAudioLogs} 
          onLogPlay={handleLogPlay} 
        />
        
        <IncidentReports 
          unlockedReports={unlockedReports} 
        />
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
