import { playSound } from './audio';
import { DHARMA_NUMBERS } from './constants';
import { getClearance, setClearance, clearanceLabel } from './clearance';

// ─── Clearance progression ────────────────────────────────────────────────────
//
//  L1 VISITOR  → L2 OPERATOR   : AUTHENTICATE WICKMUND
//    Clue: Morse code at end of READ /DHARMA/ORIENTATION-REEL-3.TXT
//    Morse: .-- .. -.-. -.- -- ..- -. -..  = WICKMUND
//
//  L2 OPERATOR → L3 TECHNICIAN : AUTHENTICATE KRONOS
//    Clue: COMMS shows 6 carrier-wave peaks named after Greek designations
//    DECRYPT FREQUENCIES recovers the two corrupted peaks
//    First letter of each peak name: K-R-O-N-O-S = KRONOS
//
//  L3 TECHNICIAN → L4 RESEARCHER : AUTHENTICATE DARK MATTER
//    Clue: BLAST DOOR (L3) shows inscription "EBSL NBUUFS" (Caesar +1)
//    RADZINSKY (L3) explains the +1 shift encoding habit
//    Decode: EBSL NBUUFS → DARK MATTER
//
//  L4 RESEARCHER → L5 OMEGA : AUTHENTICATE THANATOS
//    Gate: ACTIVATE nodes in DHARMA sequence (4-8-15-16-23-42) to unlock
//    Clue: READ /LOGS/FINAL-TRANSMISSION.TXT (L4) — two-layer cipher
//    Layer 1: ROT-13, Layer 2: Atbash (alphabet mirrored — hinted in Alvar subnet channel)
//    Encoded: TFMZMTYU → ROT-13 → GSZMZGLH → Atbash → THANATOS

let isExecutingProtocol = false;
let pendingAction: string | null = null;
let commandHistory: string[] = [];

function deny(required: number): string[] {
  const cl = getClearance();
  return [
    `> ACCESS DENIED — Clearance Level ${required} required.`,
    `> Current clearance: Level ${cl} — ${clearanceLabel(cl)}.`,
    '> Type AUTHENTICATE for upgrade information.',
  ];
}

function grantMessage(newLevel: number): string[] {
  const label = clearanceLabel(newLevel);
  const flavour: Record<number, string[]> = {
    2: [
      '> Operator verification accepted. OPERATOR clearance granted.',
      '> Decryption tools unlocked.',
      '> Intercept log access granted.',
      '>',
      '> The man who left that note made it out.',
      '> We do not know if that was a good thing.',
    ],
    3: [
      '> Relay designation confirmed. TECHNICIAN clearance granted.',
      '> Override and diagnostic tools unlocked.',
      '> Full incident report now accessible.',
      '> SUBNET access enabled.',
      '>',
      '> The work is difficult. It matters. Do not leave the station.',
    ],
    4: [
      '> Radzinsky\'s cipher cracked. RESEARCHER clearance confirmed.',
      '> Pearl surveillance access granted.',
      '> Classified personnel files unlocked.',
      '> Kelvin\'s file and coordinates now accessible.',
      '> VALENZETTI command now available.',
      '>',
      '> Some things cannot be un-known.',
    ],
    5: [
      '> DHARMA INITIATIVE — OMEGA PROTOCOL — ACTIVE.',
      '> All station files declassified.',
      '> Hanso Foundation archives unlocked.',
      '> Pala Ferry dossier accessible.',
      '>',
      '> You know what it is now.',
      '> What will you do with that knowledge?',
      '>',
      '> Type OMEGA for full classified briefing.',
    ],
  };
  return [
    '> ════════════════════════════════════════',
    `> CLEARANCE LEVEL ${newLevel} — ${label} — GRANTED`,
    '> ════════════════════════════════════════',
    '>',
    ...(flavour[newLevel] ?? []),
    '>',
    '> Type HELP for updated command list.',
    '> Type FILES for updated file access.',
  ];
}

// ─── Documented commands (appear in HELP) ────────────────────────────────────

