import React, { useState, useEffect, useRef } from 'react';
import { processCommand, getCommandHistory, addToHistory } from '@/lib/terminal';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  onCorrectSequence: () => void;
  cl5Unlocked: boolean;
  onOpenSubnet?: () => void;
  onOpenIncidentArchive?: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose, onOpenSubnet, onOpenIncidentArchive }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [historyIdx, setHistoryIdx] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial greeting on open
  useEffect(() => {
    if (isOpen) {
      setLines([
        `<span class="th">DHARMA INITIATIVE — SWAN STATION INTRANET — NODE SWN-7</span>`,
        `<span class="td">Type HELP for available commands.</span>`,
        `<span class="td">————————————————————————————————————</span>`,
      ]);
      setInputVal('');
      setHistoryIdx(-1);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  // Escape key closes
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputVal.trim();
    if (!raw) return;

    const display = raw.toUpperCase();
    addToHistory(raw);

    // Add the typed command to output
    const withCmd: string[] = [
      ...lines,
      `<span class="tm">&gt;: ${display}</span>`,
    ];

    const result = processCommand(raw);

    if (result.length === 1 && result[0] === '__CLEAR__') {
      setLines([]);
      setInputVal('');
      setHistoryIdx(-1);
      return;
    }

    if (result.length === 1 && result[0] === '__EXIT__') {
      onClose();
      return;
    }

    if (result.length === 1 && result[0] === '__SUBNET__') {
      onClose();
      onOpenSubnet?.();
      return;
    }

    if (result.length === 1 && result[0] === '__INCIDENT_ARCHIVE__') {
      onClose();
      onOpenIncidentArchive?.();
      return;
    }

    setLines([...withCmd, ...result]);
    setInputVal('');
    setHistoryIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const history = getCommandHistory();
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = Math.min(historyIdx + 1, history.length - 1);
      setHistoryIdx(newIdx);
      if (history.length > 0 && newIdx >= 0) {
        setInputVal(history[history.length - 1 - newIdx] ?? '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIdx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(newIdx);
      if (newIdx === -1) {
        setInputVal('');
      } else {
        setInputVal(history[history.length - 1 - newIdx] ?? '');
      }
    }
  };

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 10000,
    background: 'rgba(0,0,0,0.88)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const windowStyle: React.CSSProperties = {
    width: 760,
    maxWidth: '97vw',
    border: '1px solid var(--bd2)',
    background: 'var(--panel)',
    fontFamily: "'VT323', monospace",
  };

  const titleBarStyle: React.CSSProperties = {
    background: 'var(--ph-faint)',
    borderBottom: '1px solid var(--bd)',
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: "'VT323', monospace",
    fontSize: 13,
    letterSpacing: 2,
    color: 'var(--ph-dim)',
  };

  const outputStyle: React.CSSProperties = {
    height: 400,
    overflowY: 'auto',
    padding: '12px 14px',
    fontFamily: "'VT323', monospace",
    fontSize: 13,
    lineHeight: 1.8,
    background: '#010601',
    color: 'var(--ph-dim)',
  };

  const inputRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    borderTop: '1px solid var(--bd)',
    padding: '8px 14px',
    background: '#010601',
  };

  const promptStyle: React.CSSProperties = {
    fontFamily: "'VT323', monospace",
    fontSize: 14,
    color: 'var(--ph-mid)',
    marginRight: 6,
    flexShrink: 0,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: "'VT323', monospace",
    fontSize: 14,
    color: 'var(--ph)',
    textTransform: 'uppercase',
  };

  return (
    <div
      className="overlay"
      id="termOverlay"
      style={overlayStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="term-win" style={windowStyle}>
        {/* Title bar */}
        <div style={titleBarStyle}>
          <span>SWAN STATION — INTRANET NODE SWN-7 — CLEARANCE 4</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'VT323', monospace",
              fontSize: 16,
              color: 'var(--ph-dim)',
              padding: '0 4px',
            }}
          >
            [X]
          </button>
        </div>

        {/* Output area */}
        <div id="termOut" ref={outputRef} style={outputStyle}>
          {lines.map((line, i) => (
            <div
              key={i}
              dangerouslySetInnerHTML={{ __html: line }}
            />
          ))}
        </div>

        {/* Input row */}
        <form onSubmit={handleSubmit} style={inputRowStyle}>
          <span style={promptStyle}>&gt;:</span>
          <input
            ref={inputRef}
            style={inputStyle}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
        </form>
      </div>
    </div>
  );
};

export default Terminal;
