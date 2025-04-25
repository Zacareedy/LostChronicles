import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Lock, FileText, Map, Radio, Database, Shield } from 'lucide-react';
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

  // Only show discovered stations
  const discoveredStationData = Object.entries(STATIONS)
    .filter(([key]) => discoveredStations.includes(key))
    .map(([key, station]) => ({ key, ...station }));

  // Only show unlocked reports
  const unlockedReportData = unlockedReports.map(index => INCIDENT_REPORTS[index]);

  // Only show unlocked audio logs
  const unlockedAudioLogData = Object.entries(AUDIO_LOGS)
    .filter(([key]) => unlockedAudioLogs.includes(key))
    .map(([key, log]) => ({ key, ...log }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`bg-[hsl(var(--dharma-black))] border border-[hsla(var(--dharma-gray),0.3)] rounded-lg overflow-hidden ${className}`}
    >
      <div className="bg-[hsla(var(--dharma-gray),0.2)] p-2 flex justify-between items-center">
        <h2 className="font-terminal text-[hsl(var(--dharma-amber))] flex items-center">
          <Database className="mr-2 h-4 w-4" />
          DHARMA RECORDS
        </h2>
        <Badge variant="secondary" className="text-xs bg-[hsla(var(--dharma-gray),0.3)] flex items-center">
          <Shield className="mr-1 h-3 w-3" />
          SECURITY LEVEL 3
        </Badge>
      </div>
      
      <Tabs defaultValue="stations" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-[hsla(var(--dharma-gray),0.1)]">
          <TabsTrigger value="stations">
            <Map className="h-4 w-4 mr-2" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="files">
            <FileText className="h-4 w-4 mr-2" />
            Files
          </TabsTrigger>
          <TabsTrigger value="signals">
            <Radio className="h-4 w-4 mr-2" />
            Signals
          </TabsTrigger>
        </TabsList>
        
        {/* DHARMA Stations Tab */}
        <TabsContent value="stations" className="p-4">
          {discoveredStationData.length > 0 ? (
            <>
              <p className="text-xs text-[hsl(var(--dharma-gray))] mb-4">
                Confirmed DHARMA Initiative locations with verified coordinates.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {discoveredStationData.map(station => (
                  <Collapsible 
                    key={station.key}
                    open={expandedItem === station.key}
                    onOpenChange={() => setExpandedItem(expandedItem === station.key ? null : station.key)}
                    className="border border-[hsla(var(--dharma-amber),0.3)] rounded-md overflow-hidden"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-[hsla(var(--dharma-gray),0.1)]">
                      <div className="flex items-center">
                        <span className="text-[hsl(var(--dharma-amber))]">{station.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="text-xs">{station.code}</Badge>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="p-2 bg-[hsla(var(--dharma-gray),0.05)]">
                      <p className="text-sm text-[hsl(var(--dharma-gray))] mb-2">
                        {station.description}
                      </p>
                      <div className="text-xs text-[hsl(var(--dharma-amber))]">
                        Coordinates: {station.coordinates}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
              
              <p className="text-center text-xs text-[hsl(var(--dharma-gray))] mt-4 italic">
                Terminal command: locate [station_name]
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
              <Lock className="h-8 w-8 text-[hsl(var(--dharma-gray))] mb-4 opacity-50" />
              <p className="text-[hsl(var(--dharma-gray))]">No location data available.</p>
              <p className="text-xs text-[hsl(var(--dharma-gray))] mt-2 opacity-70">
                Use the terminal to locate stations.
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* Declassified Files Tab */}
        <TabsContent value="files" className="p-4">
          {unlockedReportData.length > 0 ? (
            <>
              <p className="text-xs text-[hsl(var(--dharma-gray))] mb-4">
                Declassified documents from the DHARMA Initiative archives.
              </p>
              
              <div className="space-y-3">
                {unlockedReportData.map((report, index) => (
                  <Collapsible 
                    key={index}
                    open={expandedItem === `report-${index}`}
                    onOpenChange={() => setExpandedItem(expandedItem === `report-${index}` ? null : `report-${index}`)}
                    className="border border-[hsla(var(--dharma-amber),0.3)] rounded-md overflow-hidden"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-[hsla(var(--dharma-gray),0.1)]">
                      <div className="flex items-center text-left">
                        <span className="text-[hsl(var(--dharma-amber))]">{report.title}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="text-xs whitespace-nowrap">
                          {report.classification}
                        </Badge>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="p-2 bg-[hsla(var(--dharma-gray),0.05)]">
                      <div className="text-xs text-[hsl(var(--dharma-gray))] mb-2">
                        File: {report.fileNumber}
                      </div>
                      <div className="text-sm text-[hsl(var(--dharma-gray))] whitespace-pre-line">
                        {report.content}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>

              {unlockedReportData.length === 1 && (
                <p className="text-center text-xs text-[hsl(var(--dharma-gray))] mt-4 italic">
                  Terminal command: decrypt incident
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
              <Shield className="h-8 w-8 text-[hsl(var(--dharma-gray))] mb-4 opacity-50" />
              <p className="text-[hsl(var(--dharma-gray))]">All files are classified.</p>
              <p className="text-xs text-[hsl(var(--dharma-gray))] mt-2 opacity-70">
                Higher security clearance required for access.
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* Signal Intercepts Tab */}
        <TabsContent value="signals" className="p-4">
          {unlockedAudioLogData.length > 0 ? (
            <>
              <p className="text-xs text-[hsl(var(--dharma-gray))] mb-4">
                Intercepted signals and recorded transmissions.
              </p>
              
              <div className="space-y-3">
                {unlockedAudioLogData.map(log => (
                  <div 
                    key={log.key}
                    className="border border-[hsla(var(--dharma-amber),0.3)] rounded-md overflow-hidden"
                  >
                    <div className="flex items-center justify-between w-full p-2 bg-[hsla(var(--dharma-gray),0.1)]">
                      <div className="flex items-center text-left">
                        <span className="text-[hsl(var(--dharma-amber))]">{log.title}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="text-xs">
                          {log.duration}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-2 bg-[hsla(var(--dharma-gray),0.05)]">
                      <p className="text-sm text-[hsl(var(--dharma-gray))]">
                        {log.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {unlockedAudioLogData.length === 1 && (
                <p className="text-center text-xs text-[hsl(var(--dharma-gray))] mt-4 italic">
                  Terminal command: tune 342.1
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
              <Radio className="h-8 w-8 text-[hsl(var(--dharma-gray))] mb-4 opacity-50" />
              <p className="text-[hsl(var(--dharma-gray))]">No signals detected.</p>
              <p className="text-xs text-[hsl(var(--dharma-gray))] mt-2 opacity-70">
                Use the radio equipment to scan for transmissions.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.section>
  );
};

export default LorePanel;