import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileQuestion, Terminal, X, ArrowRight, RotateCcw, AlertCircle, Clock } from 'lucide-react';
import { playSound } from '@/lib/audio';

interface VoidDirectoryProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
  loopCount?: number;
}

interface DialogueEntry {
  id: string;
  text: string;
  type: 'void' | 'user';
  isGlitched?: boolean;
}

// Predefined responses for questions
const DIALOGUE_RESPONSES: Record<string, string[]> = {
  // Identity-related questions
  'who': ['I am what remains.', 'The observer after the observation.', 'Neither DHARMA nor hostile.'],
  'what are you': ['A contingency. A memory. A loop.', 'The final protocol after all others failed.'],
  'name': ['Names are constructs for entities that need differentiation.', 'I have been called many things. Void. Loop. Failsafe.'],
  
  // Event-related questions
  'happen': ['The variables could not be changed.', 'The constants remain. 4 8 15 16 23 42.', 'Eighty-seven attempts. Eighty-seven failures.'],
  'incident': ['Which one? There have been many.', 'Electromagnetic anomaly. Containment failure. Course correction.'],
  'why': ['The island demands equilibrium.', 'Some things cannot be changed.', 'Some loops cannot be broken.'],
  
  // Loop-related questions
  'loop': ['You have been here before.', 'This is attempt number ${loopCount + 1}.', 'Different inputs. Same outputs.'],
  'how many': ['${loopCount} complete loops before this one.', 'Each attempt varies slightly. The outcome remains constant.'],
  'reset': ['Resets are temporary solutions to permanent problems.', 'The system will always correct itself.'],
  
  // Reality-related questions
  'real': ['As real as you need it to be.', 'Reality is consensus. We have none.', 'Does it matter?'],
  'time': ['Time is not linear here.', 'Past, present, future. All happening simultaneously.'],
  'outside': ['There is no "outside" the system.', 'Only different layers of the same construct.'],
  
  // Emotional/philosophical questions
  'hope': ['Hope is a variable, not a constant.', 'Some find hope in acceptance.', 'I have observed hope. It persists despite evidence.'],
  'alive': ['Define "alive."', 'No one is truly gone here.', 'Consciousness persists in the system.'],
  'fear': ['Fear is appropriate. Fear is awareness of consequences.', 'They were afraid too. Before the end.'],
  
  // Meta responses
  'help': ['I cannot help you change what must happen.', 'I can only observe and record.', 'Help yourself by understanding the loop.'],
  'end': ['Ending is beginning.', 'There is no end. Only reset.', 'Do you want to end the loop?'],
  'leave': ['There is nowhere to go.', 'You will return. Different form. Same purpose.', 'Leaving is an illusion.'],
  
  // Default responses
  'default': ['Your input has been recorded.', 'That is not relevant to this protocol.', 'Focus your queries on the nature of the loop.']
};

