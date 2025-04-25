import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, File } from 'lucide-react';
import { useLore } from '@/contexts/LoreContext';
import { INCIDENT_REPORTS, AUDIO_LOGS, STATIONS } from '@/lib/constants';
import TapeSquare from "./TapeSquare";
import { playSound } from '@/lib/audio';

interface LorePanelProps {
  className?: string;
  defaultSection?: string;
  showOnly?: 'stations' | 'files' | 'signals';
}

// Function to split station description and partially redact it
const redactDescription = (description: string): React.ReactNode => {
  const words = description.split(' ');

  return words.map((word, index) => {
    // Randomly redact about 20-30% of words that are 4+ characters long
    const shouldRedact = word.length >= 4 && Math.random() < 0.3;

    if (shouldRedact) {
      return <span key={index} className="dharma-redacted mr-1">{word}</span>;
    }

    return <span key={index} className="mr-1">{word}</span>;
  });
};

// Add some technical-looking jargon to coordinates
const formatCoordinates = (coords: string): string => {
  return `${coords} [REF.${Math.floor(Math.random() * 1000) + 100}]`;
};

// Simulate typing effect for terminal output
const TerminalLine = ({ text, delay = 0 }: { text: string, delay?: number }) => {
  return (
    <div 
      className="font-mono text-xs mb-1" 
      style={{ animation: `typing 1s steps(${text.length}, end)`, animationDelay: `${delay}s` }}
    >
      {text}
    </div>
  );
};

// Green screen menu button
const MenuButton = ({ 
  label, 
  isActive, 
  onClick,
  code
}: { 
  label: string, 
  isActive: boolean, 
  onClick: () => void,
  code: string
}) => {
  return (
    <div 
      className={`
        p-2 text-xs font-mono cursor-pointer mb-2
        ${isActive 
          ? 'bg-[hsla(var(--dharma-green),0.2)] text-[hsl(var(--dharma-green))] border border-[hsla(var(--dharma-green),0.5)]' 
          : 'bg-[hsla(var(--dharma-gray),0.1)] text-[hsla(var(--dharma-green),0.7)] border border-[hsla(var(--dharma-gray),0.2)]'
        }
        hover:bg-[hsla(var(--dharma-green),0.1)]
      `}
      onClick={() => {
        playSound('button', 'short');
        onClick();
      }}
    >
      <div className="flex items-center justify-between">
        <span className="uppercase">{label}</span>
        <span className="dharma-code text-[10px]">{code}</span>
      </div>
      {isActive && (
        <div className="h-1 bg-[hsla(var(--dharma-green),0.3)] mt-1"></div>
      )}
    </div>
  );
};

