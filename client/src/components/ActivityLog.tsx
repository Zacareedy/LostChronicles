import { useEffect, useRef } from 'react';

interface LogEntry {
  text: string;
  cls: 'normal' | 'hi' | 'am' | 'er';
  time: string;
}

interface ActivityLogProps {
  entries: LogEntry[];
}

const entryColor: Record<LogEntry['cls'], string> = {
  normal: 'var(--ph-dim)',
  hi: 'var(--ph)',
  am: 'var(--am)',
  er: 'var(--red)',
};

export default function ActivityLog({ entries }: ActivityLogProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div
      style={{
        border: '1px solid var(--bd)',
        background: 'var(--panel)',
        padding: '16px 20px',
        fontFamily: "'VT323', monospace",
      }}
    >
      <div
        style={{
          color: 'var(--am)',
          fontFamily: "'VT323', monospace",
          fontSize: '14px',
          marginBottom: '8px',
          letterSpacing: '0.05em',
        }}
      >
        ACTIVITY LOG
      </div>
      <div
        id="logOut"
        ref={logRef}
        style={{
          height: '200px',
          overflowY: 'auto',
        }}
      >
        {entries.map((entry, index) => (
          <div
            key={index}
            style={{
              color: entryColor[entry.cls],
              fontFamily: "'VT323', monospace",
              fontSize: '12px',
              lineHeight: 1.95,
            }}
          >
            {`[${entry.time}] ${entry.text}`}
          </div>
        ))}
      </div>
    </div>
  );
}
