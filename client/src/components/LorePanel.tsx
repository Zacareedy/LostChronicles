import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Terminal, Monitor, Radio, FileText, File } from 'lucide-react';
import { useLore } from '@/contexts/LoreContext';
import { INCIDENT_REPORTS, AUDIO_LOGS, STATIONS } from '@/lib/constants';
import TapeSquare from "./TapeSquare"; // Added import

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

// Old-school menu item that doesn't use dropdown
const MenuItem = ({ 
  label, 
  isActive, 
  onClick 
}: { 
  label: string, 
  isActive: boolean, 
  onClick: () => void 
}) => {
  return (
    <div 
      className={`
        px-3 py-1 uppercase text-xs font-mono cursor-pointer 
        ${isActive 
          ? 'bg-[hsla(var(--dharma-green),0.2)] text-[hsl(var(--dharma-green))]' 
          : 'text-[hsla(var(--dharma-green),0.7)]'
        }
        hover:bg-[hsla(var(--dharma-green),0.1)]
        border-b border-[hsla(var(--dharma-gray),0.3)]
      `}
      onClick={onClick}
    >
      {isActive ? '>' : ''} {label}
    </div>
  );
};

const LorePanel: React.FC<LorePanelProps> = (props) => {
  const { className } = props;
  const { 
    discoveredStations,
    unlockedAudioLogs,
    unlockedReports,
    storylineFlags
  } = useLore();

  const [activeSection, setActiveSection] = useState<string>(props.defaultSection || 'stations');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [commandInput, setCommandInput] = useState<string>('');

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

  // Update time display every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Format time as HH:MM in 24-hour format
  function getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle command input here (future enhancement)
    setCommandInput('');
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`dharma-terminal crt-screen rounded-md overflow-hidden ${className} relative`}
    >
      {/* CRT Scan effect */}
      <div className="scan-line"></div>

      <div className="dharma-terminal-header p-2 flex justify-between items-center">
        <h2 className="font-terminal flex items-center text-sm tracking-wider">
          <Terminal className="mr-2 h-4 w-4" />
          DHARMA TERMINAL <span className="animate-terminal-blink ml-1">▋</span>
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs opacity-80 font-mono">{currentTime}</span>
          <div className="dharma-code text-xs">SL-3</div>
        </div>
      </div>

      <div className="flex flex-row h-full">
        {/* Content area */}
        <div className="w-full h-full">
          {/* DHARMA Stations Section */}
          {activeSection === 'stations' && (
            <div className="dharma-terminal-content p-3">
              {discoveredStationData.length > 0 ? (
                <>
                  <div className="mb-3 border-b border-[hsla(var(--dharma-gray),0.3)] pb-2">
                    <div className="flex justify-between items-center">
                      <span className="dharma-terminal-label text-xs">
                        <Monitor className="inline h-3 w-3 mr-1" /> CARTOGRAPHIC MODULE
                      </span>
                      <span className="dharma-code text-xs">
                        {discoveredStationData.length} NODES
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {discoveredStationData.map(station => (
                      <Collapsible 
                        key={station.key}
                        open={expandedItem === station.key}
                        onOpenChange={() => setExpandedItem(expandedItem === station.key ? null : station.key)}
                        className="dharma-collapsible"
                      >
                        <CollapsibleTrigger className="dharma-collapsible-trigger">
                          <div className="flex items-center">
                            <span className="animate-terminal-blink mr-1 opacity-80">{'>'}</span>
                            <span>{station.code}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="dharma-code text-xs opacity-80">{station.name}</span>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="dharma-collapsible-content">
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
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                  <Monitor className="h-8 w-8 mb-4 opacity-50" />
                  <p className="font-terminal">NO LOCATION DATA</p>
                  <div className="dharma-code text-xs mt-4 p-1">
                    &gt; ERROR CODE 108: DATA NOT FOUND
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Declassified Files Section */}
          {activeSection === 'files' && (
            <div className="dharma-terminal-content p-3">
              {unlockedReportData.length > 0 ? (
                <>
                  <div className="mb-3 border-b border-[hsla(var(--dharma-gray),0.3)] pb-2">
                    <div className="flex justify-between items-center">
                      <span className="dharma-terminal-label text-xs">
                        <File className="inline h-3 w-3 mr-1" /> ARCHIVE ACCESS
                      </span>
                      <span className="dharma-code text-xs">
                        MEM: {Math.floor(Math.random() * 40) + 60}K
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {unlockedReportData.map((report) => (
                      <Collapsible 
                        key={report.index}
                        open={expandedItem === `report-${report.index}`}
                        onOpenChange={() => setExpandedItem(expandedItem === `report-${report.index}` ? null : `report-${report.index}`)}
                        className="dharma-collapsible"
                      >
                        <CollapsibleTrigger className="dharma-collapsible-trigger">
                          <div className="flex items-center text-left">
                            <span className="animate-terminal-blink mr-1 opacity-80">{'>'}</span>
                            <span>FILE:{report.fileNumber}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="dharma-classification dharma-classification-1">
                              {report.classification.replace('LEVEL ', 'L')}
                            </span>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="dharma-collapsible-content">
                          <div className="text-xs font-mono mb-2">{report.title}</div>

                          <div className="text-xs whitespace-pre-line">
                            {report.content.split('\n').map((line, i) => (
                              <TerminalLine 
                                key={i} 
                                text={line} 
                                delay={i * 0.1} 
                              />
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center p-4">
                  <File className="h-8 w-8 mb-4 opacity-50" />
                  <p className="font-terminal">ACCESS DENIED</p>
                  <p className="font-mono text-xs mt-2 opacity-70">SEC.CLEARANCE INADEQUATE</p>
                  <div className="dharma-code text-xs mt-4 p-1">
                    &gt; ERROR CODE 15: AUTHORIZATION FAILURE
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Signal Intercepts Section */}
          {activeSection === 'signals' && (
            <div className="dharma-terminal-content p-3">
              {unlockedAudioLogData.length > 0 ? (
                <>
                  <div className="mb-3 border-b border-[hsla(var(--dharma-gray),0.3)] pb-2">
                    <div className="flex justify-between items-center">
                      <span className="dharma-terminal-label text-xs">
                        <TapeSquare className="inline h-3 w-3 mr-1" /> SIGNAL ANALYSIS
                      </span>
                      <span className="dharma-code text-xs">
                        {unlockedAudioLogData.length} RECORDS
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {unlockedAudioLogData.map(log => (
                      <Collapsible 
                        key={log.key}
                        open={expandedItem === log.key}
                        onOpenChange={() => setExpandedItem(expandedItem === log.key ? null : log.key)}
                        className="dharma-collapsible"
                      >
                        <CollapsibleTrigger className="dharma-collapsible-trigger">
                          <div className="flex items-center text-left">
                            <span className="animate-terminal-blink mr-1 opacity-80">{'>'}</span>
                            <span>{log.title}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="dharma-code text-xs">{log.duration}</span>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="dharma-collapsible-content">
                          <div className="text-xs font-mono mb-2">
                            <span className="opacity-70">REC.ID:</span> <span className="opacity-90">{log.key.toUpperCase()}</span>
                          </div>

                          <div className="text-xs mb-3">
                            {log.description}
                          </div>

                          <div className="w-full h-8 bg-[hsla(var(--dharma-gray),0.1)] relative">
                            <div className="absolute top-0 left-0 h-full w-2 bg-[hsla(var(--dharma-green),0.4)]"></div>
                            <div className="absolute top-0 left-0 h-1/2 w-full flex items-center justify-center">
                              <span className="text-xs opacity-70">[PLAYBACK READY]</span>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center p-4">
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
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default LorePanel;