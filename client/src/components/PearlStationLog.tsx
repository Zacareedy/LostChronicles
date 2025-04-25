import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PearlStationLogProps {
  isVisible: boolean;
  timestamp: string; // Timestamp of failure
}

const PearlStationLog: React.FC<PearlStationLogProps> = ({ isVisible, timestamp }) => {
  const [logEntries, setLogEntries] = useState<string[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Effect to handle log printing animation when visible
  useEffect(() => {
    if (isVisible) {
      setIsPrinting(true);
      
      // Initial system failure log entry
      const initialEntry = `SYS_FAIL_${timestamp || Date.now()}`;
      setLogEntries([initialEntry]);
      
      // Generate error log entries at intervals
      const errorMessages = [
        "ERROR: Electromagnetic anomaly detected",
        "ERROR: Failsafe protocol not executed",
        "ERROR: Swan station protocol breach",
        "ERROR: Core containment integrity compromised",
        "META: Temporal variance detected in sector 23",
        "META: Radiation levels exceeding safety parameters",
        "META: Automated alert transmitted to all stations",
        "META: Pearl monitoring systems operating at reduced capacity",
        "WARNING: Remote terminal access lost",
        "WARNING: Subject behavioral analysis interrupted",
        "ERROR: Data corruption detected in logs"
      ];
      
      let count = 0;
      const printInterval = setInterval(() => {
        if (count < errorMessages.length) {
          setLogEntries(prev => [...prev, errorMessages[count]]);
          count++;
        } else {
          clearInterval(printInterval);
          setTimeout(() => {
            setIsPrinting(false);
          }, 2000);
        }
      }, 800);
      
      return () => clearInterval(printInterval);
    } else {
      // Reset when not visible
      setLogEntries([]);
      setIsPrinting(false);
    }
  }, [isVisible, timestamp]);
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed bottom-4 right-4 w-96 max-w-full z-40"
    >
      <div className="bg-white rounded shadow-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 flex justify-between items-center border-b">
          <h3 className="font-mono text-sm font-semibold">PEARL STATION · PRINTOUT LOG</h3>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setLogEntries([])}
          >
            ✕
          </button>
        </div>
        
        <div className="p-4 bg-white font-mono text-sm">
          <div className="bg-gray-100 p-3 h-60 overflow-y-auto font-mono text-xs border border-gray-300 whitespace-pre">
            <AnimatePresence>
              {logEntries.map((entry, index) => (
                <motion.div
                  key={`log-${index}`}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-1"
                >
                  {entry}
                </motion.div>
              ))}
              {isPrinting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="text-gray-400"
                >
                  _
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="mt-3 flex justify-between text-xs text-gray-500">
            <span>P_LOG.23.42</span>
            <span className="animate-pulse">■ RECORDING</span>
          </div>
        </div>
        
        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 flex justify-between">
          <span className="text-xs font-mono text-gray-600">DHARMA INITIATIVE © 1977</span>
          <div className="flex space-x-2">
            <button className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">PRINT</button>
            <button className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">ARCHIVE</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PearlStationLog;