import React from 'react';
import { motion } from 'framer-motion';
import { INCIDENT_REPORTS } from '@/lib/constants';

interface IncidentReportsProps {
  unlockedReports: number[];
}

const IncidentReports: React.FC<IncidentReportsProps> = ({ unlockedReports }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="lg:col-span-3 bg-[hsl(var(--dharma-black))] border border-[hsla(var(--dharma-gray),0.3)] rounded-lg overflow-hidden"
    >
      <div className="bg-[hsla(var(--dharma-gray),0.2)] p-2 flex justify-between items-center">
        <h2 className="font-terminal text-[hsl(var(--dharma-amber))]">INCIDENT REPORTS</h2>
        <span className="text-xs text-[hsl(var(--dharma-red))]">TOP SECRET</span>
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {INCIDENT_REPORTS.map((report, index) => (
          <motion.div
            key={index}
            className={`border border-[hsla(var(--dharma-gray),0.3)] p-3 rounded reveal-trigger hover:bg-[hsla(var(--dharma-gray),0.1)] transition-colors`}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="font-mono text-[hsl(var(--dharma-amber))] mb-2">{report.title}</h3>
            
            <div className={`text-xs text-[hsl(var(--dharma-gray))] ${unlockedReports.includes(index) ? '' : 'hidden-content'}`}>
              {unlockedReports.includes(index) ? (
                <div className="whitespace-pre-line">{report.content}</div>
              ) : (
                <p className="text-center">
                  [REDACTED]<br />
                  ACCESS RESTRICTED
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default IncidentReports;
