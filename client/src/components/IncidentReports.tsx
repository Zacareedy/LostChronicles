import React, { useState, useEffect } from 'react';

interface IncidentReport {
  title: string;
  fileNumber: string;
  classification: string;
  content: string;
  accessCode: string;
}

interface IncidentReportsProps {
  isVisible: boolean;
  onClose: () => void;
}

const REPORTS: IncidentReport[] = [
  {
    title: 'THE INCIDENT — 1977',
    fileNumber: 'AH/MDG-7715',
    classification: 'LEVEL 5 — TOP SECRET',
    accessCode: 'AH/MDG-932815',
    content: `DATE: 1977-09-22

Following the energy release at the Swan construction site, all non-essential personnel have been evacuated from the island. Dr. Chang has implemented new containment protocols requiring operator input every 108 minutes.

The drilling operation penetrated an electromagnetic anomaly of unprecedented magnitude. Several DHARMA personnel were killed or severely injured when metal objects were violently drawn to the breached pocket.

Dr. DeGroot has mandated construction of a specialised computer system to discharge the energy buildup. Radzinsky's containment solution will be implemented immediately.

CONTAINMENT FAILURE MAY RESULT IN ANOTHER INCIDENT.

Personnel are instructed not to discuss these events with anyone without Level 5 clearance.`
  },
  {
    title: 'ELECTROMAGNETIC ANOMALY',
    fileNumber: 'RS/SD-4216',
    classification: 'LEVEL 4 — CLASSIFIED',
    accessCode: '',
    content: `DATE: 1977-10-04

Readings indicate the pocket beneath the Swan station continues to build energy at an exponential rate. The button protocol must be maintained to discharge this energy and prevent catastrophic failure.

Analysis of the anomaly suggests a connection to the unique properties of the island. The pocket appears to contain exotic matter with unusual temporal properties.

Preliminary experiments indicate the energy has unusual effects on electronic equipment and possibly human memory. Several test subjects have reported disorientation and "flashes" of events they claim have not yet occurred.

Further research suspended due to safety concerns. Swan station will operate on containment protocol only until further notice.`
  },
  {
    title: 'SYSTEM FAILURE LOG — 1984',
    fileNumber: 'DC/SW-0108',
    classification: 'LEVEL 5 — TOP SECRET',
    accessCode: 'OVERRIDE-D108',
    content: `SYSTEM FAILURE RECORD: 1984-11-27

FAILURE DURATION: 3 hours, 54 minutes
ENERGY DISCHARGE: None detected
EFFECTS:
— Magnetic attraction increased by 400%
— Multiple system failures across all stations
— Temporal anomalies reported by Pearl observers
— Station structural integrity compromised
— Medical emergencies: 2 fatalities, 5 injuries

CAUSE OF FAILURE:
Operator failed to input code sequence within designated timeframe. Subject reported "hearing voices" and deliberately abandoned protocol.

POST-FAILURE PROTOCOL:
— Subject terminated from DHARMA Initiative
— Pearl observation duties expanded
— Fail-safe mechanism installed (AUTHORISED BY: ALVAR HANSO)
— Orientation film revised to emphasise compliance

NOTE: The psychological impact of extended duty at the Swan requires further study. Recommend rotation of personnel every 540 days maximum.`
  }
];

