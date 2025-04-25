import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, FileArchive, AlertCircle, Map, Radio, Database, Shield, Terminal } from 'lucide-react';
import { useLore } from '@/contexts/LoreContext';
import { INCIDENT_REPORTS, AUDIO_LOGS, STATIONS } from '@/lib/constants';

interface LorePanelProps {
  className?: string;
}

// Function to split station description and partially redact it
const redactDescription = (description: string): React.ReactNode => {
  const words = description.split(' ');
  
  return words.map((word, index) => {
    // Randomly redact about 20% of words that are 4+ characters long
    const shouldRedact = word.length >= 4 && Math.random() < 0.2;
    
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

const LorePanel: React.FC<LorePanelProps> = ({ className }) => {
  const { 
    discoveredStations,
    unlockedAudioLogs,
    unlockedReports,
    storylineFlags
  } = useLore();
  
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
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

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`dharma-terminal rounded-md overflow-hidden ${className}`}
    >
      <div className="dharma-terminal-header p-2 flex justify-between items-center">
        <h2 className="font-terminal flex items-center text-sm">
          <Terminal className="mr-2 h-4 w-4" />
          DHARMA INFORMATION SYSTEM <span className="animate-terminal-blink ml-1">_</span>
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs opacity-80">{currentTime}</span>
          <span className="dharma-classification dharma-classification-1 text-xs">
            SL: 3
          </span>
        </div>
      </div>
      
      <Tabs defaultValue="stations" className="w-full">
        <TabsList className="dharma-tabs w-full grid grid-cols-3">
          {["stations", "files", "signals"].map((tabValue) => (
            <TabsTrigger 
              key={tabValue}
              value={tabValue}
              className="dharma-tab"
            >
              {tabValue === "stations" && <Map className="h-3 w-3 mr-2" />}
              {tabValue === "files" && <FileArchive className="h-3 w-3 mr-2" />}
              {tabValue === "signals" && <Radio className="h-3 w-3 mr-2" />}
              {tabValue === "stations" ? "MAP DATA" : 
               tabValue === "files" ? "ARCHIVES" : "SIGNALS"}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* DHARMA Stations Tab */}
        <TabsContent value="stations" className="dharma-terminal-content p-3">
          {discoveredStationData.length > 0 ? (
            <>
              <div className="mb-3 border-b border-[hsla(var(--dharma-gray),0.3)] pb-2">
                <span className="dharma-terminal-label text-xs block mb-1">SYSTEM://DHARMA/STATIONS</span>
                <span className="dharma-terminal-value text-xs">RECORDING ACTIVE RESOURCES</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {discoveredStationData.map(station => (
                  <Collapsible 
                    key={station.key}
                    open={expandedItem === station.key}
                    onOpenChange={() => setExpandedItem(expandedItem === station.key ? null : station.key)}
                    className="dharma-collapsible"
                  >
                    <CollapsibleTrigger className="dharma-collapsible-trigger">
                      <div className="flex items-center">
                        <span>{station.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="dharma-code text-xs">{station.code}</span>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="dharma-collapsible-content">
                      <div className="text-xs mb-2 font-mono">
                        <span className="opacity-70">PROJECT:</span> <span className="opacity-90">[CLASSIFIED]</span>
                      </div>
                      
                      <div className="text-xs mb-2 font-mono">
                        <span className="opacity-70">STATUS:</span> <span className="opacity-90">OPERATIONAL</span>
                      </div>
                      
                      <div className="text-xs mb-2">
                        <span className="opacity-70">FUNCTION:</span> <span className="opacity-90">{redactDescription(station.description)}</span>
                      </div>
                      
                      <div className="dharma-code mt-3 w-full text-xs font-mono border border-[hsla(var(--dharma-green),0.3)] p-1">
                        &gt; {formatCoordinates(station.coordinates)}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
              
              <div className="text-center font-mono text-xs border-t border-[hsla(var(--dharma-gray),0.2)] pt-2 opacity-80">
                <span className="animate-terminal-blink mr-1">▉</span>
                <span>CMD: locate [station_id]</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
              <AlertCircle className="h-8 w-8 mb-4 opacity-50" />
              <p className="font-terminal">NO LOCATION DATA</p>
              <div className="dharma-code text-xs mt-4 p-1 animate-terminal-blink">
                &gt; ERROR CODE 108: DATA NOT FOUND
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Declassified Files Tab */}
        <TabsContent value="files" className="dharma-terminal-content p-3">
          {unlockedReportData.length > 0 ? (
            <>
              <div className="mb-3 border-b border-[hsla(var(--dharma-gray),0.3)] pb-2">
                <span className="dharma-terminal-label text-xs block mb-1">SYSTEM://DHARMA/ARCHIVES</span>
                <span className="dharma-terminal-value text-xs">ACCESSING DECLASSIFIED FILES</span>
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
                        <span>{report.title}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`dharma-classification ${
                          report.classification.includes('LEVEL 5') ? 'dharma-classification-3' : 
                          report.classification.includes('LEVEL 4') ? 'dharma-classification-2' : 
                          'dharma-classification-1'
                        }`}>
                          {report.classification.replace('LEVEL ', 'L')}
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="dharma-collapsible-content">
                      <div className="dharma-code text-xs mb-3 w-full text-left p-1 font-mono">
                        &gt; REF.{report.fileNumber}
                      </div>
                      
                      <div className="text-xs whitespace-pre-line">
                        {/* Split into lines and add a slight delay effect to each line */}
                        {report.content.split('\n').map((line, i) => (
                          <div 
                            key={i} 
                            className={`mb-1 ${i > 0 ? 'opacity-90' : 'opacity-100'}`}
                            style={{ animationDelay: `${i * 0.1}s` }}
                          >
                            {line}
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>

              {unlockedReportData.length === 1 && (
                <div className="text-center font-mono text-xs border-t border-[hsla(var(--dharma-gray),0.2)] pt-2 opacity-80">
                  <span className="animate-terminal-blink mr-1">▉</span>
                  <span>CMD: decrypt [file_name]</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
              <AlertCircle className="h-8 w-8 mb-4 opacity-50" />
              <p className="font-terminal">ACCESS DENIED</p>
              <p className="font-mono text-xs mt-2 opacity-70">SEC.CLEARANCE INADEQUATE</p>
              <div className="dharma-code text-xs mt-4 p-1 animate-terminal-blink">
                &gt; ERROR CODE 15: AUTHORIZATION FAILURE
              </div>
            </div>
          )}
        </TabsContent>
        
        {/* Signal Intercepts Tab */}
        <TabsContent value="signals" className="dharma-terminal-content p-3">
          {unlockedAudioLogData.length > 0 ? (
            <>
              <div className="mb-3 border-b border-[hsla(var(--dharma-gray),0.3)] pb-2">
                <span className="dharma-terminal-label text-xs block mb-1">SYSTEM://DHARMA/COMMS</span>
                <span className="dharma-terminal-value text-xs">SIGNAL ARCHIVE READY</span>
              </div>
              
              <div className="space-y-3 mb-4">
                {unlockedAudioLogData.map(log => (
                  <div 
                    key={log.key}
                    className="dharma-collapsible"
                  >
                    <div className="dharma-collapsible-trigger">
                      <div className="flex items-center text-left">
                        <span className="font-terminal">{log.title}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="dharma-code text-xs font-mono">
                          {log.duration}
                        </span>
                      </div>
                    </div>
                    
                    <div className="dharma-collapsible-content">
                      <div className="text-xs font-mono mb-2">
                        <span className="opacity-70">SOURCE:</span> <span className="opacity-90">{
                          log.unlockMethod === 'default' ? 'INTERNAL ARCHIVE' :
                          log.unlockMethod === 'terminal' ? 'RADIO INTERCEPT' :
                          log.unlockMethod === 'coordinates' ? 'BROADCAST SIGNAL' :
                          log.unlockMethod === 'sequence' ? 'RECOVERED MEDIA' :
                          log.unlockMethod === 'puzzle' ? 'SURVEILLANCE DATA' :
                          'UNKNOWN'
                        }</span>
                      </div>
                      
                      <div className="text-xs mb-3">
                        {log.description}
                      </div>
                      
                      <div className="dharma-code text-xs w-full text-center py-1 px-2 font-mono">
                        REF {log.key.toUpperCase()} [PLAY] [ANALYZE]
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {unlockedAudioLogData.length === 1 && (
                <div className="text-center font-mono text-xs border-t border-[hsla(var(--dharma-gray),0.2)] pt-2 opacity-80">
                  <span className="animate-terminal-blink mr-1">▉</span>
                  <span>CMD: tune [frequency]</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
              <Radio className="h-8 w-8 mb-4 opacity-50" />
              <p className="font-terminal">NO SIGNALS DETECTED</p>
              <div className="w-full max-w-xs h-6 mt-4 bg-[hsla(var(--dharma-gray),0.1)] relative">
                <div className="absolute inset-0 flex items-center justify-center text-xs opacity-50">
                  SCANNING...
                </div>
                <div className="h-full w-2 bg-[hsla(var(--dharma-green),0.4)] absolute left-0 animate-terminal-scan"></div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.section>
  );
};

export default LorePanel;