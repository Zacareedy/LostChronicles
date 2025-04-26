import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Radio, 
  Volume2, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Bookmark, 
  BookmarkCheck, 
  Info, 
  WaveSine,
  FileAudio, 
  Download,
  Database,
  AlertCircle,
  CheckCircle,
  Code
} from 'lucide-react';
import { playSound } from '@/lib/audio';

interface RadioPuzzleProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

// Recorded Audio Sample Type
interface AudioSample {
  id: string;
  frequency: number;
  name: string;
  type: 'morse' | 'voice' | 'tone';
  description: string;
  isDecoded: boolean;
  clue: string;
}

const RadioPuzzle: React.FC<RadioPuzzleProps> = ({ isVisible, onClose, onComplete }) => {
  // Basic state
  const [frequency, setFrequency] = useState<number>(108.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(70);
  const [bookmarkedFrequencies, setBookmarkedFrequencies] = useState<number[]>([]);
  const [signalStrength, setSignalStrength] = useState<number>(0);
  const [signalNoise, setSignalNoise] = useState<string>('');
  const [decodedMessage, setDecodedMessage] = useState<string>('');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  
  // Advanced functionality
  const [activeScanMode, setActiveScanMode] = useState<boolean>(false);
  const [scanResults, setScanResults] = useState<string[]>([]);
  const [recordedSamples, setRecordedSamples] = useState<AudioSample[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<'radio' | 'analysis'>('radio');
  const [activeAnalysisSample, setActiveAnalysisSample] = useState<string | null>(null);
  const [showSpectrogram, setShowSpectrogram] = useState<boolean>(false);
  const [annotationText, setAnnotationText] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // The special frequencies that contain hidden messages
  const FREQUENCIES = {
    NUMBERS: 4.8,
    MORSE: 15.16,
    VOICE: 23.42,
    QR: 108.0
  };
  
  const SIGNAL_THRESHOLD = 80;
  
  // Update signal strength based on how close to target frequency
  useEffect(() => {
    if (!isVisible) return;

    // Find the nearest special frequency
    let nearestFrequency = FREQUENCIES.NUMBERS;
    let minDistance = Math.abs(frequency - FREQUENCIES.NUMBERS);
    
    for (const [_, value] of Object.entries(FREQUENCIES)) {
      const distance = Math.abs(frequency - value);
      if (distance < minDistance) {
        minDistance = distance;
        nearestFrequency = value;
      }
    }
    
    const distanceFromTarget = minDistance;
    
    // Calculate signal strength based on proximity to target
    let calculatedStrength = 0;
    
    if (distanceFromTarget < 0.05) {
      calculatedStrength = 95;
    } else if (distanceFromTarget < 0.1) {
      calculatedStrength = 90;
    } else if (distanceFromTarget < 0.5) {
      calculatedStrength = 70;
    } else if (distanceFromTarget < 1.0) {
      calculatedStrength = 50;
    } else if (distanceFromTarget < 2.0) {
      calculatedStrength = 30;
    } else if (distanceFromTarget < 5.0) {
      calculatedStrength = 15;
    } else {
      calculatedStrength = 5;
    }
    
    // Add some randomness to make it feel more realistic
    const randomVariation = Math.random() * 10 - 5;
    setSignalStrength(Math.max(0, Math.min(100, calculatedStrength + randomVariation)));
    
    // Generate signal noise
    if (isPlaying) {
      generateSignalNoise(calculatedStrength);
    } else {
      setSignalNoise('');
    }
    
    // Check if we've found the signal
    if (calculatedStrength > SIGNAL_THRESHOLD && isPlaying) {
      if (!decodedMessage) {
        playSound('beep', 'success');
        revealDecodedMessage();
      }
    } else {
      setDecodedMessage('');
    }
  }, [frequency, isPlaying, isVisible]);

  // Generate random noise for the signal
  const generateSignalNoise = (strength: number) => {
    if (strength > SIGNAL_THRESHOLD) {
      // Clear signal, less noise
      setSignalNoise("...SIGNAL DETECTED...");
    } else if (strength > 60) {
      // Some static with partial message
      setSignalNoise("...partial sig...dzzt...transmission...krrr...");
    } else if (strength > 30) {
      // Mostly static
      setSignalNoise("...krrr...dzzt...static...bzzt...");
    } else {
      // Just static
      setSignalNoise("...static...krrr...bzzt...dzzt...");
    }
  };
  
  // Simulate decoding the message
  const revealDecodedMessage = () => {
    const message = 
      "4 8 15 16 23 42...SYSTEM FAILURE...4 8 15 16 23 42...";
    
    // Show the message character by character
    let currentMessage = '';
    let charIndex = 0;
    
    const interval = setInterval(() => {
      currentMessage += message.charAt(charIndex);
      setDecodedMessage(currentMessage);
      charIndex++;
      
      if (charIndex >= message.length) {
        clearInterval(interval);
        
        // Mark as completed after the message is fully shown
        setTimeout(() => {
          setIsCompleted(true);
          playSound('success');
          setTimeout(() => {
            onComplete();
          }, 2000);
        }, 1000);
      }
    }, 100);
  };
  
  const changeFrequency = (amount: number) => {
    setFrequency(prev => {
      // Keep frequency in valid FM range (88.0 - 108.0) + special bands
      const newFreq = Math.max(88.0, Math.min(120.0, prev + amount));
      // Round to 1 decimal place
      return Math.round(newFreq * 10) / 10;
    });
    playSound('beep', 'short');
  };
  
  const togglePlayback = () => {
    setIsPlaying(prev => !prev);
    playSound('click');
  };
  
  const adjustVolume = (newVolume: number) => {
    setVolume(Math.max(0, Math.min(100, newVolume)));
  };
  
  const toggleBookmark = () => {
    if (bookmarkedFrequencies.includes(frequency)) {
      // Remove bookmark
      setBookmarkedFrequencies(prev => prev.filter(f => f !== frequency));
    } else {
      // Add bookmark
      setBookmarkedFrequencies(prev => [...prev, frequency]);
    }
    playSound('click');
  };
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-[hsl(var(--dharma-black))] border-2 border-[hsl(var(--dharma-gray))] p-5 rounded max-w-xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[hsl(var(--dharma-green))] font-terminal text-lg flex items-center gap-2">
            <Radio className="h-5 w-5" />
            DHARMA RADIO RECEIVER
          </h2>
          <button 
            onClick={onClose}
            className="text-[hsl(var(--dharma-gray))] hover:text-[hsl(var(--dharma-red))]"
          >
            ✕
          </button>
        </div>
        
        {/* Radio display */}
        <div className="mb-6 bg-[hsla(var(--dharma-gray),0.1)] p-3 border border-[hsl(var(--dharma-gray))]">
          <div className="flex justify-between items-center">
            <div className="font-mono text-xl text-[hsl(var(--dharma-green))]">
              {frequency.toFixed(1)} FM
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[hsl(var(--dharma-gray))]">SIGNAL</span>
              <div className="w-24 h-3 bg-[hsla(var(--dharma-gray),0.3)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[hsl(var(--dharma-green))]" 
                  style={{ width: `${signalStrength}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Signal display */}
          <div className="mt-3 h-16 bg-[hsla(var(--dharma-black),0.5)] border border-[hsl(var(--dharma-gray))] p-2 font-mono text-xs text-[hsl(var(--dharma-amber))] overflow-hidden">
            {isPlaying ? (
              <>
                {decodedMessage ? (
                  <div className="animate-pulse">{decodedMessage}</div>
                ) : (
                  <div className="animate-pulse">{signalNoise}</div>
                )}
              </>
            ) : (
              <div className="text-[hsl(var(--dharma-gray))]">* RADIO PLAYBACK STOPPED *</div>
            )}
          </div>
        </div>
        
        {/* Controls */}
        <div className="grid grid-cols-2 gap-4">
          {/* Frequency controls */}
          <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 border border-[hsl(var(--dharma-gray))]">
            <h3 className="text-[hsl(var(--dharma-white))] text-xs mb-2">FREQUENCY TUNING</h3>
            
            <div className="flex justify-between items-center gap-2 mb-3">
              <button 
                onClick={() => changeFrequency(-1.0)}
                className="px-2 py-1 bg-[hsla(var(--dharma-gray),0.2)] text-[hsl(var(--dharma-white))] border border-[hsl(var(--dharma-gray))]"
              >
                <SkipBack className="h-3 w-3" />
              </button>
              
              <button 
                onClick={() => changeFrequency(-0.1)}
                className="px-2 py-1 bg-[hsla(var(--dharma-gray),0.2)] text-[hsl(var(--dharma-white))] border border-[hsl(var(--dharma-gray))]"
              >
                -0.1
              </button>
              
              <div className="px-2 py-1 bg-[hsla(var(--dharma-gray),0.05)] border border-[hsl(var(--dharma-gray))] text-center text-[hsl(var(--dharma-green))]">
                {frequency.toFixed(1)}
              </div>
              
              <button 
                onClick={() => changeFrequency(0.1)}
                className="px-2 py-1 bg-[hsla(var(--dharma-gray),0.2)] text-[hsl(var(--dharma-white))] border border-[hsl(var(--dharma-gray))]"
              >
                +0.1
              </button>
              
              <button 
                onClick={() => changeFrequency(1.0)}
                className="px-2 py-1 bg-[hsla(var(--dharma-gray),0.2)] text-[hsl(var(--dharma-white))] border border-[hsl(var(--dharma-gray))]"
              >
                <SkipForward className="h-3 w-3" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleBookmark}
                className="px-2 py-1 bg-[hsla(var(--dharma-gray),0.2)] border border-[hsl(var(--dharma-gray))]"
              >
                {bookmarkedFrequencies.includes(frequency) ? (
                  <BookmarkCheck className="h-3 w-3 text-[hsl(var(--dharma-green))]" />
                ) : (
                  <Bookmark className="h-3 w-3 text-[hsl(var(--dharma-white))]" />
                )}
              </button>
              
              <div className="text-xs text-[hsl(var(--dharma-gray))]">
                {bookmarkedFrequencies.includes(frequency) ? 'Frequency bookmarked' : 'Bookmark frequency'}
              </div>
            </div>
            
            {/* Frequency range hint */}
            <div className="mt-4 bg-[hsla(var(--dharma-gray),0.05)] p-2 border border-[hsl(var(--dharma-amber))]">
              <div className="flex items-start gap-1">
                <Info className="h-3 w-3 mt-0.5 text-[hsl(var(--dharma-amber))]" />
                <p className="text-[hsl(var(--dharma-amber))] text-xs">
                  According to DHARMA protocols, special broadcasts may occur outside standard FM range (88-108 MHz).
                </p>
              </div>
            </div>
          </div>
          
          {/* Playback controls */}
          <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 border border-[hsl(var(--dharma-gray))]">
            <h3 className="text-[hsl(var(--dharma-white))] text-xs mb-2">PLAYBACK CONTROLS</h3>
            
            <div className="flex justify-center items-center gap-4 mb-4">
              <button 
                onClick={togglePlayback}
                className="p-3 bg-[hsla(var(--dharma-green),0.1)] text-[hsl(var(--dharma-green))] border border-[hsl(var(--dharma-green))] rounded-full"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
            </div>
            
            <div className="mb-2">
              <h4 className="text-[hsl(var(--dharma-white))] text-xs flex items-center gap-1 mb-1">
                <Volume2 className="h-3 w-3" />
                VOLUME
              </h4>
              
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => adjustVolume(parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-[hsl(var(--dharma-white))]">
                  {volume}%
                </span>
              </div>
            </div>
            
            {/* Bookmarked frequencies */}
            <div className="mt-3">
              <h4 className="text-[hsl(var(--dharma-white))] text-xs mb-1">BOOKMARKED FREQUENCIES</h4>
              
              <div className="bg-[hsla(var(--dharma-gray),0.05)] border border-[hsl(var(--dharma-gray))] p-2 min-h-[60px] text-xs">
                {bookmarkedFrequencies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {bookmarkedFrequencies.map((freq) => (
                      <button
                        key={freq}
                        onClick={() => setFrequency(freq)}
                        className={`px-2 py-0.5 text-xs border ${
                          frequency === freq
                            ? 'bg-[hsla(var(--dharma-green),0.2)] text-[hsl(var(--dharma-green))] border-[hsl(var(--dharma-green))]'
                            : 'bg-[hsla(var(--dharma-gray),0.1)] text-[hsl(var(--dharma-white))] border-[hsl(var(--dharma-gray))]'
                        }`}
                      >
                        {freq.toFixed(1)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-[hsl(var(--dharma-gray))] flex items-center justify-center h-full">
                    No frequencies bookmarked
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Success message */}
        {isCompleted && (
          <div className="mt-4 p-3 bg-[hsla(var(--dharma-green),0.1)] border border-[hsl(var(--dharma-bright-green))] text-center">
            <p className="text-[hsl(var(--dharma-bright-green))] text-sm">
              TRANSMISSION DECODED SUCCESSFULLY
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RadioPuzzle;