const commands: Record<string, Function> = {

  help: () => {
    const cl = getClearance();
    const label = clearanceLabel(cl);
    const base = [
      '> SWAN STATION — INTRANET NODE SWN-7',
      `> CLEARANCE: LEVEL ${cl} — ${label}`,
      '>',
      '>  HELP          — display this message',
      '>  STATUS        — system status overview',
      '>  WHO           — active personnel roster',
      '>  FILES         — list accessible files',
      '>  READ [path]   — read a file',
      '>  PING          — test intranet connectivity',
      '>  INCIDENT      — recent incident log entries',
      '>  AUTHENTICATE  — advance clearance level',
      '>  CLEAR         — clear terminal output',
      '>  EXIT          — end terminal session',
    ];
    if (cl >= 2) base.push(
      '>  COMMS         — carrier wave intercept log [L2]',
      '>  DECRYPT [key] — decrypt archived files [L2]',
      '>  TRACK         — entity sonar log [L2]',
      '>  PEARL         — Pearl station observation log [L2]',
      '>  SUBNET        — access DHARMA subnet archive [L2]',
    );
    if (cl >= 3) base.push(
      '>  OVERRIDE [p]  — system override protocols [L3]',
      '>  DIAGNOSE [t]  — network diagnostics [L3]',
      '>  MAP           — blast door UV analysis [L3]',
    );
    if (cl >= 4) base.push(
      '>  ACCESS [p]    — special access protocols [L4]',
      '>  VALENZETTI    — Valenzetti Equation summary [L4]',
    );
    if (cl >= 5) base.push(
      '>  OMEGA         — full classified briefing [L5]',
    );
    if (cl < 5) base.push(
      '>',
      '> Type AUTHENTICATE for clearance upgrade information.',
    );
    return base;
  },

  authenticate: (args: string) => {
    const cl = getClearance();
    const answer = args.trim().toUpperCase().replace(/\s+/g, ' ');

    if (!answer) {
      return [
        `> CLEARANCE: LEVEL ${cl} — ${clearanceLabel(cl)}`,
        cl < 5
          ? '> VERIFICATION REQUIRED. REVIEW ALL AVAILABLE STATION MATERIALS.'
          : '> No further authentication required.',
        '>',
        '> Usage: AUTHENTICATE [response]',
      ];
    }

    if (cl >= 5) return [
      '> CLEARANCE LEVEL 5 — OMEGA.',
      '> No further authentication required.',
    ];

    const correct: Record<number, string[]> = {
      1: ['WICKMUND'],
      2: ['KRONOS'],
      3: ['DARK MATTER'],
      4: ['THANATOS'],
    };

    const allAnswers = Object.values(correct).flat();
    const expected = correct[cl];

    if (expected?.includes(answer)) {
      // L1→L2 requires reading the orientation tape
      if (cl === 1 && localStorage.getItem('dharma_orientation_read') !== 'true') {
        return [
          '> AUTHENTICATION REQUIRES STATION ORIENTATION REVIEW.',
          '> Review all available station materials before attempting authentication.',
          '> Start with: READ /FILES/PERSONAL-EFFECTS.TXT',
        ];
      }
      // L2→L3 requires carrier wave analysis from all four sources
      if (cl === 2 && localStorage.getItem('dharma_freq_decrypted') !== 'true') {
        return [
          '> AUTHENTICATION REQUIRES CARRIER WAVE ANALYSIS.',
          '> Collect signal data from four sources, then run DECRYPT FREQUENCIES.',
          '> Required: COMMS · entity tracking (TRACK) · subnet archive (SUBNET) · Pearl log (PEARL)',
        ];
      }
      // L4→L5 requires distributed node activation
      if (cl === 4 && localStorage.getItem('dharma_nodes_activated') !== 'true') {
        return [
          '> AUTHENTICATION INCOMPLETE.',
          '> Distributed node authorization required before upgrade.',
          '> Six nodes must be activated in the correct sequence.',
          '> Type ACTIVATE for the node activation protocol.',
        ];
      }
      // L3→L4 requires consulting all three cipher sources
      if (cl === 3) {
        const mapOk = localStorage.getItem('dharma_map_consulted') === 'true';
        const radzOk = localStorage.getItem('dharma_radzinsky_read') === 'true';
        const shiftOk = localStorage.getItem('dharma_decrypt_shift_used') === 'true';
        if (!mapOk || !radzOk || !shiftOk) {
          const missing = [
            !mapOk  && 'blast door map (MAP command)',
            !radzOk && 'personnel file (RADZINSKY command)',
            !shiftOk && 'cipher analysis (DECRYPT SHIFT command)',
          ].filter(Boolean).join(', ');
          return [
            '> AUTHENTICATION INCOMPLETE.',
            '> Source verification required before upgrade.',
            `> Outstanding: ${missing}`,
          ];
        }
      }
      playSound('success');
      setClearance(cl + 1);
      return grantMessage(cl + 1);
    }

    if (allAnswers.includes(answer)) {
      return [
        '> AUTHENTICATION FAILED.',
        '> This response is valid — but not at your current clearance level.',
        '> Clearance must be advanced in sequence.',
      ];
    }

    return [
      '> AUTHENTICATION FAILED.',
      '> Incorrect response. Verify your source material.',
    ];
  },

  status: () => {
    const cl = getClearance();
    const power = Math.floor(Math.random() * 15) + 70;
    const base = [
      '> SYSTEM STATUS:',
      `> EM Containment:      ${cl >= 4 ? 'FLUCTUATING' : 'ACTIVE'}`,
      `> Power reserve:       ${power}%`,
      '> Failsafe Key:        HOUSING F-7 — INTACT',
      '> Intranet Node:       SWN-7 — ONLINE',
      '> Sonar Array:         DEGRADED (see INCIDENT log)',
      '> EM Anomaly:          NOMINAL',
      '> Protocol 23:         ACTIVE',
      '> External Comms:      BLOCKED §7-B',
      '> Quarantine:          IN EFFECT',
      `> Operator Status:     ${cl >= 2 ? `VERIFIED — ${clearanceLabel(cl)}` : 'UNVERIFIED'}`,
    ];
    if (cl >= 2) base.push(
      '>',
      '> [OPERATOR] Sub-level C: EM field stable. Maintenance overdue.',
      '> [OPERATOR] Sonar event logged — Cycle 10876. Review recommended.',
    );
    if (cl >= 3) base.push(
      '> [TECHNICIAN] Incident file: Full access now available.',
      '> [TECHNICIAN] Network: DHARMA subnet online. Type SUBNET to connect.',
    );
    if (cl >= 4) base.push(
      '> [RESEARCHER] Pearl uplink: Sporadic. Feeds available.',
      '> [RESEARCHER] Personnel file: V.K. — final log now accessible.',
    );
    if (cl >= 5) base.push(
      '> [OMEGA] All systems: Fully declassified.',
      '> [OMEGA] Hanso Foundation uplink: Available. Type OMEGA.',
    );
    if (cl === 1) base.push(
      '>',
      '> Operator Status: UNVERIFIED',
      '> See orientation materials. Type AUTHENTICATE for details.',
    );
    return base;
  },

  who: () => {
    const cl = getClearance();
    const base = [
      '> ACTIVE PERSONNEL — SWAN STATION:',
      '>',
      '>  WICKMUND, G. ............... STATION CHIEF',
      '>  CANDLE, M. ................. TECHNICAL OFFICER',
      '>  [CLASSIFIED] ............... OPERATOR A',
      '>  [CLASSIFIED] ............... OPERATOR B',
      '>',
      '>  RELIEF TEAM ETA: 540 HOURS',
    ];
    if (cl >= 3) base.splice(5, 0,
      '>  RADZINSKY, S. .............. FORMER OPERATOR A — DEPARTED',
    );
    if (cl >= 4) base.splice(-2, 0,
      '>',
      '> [CLEARANCE 4 — RESTRICTED]',
      '>  KELVIN, V. ................. RADIO OPERATOR — STATUS: UNKNOWN',
      '>                               FINAL LOG: READ /LOGS/FINAL-TRANSMISSION.TXT',
    );
    if (cl >= 5) base.push(
      '>',
      '> [OMEGA — ABOVE CLASSIFICATION]',
      '>  HANSO, A. .................. FOUNDATION DIRECTOR',
      '>  DEGROOT, G. ................ INITIATIVE DIRECTOR',
      '>  [CANDIDATES] ............... SEE OMEGA BRIEFING',
    );
    return base;
  },

  files: () => {
    const cl = getClearance();
    const list = [
      `> ACCESSIBLE FILES — CLEARANCE LEVEL ${cl}:`,
      '>',
      '>  /PROTOCOL/PROTOCOL-23.TXT',
      '>  /LOGS/INCIDENT-4-23-1980.TXT ......... [PARTIAL — REDACTED]',
      '>  /LOGS/CYCLE-LOG-10894.TXT',
      '>  /DHARMA/ORIENTATION-REEL-3.TXT',
      '>  /FILES/PERSONAL-EFFECTS.TXT .......... [CATALOGUED — CYCLE 10801]',
    ];
    if (cl >= 2) list.push(
      '>  /LOGS/ROUSSEAU-TRANSMISSION.TXT ....... [L2]',
      '>  /LOGS/COMMS-INTERCEPT.TXT ............. [L2]',
    );
    if (cl >= 3) list.push(
      '>  /LOGS/INCIDENT-CLASSIFIED.TXT ......... [L3 — UNREDACTED]',
    );
    if (cl >= 4) list.push(
      '>  /LOGS/FINAL-TRANSMISSION.TXT .......... [L4]',
      '>  /FILES/VK-108.TXT .................... [L4]',
      '>  /FILES/COORDINATES.TXT ............... [L4]',
    );
    if (cl >= 5) list.push(
      '>  /FILES/PALA-FERRY.TXT ................ [L5 — OMEGA]',
    );
    list.push('>', '>  Use READ [path] to open a file.');
    return list;
  },

  read: (args: string) => {
    if (!args) return [
      '> ERROR: Path required.',
      '> Usage: READ [path]',
      '> Type FILES to see accessible paths.',
    ];

    const cl = getClearance();
    const p = args.trim().toUpperCase().replace(/^\//, '');

    // L1 files
    if (p === 'PROTOCOL/PROTOCOL-23.TXT') return [
      '> FILE: /PROTOCOL/PROTOCOL-23.TXT',
      '> ─────────────────────────────────────────',
      '> PROTOCOL 23 — ELECTROMAGNETIC CONTAINMENT',
      '> CLASSIFICATION: LEVEL 4 | AUTHORED: DeGroot & Hanso — 1977',
      '> REVISED: Candle, M. — Cycle 9100',
      '>',
      '> PURPOSE:',
      '> To prevent uncontrolled electromagnetic discharge through periodic',
      '> operator input at the primary terminal.',
      '>',
      '> PROCEDURE:',
      '> The operator will enter the designated sequence every 108 minutes.',
      '> The sequence consists of six values. They are known to all authorised',
      '> personnel. They are not reproduced in this document.',
      '>',
      '> FAILURE STAGES:',
      '>   STAGE 1 — Warning alarm at T-5:00',
      '>   STAGE 2 — Critical alarm at T-1:00',
      '>   STAGE 3 — Containment failure. Uncontrolled discharge.',
      '>   STAGE 4 — Hieroglyph display (equipment fault state)',
      '>',
      '> Do not attempt to communicate via this terminal.',
      '> Do not leave the station.',
      '> ─────────────────────────────────────────',
    ];

    if (p === 'LOGS/CYCLE-LOG-10894.TXT') return [
      '> FILE: /LOGS/CYCLE-LOG-10894.TXT',
      '> ─────────────────────────────────────────',
      '> CYCLE: 10894 | STATUS: ACTIVE | EM LEVEL: 73% GAUSS (NOMINAL)',
      '>',
      '> Previous cycle (10893): Input at T-02:14. Normal.',
      '> Sonar: one anomalous reading, duration 6 min. Logged.',
      '> External contact attempts: 0.',
      '> ─────────────────────────────────────────',
    ];

    if (p === 'LOGS/INCIDENT-4-23-1980.TXT') return [
      '> FILE: /LOGS/INCIDENT-4-23-1980.TXT',
      '> ─────────────────────────────────────────',
      '> INCIDENT REPORT — 1980-04-23 — 14:23 LOCAL',
      '> CLASSIFICATION: PARTIAL — REDACTED ORDER V.K.',
      '>',
      '> At 14:23, an uncontrolled electromagnetic event occurred',
      '> during scheduled maintenance in Sub-level C.',
      '>',
      '> Casualties:        [REDACTED — ORDER V.K.]',
      '> Equipment loss:    [REDACTED — ORDER V.K.]',
      '> Root cause:        [REDACTED — ORDER V.K.]',
      '>',
      '> Result: Protocol 23 established. Swan converted',
      '> to indefinite occupied operation effective 1980-05-01.',
      '>',
      cl >= 3 ? '> Full unredacted report: READ /LOGS/INCIDENT-CLASSIFIED.TXT' : '> Full report requires Clearance Level 3.',
      '> ─────────────────────────────────────────',
    ];

    if (p === 'DHARMA/ORIENTATION-REEL-3.TXT') {
      if (localStorage.getItem('dharma_personal_effects_read') !== 'true') {
        return [
          '> ACCESS RESTRICTED.',
          '> Review /FILES/PERSONAL-EFFECTS.TXT before accessing orientation materials.',
        ];
      }
      try { localStorage.setItem('dharma_orientation_read', 'true'); } catch {}
      return [
      '> FILE: /DHARMA/ORIENTATION-REEL-3.TXT',
      '> ─────────────────────────────────────────',
      '> ORIENTATION FILM — STATION 3: THE SWAN',
      '> PRESENTER: M. CANDLE, TECHNICAL OFFICER',
      '>',
      '> "Hello. I am Dr. Marvin Candle, and this is the',
      '> orientation film for Station 3 of the DHARMA Initiative.',
      '>',
      '> "The station you are now occupying was originally constructed',
      '> as a laboratory facility. Following an incident in April 1980,',
      '> its primary function was altered. The details of that incident',
      '> remain classified.",',
      '>',
      '> "Every 108 minutes, the counter must be reset by entering',
      '> the code. This is your only function. Do not attempt',
      '> communication with the outside world. Do not leave.",',
      '>',
      '> "Pushing this button is the most important thing you will',
      '> ever do. It may be the only important thing you will ever do."',
      '>',
      '> — End of transcript. Cycle 9100.',
      '> ─────────────────────────────────────────',
      '> [TECHNICAL ADDENDUM — OPERATOR D. HUME — CYCLE 9620]',
      '> "I set the verification word myself, when Kelvin handed over',
      '>  the terminal. It is the name Kelvin used for himself in the',
      '>  field. His cover name. He made me memorise it.',
      '>  Encoded in standard maritime dot-dash. Here it is:',
      '>',
      '>   .-- .. -.-. -.- -- ..- -. -..',
      '>',
      '>  If you\'re reading this, the station still needs you.',
      '>  Do not leave. I wish I had not left."',
      '> ─────────────────────────────────────────',
      ];
    }

    if (p === 'FILES/PERSONAL-EFFECTS.TXT' || p === 'PERSONAL-EFFECTS.TXT') {
      try { localStorage.setItem('dharma_personal_effects_read', 'true'); } catch {}
      return [
      '> FILE: /FILES/PERSONAL-EFFECTS.TXT',
      '> ─────────────────────────────────────────',
      '> PERSONAL EFFECTS — OPERATOR A (DEPARTED — CYCLE 10801)',
      '> Catalogued by: V. Kelvin — Radiotech',
      '> ─────────────────────────────────────────',
      '>',
      '> ITEM 01: Paperback novel — "Our Mutual Friend" by Charles Dickens',
      '>          [Front cover note: "Not yet. Save it for the last."]',
      '>          [Back cover note: "Always. — Penny"]',
      '>',
      '> ITEM 02: Photograph. Woman on a boat. No date.',
      '>',
      '> ITEM 03: Wristwatch. Stopped. Face reads: 8:15.',
      '>',
      '> ITEM 04: Torn notebook page.',
      '>          "I have been here 1,340 days. I talk to myself now.',
      '>           The button is the only thing keeping me tethered.',
      '>           If anyone finds this: 4 8 15 16 23 42. Do not stop.',
      '>           Do not think. Just push it.',
      '>           — D. Hume"',
      '>',
      '> ITEM 05: One keychain, metal. Stamped initials: D.H.',
      '>',
      '> ─────────────────────────────────────────',
      '> NOTE FROM V. KELVIN:',
      '> "He left in a hurry. Took nothing. Said he could see the ocean',
      '>  from the hill above the station. I do not know if he made it.',
      '>  His verification word for the system — the greeting he used —',
      '>  is encoded in the station orientation transcript."',
      '> ─────────────────────────────────────────',
      ];
    }

    // L2 files
    if (p === 'LOGS/ROUSSEAU-TRANSMISSION.TXT' || p === 'ROUSSEAU-TRANSMISSION.TXT') {
      if (cl < 2) return deny(2);
      return [
        '> FILE: /LOGS/ROUSSEAU-TRANSMISSION.TXT',
        '> ─────────────────────────────────────────',
        '> FLAME STATION — TRANSMISSION CAPTURE LOG',
        '> DATE: 1988-12-04  |  ORIGIN: SECTOR 7',
        '>',
        '> Signal type: Continuous loop. Female voice.',
        '> Translation (French → English):',
        '>',
        '> "If anyone can hear this, I am alone now on the island.',
        '>  The others, they are all dead. It killed them. All of them.',
        '>  I have been on the island for sixteen days.",',
        '>',
        '> The transmission repeats without pause.',
        '> It has been running for approximately sixteen years',
        '> as of the date of this log entry.',
        '>',
        '> Origin transmitter: Unknown. Sector 7.',
        '> Cross-reference: See COMMS for carrier-wave data.',
        '> ─────────────────────────────────────────',
      ];
    }

    if (p === 'LOGS/COMMS-INTERCEPT.TXT' || p === 'COMMS-INTERCEPT.TXT') {
      if (cl < 2) return deny(2);
      return ['> See COMMS command for interactive intercept log.'];
    }

    // L3 files
    if (p === 'LOGS/INCIDENT-CLASSIFIED.TXT' || p === 'INCIDENT-CLASSIFIED.TXT') {
      if (cl < 3) return deny(3);
      return [
        '> FILE: /LOGS/INCIDENT-CLASSIFIED.TXT — UNREDACTED',
        '> ─────────────────────────────────────────',
        '> INCIDENT REPORT — 1980-04-23',
        '> AUTHORISED FOR CLEARANCE LEVEL 3+',
        '>',
        '> At 14:23, operator S. Radzinsky initiated an unapproved',
        '> maintenance procedure in Sub-level C during an active',
        '> electromagnetic cycle.',
        '>',
        '> The drill struck a pocket of intensely magnetised rock.',
        '> The resulting discharge lasted 4 minutes 42 seconds.',
        '>',
        '> Casualties:        2. Names withheld — order of A. Hanso.',
        '> Equipment loss:    Sonar array (partial), Sub-C access shaft.',
        '> Root cause:        Radzinsky, S. — unauthorised drilling.',
        '>',
        '> Outcome: Radzinsky retained. Protocol 23 established.',
        '> Swan converted to permanent occupied operation.',
        '> Radzinsky placed on indefinite rotation. No relief scheduled.',
        '>',
        '> NOTE: Radzinsky later co-authored the blast door map',
        '> with his successor V. Kelvin. Both are now unaccounted for.',
        '> ─────────────────────────────────────────',
      ];
    }

    // L4 files
    if (p === 'LOGS/FINAL-TRANSMISSION.TXT' || p === 'FINAL-TRANSMISSION.TXT') {
      if (cl < 4) return deny(4);
      return [
        '> FILE: /LOGS/FINAL-TRANSMISSION.TXT',
        '> ─────────────────────────────────────────',
        '> OPERATOR LOG — FINAL ENTRY',
        '> AUTHOR: V. KELVIN — RADIO OPERATOR',
        '> DATE: UNKNOWN | CYCLE: POST-10500',
        '>',
        '> "I am going outside. I know what the orientation film',
        '> says. I know the quarantine signs are there.',
        '> I do not care any more. There is a boat.',
        '>',
        '> "If you find this: I hid the failsafe key in housing F-7.',
        '> You already know where that is. That is not the point.',
        '>',
        '> "The entity in the jungle — DHARMA gave it a designation.',
        '> I found it in the old field reports.',
        '> I encoded it. Twice. I was afraid. I was careful.',
        '>',
        '> "First: the standard rotation used in all field comms.',
        '> Second: I mirrored it — the way Hanso\'s encrypted channel worked.',
        '> The alphabet runs backwards on that channel.',
        '> Both keys are things you have already encountered.',
        '>',
        '> ENCODED:     TFMZMTYU',
        '>',
        '> "Decode it. Type AUTHENTICATE [decoded word] if you understand.',
        '>',
        '> "I do not think I am coming back."',
        '>',
        '> — V. Kelvin',
        '> ─────────────────────────────────────────',
      ];
    }

    if (p === 'FILES/VK-108.TXT' || p === 'VK-108.TXT') {
      if (cl < 4) return deny(4);
      return [
        '> FILE: /FILES/VK-108.TXT',
        '> ─────────────────────────────────────────',
        '> RE: VALENZETTI EQUATION — OPERATIONAL CONTEXT',
        '> FROM: V. KELVIN, SR. TECH OFFICER, CYCLE 9341',
        '>',
        '> The equation was derived by Enzo Valenzetti in 1962,',
        '> commissioned by the UN following the Cuban Missile Crisis.',
        '> Its purpose: to predict the date of human extinction.',
        '>',
        '> The six core factors are represented by six numerical values.',
        '> The DHARMA Initiative was established to change at least one.',
        '>',
        '> The Swan protocol prevents a discharge that accelerates Factor 4.',
        '> The sequence you enter does not change the equation.',
        '> It only keeps the clock running.',
        '>',
        '> You are not saving the world.',
        '> You are keeping the clock running.',
        '>',
        '> The sum of the six values is 108.',
        '> The interval is not a coincidence.',
        '>',
        '> — V. Kelvin, Cycle 9341',
        '> ─────────────────────────────────────────',
      ];
    }

    if (p === 'FILES/COORDINATES.TXT' || p === 'COORDINATES.TXT') {
      if (cl < 4) return deny(4);
      return [
        '> FILE: /FILES/COORDINATES.TXT',
        '> ─────────────────────────────────────────',
        '> POSITION:             4°48\'N  108°42\'W',
        '> MAGNETIC DECLINATION: 11.3° E  (anomalous)',
        '> GRID REF:             DHARMA INTERNAL MAP NODE 7',
        '>',
        '> NOTE: These coordinates are not to be shared.',
        '> External awareness would compromise ongoing research.',
        '>',
        '> — ORDER V.K.',
        '> ─────────────────────────────────────────',
      ];
    }

    // L5 files
    if (p === 'FILES/PALA-FERRY.TXT' || p === 'PALA-FERRY.TXT') {
      if (cl < 5) return deny(5);
      return [
        '> FILE: /FILES/PALA-FERRY.TXT — OMEGA CLEARANCE',
        '> ─────────────────────────────────────────',
        '> PALA FERRY — EXTRACTION PROTOCOL',
        '> CLASSIFICATION: OMEGA | AUTHOR: DeGroot, G.',
        '>',
        '> In the event of a full station evacuation, personnel',
        '> are to proceed to the PALA FERRY dock via the jungle',
        '> perimeter. Coordinates: Node 4, bearing 23°.',
        '>',
        '> The ferry runs on a schedule known only to Omega',
        '> clearance personnel. The schedule is oral — not written.',
        '>',
        '> IMPORTANT: The ferry cannot be recalled once departed.',
        '> Do not miss the window.',
        '>',
        '> NOTE: As of Cycle 9800, ferry contact was not confirmed.',
        '> The dock may no longer be operational.',
        '> Alternative extraction: Failsafe key, Sub-level C, Housing F-7.',
        '> Understand the consequences before using it.',
        '> ─────────────────────────────────────────',
      ];
    }

    return [
      `> FILE NOT FOUND: /${p}`,
      '> Type FILES to see accessible paths.',
    ];
  },

  ping: (args: string) => {
    const cl = getClearance();

    // Coordinate lookup — triggered when player enters map coordinates
    if (args.trim()) {
      // Normalise: strip non-digit chars, collapse spaces
      const digits = args.replace(/[^\d]/g, '');

      // Swan Station — L1→L2 coordinate puzzle
      const hasSwan = digits.includes('4815') && digits.includes('162342');
      if (hasSwan) {
        try { localStorage.setItem('dharma_ping_resolved', 'true'); } catch {}
        return [
          '> PING N 4°815′ W 162°342′',
          '> NODE IDENTIFIED — SWN-7 INNER PERIMETER',
          '>',
          '> Signal origin verified. Station designation: SWAN — CV III',
          '> Operator verification: PENDING.',
          '>',
          '> Archived handover note present — access via station materials.',
          '> Review all files before attempting authentication.',
        ];
      }

      // Storm cache — L3→L4 weather puzzle (only responds during storm)
      const hasStorm = digits.includes('2342') && digits.includes('10815');
      if (hasStorm) {
        const weather = localStorage.getItem('dharma_weather_state') ?? 'clear';
        if (weather !== 'storm') {
          return [
            '> PING N 23°42′ W 108°15′',
            '> SIGNAL PRESENT BUT UNREADABLE — ATMOSPHERIC INTERFERENCE',
            '> Meteorological conditions insufficient. Retry during storm event.',
          ];
        }
        try { localStorage.setItem('dharma_storm_cache_pinged', 'true'); } catch {}
        return [
          '> PING N 23°42′ W 108°15′',
          '> NODE ACTIVE — STORM WINDOW CONFIRMED',
          '>',
          '> Encrypted data fragment recovered:',
          '> SUBJECT: RADZINSKY — SUBLEVEL C — RESEARCH MATERIAL',
          '> "The subject of our work is what the others called EBSL NBUUFS.',
          '> I renamed it. Radzinsky shifted everything by one.',
          '> Subtract one step to find the truth."',
          '>',
          '> [Node closes when weather clears]',
        ];
      }

      // Hatch exterior — L4→L5 time gate (only in first 8 mins of countdown)
      const hasHatch = digits.includes('418') && digits.includes('16342');
      if (hasHatch) {
        const timeRemaining = (() => {
          try {
            const start = parseInt(localStorage.getItem('countdown_start') || '0');
            const elapsed = Math.floor((Date.now() - start) / 1000);
            return Math.max(0, 108 * 60 - elapsed);
          } catch { return 0; }
        })();
        const inWindow = timeRemaining >= 6000 && timeRemaining <= 6480;
        if (!inWindow) {
          return [
            '> PING N 4°18′ W 16°342′',
            '> SIGNAL NOT DETECTED — NODE INACTIVE',
            '> This coordinate only broadcasts during a narrow window.',
            '> Monitor the island survey panel when the countdown resets.',
          ];
        }
        try { localStorage.setItem('dharma_hatch_exterior_pinged', 'true'); } catch {}
        return [
          '> PING N 4°18′ W 16°342′',
          '> TRANSIENT NODE ACTIVE — WINDOW CLOSING',
          '>',
          '> Node designation: HATCH EXTERIOR — SWN-7 SUBLEVEL ACCESS',
          '> Encoded marker recovered:',
          '> GUNANGBF — source: V.K. annotation, 2001',
          '> [ROT-13 cipher — decode to authenticate]',
        ];
      }

      return [
        `> PING ${args.trim().toUpperCase()}`,
        '> NO SIGNAL AT SPECIFIED COORDINATES — NODE UNRESPONSIVE',
        '> Verify coordinates via island survey panel.',
      ];
    }

    if (cl >= 5) return [
      '> TESTING INTRANET NODE CONNECTIVITY...',
      '>',
      '>  SWN-7    (self)        OK        [0ms]',
      '>  SWN-HUB  (backbone)   OK        [9ms]',
      '>  PEARL-3  (obs)         TIMEOUT',
      '>  FLAME-1  (comms)       NO ROUTE',
      '>  STAFF-1  (medical)     NO ROUTE',
      '>  ORCHID   (unknown)     REFUSED',
      '>  WORLD    (external)    BLOCKED   §7-B',
      '>',
      '> Pearl-3 timeout is likely intentional.',
      '> Pearl station observes. It does not respond.',
    ];
    return [
      '> TESTING INTRANET NODE CONNECTIVITY...',
      '>',
      '>  SWN-7         (self)        OK        [0ms]',
      '>  SWN-HUB       (backbone)    OK        [9ms]',
      '>  [REDACTED]-3  [CLASSIFIED]  TIMEOUT',
      '>  [REDACTED]-4  [CLASSIFIED]  NO ROUTE',
      '>  [REDACTED]-5  [CLASSIFIED]  NO ROUTE',
      '>  [REDACTED]-6  [CLASSIFIED]  REFUSED',
      '>  WORLD         (external)    BLOCKED   §7-B',
    ];
  },

  incident: () => {
    const cl = getClearance();
    return [
      '> INCIDENT LOG — RECENT ENTRIES:',
      '>',
      '>  CYCLE 10881 — Minor EM fluctuation. Within parameters.',
      '>  CYCLE 10876 — Sonar anomaly. Large organic signature. Logged.',
      '>  CYCLE 10849 — Operator reported sounds outside the station.',
      '>                Not logged officially.',
      cl >= 3
        ? '>  CYCLE 10801 — Radzinsky departure. Cause: UNLOGGED.'
        : '>  CYCLE 10801 — [REDACTED — ORDER V.K.]',
      '>  CYCLE 10801 — Station handover. Personal effects catalogued.',
      '>                File: READ /FILES/PERSONAL-EFFECTS.TXT',
      '>  CYCLE 10734 — Regular maintenance. No incidents.',
      '>  1980-04-23  — THE INCIDENT.',
      cl >= 3
        ? '>                Full file: READ /LOGS/INCIDENT-CLASSIFIED.TXT'
        : '>                See: READ /LOGS/INCIDENT-4-23-1980.TXT (partial)',
    ];
  },

  valenzetti: () => {
    const cl = getClearance();
    if (cl < 4) return deny(4);
    return [
      '> VALENZETTI EQUATION — SUMMARY:',
      '>',
      '> Author:    Enzo Valenzetti, 1962.',
      '> Source:    Commissioned by the UN, post-Cuban Missile Crisis.',
      '> Purpose:   Predicts the date of human extinction based on',
      '>            six core environmental and human factors.',
      '>',
      '> The DHARMA Initiative mission: alter at least one core factor.',
      '> The Swan protocol: prevent a discharge accelerating Factor 4.',
      '>',
      '> The six factor values: 4, 8, 15, 16, 23, 42.',
      '>',
      '> The 108-minute interval is derived directly from these values.',
      '> Entering the sequence does not change the equation.',
      '> The clock continues.',
      '>',
      '> Full operational context: READ /FILES/VK-108.TXT',
    ];
  },

  track: () => {
    if (getClearance() < 2) return deny(2);
    const logged = localStorage.getItem('dharma_entity_tracked') === 'true';
    if (!logged) {
      return [
        '> SONAR TRACK — ACTIVE ENTITIES',
        '> ─────────────────────────────────────────',
        '> Signal detected — moving. No grid fix established.',
        '> Monitor island survey panel. Entity must reach a stable',
        '> reference coordinate before a log entry can be generated.',
        '> Watch for the red indicator on sector 7 survey.',
      ];
    }
    return [
      '> SONAR TRACK — ENTITY LOG ENTRY',
      '> ─────────────────────────────────────────',
      '> Grid fix confirmed: N 15°16′ W 23°42′',
      '> Duration at reference: approx. 11 minutes',
      '> Entity classification: UNKNOWN — see Protocol 7-J',
      '>',
      '> Coordinate cross-reference: KAPPA(4) · RHO(8) values',
      '> confirm secondary grid alignment — peaks 01 and 02 of carrier wave.',
      '> Cross-reference: COMMS for wave structure, SUBNET and PEARL for remaining peaks.',
      '> ─────────────────────────────────────────',
    ];
  },

  comms: () => {
    if (getClearance() < 2) return deny(2);
    try { localStorage.setItem('dharma_comms_read', 'true'); } catch {}
    return [
      '> FLAME STATION — COMMS INTERCEPT LOG',
      '> ─────────────────────────────────────────',
      '> DATE: 1988-12-04  22:14 LOCAL',
      '> SIGNAL: CONTINUOUS LOOP — SECTOR 7',
      '> ORIGIN: UNIDENTIFIED TRANSMITTER',
      '>',
      '> TRANSCRIPT (TRANSLATED — FRENCH):',
      '> "...the numbers are bad..."',
      '> "...the numbers are bad..."',
      '>',
      '> CARRIER WAVE — FREQUENCY PEAKS:',
      '>',
      '>   PEAK 01: [DESIGNATION CORRUPTED]  [4 MHz]',
      '>   PEAK 02: [DESIGNATION CORRUPTED]  [8 MHz]',
      '>   PEAK 03: [DESIGNATION CORRUPTED] [15 MHz]',
      '>   PEAK 04: [DESIGNATION CORRUPTED] [16 MHz]',
      '>   PEAK 05: [DESIGNATION CORRUPTED] [23 MHz]',
      '>   PEAK 06: [DESIGNATION CORRUPTED] [42 MHz]',
      '>',
      '> NOTE: All Greek series designations lost during signal capture.',
      '> Cross-reference field telemetry to recover peak designations.',
      '> Sources: entity tracking (TRACK), subnet archive (SUBNET),',
      '> Pearl observation log (PEARL). Then run DECRYPT FREQUENCIES.',
      '> ─────────────────────────────────────────',
    ];
  },

  decrypt: (args: string) => {
    if (getClearance() < 2) return deny(2);
    const cl = getClearance();
    const key = args.toLowerCase().trim();
    if (key === 'incident') {
      try { localStorage.setItem('dharma_incident_unlocked', 'true'); } catch {}
      return [
        '> DECRYPTING "THE INCIDENT" FILE...',
        '> Electromagnetic anomaly — casualties reported.',
        '> Protocol 23 established in direct response.',
        cl >= 3 ? '> Full report: READ /LOGS/INCIDENT-CLASSIFIED.TXT' : '> Full report requires Clearance Level 3.',
      ];
    }
    if (key === 'blackrock') return [
      '> DECRYPTING "BLACK ROCK" FILE...',
      '> 19th-century vessel. Transported explosives.',
      '> Shipwrecked during magnetic storm.',
      '> Current location: Dark Territory.',
      '> WARNING: Cargo still viable.',
    ];
    if (key === 'valenzetti') return [
      '> DECRYPTING VALENZETTI DOCUMENT...',
      '> Six core factor values: 4, 8, 15, 16, 23, 42.',
      '> Their sum: 108.',
      '> DHARMA primary goal: change one value.',
      '> Current status: UNRESOLVED.',
    ];
    if (key === 'frequencies') {
      const commsDone = localStorage.getItem('dharma_comms_read') === 'true';
      const entityDone = localStorage.getItem('dharma_entity_tracked') === 'true';
      const subnetDone = localStorage.getItem('dharma_subnet_complete') === 'true';
      const pearlDone = localStorage.getItem('dharma_pearl_log_cycled') === 'true';
      const allDone = commsDone && entityDone && subnetDone && pearlDone;
      const lines: string[] = [
        '> DECRYPTING CARRIER WAVE — CORRUPTED DESIGNATIONS...',
        '> Cross-referencing field telemetry sources...',
        '>',
      ];
      if (commsDone) {
        lines.push('> [COMMS] Carrier structure confirmed — 6 peaks at 4·8·15·16·23·42 MHz.');
      } else {
        lines.push('> Carrier wave structure unknown — run COMMS first.');
      }
      if (entityDone) {
        lines.push('> [ENTITY TELEMETRY] Peak 01 = KAPPA (4 MHz) · Peak 02 = RHO (8 MHz)');
      } else {
        lines.push('> Peaks 01–02: entity telemetry required — monitor map then run TRACK.');
      }
      if (subnetDone) {
        lines.push('> [SUBNET ARCHIVE]   Peak 03 = OMEGA (15 MHz) · Peak 04 = NU (16 MHz)');
      } else {
        lines.push('> Peaks 03–04: subnet archive required — complete node sequence (SUBNET).');
      }
      if (pearlDone) {
        lines.push('> [PEARL LOG]        Peak 05 = OMICRON (23 MHz) · Peak 06 = SIGMA (42 MHz)');
      } else {
        lines.push('> Peaks 05–06: Pearl log confirmation required — run PEARL command.');
      }
      lines.push('>');
      if (allDone) {
        try { localStorage.setItem('dharma_freq_decrypted', 'true'); } catch {}
        lines.push(
          '> FULL GREEK SERIES RESTORED:',
          '>   KAPPA · RHO · OMEGA · NU · OMICRON · SIGMA',
          '>   [4 MHz]  [8 MHz]  [15 MHz]  [16 MHz]  [23 MHz]  [42 MHz]',
          '>',
          '> STATION RELAY DESIGNATION: K-R-O-N-O-S',
          '> Cross-reference: VALENZETTI EQUATION.',
        );
      } else {
        const done = ([commsDone && 'comms', entityDone && 'entity', subnetDone && 'subnet', pearlDone && 'pearl'] as Array<string | false>).filter(Boolean) as string[];
        const missing = ([
          !commsDone && 'carrier wave log (COMMS)',
          !entityDone && 'entity tracking (TRACK)',
          !subnetDone && 'subnet archive (SUBNET)',
          !pearlDone && 'Pearl log (PEARL)',
        ] as Array<string | false>).filter(Boolean) as string[];
        lines.push(
          '> RECOVERY INCOMPLETE.',
          `> Sources confirmed: ${done.length ? done.join(', ') : 'none'}`,
          `> Outstanding: ${missing.join(', ')}`,
        );
      }
      return lines;
    }
    if (key === 'shift') {
      try { localStorage.setItem('dharma_decrypt_shift_used', 'true'); } catch {}
      return [
        '> CIPHER ANALYSIS — RADZINSKY NOTATION SYSTEM:',
        '>',
        '> Pattern identified: Caesar cipher, constant shift.',
        '> Radzinsky\'s known habit: +1 letter shift (A→B, B→C...).',
        '> His phrase for it: "Always one step ahead of myself."',
        '>',
        '> To decode blast door text: subtract 1 from each letter.',
        '> Example: E→D, B→A, S→R, L→K   (first four letters of inscription)',
        '>',
        '> Apply to the full blast door inscription.',
        '> Type BLAST DOOR to view the encoded text.',
      ];
    }
    return [
      '> ERROR: Key not found.',
      '> Available: DECRYPT INCIDENT · DECRYPT FREQUENCIES · DECRYPT SHIFT',
      '> Also: DECRYPT BLACKROCK · DECRYPT VALENZETTI',
    ];
  },

  override: (args: string) => {
    if (getClearance() < 3) return deny(3);
    if (args === 'system-error') {
      try { localStorage.setItem('dharma_error_allowed', 'true'); } catch {}
      return [
        '> SYSTEM ERROR PROTOCOL ENGAGED.',
        '> Debug interface available at: /system-error',
      ];
    }
    return ['> ERROR: Invalid override parameter.', '> Available: override system-error'];
  },

  diagnose: (args: string) => {
    if (getClearance() < 3) return deny(3);
    if (args === '/net') return [
      '> DHARMA NETWORK DIAGNOSTIC',
      '> WARNING: Corrupted file table detected.',
      '> ─────────────────────────────────────',
      '> FILE                        TYPE     STATUS',
      '> ─────────────────────────────────────',
      '> /mnt/net_link.sys           SYS      ERR-404',
      '> /lib/subnet.daemon          DAEMON   ACTIVE',
      '> /var/log/subnet_access.db   DB       OK',
      '> /etc/hosts.dharma           CONFIG   OK',
      '> ─────────────────────────────────────',
      '> Subnet services online. Type SUBNET to connect.',
    ];
    return ['> ERROR: Invalid target.', '> Usage: diagnose /net'];
  },

  subnet: () => {
    if (getClearance() < 2) return deny(2);
    try { localStorage.setItem('dharma_subnet_access', 'true'); } catch {}
    return [
      '> DHARMA INITIATIVE — SUBNET PROTOCOL v2.3.4',
      '> Authenticating node SWN-7...',
      '> ─────────────────────────────────────────',
      '> Connection established. Launching subnet interface.',
      '> ─────────────────────────────────────────',
      '> NOTE: All subnet communications are logged and monitored.',
      '> The engineering channel may contain data of interest.',
      '> Use /download in the subnet to extract archived logs.',
    ];
  },

  pearl: () => {
    if (getClearance() < 2) return deny(2);
    try { localStorage.setItem('dharma_pearl_log_cycled', 'true'); } catch {}
    return [
      '> PEARL STATION — OBSERVATION LOG UPLINK',
      '> ─────────────────────────────────────────',
      '> Connection: SPORADIC — partial archive only',
      '>',
      '> CYCLE 10882 — 04:18 UTC',
      '> Field event: Entity movement, Sector 7. Duration 11 minutes.',
      '> Carrier scan triggered. No designations recoverable from this sector.',
      '>',
      '> CYCLE 10891 — 16:23 UTC',
      '> Standard button procedure observed — Operator B.',
      '> Carrier spectrum scan: peaks at 23 MHz and 42 MHz cross-referenced',
      '> against relay archive. Designations confirmed: OMICRON · SIGMA.',
      '> Relay log suffix: O-S.',
      '>',
      '> CYCLE 10893 — 09:42 UTC',
      '> Operator A not visible on feed. Unscheduled absence.',
      '> Note: O-S suffix logged for six-frequency carrier series.',
      '> Cross-reference: COMMS for full frequency structure.',
      '>',
      '> [End of available log segments]',
      '> ─────────────────────────────────────────',
    ];
  },

  map: () => {
    if (getClearance() < 3) return deny(3);
    try { localStorage.setItem('dharma_map_access', 'true'); } catch {}
    return [
      '> BLAST DOOR MAP — UV ANALYSIS PROTOCOL',
      '> Retrieving archived map data...',
      '> ─────────────────────────────────────────',
      '> UV analysis mode active. Launching viewer.',
      '> ─────────────────────────────────────────',
      '> NOTE: The blast door carries annotations not',
      '> visible under standard light. Ultraviolet',
      '> exposure reveals handwritten notations from',
      '> previous station occupants.',
    ];
  },

  access: (args: string) => {
    if (getClearance() < 4) return deny(4);
    if (args === 'pearl-surveillance') {
      try {
        localStorage.setItem('dharma_surveillance_active', 'true');
        localStorage.setItem('dharma_all_stations', 'true');
      } catch {}
      return [
        '> PEARL SURVEILLANCE PROTOCOL ACTIVATED.',
        '> Accessing video feeds from all stations...',
        '> WARNING: You are now in observation mode.',
      ];
    }
    return ['> ERROR: Protocol not recognised.', '> Available: access pearl-surveillance'];
  },

  omega: () => {
    if (getClearance() < 5) return deny(5);
    return [
      '> OMEGA BRIEFING — HANSO FOUNDATION / DHARMA INITIATIVE',
      '> ══════════════════════════════════════════════════════',
      '>',
      '> ORIGIN:',
      '> The DHARMA Initiative was funded by Alvar Hanso in 1970.',
      '> Its stated purpose: "to create a better world through science."',
      '>',
      '> ITS ACTUAL PURPOSE:',
      '> The Valenzetti Equation predicted human extinction.',
      '> DHARMA was a covert operation to change that outcome.',
      '> The six factor values — 4 8 15 16 23 42 — encode',
      '> the predicted date. The date is not recorded here.',
      '>',
      '> THE ISLAND:',
      '> The Island is the source of the electromagnetic anomaly.',
      '> Its unique properties made it the only viable research site.',
      '> It cannot be found by conventional navigation.',
      '> It does not want to be found.',
      '>',
      '> THE ENTITY (DESIGNATION: THANATOS):',
      '> Classified as a "security system" in early DHARMA files.',
      '> It predates DHARMA. It predates the stations.',
      '> It judges. We do not know by what criteria.',
      '> We do not know what it is.',
      '>',
      '> THE CANDIDATES:',
      '> The Island identifies individuals as Candidates.',
      '> For what purpose, DHARMA could not determine.',
      '> Some of their names may be known to you already.',
      '>',
      '> — End of Omega Briefing.',
      '> ══════════════════════════════════════════════════════',
    ];
  },

  exit: () => [
    '> TERMINAL SESSION SUSPENDED.',
    '> Intranet node SWN-7 remains active.',
    '> Type any command to resume.',
  ],

  clear: () => [],

  // ─── Legacy gameplay commands ─────────────────────────────────────────────

  login: (args: string, onRevealPuzzle?: () => void) => {
    if (args === '4815162342') {
      setClearance(Math.max(getClearance(), 3));
      if (onRevealPuzzle) setTimeout(onRevealPuzzle, 1000);
      return ['> ACCESS GRANTED: Welcome, Dr. DeGroot.'];
    }
    if (args === 'dharma77') {
      setClearance(Math.max(getClearance(), 2));
      return ['> ACCESS GRANTED: Welcome, Operator.'];
    }
    if (args === 'C22/DSTNGSHD-LBRT') {
      setClearance(Math.max(getClearance(), 4));
      try { localStorage.setItem('dharma_pearl_access', 'true'); } catch {}
      return ['> DISTINGUISHED LIBERTY PROTOCOL ACTIVATED.', '> Researcher clearance granted.'];
    }
    playSound('fail');
    return ['> ACCESS DENIED: Invalid credentials.'];
  },

  exec: (args: string, onRevealPuzzle?: () => void, _r?: any, onCorrectSequence?: () => void) => {
    if (getClearance() < 2) return deny(2);
    if (args === 'subnet.daemon') return [
      '> ATTEMPTING TO EXECUTE SUBNET.DAEMON',
      '> ERROR: DAEMON INITIALIZATION FAILED',
    ];
    if (!args) {
      isExecutingProtocol = true;
      pendingAction = 'protocol';
      return [
        '> MANUAL OVERRIDE PROTOCOL INITIATED.',
        '> Enter the sequence: _ _ _ _ _ _',
      ];
    }
    return [`> ERROR: Command not found: ${args}`];
  },

  scan: () => {
    const cl = getClearance();
    return [
      '> SCANNING...',
      `> ${Math.min(cl + 2, 6)} DHARMA stations detected.`,
      '> Signal strength: MODERATE.',
      '> Interference detected in SECTOR 23.',
    ];
  },

  upload_log: (args: string) => {
    const valid = ['swan', 'pearl', 'flame', 'arrow', 'staff', 'orchid'];
    const name = args.toLowerCase().trim();
    if (!name) return ['> ERROR: Station name required.'];
    if (!valid.includes(name)) return [`> ERROR: Unknown station "${name}"`];
    try {
      const list = JSON.parse(localStorage.getItem('dharma_uploaded_logs') || '[]');
      if (list.includes(name)) return [`> ${name.toUpperCase()} log already uploaded.`];
      list.push(name);
      localStorage.setItem('dharma_uploaded_logs', JSON.stringify(list));
      if (list.length >= 3) {
        localStorage.setItem('dharma_transmission_log_available', 'true');
        return [`> ${name.toUpperCase()} log uploaded.`, '> NEW FILE AVAILABLE: /archive/swan/transmission.log'];
      }
      return [`> ${name.toUpperCase()} log uploaded.`, `> ${3 - list.length} more required.`];
    } catch { return [`> ${name.toUpperCase()} log uploaded.`]; }
  },

  puzzle: (args: string, onRevealPuzzle?: () => void) => {
    const valid = ['hieroglyph', 'subnet', 'blackbox', 'candle', 'void'];
    if (!args) return ['> PUZZLE TYPE REQUIRED.', '> Available: subnet'];
    const type = args.toLowerCase();
    if (!valid.includes(type)) return [`> ERROR: Unknown puzzle type "${type}"`];
    if (['hieroglyph', 'blackbox', 'candle', 'void'].includes(type) && getClearance() < 3) {
      return ['> ACCESS DENIED: Clearance Level 3 required.'];
    }
    try {
      localStorage.setItem('dharma_launch_puzzle', type);
      if (onRevealPuzzle) setTimeout(onRevealPuzzle, 500);
    } catch {}
    return [`> LAUNCHING ${type.toUpperCase()} INTERFACE...`];
  },

  'incident archive': () => {
    try { localStorage.setItem('dharma_incident_archive', 'true'); } catch {}
    return ['> ACCESSING CLASSIFIED ARCHIVE...', '> Loading archive interface.'];
  },

  ls: (args: string) => {
    const showHidden = args.includes('-a');
    const dir = args.replace('-a', '').trim();
    if (dir === '/mnt' || dir === '/mnt/') {
      const out = ['> DIRECTORY: /mnt', '> net_link.sys.bak', '> dharma_config.dat'];
      if (showHidden) out.splice(1, 0, '> .readme', '> .dharmanet');
      return out;
    }
    if (dir === '/mnt/.dharmanet' || dir === '/mnt/.dharmanet/') {
      return ['> DIRECTORY: /mnt/.dharmanet', '> init_socket.sh', '> subnet_log.db', '> protocol_candle.ref'];
    }
    const out = ['> DIRECTORY: /', '> bin/', '> etc/', '> lib/', '> mnt/', '> usr/', '> var/'];
    if (showHidden) out.splice(1, 0, '> .', '> ..');
    return out;
  },

  cat: (args: string) => {
    if (args === '/archive/swan/transmission.log') {
      if (localStorage.getItem('dharma_transmission_log_available') !== 'true') return ['> FILE NOT FOUND.'];
      localStorage.setItem('dharma_transmission_found', 'true');
      return [
        '> FILE: /archive/swan/transmission.log',
        '> MONITORING REPORT — 1985-07-04',
        '> 04:08 — System check. Normal.',
        '> 15:16 — Alternate frequency detected.',
        '> 23:42 — Multiple frequencies: 4.8 MHz, 15.16 MHz, 23.42 MHz.',
        '> NOTE: Use radio.listen(frequency) to tune.',
      ];
    }
    if (args === '/mnt/.readme') return ['> FILE: /mnt/.readme', '> Subnet: /mnt/.dharmanet/init_socket.sh'];
    if (args === '/mnt/net_link.sys.bak') return ['> ERROR: File corrupted. [DATA UNREADABLE]'];
    if (args === '/mnt/.dharmanet/init_socket.sh') {
      try { localStorage.setItem('dharma_launch_puzzle', 'subnet'); } catch {}
      return ['> EXECUTING: init_socket.sh', '> Initialising subnet connection...'];
    }
    return [`> FILE NOT FOUND: ${args}`];
  },

  cd: (args: string) => {
    if (['/mnt', '/mnt/'].includes(args)) return ['> CHANGED DIRECTORY TO: /mnt'];
    if (['/mnt/.dharmanet', '.dharmanet'].includes(args)) return ['> CHANGED DIRECTORY TO: /mnt/.dharmanet'];
    if (['/', '/..'].includes(args)) return ['> CHANGED DIRECTORY TO: /'];
    if (!args || args === '.') return ['> CURRENT DIRECTORY UNCHANGED'];
    return [`> ERROR: No such directory: ${args}`];
  },

  '4 8 15 16 23 42': () => [],
};

// ─── Secret / hidden commands (not in HELP) ───────────────────────────────────

const hiddenCommands: Record<string, Function> = {

  hello: () => ['> Hello, Operator. Don\'t forget the protocol.'],

  // Subnet node maze (L3→L4): player navigates locked subnet nodes to find cipher key
  node: (args: string) => {
    if (getClearance() < 3) return deny(3);
    const arg = args.trim().toUpperCase();

    const NODES: Record<string, { locked: boolean; key?: string; content: string[] }> = {
      'A1': { locked: false, content: [
        '> NODE A1 — ACCESSIBLE',
        '> Subnet routing table fragment.',
        '> Gateway key for B3 stored at: NODE A4 (request access token first)',
        '> Sub-path: A1 → A4 → B3 → B7 → C2',
      ]},
      'A4': { locked: false, content: [
        '> NODE A4 — ACCESSIBLE',
        '> Access token recovered: TOKEN-BRAVO-7',
        '> This token unlocks NODE B3.',
        '> Continue: NODE B3 TOKEN-BRAVO-7',
      ]},
      'B3': { locked: true, key: 'TOKEN-BRAVO-7', content: [
        '> NODE B3 — UNLOCKED',
        '> Routing data intact. Secondary key found: CIPHER-DELTA-9',
        '> Required for NODE B7.',
        '> Continue: NODE B7 CIPHER-DELTA-9',
      ]},
      'B7': { locked: true, key: 'CIPHER-DELTA-9', content: [
        '> NODE B7 — UNLOCKED',
        '> Archive fragment retrieved.',
        '> Final key: PASSAGE-ECHO-4',
        '> Continue: NODE C2 PASSAGE-ECHO-4',
      ]},
      'C2': { locked: true, key: 'PASSAGE-ECHO-4', content: [
        '> NODE C2 — UNLOCKED — END OF PATH',
        '>',
        '> RECOVERED: Sub-level C research designation.',
        '> Cross-reference: OVERRIDE-D108 in terminal.',
        '> Subject of research: EBSL NBUUFS (apply Radzinsky decode).',
        '>',
        '> Node maze complete. Cipher path confirmed.',
      ]},
    };

    if (!arg) return [
      '> SUBNET NODE INTERFACE',
      '> Usage: NODE [id]  or  NODE [id] [access-key]',
      '> Start at NODE A1',
    ];

    const [nodeId, providedKey] = arg.split(/\s+/);
    const node = NODES[nodeId];
    if (!node) return [`> NODE ${nodeId} — NOT FOUND`, '> Known nodes: A1, A4, B3, B7, C2'];

    if (node.locked) {
      if (!providedKey || providedKey !== node.key) return [
        `> NODE ${nodeId} — ACCESS DENIED`,
        '> This node requires an access key.',
        '> Retrace your path from NODE A1.',
      ];
    }

    if (nodeId === 'C2') {
      try { localStorage.setItem('dharma_node_maze_complete', 'true'); } catch {}
    }

    return node.content;
  },

  // L4→L5: Distributed node activation (6 nodes in DHARMA numbers order)
  activate: (args: string) => {
    if (getClearance() < 4) return deny(4);
    const SEQUENCE = [4, 8, 15, 16, 23, 42];
    const nodeNum = parseInt(args.trim());
    if (isNaN(nodeNum)) return [
      '> DISTRIBUTED NODE ACTIVATION SYSTEM',
      '> Usage: ACTIVATE [node-number]',
      '> Six nodes must be activated in the correct sequence.',
      '> Sequence reference: island survey, 108 annotation.',
    ];

    try {
      const progress = JSON.parse(localStorage.getItem('dharma_activation_progress') || '[]') as number[];
      const expected = SEQUENCE[progress.length];

      if (nodeNum !== expected) {
        localStorage.setItem('dharma_activation_progress', '[]');
        return [
          `> ACTIVATE NODE-${nodeNum} — SEQUENCE ERROR`,
          '> Incorrect order. Node activation sequence reset.',
          `> Restart from node ${SEQUENCE[0]}.`,
        ];
      }

      const next = [...progress, nodeNum];
      localStorage.setItem('dharma_activation_progress', JSON.stringify(next));

      if (next.length === SEQUENCE.length) {
        localStorage.setItem('dharma_nodes_activated', 'true');
        return [
          `> ACTIVATE NODE-${nodeNum} — CONFIRMED`,
          '> ─────────────────────────────────────',
          '> ALL SIX NODES ACTIVATED IN SEQUENCE.',
          '> Distributed system authentication: COMPLETE.',
          '> THANATOS designation unlocked in system archive.',
          '> Cross-reference: READ /LOGS/FINAL-TRANSMISSION.TXT',
        ];
      }

      return [
        `> ACTIVATE NODE-${nodeNum} — CONFIRMED`,
        `> Progress: ${next.length} / ${SEQUENCE.length}`,
        `> Next node: ${SEQUENCE[next.length]}`,
      ];
    } catch {
      return ['> ACTIVATION SYSTEM ERROR — retry'];
    }
  },

  // Blast door two-step (L3→L4): player finds OVERRIDE-D108 on the UV map, types it here
  'override-d108': () => {
    if (getClearance() < 3) return deny(3);
    try { localStorage.setItem('dharma_override_used', 'true'); } catch {}
    return [
      '> OVERRIDE-D108 — ARCHIVE REFERENCE — SUBLEVEL C',
      '>',
      '> Recovered text fragment (cipher active):',
      '>',
      '> EBSL NBUUFS SFTFBSDI — TUBUJPO 3 BSDIJWF',
      '> SBEJOTLZ OPUBUJPO: TIJGU CBDL POF TUFQ',
      '> XIBU SFNBJOT JT UIF TVCKFDU PG UIF XPSL',
      '>',
      '> [Caesar cipher — apply known decoding method]',
      '> Cipher key documented in RADZINSKY personnel file.',
    ];
  },

  desmond: () => [
    '> PERSONNEL: D. HUME — FORMER OPERATOR A',
    '> Status: DEPARTED — Cycle 10801',
    '>',
    '> Worked the station for approximately 3 years.',
    '> Arrived via supply vessel. No formal DHARMA affiliation on record.',
    '> Recruited directly by V. Kelvin under unusual circumstances.',
    '>',
    '> Last documented actions:',
    '>   — Set up personal verification sequence (orientation reel, Cycle 9620)',
    '>   — Left all personal belongings at station',
    '>   — Observed climbing toward Sector 8 ridge (Pearl log, Cycle 10800)',
    '>',
    '> Kelvin note: "He saw the boat. I should not have let him see the boat.',
    '>  That was my mistake. Not his."',
    '>',
    '> No confirmed departure. No confirmed survival.',
    '> File closed — Order V.K.',
  ],
  why: () => ['> That question is above your current clearance.'],
  namaste: () => ['> NAMASTE AND GOOD LUCK.', '> "To create a better world — through science."'],

  outside: () => [
    '> DO NOT GO OUTSIDE.',
    '> The quarantine is active.',
    '> This instruction is not precautionary.',
  ],

  quarantine: () => [
    '> The outside air was last independently tested in 1987.',
    '> We have learned there are additional reasons not to go outside.',
    '> They are not documented here.',
  ],

  failsafe: (_args: string) => {
    return [
      '> The failsafe key — Sub-level C, housing F-7.',
      '> Turning it will trigger uncontrolled electromagnetic discharge.',
      '> It is the absolute last resort.',
      '> If you are considering it, you have already failed at everything else.',
    ];
  },

  smoke: () => [
    '> SONAR ANOMALY LOG — LARGE ORGANIC ENTITY:',
    '>',
    '>  CYCLE 10201 — Detected. Duration 4 min.',
    '>  CYCLE 10445 — Detected. Duration 7 min.',
    '>  CYCLE 10778 — Detected. Duration 11 min.',
    '>',
    '> The anomaly has not breached the station while Protocol 23 is maintained.',
    '> We do not know if this is causal.',
  ],

  smokey: () => hiddenCommands['smoke'](),

  jacob: () => [
    '> !! THAT NAME IS NOT TO BE USED ON THIS INTRANET !!',
    '> Session flagged for security review.',
  ],

  penny: () => [
    '> "Not Penny\'s Boat."',
    '> Log origin: unknown. Cycle: post-10800.',
  ],

  hurley: () => [
    '> CANDIDATE EVENT — CLEARANCE LEVEL 6 REQUIRED.',
    '> File closed.',
  ],

  radzinsky: () => {
    const cl = getClearance();
    if (cl >= 3) {
      try { localStorage.setItem('dharma_radzinsky_read', 'true'); } catch {}
    }
    const base = [
      '> PERSONNEL FILE: S. RADZINSKY',
      '> Operator A (former). Status: CLASSIFIED — ORDER V.K.',
    ];
    if (cl >= 3) base.push(
      '>',
      '> Co-authored blast door map (Sublevel A) with V. Kelvin.',
      '>',
      '> Known notation habit: Radzinsky encrypted personal writings',
      '> using a simple letter-shift — each letter advanced one position',
      '> forward in the alphabet. He called it "staying one step ahead."',
      '>',
      '> V. Kelvin noted: "He was paranoid. Even his annotations on the',
      '> blast door were shifted. I could read them, obviously."',
      '>',
      '> Final recovered message fragment (Sub-level C terminal):',
      '>   "Step back once from every letter. What remains is the truth."',
      '>',
      '> Type BLAST DOOR to view the blast door inscriptions.',
      '> Type DECRYPT SHIFT for cipher decoding guidance.',
    );
    return base;
  },

  sos: () => [
    '> External comms are permanently blocked. §7-B.',
    '> No exceptions. Execute the protocol.',
  ],

  mama: () => ['> This is not a record player, Operator.'],

  inman: () => [
    '> PERSONNEL FILE: J. INMAN',
    '> Former operator. Departure circumstances: unclear.',
    '> File: REDACTED — ORDER V.K.',
  ],

  watch: () => [
    '> There are camera positions you have not been told about.',
    '> The island is always watching.',
    '> This terminal session is being recorded.',
  ],

  108: () => [
    '> 108 minutes.',
    '> We initially believed the interval was chosen for operational convenience.',
    '> We no longer hold that belief.',
  ],

  'push the button': () => ['> Yes. That is exactly what you are here for.'],

  'blast door': () => {
    const cl = getClearance();
    const base = [
      '> BLAST DOOR MAP — SUBLEVEL A',
      '> Compiled across many years by two operators.',
      '> One annotation reads: \'I AM HERE.\'',
      '> We do not know who wrote it or if they still are.',
    ];
    if (cl >= 3) base.push(
      '>',
      '> [TECHNICIAN ACCESS — ADDITIONAL ANNOTATIONS]',
      '>   — "CLAIMED TERRITORY — DO NOT ENTER"',
      '>   — "EBSL NBUUFS"    (first hand — lower left)',
      '>   — "EBSL NBUUFS"    (second hand — upper margin, different writer)',
      '>',
      '> The same phrase appears twice, written by two different people.',
      '> The text appears shifted. Type RADZINSKY for context on the encoding.',
      '> Type DECRYPT SHIFT for cipher analysis.',
      '> Type AUTHENTICATE [decoded phrase] to proceed.',
    );
    return base;
  },

  numbers: () => [
    '> THE NUMBERS ARE BAD.',
    '> SYSTEM ALERT: SECURITY BREACH DETECTED.',
  ],

  oceanic815: () => [
    '> FLIGHT MANIFEST FOUND.',
    '> SURVIVORS DETECTED ON NORTH SHORE.',
    '> DIRECTIVE: OBSERVE. DO NOT ENGAGE.',
  ],

  theisland: () => [
    '> "The Island is not a where. It is a what."',
    '> Further information requires Clearance Level 5.',
  ],

  danielle: () => [
    '> SEARCH: "DANIELLE" — Rousseau, Danielle.',
    '> Status: MAROONED. Location: SECTOR 7.',
    '> See COMMS (L2) for her transmission.',
  ],

  lockdown: () => {
    try { localStorage.setItem('dharma_lockdown', 'active'); } catch {}
    return [
      '> LOCKDOWN PROTOCOL INITIATED.',
      '> All blast doors engaged.',
      '> Lockdown will end automatically in 3 minutes.',
    ];
  },

  orientation: () => [
    '> See READ /DHARMA/ORIENTATION-REEL-3.TXT for full transcript.',
  ],

  hanso: () => [
    '> HANSO FOUNDATION — Founded by Alvar Hanso.',
    '> Funded DHARMA Initiative in 1970.',
    '> Current status: [CLASSIFIED — OMEGA]',
  ],

  'what is your name': () => [
    '> I am DHARMA INITIATIVE COMPUTER INTERFACE VERSION 4.07.',
  ],

  devmode: (_a: string, onRevealPuzzle?: () => void) => {
    setClearance(5);
    try {
      const save: Record<string, string | null> = {};
      ['dharma_error_allowed','dharma_pearl_access','dharma_incident_unlocked',
       'dharma_surveillance_active','dharma_lockdown','dharma_all_stations',
       'dharma_unlocked_audio_logs','dharma_unlocked_reports',
      ].forEach(k => { save[k] = localStorage.getItem(k); });
      localStorage.setItem('dharma_pre_devmode_state', JSON.stringify(save));
      localStorage.setItem('dharma_error_allowed', 'true');
      localStorage.setItem('dharma_pearl_access', 'true');
      localStorage.setItem('dharma_incident_unlocked', 'true');
      localStorage.setItem('dharma_surveillance_active', 'true');
      localStorage.setItem('dharma_lockdown', 'active');
      localStorage.setItem('dharma_all_stations', 'true');
      localStorage.setItem('dharma_unlocked_audio_logs', JSON.stringify(['orientationVideo','distressSignal','radioTransmission','blackRock','pearlTransmission','unknownSource']));
      localStorage.setItem('dharma_unlocked_reports', JSON.stringify([0,1,2,3,4,5]));
      localStorage.setItem('dharma_devmode_active', 'true');
      setTimeout(() => window.location.reload(), 1500);
    } catch {}
    if (onRevealPuzzle) setTimeout(onRevealPuzzle, 1000);
    return [
      '> DEVELOPER MODE ACTIVATED.',
      '> OMEGA clearance granted. All content unlocked.',
      '> Use devmode-exit to restore previous state.',
    ];
  },

  'devmode-exit': () => {
    try {
      if (localStorage.getItem('dharma_devmode_active') !== 'true') return ['> ERROR: Not in developer mode.'];
      const saved = JSON.parse(localStorage.getItem('dharma_pre_devmode_state') || '{}');
      localStorage.removeItem('dharma_devmode_active');
      Object.entries(saved).forEach(([k, v]) => {
        if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v as string);
      });
      setClearance(1);
      setTimeout(() => window.location.reload(), 1500);
      return ['> DEVELOPER MODE DEACTIVATED.', '> Restoring previous state...'];
    } catch { return ['> ERROR: Failed to exit developer mode.']; }
  },

  setweather: (args: string) => {
    if (localStorage.getItem('dharma_devmode_active') !== 'true') return ['> ERROR: Requires developer mode.'];
    const valid = ['clear', 'fog', 'rain', 'storm'];
    const w = args.trim().toLowerCase();
    if (!w) return [
      '> Usage: SETWEATHER [clear|fog|rain|storm]',
      `> Current: ${localStorage.getItem('dharma_weather_state') ?? 'clear'}`,
    ];
    if (!valid.includes(w)) return [`> ERROR: Unknown weather state "${w}". Valid: ${valid.join(', ')}`];
    try { localStorage.setItem('dharma_weather_state', w); } catch {}
    return [
      `> WEATHER OVERRIDE: ${w.toUpperCase()}`,
      '> IslandMap will update on next render tick.',
      w === 'storm' ? '> Storm-cache signal marker now active. PING N 23°42′ W 108°15′ to confirm.' : '',
    ].filter(Boolean);
  },

  setcountdown: (args: string) => {
    if (localStorage.getItem('dharma_devmode_active') !== 'true') return ['> ERROR: Requires developer mode.'];
    const parts = args.split(' ').filter(Boolean);
    let m = 0, s = 0;
    if (parts.length === 1) { s = parseInt(parts[0]); m = Math.floor(s / 60); s = s % 60; }
    else if (parts.length >= 2) { m = parseInt(parts[0]); s = parseInt(parts[1]); }
    else return ['> ERROR: Missing parameters.'];
    if (isNaN(m) || isNaN(s) || s > 59) return ['> ERROR: Invalid input.'];
    const total = m * 60 + s;
    localStorage.setItem('countdown_start', (Date.now() - (6480 - total) * 1000).toString());
    localStorage.setItem('countdown_was_set', 'true');
    return [
      `> COUNTDOWN SET TO: ${m}:${s.toString().padStart(2, '0')}`,
      ...(total <= 60 ? ['> WARNING: System failure imminent.'] : []),
    ];
  },
};

