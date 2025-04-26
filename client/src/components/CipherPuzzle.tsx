import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Loader2, HelpCircle, AlertCircle } from 'lucide-react';
import { playSound } from '@/lib/audio';

interface CipherPuzzleProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const CipherPuzzle: React.FC<CipherPuzzleProps> = ({ isVisible, onClose, onComplete }) => {
  const [cipherText, setCipherText] = useState<string>('');
  const [userKey, setUserKey] = useState<string>('');
  const [decodedText, setDecodedText] = useState<string>('');
  const [isDecoding, setIsDecoding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [discoveredClues, setDiscoveredClues] = useState<string[]>([]);
  
  // The cipher uses the Vigenère cipher
  // The encoded text is "THEVALENZIETTICORESEQUENCEMUSTNOTBECHANGEDTHISISLANDISTHEKEYTOSAVINGHUMANITY"
  // The correct key is "DHARMA" (or any of the DHARMA stations)
  
  const ENCODED_TEXT = "WOIZNPHROLVQFVUHXHTHRPQQXBWQRXFKLEKIQHGWMVMWODRVZMIVEZRGVRWSTHSYRQLWCY";
  const CORRECT_KEYS = ['DHARMA', 'SWAN', 'PEARL', 'FLAME', 'ARROW', 'STAFF', 'ORCHID', 'LAMP POST'];
  const DECODED_ANSWER = "THEVALENZIETTICORESEQUENCEMUSTNOTBECHANGEDTHISISLANDISTHEKEYTOSAVINGHUMANITY";
  
  // Initialize with cipher text
  useEffect(() => {
    setCipherText(ENCODED_TEXT);
  }, []);
  
  // Add new clues as the user tries more
  useEffect(() => {
    if (attempts === 2 && !discoveredClues.includes('station_names')) {
      setDiscoveredClues(prev => [...prev, 'station_names']);
      playSound('beep');
    }
    
    if (attempts === 4 && !discoveredClues.includes('dharma_logo')) {
      setDiscoveredClues(prev => [...prev, 'dharma_logo']);
      playSound('beep');
    }
  }, [attempts, discoveredClues]);
  
  // Vigenère cipher decoding function
  const decodeCipher = (ciphertext: string, key: string): string => {
    let result = '';
    
    for (let i = 0; i < ciphertext.length; i++) {
      const cChar = ciphertext.charAt(i);
      
      // Only process uppercase letters
      if (cChar.match(/[A-Z]/)) {
        const cCode = ciphertext.charCodeAt(i) - 65;
        const kCode = key.charCodeAt(i % key.length) - 65;
        // Vigenère decoding: (c - k + 26) % 26
        const pCode = (cCode - kCode + 26) % 26;
        result += String.fromCharCode(pCode + 65);
      } else {
        // Pass through non-letter characters
        result += cChar;
      }
    }
    
    return result;
  };
  
  // Handle decoding attempt
  const handleDecode = () => {
    if (!userKey.trim()) {
      setError('Please enter a decryption key.');
      return;
    }
    
    setIsDecoding(true);
    setError(null);
    
    // Prepare key (uppercase, letters only)
    const formattedKey = userKey.toUpperCase().replace(/[^A-Z]/g, '');
    
    // Simulate a delay for decoding
    setTimeout(() => {
      try {
        const result = decodeCipher(cipherText, formattedKey);
        setDecodedText(result);
        
        // Check if the key is one of the correct keys
        if (CORRECT_KEYS.includes(formattedKey)) {
          setIsCorrect(true);
          playSound('success');
          setTimeout(() => {
            onComplete();
          }, 3000);
        } else {
          setAttempts(prev => prev + 1);
        }
      } catch (err) {
        setError('Decoding failed. Please try a different key.');
        playSound('fail');
      } finally {
        setIsDecoding(false);
      }
    }, 1500);
  };
  
  // Reset the decoder
  const handleReset = () => {
    setUserKey('');
    setDecodedText('');
    setError(null);
    setIsDecoding(false);
  };
  
  // Toggle hint visibility
  const toggleHint = () => {
    setShowHint(!showHint);
    playSound('beep', 'short');
  };
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-[hsl(var(--dharma-black))] border-2 border-[hsl(var(--dharma-gray))] p-5 rounded max-w-2xl w-full relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[hsl(var(--dharma-green))] font-terminal text-lg">DHARMA CIPHER DECODER</h2>
          <button 
            onClick={onClose}
            className="text-[hsl(var(--dharma-gray))] hover:text-[hsl(var(--dharma-red))]"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left side - Decoder */}
          <div className="bg-[hsla(var(--dharma-gray),0.1)] p-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-sm">ENCRYPTED MESSAGE</h3>
              <FileSpreadsheet className="w-4 h-4 text-[hsl(var(--dharma-amber))]" />
            </div>
            
