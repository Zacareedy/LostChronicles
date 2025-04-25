import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Book, Search, History, Compass, Users } from 'lucide-react';
import { useLore, ProgressionPath } from '@/contexts/LoreContext';

interface LorePanelProps {
  className?: string;
}

const LorePanel: React.FC<LorePanelProps> = ({ className }) => {
  const { 
    progressionLevel,
    storylineFlags,
    discoveredStations,
    unlockedAudioLogs,
    unlockedReports
  } = useLore();
  
  const [expandedStoryline, setExpandedStoryline] = useState<string | null>(null);
  
  // Helper function to get color based on progression level
  const getProgressColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-gray-400';
      case 1: return 'bg-blue-500';
      case 2: return 'bg-green-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-orange-500';
      case 5: return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };
  
  // Get descriptive text for each progression path
  const getProgressionDescription = (path: ProgressionPath, level: number) => {
    const descriptions = {
      [ProgressionPath.DHARMA_HISTORY]: [
        'No information available',
        'Basic knowledge of DHARMA Initiative',
        'Discovered multiple DHARMA stations',
        'Learned about DHARMA research projects',
        'Uncovered DHARMA station purposes',
        'Full understanding of DHARMA Initiative history'
      ],
      [ProgressionPath.INCIDENT_INVESTIGATION]: [
        'No knowledge of the Incident',
        'Aware of electromagnetic anomaly',
        'Basic details of the Incident revealed',
        'Detailed Incident timeline discovered',
        'Cause of the Incident uncovered',
        'Complete understanding of the Incident'
      ],
      [ProgressionPath.ISLAND_SECRETS]: [
        'No special knowledge of the Island',
        'Awareness of Island\'s unique properties',
        'Discovery of Island\'s electromagnetic nature',
        'Understanding of Island\'s hidden locations',
        'Knowledge of Island\'s temporal anomalies',
        'Full comprehension of the Island\'s secrets'
      ],
      [ProgressionPath.CHARACTER_STORIES]: [
        'No character information',
        'Basic information about island inhabitants',
        'Knowledge of major island events',
        'Understanding of character connections',
        'Deep knowledge of character motivations',
        'Complete character history and timeline'
      ]
    };
    
    return descriptions[path][level] || 'Unknown';
  };
  
  // Icon for each path
  const pathIcons = {
    [ProgressionPath.DHARMA_HISTORY]: <History className="h-4 w-4" />,
    [ProgressionPath.INCIDENT_INVESTIGATION]: <Search className="h-4 w-4" />,
    [ProgressionPath.ISLAND_SECRETS]: <Compass className="h-4 w-4" />,
    [ProgressionPath.CHARACTER_STORIES]: <Users className="h-4 w-4" />
  };
  
  // Friendly names for each path
  const pathNames = {
    [ProgressionPath.DHARMA_HISTORY]: 'DHARMA History',
    [ProgressionPath.INCIDENT_INVESTIGATION]: 'The Incident',
    [ProgressionPath.ISLAND_SECRETS]: 'Island Secrets',
    [ProgressionPath.CHARACTER_STORIES]: 'Character Stories'
  };

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
          LORE DATABASE
        </h2>
        <Badge variant="secondary" className="text-xs bg-[hsla(var(--dharma-gray),0.3)]">
          {Object.values(progressionLevel).reduce((acc, val) => acc + val, 0)}/20
        </Badge>
      </div>
      
      <Tabs defaultValue="paths" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-[hsla(var(--dharma-gray),0.1)]">
          <TabsTrigger value="paths">Storylines</TabsTrigger>
          <TabsTrigger value="discoveries">Discoveries</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        {/* Main progression paths tab */}
        <TabsContent value="paths" className="p-4">
          <div className="space-y-4">
            {Object.keys(progressionLevel).map((path) => (
              <Collapsible 
                key={path}
                open={expandedStoryline === path}
                onOpenChange={() => setExpandedStoryline(expandedStoryline === path ? null : path)}
                className="border border-[hsla(var(--dharma-gray),0.2)] rounded-md overflow-hidden"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-[hsla(var(--dharma-gray),0.1)]">
                  <div className="flex items-center space-x-2">
                    <span>{pathIcons[path as ProgressionPath]}</span>
                    <span className="text-[hsl(var(--dharma-amber))]">{pathNames[path as ProgressionPath]}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      className={`${getProgressColor(progressionLevel[path as ProgressionPath])} text-white`}
                    >
                      Level {progressionLevel[path as ProgressionPath]}
                    </Badge>
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="p-3 bg-[hsla(var(--dharma-gray),0.05)]">
                  <Progress 
                    value={progressionLevel[path as ProgressionPath] * 20} 
                    className="h-2 mb-2" 
                  />
                  <p className="text-sm text-[hsl(var(--dharma-gray))] mb-2">
                    {getProgressionDescription(path as ProgressionPath, progressionLevel[path as ProgressionPath])}
                  </p>
                  
                  {/* Related discoveries based on the path */}
                  {path === ProgressionPath.DHARMA_HISTORY && progressionLevel[path as ProgressionPath] > 0 && (
                    <div className="mt-2 pt-2 border-t border-[hsla(var(--dharma-gray),0.2)]">
                      <h4 className="text-xs text-[hsl(var(--dharma-amber))] mb-2">RELATED DISCOVERIES:</h4>
                      <div className="flex flex-wrap gap-2">
                        {discoveredStations.map(station => (
                          <Badge key={station} variant="outline" className="text-xs">
                            {station.charAt(0).toUpperCase() + station.slice(1)} Station
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {path === ProgressionPath.INCIDENT_INVESTIGATION && progressionLevel[path as ProgressionPath] > 0 && (
                    <div className="mt-2 pt-2 border-t border-[hsla(var(--dharma-gray),0.2)]">
                      <h4 className="text-xs text-[hsl(var(--dharma-amber))] mb-2">DECLASSIFIED FILES:</h4>
                      <div className="flex flex-wrap gap-2">
                        {unlockedReports.map(report => (
                          <Badge key={report} variant="outline" className="text-xs">
                            Report #{report+1}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {path === ProgressionPath.ISLAND_SECRETS && progressionLevel[path as ProgressionPath] >= 3 && storylineFlags.islandMagnetismRevealed && (
                    <div className="mt-2 pt-2 border-t border-[hsla(var(--dharma-gray),0.2)]">
                      <h4 className="text-xs text-[hsl(var(--dharma-amber))] mb-2">KEY DISCOVERY:</h4>
                      <p className="text-xs text-[hsl(var(--dharma-gray))]">The island contains a unique electromagnetic pocket with temporal displacement properties. The DHARMA Initiative built stations to harness and study this energy.</p>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </TabsContent>
        
        {/* Discoveries tab */}
        <TabsContent value="discoveries" className="p-4">
          <div className="space-y-4">
            <div className="border border-[hsla(var(--dharma-gray),0.2)] rounded-md overflow-hidden">
              <div className="p-3 bg-[hsla(var(--dharma-gray),0.1)]">
                <h3 className="text-[hsl(var(--dharma-amber))]">Stations Discovered</h3>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2">
                {Object.keys(discoveredStations).length > 0 ? (
                  discoveredStations.map(station => (
                    <Badge key={station} variant="outline" className="text-xs flex items-center justify-between">
                      <span>{station.charAt(0).toUpperCase() + station.slice(1)}</span>
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-[hsl(var(--dharma-gray))] col-span-2">No stations discovered yet.</p>
                )}
              </div>
            </div>
            
            <div className="border border-[hsla(var(--dharma-gray),0.2)] rounded-md overflow-hidden">
              <div className="p-3 bg-[hsla(var(--dharma-gray),0.1)]">
                <h3 className="text-[hsl(var(--dharma-amber))]">Audio Logs Unlocked</h3>
              </div>
              <div className="p-3 grid grid-cols-1 gap-2">
                {unlockedAudioLogs.length > 0 ? (
                  unlockedAudioLogs.map(log => (
                    <Badge key={log} variant="secondary" className="text-xs justify-start">
                      {log.split(/(?=[A-Z])/).join(" ").replace(/^./, str => str.toUpperCase())}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-[hsl(var(--dharma-gray))]">No audio logs unlocked yet.</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Timeline tab */}
        <TabsContent value="timeline" className="p-4">
          <div className="space-y-4">
            <div className="border-l-2 border-[hsla(var(--dharma-gray),0.3)] pl-4 space-y-4">
              <div>
                <Badge variant="outline" className="mb-2">1970</Badge>
                <h4 className="text-[hsl(var(--dharma-amber))]">DHARMA Initiative Founded</h4>
                <p className="text-xs text-[hsl(var(--dharma-gray))]">The DHARMA Initiative is established by the Hanso Foundation.</p>
              </div>
              
              {progressionLevel[ProgressionPath.DHARMA_HISTORY] >= 2 && (
                <div>
                  <Badge variant="outline" className="mb-2">1974</Badge>
                  <h4 className="text-[hsl(var(--dharma-amber))]">First Research Stations</h4>
                  <p className="text-xs text-[hsl(var(--dharma-gray))]">Construction of first DHARMA stations begins on the island.</p>
                </div>
              )}
              
              {progressionLevel[ProgressionPath.INCIDENT_INVESTIGATION] >= 1 && (
                <div>
                  <Badge variant="outline" className="mb-2">1977</Badge>
                  <h4 className="text-[hsl(var(--dharma-amber))]">The Incident</h4>
                  <p className="text-xs text-[hsl(var(--dharma-gray))]">A catastrophic event at the Swan construction site requires immediate containment protocols.</p>
                </div>
              )}
              
              {progressionLevel[ProgressionPath.DHARMA_HISTORY] >= 3 && (
                <div>
                  <Badge variant="outline" className="mb-2">1980</Badge>
                  <h4 className="text-[hsl(var(--dharma-amber))]">Protocol Implementation</h4>
                  <p className="text-xs text-[hsl(var(--dharma-gray))]">The button protocol is established at the Swan station to prevent system failure.</p>
                </div>
              )}
              
              {progressionLevel[ProgressionPath.INCIDENT_INVESTIGATION] >= 3 && (
                <div>
                  <Badge variant="outline" className="mb-2">1984</Badge>
                  <h4 className="text-[hsl(var(--dharma-amber))]">First System Failure</h4>
                  <p className="text-xs text-[hsl(var(--dharma-gray))]">First documented system failure occurs at the Swan station.</p>
                </div>
              )}
              
              {progressionLevel[ProgressionPath.ISLAND_SECRETS] >= 4 && (
                <div>
                  <Badge variant="outline" className="mb-2">1987</Badge>
                  <h4 className="text-[hsl(var(--dharma-amber))]">Orchid Station Completion</h4>
                  <p className="text-xs text-[hsl(var(--dharma-gray))]">Experiments with time displacement begin at the Orchid station.</p>
                </div>
              )}
              
              {progressionLevel[ProgressionPath.CHARACTER_STORIES] >= 2 && (
                <div>
                  <Badge variant="outline" className="mb-2">1988</Badge>
                  <h4 className="text-[hsl(var(--dharma-amber))]">French Science Team</h4>
                  <p className="text-xs text-[hsl(var(--dharma-gray))]">A French research team led by Danielle Rousseau is shipwrecked on the island.</p>
                </div>
              )}
            </div>
            
            {Object.values(progressionLevel).reduce((acc, val) => acc + val, 0) < 5 && (
              <p className="text-center text-xs text-[hsl(var(--dharma-gray))]">
                Continue exploring to unlock more timeline events.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </motion.section>
  );
};

export default LorePanel;