export default function IncidentReports({ isVisible, onClose }: IncidentReportsProps) {
  const [accessCode, setAccessCode] = useState('');
  const [accessError, setAccessError] = useState('');
  const [unlockedReports, setUnlockedReports] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('dharma_unlocked_reports');
    return saved ? new Set(JSON.parse(saved)) : new Set([1]); // Report index 1 is unlocked by default
  });
  const [selectedReport, setSelectedReport] = useState<number | null>(null);

  useEffect(() => {
    if (isVisible) {
      setSelectedReport(null);
      setAccessCode('');
      setAccessError('');
    }
  }, [isVisible]);

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = accessCode.trim().toUpperCase();

    const matchIdx = REPORTS.findIndex(r => r.accessCode && r.accessCode === code);
    if (matchIdx !== -1) {
      const next = new Set(unlockedReports);
      next.add(matchIdx);
      setUnlockedReports(next);
      localStorage.setItem('dharma_unlocked_reports', JSON.stringify(Array.from(next)));
      setAccessError('');
      setAccessCode('');
      setSelectedReport(matchIdx);
    } else {
      setAccessError('ACCESS DENIED — Code not recognised. Level 4 clearance required.');
    }
  };

  if (!isVisible) return null;

  const overlay: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 10000,
    background: 'rgba(0,0,0,0.92)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'VT323', monospace",
  };

  const win: React.CSSProperties = {
    width: 820, maxWidth: '97vw', maxHeight: '90vh',
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

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={win}>
        {/* Title bar */}
        <div style={titleBar}>
          <span>CLASSIFIED ARCHIVE — INCIDENT REPORTS — CLEARANCE 4+</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ph-dim)', fontFamily: "'VT323', monospace", fontSize: 16 }}>
            [X]
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar: report list */}
          <div style={{ width: 220, borderRight: '1px solid var(--bd)', padding: '12px 10px', overflowY: 'auto', fontSize: 13 }}>
            <div style={{ color: 'var(--am)', fontSize: 9, letterSpacing: 5, marginBottom: 12 }}>REPORTS</div>
            {REPORTS.map((r, i) => {
              const unlocked = unlockedReports.has(i);
              return (
                <button key={i} onClick={() => unlocked ? setSelectedReport(i) : undefined}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '6px 8px',
                    marginBottom: 6, cursor: unlocked ? 'pointer' : 'default',
                    background: selectedReport === i ? 'var(--ph-faint)' : 'transparent',
                    border: '1px solid var(--bd)', fontFamily: "'VT323', monospace",
                    fontSize: 12, letterSpacing: 1,
                    color: unlocked ? (selectedReport === i ? 'var(--ph)' : 'var(--ph-dim)') : 'var(--dim)',
                  }}
                >
                  <div>{r.title}</div>
                  <div style={{ fontSize: 10, color: unlocked ? 'var(--dim)' : 'var(--red)', marginTop: 2 }}>
                    {unlocked ? r.classification : '[LOCKED]'}
                  </div>
                </button>
              );
            })}

            {/* Access code form */}
            <div style={{ marginTop: 20, borderTop: '1px solid var(--bd)', paddingTop: 12 }}>
              <div style={{ color: 'var(--am)', fontSize: 9, letterSpacing: 4, marginBottom: 8 }}>ACCESS CODE</div>
              <form onSubmit={handleAccessSubmit}>
                <input
                  type="text"
                  value={accessCode}
                  onChange={e => { setAccessCode(e.target.value); setAccessError(''); }}
                  placeholder="ENTER CODE"
                  style={{
                    width: '100%', background: 'var(--bg)', border: '1px solid var(--bd)',
                    color: 'var(--ph)', fontFamily: "'VT323', monospace", fontSize: 13,
                    padding: '4px 6px', boxSizing: 'border-box', outline: 'none', marginBottom: 6,
                  }}
                />
                <button type="submit" style={{
                  width: '100%', background: 'transparent', border: '1px solid var(--bd)',
                  color: 'var(--ph-dim)', fontFamily: "'VT323', monospace", fontSize: 13,
                  padding: '4px 0', cursor: 'pointer', letterSpacing: 2,
                }}>
                  VERIFY
                </button>
              </form>
              {accessError && (
                <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 6, lineHeight: 1.4 }}>
                  {accessError}
                </div>
              )}
              <div style={{ color: 'var(--dim)', fontSize: 10, marginTop: 8, lineHeight: 1.5 }}>
                Codes are found through terminal access and subnet logs.
              </div>
            </div>
          </div>

          {/* Main content */}
          <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto', fontSize: 13, lineHeight: 1.7 }}>
            {selectedReport === null ? (
              <div style={{ color: 'var(--dim)', marginTop: 20 }}>
                <div style={{ color: 'var(--am)', marginBottom: 12, letterSpacing: 2 }}>SELECT A REPORT</div>
                <div>Unlocked reports are accessible via the sidebar.</div>
                <div style={{ marginTop: 12 }}>Locked reports require access codes.</div>
                <div style={{ marginTop: 12, color: 'var(--ph-dim)' }}>
                  Hint: The INCIDENT terminal command references a classified archive.
                </div>
                <div style={{ marginTop: 8, color: 'var(--ph-dim)' }}>
                  Hint: Subnet engineering logs may contain additional access codes.
                </div>
              </div>
            ) : (
              <div>
                <div style={{ color: 'var(--am)', fontSize: 16, letterSpacing: 2, marginBottom: 4 }}>
                  {REPORTS[selectedReport].title}
                </div>
                <div style={{ color: 'var(--dim)', fontSize: 11, marginBottom: 16, letterSpacing: 1 }}>
                  FILE: {REPORTS[selectedReport].fileNumber} &nbsp;|&nbsp; {REPORTS[selectedReport].classification}
                </div>
                <pre style={{
                  color: 'var(--ph-dim)', fontFamily: "'VT323', monospace", fontSize: 13,
                  lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0,
                }}>
                  {REPORTS[selectedReport].content}
                </pre>
                {selectedReport === 0 && (
                  <div style={{ marginTop: 20, borderTop: '1px solid var(--bd)', paddingTop: 12, color: 'var(--dim)', fontSize: 11 }}>
                    NOTE: Pearl surveillance footage from incident day references code sequence OVERRIDE-D108. Cross-reference System Failure Log.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
