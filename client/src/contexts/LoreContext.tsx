import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { playSound } from '@/lib/audio';

// Define different types of lore items that can be unlocked
type StationType = string;
type AudioLogType = string;
type IncidentReportType = number;
type LocationType = string;
type PuzzleType = string;

// Define progression levels for different narrative paths
export enum ProgressionPath {
  DHARMA_HISTORY = 'dharmaHistory',
  INCIDENT_INVESTIGATION = 'incidentInvestigation',
  ISLAND_SECRETS = 'islandSecrets',
  CHARACTER_STORIES = 'characterStories'
}

// Define the context shape
interface LoreContextType {
  // Discovered locations/stations
  discoveredStations: StationType[];
  unlockedAudioLogs: AudioLogType[];
  unlockedReports: IncidentReportType[];
  visitedLocations: LocationType[];
  completedPuzzles: PuzzleType[];
  
  // Progress tracking
  progressionLevel: Record<ProgressionPath, number>;
  storylineFlags: Record<string, boolean>;
  terminalHistory: string[];
  
  // Event triggers
  triggerLoreEvent: (eventType: string, payload?: any) => void;
  systemStatus: string;
  
  // Actions
  revealStation: (stationName: StationType) => void;
  unlockAudioLog: (logId: AudioLogType) => void;
  unlockReport: (reportId: IncidentReportType) => void;
  completePuzzle: (puzzleId: PuzzleType) => void;
  recordTerminalCommand: (command: string) => void;
  triggerSystemStatus: (status: string, duration?: number) => void;
}

// Create the context with default values
const LoreContext = createContext<LoreContextType>({
  discoveredStations: ['swan'],
  unlockedAudioLogs: ['orientationVideo'],
  unlockedReports: [],
  visitedLocations: ['swan'],
  completedPuzzles: [],
  
  progressionLevel: {
    [ProgressionPath.DHARMA_HISTORY]: 1,
    [ProgressionPath.INCIDENT_INVESTIGATION]: 0,
    [ProgressionPath.ISLAND_SECRETS]: 0,
    [ProgressionPath.CHARACTER_STORIES]: 0
  },
  storylineFlags: {},
  terminalHistory: [],
  
  triggerLoreEvent: () => {},
  systemStatus: 'SYSTEM OPERATIONAL',
  
  revealStation: () => {},
  unlockAudioLog: () => {},
  unlockReport: () => {},
  completePuzzle: () => {},
  recordTerminalCommand: () => {},
  triggerSystemStatus: () => {}
});

// Define the provider props
interface LoreProviderProps {
  children: ReactNode;
}

