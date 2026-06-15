import React, { useState, useEffect, useRef } from 'react';

interface SubnetInterfaceProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  timestamp: string;
  content: string;
  isCorrupted?: boolean;
  isSystem?: boolean;
}

const SubnetInterface: React.FC<SubnetInterfaceProps> = ({ isVisible, onClose, onComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activeChannel, setActiveChannel] = useState('general');
  const [hasDownloadedLogs, setHasDownloadedLogs] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const channels = [
    { id: 'general', name: 'GENERAL', locked: false, unread: false },
    { id: 'engineering', name: 'ENGINEERING', locked: false, unread: true },
    { id: 'security', name: 'SECURITY', locked: true, unread: true },
    { id: 'medical', name: 'MEDICAL', locked: true, unread: false },
    { id: 'alvar', name: 'ALVAR.H [DIRECT]', locked: false, unread: false, direct: true },
  ];

  const channelMessages: Record<string, ChatMessage[]> = {
    general: [
      {
        id: '1', sender: 'SYSTEM', timestamp: '1980-02-07 08:42:11',
        content: 'DHARMA SUBNET PROTOCOL v2.3.4 — NODE AUTHENTICATED',
        isSystem: true
      },
      {
        id: '2', sender: 'SYSTEM', timestamp: '1980-02-07 08:42:15',
        content: 'WARNING: Communication integrity compromised. Some messages may be corrupted.',
        isSystem: true
      },
      {
        id: '3', sender: 'PIERRE.C', timestamp: '1980-02-07 09:15:33',
        content: 'All stations advised: new security protocols following the Incident. Details in Security channel.',
      },
      {
        id: '4', sender: 'STUART.R', timestamp: '1980-02-07 09:18:42',
        content: 'When does Engineering get subnet access? We need to run diagnostics on the remaining equipment.',
      },
      {
        id: '5', sender: 'PIERRE.C', timestamp: '1980-02-07 09:20:15',
        content: 'After network integrity is confirmed. We cannot risk another breach.',
      },
      {
        id: '6', sender: 'HORACE.G', timestamp: '1980-02-07 10:05:22',
        content: 'Reminder: discussion of the Incident outside authorised channels is prohibited.',
      },
      {
        id: '7', sender: 'AMY.G', timestamp: '1980-02-07 10:42:53',
        content: 'Has anyone reached Radzinsky? He was supposed to provide updated schematics for the barrier.',
      },
      {
        id: '8', sender: 'HORACE.G', timestamp: '1980-02-07 10:45:18',
        content: 'Radzinsky is on a special project. Direct all engineering concerns to Stuart.',
      },
      {
        id: '9', sender: 'PIERRE.C', timestamp: '1980-02-07 11:30:21',
        content: 'Has anyone confirmed Protocol Candle is ready for implementation? All stations must receive the signal simultaneously.',
      },
    ],
    engineering: [
      {
        id: 'e1', sender: 'SYSTEM', timestamp: '1980-02-06 14:22:05',
        content: 'ENGINEERING SUBNET — INITIALISED',
        isSystem: true
      },
      {
        id: 'e2', sender: 'STUART.R', timestamp: '1980-02-06 14:30:12',
        content: 'Signal amplifiers showing unusual readings near grid sector 16. Anyone else seeing this?',
      },
      {
        id: 'e3', sender: 'JIN.K', timestamp: '1980-02-06 14:33:45',
        content: 'Checked yesterday. EM levels within tolerance, but there is a variance every 108 minutes.',
      },
      {
        id: 'e4', sender: 'STUART.R', timestamp: '1980-02-06 14:35:22',
        content: 'That coincides with the button protocol. Leakage despite containment?',
      },
      {
        id: 'e5', sender: 'JIN.K', timestamp: '1980-02-06 14:38:17',
        content: 'Not leakage. Pattern. Logged at /systems/em_variance/log4815.dat if you want to review.',
      },
      {
        id: 'e6', sender: 'RADZINSKY.S', timestamp: '1980-02-06 15:01:33',
        content: 'Delete that data immediately. Those readings are classified under Protocol Candle.',
      },
      {
        id: 'e7', sender: 'JIN.K', timestamp: '1980-02-06 15:04:11',
        content: 'I do not have clearance for Protocol Candle. What is it?',
      },
      {
        id: 'e8', sender: 'RADZINSKY.S', timestamp: '1980-02-06 15:06:45',
        content: 'You do not need to know. Delete the data. Focus on assigned tasks.',
      },
      {
        id: 'e9', sender: 'SYSTEM', timestamp: '1980-02-06 15:10:22',
        content: 'WARNING: Message integrity compromised.',
        isSystem: true
      },
      {
        id: 'e10', sender: 'STUART.R', timestamp: '1980-02-06 16:42:15',
        content: 'Has anyone recovered the black box recordings from the supply plane? The data might help us understand the...',
        isCorrupted: true
      },
      {
        id: 'e11', sender: 'SYSTEM', timestamp: '1980-02-06 16:43:02',
        content: 'NOTE: To access classified archive documents, use access code AH/MDG-932815 on the incident archive terminal.',
        isSystem: true
      },
    ],
    alvar: [
      {
        id: 'a1', sender: 'SYSTEM', timestamp: '1980-02-05 23:59:59',
        content: 'DIRECT CHANNEL — ALVAR.H — ENCRYPTED',
        isSystem: true
      },
      {
        id: 'a2', sender: 'ALVAR.H', timestamp: '1980-02-06 00:00:01',
        content: 'I trust this channel is secure. We cannot afford another breach.',
      },
      {
        id: 'a3', sender: 'PIERRE.C', timestamp: '1980-02-06 00:01:15',
        content: 'Yes, Dr. Hanso. Direct link using the new encryption protocols.',
      },
      {
        id: 'a4', sender: 'ALVAR.H', timestamp: '1980-02-06 00:03:42',
        content: 'The Incident has complicated matters. The Valenzetti parameters are shifting.',
      },
      {
        id: 'a5', sender: 'PIERRE.C', timestamp: '1980-02-06 00:05:08',
        content: 'How bad? Do we need to evacuate remaining personnel?',
      },
      {
        id: 'a6', sender: 'ALVAR.H', timestamp: '1980-02-06 00:08:23',
        content: 'No evacuations. We have invested too much. The Incident may have created an opportunity.',
      },
      {
        id: 'a7', sender: 'PIERRE.C', timestamp: '1980-02-06 00:09:44',
        content: 'An opportunity? Several of our people died.',
      },
      {
        id: 'a8', sender: 'ALVAR.H', timestamp: '1980-02-06 00:12:15',
        content: 'Unfortunate but unavoidable. The electromagnetic properties we uncovered could be the key to manipulating the Valenzetti variables.',
      },
      {
        id: 'a9', sender: 'PIERRE.C', timestamp: '1980-02-06 00:15:33',
        content: 'And Protocol Candle? Proceed with implementation?',
      },
      {
        id: 'a10', sender: 'ALVAR.H', timestamp: '1980-02-06 00:18:08',
        content: 'Protocol Candle is our failsafe. Last resort only if temporal distortion reaches critical levels. For now: maintain the button protocol at all costs.',
      },
      {
        id: 'a11', sender: 'SYSTEM', timestamp: '1980-02-06 00:20:00',
        content: 'WARNING: Connection terminated unexpectedly. Remaining logs corrupted.',
        isSystem: true
      },
    ],
  };

  useEffect(() => {
    if (!isVisible) return;
    setIsLoading(true);
    setConnectionAttempts(0);

    const t1 = setTimeout(() => setConnectionAttempts(1), 1200);
    const t2 = setTimeout(() => setConnectionAttempts(2), 2400);
    const t3 = setTimeout(() => {
      setIsLoading(false);
      setMessages(channelMessages['general']);
    }, 3600);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isVisible]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const switchChannel = (id: string) => {
    const ch = channels.find(c => c.id === id);
    if (ch?.locked) {
      addSystemMsg('ACCESS DENIED — Insufficient clearance for this channel.');
      return;
    }
    setActiveChannel(id);
    setMessages(channelMessages[id] || []);
  };

  const addSystemMsg = (content: string) => {
    setMessages(prev => [...prev, {
      id: `sys-${Date.now()}`,
      sender: 'SYSTEM',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      content,
      isSystem: true,
    }]);
  };

  const handleCommand = (cmd: string) => {
    const lower = cmd.toLowerCase().trim();
    if (lower === '/help') {
      addSystemMsg('Commands: /help  /clear  /download  /exit');
    } else if (lower === '/clear') {
      setMessages([]);
    } else if (lower === '/download') {
      addSystemMsg('Downloading subnet logs...');
      setTimeout(() => {
        addSystemMsg('Download complete. Logs saved to /logs/subnet/');
        setHasDownloadedLogs(true);
        if (!isCompleted) {
          setTimeout(() => {
            addSystemMsg('NOTICE: Critical data recovered. Access code OVERRIDE-D108 extracted from logs.');
            setIsCompleted(true);
            setTimeout(onComplete, 2000);
          }, 1500);
        }
      }, 2000);
    } else if (lower === '/exit') {
      onClose();
    } else {
      addSystemMsg(`Unknown command: ${cmd}`);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val) return;

    if (val.startsWith('/')) {
      handleCommand(val);
      setInputValue('');
      return;
    }

    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      sender: 'OPERATOR',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      content: val,
    }]);

    const upper = val.toUpperCase();
    if (upper.includes('PROTOCOL CANDLE') || upper.includes('VALENZETTI') || upper.includes('INCIDENT')) {
      setTimeout(() => {
        addSystemMsg('WARNING: This channel is monitored. Discussion of classified material is restricted.');
      }, 900);
    }

    setInputValue('');
  };

  if (!isVisible) return null;

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 10000,
    background: 'rgba(0,0,0,0.92)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'VT323', monospace",
  };

  const win: React.CSSProperties = {
    width: 820, maxWidth: '97vw', height: '85vh',
    border: '1px solid var(--bd2)',
    background: 'var(--panel)',
    display: 'flex', flexDirection: 'column',
  };

  const titleBar: React.CSSProperties = {
    borderBottom: '1px solid var(--bd)',
    background: 'var(--ph-faint)',
    padding: '6px 14px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: 13, letterSpacing: 2, color: 'var(--ph-dim)',
  };

  const senderColor = (sender: string, isSystem?: boolean) => {
    if (isSystem) return 'var(--ph)';
    if (sender === 'ALVAR.H') return '#c080ff';
    if (sender === 'PIERRE.C') return 'var(--am)';
    if (sender === 'RADZINSKY.S') return 'var(--red)';
    if (sender === 'OPERATOR') return 'var(--ph)';
    return 'var(--ph-mid)';
  };

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={win}>
        {/* Title bar */}
        <div style={titleBar}>
          <span>DHARMA SUBNET PROTOCOL v2.3.4 — RESTRICTED</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ph-dim)', fontFamily: "'VT323', monospace", fontSize: 16 }}>
            [X]
          </button>
        </div>

        {isLoading ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--ph-dim)', fontSize: 16 }}>
            <div style={{ marginBottom: 20 }}>{'> '}DHARMA INITIATIVE SUBNET PROTOCOL v2.3.4</div>
            <div>{'> '}CONNECTING TO MAINFRAME</div>
            <div style={{ color: 'var(--am)', marginTop: 8 }}>{'> '}CONNECTION ATTEMPT {connectionAttempts}/3</div>
            <div style={{ marginTop: 20, width: 300, height: 8, border: '1px solid var(--bd)', background: 'var(--bg)' }}>
              <div style={{ height: '100%', width: `${connectionAttempts * 33}%`, background: 'var(--ph-dim)', transition: 'width 0.4s' }} />
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Sidebar */}
            <div style={{ width: 190, borderRight: '1px solid var(--bd)', padding: '12px 10px', display: 'flex', flexDirection: 'column', fontSize: 13 }}>
              <div style={{ color: 'var(--am)', fontSize: 9, letterSpacing: 5, marginBottom: 10 }}>CHANNELS</div>
              {channels.filter(c => !c.direct).map(ch => (
                <button key={ch.id} onClick={() => switchChannel(ch.id)} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '4px 6px',
                  background: activeChannel === ch.id ? 'var(--ph-faint)' : 'transparent',
                  border: 'none', cursor: 'pointer', fontFamily: "'VT323', monospace", fontSize: 13,
                  color: ch.locked ? 'var(--dim)' : activeChannel === ch.id ? 'var(--ph)' : 'var(--ph-dim)',
                  letterSpacing: 1,
                }}>
                  {ch.locked ? '[LOCKED] ' : '> '}{ch.name}
                  {ch.unread && !ch.locked && <span style={{ color: 'var(--am)', marginLeft: 6 }}>*</span>}
                </button>
              ))}

              <div style={{ color: 'var(--am)', fontSize: 9, letterSpacing: 5, margin: '16px 0 10px' }}>DIRECT</div>
              {channels.filter(c => c.direct).map(ch => (
                <button key={ch.id} onClick={() => switchChannel(ch.id)} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '4px 6px',
                  background: activeChannel === ch.id ? 'var(--ph-faint)' : 'transparent',
                  border: 'none', cursor: 'pointer', fontFamily: "'VT323', monospace", fontSize: 13,
                  color: activeChannel === ch.id ? 'var(--ph)' : 'var(--ph-dim)', letterSpacing: 1,
                }}>
                  {'> '}{ch.name}
                </button>
              ))}

              <div style={{ marginTop: 'auto' }}>
                <button onClick={() => handleCommand('/download')} style={{
                  width: '100%', padding: '6px 4px', cursor: 'pointer',
                  border: '1px solid var(--bd)', background: hasDownloadedLogs ? 'var(--ph-faint)' : 'transparent',
                  fontFamily: "'VT323', monospace", fontSize: 12, letterSpacing: 1,
                  color: hasDownloadedLogs ? 'var(--ph)' : 'var(--ph-dim)',
                }}>
                  {hasDownloadedLogs ? '[LOGS ARCHIVED]' : '[BACKUP LOGS]'}
                </button>
              </div>
            </div>

            {/* Chat area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0 0 0 0' }}>
              <div style={{ borderBottom: '1px solid var(--bd)', padding: '6px 14px', fontSize: 12, color: 'var(--am)', letterSpacing: 2 }}>
                {activeChannel === 'alvar' ? '[USER: ALVAR.H]' : `[CHANNEL: ${activeChannel.toUpperCase()}]`}
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', fontSize: 12, lineHeight: 1.6 }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--dim)', letterSpacing: 1 }}>
                      <span style={{ color: senderColor(msg.sender, msg.isSystem) }}>
                        {msg.isSystem ? '[SYSTEM]' : `[${msg.sender}]`}
                      </span>
                      {' '}
                      <span>{msg.timestamp}</span>
                      {msg.isCorrupted && <span style={{ color: 'var(--red)', marginLeft: 8 }}>[DATA CORRUPTED]</span>}
                    </div>
                    <div style={{
                      color: msg.isSystem ? 'var(--ph-mid)' : msg.isCorrupted ? 'var(--dim)' : 'var(--ph-dim)',
                      fontStyle: msg.isCorrupted ? 'italic' : 'normal',
                      paddingLeft: 8,
                    }}>
                      {msg.isCorrupted ? `${msg.content}... <ERROR: DATA UNRECOVERABLE>` : msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} style={{ borderTop: '1px solid var(--bd)', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--ph-mid)', fontSize: 14, flexShrink: 0 }}>&gt;:</span>
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="message or /command"
                  autoFocus
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    fontFamily: "'VT323', monospace", fontSize: 14, color: 'var(--ph)',
                  }}
                />
                <button type="submit" style={{
                  background: 'transparent', border: '1px solid var(--bd)', cursor: 'pointer',
                  fontFamily: "'VT323', monospace", fontSize: 13, color: 'var(--ph-dim)', padding: '2px 12px',
                }}>
                  SEND
                </button>
              </form>
            </div>
          </div>
        )}

        {isCompleted && (
          <div style={{ padding: '8px 14px', borderTop: '1px solid var(--bd)', color: 'var(--ph)', fontSize: 13, letterSpacing: 1 }}>
            [+] SUBNET LOGS ARCHIVED — Access code extracted from engineering channel.
          </div>
        )}
      </div>
    </div>
  );
};

export default SubnetInterface;
