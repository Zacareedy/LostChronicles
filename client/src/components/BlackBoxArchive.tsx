import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Film, 
  Package, 
  FileVideo, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  CheckCircle, 
  X, 
  Volume2,
  AlertCircle,
  Clock,
  Download,
  Info
} from 'lucide-react';
import { playSound } from '@/lib/audio';

interface BlackBoxArchiveProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface TimelineMarker {
  id: string;
  time: number; // in seconds
  label: string;
  discovered: boolean;
  content: string;
}

const BlackBoxArchive: React.FC<BlackBoxArchiveProps> = ({ isVisible, onClose, onComplete }) => {
  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60); // 60 seconds video
  const [volume, setVolume] = useState(70);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Puzzle state
  const [timelineMarkers, setTimelineMarkers] = useState<TimelineMarker[]>([
    { id: '1', time: 8, label: 'Frame Error', discovered: false, content: 'emergency' },
    { id: '2', time: 15, label: 'Audio Spike', discovered: false, content: 'protocol' },
    { id: '3', time: 16, label: 'Signal Loss', discovered: false, content: 'candle' },
    { id: '4', time: 23, label: 'Transmission', discovered: false, content: 'must' },
    { id: '5', time: 42, label: 'Final Entry', discovered: false, content: 'activate' }
  ]);
  const [discoveredMessage, setDiscoveredMessage] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [isCorrupt, setIsCorrupt] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Simulate video loading
  useEffect(() => {
    if (!isVisible) return;
    
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const nextValue = prev + Math.random() * 5;
        if (nextValue >= 100) {
          clearInterval(interval);
          return 100;
        }
        return nextValue;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, [isVisible]);
  
  // Check if all markers have been discovered
  useEffect(() => {
    const allDiscovered = timelineMarkers.every(marker => marker.discovered);
    
    if (allDiscovered && !isCompleted) {
      // Combine all marker content to form the complete message
      const fullMessage = timelineMarkers
        .sort((a, b) => a.time - b.time)
        .map(marker => marker.content)
        .join(' ');
        
      setDiscoveredMessage(fullMessage);
      setIsCompleted(true);
      playSound('success');
      
      // Notify completion after a delay
      setTimeout(() => {
        onComplete();
      }, 3000);
    }
  }, [timelineMarkers, isCompleted, onComplete]);
  
  // Update time display when playing
  useEffect(() => {
    if (!isPlaying || !videoRef.current) return;
    
    const interval = setInterval(() => {
      if (videoRef.current) {
        const newTime = videoRef.current.currentTime;
        setCurrentTime(newTime);
        
        // Auto-pause at the end
        if (newTime >= duration) {
          setIsPlaying(false);
          if (videoRef.current) {
            videoRef.current.pause();
          }
        }
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying, duration]);
  
  // Handle timeline click/scrub
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || isRecovering) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percentageClicked = clickPosition / rect.width;
    const newTime = percentageClicked * duration;
    
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    
    // Check if we clicked near a marker
    const nearbyMarker = timelineMarkers.find(
      marker => Math.abs(marker.time - newTime) < 0.5
    );
    
    if (nearbyMarker && !nearbyMarker.discovered) {
      playSound('beep', 'success');
      handleMarkerDiscovery(nearbyMarker.id);
    } else if (nearbyMarker && nearbyMarker.discovered) {
      setActiveMarker(nearbyMarker.id);
      playSound('click');
    } else {
      setActiveMarker(null);
      playSound('click', 'short');
    }
  };
  
  // Handle marker discovery
  const handleMarkerDiscovery = (markerId: string) => {
    setIsRecovering(true);
    setActiveMarker(markerId);
    
    // Add visual effects for the recovery process
    setTimeout(() => {
      setTimelineMarkers(prev => 
        prev.map(marker => 
          marker.id === markerId 
            ? { ...marker, discovered: true } 
            : marker
        )
      );
      
      setIsRecovering(false);
    }, 1500);
  };
  
  // Toggle play/pause
  const togglePlayback = () => {
    if (isPlaying) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play();
    }
    setIsPlaying(!isPlaying);
    playSound('click');
  };
  
  // Skip backward/forward
  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    playSound('beep', 'short');
  };
  
  // Adjust volume
  const adjustVolume = (newVolume: number) => {
    if (!videoRef.current) return;
    
    const volumeValue = Math.max(0, Math.min(100, newVolume));
    setVolume(volumeValue);
    videoRef.current.volume = volumeValue / 100;
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
    playSound('click');
  };
  
  // Function to format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get discovered markers count
  const getDiscoveredCount = (): string => {
    const count = timelineMarkers.filter(marker => marker.discovered).length;
    return `${count}/${timelineMarkers.length}`;
  };
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50 ${isFullscreen ? 'p-0' : 'p-4'}`}
    >
      <div className={`bg-[hsl(var(--dharma-black))] border-2 border-[hsl(var(--dharma-gray))] ${isFullscreen ? 'w-full h-full rounded-none' : 'max-w-4xl w-full rounded'}`}>
        {loadingProgress < 100 ? (
          // Loading screen
          <div className="p-5 flex flex-col items-center justify-center h-full min-h-[400px]">
            <FileVideo className="h-16 w-16 text-[hsl(var(--dharma-amber))] mb-4 animate-pulse" />
            
            <h2 className="text-[hsl(var(--dharma-amber))] font-terminal text-xl mb-6">
              RECOVERING BLACK BOX DATA
            </h2>
            
            <div className="w-64 h-2 bg-[hsla(var(--dharma-gray),0.2)] rounded-full mb-3">
              <div 
                className="h-full bg-[hsl(var(--dharma-amber))]" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            
            <p className="text-[hsl(var(--dharma-gray))] text-sm">
              {loadingProgress < 100 ? 'Recovering flight data...' : 'Recovery complete'}
            </p>
          </div>
        ) : (
          // Main interface
          <>
            <div className="flex justify-between items-center p-5">
              <h2 className="text-[hsl(var(--dharma-green))] font-terminal text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                DHARMA FLIGHT 815 BLACK BOX
              </h2>
              
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1 text-xs ${isCorrupt ? 'text-[hsl(var(--dharma-amber))]' : 'text-[hsl(var(--dharma-green))]'}`}>
                  <AlertCircle className="h-4 w-4" />
                  {isCorrupt ? 'CORRUPTED DATA' : 'DATA RECOVERED'}
                </div>
                
                <button 
                  onClick={onClose}
                  className="text-[hsl(var(--dharma-gray))] hover:text-[hsl(var(--dharma-red))]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Video player area */}
            <div className={`bg-black ${isFullscreen ? 'h-[calc(100vh-180px)]' : 'h-[300px]'} relative flex items-center justify-center`}>
              {isRecovering ? (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
                  <div className="text-center">
                    <Clock className="h-10 w-10 text-[hsl(var(--dharma-amber))] mx-auto mb-3 animate-pulse" />
                    <p className="text-[hsl(var(--dharma-amber))]">Recovering data fragment...</p>
                  </div>
                </div>
              ) : null}
              
              {/* Video element - in real implementation would have actual video */}
              <video
                ref={videoRef}
                className="h-full max-h-full object-contain"
                src="/path/to/corrupted-video.mp4" // This would be a real but corrupted/glitchy video
                onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
                onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
              />
              
              {/* Placeholder for the video since we don't have actual video */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90">
                <div className="text-center">
                  <Film className="h-16 w-16 text-[hsl(var(--dharma-gray))] mx-auto mb-4" />
                  <p className="text-[hsl(var(--dharma-amber))] text-lg font-terminal mb-2">CORRUPTED VIDEO FILE</p>
                  <p className="text-[hsl(var(--dharma-gray))] text-sm mb-4">Move cursor across timeline to locate hidden data points</p>
                  <p className="text-[hsl(var(--dharma-green))] text-xs">
                    Markers Discovered: {getDiscoveredCount()}
                  </p>
                </div>
              </div>
              
              {/* Timeline markers overlay - only visible in fullscreen mode */}
              {isFullscreen && (
                <div className="absolute inset-0 pointer-events-none">
                  {timelineMarkers.map(marker => (
                    <div 
                      key={marker.id}
                      className={`absolute w-3 h-3 rounded-full -ml-1.5 -mt-1.5 ${
                        marker.discovered 
                          ? 'bg-[hsl(var(--dharma-green))]' 
                          : activeMarker === marker.id
                            ? 'bg-[hsl(var(--dharma-amber))] animate-ping'
                            : 'bg-transparent'
                      } ${activeMarker === marker.id ? 'opacity-100' : 'opacity-50'}`}
                      style={{ 
                        left: `${(marker.time / duration) * 100}%`,
                        top: `${50 + (parseInt(marker.id) * 10)}%`
                      }}
                    ></div>
                  ))}
                </div>
              )}
              
              {/* Active marker info overlay */}
              {activeMarker && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[hsla(var(--dharma-black),0.8)] p-3 border border-[hsl(var(--dharma-amber))] rounded text-center">
                  <p className="text-[hsl(var(--dharma-amber))] text-xs font-terminal mb-1">
                    {timelineMarkers.find(m => m.id === activeMarker)?.label}
                  </p>
                  <p className="text-[hsl(var(--dharma-white))] text-sm">
                    {timelineMarkers.find(m => m.id === activeMarker)?.discovered 
                      ? timelineMarkers.find(m => m.id === activeMarker)?.content
                      : 'Data fragment detected - Click to recover'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Video controls */}
            <div className="p-4 bg-[hsla(var(--dharma-gray),0.05)] border-t border-[hsl(var(--dharma-gray))]">
              {/* Timeline/progress bar */}
              <div 
                ref={timelineRef}
                className="h-4 bg-[hsla(var(--dharma-gray),0.2)] relative mb-3 cursor-pointer"
                onClick={handleTimelineClick}
                onMouseMove={(e) => {
                  if (!timelineRef.current) return;
                  
                  // Calculate mouse position over timeline
                  const rect = timelineRef.current.getBoundingClientRect();
                  const position = e.clientX - rect.left;
                  const timePosition = (position / rect.width) * duration;
                  
                  // Check if mouse is near any marker
                  const nearbyMarker = timelineMarkers.find(
                    marker => Math.abs(marker.time - timePosition) < 0.5
                  );
                  
                  if (nearbyMarker && activeMarker !== nearbyMarker.id) {
                    setActiveMarker(nearbyMarker.id);
                    playSound('beep', 'short');
                  } else if (!nearbyMarker && activeMarker !== null) {
                    setActiveMarker(null);
                  }
                }}
                onMouseLeave={() => {
                  if (!isRecovering) {
                    setActiveMarker(null);
                  }
                }}
              >
                {/* Progress bar */}
                <div 
                  className="absolute top-0 left-0 h-full bg-[hsl(var(--dharma-green))]" 
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                ></div>
                
                {/* Timeline markers */}
                {timelineMarkers.map(marker => (
                  <div 
                    key={marker.id}
                    className={`absolute top-0 w-1 h-full ${
                      marker.discovered 
                        ? 'bg-[hsl(var(--dharma-bright-green))]' 
                        : 'bg-[hsl(var(--dharma-amber))]'
                    }`}
                    style={{ left: `${(marker.time / duration) * 100}%` }}
                  ></div>
                ))}
                
                {/* Current time indicator */}
                <div 
                  className="absolute top-0 w-1 h-full bg-white" 
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                ></div>
              </div>
              
              {/* Time display */}
              <div className="flex justify-between items-center text-xs text-[hsl(var(--dharma-gray))] mb-3">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              
              {/* Playback controls */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => skipTime(-5)}
                    className="p-1 text-[hsl(var(--dharma-white))]"
                  >
                    <SkipBack className="h-4 w-4" />
                  </button>
                  
                  <button 
                    onClick={togglePlayback}
                    className="p-2 bg-[hsla(var(--dharma-green),0.1)] text-[hsl(var(--dharma-green))] border border-[hsl(var(--dharma-green))] rounded-full"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  
                  <button 
                    onClick={() => skipTime(5)}
                    className="p-1 text-[hsl(var(--dharma-white))]"
                  >
                    <SkipForward className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center gap-1 ml-3">
                    <Volume2 className="h-4 w-4 text-[hsl(var(--dharma-white))]" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => adjustVolume(parseInt(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>
                
                <div>
                  <button
                    onClick={toggleFullscreen}
                    className="px-2 py-1 text-xs bg-[hsla(var(--dharma-amber),0.1)] text-[hsl(var(--dharma-amber))] border border-[hsl(var(--dharma-amber))]"
                  >
                    {isFullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN MODE'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Instructions and message display */}
            <div className="p-4">
              {isCompleted ? (
                <div className="p-3 bg-[hsla(var(--dharma-green),0.1)] border border-[hsl(var(--dharma-bright-green))] text-center">
                  <p className="text-[hsl(var(--dharma-bright-green))] text-sm flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    BLACK BOX DATA RECOVERY COMPLETE
                  </p>
                  <p className="text-[hsl(var(--dharma-green))] text-sm mt-2">
                    Recovered Message: "{discoveredMessage}"
                  </p>
                  <p className="text-[hsl(var(--dharma-green))] text-xs mt-1">
                    Proceed to terminal and enter: authorize candle amber
                  </p>
                </div>
              ) : (
                <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 border border-[hsl(var(--dharma-gray))]">
                  <div className="flex items-start gap-2 mb-3">
                    <Info className="h-4 w-4 mt-0.5 text-[hsl(var(--dharma-amber))]" />
                    <div>
                      <h3 className="text-[hsl(var(--dharma-amber))] text-sm font-terminal mb-1">
                        FLIGHT 815 INVESTIGATION
                      </h3>
                      <p className="text-[hsl(var(--dharma-white))] text-xs">
                        This recovered black box recording contains the final moments before the DHARMA supply plane crashed. 
                        The video is severely corrupted, but data analysis indicates five recoverable fragments at specific timestamps.
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-[hsl(var(--dharma-white))] text-xs">
                    <p className="mb-2">
                      <span className="text-[hsl(var(--dharma-green))]">▶ INSTRUCTIONS:</span> Use fullscreen mode and mouse over the timeline to locate hidden data fragments.
                    </p>
                    <p>
                      <span className="text-[hsl(var(--dharma-green))]">▶ OBJECTIVE:</span> Recover all fragments to assemble the complete message.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default BlackBoxArchive;