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

// Green screen style section header
const SectionHeader = ({ 
  title, 
  icon,
  count
}: { 
  title: string, 
  icon: React.ReactNode,
  count?: string | number
}) => {
  return (
    <div className="border-b border-[hsla(var(--dharma-gray),0.3)] pb-1 mb-2 bg-[hsla(var(--dharma-green),0.05)]">
      <div className="px-1 py-1 font-mono text-xs flex justify-between items-center">
        <div className="flex items-center">
          {icon}
          <span className="ml-1 text-[hsl(var(--dharma-green))]">{title}</span>
        </div>
        {count !== undefined && (
          <span className="dharma-code text-[10px]">{count}</span>
        )}
      </div>
    </div>
  );
};

// Data item in a green-screen terminal style
const RecordItem = ({ 
  id,
  title, 
  code, 
  status,
  description,
  isSelected,
  onToggle,
  renderDetails
}: { 
  id: string,
  title: string, 
  code: string, 
  status?: string,
  description?: string,
  isSelected: boolean,
  onToggle: () => void,
  renderDetails?: () => React.ReactNode
}) => {
  return (
    <div className={`
      bg-[hsla(var(--dharma-black),0.7)] mb-2 
      border-l-4 ${isSelected ? 'border-[hsl(var(--dharma-green))]' : 'border-[hsla(var(--dharma-gray),0.2)]'}
      text-xs font-mono
    `}>
      <div 
        className={`
          px-2 py-1 flex justify-between cursor-pointer
          ${isSelected ? 'bg-[hsla(var(--dharma-green),0.1)]' : 'hover:bg-[hsla(var(--dharma-green),0.05)]'}
        `}
        onClick={() => {
          playSound('beep', 'short');
          onToggle();
        }}
      >
        <div className="flex items-center">
          <span className={`inline-block w-2 mr-1 ${isSelected ? 'text-[hsl(var(--dharma-green))]' : 'opacity-0'}`}>{'>'}</span>
          <span className="font-bold mr-2 text-[hsl(var(--dharma-green))]">{code}</span>
          <span>{title}</span>
        </div>
        {status && (
          <span className="dharma-code text-[9px] ml-2">{status}</span>
        )}
      </div>
      
      {isSelected && description && (
        <div className="px-2 py-1 text-[10px] text-[hsla(var(--dharma-green),0.8)] bg-[hsla(var(--dharma-gray),0.05)]">
          {description}
        </div>
      )}
      
      {isSelected && renderDetails && (
        <div className="p-2 bg-[hsla(var(--dharma-black),0.5)]">
          {renderDetails()}
        </div>
      )}
    </div>
  );
};