// Create the provider component
export const LoreProvider: React.FC<LoreProviderProps> = ({ children }) => {
  // State for discovered content
  const [discoveredStations, setDiscoveredStations] = useState<StationType[]>(['swan']);
  const [unlockedAudioLogs, setUnlockedAudioLogs] = useState<AudioLogType[]>(['orientationVideo']);
  const [unlockedReports, setUnlockedReports] = useState<IncidentReportType[]>([]);
  const [visitedLocations, setVisitedLocations] = useState<LocationType[]>(['swan']);
  const [completedPuzzles, setCompletedPuzzles] = useState<PuzzleType[]>([]);
  
  // State for progression tracking
  const [progressionLevel, setProgressionLevel] = useState<Record<ProgressionPath, number>>({
    [ProgressionPath.DHARMA_HISTORY]: 1,
    [ProgressionPath.INCIDENT_INVESTIGATION]: 0,
    [ProgressionPath.ISLAND_SECRETS]: 0,
    [ProgressionPath.CHARACTER_STORIES]: 0
  });
  const [storylineFlags, setStorylineFlags] = useState<Record<string, boolean>>({});
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  
  // UI state
  const [systemStatus, setSystemStatus] = useState('SYSTEM OPERATIONAL');
  
  // Load state from localStorage on mount and when localStorage changes
  useEffect(() => {
    try {
      // Check for dev mode unlocked stations
      if (localStorage.getItem('dharma_all_stations') === 'true') {
        setDiscoveredStations(['swan', 'pearl', 'flame', 'arrow', 'staff', 'orchid', 'hydra', 'lookout']);
      }
      
      // Check for unlocked audio logs from localStorage
      const unlockedLogsJson = localStorage.getItem('dharma_unlocked_audio_logs');
      if (unlockedLogsJson) {
        try {
          const logIds = JSON.parse(unlockedLogsJson);
          if (Array.isArray(logIds)) {
            setUnlockedAudioLogs(logIds);
          }
        } catch (e) {
          console.error('Error parsing audio logs:', e);
        }
      } else {
        // Fall back to legacy flags
        if (localStorage.getItem('dharma_pearl_access') === 'true') {
          setUnlockedAudioLogs(prev => [...Array.from(new Set([...prev, 'pearlTransmission']))]);
        }
        
        if (localStorage.getItem('dharma_surveillance_active') === 'true') {
          setUnlockedAudioLogs(prev => [...Array.from(new Set([...prev, 'distressSignal', 'radioTransmission']))]);
        }
      }
      
      // Check for unlocked reports from localStorage
      const unlockedReportsJson = localStorage.getItem('dharma_unlocked_reports');
      if (unlockedReportsJson) {
        try {
          const reportIds = JSON.parse(unlockedReportsJson);
          if (Array.isArray(reportIds)) {
            setUnlockedReports(reportIds);
          }
        } catch (e) {
          console.error('Error parsing reports:', e);
        }
      } else {
        // Fall back to legacy flags
        if (localStorage.getItem('dharma_incident_unlocked') === 'true') {
          setUnlockedReports(prev => [...Array.from(new Set([...prev, 0]))]);
        }
        
        if (localStorage.getItem('dharma_surveillance_active') === 'true') {
          setUnlockedReports(prev => [...Array.from(new Set([...prev, 2]))]);
        }
      }

      const savedLore = localStorage.getItem('dharma_lore_state');
      if (savedLore) {
        const parsedState = JSON.parse(savedLore);
        
        // Restore state
        setDiscoveredStations(prev => [...Array.from(new Set([...prev, ...(parsedState.discoveredStations || ['swan'])]))]);
        setUnlockedAudioLogs(prev => [...Array.from(new Set([...prev, ...(parsedState.unlockedAudioLogs || ['orientationVideo'])]))]);
        setUnlockedReports(prev => [...Array.from(new Set([...prev, ...(parsedState.unlockedReports || [])]))]);
        setVisitedLocations(prev => [...Array.from(new Set([...prev, ...(parsedState.visitedLocations || ['swan'])]))]);
        setCompletedPuzzles(prev => [...Array.from(new Set([...prev, ...(parsedState.completedPuzzles || [])]))]);
        setProgressionLevel(parsedState.progressionLevel || {
          [ProgressionPath.DHARMA_HISTORY]: 1,
          [ProgressionPath.INCIDENT_INVESTIGATION]: 0,
          [ProgressionPath.ISLAND_SECRETS]: 0,
          [ProgressionPath.CHARACTER_STORIES]: 0
        });
        setStorylineFlags(parsedState.storylineFlags || {});
      }
    } catch (e) {
      // Ignore localStorage errors
      console.error("Error loading lore state:", e);
    }
  }, []);
  
  // Save state to localStorage when it changes
  useEffect(() => {
    try {
      const loreState = {
        discoveredStations,
        unlockedAudioLogs,
        unlockedReports,
        visitedLocations,
        completedPuzzles,
        progressionLevel,
        storylineFlags
      };
      
      localStorage.setItem('dharma_lore_state', JSON.stringify(loreState));
    } catch (e) {
      // Ignore localStorage errors
      console.error("Error saving lore state:", e);
    }
  }, [discoveredStations, unlockedAudioLogs, unlockedReports, 
      visitedLocations, completedPuzzles, progressionLevel, storylineFlags]);
  
  // Track progression level changes
  useEffect(() => {
    // When DHARMA_HISTORY progresses to level 3, reveal the flame station
    if (progressionLevel[ProgressionPath.DHARMA_HISTORY] === 3 && 
        !discoveredStations.includes('flame')) {
      setTimeout(() => {
        revealStation('flame');
        triggerSystemStatus('DHARMA COMMUNICATIONS HUB LOCATED', 5000);
      }, 2000);
    }
    
    // When INCIDENT_INVESTIGATION reaches level 2, unlock a specific report
    if (progressionLevel[ProgressionPath.INCIDENT_INVESTIGATION] === 2 && 
        !unlockedReports.includes(1)) {
      setTimeout(() => {
        unlockReport(1);
        triggerSystemStatus('ELECTROMAGNETIC ANOMALY REPORT DECLASSIFIED', 5000);
      }, 3000);
    }
    
    // When ISLAND_SECRETS reaches level 3, trigger a secret event
    if (progressionLevel[ProgressionPath.ISLAND_SECRETS] === 3 && 
        !storylineFlags.islandMagnetismRevealed) {
      setTimeout(() => {
        setStorylineFlags(prev => ({ ...prev, islandMagnetismRevealed: true }));
        triggerSystemStatus('ISLAND ELECTROMAGNETIC PROPERTIES REVEALED', 5000);
        playSound('success');
      }, 2000);
    }
  }, [progressionLevel]);
  
  // Function to advance a progression path
  const advanceProgression = (path: ProgressionPath, amount: number = 1) => {
    setProgressionLevel(prev => ({
      ...prev,
      [path]: Math.min(prev[path] + amount, 5) // Cap at level 5
    }));
    
    // Play a sound when advancing
    playSound('beep');
  };
  
  // Function to reveal a station
  const revealStation = (stationName: StationType) => {
    if (!discoveredStations.includes(stationName)) {
      setDiscoveredStations(prev => [...prev, stationName]);
      playSound('success');
      
      // Add to visited locations
      setVisitedLocations(prev => {
        if (!prev.includes(stationName)) {
          return [...prev, stationName];
        }
        return prev;
      });
      
      // Advance progression based on station discoveries
      if (['pearl', 'flame', 'swan'].includes(stationName)) {
        advanceProgression(ProgressionPath.DHARMA_HISTORY);
      }
      
      if (['swan', 'staff', 'orchid'].includes(stationName)) {
        advanceProgression(ProgressionPath.INCIDENT_INVESTIGATION);
      }
      
      if (['blackRock', 'hydra', 'lookout'].includes(stationName)) {
        advanceProgression(ProgressionPath.ISLAND_SECRETS);
      }
    }
  };
  
  // Function to unlock an audio log
  const unlockAudioLog = (logId: AudioLogType) => {
    if (!unlockedAudioLogs.includes(logId)) {
      setUnlockedAudioLogs(prev => [...prev, logId]);
      playSound('success');
      
      // Advance story progression based on the log discovered
      switch (logId) {
        case 'distressSignal':
          advanceProgression(ProgressionPath.CHARACTER_STORIES);
          break;
        case 'radioTransmission':
          advanceProgression(ProgressionPath.ISLAND_SECRETS);
          break;
        case 'blackRock':
          advanceProgression(ProgressionPath.ISLAND_SECRETS);
          advanceProgression(ProgressionPath.CHARACTER_STORIES);
          break;
        case 'pearlTransmission':
          advanceProgression(ProgressionPath.DHARMA_HISTORY);
          advanceProgression(ProgressionPath.INCIDENT_INVESTIGATION);
          break;
      }
    }
  };
  
  // Function to unlock a report
  const unlockReport = (reportId: IncidentReportType) => {
    if (!unlockedReports.includes(reportId)) {
      setUnlockedReports(prev => [...prev, reportId]);
      playSound('success');
      
      // Advance INCIDENT_INVESTIGATION when any report is unlocked
      advanceProgression(ProgressionPath.INCIDENT_INVESTIGATION);
    }
  };
  
  // Function to mark a puzzle as completed
  const completePuzzle = (puzzleId: PuzzleType) => {
    if (!completedPuzzles.includes(puzzleId)) {
      setCompletedPuzzles(prev => [...prev, puzzleId]);
      playSound('success');
      
      // Advance progression based on puzzle type
      switch (puzzleId) {
        case 'hieroglyph':
          advanceProgression(ProgressionPath.DHARMA_HISTORY);
          advanceProgression(ProgressionPath.INCIDENT_INVESTIGATION);
          break;
          
        case 'radio':
          advanceProgression(ProgressionPath.ISLAND_SECRETS);
          advanceProgression(ProgressionPath.CHARACTER_STORIES);
          break;
          
        case 'cipher':
          advanceProgression(ProgressionPath.DHARMA_HISTORY, 2);
          triggerSystemStatus('CIPHER DECRYPTED SUCCESSFULLY', 3000);
          break;
          
        case 'orientation_film':
          advanceProgression(ProgressionPath.DHARMA_HISTORY);
          advanceProgression(ProgressionPath.INCIDENT_INVESTIGATION);
          triggerSystemStatus('ORIENTATION FILM RESTORED', 3000);
          break;
          
        case 'coordinates':
          advanceProgression(ProgressionPath.ISLAND_SECRETS, 2);
          triggerSystemStatus('NEW LOCATION COORDINATES VERIFIED', 3000);
          break;
      }
    }
  };
  
  // Function to record terminal commands and check for patterns
  const recordTerminalCommand = (command: string) => {
    const normalizedCommand = command.toLowerCase().trim();
    setTerminalHistory(prev => {
      const newHistory = [...prev, normalizedCommand];
      // Keep only the last 20 commands
      return newHistory.slice(-20);
    });
    
    // Check for lore-unlocking commands
    if (normalizedCommand === 'tune 342.1' && !unlockedAudioLogs.includes('distressSignal')) {
      unlockAudioLog('distressSignal');
      triggerSystemStatus('FRENCH DISTRESS SIGNAL DETECTED', 3000);
    }
    else if (normalizedCommand.includes('4°8\'15"n') && 
             normalizedCommand.includes('16°23\'42"w') && 
             !unlockedAudioLogs.includes('radioTransmission')) {
      unlockAudioLog('radioTransmission');
      triggerSystemStatus('NUMBERS TRANSMISSION INTERCEPTED', 3000);
    }
    else if (normalizedCommand === 'decrypt valenzetti') {
      advanceProgression(ProgressionPath.DHARMA_HISTORY, 2);
      triggerSystemStatus('VALENZETTI EQUATION DECLASSIFIED', 3000);
    }
    else if (normalizedCommand === 'decrypt incident') {
      advanceProgression(ProgressionPath.INCIDENT_INVESTIGATION, 2);
      triggerSystemStatus('INCIDENT FILE DECRYPTED', 3000);
    }
    else if (normalizedCommand === 'decrypt blackrock') {
      advanceProgression(ProgressionPath.CHARACTER_STORIES);
      advanceProgression(ProgressionPath.ISLAND_SECRETS);
      triggerSystemStatus('BLACK ROCK DATA RECOVERED', 3000);
    }
    
    // Check for station patterns
    if (normalizedCommand.startsWith('locate ')) {
      const stationName = normalizedCommand.split(' ')[1];
      if (['swan', 'pearl', 'flame', 'arrow', 'staff', 'orchid', 'hydra', 'lookout'].includes(stationName)) {
        // Station reveal is handled in the Terminal component through onRevealStation callback
        // But we can still track it and advance progression here
        if (!discoveredStations.includes(stationName) && 
            ((stationName !== 'pearl' || progressionLevel[ProgressionPath.DHARMA_HISTORY] >= 2) &&
             (stationName !== 'orchid' || progressionLevel[ProgressionPath.INCIDENT_INVESTIGATION] >= 3))) {
          revealStation(stationName);
        }
      }
    }
  };
  
  // Function to update the system status with auto-reset
  const triggerSystemStatus = (status: string, duration: number = 3000) => {
    setSystemStatus(status);
    
    if (duration > 0) {
      setTimeout(() => {
        setSystemStatus('SYSTEM OPERATIONAL');
      }, duration);
    }
  };
  
  // Function to trigger lore events from anywhere in the app
  const triggerLoreEvent = (eventType: string, payload?: any) => {
    switch (eventType) {
      case 'puzzle_complete':
        // When a puzzle is completed
        unlockAudioLog('pearlTransmission');
        triggerSystemStatus('PEARL STATION SURVEILLANCE LOGS UNLOCKED', 5000);
        break;
        
      case 'correct_sequence_entered':
        // When the correct number sequence is entered
        triggerSystemStatus('PROTOCOL EXECUTED SUCCESSFULLY', 3000);
        // Potentially unlock content based on progression levels
        if (progressionLevel[ProgressionPath.INCIDENT_INVESTIGATION] >= 2 && 
            !unlockedReports.includes(2)) {
          setTimeout(() => {
            unlockReport(2);
            triggerSystemStatus('SYSTEM FAILURE LOG DECLASSIFIED', 5000);
          }, 4000);
        }
        break;
        
      case 'visit_station':
        if (payload && typeof payload === 'string') {
          revealStation(payload);
        }
        break;
        
      case 'station_sequence_complete':
        // When stations are visited in a specific order
        unlockAudioLog('blackRock');
        triggerSystemStatus('BLACK ROCK JOURNAL RECOVERED', 5000);
        break;
        
      case 'access_granted':
        // When a higher security level is granted
        if (payload && typeof payload === 'number') {
          const level = payload as number;
          if (level >= 3) {
            advanceProgression(ProgressionPath.DHARMA_HISTORY);
            advanceProgression(ProgressionPath.INCIDENT_INVESTIGATION);
          }
          if (level >= 4) {
            advanceProgression(ProgressionPath.ISLAND_SECRETS, 2);
          }
        }
        break;
        
      case 'failsafe_triggered':
        // When the failsafe key is turned
        advanceProgression(ProgressionPath.DHARMA_HISTORY, 2);
        advanceProgression(ProgressionPath.INCIDENT_INVESTIGATION, 2);
        advanceProgression(ProgressionPath.ISLAND_SECRETS, 2);
        
        // Mark the failsafe event in the storyline
        setStorylineFlags(prev => ({
          ...prev,
          failsafeTriggered: true,
          energyDischarged: true
        }));
        
        // Unlock the Orchid station if it's not already discovered
        if (!discoveredStations.includes('orchid')) {
          setTimeout(() => {
            revealStation('orchid');
            triggerSystemStatus('ORCHID STATION LOCATION DECLASSIFIED', 5000);
          }, 6000);
        }
        break;
    }
  };
  
  return (
    <LoreContext.Provider value={{
      // State
      discoveredStations,
      unlockedAudioLogs,
      unlockedReports,
      visitedLocations,
      progressionLevel,
      storylineFlags,
      terminalHistory,
      systemStatus,
      
      // Actions
      triggerLoreEvent,
      revealStation,
      unlockAudioLog,
      unlockReport,
      recordTerminalCommand,
      triggerSystemStatus
    }}>
      {children}
    </LoreContext.Provider>
  );
};

// Create a hook for easy context usage
export const useLore = () => useContext(LoreContext);

export default LoreContext;