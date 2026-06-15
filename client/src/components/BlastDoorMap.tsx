import React, { useState, useEffect, useRef } from 'react';

interface BlastDoorMapProps {
  isVisible: boolean;
  onClose: () => void;
}

const W = 900;
const H = 580;
const UV_RADIUS = 85;

export default function BlastDoorMap({ isVisible, onClose }: BlastDoorMapProps) {
  const [mousePos, setMousePos] = useState({ x: -300, y: -300 });
  const [showHint, setShowHint] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (isVisible) {
      setShowHint(true);
      const t = setTimeout(() => setShowHint(false), 5000);
      return () => clearTimeout(t);
    }
  }, [isVisible]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    setMousePos({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    });
  };

  if (!isVisible) return null;

  const stationNodes = [
    { x: 200, y: 145, label: 'ARROW', sub: 'S2' },
    { x: 700, y: 145, label: 'PEARL', sub: 'S5' },
    { x: 155, y: H - 115, label: 'FLAME', sub: 'S6' },
    { x: 745, y: H - 115, label: 'ORCHID', sub: 'S4' },
    { x: 210, y: H / 2, label: 'HATCH', sub: 'S1' },
    { x: 690, y: H / 2, label: 'HYDRA', sub: 'S7' },
  ];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50000,
        background: 'rgba(0,0,0,0.97)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        color: '#4dff7c', fontFamily: "'VT323', monospace",
        fontSize: 16, letterSpacing: 5, marginBottom: 10,
        textShadow: '0 0 8px #4dff7c66',
      }}>
        BLAST DOOR MAP — STATION 3: THE SWAN — UV ANALYSIS MODE
      </div>

      <div style={{ position: 'relative' }}>
        {showHint && (
          <div style={{
            position: 'absolute', top: '45%', left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#4dff7c', fontFamily: "'VT323', monospace",
            fontSize: 22, letterSpacing: 3, textAlign: 'center',
            zIndex: 10, pointerEvents: 'none',
            textShadow: '0 0 14px #4dff7c',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            MOVE CURSOR TO ILLUMINATE SURFACE
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMousePos({ x: -300, y: -300 })}
          style={{
            border: '2px solid #1a1a1a',
            display: 'block',
            cursor: 'none',
            maxWidth: '90vw',
            maxHeight: '75vh',
          }}
        >
          <defs>
            <radialGradient id="uvGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="55%" stopColor="white" stopOpacity="0.7" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
            <mask id="uvMask">
              <rect x="0" y="0" width={W} height={H} fill="black" />
              <circle cx={mousePos.x} cy={mousePos.y} r={UV_RADIUS} fill="url(#uvGlow)" />
            </mask>
            <pattern id="metalGrid" patternUnits="userSpaceOnUse" width="45" height="45">
              <rect width="45" height="45" fill="#111" />
              <line x1="0" y1="22" x2="45" y2="22" stroke="#181818" strokeWidth="0.5" />
              <line x1="22" y1="0" x2="22" y2="45" stroke="#181818" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* ── Base door surface ── */}
          <rect x="0" y="0" width={W} height={H} fill="url(#metalGrid)" />
          <rect x="8" y="8" width={W - 16} height={H - 16} fill="none" stroke="#2a2a2a" strokeWidth="5" />
          <rect x="18" y="18" width={W - 36} height={H - 36} fill="none" stroke="#202020" strokeWidth="2" />

          {/* Structural ribs */}
          <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#252525" strokeWidth="4" />
          <line x1={W / 2} y1="0" x2={W / 2} y2={H} stroke="#232323" strokeWidth="3" />
          <line x1={W / 3} y1="0" x2={W / 3} y2={H} stroke="#1e1e1e" strokeWidth="2" />
          <line x1={W * 2 / 3} y1="0" x2={W * 2 / 3} y2={H} stroke="#1e1e1e" strokeWidth="2" />

          {/* Corner bolts */}
          {[
            [32, 32], [W - 32, 32], [32, H - 32], [W - 32, H - 32],
            [W / 2, 32], [W / 2, H - 32], [32, H / 2], [W - 32, H / 2],
          ].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="9" fill="#161616" stroke="#2e2e2e" strokeWidth="1.5" />
              <circle cx={cx} cy={cy} r="3" fill="#222" />
            </g>
          ))}

          {/* Center SWAN station hexagon */}
          <polygon
            points={`${W / 2},${H / 2 - 50} ${W / 2 + 43},${H / 2 - 25} ${W / 2 + 43},${H / 2 + 25} ${W / 2},${H / 2 + 50} ${W / 2 - 43},${H / 2 + 25} ${W / 2 - 43},${H / 2 - 25}`}
            fill="#0d0d0d" stroke="#363636" strokeWidth="2.5"
          />
          <text x={W / 2} y={H / 2 - 8} textAnchor="middle" fill="#2e2e2e" fontSize="11" fontFamily="monospace" letterSpacing="4">
            STATION 3
          </text>
          <text x={W / 2} y={H / 2 + 10} textAnchor="middle" fill="#252525" fontSize="18" fontFamily="monospace" letterSpacing="2">
            SWAN
          </text>
          <text x={W / 2} y={H / 2 + 28} textAnchor="middle" fill="#1e1e1e" fontSize="9" fontFamily="monospace" letterSpacing="2">
            ESTABLISHED 1977
          </text>

          {/* Peripheral station nodes */}
          {stationNodes.map((n, i) => (
            <g key={i}>
              <polygon
                points={`${n.x},${n.y - 28} ${n.x + 24},${n.y - 14} ${n.x + 24},${n.y + 14} ${n.x},${n.y + 28} ${n.x - 24},${n.y + 14} ${n.x - 24},${n.y - 14}`}
                fill="#0e0e0e" stroke="#282828" strokeWidth="1.5"
              />
              <text x={n.x} y={n.y - 4} textAnchor="middle" fill="#242424" fontSize="9" fontFamily="monospace" letterSpacing="2">
                {n.sub}
              </text>
              <text x={n.x} y={n.y + 10} textAnchor="middle" fill="#1e1e1e" fontSize="10" fontFamily="monospace">
                {n.label}
              </text>
            </g>
          ))}

          {/* Station connection lines */}
          {stationNodes.map((n, i) => (
            <line key={i} x1={W / 2} y1={H / 2} x2={n.x} y2={n.y} stroke="#1a1a1a" strokeWidth="1" strokeDasharray="4 6" />
          ))}

          {/* Ventilation shafts */}
          {[[100, 75], [800, 75], [100, H - 75], [800, H - 75]].map(([x, y], i) => (
            <g key={i}>
              <rect x={Number(x) - 18} y={Number(y) - 12} width="36" height="24" fill="#0c0c0c" stroke="#252525" strokeWidth="1.5" rx="2" />
              {[0, 1, 2].map(j => (
                <line key={j} x1={Number(x) - 12 + j * 8} y1={Number(y) - 8} x2={Number(x) - 12 + j * 8} y2={Number(y) + 8} stroke="#1e1e1e" strokeWidth="1" />
              ))}
            </g>
          ))}

          {/* Door label */}
          <text x={W / 2} y={H - 12} textAnchor="middle" fill="#1e1e1e" fontSize="9" fontFamily="monospace" letterSpacing="5">
            DHARMA INITIATIVE — BLAST DOOR ASSEMBLY — MK.IV — 1977
          </text>

          {/* ══════════════════════════════════════════ */}
          {/* UV-REVEALED ANNOTATION LAYER               */}
          {/* ══════════════════════════════════════════ */}
          <g mask="url(#uvMask)">

            {/* WJB EPNVT — lower left, first hand */}
            <g transform="rotate(-4, 90, 470)">
              <text x="65" y={H - 70} fill="#00e050" fontSize="24" fontFamily="'Courier New', monospace" fontStyle="italic">
                WJB EPNVT
              </text>
              <text x="67" y={H - 50} fill="#009933" fontSize="9" fontFamily="monospace">
                — lower corridor inscription (first hand)
              </text>
            </g>

            {/* WJB EPNVT — upper margin, second hand */}
            <g transform="rotate(1.5, 520, 52)">
              <text x="490" y="52" fill="#00b844" fontSize="20" fontFamily="'Courier New', monospace" fontStyle="italic">
                WJB EPNVT
              </text>
              <text x="492" y="67" fill="#007722" fontSize="9" fontFamily="monospace">
                [upper margin — second notation — different author]
              </text>
            </g>

            {/* PREOREHF — V.K. 2001 — lower right */}
            <g transform="rotate(-2, 680, 485)">
              <text x="640" y={H - 85} fill="#00dd55" fontSize="22" fontFamily="'Courier New', monospace">
                PREOREHF
              </text>
              <text x="642" y={H - 66} fill="#00aa33" fontSize="11" fontFamily="monospace" fontStyle="italic">
                — V.K.  2001
              </text>
              <text x="642" y={H - 52} fill="#008822" fontSize="9" fontFamily="monospace">
                [encoded — see final log]
              </text>
            </g>

            {/* CERBERUS VENT ACCESS — upper left near vent */}
            <line x1="118" y1="68" x2="100" y2="75" stroke="#009933" strokeWidth="0.8" />
            <text x="120" y="65" fill="#00cc44" fontSize="12" fontFamily="monospace">
              CERBERUS VENT ACCESS [C-23]
            </text>
            <text x="122" y="78" fill="#007722" fontSize="9" fontFamily="monospace">
              entity observed — 11 min — Protocol 7-J
            </text>

            {/* 108 circled */}
            <text x={W * 2 / 3 + 25} y={H / 2 - 68} fill="#00ee55" fontSize="30" fontFamily="'Courier New', monospace" fontWeight="bold">
              108
            </text>
            <ellipse cx={W * 2 / 3 + 52} cy={H / 2 - 79} rx="30" ry="20" fill="none" stroke="#00aa33" strokeWidth="1.5" />
            <text x={W * 2 / 3 + 5} y={H / 2 - 48} fill="#007722" fontSize="9" fontFamily="monospace">
              ∑ — confirm all six
            </text>

            {/* Protocol 7-J sealed */}
            <text x="360" y={H - 52} fill="#00aa33" fontSize="12" fontFamily="monospace" fontStyle="italic">
              PROTOCOL 7-J — SEALED — DO NOT DISTRIBUTE
            </text>

            {/* Radzinsky's mark — near top center */}
            <text x={W / 3 + 10} y="88" fill="#00bb44" fontSize="11" fontFamily="monospace">
              R. notation — +1 shift — step back to read
            </text>
            <line x1={W / 3 + 8} y1="92" x2={W / 3 + 8} y2={H / 2 - 55} stroke="#00660022" strokeWidth="1" strokeDasharray="3 5" />

            {/* Kelvin's scrawl */}
            <g transform="rotate(-1.5, 240, 490)">
              <text x="175" y={H - 90} fill="#00cc44" fontSize="13" fontFamily="'Courier New', monospace" fontStyle="italic">
                INMAN — dead? — final log sealed
              </text>
              <text x="177" y={H - 74} fill="#009933" fontSize="9" fontFamily="monospace">
                V.K. confirmed — encoded — see /LOGS/FINAL-TRANSMISSION.TXT
              </text>
            </g>

            {/* Station coordinate note */}
            <text x="310" y={H / 2 - 78} fill="#009933" fontSize="9" fontFamily="monospace">
              N 4°815' W 162°342'  ·  primary grid ref
            </text>

            {/* Failsafe note near upper right */}
            <text x={W * 2 / 3 + 20} y="88" fill="#008833" fontSize="10" fontFamily="monospace">
              FAILSAFE KEY — magnetite chamber B
            </text>

            {/* System designation cross-ref */}
            <text x={W / 2 - 90} y={H / 2 + 72} fill="#009933" fontSize="10" fontFamily="monospace">
              sys designation: archive ref OVERRIDE-D108
            </text>

            {/* UV cursor ring */}
            <circle
              cx={mousePos.x} cy={mousePos.y} r={UV_RADIUS + 6}
              fill="none" stroke="#00ff4418" strokeWidth="1"
            />
          </g>
        </svg>
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 28, alignItems: 'center' }}>
        <span style={{ color: '#25b84a', fontFamily: "'VT323', monospace", fontSize: 13, letterSpacing: 2 }}>
          UV MODE ACTIVE — MOVE CURSOR TO REVEAL ANNOTATIONS
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: '1px solid #4dff7c', color: '#4dff7c',
            fontFamily: "'VT323', monospace", fontSize: 16, letterSpacing: 3,
            padding: '4px 18px', cursor: 'pointer',
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}