            {/* Cipher text display */}
            <div className="bg-[hsla(var(--dharma-green),0.05)] border border-[hsl(var(--dharma-gray))] p-3 mb-4 h-28 overflow-y-auto">
              <pre className="text-[hsl(var(--dharma-green))] font-terminal text-xs leading-relaxed break-all">
                {cipherText}
              </pre>
            </div>
            
            {/* Decryption controls */}
            <div className="mb-4">
              <label className="text-[hsl(var(--dharma-white))] font-terminal text-xs mb-1 block">
                DECRYPTION KEY:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userKey}
                  onChange={(e) => setUserKey(e.target.value)}
                  disabled={isDecoding || isCorrect}
                  className="flex-1 bg-[hsla(var(--dharma-black),0.5)] border border-[hsl(var(--dharma-gray))] p-2 text-sm text-[hsl(var(--dharma-green))]"
                  placeholder="Enter key"
                />
                <button
                  onClick={handleDecode}
                  disabled={isDecoding || !userKey.trim() || isCorrect}
                  className={`px-3 py-1 border text-xs flex items-center gap-1
                    ${isDecoding || !userKey.trim() || isCorrect ? 
                      'bg-[hsla(var(--dharma-gray),0.05)] border-[hsl(var(--dharma-gray))] text-[hsl(var(--dharma-gray))]' : 
                      'bg-[hsla(var(--dharma-green),0.1)] border-[hsl(var(--dharma-green))] text-[hsl(var(--dharma-green))] hover:bg-[hsla(var(--dharma-green),0.2)]'
                    }`}
                >
                  {isDecoding ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      DECODING
                    </>
                  ) : 'DECODE'}
                </button>
              </div>
            </div>
            
            {/* Decoded result */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-xs">DECODED MESSAGE</h3>
                <button
                  onClick={handleReset}
                  disabled={isDecoding || !decodedText || isCorrect}
                  className={`text-xs 
                    ${isDecoding || !decodedText || isCorrect ? 
                      'text-[hsl(var(--dharma-gray))]' : 
                      'text-[hsl(var(--dharma-amber))] hover:underline'
                    }`}
                >
                  RESET
                </button>
              </div>
              <div className="bg-[hsla(var(--dharma-green),0.05)] border border-[hsl(var(--dharma-gray))] p-3 h-28 overflow-y-auto">
                {isDecoding ? (
                  <div className="h-full flex items-center justify-center text-[hsl(var(--dharma-gray))] text-xs">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      DECODING MESSAGE...
                    </span>
                  </div>
                ) : decodedText ? (
                  <pre className={`font-terminal text-xs leading-relaxed break-all 
                    ${isCorrect ? 'text-[hsl(var(--dharma-bright-green))]' : 'text-[hsl(var(--dharma-amber))]'}`}>
                    {decodedText}
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-[hsl(var(--dharma-gray))] text-xs">
                    NO DECODED OUTPUT
                  </div>
                )}
              </div>
            </div>
            
            {/* Status messages */}
            {error && (
              <div className="text-[hsl(var(--dharma-red))] text-xs mb-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </div>
            )}
            
            {isCorrect && (
              <div className="text-[hsl(var(--dharma-bright-green))] text-xs mb-2">
                CORRECT DECRYPTION. ACCESSING VALENZETTI RESEARCH FILES...
              </div>
            )}
            
            {/* Hint toggler */}
            <button
              onClick={toggleHint}
              className="text-xs text-[hsl(var(--dharma-amber))] flex items-center gap-1 hover:underline"
            >
              <HelpCircle className="w-3 h-3" />
              {showHint ? 'HIDE HINT' : 'SHOW HINT'}
            </button>
          </div>
          
          {/* Right side - Clues and Hints */}
          <div className="space-y-4">
            {/* Hints panel */}
            {showHint && (
              <div className="bg-[hsla(var(--dharma-amber),0.05)] border border-[hsl(var(--dharma-amber))] p-3 rounded">
                <h3 className="text-[hsl(var(--dharma-amber))] font-terminal text-sm mb-2">DECRYPTION HINTS</h3>
                <ul className="text-xs text-[hsl(var(--dharma-white))] space-y-2">
                  <li>• This appears to be a Vigenère cipher, which requires a keyword for decryption.</li>
                  <li>• The keyword is likely related to the DHARMA Initiative.</li>
                  <li>• The cipher might use a key that represents the Initiative or one of its stations.</li>
                  <li>• Try various DHARMA-related terms as decryption keys.</li>
                </ul>
              </div>
            )}
            
            {/* Discovered clues */}
            <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 rounded">
              <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-sm mb-2">RESEARCH NOTES</h3>
              
              {discoveredClues.length > 0 ? (
                <div className="space-y-3">
                  {discoveredClues.includes('station_names') && (
                    <div className="text-xs">
                      <h4 className="text-[hsl(var(--dharma-green))] mb-1">DHARMA STATION LIST EXCERPT:</h4>
                      <p className="text-[hsl(var(--dharma-white))]">
                        Known stations include: Swan, Pearl, Flame, Arrow, Staff, Orchid, and Lamp Post (mainland monitoring station).
                      </p>
                    </div>
                  )}
                  
                  {discoveredClues.includes('dharma_logo') && (
                    <div className="text-xs">
                      <h4 className="text-[hsl(var(--dharma-green))] mb-1">FROM HORACE GOODSPEED'S JOURNAL:</h4>
                      <p className="text-[hsl(var(--dharma-white))]">
                        "The DHARMA logo represents our mission. Each station has its own distinct variation, but they all carry the same core design and purpose."
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-16 flex items-center justify-center text-[hsl(var(--dharma-gray))] text-xs">
                  NO ADDITIONAL NOTES YET
                </div>
              )}
            </div>
            
            {/* Valenzetti information */}
            <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 rounded">
              <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-sm mb-2">VALENZETTI EQUATION</h3>
              <div className="text-xs text-[hsl(var(--dharma-green))]">
                <p className="mb-2">
                  The Valenzetti Equation was developed to predict the end of humanity. Its core values are:
                </p>
                <div className="text-center text-xl font-bold mb-2">
                  4 8 15 16 23 42
                </div>
                <p>
                  DHARMA Initiative's primary goal is to change these numbers to prevent human extinction.
                </p>
              </div>
            </div>
            
            {/* Answer verification */}
            {decodedText && !isCorrect && attempts > 1 && (
              <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 rounded">
                <h3 className="text-[hsl(var(--dharma-white))] font-terminal text-sm mb-2">PATTERN ANALYSIS</h3>
                <p className="text-xs text-[hsl(var(--dharma-amber))]">
                  {decodedText.includes('VALENZETTI') ?
                    "Partial match detected. The word 'VALENZETTI' appears in the decryption. You're getting closer." :
                    "No recognizable patterns in the current decryption. Try another key."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CipherPuzzle;