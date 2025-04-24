import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { INCIDENT_REPORTS } from '@/lib/constants';
import { playSound } from '@/lib/audio';

// Define the incident report type
interface IncidentReport {
  title: string;
  fileNumber: string;
  classification: string;
  content: string;
}

interface IncidentReportsProps {
  unlockedReports: number[];
}

const IncidentReports: React.FC<IncidentReportsProps> = ({ unlockedReports }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [extraUnlocks, setExtraUnlocks] = useState<number[]>([]);
  const [accessCode, setAccessCode] = useState('');
  const [showAccessField, setShowAccessField] = useState(false);
  const [accessErrorMsg, setAccessErrorMsg] = useState('');

  // Check localStorage for additional unlocked reports
  useEffect(() => {
    try {
      if (localStorage.getItem('dharma_incident_unlocked') === 'true') {
        setExtraUnlocks(prev => [...prev, 0]); // Unlock "THE INCIDENT" report
      }
      
      if (localStorage.getItem('dharma_surveillance_active') === 'true') {
        setExtraUnlocks(prev => [...prev, 2]); // Unlock "SYSTEM FAILURE LOG" report
      }
      
      // Determine if reports section should initially be visible
      // Only visible if either via props or localStorage
      setIsVisible(unlockedReports.length > 0 || 
                   localStorage.getItem('dharma_incident_unlocked') === 'true' ||
                   localStorage.getItem('dharma_surveillance_active') === 'true');
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [unlockedReports]);

  // Special effects when section becomes visible
  useEffect(() => {
    if (isVisible && unlockedReports.length === 0 && extraUnlocks.length === 0) {
      playSound('beep');
    }
  }, [isVisible, unlockedReports, extraUnlocks]);

  // Handle access code submission
  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (accessCode.toUpperCase() === 'AH/MDG-932815') {
      // This is a hidden code from the terminal command 'decrypt incident'
      setExtraUnlocks(prev => [...prev, 0]);
      try {
        localStorage.setItem('dharma_incident_unlocked', 'true');
      } catch (e) {
        // Ignore localStorage errors
      }
      playSound('success');
      setAccessErrorMsg('');
      setShowAccessField(false);
    } else if (accessCode.toUpperCase() === 'C22/DSTNGSHD-LBRT') {
      // This is the Pearl station code
      try {
        localStorage.setItem('dharma_pearl_access', 'true');
      } catch (e) {
        // Ignore localStorage errors  
      }
      playSound('success');
      setAccessErrorMsg('Recognized as Pearl station access code. Surveillance system enabled.');
    } else if (accessCode.toUpperCase() === 'OVERRIDE-D108') {
      // This is another hidden code for surveillance access
      try {
        localStorage.setItem('dharma_surveillance_active', 'true');
        setExtraUnlocks(prev => [...prev, 2]);
      } catch (e) {
        // Ignore localStorage errors
      }
      playSound('success');
      setAccessErrorMsg('');
      setShowAccessField(false);
    } else {
      playSound('fail');
      setAccessErrorMsg('Invalid access code. Level 4 security clearance required.');
    }
    
    setAccessCode('');
  };

  // Easter egg: Blinking effect for classified markings
  const [isBlinking, setIsBlinking] = useState(false);
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 200);
      }
    }, 5000);
    
    return () => clearInterval(blinkInterval);
  }, []);

  // If no reports are visible, show a minimal section
  if (!isVisible) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="lg:col-span-3 bg-[hsl(var(--dharma-black))] border border-[hsla(var(--dharma-gray),0.3)] rounded-lg overflow-hidden"
      >
        <div 
          className="bg-[hsla(var(--dharma-gray),0.2)] p-2 flex justify-between items-center"
          onClick={() => {
            // Secret click to reveal access field
            if (showAccessField) {
              setShowAccessField(false);
            } else {
              setShowAccessField(true);
              playSound('beep', 'short');
            }
          }}
        >
          <h2 className="font-terminal text-[hsl(var(--dharma-red))]">CLASSIFIED ARCHIVES</h2>
          <span className={`text-xs text-[hsl(var(--dharma-red))] ${isBlinking ? 'animate-terminal-blink' : ''}`}>
            SECURITY LEVEL 4 CLEARANCE REQUIRED
          </span>
        </div>
        
        {showAccessField && (
          <div className="p-4 border-t border-[hsla(var(--dharma-gray),0.3)]">
            <form onSubmit={handleAccessSubmit} className="flex flex-col space-y-2">
              <div className="font-terminal text-[hsl(var(--dharma-amber))] text-sm">
                ENTER ACCESS CODE:
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="flex-1 bg-[hsla(var(--dharma-gray),0.1)] border border-[hsla(var(--dharma-gray),0.3)] p-2 text-[hsl(var(--dharma-light))] focus:outline-none focus:border-[hsl(var(--dharma-amber))]"
                  placeholder="XXXXX-XXXXX"
                />
                <button
                  type="submit"
                  className="bg-[hsla(var(--dharma-gray),0.3)] hover:bg-[hsla(var(--dharma-gray),0.4)] text-[hsl(var(--dharma-amber))] px-3"
                >
                  VERIFY
                </button>
              </div>
              {accessErrorMsg && (
                <div className="text-[hsl(var(--dharma-red))] text-xs">{accessErrorMsg}</div>
              )}
              <div className="text-[hsl(var(--dharma-gray))] text-xs">
                Hint: Access codes can be found through terminal commands or hidden locations.
              </div>
            </form>
          </div>
        )}
      </motion.section>
    );
  }

  // Combine unlocked reports from props and localStorage
  const allUnlocked = Array.from(new Set([...unlockedReports, ...extraUnlocks]));

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="lg:col-span-3 bg-[hsl(var(--dharma-black))] border border-[hsla(var(--dharma-gray),0.3)] rounded-lg overflow-hidden"
    >
      <div 
        className="bg-[hsla(var(--dharma-gray),0.2)] p-2 flex justify-between items-center"
        onClick={() => {
          // Secret click to reveal access field
          if (showAccessField) {
            setShowAccessField(false);
          } else {
            setShowAccessField(true);
            playSound('beep', 'short');
          }
        }}
      >
        <h2 className="font-terminal text-[hsl(var(--dharma-amber))]">INCIDENT REPORTS</h2>
        <span className={`text-xs text-[hsl(var(--dharma-red))] ${isBlinking ? 'animate-terminal-blink' : ''}`}>
          TOP SECRET
        </span>
      </div>
      
      {showAccessField && (
        <div className="p-4 border-t border-b border-[hsla(var(--dharma-gray),0.3)]">
          <form onSubmit={handleAccessSubmit} className="flex flex-col space-y-2">
            <div className="font-terminal text-[hsl(var(--dharma-amber))] text-sm">
              ENTER ACCESS CODE FOR ADDITIONAL REPORTS:
            </div>
            <div className="flex">
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="flex-1 bg-[hsla(var(--dharma-gray),0.1)] border border-[hsla(var(--dharma-gray),0.3)] p-2 text-[hsl(var(--dharma-light))] focus:outline-none focus:border-[hsl(var(--dharma-amber))]"
                placeholder="XXXXX-XXXXX"
              />
              <button
                type="submit"
                className="bg-[hsla(var(--dharma-gray),0.3)] hover:bg-[hsla(var(--dharma-gray),0.4)] text-[hsl(var(--dharma-amber))] px-3"
              >
                VERIFY
              </button>
            </div>
            {accessErrorMsg && (
              <div className="text-[hsl(var(--dharma-red))] text-xs">{accessErrorMsg}</div>
            )}
          </form>
        </div>
      )}
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {INCIDENT_REPORTS.map((report, index) => (
          <motion.div
            key={index}
            className={`border border-[hsla(var(--dharma-gray),0.3)] p-3 rounded reveal-trigger hover:bg-[hsla(var(--dharma-gray),0.1)] transition-colors ${allUnlocked.includes(index) ? '' : 'opacity-50'}`}
            whileHover={{ scale: allUnlocked.includes(index) ? 1.02 : 1 }}
          >
            <h3 className="font-mono text-[hsl(var(--dharma-amber))] mb-2 flex justify-between items-center">
              {report.title}
              {!allUnlocked.includes(index) && (
                <span className="text-xs text-[hsl(var(--dharma-red))]">LOCKED</span>
              )}
            </h3>
            
            <div className={`text-xs ${allUnlocked.includes(index) ? 'text-[hsl(var(--dharma-light))]' : 'text-[hsl(var(--dharma-gray))]'}`}>
              {allUnlocked.includes(index) ? (
                <div className="whitespace-pre-line">
                  <div className="text-[hsl(var(--dharma-amber))] mb-2 text-xs">
                    FILE: {report.fileNumber} | CLASSIFICATION: {report.classification}
                  </div>
                  {report.content}
                  
                  {/* Secret hidden code in the incident report */}
                  {index === 0 && (
                    <div className="mt-4 text-[hsl(var(--dharma-gray))] text-xs border-t border-[hsla(var(--dharma-gray),0.3)] pt-2">
                      <div className="pearl-clue">
                        NOTE: Pearl surveillance footage from incident day shows unidentified code sequence: OVERRIDE-D108
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-1">
                  <p>[REDACTED]</p>
                  <p>ACCESS RESTRICTED</p>
                  <p className="text-[8px] mt-2 text-[hsl(var(--dharma-gray))]">
                    Authorized personnel must decrypt file via terminal access
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default IncidentReports;
