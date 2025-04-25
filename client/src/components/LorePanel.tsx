import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Book, FileText, Map, Radio } from 'lucide-react';
import { useLore } from '@/contexts/LoreContext';
import { INCIDENT_REPORTS, AUDIO_LOGS, STATIONS } from '@/lib/constants';

interface LorePanelProps {
  className?: string;
}

const LorePanel: React.FC<LorePanelProps> = ({ className }) => {
  const { 
    discoveredStations,
    unlockedAudioLogs,
    unlockedReports,
    storylineFlags
  } = useLore();
  
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`bg-[hsl(var(--dharma-black))] border border-[hsla(var(--dharma-gray),0.3)] rounded-lg overflow-hidden ${className}`}
    >
      <div className="bg-[hsla(var(--dharma-gray),0.2)] p-2 flex justify-between items-center">
        <h2 className="font-terminal text-[hsl(var(--dharma-amber))] flex items-center">
          <Book className="mr-2 h-4 w-4" />
          DHARMA INITIATIVE ARCHIVES
        </h2>
        <Badge variant="secondary" className="text-xs bg-[hsla(var(--dharma-gray),0.3)]">
          LEVEL 4 ACCESS GRANTED
        </Badge>
      </div>
      
      <Tabs defaultValue="stations" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-[hsla(var(--dharma-gray),0.1)]">
          <TabsTrigger value="stations">
            <Map className="h-4 w-4 mr-2" />
            Stations
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="transmissions">
            <Radio className="h-4 w-4 mr-2" />
            Transmissions
          </TabsTrigger>
        </TabsList>
        
        {/* DHARMA Stations Tab */}
        <TabsContent value="stations" className="p-4">
          <div className="space-y-4">
            <p className="text-xs text-[hsl(var(--dharma-gray))] mb-4">
              The DHARMA Initiative established multiple research stations across the island, each dedicated to a different scientific field. Coordinates and descriptions are provided for stations with confirmed locations.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.keys(STATIONS).map(stationKey => {
                const station = STATIONS[stationKey as keyof typeof STATIONS];
                const isDiscovered = discoveredStations.includes(stationKey);
                
                return (
                  <Collapsible 
                    key={stationKey}
                    open={expandedItem === stationKey}
                    onOpenChange={() => setExpandedItem(expandedItem === stationKey ? null : stationKey)}
                    className={`border rounded-md overflow-hidden ${isDiscovered 
                      ? 'border-[hsla(var(--dharma-amber),0.3)]' 
                      : 'border-[hsla(var(--dharma-gray),0.2)] opacity-50'}`}
                    disabled={!isDiscovered}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-[hsla(var(--dharma-gray),0.1)]">
                      <div className="flex items-center">
                        <span className="text-[hsl(var(--dharma-amber))]">{station.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={isDiscovered ? "default" : "outline"} className="text-xs">
                          {isDiscovered ? station.code : "UNDISCOVERED"}
                        </Badge>
                        {isDiscovered && <ChevronDown className="h-4 w-4" />}
                      </div>
                    </CollapsibleTrigger>
                    
                    {isDiscovered && (
                      <CollapsibleContent className="p-2 bg-[hsla(var(--dharma-gray),0.05)]">
                        <p className="text-sm text-[hsl(var(--dharma-gray))] mb-2">
                          {station.description}
                        </p>
                        <div className="text-xs text-[hsl(var(--dharma-amber))]">
                          Coordinates: {station.coordinates}
                        </div>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                );
              })}
            </div>
            
            {discoveredStations.length <= 1 && (
              <div className="text-center text-xs text-[hsl(var(--dharma-gray))] mt-4">
                Use the terminal to locate other stations with the command: locate [station_name]
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Incident Reports Tab */}
        <TabsContent value="reports" className="p-4">
          <div className="space-y-4">
            <p className="text-xs text-[hsl(var(--dharma-gray))] mb-4">
              Declassified reports from the DHARMA Initiative archives. These documents contain sensitive information about island incidents and anomalies.
            </p>
            
            <div className="space-y-3">
              {INCIDENT_REPORTS.map((report, index) => {
                const isUnlocked = unlockedReports.includes(index);
                
                return (
                  <Collapsible 
                    key={index}
                    open={expandedItem === `report-${index}`}
                    onOpenChange={() => setExpandedItem(expandedItem === `report-${index}` ? null : `report-${index}`)}
                    className={`border rounded-md overflow-hidden ${isUnlocked 
                      ? 'border-[hsla(var(--dharma-amber),0.3)]' 
                      : 'border-[hsla(var(--dharma-gray),0.2)] opacity-50'}`}
                    disabled={!isUnlocked}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-[hsla(var(--dharma-gray),0.1)]">
                      <div className="flex items-center text-left">
                        <span className="text-[hsl(var(--dharma-amber))]">{report.title}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={isUnlocked ? "default" : "outline"} className="text-xs whitespace-nowrap">
                          {isUnlocked ? report.classification : "CLASSIFIED"}
                        </Badge>
                        {isUnlocked && <ChevronDown className="h-4 w-4" />}
                      </div>
                    </CollapsibleTrigger>
                    
                    {isUnlocked && (
                      <CollapsibleContent className="p-2 bg-[hsla(var(--dharma-gray),0.05)]">
                        <div className="text-xs text-[hsl(var(--dharma-gray))] mb-2">
                          File: {report.fileNumber}
                        </div>
                        <div className="text-sm text-[hsl(var(--dharma-gray))] whitespace-pre-line">
                          {report.content}
                        </div>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                );
              })}
              
              {unlockedReports.length === 0 && (
                <div className="text-center text-xs text-[hsl(var(--dharma-gray))] mt-4">
                  No incident reports have been declassified yet. Continue exploring to gain access.
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Audio Transmissions Tab */}
        <TabsContent value="transmissions" className="p-4">
          <div className="space-y-4">
            <p className="text-xs text-[hsl(var(--dharma-gray))] mb-4">
              Audio transmissions and recordings captured on the island. Some transmissions may contain clues about the island's secrets.
            </p>
            
            <div className="space-y-3">
              {Object.entries(AUDIO_LOGS).map(([logId, log]) => {
                const isUnlocked = unlockedAudioLogs.includes(logId);
                
                return (
                  <div 
                    key={logId}
                    className={`border rounded-md overflow-hidden ${isUnlocked 
                      ? 'border-[hsla(var(--dharma-amber),0.3)]' 
                      : 'border-[hsla(var(--dharma-gray),0.2)] opacity-50'}`}
                  >
                    <div className="flex items-center justify-between w-full p-2 bg-[hsla(var(--dharma-gray),0.1)]">
                      <div className="flex items-center text-left">
                        <span className="text-[hsl(var(--dharma-amber))]">{log.title}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={isUnlocked ? "default" : "outline"} className="text-xs">
                          {isUnlocked ? log.duration : "LOCKED"}
                        </Badge>
                      </div>
                    </div>
                    
                    {isUnlocked && (
                      <div className="p-2 bg-[hsla(var(--dharma-gray),0.05)]">
                        <p className="text-sm text-[hsl(var(--dharma-gray))]">
                          {log.description}
                        </p>
                        {!log.unlockMethod.includes('default') && (
                          <div className="text-xs text-[hsl(var(--dharma-amber))] mt-1">
                            Source: {log.unlockMethod.charAt(0).toUpperCase() + log.unlockMethod.slice(1)}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {!isUnlocked && (
                      <div className="p-2 bg-[hsla(var(--dharma-gray),0.05)]">
                        <p className="text-xs text-[hsl(var(--dharma-gray))]">
                          This transmission has not been detected yet.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.section>
  );
};

export default LorePanel;