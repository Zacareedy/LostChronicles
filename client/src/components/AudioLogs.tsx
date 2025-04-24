import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AUDIO_LOGS } from '@/lib/constants';
import { playSound, audioLogs } from '@/lib/audio';

interface AudioLogsProps {
  unlockedLogs: string[];
  onLogPlay: (logId: string) => void;
}

const AudioLogs: React.FC<AudioLogsProps> = ({ unlockedLogs, onLogPlay }) => {
  const [playingLog, setPlayingLog] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  const handlePlay = (logId: string) => {
    // Stop any currently playing audio
    if (playingLog && playingLog !== logId && audioRefs.current[playingLog]) {
      audioRefs.current[playingLog]!.pause();
    }
    
    setPlayingLog(logId);
    onLogPlay(logId);
    
    if (audioRefs.current[logId]) {
      audioRefs.current[logId]!.play();
    }
  };

  const handlePause = (logId: string) => {
    if (audioRefs.current[logId]) {
      audioRefs.current[logId]!.pause();
    }
    setPlayingLog(null);
  };

  const handleTimeUpdate = (logId: string) => {
    if (audioRefs.current[logId]) {
      const audio = audioRefs.current[logId]!;
      const progressValue = (audio.currentTime / audio.duration) * 100;
      setProgress(prev => ({ ...prev, [logId]: progressValue }));
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSliderChange = (logId: string, value: number) => {
    if (audioRefs.current[logId]) {
      const audio = audioRefs.current[logId]!;
      const newTime = (value / 100) * audio.duration;
      audio.currentTime = newTime;
      setProgress(prev => ({ ...prev, [logId]: value }));
    }
  };

  // Function to get hint text for locked logs
  const getUnlockHint = (logId: string) => {
    const log = AUDIO_LOGS[logId as keyof typeof AUDIO_LOGS];
    if (!log) return '';
    
    // Return abbreviated hint based on unlock method
    switch (log.unlockMethod) {
      case 'terminal':
        return 'Requires specific terminal command';
      case 'coordinates':
        return 'Requires geographical coordinates';
      case 'sequence':
        return 'Requires station sequence discovery';
      case 'puzzle':
        return 'Requires puzzle completion';
      case 'hidden':
        return 'Hidden signal source';
      default:
        return '';
    }
  };
  
  // Calculate the next logical log to unlock based on what's available
  const getNextLogToUnlock = () => {
    // Always follow a specific progression path rather than random
    const progressionOrder = [
      'orientationVideo', 'distressSignal', 'radioTransmission', 
      'blackRock', 'pearlTransmission', 'unknownSource'
    ];
    
    for (const logId of progressionOrder) {
      if (!unlockedLogs.includes(logId)) {
        return logId;
      }
    }
    
    return null;
  };
  
  // Show a hint if we want to reveal the next step
  const [showingHint, setShowingHint] = useState(false);
  const [nextLog, setNextLog] = useState<string | null>(null);
  
  useEffect(() => {
    setNextLog(getNextLogToUnlock());
  }, [unlockedLogs]);
  
  const handleShowHint = () => {
    playSound('beep', 'short');
    setShowingHint(true);
    setTimeout(() => setShowingHint(false), 5000);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-[hsl(var(--dharma-black))] border border-[hsla(var(--dharma-gray),0.3)] rounded-lg overflow-hidden"
    >
      <div className="bg-[hsla(var(--dharma-gray),0.2)] p-2 flex justify-between">
        <h2 className="font-terminal text-[hsl(var(--dharma-amber))]">TRANSMISSION LOGS</h2>
        <div className="text-xs text-[hsl(var(--dharma-gray))]">
          FILES: {unlockedLogs.length}/{Object.keys(AUDIO_LOGS).length}
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {/* Only show unlocked logs */}
          {Object.entries(AUDIO_LOGS)
            .filter(([id]) => unlockedLogs.includes(id))
            .map(([id, log]) => (
              <div 
                key={id}
                className="border border-[hsla(var(--dharma-gray),0.3)] rounded p-3 reveal-trigger hover:bg-[hsla(var(--dharma-gray),0.1)] transition-colors"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-mono text-[hsl(var(--dharma-amber))]">{log.title}</h3>
                  <div className="text-xs text-[hsl(var(--dharma-gray))]">
                    AVAILABLE
                  </div>
                </div>
                
                <div className={`mt-2 ${playingLog === id ? '' : 'hidden-content'}`}>
                  <div className="text-xs text-[hsl(var(--dharma-gray))] mb-2">
                    {log.description}
                  </div>
                  
                  <div className="flex items-center">
                    <button 
                      onClick={() => playingLog === id ? handlePause(id) : handlePlay(id)}
                      className="mr-2 text-[hsl(var(--dharma-amber))] hover:text-[hsl(var(--dharma-green))]"
                    >
                      {playingLog === id ? '❚❚' : '►'}
                    </button>
                    
                    <input 
                      type="range" 
                      className="audio-player flex-1" 
                      min="0" 
                      max="100" 
                      value={progress[id] || 0}
                      onChange={(e) => handleSliderChange(id, parseInt(e.target.value))}
                    />
                    
                    <audio 
                      ref={(el) => audioRefs.current[id] = el}
                      src={log.src}
                      onTimeUpdate={() => handleTimeUpdate(id)}
                      onEnded={() => setPlayingLog(null)}
                      hidden
                    />
                    
                    <span className="ml-2 text-xs text-[hsl(var(--dharma-gray))]">
                      {audioRefs.current[id] ? 
                        `${formatTime(audioRefs.current[id]!.currentTime)}/${formatTime(audioRefs.current[id]!.duration || 0)}` : 
                        `0:00/${log.duration}`
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          
          {/* Display the next log to be unlocked with a hint, if we want to show it */}
          {nextLog && unlockedLogs.length > 0 && unlockedLogs.length < Object.keys(AUDIO_LOGS).length && (
            <div className="border border-[hsla(var(--dharma-gray),0.2)] border-dashed rounded p-3 bg-[hsla(var(--dharma-gray),0.05)]">
              <div className="flex justify-between items-center">
                <h3 className="font-mono text-[hsla(var(--dharma-gray),0.7)]">UNKNOWN SIGNAL DETECTED</h3>
                <div className="text-xs text-[hsl(var(--dharma-red))]">
                  LOCKED
                </div>
              </div>
              
              {showingHint && (
                <div className="mt-2 text-xs text-[hsla(var(--dharma-amber),0.5)] animate-flicker">
                  <p>SIGNAL ANALYSIS: {getUnlockHint(nextLog)}</p>
                  <p className="mt-1 text-[hsla(var(--dharma-gray),0.6)] text-[9px]">
                    {AUDIO_LOGS[nextLog as keyof typeof AUDIO_LOGS].unlockRequirement}
                  </p>
                </div>
              )}
            </div>
          )}
            
          {/* If no logs yet, show mysterious message */}
          {unlockedLogs.length === 0 && (
            <div className="text-[hsl(var(--dharma-gray))] text-center py-6">
              <p>NO TRANSMISSION LOGS AVAILABLE</p>
              <p className="text-xs mt-2 opacity-50">Check terminal for initialization sequence</p>
              <div className="hidden-clue mt-4">Execute 'playback orientation' in terminal</div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-xs text-[hsl(var(--dharma-gray))] flex justify-between items-center">
          <span>{unlockedLogs.length} SIGNALS INTERCEPTED</span>
          
          {/* Only show action buttons if there are unlocked logs and more to discover */}
          {unlockedLogs.length > 0 && unlockedLogs.length < Object.keys(AUDIO_LOGS).length && (
            <div className="flex space-x-3">
              {/* Enhanced scan/triangulation feature - clicking no longer unlocks */}
              <button 
                className="text-[hsl(var(--dharma-amber))] hover:text-[hsl(var(--dharma-green))] text-xs opacity-50 hover:opacity-100 transition-opacity"
                onClick={handleShowHint}
              >
                ANALYZE SIGNAL
              </button>
            </div>
          )}
          
          {/* Easter egg hidden button that does nothing obvious */}
          {unlockedLogs.length > 1 && (
            <button 
              className="hidden-coordinates absolute right-0 bottom-0 opacity-5 text-[4px]"
              onClick={() => playSound('beep', 'short')}
            >
              [4 8 15 16 23 42]
            </button>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default AudioLogs;
