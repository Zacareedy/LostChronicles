import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { audioLogs } from '@/lib/audio';

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

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-[hsl(var(--dharma-black))] border border-[hsla(var(--dharma-gray),0.3)] rounded-lg overflow-hidden"
    >
      <div className="bg-[hsla(var(--dharma-gray),0.2)] p-2">
        <h2 className="font-terminal text-[hsl(var(--dharma-amber))]">TRANSMISSION LOGS</h2>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {Object.entries(audioLogs).map(([id, log]) => {
            const isUnlocked = unlockedLogs.includes(id);
            
            return (
              <div 
                key={id}
                className={`border border-[hsla(var(--dharma-gray),0.3)] rounded p-3 ${isUnlocked ? 'reveal-trigger hover:bg-[hsla(var(--dharma-gray),0.1)]' : 'opacity-70'} transition-colors`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-mono text-[hsl(var(--dharma-amber))]">{log.title}</h3>
                  <div className="text-xs text-[hsl(var(--dharma-gray))]">
                    {isUnlocked ? 'AVAILABLE' : 'LOCKED'}
                  </div>
                </div>
                
                {isUnlocked && (
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
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 text-xs text-[hsl(var(--dharma-gray))] flex justify-between items-center">
          <span>{unlockedLogs.length} FILES AVAILABLE</span>
          <button 
            className="text-[hsl(var(--dharma-amber))] hover:text-[hsl(var(--dharma-green))] text-xs"
            onClick={() => onLogPlay('scan')}
          >
            SCAN FOR MORE
          </button>
        </div>
      </div>
    </motion.section>
  );
};

export default AudioLogs;
