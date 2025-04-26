import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, Waves, Volume2, VolumeX, Play, Pause, RotateCcw, Loader2 } from 'lucide-react';
import { playSound } from '@/lib/audio';

interface RadioPuzzleProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const RadioPuzzle: React.FC<RadioPuzzleProps> = ({ isVisible, onClose, onComplete }) => {
  const [frequency, setFrequency] = useState(42.00);
  const [volume, setVolume] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [foundSignal, setFoundSignal] = useState(false);
  const [signalQuality, setSignalQuality] = useState(0);
  const [message, setMessage] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  
  const dialRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // The correct frequency is 108.00 MHz
  const CORRECT_FREQUENCY = 108.00;
  const SIGNAL_THRESHOLD = 0.5; // How close to the correct frequency to get a signal
  const CORRECT_ANSWER = 'rousseau';
  
  // Frequency change via dial turning
  const handleDialMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dialRef.current) return;
    
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const degrees = angle * (180 / Math.PI);
    
    // Map the angle to a frequency range (30.00 - 150.00 MHz)
    let newFrequency = Math.abs(((degrees + 180) / 360) * 120 + 30);
    newFrequency = Math.round(newFrequency * 100) / 100; // Round to 2 decimal points
    
    setFrequency(newFrequency);
    playSound('beep', 'short');
    
    // Calculate signal quality based on how close to the correct frequency
    const distance = Math.abs(CORRECT_FREQUENCY - newFrequency);
    let quality = 0;
    
    if (distance < SIGNAL_THRESHOLD) {
      // Signal found - closer = better quality
      quality = 1 - (distance / SIGNAL_THRESHOLD);
      setFoundSignal(true);
    } else {
      setFoundSignal(false);
    }
    
    setSignalQuality(quality);
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseInt(e.target.value));
    
    if (audioRef.current) {
      audioRef.current.volume = parseInt(e.target.value) / 10;
    }
  };
  
  // Toggle audio playback
  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Decode the message (simulated process)
  const decodeMessage = () => {
    if (!foundSignal) return;
    
    setIsDecoding(true);
    
    // Simulated decoding process
    setTimeout(() => {
      setMessage(
        "# 16 YEARS ON ISLAND\n" +
        "# TEAM DEAD\n" +
        "# CHANGED THE NUMBERS\n" +
        "# MY NAME IS DANIELLE\n" +
        `# ${CORRECT_ANSWER.toUpperCase()}\n` +
        "# IT'S COMING"
      );
      
      setIsDecoding(false);
      playSound('success');
      
      // Add to notes
      setNotes(prev => [...prev, "Decoded distress signal from French woman. Message mentions she's been on the island for 16 years, her team is dead, and she 'changed the numbers'. She mentions something is coming."]);
    }, 3000);
  };
  
  // Submit answer
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (answer.toLowerCase() === CORRECT_ANSWER) {
      setIsCorrect(true);
      playSound('success');
      setTimeout(() => {
        onComplete();
      }, 2000);
    } else {
      playSound('fail');
      setAttempts(prev => prev + 1);
      setAnswer('');
    }
  };
  
  // Add notes about observations
  const addNote = (note: string) => {
    setNotes(prev => [...prev, note]);
    playSound('beep', 'short');
  };
  
  // Show hints based on number of attempts
  useEffect(() => {
    if (attempts === 2) {
      setHint("Hint: The woman's last name appears in the decoded message.");
    } else if (attempts === 4) {
      setHint("Hint: The French woman's last name is Rousseau.");
    }
  }, [attempts]);
  
  // Simulate static noise when playing
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (foundSignal) {
          // If signal found, play less static
          if (Math.random() > 0.7) {
            playSound('static', 'short');
          }
        } else {
          // More static when no signal
          if (Math.random() > 0.3) {
            playSound('static', 'short');
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, foundSignal]);
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-[hsl(var(--dharma-black))] border-2 border-[hsl(var(--dharma-gray))] p-5 rounded max-w-lg w-full relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[hsl(var(--dharma-green))] font-terminal text-lg">RADIO SIGNAL ANALYSIS</h2>
          <button 
            onClick={onClose}
            className="text-[hsl(var(--dharma-gray))] hover:text-[hsl(var(--dharma-red))]"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Radio panel */}
          <div className="bg-[hsla(var(--dharma-gray),0.1)] p-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-sm">RADIO RECEIVER</h3>
              <Radio className="w-4 h-4 text-[hsl(var(--dharma-red))]" />
            </div>
            
            {/* Frequency display */}
            <div className="bg-[hsla(var(--dharma-green),0.1)] p-2 border border-[hsl(var(--dharma-gray))] mb-4 flex justify-between items-center">
              <span className="text-[hsl(var(--dharma-green))] font-terminal text-sm">FM</span>
              <span className="text-[hsl(var(--dharma-green))] font-terminal text-xl">{frequency.toFixed(2)}</span>
              <span className="text-[hsl(var(--dharma-green))] font-terminal text-sm">MHz</span>
            </div>
            
            {/* Tuning dial */}
            <div className="flex justify-center mb-4">
              <div 
                ref={dialRef}
                className="w-20 h-20 bg-[hsla(var(--dharma-gray),0.2)] rounded-full border-2 border-[hsl(var(--dharma-gray))] relative cursor-pointer"
                onMouseMove={handleDialMove}
              >
                <div className="absolute top-0 left-1/2 w-1 h-4 bg-[hsl(var(--dharma-green))] transform -translate-x-1/2"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[hsl(var(--dharma-green))] text-xs">TUNE</span>
                </div>
              </div>
            </div>
            
            {/* Volume control */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <VolumeX className="w-4 h-4 text-[hsl(var(--dharma-green))]" />
                <span className="text-[hsl(var(--dharma-green))] text-xs">VOLUME</span>
                <Volume2 className="w-4 h-4 text-[hsl(var(--dharma-green))]" />
              </div>
              <input 
                type="range" 
                min="0" 
                max="10" 
                value={volume} 
                onChange={handleVolumeChange}
                className="w-full accent-[hsl(var(--dharma-green))]"
              />
            </div>
            
            {/* Playback controls */}
            <div className="flex justify-between items-center">
              <button 
                onClick={togglePlayback}
                className="px-3 py-1 bg-[hsla(var(--dharma-gray),0.1)] border border-[hsl(var(--dharma-gray))] flex items-center gap-2 text-[hsl(var(--dharma-green))] hover:bg-[hsla(var(--dharma-gray),0.2)]"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="text-xs">{isPlaying ? 'STOP' : 'PLAY'}</span>
              </button>
              
              <div className="flex items-center gap-1">
                <Waves className={`w-4 h-4 ${foundSignal ? 'text-[hsl(var(--dharma-bright-green))]' : 'text-[hsl(var(--dharma-gray))]'}`} />
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className={`w-1 ${5 - bar <= Math.ceil(signalQuality * 4) ? 'bg-[hsl(var(--dharma-bright-green))]' : 'bg-[hsl(var(--dharma-gray))]'}`}
                    style={{ height: `${bar * 3 + 2}px` }}
                  ></div>
                ))}
              </div>
              
              <button
                onClick={decodeMessage}
                disabled={!foundSignal || isDecoding || message !== ''}
                className={`px-3 py-1 border text-xs
                  ${!foundSignal || isDecoding || message !== '' ? 
                    'bg-[hsla(var(--dharma-gray),0.05)] border-[hsl(var(--dharma-gray))] text-[hsl(var(--dharma-gray))]' : 
                    'bg-[hsla(var(--dharma-green),0.1)] border-[hsl(var(--dharma-green))] text-[hsl(var(--dharma-green))] hover:bg-[hsla(var(--dharma-green),0.2)]'
                  }`}
              >
                {isDecoding ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    DECODING
                  </span>
                ) : 'DECODE'}
              </button>
            </div>
            
            {/* Hidden audio element */}
            <audio ref={audioRef} loop src="/sounds/radio-static.mp3" />
          </div>
          
          {/* Message and notes panel */}
          <div className="space-y-4">
            {/* Message display */}
            <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 rounded border border-[hsl(var(--dharma-gray))]">
              <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-sm mb-2">DECODED TRANSMISSION</h3>
              {message ? (
                <div className="h-24 overflow-y-auto font-terminal text-xs text-[hsl(var(--dharma-bright-green))] whitespace-pre">
                  {message}
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center text-[hsl(var(--dharma-gray))] text-xs">
                  {isDecoding ? 
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      DECODING SIGNAL...
                    </span> : 
                    'NO MESSAGE DECODED'
                  }
                </div>
              )}
            </div>
            
            {/* Notes section */}
            <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 rounded border border-[hsl(var(--dharma-gray))]">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-sm">RESEARCH NOTES</h3>
                <button
                  onClick={() => addNote("Signal appears strongest at 108.00 MHz. This matches the 108 minutes on the countdown timer. Possible connection?")}
                  className="text-xs text-[hsl(var(--dharma-green))] hover:underline"
                >
                  + ADD NOTE
                </button>
              </div>
              
              <div className="h-16 overflow-y-auto text-xs text-[hsl(var(--dharma-amber))]">
                {notes.length > 0 ? (
                  <ul className="space-y-1 list-disc pl-4">
                    {notes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-full flex items-center justify-center text-[hsl(var(--dharma-gray))]">
                    NO NOTES YET
                  </div>
                )}
              </div>
            </div>
            
            {/* Answer submission */}
            {message && (
              <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 rounded border border-[hsl(var(--dharma-gray))]">
                <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-sm mb-2">SECURITY QUESTION</h3>
                <p className="text-xs text-[hsl(var(--dharma-green))] mb-2">
                  What is the last name of the woman who sent this transmission?
                </p>
                
                {isCorrect ? (
                  <div className="text-[hsl(var(--dharma-bright-green))] text-xs">
                    CORRECT. ACCESSING SECURED FILES...
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="flex-1 bg-[hsla(var(--dharma-black),0.3)] border border-[hsl(var(--dharma-gray))] p-1 text-xs text-[hsl(var(--dharma-green))]"
                      placeholder="Enter last name"
                    />
                    <button
                      type="submit"
                      className="px-2 py-1 bg-[hsla(var(--dharma-green),0.1)] border border-[hsl(var(--dharma-green))] text-xs text-[hsl(var(--dharma-green))] hover:bg-[hsla(var(--dharma-green),0.2)]"
                    >
                      SUBMIT
                    </button>
                  </form>
                )}
                
                {hint && (
                  <div className="mt-2 text-[hsl(var(--dharma-amber))] text-xs">
                    {hint}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RadioPuzzle;