// Represents a data row in the old-school green screen style
const DataEntry = ({ 
  label, 
  code, 
  status,
  isSelected,
  onClick,
  children
}: { 
  label: string, 
  code: string, 
  status?: string,
  isSelected: boolean,
  onClick: () => void,
  children?: React.ReactNode
}) => {
  return (
    <div className={`
      mb-2 border border-[hsla(var(--dharma-gray),0.2)] font-mono text-xs
      ${isSelected ? 'bg-[hsla(var(--dharma-green),0.1)]' : ''}
    `}>
      <div 
        className="p-2 flex justify-between cursor-pointer" 
        onClick={() => {
          playSound('beep', 'short');
          onClick();
        }}
      >
        <div className="flex items-center gap-2">
          <span className={`animate-terminal-blink mr-1 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>{'>'}</span>
          <span className="font-bold text-[hsl(var(--dharma-green))]">{code}</span>
          <span>{label}</span>
        </div>
        {status && (
          <span className="dharma-code text-[10px]">{status}</span>
        )}
      </div>
      
      {isSelected && children && (
        <div className="p-2 border-t border-[hsla(var(--dharma-gray),0.2)] bg-[hsla(var(--dharma-black),0.3)]">
          {children}
        </div>
      )}
    </div>
  );
};

const FileUploadArea = ({ logId, onUpload }: { logId: string, onUpload: (id: string, file: File) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        setFileName(file.name);
        onUpload(logId, file);
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      onUpload(logId, file);
    }
  };
  
  return (
    <div 
      className={`
        mt-2 p-2 border border-dashed 
        ${isDragging ? 'border-[hsl(var(--dharma-green))]' : 'border-[hsla(var(--dharma-gray),0.3)]'} 
        ${isDragging ? 'bg-[hsla(var(--dharma-green),0.05)]' : 'bg-[hsla(var(--dharma-gray),0.05)]'}
        text-center text-xs
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {fileName ? (
        <div className="text-[hsl(var(--dharma-green))]">
          File loaded: {fileName}
        </div>
      ) : (
        <>
          <div className="mb-1">DEV MODE: UPLOAD AUDIO/VIDEO FILE</div>
          <div className="text-[9px] text-[hsla(var(--dharma-gray),0.7)]">
            Drag and drop or click to select
          </div>
          <input 
            type="file" 
            accept="audio/*,video/*" 
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          />
        </>
      )}
    </div>
  );
};

const LorePanel: React.FC<LorePanelProps> = (props) => {
  const { className } = props;
  const { 
    discoveredStations,
    unlockedAudioLogs,
    unlockedReports,
    storylineFlags,
    triggerLoreEvent
  } = useLore();

  const [currentView, setCurrentView] = useState<string>(props.defaultSection || 'root');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  // Only show discovered stations
  const discoveredStationData = Object.entries(STATIONS)
    .filter(([key]) => discoveredStations.includes(key))
    .map(([key, station]) => ({ key, ...station }));

  // Only show unlocked reports
  const unlockedReportData = unlockedReports.map(index => ({
    ...INCIDENT_REPORTS[index],
    index
  }));

  // Only show unlocked audio logs
  const unlockedAudioLogData = Object.entries(AUDIO_LOGS)
    .filter(([key]) => unlockedAudioLogs.includes(key))
    .map(([key, log]) => ({ key, ...log }));

  // Handler for file uploads in dev mode
  const handleFileUpload = (logId: string, file: File) => {
    // Create a local URL for the uploaded file
    const objectUrl = URL.createObjectURL(file);
    
    // Store the file URL in localStorage for persistence
    const storedFiles = JSON.parse(localStorage.getItem('dharmaUploadedFiles') || '{}');
    storedFiles[logId] = objectUrl;
    localStorage.setItem('dharmaUploadedFiles', JSON.stringify(storedFiles));
    
    console.log(`File uploaded for log ID: ${logId}`);
    playSound('success');
  };

  // Update time display every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Check keyboard combination for dev mode
  useEffect(() => {
    const keys: { [key: string]: boolean } = {};
    const devSequence = ['Control', 'Alt', '4', '8', '1', '5', '1', '6', '2', '3', '4', '2'];
    
    const checkDevSequence = () => {
      return devSequence.every(key => keys[key]);
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if (checkDevSequence()) {
        setIsDevMode(true);
        playSound('success');
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Format time as HH:MM in 24-hour format
  function getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Render content based on current view
  const renderContent = () => {
    // Root menu (main screen)
    if (currentView === 'root') {
      return (
        <div className="p-3">
          <div className="mb-4 text-center border-b border-[hsla(var(--dharma-gray),0.3)] pb-2">
            <div className="text-sm text-[hsl(var(--dharma-green))] font-mono mb-1">DHARMA INITIATIVE</div>
            <div className="text-xs text-[hsla(var(--dharma-gray),0.8)]">DATA RETRIEVAL SYSTEM</div>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <MenuButton 
              label="STATION DATABASE" 
              isActive={false} 
              onClick={() => setCurrentView('stations')}
              code={`STAT-${discoveredStations.length}`}
            />
            <MenuButton 
              label="INCIDENT REPORTS" 
              isActive={false} 
              onClick={() => setCurrentView('files')}
              code={`FILE-${unlockedReports.length}`}
            />
            <MenuButton 
              label="SIGNAL ANALYSIS" 
              isActive={false} 
              onClick={() => setCurrentView('signals')}
              code={`SIG-${unlockedAudioLogs.length}`}
            />
          </div>
          
          <div className="mt-8 text-center">
            <div className="dharma-code text-xs inline-block px-3 py-1">
              <div className="text-[hsla(var(--dharma-gray),0.6)] mb-1">SYSTEM STATUS</div>
              <div className="text-[hsl(var(--dharma-green))]">OPERATIONAL</div>
            </div>
            
            {isDevMode && (
              <div className="mt-4 text-xs text-[hsl(var(--dharma-amber))]">
                DEVELOPER MODE ACTIVE
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Stations view
    else if (currentView === 'stations') {
      return (
        <div className="p-3">
          <div className="mb-4 border-b border-[hsla(var(--dharma-gray),0.3)] pb-2">
            <div className="flex justify-between items-center">
              <span className="dharma-terminal-label text-xs">
                <Monitor className="inline h-3 w-3 mr-1" /> STATION DATABASE
              </span>
              <span className="dharma-code text-xs">
                {discoveredStationData.length} RECORDS
              </span>
            </div>
          </div>
          
          {discoveredStationData.length > 0 ? (
            <div className="mb-4">
              {discoveredStationData.map(station => (
                <DataEntry
                  key={station.key}
                  label={station.name}
                  code={station.code}
                  status="OPERATIONAL"
                  isSelected={selectedItemId === station.key}
                  onClick={() => setSelectedItemId(selectedItemId === station.key ? null : station.key)}
                >
                  <div className="text-xs mb-2 font-mono">
                    <span className="text-[hsla(var(--dharma-green),0.7)]">CLEARANCE LEVEL ALPHA</span>
                  </div>

                  <div className="text-xs mb-2 font-mono">
                    <span className="opacity-70">STATUS:</span> <span className="opacity-90">OPERATIONAL</span>
                  </div>

                  <div className="text-xs mb-2">
                    <span className="opacity-70">PURPOSE:</span> <span className="opacity-90">{redactDescription(station.description)}</span>
                  </div>

                  <div className="dharma-code mt-3 w-full text-xs font-mono p-1 text-center">
                    {formatCoordinates(station.coordinates)}
                  </div>
                </DataEntry>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
              <Monitor className="h-8 w-8 mb-4 opacity-50" />
              <p className="font-terminal">NO LOCATION DATA</p>
              <div className="dharma-code text-xs mt-4 p-1">
                &gt; ERROR CODE 108: DATA NOT FOUND
              </div>
            </div>
          )}
          
          <button 
            className="text-xs font-mono text-[hsl(var(--dharma-amber))] bg-[hsla(var(--dharma-gray),0.1)] 
                      border border-[hsla(var(--dharma-gray),0.3)] px-3 py-1 mt-4"
            onClick={() => {
              playSound('button', 'short');
              setCurrentView('root');
              setSelectedItemId(null);
            }}
          >
            &lt; RETURN TO MENU
          </button>
        </div>
      );
    }
    
    // Files view
    else if (currentView === 'files') {
      return (
        <div className="p-3">
          <div className="mb-4 border-b border-[hsla(var(--dharma-gray),0.3)] pb-2">
            <div className="flex justify-between items-center">
              <span className="dharma-terminal-label text-xs">
                <File className="inline h-3 w-3 mr-1" /> INCIDENT REPORTS
              </span>
              <span className="dharma-code text-xs">
                MEM: {Math.floor(Math.random() * 40) + 60}K
              </span>
            </div>
          </div>
          
          {unlockedReportData.length > 0 ? (
            <div className="mb-4">
              {unlockedReportData.map((report) => (
                <DataEntry
                  key={report.index}
                  label={report.title}
                  code={`FILE:${report.fileNumber}`}
                  status={report.classification.replace('LEVEL ', 'L')}
                  isSelected={selectedItemId === `report-${report.index}`}
                  onClick={() => setSelectedItemId(selectedItemId === `report-${report.index}` ? null : `report-${report.index}`)}
                >
                  <div className="text-xs whitespace-pre-line">
                    {report.content.split('\n').map((line, i) => (
                      <TerminalLine 
                        key={i} 
                        text={line} 
                        delay={i * 0.1} 
                      />
                    ))}
                  </div>
                </DataEntry>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
              <File className="h-8 w-8 mb-4 opacity-50" />
              <p className="font-terminal">ACCESS DENIED</p>
              <p className="font-mono text-xs mt-2 opacity-70">SEC.CLEARANCE INADEQUATE</p>
              <div className="dharma-code text-xs mt-4 p-1">
                &gt; ERROR CODE 15: AUTHORIZATION FAILURE
              </div>
            </div>
          )}
          
          <button 
            className="text-xs font-mono text-[hsl(var(--dharma-amber))] bg-[hsla(var(--dharma-gray),0.1)] 
                      border border-[hsla(var(--dharma-gray),0.3)] px-3 py-1 mt-4"
            onClick={() => {
              playSound('button', 'short');
              setCurrentView('root');
              setSelectedItemId(null);
            }}
          >
            &lt; RETURN TO MENU
          </button>
        </div>
      );
    }
    
    // Signals view
    else if (currentView === 'signals') {
      return (
        <div className="p-3">
          <div className="mb-4 border-b border-[hsla(var(--dharma-gray),0.3)] pb-2">
            <div className="flex justify-between items-center">
              <span className="dharma-terminal-label text-xs">
                <TapeSquare className="inline h-3 w-3 mr-1" /> SIGNAL ANALYSIS
              </span>
              <span className="dharma-code text-xs">
                {unlockedAudioLogData.length} RECORDS
              </span>
            </div>
          </div>
          
          {unlockedAudioLogData.length > 0 ? (
            <div className="mb-4">
              {unlockedAudioLogData.map(log => (
                <DataEntry
                  key={log.key}
                  label={log.title}
                  code={`REC:${log.key.toUpperCase().slice(0, 6)}`}
                  status={log.duration}
                  isSelected={selectedItemId === log.key}
                  onClick={() => setSelectedItemId(selectedItemId === log.key ? null : log.key)}
                >
                  <div className="text-xs mb-3">
                    {log.description}
                  </div>
                  
                  {/* Audio Playback Control */}
                  <AudioPlayback logId={log.key} />
                  
                  {/* Dev Mode: File Upload Option */}
                  {isDevMode && (
                    <FileUploadArea 
                      logId={log.key} 
                      onUpload={handleFileUpload} 
                    />
                  )}
                </DataEntry>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
              <TapeSquare className="h-8 w-8 mb-4 opacity-50" />
              <p className="font-terminal">NO SIGNALS DETECTED</p>
              <div className="w-full max-w-xs h-6 mt-4 bg-[hsla(var(--dharma-gray),0.1)] relative">
                <div className="absolute inset-0 flex items-center justify-center text-xs opacity-50">
                  SCANNING...
                </div>
                <div className="h-full w-2 bg-[hsla(var(--dharma-green),0.4)] absolute left-0 animate-terminal-scan"></div>
              </div>
            </div>
          )}
          
          <button 
            className="text-xs font-mono text-[hsl(var(--dharma-amber))] bg-[hsla(var(--dharma-gray),0.1)] 
                      border border-[hsla(var(--dharma-gray),0.3)] px-3 py-1 mt-4"
            onClick={() => {
              playSound('button', 'short');
              setCurrentView('root');
              setSelectedItemId(null);
            }}
          >
            &lt; RETURN TO MENU
          </button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`dharma-panel crt-screen ${className} relative`}
    >
      {/* CRT Scan effect */}
      <div className="scan-line"></div>

      <div className="dharma-panel-header bg-[hsla(var(--dharma-green),0.1)]">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-[hsl(var(--dharma-green))] font-mono">{currentTime}</span>
          <div className="dharma-code text-xs">SYS.3.01</div>
        </div>
      </div>

      {renderContent()}
    </motion.section>
  );
};

// Audio playback component that supports custom uploaded files
const AudioPlayback = ({ logId }: { logId: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
  // Check if we have a user-uploaded file for this log
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  
  useEffect(() => {
    // Check localStorage for custom audio file
    const storedFiles = JSON.parse(localStorage.getItem('dharmaUploadedFiles') || '{}');
    if (storedFiles[logId]) {
      setAudioSrc(storedFiles[logId]);
    } else {
      // Use the default audio source from constants
      const defaultSource = AUDIO_LOGS[logId as keyof typeof AUDIO_LOGS]?.src;
      setAudioSrc(defaultSource || null);
    }
  }, [logId]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 1;
      setProgress((currentTime / duration) * 100);
      setCurrentTime(formatTime(currentTime));
      setDuration(formatTime(duration));
    }
  };
  
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newPosition = Number(e.target.value);
      audioRef.current.currentTime = (newPosition / 100) * audioRef.current.duration;
      setProgress(newPosition);
    }
  };
  
  return (
    <div className="mt-2">
      <div className="text-xs mb-2 font-mono">PLAYBACK CONTROL:</div>
      
      <div className="flex items-center">
        <button 
          onClick={handlePlayPause}
          className="px-3 py-1 mr-2 bg-[hsla(var(--dharma-gray),0.1)] border border-[hsla(var(--dharma-gray),0.3)]
                    text-[hsl(var(--dharma-green))] hover:bg-[hsla(var(--dharma-green),0.1)]"
        >
          {isPlaying ? '❚❚' : '►'}
        </button>
        
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={progress} 
          onChange={handleSeek}
          className="flex-1 h-1 dharma-slider accent-[hsl(var(--dharma-green))]" 
        />
        
        <span className="ml-2 text-xs text-[hsl(var(--dharma-gray))]">
          {currentTime}/{duration}
        </span>
      </div>
      
      {audioSrc && (
        <audio 
          ref={audioRef}
          src={audioSrc}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onDurationChange={handleTimeUpdate}
        />
      )}
    </div>
  );
};

export default LorePanel;