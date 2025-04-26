import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Timer, 
  X, 
  Lock, 
  Unlock, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Laptop, 
  Monitor, 
  Eye
} from 'lucide-react';
import { playSound } from '@/lib/audio';

interface ProjectCandleProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface StationSyncStatus {
  id: string;
  name: string;
  isActive: boolean;
  isSynced: boolean;
  isRequired: boolean;
}

interface NetworkNode {
  id: string;
  x: number;
  y: number;
  isFixed: boolean;
  isAligned: boolean;
}

const ProjectCandle: React.FC<ProjectCandleProps> = ({ isVisible, onClose, onComplete }) => {
  // Timer state
  const [countdown, setCountdown] = useState(240); // 4 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // Challenge state
  const [activeStation, setActiveStation] = useState<'swan' | 'flame' | 'pearl'>('swan');
  const [isCompleted, setIsCompleted] = useState(false);
  const [failMessage, setFailMessage] = useState('');
  const [isFailMessageVisible, setIsFailMessageVisible] = useState(false);
  
  // Swan station state (Numbers challenge)
  const [numbersInput, setNumbersInput] = useState('');
  const [isSwanSynced, setIsSwanSynced] = useState(false);
  const [numbersCountdown, setNumbersCountdown] = useState(108);
  
  // Flame station state (Network nodes challenge)
  const [nodes, setNodes] = useState<NetworkNode[]>([
    { id: 'n1', x: 120, y: 100, isFixed: true, isAligned: false },
    { id: 'n2', x: 240, y: 160, isFixed: true, isAligned: false },
    { id: 'n3', x: 80, y: 220, isFixed: true, isAligned: false },
    { id: 'n4', x: 200, y: 240, isFixed: true, isAligned: false },
    { id: 'n5', x: 300, y: 120, isFixed: true, isAligned: false },
    { id: 'm1', x: 150, y: 150, isFixed: false, isAligned: false },
    { id: 'm2', x: 220, y: 100, isFixed: false, isAligned: false },
    { id: 'm3', x: 120, y: 180, isFixed: false, isAligned: false },
    { id: 'm4', x: 250, y: 210, isFixed: false, isAligned: false },
    { id: 'm5', x: 320, y: 160, isFixed: false, isAligned: false },
  ]);
  const [activeDragNode, setActiveDragNode] = useState<string | null>(null);
  const [isNodeAlignmentComplete, setIsNodeAlignmentComplete] = useState(false);
  
  // Pearl station state (Protocol phrase challenge)
  const [phraseWords, setPhraseWords] = useState<string[]>(['Protocol', 'Candle', 'is', '______', '______', '______']);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(3);
  const [isPhraseComplete, setIsPhraseComplete] = useState(false);
  const [availableWords, setAvailableWords] = useState<string[]>([
    'our', 'the', 'never', 'always', 'critical', 'failsafe', 'emergency', 'last', 'first', 'only', 'final'
  ]);
  
  // Station sync status
  const [stationStatus, setStationStatus] = useState<StationSyncStatus[]>([
    { id: 'swan', name: 'Swan', isActive: true, isSynced: false, isRequired: true },
    { id: 'flame', name: 'Flame', isActive: false, isSynced: false, isRequired: true },
    { id: 'pearl', name: 'Pearl', isActive: false, isSynced: false, isRequired: true },
    { id: 'arrow', name: 'Arrow', isActive: false, isSynced: false, isRequired: false },
    { id: 'staff', name: 'Staff', isActive: false, isSynced: false, isRequired: false },
    { id: 'orchid', name: 'Orchid', isActive: false, isSynced: false, isRequired: false },
  ]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Initialize when modal becomes visible
  useEffect(() => {
    if (!isVisible) return;
    
    // Reset all state
    setCountdown(240);
    setIsTimerRunning(true);
    setActiveStation('swan');
    setIsCompleted(false);
    setFailMessage('');
    setIsFailMessageVisible(false);
    
    setNumbersInput('');
    setIsSwanSynced(false);
    setNumbersCountdown(108);
    
    setIsNodeAlignmentComplete(false);
    resetNodePositions();
    
    setPhraseWords(['Protocol', 'Candle', 'is', '______', '______', '______']);
    setSelectedWordIndex(3);
    setIsPhraseComplete(false);
    
    setStationStatus([
      { id: 'swan', name: 'Swan', isActive: true, isSynced: false, isRequired: true },
      { id: 'flame', name: 'Flame', isActive: false, isSynced: false, isRequired: true },
      { id: 'pearl', name: 'Pearl', isActive: false, isSynced: false, isRequired: true },
      { id: 'arrow', name: 'Arrow', isActive: false, isSynced: false, isRequired: false },
      { id: 'staff', name: 'Staff', isActive: false, isSynced: false, isRequired: false },
      { id: 'orchid', name: 'Orchid', isActive: false, isSynced: false, isRequired: false },
    ]);
    
    playSound('beep');
    
  }, [isVisible]);
  
  // Main countdown timer
  useEffect(() => {
    if (!isVisible || !isTimerRunning) return;
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFailure('Protocol activation time window expired.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isVisible, isTimerRunning]);
  
  // Swan station numbers countdown
  useEffect(() => {
    if (!isVisible || !isTimerRunning || activeStation !== 'swan' || isSwanSynced) return;
    
    const interval = setInterval(() => {
      setNumbersCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFailure('Numbers sequence not entered in time. Electromagnetic anomaly detected.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isVisible, isTimerRunning, activeStation, isSwanSynced]);
  
  // Canvas drawing for Flame station nodes
  useEffect(() => {
    if (!isVisible || activeStation !== 'flame' || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections between nodes
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
    ctx.lineWidth = 1;
    
    // Connect fixed nodes
    const fixedNodes = nodes.filter(node => node.isFixed);
    ctx.beginPath();
    fixedNodes.forEach((node, i) => {
      if (i === 0) {
        ctx.moveTo(node.x, node.y);
      } else {
        ctx.lineTo(node.x, node.y);
      }
    });
    ctx.closePath();
    ctx.stroke();
    
    // Check alignment of movable nodes
    let allAligned = true;
    const alignmentThreshold = 20;
    
    nodes.forEach(node => {
      if (!node.isFixed) {
        const targetNode = fixedNodes.find(fixed => fixed.id === 'n' + node.id.substring(1));
        if (targetNode) {
          const distance = Math.sqrt(
            Math.pow(node.x - targetNode.x, 2) + 
            Math.pow(node.y - targetNode.y, 2)
          );
          
          const isAligned = distance < alignmentThreshold;
          if (!isAligned) allAligned = false;
          
          // Update node alignment status
          setNodes(prev => prev.map(n => 
            n.id === node.id ? { ...n, isAligned } : n
          ));
        }
      }
    });
    
    // Update overall alignment status
    if (allAligned && !isNodeAlignmentComplete) {
      setIsNodeAlignmentComplete(true);
      playSound('success');
    } else if (!allAligned && isNodeAlignmentComplete) {
      setIsNodeAlignmentComplete(false);
    }
    
    // Draw nodes
    nodes.forEach(node => {
      // Draw node
      ctx.beginPath();
      ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
      
      if (node.isFixed) {
        ctx.fillStyle = 'rgb(100, 100, 100)';
      } else if (node.isAligned) {
        ctx.fillStyle = 'rgb(50, 205, 50)';
      } else if (activeDragNode === node.id) {
        ctx.fillStyle = 'rgb(255, 165, 0)';
      } else {
        ctx.fillStyle = 'rgb(30, 144, 255)';
      }
      
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw node ID
      ctx.fillStyle = 'white';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.id, node.x, node.y);
    });
    
  }, [isVisible, activeStation, nodes, activeDragNode, isNodeAlignmentComplete]);
  
  // Check if all required stations are synced
  useEffect(() => {
    const requiredStations = stationStatus.filter(station => station.isRequired);
    const allRequiredSynced = requiredStations.every(station => station.isSynced);
    
    if (allRequiredSynced && !isCompleted) {
      setIsCompleted(true);
      setIsTimerRunning(false);
      playSound('success');
      
      // Trigger completion after delay
      setTimeout(() => {
        onComplete();
      }, 3000);
    }
  }, [stationStatus, isCompleted, onComplete]);
  
  // Reset node positions
  const resetNodePositions = () => {
    setNodes([
      { id: 'n1', x: 120, y: 100, isFixed: true, isAligned: false },
      { id: 'n2', x: 240, y: 160, isFixed: true, isAligned: false },
      { id: 'n3', x: 80, y: 220, isFixed: true, isAligned: false },
      { id: 'n4', x: 200, y: 240, isFixed: true, isAligned: false },
      { id: 'n5', x: 300, y: 120, isFixed: true, isAligned: false },
      { id: 'm1', x: 150, y: 150, isFixed: false, isAligned: false },
      { id: 'm2', x: 220, y: 100, isFixed: false, isAligned: false },
      { id: 'm3', x: 120, y: 180, isFixed: false, isAligned: false },
      { id: 'm4', x: 250, y: 210, isFixed: false, isAligned: false },
      { id: 'm5', x: 320, y: 160, isFixed: false, isAligned: false },
    ]);
  };
  
  // Format time from seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle station change
  const switchStation = (stationId: 'swan' | 'flame' | 'pearl') => {
    if (isCompleted) return;
    
    setActiveStation(stationId);
    playSound('click');
    
    // Update station active status
    setStationStatus(prev => prev.map(station => 
      station.id === stationId
        ? { ...station, isActive: true }
        : { ...station, isActive: station.id === activeStation ? false : station.isActive }
    ));
  };
  
  // Handle Swan station numbers input
  const handleNumbersInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumbersInput(e.target.value);
  };
  
  // Handle numbers submission
  const handleNumbersSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if the numbers sequence is correct
    if (numbersInput === '4 8 15 16 23 42' || numbersInput === '4,8,15,16,23,42') {
      setIsSwanSynced(true);
      
      // Update Swan station sync status
      setStationStatus(prev => prev.map(station => 
        station.id === 'swan'
          ? { ...station, isSynced: true }
          : station
      ));
      
      playSound('success');
    } else {
      // Wrong sequence
      setNumbersInput('');
      playSound('error');
    }
  };
  
  // Handle node drag in Flame station
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || activeStation !== 'flame' || isNodeAlignmentComplete) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find if any non-fixed node was clicked
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
      return distance <= 10 && !node.isFixed;
    });
    
    if (clickedNode) {
      setActiveDragNode(clickedNode.id);
    }
  };
  
  // Handle node dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !activeDragNode || isNodeAlignmentComplete) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update node position
    setNodes(prev => prev.map(node => 
      node.id === activeDragNode
        ? { ...node, x, y }
        : node
    ));
  };
  
  // Handle mouse up to end drag
  const handleMouseUp = () => {
    setActiveDragNode(null);
    
    // If all nodes are aligned, mark Flame station as synced
    if (isNodeAlignmentComplete) {
      setStationStatus(prev => prev.map(station => 
        station.id === 'flame'
          ? { ...station, isSynced: true }
          : station
      ));
    }
  };
  
  // Handle word selection in Pearl station
  const handleWordSelect = (word: string) => {
    if (selectedWordIndex >= 3 && selectedWordIndex <= 5) {
      // Update the phrase with the selected word
      setPhraseWords(prev => {
        const newPhraseWords = [...prev];
        newPhraseWords[selectedWordIndex] = word;
        return newPhraseWords;
      });
      
      // Move to next word slot if available
      if (selectedWordIndex < 5) {
        setSelectedWordIndex(prev => prev + 1);
      }
      
      // Check if phrase is complete and correct
      setTimeout(() => {
        const currentPhrase = phraseWords.join(' ');
        if (
          currentPhrase.includes('our failsafe') || 
          currentPhrase.includes('the failsafe') || 
          currentPhrase.includes('our last') || 
          currentPhrase.includes('the last') ||
          currentPhrase.includes('our final') ||
          currentPhrase.includes('the final')
        ) {
          setIsPhraseComplete(true);
          
          // Mark Pearl station as synced
          setStationStatus(prev => prev.map(station => 
            station.id === 'pearl'
              ? { ...station, isSynced: true }
              : station
          ));
          
          playSound('success');
        }
      }, 500);
      
      playSound('click');
    }
  };
  
  // Handle failure
  const handleFailure = (message: string) => {
    setFailMessage(message);
    setIsFailMessageVisible(true);
    setIsTimerRunning(false);
    playSound('error');
    
    // Close after delay
    setTimeout(() => {
      onClose();
    }, 5000);
  };
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-[hsl(var(--dharma-black))] border-2 border-[hsl(var(--dharma-gray))] p-5 rounded max-w-5xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[hsl(var(--dharma-amber))] font-terminal text-lg flex items-center gap-2">
            <Flame className="h-5 w-5" />
            PROJECT CANDLE: INTER-STATION SYNCHRONIZATION
          </h2>
          
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 text-xs ${
              countdown < 60 
                ? 'text-[hsl(var(--dharma-red))]' 
                : 'text-[hsl(var(--dharma-amber))]'
            }`}>
              <Timer className="h-4 w-4" />
              PROTOCOL WINDOW: {formatTime(countdown)}
            </div>
            
            <button 
              onClick={onClose}
              className="text-[hsl(var(--dharma-gray))] hover:text-[hsl(var(--dharma-red))]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex gap-4">
          {/* Station selection sidebar */}
          <div className="w-48 bg-[hsla(var(--dharma-gray),0.1)] border border-[hsl(var(--dharma-gray))] p-3 rounded">
            <h3 className="text-[hsl(var(--dharma-white))] text-sm mb-3 font-terminal">STATION SELECT</h3>
            
            <div className="space-y-2">
              {stationStatus.map(station => (
                <button
                  key={station.id}
                  onClick={() => switchStation(station.id as 'swan' | 'flame' | 'pearl')}
                  disabled={!station.isRequired || isCompleted}
                  className={`w-full text-left p-2 text-xs flex items-center justify-between ${
                    station.isActive 
                      ? 'bg-[hsla(var(--dharma-amber),0.2)] text-[hsl(var(--dharma-amber))] border border-[hsl(var(--dharma-amber))]' 
                      : station.isSynced 
                        ? 'bg-[hsla(var(--dharma-green),0.1)] text-[hsl(var(--dharma-green))] border border-[hsl(var(--dharma-green))]'
                        : 'bg-[hsla(var(--dharma-gray),0.1)] text-[hsl(var(--dharma-white))] border border-[hsl(var(--dharma-gray))]'
                  }`}
                >
                  <span>{station.name}</span>
                  {station.isSynced ? (
                    <Unlock className="h-3 w-3 text-[hsl(var(--dharma-green))]" />
                  ) : (
                    <Lock className="h-3 w-3 text-[hsl(var(--dharma-gray))]" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-4 p-2 bg-[hsla(var(--dharma-black),0.3)] border border-[hsl(var(--dharma-gray))]">
              <h4 className="text-[hsl(var(--dharma-white))] text-xs mb-1">SYNCHRONIZATION STATUS</h4>
              <div className="space-y-1">
                {stationStatus.filter(s => s.isRequired).map(station => (
                  <div key={station.id} className="flex items-center justify-between text-xs">
                    <span className={station.isSynced ? 'text-[hsl(var(--dharma-green))]' : 'text-[hsl(var(--dharma-gray))]'}>
                      {station.name}
                    </span>
                    <span className={station.isSynced ? 'text-[hsl(var(--dharma-green))]' : 'text-[hsl(var(--dharma-red))]'}>
                      {station.isSynced ? 'SYNCED' : 'OFFLINE'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Active station interface */}
          <div className="flex-1 border border-[hsl(var(--dharma-gray))] rounded overflow-hidden">
            {/* Swan Station Interface */}
            {activeStation === 'swan' && (
              <div className="h-full flex flex-col">
                <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-[hsl(var(--dharma-amber))]" />
                    <h3 className="text-[hsl(var(--dharma-amber))] text-sm font-terminal">SWAN STATION</h3>
                  </div>
                  
                  <div className={`flex items-center gap-1 text-xs ${
                    numbersCountdown < 30 
                      ? 'text-[hsl(var(--dharma-red))]' 
                      : 'text-[hsl(var(--dharma-green))]'
                  }`}>
                    <Clock className="h-4 w-4" />
                    {formatTime(numbersCountdown)}
                  </div>
                </div>
                
                <div className="flex-1 p-4 bg-[hsla(var(--dharma-black),0.5)] flex flex-col items-center justify-center">
                  {isSwanSynced ? (
                    <div className="text-center">
                      <CheckCircle className="h-16 w-16 text-[hsl(var(--dharma-green))] mx-auto mb-4" />
                      <h3 className="text-[hsl(var(--dharma-green))] text-xl font-terminal mb-2">NUMBERS ACCEPTED</h3>
                      <p className="text-[hsl(var(--dharma-white))] text-sm">Electromagnetic containment stabilized</p>
                      <p className="text-[hsl(var(--dharma-amber))] text-xs mt-4">Proceed to the next station</p>
                    </div>
                  ) : (
                    <div className="w-full max-w-md">
                      <div className="bg-[hsla(var(--dharma-amber),0.1)] border border-[hsl(var(--dharma-amber))] p-3 mb-6">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 text-[hsl(var(--dharma-amber))]" />
                          <p className="text-[hsl(var(--dharma-amber))] text-xs">
                            Warning: Electromagnetic anomaly detected. Enter the Numbers sequence to stabilize the field and synchronize the Swan station.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-[hsl(var(--dharma-black))] border-2 border-[hsl(var(--dharma-gray))] p-4 mb-6">
                        <h4 className="text-[hsl(var(--dharma-white))] text-center text-sm font-terminal mb-3">ENTER THE NUMBERS</h4>
                        
                        <form onSubmit={handleNumbersSubmit} className="flex flex-col items-center">
                          <input
                            type="text"
                            value={numbersInput}
                            onChange={handleNumbersInput}
                            placeholder="Sequence of 6 numbers"
                            className="w-full bg-[hsla(var(--dharma-gray),0.1)] border border-[hsl(var(--dharma-gray))] p-3 text-[hsl(var(--dharma-green))] text-center text-lg font-terminal mb-4"
                          />
                          
                          <button
                            type="submit"
                            className="px-4 py-2 bg-[hsla(var(--dharma-amber),0.1)] text-[hsl(var(--dharma-amber))] border border-[hsl(var(--dharma-amber))] hover:bg-[hsla(var(--dharma-amber),0.2)]"
                          >
                            EXECUTE
                          </button>
                        </form>
                      </div>
                      
                      <div className="text-[hsl(var(--dharma-white))] text-xs">
                        <p className="mb-2"><span className="text-[hsl(var(--dharma-green))]">▶ HINT:</span> The Numbers are referenced in various DHARMA documents.</p>
                        <p><span className="text-[hsl(var(--dharma-green))]">▶ FORMAT:</span> Six numbers separated by spaces or commas.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Flame Station Interface */}
            {activeStation === 'flame' && (
              <div className="h-full flex flex-col">
                <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Laptop className="h-4 w-4 text-[hsl(var(--dharma-amber))]" />
                    <h3 className="text-[hsl(var(--dharma-amber))] text-sm font-terminal">FLAME STATION</h3>
                  </div>
                  
                  <div className="text-[hsl(var(--dharma-gray))] text-xs">
                    {isNodeAlignmentComplete ? (
                      <span className="text-[hsl(var(--dharma-green))]">NETWORK ALIGNED</span>
                    ) : (
                      <span>ALIGNMENT REQUIRED</span>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 p-4 bg-[hsla(var(--dharma-black),0.5)] flex flex-col">
                  {isNodeAlignmentComplete ? (
                    <div className="text-center my-auto">
                      <CheckCircle className="h-16 w-16 text-[hsl(var(--dharma-green))] mx-auto mb-4" />
                      <h3 className="text-[hsl(var(--dharma-green))] text-xl font-terminal mb-2">NETWORK SYNCHRONIZED</h3>
                      <p className="text-[hsl(var(--dharma-white))] text-sm">Communication network realigned</p>
                      <p className="text-[hsl(var(--dharma-amber))] text-xs mt-4">Proceed to the next station</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-[hsla(var(--dharma-amber),0.1)] border border-[hsl(var(--dharma-amber))] p-3 mb-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 text-[hsl(var(--dharma-amber))]" />
                          <p className="text-[hsl(var(--dharma-amber))] text-xs">
                            Network misalignment detected. Drag the blue nodes to align with the corresponding fixed nodes to establish cross-station communication.
                          </p>
                        </div>
                      </div>
                      
                      <div className="relative flex-1 bg-[hsl(var(--dharma-black))] border border-[hsl(var(--dharma-gray))]">
                        <canvas
                          ref={canvasRef}
                          width={400}
                          height={300}
                          className="w-full h-full"
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onMouseUp={handleMouseUp}
                          onMouseLeave={handleMouseUp}
                        />
                        
                        <div className="absolute bottom-2 right-2 text-[hsl(var(--dharma-gray))] text-xs">
                          <button
                            onClick={resetNodePositions}
                            className="px-2 py-1 bg-[hsla(var(--dharma-gray),0.1)] border border-[hsl(var(--dharma-gray))]"
                          >
                            RESET
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-[hsl(var(--dharma-white))] text-xs">
                        <p className="mb-2"><span className="text-[hsl(var(--dharma-green))]">▶ HINT:</span> Blue nodes must align with their corresponding gray nodes.</p>
                        <p><span className="text-[hsl(var(--dharma-green))]">▶ NOTE:</span> The pattern follows the Hydra constellation described in DHARMA astronomical charts.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Pearl Station Interface */}
            {activeStation === 'pearl' && (
              <div className="h-full flex flex-col">
                <div className="bg-[hsla(var(--dharma-gray),0.1)] p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-[hsl(var(--dharma-amber))]" />
                    <h3 className="text-[hsl(var(--dharma-amber))] text-sm font-terminal">PEARL STATION</h3>
                  </div>
                  
                  <div className="text-[hsl(var(--dharma-gray))] text-xs">
                    {isPhraseComplete ? (
                      <span className="text-[hsl(var(--dharma-green))]">PHRASE VERIFIED</span>
                    ) : (
                      <span>AUTHORIZATION REQUIRED</span>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 p-4 bg-[hsla(var(--dharma-black),0.5)] flex flex-col">
                  {isPhraseComplete ? (
                    <div className="text-center my-auto">
                      <CheckCircle className="h-16 w-16 text-[hsl(var(--dharma-green))] mx-auto mb-4" />
                      <h3 className="text-[hsl(var(--dharma-green))] text-xl font-terminal mb-2">PHRASE AUTHENTICATED</h3>
                      <p className="text-[hsl(var(--dharma-white))] text-sm">Protocol authorization complete</p>
                      <p className="text-[hsl(var(--dharma-amber))] text-xs mt-4">All required stations synchronized</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-[hsla(var(--dharma-amber),0.1)] border border-[hsl(var(--dharma-amber))] p-3 mb-6">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 text-[hsl(var(--dharma-amber))]" />
                          <p className="text-[hsl(var(--dharma-amber))] text-xs">
                            Protocol activation requires authorized completion of the security phrase. Select the correct words to complete the phrase based on DHARMA documentation.
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-[hsl(var(--dharma-black))] border-2 border-[hsl(var(--dharma-gray))] p-4 mb-6">
                        <h4 className="text-[hsl(var(--dharma-white))] text-center text-sm font-terminal mb-4">COMPLETE THE PHRASE</h4>
                        
                        <div className="flex flex-wrap gap-3 justify-center mb-6">
                          {phraseWords.map((word, index) => (
                            <div 
                              key={index}
                              onClick={() => index >= 3 && setSelectedWordIndex(index)}
                              className={`px-3 py-2 ${
                                index < 3 
                                  ? 'bg-[hsla(var(--dharma-gray),0.1)] text-[hsl(var(--dharma-gray))]' 
                                  : word === '______'
                                    ? selectedWordIndex === index
                                      ? 'bg-[hsla(var(--dharma-amber),0.2)] text-[hsl(var(--dharma-amber))] border border-[hsl(var(--dharma-amber))] cursor-pointer'
                                      : 'bg-[hsla(var(--dharma-gray),0.1)] text-[hsl(var(--dharma-white))] border border-[hsl(var(--dharma-gray))] cursor-pointer'
                                    : 'bg-[hsla(var(--dharma-green),0.1)] text-[hsl(var(--dharma-green))] border border-[hsl(var(--dharma-green))] cursor-pointer'
                              }`}
                            >
                              {word}
                            </div>
                          ))}
                        </div>
                        
                        <h4 className="text-[hsl(var(--dharma-white))] text-center text-xs font-terminal mb-3">SELECT WORDS</h4>
                        
                        <div className="flex flex-wrap gap-2 justify-center">
                          {availableWords.map((word) => (
                            <button
                              key={word}
                              onClick={() => handleWordSelect(word)}
                              className="px-2 py-1 bg-[hsla(var(--dharma-gray),0.1)] text-[hsl(var(--dharma-white))] border border-[hsl(var(--dharma-gray))] hover:bg-[hsla(var(--dharma-gray),0.2)]"
                            >
                              {word}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-[hsl(var(--dharma-white))] text-xs">
                        <p className="mb-2"><span className="text-[hsl(var(--dharma-green))]">▶ HINT:</span> This phrase appears in the subnet communication logs.</p>
                        <p><span className="text-[hsl(var(--dharma-green))]">▶ NOTE:</span> Reference communication between Alvar.H and Pierre.C.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Status footer */}
        <div className="mt-4 p-3 bg-[hsla(var(--dharma-gray),0.05)] border border-[hsl(var(--dharma-gray))]">
          <div className="flex justify-between items-center">
            <div className="text-[hsl(var(--dharma-white))] text-xs">
              <span className="text-[hsl(var(--dharma-amber))]">PROJECT CANDLE:</span> Synchronize all required stations to activate the protocol
            </div>
            
            <div className={`text-xs ${
              isCompleted 
                ? 'text-[hsl(var(--dharma-green))]' 
                : 'text-[hsl(var(--dharma-amber))]'
            }`}>
              {isCompleted 
                ? 'PROTOCOL ACTIVATION SUCCESSFUL' 
                : `${stationStatus.filter(s => s.isRequired && s.isSynced).length}/${stationStatus.filter(s => s.isRequired).length} STATIONS SYNCHRONIZED`}
            </div>
          </div>
        </div>
        
        {/* Success message */}
        {isCompleted && (
          <div className="mt-4 p-3 bg-[hsla(var(--dharma-green),0.1)] border border-[hsl(var(--dharma-bright-green))] text-center">
            <p className="text-[hsl(var(--dharma-bright-green))] text-sm flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4" />
              PROJECT CANDLE PROTOCOL SUCCESSFULLY ACTIVATED
            </p>
            <p className="text-[hsl(var(--dharma-green))] text-xs mt-1">
              File '/final/valenzetti.key' unlocked. LOOP_COUNT: 0
            </p>
          </div>
        )}
        
        {/* Failure message */}
        {isFailMessageVisible && (
          <div className="mt-4 p-3 bg-[hsla(var(--dharma-red),0.1)] border border-[hsl(var(--dharma-red))] text-center">
            <p className="text-[hsl(var(--dharma-red))] text-sm flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              PROTOCOL ACTIVATION FAILED
            </p>
            <p className="text-[hsl(var(--dharma-white))] text-xs mt-1">
              {failMessage}
            </p>
            <p className="text-[hsl(var(--dharma-gray))] text-xs mt-2">
              System lockout: 24 hrs (override with dev_override candle)
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectCandle;