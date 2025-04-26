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
  Activity,
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
    NUMBERS: 4.8,    // The numbers broadcast
    MORSE: 15.16,    // Morse code transmission
    VOICE: 23.42,    // Backmasked voice recording
    QR: 108.0        // Tones that create a QR code in spectrogram
  };
  
  // Signal quality levels
  const SIGNAL_THRESHOLD = 80;   // Clear signal threshold
  const SIGNAL_RECORD_THRESHOLD = 70;  // Good enough to record
  
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
    // Determine which frequency we're closest to for specialized messages
    const closestFreq = getClosestFrequency();
    
    if (strength > SIGNAL_THRESHOLD) {
      // Clear signal with specialized messages based on frequency
      if (closestFreq === FREQUENCIES.NUMBERS) {
        setSignalNoise("...4 8 15 16 23 42...EXECUTING...4 8 15 16 23 42...");
      } else if (closestFreq === FREQUENCIES.MORSE) {
        setSignalNoise("...-- -- --- .-. ... . / -.-. --- -.. . / -.. . - . -.-. - . -.. ...");
      } else if (closestFreq === FREQUENCIES.VOICE) {
        setSignalNoise("...reversed voice detected...analyzing patterns...");
      } else if (closestFreq === FREQUENCIES.QR) {
        setSignalNoise("...spectral data detected...apply signal analysis...");
      } else {
        setSignalNoise("...SIGNAL DETECTED...");
      }
    } else if (strength > SIGNAL_RECORD_THRESHOLD) {
      // Good enough to record but with some noise
      setSignalNoise(`...partial sig...dzzt...@${closestFreq.toFixed(2)} MHz...krrr...`);
    } else if (strength > 30) {
      // Mostly static
      setSignalNoise("...krrr...dzzt...static...bzzt...");
    } else {
      // Just static
      setSignalNoise("...static...krrr...bzzt...dzzt...");
    }
  };
  
  // Get closest frequency to tune
  const getClosestFrequency = (): number => {
    let nearestFrequency = FREQUENCIES.NUMBERS;
    let minDistance = Math.abs(frequency - FREQUENCIES.NUMBERS);
    
    for (const [_, value] of Object.entries(FREQUENCIES)) {
      const distance = Math.abs(frequency - value);
      if (distance < minDistance) {
        minDistance = distance;
        nearestFrequency = value;
      }
    }
    
    return nearestFrequency;
  };
  
  // Start recording the current frequency
  const startRecording = () => {
    // Check if signal is strong enough to record
    if (signalStrength < SIGNAL_RECORD_THRESHOLD) {
      // Signal too weak
      playSound('error');
      return;
    }
    
    setIsRecording(true);
    playSound('beep', 'warning');
    
    const closestFrequency = getClosestFrequency();
    let sampleType: 'morse' | 'voice' | 'tone' = 'morse';
    let sampleName = 'Unknown Transmission';
    let sampleClue = 'Signal requires further analysis.';
    
    // Determine sample type based on frequency
    if (closestFrequency === FREQUENCIES.NUMBERS) {
      sampleType = 'morse';
      sampleName = 'Numbers Broadcast';
      sampleClue = 'Sequence: 4 8 15 16 23 42. Repeating pattern detected.';
    } else if (closestFrequency === FREQUENCIES.MORSE) {
      sampleType = 'morse';
      sampleName = 'Morse Code Signal';
      sampleClue = 'Morse code appears to contain letters: BLACKROCKSHIPS';
    } else if (closestFrequency === FREQUENCIES.VOICE) {
      sampleType = 'voice';
      sampleName = 'Reversed Voice Recording';
      sampleClue = 'Reversed audio contains coordinates. Try playing backwards.';
    } else if (closestFrequency === FREQUENCIES.QR) {
      sampleType = 'tone';
      sampleName = 'Spectral Data Pattern';
      sampleClue = 'Signal contains encoded data visible in spectrogram.';
    }
    
    // Simulate recording progress
    setTimeout(() => {
      setIsRecording(false);
      playSound('success');
      
      // Add the sample to recorded samples
      const newSample: AudioSample = {
        id: `sample-${Date.now()}`,
        frequency: closestFrequency,
        name: sampleName,
        type: sampleType,
        description: `Recorded at ${closestFrequency.toFixed(2)} MHz`,
        isDecoded: false,
        clue: sampleClue
      };
      
      setRecordedSamples(prev => [...prev, newSample]);
      
      // Show a hint to user to check the Analysis tab
      setAnnotationText('Sample recorded. Switch to Analysis tab to examine.');
      setTimeout(() => setAnnotationText(''), 3000);
      
      // Check if all necessary samples are recorded
      checkPuzzleCompletion();
    }, 3000);
  };
  
  // Handle the audio decoding/analysis
  const analyzeSample = (sampleId: string) => {
    setActiveAnalysisSample(sampleId);
    
    // Find the sample
    const sample = recordedSamples.find(s => s.id === sampleId);
    if (!sample) return;
    
    // Mark sample as decoded
    setRecordedSamples(prev => 
      prev.map(s => s.id === sampleId ? { ...s, isDecoded: true } : s)
    );
    
    // Simulate analysis of sample
    if (sample.type === 'morse') {
      // Draw morse code pattern on canvas
      drawMorsePattern();
    } else if (sample.type === 'voice') {
      // Draw waveform for voice recording
      drawVoiceWaveform();
    } else if (sample.type === 'tone') {
      // Draw spectrogram
      setShowSpectrogram(true);
      drawSpectrogram();
    }
    
    // Check if puzzle is completed after analysis
    checkPuzzleCompletion();
  };
  
  // Draw morse code pattern on canvas
  const drawMorsePattern = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up styling
    ctx.fillStyle = '#4cd09f'; // dharma green
    
    // Draw morse pattern (this is simplified)
    const pattern = "... --- ... .... .. .--. .-- .-. . -.-. -.-"; // SOS SHIPWRECK
    const dotWidth = 6;
    const dashWidth = 18;
    const gap = 4;
    
    let x = 10;
    const y = canvas.height / 2;
    
    for (let i = 0; i < pattern.length; i++) {
      const char = pattern[i];
      
      if (char === '.') {
        ctx.fillRect(x, y - 3, dotWidth, 6);
        x += dotWidth + gap;
      } else if (char === '-') {
        ctx.fillRect(x, y - 3, dashWidth, 6);
        x += dashWidth + gap;
      } else if (char === ' ') {
        x += 3 * gap;
      }
    }
  };
  
  // Draw waveform for voice
  const drawVoiceWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up styling
    ctx.strokeStyle = '#4cd09f'; // dharma green
    ctx.lineWidth = 2;
    
    // Draw waveform (this is a simplified representation)
    ctx.beginPath();
    const centerY = canvas.height / 2;
    const amplitude = 40;
    
    for (let x = 0; x < canvas.width; x++) {
      // Create a reversed waveform pattern
      const y = centerY + amplitude * Math.sin(x * 0.05) * Math.cos(x * 0.01);
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Add text hint about reversed audio
    ctx.fillStyle = '#4cd09f';
    ctx.font = '12px monospace';
    ctx.fillText("Voice appears backwards. Try reversed playback.", 10, 20);
    ctx.fillText("Message: 'Find the black box at N 16° 23' W 4° 8'", 10, 40);
  };
  
  // Draw spectrogram showing a QR-like pattern
  const drawSpectrogram = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw a simplified QR-like pattern
    const size = 12;
    const cellSize = Math.min(canvas.width, canvas.height) / size;
    
    // QR code pattern
    const pattern = [
      "████████████",
      "█          █",
      "█ ████████ █",
      "█ █      █ █",
      "█ █ ████ █ █",
      "█ █ █  █ █ █",
      "█ █ █  █ █ █",
      "█ █ ████ █ █",
      "█ █      █ █",
      "█ ████████ █",
      "█          █",
      "████████████"
    ];
    
    // Draw pattern
    ctx.fillStyle = '#4cd09f';
    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        if (pattern[y][x] === '█') {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }
  };
  
  // Check if all required samples are decoded
  const checkPuzzleCompletion = () => {
    // Count how many unique frequencies we've recorded and decoded
    const decodedFrequencies = new Set();
    
    recordedSamples.forEach(sample => {
      if (sample.isDecoded) {
        decodedFrequencies.add(sample.frequency);
      }
    });
    
    // Check if we've decoded all required frequencies
    const requiredFrequencies = [
      FREQUENCIES.MORSE,
      FREQUENCIES.VOICE,
      FREQUENCIES.QR
    ];
    
    let allDecoded = true;
    requiredFrequencies.forEach(freq => {
      if (!decodedFrequencies.has(freq)) {
        allDecoded = false;
      }
    });
    
    if (allDecoded && decodedFrequencies.size >= 3) {
      // All necessary frequencies decoded
      revealDecodedMessage();
    }
  };
  
  // Simulate decoding the message
  const revealDecodedMessage = () => {
    // Generate the final message that combines all clues
    const message = 
      "BLACK BOX COORDINATES DECODED: N 16° 23' W 4° 8'";
    
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
      <div className="bg-[hsl(var(--dharma-black))] border-2 border-[hsl(var(--dharma-gray))] p-5 rounded max-w-3xl w-full">
        <div className="flex justify-between items-center mb-4">
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
        
        {/* Tabs */}
        <div className="flex border-b border-[hsl(var(--dharma-gray))] mb-4">
          <button
            onClick={() => setSelectedTab('radio')}
            className={`px-4 py-2 text-sm ${
              selectedTab === 'radio'
                ? 'bg-[hsla(var(--dharma-green),0.1)] text-[hsl(var(--dharma-green))] border-b-2 border-[hsl(var(--dharma-green))]'
                : 'text-[hsl(var(--dharma-gray))]'
            }`}
          >
            Radio Tuner
          </button>
          <button
            onClick={() => setSelectedTab('analysis')}
            className={`px-4 py-2 text-sm flex items-center gap-1 ${
              selectedTab === 'analysis'
                ? 'bg-[hsla(var(--dharma-green),0.1)] text-[hsl(var(--dharma-green))] border-b-2 border-[hsl(var(--dharma-green))]'
                : 'text-[hsl(var(--dharma-gray))]'
            }`}
          >
            <Activity className="h-3 w-3" />
            Signal Analysis
            {recordedSamples.length > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-[hsl(var(--dharma-green))] text-[hsl(var(--dharma-black))] text-xs flex items-center justify-center">
                {recordedSamples.length}
              </span>
            )}
          </button>
        </div>
        
        {/* Radio Tuner Tab */}
        {selectedTab === 'radio' && (
          <>
            {/* Radio display */}
            <div className="mb-4 bg-[hsla(var(--dharma-gray),0.1)] p-3 border border-[hsl(var(--dharma-gray))]">
              <div className="flex justify-between items-center">
                <div className="font-mono text-xl text-[hsl(var(--dharma-green))]">
                  {frequency.toFixed(1)} MHz
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
              
              {/* Signal display with animated waveform */}
              <div className="mt-3 h-16 bg-[hsla(var(--dharma-black),0.5)] border border-[hsl(var(--dharma-gray))] p-2 font-mono text-xs text-[hsl(var(--dharma-amber))] overflow-hidden relative">
                {/* Waveform visualization */}
                {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                    <svg width="100%" height="30" viewBox="0 0 300 30" preserveAspectRatio="none">
                      <path
                        d="M0,15 Q5,5 10,15 T20,15 T30,15 T40,15 T50,15 T60,15 T70,15 T80,15 T90,15 T100,15 T110,15 T120,15 T130,15 T140,15 T150,15 T160,15 T170,15 T180,15 T190,15 T200,15 T210,15 T220,15 T230,15 T240,15 T250,15 T260,15 T270,15 T280,15 T290,15 T300,15"
                        fill="none"
                        stroke="hsla(160, 57%, 55%, 0.15)"
                        strokeWidth="1"
                        className={signalStrength > 70 ? 'animate-waveform-strong' : 'animate-waveform-weak'}
                      />
                    </svg>
                  </div>
                )}
                
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
              
              {/* Recording button */}
              <div className="mt-2 flex justify-end">
                <button
                  onClick={startRecording}
                  disabled={isRecording || !isPlaying || signalStrength < SIGNAL_RECORD_THRESHOLD}
                  className={`px-3 py-1 text-xs flex items-center gap-1 ${
                    isRecording 
                      ? 'bg-[hsla(var(--dharma-red),0.2)] text-[hsl(var(--dharma-red))] border border-[hsl(var(--dharma-red))]'
                      : signalStrength >= SIGNAL_RECORD_THRESHOLD && isPlaying
                        ? 'bg-[hsla(var(--dharma-red),0.1)] text-[hsl(var(--dharma-red))] border border-[hsl(var(--dharma-red))] hover:bg-[hsla(var(--dharma-red),0.2)]'
                        : 'bg-[hsla(var(--dharma-gray),0.1)] text-[hsl(var(--dharma-gray))] border border-[hsl(var(--dharma-gray))] cursor-not-allowed'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <span className="animate-pulse">● RECORDING</span>
                    </>
                  ) : (
                    <>
                      <FileAudio className="h-3 w-3" />
                      RECORD SIGNAL
                    </>
                  )}
                </button>
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
          </>
        )}
        
        {/* Analysis Tab */}
        {selectedTab === 'analysis' && (
          <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 border border-[hsl(var(--dharma-gray))]">
            <h3 className="text-[hsl(var(--dharma-white))] text-xs mb-2 flex items-center gap-2">
              <Activity className="h-3 w-3" />
              SIGNAL ANALYSIS WORKBENCH
            </h3>
            
            {recordedSamples.length === 0 ? (
              <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-4">
                <Database className="h-10 w-10 text-[hsl(var(--dharma-gray))] mb-2" />
                <p className="text-[hsl(var(--dharma-gray))] text-sm">No recorded samples available.</p>
                <p className="text-[hsl(var(--dharma-gray))] text-xs mt-1">Switch to Radio Tuner, find a signal and click RECORD when signal strength is sufficient.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {/* Recorded samples list */}
                <div className="col-span-1 bg-[hsla(var(--dharma-gray),0.05)] border border-[hsl(var(--dharma-gray))] p-2 overflow-y-auto max-h-[300px]">
                  <h4 className="text-[hsl(var(--dharma-white))] text-xs mb-2">RECORDED SAMPLES</h4>
                  
                  <div className="space-y-2">
                    {recordedSamples.map((sample) => (
                      <button
                        key={sample.id}
                        onClick={() => analyzeSample(sample.id)}
                        className={`w-full text-left p-2 text-xs border ${
                          activeAnalysisSample === sample.id
                            ? 'bg-[hsla(var(--dharma-green),0.2)] text-[hsl(var(--dharma-green))] border-[hsl(var(--dharma-green))]'
                            : sample.isDecoded
                              ? 'bg-[hsla(var(--dharma-gray),0.1)] text-[hsl(var(--dharma-white))] border-[hsl(var(--dharma-gray))] border-l-[hsl(var(--dharma-green))] border-l-2'
                              : 'bg-[hsla(var(--dharma-gray),0.1)] text-[hsl(var(--dharma-white))] border-[hsl(var(--dharma-gray))]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{sample.name}</span>
                          {sample.isDecoded && <CheckCircle className="h-3 w-3 text-[hsl(var(--dharma-green))]" />}
                        </div>
                        <div className="text-[hsl(var(--dharma-gray))] mt-1">
                          {sample.frequency.toFixed(2)} MHz
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {sample.type === 'morse' && <Code className="h-3 w-3" />}
                          {sample.type === 'voice' && <Volume2 className="h-3 w-3" />}
                          {sample.type === 'tone' && <Activity className="h-3 w-3" />}
                          <span>{sample.type.toUpperCase()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Analysis area */}
                <div className="col-span-2 bg-[hsla(var(--dharma-black),0.2)] border border-[hsl(var(--dharma-gray))] p-3">
                  {activeAnalysisSample ? (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-[hsl(var(--dharma-green))] text-xs">
                          {recordedSamples.find(s => s.id === activeAnalysisSample)?.name}
                        </h4>
                        <div className="text-[hsl(var(--dharma-gray))] text-xs">
                          {recordedSamples.find(s => s.id === activeAnalysisSample)?.frequency.toFixed(2)} MHz
                        </div>
                      </div>
                      
                      {/* Canvas for visualizations */}
                      <div className="bg-[hsla(var(--dharma-black),0.5)] border border-[hsl(var(--dharma-gray))] mb-2">
                        <canvas 
                          ref={canvasRef} 
                          width="400" 
                          height="150" 
                          className="w-full"
                        ></canvas>
                      </div>
                      
                      {/* Analysis details */}
                      <div className="bg-[hsla(var(--dharma-gray),0.05)] p-2 border border-[hsl(var(--dharma-green))] text-xs">
                        <h5 className="text-[hsl(var(--dharma-green))] mb-1">ANALYSIS RESULTS:</h5>
                        <p className="text-[hsl(var(--dharma-white))]">
                          {recordedSamples.find(s => s.id === activeAnalysisSample)?.clue}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="min-h-[200px] flex flex-col items-center justify-center text-center">
                      <AlertCircle className="h-10 w-10 text-[hsl(var(--dharma-gray))] mb-2" />
                      <p className="text-[hsl(var(--dharma-gray))] text-sm">Select a recorded sample to analyze</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Annotation display */}
            {annotationText && (
              <div className="mt-3 p-2 bg-[hsla(var(--dharma-amber),0.1)] border border-[hsl(var(--dharma-amber))] text-[hsl(var(--dharma-amber))] text-xs animate-pulse">
                {annotationText}
              </div>
            )}
          </div>
        )}
        
        {/* Success message */}
        {isCompleted && (
          <div className="mt-4 p-3 bg-[hsla(var(--dharma-green),0.1)] border border-[hsl(var(--dharma-bright-green))] text-center">
            <p className="text-[hsl(var(--dharma-bright-green))] text-sm">
              BLACK BOX LOCATION COORDINATES DECODED
            </p>
            <p className="text-[hsl(var(--dharma-green))] text-xs mt-1">
              Location marked on island map.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RadioPuzzle;