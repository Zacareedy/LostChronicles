import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Wifi, Clock, AlertCircle, Send, X, UserPlus, Download, Shield, CheckCircle } from 'lucide-react';
import { playSound } from '@/lib/audio';

interface SubnetInterfaceProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  senderColor: string;
  timestamp: string;
  content: string;
  isCorrupted?: boolean;
  isSystem?: boolean;
}

const SubnetInterface: React.FC<SubnetInterfaceProps> = ({ isVisible, onClose, onComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activeChannel, setActiveChannel] = useState('general');
  const [userHandle, setUserHandle] = useState('UNKNOWN_USER');
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasDownloadedLogs, setHasDownloadedLogs] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Available channels
  const channels = [
    { id: 'general', name: 'General', unread: false },
    { id: 'security', name: 'Security', unread: true, locked: true },
    { id: 'engineering', name: 'Engineering', unread: true },
    { id: 'medical', name: 'Medical', unread: false, locked: true },
    { id: 'alvar', name: 'Alvar.H', unread: false, direct: true }
  ];
  
  // Messages for each channel
  const channelMessages: Record<string, ChatMessage[]> = {
    general: [
      {
        id: '1',
        sender: 'SYSTEM',
        senderColor: '#00ccff',
        timestamp: '1980-02-07 08:42:11',
        content: 'DHARMA Initiative Subnet Protocol Interface v2.3.4',
        isSystem: true
      },
      {
        id: '2',
        sender: 'SYSTEM',
        senderColor: '#00ccff',
        timestamp: '1980-02-07 08:42:15',
        content: 'WARNING: Communication integrity compromised. Some messages may be corrupted.',
        isSystem: true
      },
      {
        id: '3',
        sender: 'Pierre.C',
        senderColor: '#f0ad4e',
        timestamp: '1980-02-07 09:15:33',
        content: 'All stations be advised: we are implementing new security protocols after the recent Incident. Details to follow in the Security channel.'
      },
      {
        id: '4',
        sender: 'Stuart.R',
        senderColor: '#5bc0de',
        timestamp: '1980-02-07 09:18:42',
        content: 'When will Engineering get access to the new subnet protocols? We need to run diagnostics on the remaining equipment.'
      },
      {
        id: '5',
        sender: 'Pierre.C',
        senderColor: '#f0ad4e',
        timestamp: '1980-02-07 09:20:15',
        content: 'Engineering will get access once we verify the network integrity. We cannot risk another breach after what happened.'
      },
      {
        id: '6',
        sender: 'Horace.G',
        senderColor: '#5cb85c',
        timestamp: '1980-02-07 10:05:22',
        content: 'All personnel are reminded that discussion of the Incident outside of authorized channels is strictly prohibited.'
      },
      {
        id: '7',
        sender: 'Amy.G',
        senderColor: '#d9534f',
        timestamp: '1980-02-07 10:42:53',
        content: 'Has anyone been able to get in touch with Radzinsky? He was supposed to provide updated schematics for the new barrier.'
      },
      {
        id: '8',
        sender: 'Horace.G',
        senderColor: '#5cb85c',
        timestamp: '1980-02-07 10:45:18',
        content: 'Radzinsky is currently working on a special project. Please direct all engineering concerns to Stuart for now.'
      },
      {
        id: '9',
        sender: 'SYSTEM',
        senderColor: '#00ccff',
        timestamp: '1980-02-07 11:01:44',
        content: 'WARNING: Network instability detected. Some messages from the past 24 hours have been corrupted.',
        isSystem: true
      },
      {
        id: '10',
        sender: 'Pierre.C',
        senderColor: '#f0ad4e',
        timestamp: '1980-02-07 11:30:21',
        content: 'Has anyone confirmed whether "Protocol Candle" is ready for implementation? We need to ensure all stations can receive the signal simultaneously.',
        isCorrupted: false
      }
    ],
    engineering: [
      {
        id: 'e1',
        sender: 'SYSTEM',
        senderColor: '#00ccff',
        timestamp: '1980-02-06 14:22:05',
        content: 'Engineering subnet channel initialized',
        isSystem: true
      },
      {
        id: 'e2',
        sender: 'Stuart.R',
        senderColor: '#5bc0de',
        timestamp: '1980-02-06 14:30:12',
        content: 'Can someone explain why the signal amplifiers are showing unusual readings near grid sector 16?'
      },
      {
        id: 'e3',
        sender: 'Jin.K',
        senderColor: '#337ab7',
        timestamp: '1980-02-06 14:33:45',
        content: 'I checked the equipment there yesterday. The EM levels are within tolerance, but there\'s an unusual variance every 108 minutes.'
      },
      {
        id: 'e4',
        sender: 'Stuart.R',
        senderColor: '#5bc0de',
        timestamp: '1980-02-06 14:35:22',
        content: 'That coincides with the button protocol. Are you suggesting there\'s leakage despite the containment?'
      },
      {
        id: 'e5',
        sender: 'Jin.K',
        senderColor: '#337ab7',
        timestamp: '1980-02-06 14:38:17',
        content: 'Not leakage, but there\'s definitely a pattern. I\'ve logged the data in /systems/em_variance/log4815.dat if you want to review it.'
      },
      {
        id: 'e6',
        sender: 'Radzinsky.S',
        senderColor: '#d9534f',
        timestamp: '1980-02-06 15:01:33',
        content: 'Delete that data immediately. Those readings are classified under Protocol Candle.'
      },
      {
        id: 'e7',
        sender: 'Jin.K',
        senderColor: '#337ab7',
        timestamp: '1980-02-06 15:04:11',
        content: 'I don\'t have clearance for Protocol Candle. What is it?'
      },
      {
        id: 'e8',
        sender: 'Radzinsky.S',
        senderColor: '#d9534f',
        timestamp: '1980-02-06 15:06:45',
        content: 'You don\'t need to know. Just delete the data and forget you saw anything. Focus on your assigned tasks.'
      },
      {
        id: 'e9',
        sender: 'SYSTEM',
        senderColor: '#00ccff',
        timestamp: '1980-02-06 15:10:22',
        content: 'WARNING: Message integrity compromised. Some content may be corrupted.',
        isSystem: true
      },
      {
        id: 'e10',
        sender: 'Stuart.R',
        senderColor: '#5bc0de',
        timestamp: '1980-02-06 16:42:15',
        content: 'Has anyone managed to restore access to the black box recordings from the supply plane? The data might help us understand the...',
        isCorrupted: true
      }
    ],
    alvar: [
      {
        id: 'a1',
        sender: 'SYSTEM',
        senderColor: '#00ccff',
        timestamp: '1980-02-05 23:59:59',
        content: 'Direct channel established with ALVAR.H - ENCRYPTED',
        isSystem: true
      },
      {
        id: 'a2',
        sender: 'Alvar.H',
        senderColor: '#9932CC',
        timestamp: '1980-02-06 00:00:01',
        content: 'I trust this channel is secure. We cannot afford another breach.'
      },
      {
        id: 'a3',
        sender: 'Pierre.C',
        senderColor: '#f0ad4e',
        timestamp: '1980-02-06 00:01:15',
        content: 'Yes, Dr. Hanso. This is a direct link using the new encryption protocols.'
      },
      {
        id: 'a4',
        sender: 'Alvar.H',
        senderColor: '#9932CC',
        timestamp: '1980-02-06 00:03:42',
        content: 'Good. The Incident has complicated matters significantly. The Valenzetti parameters are shifting.'
      },
      {
        id: 'a5',
        sender: 'Pierre.C',
        senderColor: '#f0ad4e',
        timestamp: '1980-02-06 00:05:08',
        content: 'How bad is it? Do we need to evacuate the remaining personnel?'
      },
      {
        id: 'a6',
        sender: 'Alvar.H',
        senderColor: '#9932CC',
        timestamp: '1980-02-06 00:08:23',
        content: 'No evacuations. We\'ve invested too much to abandon now. The Incident may have actually created an opportunity.'
      },
      {
        id: 'a7',
        sender: 'Pierre.C',
        senderColor: '#f0ad4e',
        timestamp: '1980-02-06 00:09:44',
        content: 'An opportunity? Several of our people died!'
      },
      {
        id: 'a8',
        sender: 'Alvar.H',
        senderColor: '#9932CC',
        timestamp: '1980-02-06 00:12:15',
        content: 'Unfortunate but unavoidable casualties. The unique electromagnetic properties we\'ve uncovered could be the key to manipulating the Valenzetti variables.'
      },
      {
        id: 'a9',
        sender: 'Pierre.C',
        senderColor: '#f0ad4e',
        timestamp: '1980-02-06 00:15:33',
        content: 'And what about Protocol Candle? Should we proceed with implementation?'
      },
      {
        id: 'a10',
        sender: 'Alvar.H',
        senderColor: '#9932CC',
        timestamp: '1980-02-06 00:18:08',
        content: 'Protocol Candle is our failsafe. A last resort only if the temporal distortion reaches critical levels. For now, maintain the button protocol at all costs.',
        isCorrupted: false
      },
      {
        id: 'a11',
        sender: 'SYSTEM',
        senderColor: '#00ccff',
        timestamp: '1980-02-06 00:20:00',
        content: 'WARNING: Connection terminated unexpectedly. Remaining logs corrupted.',
        isSystem: true
      }
    ]
  };
  
  // Simulate connection and loading
  useEffect(() => {
    if (!isVisible) return;
    
    setIsLoading(true);
    setIsConnected(false);
    setConnectionAttempts(0);
    
    // Simulate connection attempt
    const timer = setTimeout(() => {
      playSound('beep');
      setConnectionAttempts(1);
      
      // Simulate another connection attempt
      const timer2 = setTimeout(() => {
        playSound('beep');
        setConnectionAttempts(2);
        
        // Final connection attempt
        const timer3 = setTimeout(() => {
          playSound('success');
          setIsLoading(false);
          setIsConnected(true);
          // Load initial messages for general channel
          setMessages(channelMessages['general']);
        }, 1500);
        
        return () => clearTimeout(timer3);
      }, 1500);
      
      return () => clearTimeout(timer2);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [isVisible]);
  
  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Switch channel
  const handleChannelChange = (channelId: string) => {
    if (channels.find(c => c.id === channelId)?.locked) {
      playSound('error');
      addSystemMessage('Access denied: Insufficient clearance for this channel.');
      return;
    }
    
    playSound('click');
    setActiveChannel(channelId);
    setMessages(channelMessages[channelId] || []);
  };
  
  // Add a system message
  const addSystemMessage = (content: string) => {
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      sender: 'SYSTEM',
      senderColor: '#00ccff',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      content,
      isSystem: true
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };
  
  // Handle message input
  const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  // Handle message send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Check for special commands
    if (inputValue.startsWith('/')) {
      handleCommand(inputValue);
      setInputValue('');
      return;
    }
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: userHandle,
      senderColor: '#5cb85c',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      content: inputValue
    };
    
    playSound('beep', 'short');
    setMessages(prev => [...prev, userMessage]);
    
    // Check for special trigger phrases
    if (inputValue.toLowerCase().includes('protocol candle') || 
        inputValue.toLowerCase().includes('valenzetti') ||
        inputValue.toLowerCase().includes('incident details')) {
      // Add system response after a delay
      setTimeout(() => {
        const systemResponse: ChatMessage = {
          id: `system-${Date.now()}`,
          sender: 'SYSTEM',
          senderColor: '#00ccff',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          content: 'WARNING: This conversation is being monitored. Discussion of classified protocols is restricted.',
          isSystem: true
        };
        
        playSound('error');
        setMessages(prev => [...prev, systemResponse]);
      }, 1000);
    }
    
    // Reset input
    setInputValue('');
  };
  
  // Handle special commands
  const handleCommand = (command: string) => {
    const cmd = command.toLowerCase().trim();
    
    if (cmd === '/help') {
      addSystemMessage('Available commands: /help, /nick [username], /clear, /download, /exit');
    } else if (cmd.startsWith('/nick ')) {
      const newHandle = cmd.substring(6).trim();
      if (newHandle) {
        setUserHandle(newHandle);
        addSystemMessage(`Username changed to ${newHandle}`);
        playSound('success');
      }
    } else if (cmd === '/clear') {
      setMessages([]);
      playSound('beep');
    } else if (cmd === '/download') {
      // Simulate downloading logs
      addSystemMessage('Downloading subnet logs...');
      playSound('beep');
      
      setTimeout(() => {
        addSystemMessage('Download complete. Logs saved to /logs/subnet/');
        playSound('success');
        setHasDownloadedLogs(true);
        
        // Check if this completes the puzzle
        if (!isCompleted) {
          setTimeout(() => {
            addSystemMessage('NOTICE: Critical information discovered in logs. Access to Protocol Candle documentation granted.');
            setIsCompleted(true);
            playSound('success');
            
            setTimeout(() => {
              onComplete();
            }, 2000);
          }, 1500);
        }
      }, 2000);
    } else if (cmd === '/exit') {
      onClose();
    } else {
      addSystemMessage(`Unknown command: ${cmd}`);
      playSound('error');
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-[hsl(var(--dharma-black))] border border-[hsl(var(--dharma-amber))] p-3 max-w-4xl w-full h-[85vh] flex flex-col font-mono">
        {/* Terminal header - simple phosphor style green text on black with scanlines */}
        <div className="flex justify-between items-center mb-2 border-b border-[hsl(var(--dharma-amber))] pb-2">
          <h2 className="text-[hsl(var(--dharma-bright-green))] font-terminal text-base uppercase">
            {">"} DHARMA SUBNET PROTOCOL v2.3.4
          </h2>
          
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 text-xs font-terminal uppercase ${isConnected ? 'text-[hsl(var(--dharma-bright-green))]' : 'text-[hsl(var(--dharma-red))]'}`}>
              {isConnected ? '[LINK ESTABLISHED]' : '[INITIALIZING LINK]'}
            </div>
            
            <button 
              onClick={onClose}
              className="text-[hsl(var(--dharma-amber))] hover:text-[hsl(var(--dharma-red))]"
            >
              [X]
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center font-mono">
            <div className="text-[hsl(var(--dharma-bright-green))] text-sm mb-4 font-terminal w-full max-w-lg">
              <div className="mb-3 text-center font-mono text-xs">
                DHARMA INITIATIVE SUBNET PROTOCOL v2.3.4
              </div>
              <div className="uppercase tracking-wider font-mono">{">"} Initializing SUBNET PROTOCOL</div>
              <div className="mt-1 uppercase tracking-wider font-mono">{">"} Connecting to DHARMA INITIATIVE mainframe</div>
              <div className="mt-1 uppercase tracking-wider text-yellow-500 animate-pulse font-mono">{">"} Connection attempt {connectionAttempts}/3</div>
            </div>
            <div className="w-64 h-6 border border-[hsl(var(--dharma-bright-green))] overflow-hidden bg-black">
              <div 
                className="h-full bg-[hsl(var(--dharma-bright-green))] transition-all duration-300"
                style={{ width: `${connectionAttempts * 33}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            {/* Retro terminal-style channel sidebar */}
            <div className="w-48 border-r border-[hsl(var(--dharma-bright-green))] pr-3 flex flex-col text-[hsl(var(--dharma-bright-green))]">
              <div className="text-xs mb-2 font-terminal border-b border-[hsl(var(--dharma-bright-green))] pb-1 uppercase">[ACCESSIBLE CHANNELS]</div>
              
              <div className="space-y-1 mb-4 font-mono text-xs">
                {channels.filter(c => !c.direct).map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelChange(channel.id)}
                    className={`w-full text-left py-1 text-xs flex items-center justify-between font-mono ${
                      activeChannel === channel.id
                        ? 'text-black bg-[hsl(var(--dharma-bright-green))]'
                        : 'text-[hsl(var(--dharma-bright-green))] hover:bg-[hsla(var(--dharma-bright-green),0.2)]'
                    }`}
                  >
                    <span className="flex items-center">
                      {channel.locked 
                        ? `[LOCKED] ${channel.name.toUpperCase()}`
                        : `> ${channel.name.toUpperCase()}`
                      }
                    </span>
                    {channel.unread && (
                      <span className="ml-1">*</span>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="text-xs mb-2 font-terminal border-b border-[hsl(var(--dharma-bright-green))] pb-1 uppercase">[TERMINAL LINKS]</div>
              
              <div className="space-y-1 font-mono text-xs">
                {channels.filter(c => c.direct).map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelChange(channel.id)}
                    className={`w-full text-left py-1 text-xs flex items-center justify-between font-mono ${
                      activeChannel === channel.id
                        ? 'text-black bg-[hsl(var(--dharma-bright-green))]'
                        : 'text-[hsl(var(--dharma-bright-green))] hover:bg-[hsla(var(--dharma-bright-green),0.2)]'
                    }`}
                  >
                    <span className="flex items-center">
                      {`> ${channel.name.toUpperCase()}`}
                    </span>
                    {channel.unread && (
                      <span className="ml-1">*</span>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="mt-auto pt-4">
                <button
                  onClick={() => handleCommand('/download')}
                  className={`w-full py-2 text-xs flex items-center justify-center font-mono uppercase border ${
                    hasDownloadedLogs
                      ? 'bg-[hsl(var(--dharma-bright-green))] text-black border-[hsl(var(--dharma-bright-green))]'
                      : 'bg-black text-[hsl(var(--dharma-bright-green))] border-[hsl(var(--dharma-bright-green))]'
                  }`}
                >
                  {hasDownloadedLogs ? '[LOGS ARCHIVED]' : '[BACKUP SUBNET DATA]'}
                </button>
              </div>
            </div>
            
            {/* Chat main area - styled like a 1970s terminal */}
            <div className="flex-1 flex flex-col overflow-hidden pl-3">
              <div className="flex items-center justify-between border-b border-[hsl(var(--dharma-bright-green))] pb-2 mb-3">
                <div className="text-[hsl(var(--dharma-bright-green))] font-terminal text-xs uppercase">
                  {"["}{activeChannel === 'general' ? 'CHANNEL:GENERAL' : 
                   activeChannel === 'engineering' ? 'CHANNEL:ENGINEERING' : 
                   activeChannel === 'security' ? 'CHANNEL:SECURITY' : 
                   activeChannel === 'medical' ? 'CHANNEL:MEDICAL' : 
                   `USER:${activeChannel.toUpperCase()}`}{"]"}
                </div>
                
                <div className="text-xs font-terminal text-[hsl(var(--dharma-bright-green))]">
                  OPERATOR: <span className="text-[hsl(var(--dharma-bright-green))] font-bold">{userHandle}</span>
                </div>
              </div>
              
              {/* Messages styled like old terminal text */}
              <div className="flex-1 overflow-y-auto mb-3 font-mono text-xs leading-5 p-2 bg-black border border-[hsl(var(--dharma-bright-green))]">
                {messages.map(message => (
                  <div key={message.id} className={`mb-2 ${message.isSystem ? 'border-l-2 border-[hsl(var(--dharma-bright-green))] pl-2' : ''}`}>
                    <div className="flex flex-wrap items-center gap-1 mb-1 font-terminal uppercase">
                      <span className="font-bold" style={{ color: message.isSystem ? '#00ff00' : message.senderColor }}>
                        {message.isSystem ? '[SYSTEM]' : `[${message.sender}]`}
                      </span>
                      <span className="text-[hsl(var(--dharma-gray))]">:</span>
                      <span className="text-[hsl(var(--dharma-gray))]">{message.timestamp}</span>
                      
                      {message.isCorrupted && (
                        <span className="ml-1 text-[hsl(var(--dharma-red))] uppercase">
                          [DATA CORRUPTED]
                        </span>
                      )}
                    </div>
                    
                    <div className={`font-mono ${
                      message.isSystem 
                        ? 'text-[hsl(var(--dharma-bright-green))]' 
                        : message.isCorrupted 
                          ? 'text-[hsl(var(--dharma-gray))] italic' 
                          : 'text-[hsl(var(--dharma-bright-green))]'
                    }`}>
                      {message.isCorrupted 
                        ? `${message.content}... <ERROR: DATA UNRECOVERABLE>`
                        : message.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              {/* Terminal-style input prompt */}
              <form onSubmit={handleSendMessage} className="mt-auto">
                <div className="flex items-center">
                  <span className="text-[hsl(var(--dharma-bright-green))] font-mono mr-2 font-bold">{">"}</span>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleMessageInput}
                    placeholder="Enter command or message (type /help for commands)..."
                    className="flex-1 bg-black border-b border-[hsl(var(--dharma-bright-green))] p-2 text-xs text-[hsl(var(--dharma-bright-green))] font-mono caret-[hsl(var(--dharma-bright-green))] focus:outline-none focus:ring-0"
                    autoFocus
                  />
                  
                  <button
                    type="submit"
                    className="ml-2 px-3 py-1 bg-black text-[hsl(var(--dharma-bright-green))] border border-[hsl(var(--dharma-bright-green))] hover:bg-[hsl(var(--dharma-bright-green))] hover:text-black font-mono uppercase text-xs"
                  >
                    SEND
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {isCompleted && (
          <div className="mt-3 p-2 bg-[hsla(var(--dharma-green),0.1)] border border-[hsl(var(--dharma-bright-green))] text-center">
            <p className="text-[hsl(var(--dharma-bright-green))] text-sm flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4" />
              SUBNET LOGS SUCCESSFULLY ARCHIVED
            </p>
            <p className="text-[hsl(var(--dharma-green))] text-xs mt-1">
              Critical information about Protocol Candle has been extracted.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SubnetInterface;