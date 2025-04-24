import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import Loading from '@/components/Loading';
import Terminal from '@/components/Terminal';
import IslandMap from '@/components/IslandMap';

import AudioLogs from '@/components/AudioLogs';
import IncidentReports from '@/components/IncidentReports';
import Countdown from '@/components/Countdown';
import HiddenPuzzle from '@/components/HiddenPuzzle';
import { STATIONS } from '@/lib/constants';
import { playSound, stopSound } from '@/lib/audio';

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isPuzzleVisible, setIsPuzzleVisible] = useState(false);
  const [discoveredStations, setDiscoveredStations] = useState<string[]>(['swan']);
  const [unlockedLogs, setUnlockedLogs] = useState<string[]>(['orientationVideo']);
  const [unlockedReports, setUnlockedReports] = useState<number[]>([]);
  const [isCountdownReset, setIsCountdownReset] = useState(false);
  const [systemStatus, setSystemStatus] = useState('SYSTEM OPERATIONAL');

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
    if (!discoveredStations.includes(stationName)) {
      playSound('success');
      setDiscoveredStations(prev => [...prev, stationName]);
      
      // Unlock a report when new station is discovered
      if (unlockedReports.length < 3) {
        setUnlockedReports(prev => [...prev, prev.length]);
      }
    }
  };

  // Track terminal commands for various unlocks
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [stationVisitOrder, setStationVisitOrder] = useState<string[]>([]);

  // This one event handler now supports multiple unlock methods for different logs
  const handleLogPlay = (logId: string) => {
    if (logId === 'scan') {
      // Analyzing a signal no longer unlocks anything directly
      // It only gives hints about how to unlock various logs
      playSound('beep');
      setTimeout(() => {
        playSound('static', 'short');
        setSystemStatus('SIGNAL ANALYSIS COMPLETE');
        setTimeout(() => {
          setSystemStatus('SYSTEM OPERATIONAL');
        }, 3000);
      }, 1500);
    }
  };

  // Complex unlock method for orientation video (via terminal command)
  const handleTerminalCommand = (command: string) => {
    // Keep track of all terminal commands for log unlocking
    setTerminalHistory(prev => [...prev, command.toLowerCase()]);
    
    const normalizedCommand = command.toLowerCase().trim();
    
    // Track the last 20 commands to check complex patterns
    if (terminalHistory.length > 20) {
      setTerminalHistory(prev => prev.slice(prev.length - 20));
    }
    
    // Different unlock paths for different logs
    
    // Orientation video through "playback orientation" command
    if (normalizedCommand === 'playback orientation' && !unlockedLogs.includes('orientationVideo')) {
      playSound('beep');
      setTimeout(() => {
        playSound('success');
        setUnlockedLogs(prev => [...prev, 'orientationVideo']);
        setSystemStatus('ORIENTATION VIDEO LOADED');
      }, 1500);
    }
    
    // Distress signal through "tune 342.1" command
    else if (normalizedCommand === 'tune 342.1' && !unlockedLogs.includes('distressSignal')) {
      if (unlockedLogs.includes('orientationVideo')) {
        playSound('static');
        setTimeout(() => {
          playSound('success');
          setUnlockedLogs(prev => [...prev, 'distressSignal']);
          setSystemStatus('FRENCH DISTRESS SIGNAL DETECTED');
        }, 2000);
      }
    }
    
    // Radio transmission through coordinates command
    else if (normalizedCommand.includes('4°8\'15"n') && 
             normalizedCommand.includes('16°23\'42"w') && 
             !unlockedLogs.includes('radioTransmission')) {
      if (unlockedLogs.includes('distressSignal')) {
        playSound('beep');
        setTimeout(() => {
          playSound('static');
          setTimeout(() => {
            playSound('success');
            setUnlockedLogs(prev => [...prev, 'radioTransmission']);
            setSystemStatus('NUMBERS TRANSMISSION INTERCEPTED');
          }, 1500);
        }, 1000);
      }
    }
  };
  
  // Track station visit order for blackRock log unlock
  useEffect(() => {
    // Only track if a new station was just discovered
    if (discoveredStations.length > stationVisitOrder.length) {
      const newStation = discoveredStations[discoveredStations.length - 1];
      setStationVisitOrder(prev => [...prev, newStation]);
      
      // Check if the correct sequence was followed (arrow,swan,flame,pearl,staff,orchid)
      const correctSequence = ['arrow', 'swan', 'flame', 'pearl', 'staff', 'orchid'];
      
      // Check if we have at least 3 stations and they follow the correct order
      let sequenceCorrectSoFar = true;
      for (let i = 0; i < stationVisitOrder.length; i++) {
        if (stationVisitOrder[i] !== correctSequence[i]) {
          sequenceCorrectSoFar = false;
          break;
        }
      }
      
      // If all stations visited in correct order, unlock Black Rock log
      if (stationVisitOrder.length === correctSequence.length && 
          sequenceCorrectSoFar && 
          !unlockedLogs.includes('blackRock')) {
        playSound('success');
        setUnlockedLogs(prev => [...prev, 'blackRock']);
        setSystemStatus('BLACK ROCK JOURNAL RECOVERED');
      }
    }
  }, [discoveredStations]);

  const handleCorrectSequence = () => {
    // Reset countdown when correct sequence is entered
    setIsCountdownReset(true);
    setSystemStatus('SYSTEM OPERATIONAL');
    
    // Unlock a report when sequence is correctly entered
    if (unlockedReports.length < 3) {
      setUnlockedReports(prev => [...prev, prev.length]);
    }
  };

  const handleCountdownFinish = () => {
    // Trigger system failure state
    playSound('alarm');
    setSystemStatus('PROTOCOL EXECUTION REQUIRED');
  };

  const handlePuzzleComplete = () => {
    // When puzzle is completed, unlock Pearl Station logs
    playSound('success');
    if (!unlockedLogs.includes('pearlTransmission')) {
      setUnlockedLogs(prev => [...prev, 'pearlTransmission']);
      setSystemStatus('PEARL STATION SURVEILLANCE LOGS UNLOCKED');
      setTimeout(() => {
        setSystemStatus('SYSTEM OPERATIONAL');
      }, 5000);
      
      // Save pearl access to localStorage
      try {
        localStorage.setItem('dharma_pearl_access', 'true');
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    
    // Unlock various reports when puzzle is completed
    setUnlockedReports(prev => {
      const newReports = [...prev];
      if (!newReports.includes(0)) newReports.push(0);
      if (!newReports.includes(2)) newReports.push(2);
      return newReports;
    });
    
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
        
        {/* NumberSequence component removed as per user request */}
        
        <AudioLogs 
          unlockedLogs={unlockedLogs} 
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
          <FooterEasterEgg onUnlockLog={
            () => {
              if (!unlockedLogs.includes('unknownSource')) {
                playSound('success');
                setUnlockedLogs(prev => [...prev, 'unknownSource']);
                setSystemStatus('UNKNOWN TRANSMISSION DETECTED');
                setTimeout(() => {
                  setSystemStatus('SYSTEM OPERATIONAL');
                }, 3000);
              }
            }
          } />
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
    }
  }, [clicks, onUnlockLog]);
  
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
