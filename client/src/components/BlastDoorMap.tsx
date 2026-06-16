import React, { useState, useRef } from 'react';

interface BlastDoorMapProps {
  isVisible: boolean;
  onClose: () => void;
}

// Place the blast door UV map image at: public/images/blast-door-uv.jpg
// The image shows in near-darkness; moving the cursor reveals it under "UV light"
const IMAGE_PATH = '/images/blast-door-uv.jpg';

const W = 900;
const H = 900;
const UV_RADIUS = 110;

export default function BlastDoorMap({ isVisible, onClose }: BlastDoorMapProps) {
  const [mousePos, setMousePos] = useState({ x: -400, y: -400 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: (e.clientX - rect.left) * (W / rect.width),
      y: (e.clientY - rect.top) * (H / rect.height),
    });
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50000,
        background: 'rgba(0,0,0,0.98)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Header */}
      <div style={{
        color: '#4dff7c', fontFamily: "'VT323', monospace",
        fontSize: 15, letterSpacing: 5, marginBottom: 10,
        textShadow: '0 0 8px #4dff7c66',
      }}>
        BLAST DOOR MAP — STATION 3: THE SWAN — UV ANALYSIS MODE
      </div>

      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setMousePos({ x: -400, y: -400 })}
          style={{
            border: '2px solid #1a1a1a',
            display: 'block',
            cursor: 'none',
            maxWidth: '85vh',
            maxHeight: '85vh',
            width: '90vw',
          }}
        >
          <defs>
            {/* UV spotlight gradient */}
            <radialGradient id="uvGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="white" stopOpacity="1" />
              <stop offset="50%"  stopColor="white" stopOpacity="0.85" />
              <stop offset="80%"  stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>

            {/* Mask: black everywhere except under the cursor spotlight */}
            <mask id="uvMask">
              <rect x="0" y="0" width={W} height={H} fill="black" />
              <circle cx={mousePos.x} cy={mousePos.y} r={UV_RADIUS} fill="url(#uvGlow)" />
            </mask>

            {/* Slightly brighter tinted version for the revealed layer */}
            <filter id="uvBright">
              <feColorMatrix type="saturate" values="1.4" />
              <feComponentTransfer>
                <feFuncR type="linear" slope="1.15" />
                <feFuncG type="linear" slope="1.1" />
                <feFuncB type="linear" slope="1.3" />
              </feComponentTransfer>
            </filter>
          </defs>

          {/* ── Layer 1: very dark base image — always visible, barely legible ── */}
          <image
            href={IMAGE_PATH}
            x="0" y="0"
            width={W} height={H}
            preserveAspectRatio="xMidYMid meet"
            opacity="0.06"
          />

          {/* ── Layer 2: full-brightness image revealed only under the UV cursor ── */}
          <image
            href={IMAGE_PATH}
            x="0" y="0"
            width={W} height={H}
            preserveAspectRatio="xMidYMid meet"
            mask="url(#uvMask)"
            filter="url(#uvBright)"
          />

          {/* ── UV-REVEALED TEXT ANNOTATION LAYER ── */}
          {/* These ARG-specific clues are only visible under the cursor,   */}
          {/* layered on top of the map image.                               */}
          <g mask="url(#uvMask)">

            {/* EBSL NBUUFS (Caesar+1 → DARK MATTER) — lower left, first hand */}
            <g transform="rotate(-4, 90, 760)">
              <text x="30" y={H - 90} fill="#00e050" fontSize="22" fontFamily="'Courier New', monospace" fontStyle="italic">
                EBSL NBUUFS
              </text>
              <text x="32" y={H - 72} fill="#009933" fontSize="9" fontFamily="monospace">
                — lower corridor inscription (first hand)
              </text>
            </g>

            {/* EBSL NBUUFS — upper margin, second hand */}
            <g transform="rotate(1.5, 520, 52)">
              <text x="490" y="52" fill="#00b844" fontSize="20" fontFamily="'Courier New', monospace" fontStyle="italic">
                EBSL NBUUFS
              </text>
              <text x="492" y="67" fill="#007722" fontSize="9" fontFamily="monospace">
                [upper margin — second notation — different author]
              </text>
            </g>

            {/* GUNANGBF — V.K. 2001 — lower right (ROT-13 of THANATOS) */}
            <g transform="rotate(-2, 700, 780)">
              <text x="660" y={H - 110} fill="#00dd55" fontSize="22" fontFamily="'Courier New', monospace">
                GUNANGBF
              </text>
              <text x="662" y={H - 91} fill="#00aa33" fontSize="11" fontFamily="monospace" fontStyle="italic">
                — V.K.  2001
              </text>
              <text x="662" y={H - 75} fill="#008822" fontSize="9" fontFamily="monospace">
                [ROT-13 encoded — see final log]
              </text>
            </g>

            {/* THANATOS VENT ACCESS — upper left */}
            <line x1="118" y1="85" x2="100" y2="92" stroke="#009933" strokeWidth="0.8" />
            <text x="120" y="82" fill="#00cc44" fontSize="12" fontFamily="monospace">
              THANATOS VENT ACCESS [C-23]
            </text>
            <text x="122" y="95" fill="#007722" fontSize="9" fontFamily="monospace">
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
            <text x="300" y={H - 60} fill="#00aa33" fontSize="12" fontFamily="monospace" fontStyle="italic">
              PROTOCOL 7-J — SEALED — DO NOT DISTRIBUTE
            </text>

            {/* Radzinsky's notation hint */}
            <text x={W / 3 + 10} y="105" fill="#00bb44" fontSize="11" fontFamily="monospace">
              R. notation — +1 shift — step back to read
            </text>
            <line x1={W / 3 + 8} y1="110" x2={W / 3 + 8} y2={H / 2 - 55} stroke="#00660022" strokeWidth="1" strokeDasharray="3 5" />

            {/* Kelvin's scrawl */}
            <g transform={`rotate(-1.5, 240, ${H - 120})`}>
              <text x="120" y={H - 130} fill="#00cc44" fontSize="13" fontFamily="'Courier New', monospace" fontStyle="italic">
                INMAN — dead? — final log sealed
              </text>
              <text x="122" y={H - 114} fill="#009933" fontSize="9" fontFamily="monospace">
                V.K. confirmed — encoded — see /LOGS/FINAL-TRANSMISSION.TXT
              </text>
            </g>

            {/* Station coordinate note */}
            <text x="280" y={H / 2 - 100} fill="#009933" fontSize="9" fontFamily="monospace">
              N 4°815' W 162°342'  ·  primary grid ref
            </text>

            {/* Failsafe note — MAGNETITE CHAMBER B (key for terminal FAILSAFE command) */}
            <g transform={`translate(${W / 2 + 30}, 95)`}>
              <rect x="-4" y="-14" width="235" height="32" fill="none" stroke="#00aa33" strokeWidth="0.8" strokeDasharray="4 3" />
              <text x="0" y="0" fill="#00ee55" fontSize="13" fontFamily="'Courier New', monospace" fontWeight="bold">
                FAILSAFE KEY — MAGNETITE CHAMBER B
              </text>
              <text x="2" y="14" fill="#007722" fontSize="9" fontFamily="monospace">
                terminal command: FAILSAFE
              </text>
            </g>

            {/* System designation cross-ref */}
            <text x={W / 2 - 90} y={H / 2 + 100} fill="#009933" fontSize="10" fontFamily="monospace">
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

      {/* Footer */}
      <div style={{ marginTop: 10, display: 'flex', gap: 28, alignItems: 'center' }}>
        <span style={{ color: '#25b84a', fontFamily: "'VT323', monospace", fontSize: 13, letterSpacing: 2 }}>
          UV ANALYSIS MODE — STATION 3: THE SWAN
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