// File Upload Area for developers
const FileUploadArea = ({ logId, onUpload }: { logId: string, onUpload: (id: string, file: File) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  
  // Check for developer mode
  const isDeveloperMode = localStorage.getItem('dharma_devmode_active') === 'true';
  
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
        uploadFile(logId, file);
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      uploadFile(logId, file);
    }
  };
  
  const uploadFile = async (logId: string, file: File) => {
    if (!isDeveloperMode) {
      console.log('Developer mode required for file uploads');
      setUploadStatus('error');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadStatus('uploading');
      
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      // Upload to server
      const response = await fetch('/api/files/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logId,
          fileData: base64,
          mimeType: file.type,
          fileName: file.name,
          devToken: 'dharma-dev-1977' // Developer authentication token
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      // Get response data
      const data = await response.json();
      
      // Update UI
      setUploadStatus('success');
      setUploadProgress(100);
      
      // Also call the original onUpload for any additional handling
      onUpload(logId, file);
      
      // Play a success sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      oscillator.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
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

  const [expandedStation, setExpandedStation] = useState<string | null>(null);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);
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

  // Update time display every minute and check for dev mode
  useEffect(() => {
    // Update the clock display every minute
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);
    
    // Check for dev mode from localStorage (set by terminal command)
    const checkDevMode = () => {
      const devModeActive = localStorage.getItem('dharma_devmode_active') === 'true';
      setIsDevMode(devModeActive);
    };
    
    // Check initially
    checkDevMode();
    
    // Set up a listener for localStorage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dharma_devmode_active') {
        checkDevMode();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll regularly, in case the terminal updates localStorage in same window
    const devModeChecker = setInterval(checkDevMode, 2000);
    
    return () => {
      clearInterval(timer);
      clearInterval(devModeChecker);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Format time as HH:MM in 24-hour format
  function getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`dharma-panel crt-screen ${className} relative overflow-y-auto`}
    >
      {/* CRT Scan effect */}
      <div className="scan-line"></div>

      <div className="dharma-panel-header bg-[hsla(var(--dharma-green),0.1)]">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-[hsl(var(--dharma-green))] font-mono">{currentTime}</span>
          <div className="flex items-center">
            <div className="dharma-code text-xs mr-2">DHARMA INITIATIVE</div>
            {isDevMode && (
              <div className="text-[9px] text-[hsl(var(--dharma-amber))] font-bold font-mono">
                [DEV MODE]
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-3 py-2 grid gap-5">
        {/* SECTION: STATION DATABASE */}
        <div className="pb-1">
          <SectionHeader 
            title="STATION DATABASE" 
            icon={<Monitor className="h-3 w-3" />}
            count={discoveredStationData.length}
          />
          
          <div className="bg-[hsla(var(--dharma-black),0.3)]">
            {discoveredStationData.length > 0 ? (
              <div className="space-y-1 max-h-[180px] overflow-y-auto p-1">
                {discoveredStationData.map(station => (
                  <RecordItem
                    key={station.key}
                    id={station.key}
                    title={station.name}
                    code={station.code}
                    status="OPERATIONAL"
                    isSelected={expandedStation === station.key}
                    onToggle={() => setExpandedStation(expandedStation === station.key ? null : station.key)}
                    renderDetails={() => (
                      <div className="space-y-2">
                        <div className="text-xs font-mono">
                          <span className="text-[hsla(var(--dharma-green),0.7)]">CLEARANCE LEVEL ALPHA</span>
                        </div>
                        <div className="text-xs">
                          <span className="opacity-70">PURPOSE:</span> <span className="opacity-90">{redactDescription(station.description)}</span>
                        </div>
                        <div className="dharma-code mt-1 w-full text-xs font-mono p-1 text-center">
                          {formatCoordinates(station.coordinates)}
                        </div>
                      </div>
                    )}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-3 text-xs">
                <p className="font-terminal">NO STATION DATA AVAILABLE</p>
                <p className="text-[10px] opacity-70 mt-1">AWAITING INPUT...</p>
              </div>
            )}
          </div>
        </div>
        
        {/* SECTION: INCIDENT REPORTS */}
        <div className="pb-1">
          <SectionHeader 
            title="INCIDENT REPORTS" 
            icon={<File className="h-3 w-3" />}
            count={unlockedReportData.length}
          />
          
          <div className="bg-[hsla(var(--dharma-black),0.3)]">
            {unlockedReportData.length > 0 ? (
              <div className="space-y-1 max-h-[180px] overflow-y-auto p-1">
                {unlockedReportData.map((report) => (
                  <RecordItem
                    key={`report-${report.index}`}
                    id={`report-${report.index}`}
                    title={report.title}
                    code={`F${report.fileNumber.split('/')[1].slice(0, 5)}`}
                    status={report.classification.replace('LEVEL ', 'L')}
                    isSelected={expandedReport === `report-${report.index}`}
                    onToggle={() => setExpandedReport(expandedReport === `report-${report.index}` ? null : `report-${report.index}`)}
                    renderDetails={() => (
                      <div className="text-xs whitespace-pre-line">
                        {report.content.split('\n').map((line, i) => (
                          <TerminalLine 
                            key={i} 
                            text={line} 
                            delay={i * 0.05} 
                          />
                        ))}
                      </div>
                    )}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-3 text-xs">
                <p className="font-terminal">ACCESS DENIED</p>
                <p className="text-[10px] opacity-70 mt-1">SECURITY CLEARANCE INADEQUATE</p>
              </div>
            )}
          </div>
        </div>
        
        {/* SECTION: SIGNAL ANALYSIS */}
        <div className="pb-1">
          <SectionHeader 
            title="SIGNAL ANALYSIS" 
            icon={<TapeSquare className="h-3 w-3" />}
            count={unlockedAudioLogData.length}
          />
          
          <div className="bg-[hsla(var(--dharma-black),0.3)]">
            {unlockedAudioLogData.length > 0 ? (
              <div className="space-y-1 max-h-[200px] overflow-y-auto p-1">
                {unlockedAudioLogData.map(log => (
                  <RecordItem
                    key={log.key}
                    id={log.key}
                    title={log.title}
                    code={`SIG${log.key.slice(0, 3).toUpperCase()}`}
                    status={log.duration}
                    description={log.description}
                    isSelected={expandedSignal === log.key}
                    onToggle={() => setExpandedSignal(expandedSignal === log.key ? null : log.key)}
                    renderDetails={() => (
                      <>
                        {/* Audio Playback Control */}
                        <AudioPlayback logId={log.key} />
                        
                        {/* Dev Mode: File Upload Option */}
                        {isDevMode && (
                          <FileUploadArea 
                            logId={log.key} 
                            onUpload={handleFileUpload} 
                          />
                        )}
                      </>
                    )}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-3 text-xs">
                <p className="font-terminal">NO SIGNALS DETECTED</p>
                <p className="text-[10px] opacity-70 mt-1">SCANNING FREQUENCIES...</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Developer mode indicator - no instructions visible to users */}
        {isDevMode && (
          <div className="border border-[hsl(var(--dharma-amber))] p-2 bg-[hsla(var(--dharma-black),0.5)] mt-2">
            <div className="text-xs text-[hsl(var(--dharma-amber))] text-center font-bold">
              ADMIN MODE ACTIVE
            </div>
          </div>
        )}
      </div>
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