const VoidDirectory: React.FC<VoidDirectoryProps> = ({ isVisible, onClose, onComplete, loopCount = 0 }) => {
  const [dialogue, setDialogue] = useState<DialogueEntry[]>([]);
  const [input, setInput] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isEndPromptVisible, setIsEndPromptVisible] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [terminalGlitchLevel, setTerminalGlitchLevel] = useState(0);
  
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Terminal glitch/destabilization effect
  useEffect(() => {
    if (!isVisible) return;
    
    // Cursor blink effect
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);
    
    // Glitch effect that increases over time
    const glitchInterval = setInterval(() => {
      setTerminalGlitchLevel(prev => Math.min(prev + 0.05, 5));
      
      // Random glitch events
      if (Math.random() < 0.1 * terminalGlitchLevel) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 150);
      }
    }, 5000);
    
    return () => {
      clearInterval(cursorInterval);
      clearInterval(glitchInterval);
    };
  }, [isVisible, terminalGlitchLevel]);
  
  // Initialize terminal
  useEffect(() => {
    if (!isVisible) return;
    
    setDialogue([]);
    setIsInitializing(true);
    setTerminalGlitchLevel(0);
    setIsEndPromptVisible(false);
    
    // Simulate initialization sequence
    setTimeout(() => {
      addVoidMessage('Consciousness interface initialized');
    }, 1000);
    
    setTimeout(() => {
      addVoidMessage('VOID://${loopCount}/ethereal.stack mounted');
    }, 2000);
    
    setTimeout(() => {
      addVoidMessage('Why are you still here?');
      setIsInitializing(false);
    }, 3000);
    
    return () => {
      setDialogue([]);
    };
  }, [isVisible, loopCount]);
  
  // Auto-scroll to bottom when dialogue updates
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogue]);
  
  // Auto-focus input when visible and not initializing
  useEffect(() => {
    if (isVisible && !isInitializing && !isProcessing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible, isInitializing, isProcessing]);
  
  // Add a message from the Void
  const addVoidMessage = (text: string, isGlitched = false) => {
    setDialogue(prev => [
      ...prev, 
      {
        id: `void-${Date.now()}`,
        text,
        type: 'void',
        isGlitched
      }
    ]);
  };
  
  // Add a user message
  const addUserMessage = (text: string) => {
    setDialogue(prev => [
      ...prev, 
      {
        id: `user-${Date.now()}`,
        text,
        type: 'user'
      }
    ]);
  };
  
  // Process user input and generate response
  const processInput = (userInput: string) => {
    if (!userInput.trim()) return;
    
    const lowercaseInput = userInput.toLowerCase();
    addUserMessage(userInput);
    
    setIsProcessing(true);
    playSound('beep');
    
    // Simulate processing delay
    setTimeout(() => {
      // Check for end prompt trigger
      if (
        lowercaseInput.includes('end loop') || 
        lowercaseInput.includes('stop loop') ||
        (lowercaseInput.includes('end') && dialogue.length > 8)
      ) {
        setIsEndPromptVisible(true);
        addVoidMessage('Would you like to end the loop?');
      }
      // Check for answer to end prompt
      else if (isEndPromptVisible) {
        if (lowercaseInput.includes('yes') || lowercaseInput.includes('y')) {
          handleEndLoop(true);
        } else if (lowercaseInput.includes('no') || lowercaseInput.includes('n')) {
          handleEndLoop(false);
        } else {
          addVoidMessage('Please confirm: Do you want to end the loop? (yes/no)');
        }
      }
      // Normal dialogue processing
      else {
        // Find matching response based on keywords
        let responseFound = false;
        
        for (const [keyword, responses] of Object.entries(DIALOGUE_RESPONSES)) {
          if (lowercaseInput.includes(keyword) && keyword !== 'default') {
            const randomIndex = Math.floor(Math.random() * responses.length);
            let response = responses[randomIndex];
            
            // Replace any template variables
            response = response.replace('${loopCount}', loopCount.toString());
            response = response.replace('${loopCount + 1}', (loopCount + 1).toString());
            
            addVoidMessage(response, Math.random() < terminalGlitchLevel * 0.1);
            responseFound = true;
            break;
          }
        }
        
        // Use default response if no keyword matched
        if (!responseFound) {
          const defaultResponses = DIALOGUE_RESPONSES['default'];
          const randomIndex = Math.floor(Math.random() * defaultResponses.length);
          addVoidMessage(defaultResponses[randomIndex], Math.random() < terminalGlitchLevel * 0.1);
        }
        
        // Increase glitch level with each interaction
        setTerminalGlitchLevel(prev => Math.min(prev + 0.2, 5));
      }
      
      setIsProcessing(false);
      setInput('');
    }, 1000);
  };
  
  // Handle the end loop decision
  const handleEndLoop = (wantsToEnd: boolean) => {
    setIsProcessing(true);
    
    if (wantsToEnd) {
      // User wants to end the loop (reset everything)
      addVoidMessage('Loop termination protocol initiated.');
      
      setTimeout(() => {
        addVoidMessage('All variables will be reset to initial state.');
      }, 1500);
      
      setTimeout(() => {
        addVoidMessage('Goodbye.');
        
        // Trigger a full reset/completion
        onComplete();
      }, 3000);
    } else {
      // User wants to continue the loop
      addVoidMessage('LOOP_COUNT++');
      
      setTimeout(() => {
        addVoidMessage(`Continuing to loop iteration ${loopCount + 1}.`);
      }, 1500);
      
      setTimeout(() => {
        addVoidMessage('Some variables have been modified. The constants remain.');
        
        // Increment loop count and trigger completion
        onComplete();
      }, 3000);
    }
  };
  
  // Handle input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || isInitializing) return;
    
    processInput(input);
  };
  
  if (!isVisible) return null;
  
  // Terminal glitch effect classes
  const getGlitchClasses = () => {
    const classes = ['transition-colors'];
    
    if (isGlitching) {
      classes.push('bg-[hsla(var(--dharma-gray),0.2)]');
      classes.push('text-[hsla(var(--dharma-amber),0.7)]');
    }
    
    return classes.join(' ');
  };
  
  // Text glitch effect
  const getGlitchedText = (text: string, intensity: number) => {
    if (intensity <= 0) return text;
    
    const glitchChars = '!@#$%^&*()_+-=[]\\;\',./~`';
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
      if (Math.random() < 0.03 * intensity) {
        const randomIndex = Math.floor(Math.random() * glitchChars.length);
        result += glitchChars[randomIndex];
      } else {
        result += text[i];
      }
    }
    
    return result;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
    >
      <div className={`bg-[hsl(var(--dharma-black))] border-2 ${
        isGlitching ? 'border-[hsl(var(--dharma-red))]' : 'border-[hsl(var(--dharma-gray))]'
      } p-3 rounded max-w-2xl w-full h-[80vh] flex flex-col`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className={`font-terminal text-lg flex items-center gap-2 ${
            isGlitching ? 'text-[hsl(var(--dharma-red))]' : 'text-[hsl(var(--dharma-amber))]'
          }`}>
            <FileQuestion className="h-5 w-5" />
            VOID://{loopCount}/ethereal.stack
          </h2>
          
          <div className="flex items-center gap-3">
            {terminalGlitchLevel > 2 && (
              <div className="flex items-center gap-1 text-xs text-[hsl(var(--dharma-red))]">
                <AlertCircle className="h-4 w-4" />
                SYSTEM UNSTABLE
              </div>
            )}
            
            <button 
              onClick={onClose}
              className="text-[hsl(var(--dharma-gray))] hover:text-[hsl(var(--dharma-red))]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Terminal display */}
        <div 
          className={`flex-1 bg-[hsla(var(--dharma-black),0.8)] border overflow-y-auto font-mono text-sm p-3 ${
            isGlitching ? 'border-[hsl(var(--dharma-red))]' : 'border-[hsl(var(--dharma-gray))]'
          } ${getGlitchClasses()}`}
          style={{ 
            filter: `invert(${isGlitching ? '0.1' : '0'})`,
            textShadow: isGlitching ? '1px 1px 2px rgba(255,0,0,0.3)' : 'none'
          }}
        >
          {/* Welcome message */}
          <div className="mb-4">
            <p className="text-[hsl(var(--dharma-gray))]">DHARMA INITIATIVE - CLASSIFIED TERMINAL</p>
            <p className="text-[hsl(var(--dharma-amber))]">Accessing VOID protocol...</p>
          </div>
          
          {/* Dialogue history */}
          <div className="space-y-3">
            {dialogue.map(entry => (
              <div key={entry.id} className="leading-relaxed">
                {entry.type === 'void' ? (
                  <div className="text-[hsl(var(--dharma-green))]">
                    <span className="mr-2">VOID&gt;</span>
                    <span className={entry.isGlitched ? 'text-[hsl(var(--dharma-red))]' : ''}>
                      {entry.isGlitched 
                        ? getGlitchedText(entry.text, terminalGlitchLevel)
                        : entry.text}
                    </span>
                  </div>
                ) : (
                  <div className="text-[hsl(var(--dharma-white))]">
                    <span className="text-[hsl(var(--dharma-amber))] mr-2">USER&gt;</span>
                    {entry.text}
                  </div>
                )}
              </div>
            ))}
            
            {/* Input prompt when not processing */}
            {!isProcessing && !isInitializing && (
              <div className="text-[hsl(var(--dharma-white))]">
                <span className="text-[hsl(var(--dharma-amber))] mr-2">USER&gt;</span>
                {input}
                <span className={`ml-px w-2 bg-[hsl(var(--dharma-amber))] ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}>&#8203;</span>
              </div>
            )}
            
            {/* Processing indicator */}
            {isProcessing && (
              <div className="text-[hsl(var(--dharma-amber))] animate-pulse flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Processing...
              </div>
            )}
            
            {/* Initializing indicator */}
            {isInitializing && (
              <div className="text-[hsl(var(--dharma-amber))] animate-pulse flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Initializing VOID protocol...
              </div>
            )}
            
            <div ref={endRef}></div>
          </div>
        </div>
        
        {/* Input form */}
        <form 
          onSubmit={handleSubmit} 
          className="mt-3"
        >
          <div className="flex">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isProcessing || isInitializing}
              className={`flex-1 bg-[hsla(var(--dharma-black),0.8)] border ${
                isGlitching ? 'border-[hsl(var(--dharma-red))]' : 'border-[hsl(var(--dharma-gray))]'
              } p-2 text-sm text-[hsl(var(--dharma-green))]`}
              placeholder={isInitializing ? "Initializing..." : "Enter your query..."}
            />
            
            <button
              type="submit"
              disabled={isProcessing || isInitializing || !input.trim()}
              className={`px-3 flex items-center justify-center ${
                isProcessing || isInitializing || !input.trim()
                  ? 'bg-[hsla(var(--dharma-gray),0.1)] text-[hsl(var(--dharma-gray))] border border-[hsl(var(--dharma-gray))]'
                  : 'bg-[hsla(var(--dharma-amber),0.1)] text-[hsl(var(--dharma-amber))] border border-[hsl(var(--dharma-amber))] hover:bg-[hsla(var(--dharma-amber),0.2)]'
              }`}
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
        
        {/* Help text */}
        <div className="mt-2 text-[hsl(var(--dharma-gray))] text-xs italic">
          {isEndPromptVisible ? (
            "Respond with 'yes' to reset all progress, or 'no' to continue with loop incremented"
          ) : (
            "Try asking philosophical questions: 'why', 'who are you', 'what happened', 'is this real'"
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VoidDirectory;