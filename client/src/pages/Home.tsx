import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from '@/components/Logo';
import Loading from '@/components/Loading';
import Terminal from '@/components/Terminal';
import IslandMap from '@/components/IslandMap';
import NumberSequence from '@/components/NumberSequence';
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

  const handleLogPlay = (logId: string) => {
    if (logId === 'scan') {
      // Scan for more logs
      if (unlockedLogs.length < 4) {
        const allLogs = ['orientationVideo', 'distressSignal', 'radioTransmission', 'unknownSource'];
        const remainingLogs = allLogs.filter(log => !unlockedLogs.includes(log));
        const randomLog = remainingLogs[Math.floor(Math.random() * remainingLogs.length)];
        
        playSound('beep');
        setTimeout(() => {
          playSound('success');
          setUnlockedLogs(prev => [...prev, randomLog]);
        }, 2000);
      } else {
        playSound('fail');
      }
    }
  };

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
    // Reveal all stations and reports when puzzle is completed
    setDiscoveredStations(Object.keys(STATIONS));
    setUnlockedReports([0, 1, 2]);
    setUnlockedLogs(['orientationVideo', 'distressSignal', 'radioTransmission', 'unknownSource']);
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
        />
        
        <IslandMap 
          discoveredStations={discoveredStations} 
          onStationClick={handleRevealStation} 
        />
        
        <NumberSequence 
          onCorrectSequence={handleCorrectSequence} 
        />
        
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
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div>DHARMA INITIATIVE · STATION 3: THE SWAN · ESTABLISHED 1977</div>
          <div 
            className={`font-terminal ${systemStatus === 'PROTOCOL EXECUTION REQUIRED' ? 'text-[hsl(var(--dharma-red))] animate-terminal-blink' : 'text-[hsl(var(--dharma-amber))]'}`}
          >
            {systemStatus}
          </div>
          <div>SECURITY CLEARANCE LEVEL 4 · USER ID: [REDACTED]</div>
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

export default Home;