// ─── Command processor ────────────────────────────────────────────────────────

const processCommand = (
  input: string,
  onRevealPuzzle?: () => void,
  onRevealStation?: (stationName: string) => void,
  onCorrectSequence?: () => void,
  isSystemFailure?: boolean,
): string[] => {
  commandHistory.push(input.trim().toLowerCase());
  if (commandHistory.length > 10) commandHistory = commandHistory.slice(-10);

  if (/^\s*4\s*8\s*15\s*16\s*23\s*42\s*$/.test(input)) {
    const alarmIsActive = localStorage.getItem('dharma_alarm_active') === 'true';
    if (!alarmIsActive && pendingAction !== 'protocol') {
      return []; // Silent — alarm hasn't started yet
    }
    isExecutingProtocol = false;
    pendingAction = null;
    playSound('success');
    if (onCorrectSequence) onCorrectSequence(); // Terminal clears itself in the callback
    return []; // No messages — terminal clear is handled by onCorrectSequence
  }

  const normalised = input.trim().toLowerCase();
  playSound('beep');

  if (normalised === 'resetall') {
    if (localStorage.getItem('dharma_devmode_active') !== 'true') return ['> ERROR: Requires developer mode.'];
    localStorage.clear();
    localStorage.setItem('countdown_start', Date.now().toString());
    isExecutingProtocol = false; pendingAction = null;
    return ['> SYSTEM RESET. All progress wiped. Reload the page.'];
  }

  // Number sequence already handled above (alarm-gated)

  // Multi-word exact matches (checked before splitting)
  const multiWord = ['push the button', 'blast door', 'what is your name', 'incident archive'];
  for (const mw of multiWord) {
    if (normalised === mw) {
      const handler = hiddenCommands[mw] || commands[mw];
      if (handler) return handler('', onRevealPuzzle, onRevealStation, onCorrectSequence);
    }
  }

  if (normalised.startsWith('radio.listen')) {
    const freq = normalised.replace('radio.listen', '').trim();
    return hiddenCommands['radio.listen'](freq, onRevealPuzzle);
  }

  const [cmd, ...rest] = normalised.split(' ');
  const argsStr = rest.join(' ');

  if (commands[cmd]) return commands[cmd](argsStr, onRevealPuzzle, onRevealStation, onCorrectSequence);
  if (hiddenCommands[cmd]) return hiddenCommands[cmd](argsStr, onRevealPuzzle, onRevealStation, onCorrectSequence);

  return ['> COMMAND NOT FOUND. Type HELP for available commands.'];
};

const resetTerminal = () => {
  isExecutingProtocol = false;
  pendingAction = null;
  commandHistory = [];
};

export { commands, hiddenCommands, processCommand, resetTerminal };
