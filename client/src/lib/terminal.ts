import { playSound } from './audio';
import { DHARMA_NUMBERS } from './constants';

let isExecutingProtocol = false;
let pendingAction: string | null = null;
let accessLevel = 1;
let commandHistory: string[] = [];

// ─── Documented commands (appear in HELP) ────────────────────────────────────

const commands: Record<string, Function> = {
  help: () => [
    '> SWAN STATION — INTRANET NODE SWN-7',
    '> AVAILABLE COMMANDS:',
    '>',
    '>  HELP          — display this message',
    '>  STATUS        — system status overview',
    '>  WHO           — active personnel roster',
    '>  FILES         — list accessible files',
    '>  READ [path]   — read a file',
    '>  PING          — test intranet node connectivity',
    '>  INCIDENT      — recent incident log entries',
    '>  DHARMA        — DHARMA station directory',
    '>  VALENZETTI    — Valenzetti Equation summary',
    '>  CLEAR         — clear terminal output',
    '>  EXIT          — end terminal session',
  ],

  status: () => {
    const powerLevel = Math.floor(Math.random() * 15) + 70;
    if (pendingAction === 'protocol') {
      return [
        '> SYSTEM STATUS: PROTOCOL EXECUTION REQUIRED',
        `> EM Containment:      UNSTABLE`,
        `> Power reserve:       ${powerLevel}% (DECREASING)`,
        '> Communication:       COMPROMISED',
        '> Failsafe Key:        HOUSING F-7 — INTACT',
        '> WARNING: System failure imminent.',
        '> Enter the sequence to reset the counter.',
      ];
    }
    return [
      '> SYSTEM STATUS:',
      `> EM Containment:      ${accessLevel >= 3 ? 'FLUCTUATING' : 'ACTIVE'}`,
      `> Power reserve:       ${powerLevel}%`,
      '> Failsafe Key:        HOUSING F-7 — INTACT',
      '> Intranet Node:       SWN-7 — ONLINE',
      '> Sonar Array:         DEGRADED (see INCIDENT log)',
      '> EM Anomaly:          NOMINAL',
      '> Protocol 23:         ACTIVE',
      '> External Comms:      BLOCKED §7-B',
      '> Quarantine:          IN EFFECT',
    ];
  },

  who: () => [
    '> ACTIVE PERSONNEL — SWAN STATION:',
    '>',
    '>  WICKMUND, G. ............... STATION CHIEF',
    '>  CANDLE, M. ................. TECHNICAL OFFICER',
    '>  [CLASSIFIED] ............... OPERATOR A',
    '>  [CLASSIFIED] ............... OPERATOR B',
    '>',
    '>  RELIEF TEAM ETA: 540 HOURS',
  ],

  files: () => [
    '> ACCESSIBLE FILES — CLEARANCE LEVEL 4:',
    '>',
    '>  /PROTOCOL/PROTOCOL-23.TXT',
    '>  /LOGS/INCIDENT-4-23-1980.TXT ......... [PARTIAL — REDACTED]',
    '>  /LOGS/CYCLE-LOG-10894.TXT',
    '>  /DHARMA/ORIENTATION-REEL-3.TXT',
    '>  /FILES/VK-108.TXT ................... [CLEARANCE 5]',
    '>  /FILES/COORDINATES.TXT .............. [CLEARANCE 5]',
    '>',
    '>  Use READ [path] to open a file.',
  ],

  read: (args: string) => {
    if (!args) {
      return [
        '> ERROR: Path required.',
        '> Usage: READ [path]',
        '> Example: READ /PROTOCOL/PROTOCOL-23.TXT',
        '> Type FILES to see accessible paths.',
      ];
    }

    const path = args.trim().toUpperCase();
    const norm = path.startsWith('/') ? path : '/' + path;

    // Clearance 5 files
    const cl5 = accessLevel >= 4;
    if (norm === '/FILES/VK-108.TXT' || norm === 'VK-108.TXT') {
      if (!cl5) return [
        '> ACCESS DENIED.',
        '> /FILES/VK-108.TXT requires Clearance Level 5.',
        '> Clearance 5 is closer than you think.',
      ];
      return [
        '> FILE: /FILES/VK-108.TXT',
        '> ─────────────────────────────────────────',
        '> RE: VALENZETTI EQUATION — OPERATIONAL CONTEXT',
        '> FROM: V. KELVIN, SR. TECH OFFICER, CYCLE 9341',
        '>',
        '> The equation was derived by Enzo Valenzetti in 1962,',
        '> commissioned by the UN following the Cuban Missile Crisis.',
        '> Its purpose: to predict the precise date of human extinction.',
        '>',
        '> The six core factors of the equation are represented by six',
        '> numerical values. The DHARMA Initiative was established to',
        '> change at least one of these values and alter the outcome.',
        '>',
        '> The Swan protocol exists to prevent an uncontrolled discharge',
        '> that would accelerate Factor 4. The sequence you enter does',
        '> not change the equation. It only keeps the clock running',
        '> until someone figures out how to actually stop it.',
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

    if (norm === '/FILES/COORDINATES.TXT' || norm === 'COORDINATES.TXT') {
      if (!cl5) return [
        '> ACCESS DENIED.',
        '> /FILES/COORDINATES.TXT requires Clearance Level 5.',
      ];
      return [
        '> FILE: /FILES/COORDINATES.TXT',
        '> ─────────────────────────────────────────',
        '> POSITION:             4°48\'N  108°42\'W',
        '> MAGNETIC DECLINATION: 11.3° E  (anomalous)',
        '> GRID REF:             DHARMA INTERNAL MAP NODE 7',
        '>',
        '> NOTE: These coordinates are not to be shared with',
        '> personnel outside this station. External awareness of',
        '> this position would compromise ongoing research.',
        '>',
        '> — ORDER V.K.',
        '> ─────────────────────────────────────────',
      ];
    }

    if (norm === '/PROTOCOL/PROTOCOL-23.TXT' || norm === 'PROTOCOL/PROTOCOL-23.TXT') {
      return [
        '> FILE: /PROTOCOL/PROTOCOL-23.TXT',
        '> ─────────────────────────────────────────',
        '> PROTOCOL 23 — ELECTROMAGNETIC CONTAINMENT',
        '> CLASSIFICATION: LEVEL 4',
        '> AUTHORED BY: DeGroot, G. & Hanso, A. — 1977',
        '> LAST REVISED: Candle, M. — Cycle 9100',
        '>',
        '> PURPOSE:',
        '> To prevent uncontrolled electromagnetic discharge',
        '> through periodic operator input at the primary terminal.',
        '>',
        '> PROCEDURE:',
        '> The operator will enter the designated sequence every',
        '> 108 minutes. The sequence consists of six values, two',
        '> digits each. The values are known to all authorised',
        '> personnel. They are not reproduced in this document.',
        '>',
        '> FAILURE STAGES:',
        '>   STAGE 1 — Warning alarm at T-5:00',
        '>   STAGE 2 — Critical alarm at T-1:00',
        '>   STAGE 3 — Containment failure. EM discharge.',
        '>   STAGE 4 — Hieroglyph display (equipment fault state)',
        '>',
        '> Do not attempt to communicate via this terminal.',
        '> Do not leave the station.',
        '> ─────────────────────────────────────────',
      ];
    }

    if (norm === '/LOGS/INCIDENT-4-23-1980.TXT' || norm === 'LOGS/INCIDENT-4-23-1980.TXT') {
      return [
        '> FILE: /LOGS/INCIDENT-4-23-1980.TXT',
        '> ─────────────────────────────────────────',
        '> INCIDENT REPORT — 1980-04-23 — 14:23 LOCAL',
        '> CLASSIFICATION: PARTIAL — REDACTED ORDER V.K.',
        '>',
        '> At 14:23, an uncontrolled electromagnetic event',
        '> occurred during scheduled maintenance in Sub-level C.',
        '>',
        '> Casualties:        [REDACTED — ORDER V.K.]',
        '> Equipment loss:    [REDACTED — ORDER V.K.]',
        '> Root cause:        [REDACTED — ORDER V.K.]',
        '>',
        '> Result: Protocol 23 established. Swan Station converted',
        '> to indefinite occupied operation effective 1980-05-01.',
        '>',
        '> For full report, Clearance Level 5 required.',
        '> ─────────────────────────────────────────',
      ];
    }

    if (norm === '/LOGS/CYCLE-LOG-10894.TXT' || norm === 'LOGS/CYCLE-LOG-10894.TXT') {
      return [
        '> FILE: /LOGS/CYCLE-LOG-10894.TXT',
        '> ─────────────────────────────────────────',
        '> CYCLE: 10894',
        '> STATUS: ACTIVE',
        '> EM LEVEL: 73% GAUSS (NOMINAL)',
        '> INPUT STATUS: PENDING',
        '>',
        '> Previous cycle (10893): Input at T-02:14. Normal.',
        '> Sonar: one anomalous reading, duration 6 min. Logged.',
        '> External contact attempts: 0.',
        '> ─────────────────────────────────────────',
      ];
    }

    if (norm === '/DHARMA/ORIENTATION-REEL-3.TXT' || norm === 'DHARMA/ORIENTATION-REEL-3.TXT') {
      return [
        '> FILE: /DHARMA/ORIENTATION-REEL-3.TXT',
        '> ─────────────────────────────────────────',
        '> ORIENTATION FILM — STATION 3: THE SWAN',
        '> PRESENTER: M. CANDLE, TECHNICAL OFFICER',
        '>',
        '> "Hello. I am Dr. Marvin Candle, and this is the',
        '> orientation film for Station 3 of the DHARMA Initiative.',
        '>',
        '> "The station you are now occupying was originally',
        '> constructed as a laboratory facility. Following an',
        '> incident in April 1980, its primary function was',
        '> altered. The details of that incident remain',
        '> classified. What you need to know is this:"',
        '>',
        '> "Every 108 minutes, the counter must be reset by',
        '> entering the code. This is your only function.',
        '> Do not attempt communication with the outside world.',
        '> Do not leave the station.",',
        '>',
        '> "Pushing this button is the most important thing',
        '> you will ever do. It may be the only important',
        '> thing you will ever do."',
        '>',
        '> — End of transcript. Cycle 9100.',
        '> ─────────────────────────────────────────',
      ];
    }

    return [
      `> FILE NOT FOUND: ${norm}`,
      '> Type FILES to see accessible paths.',
    ];
  },

  ping: () => [
    '> TESTING INTRANET NODE CONNECTIVITY...',
    '>',
    '>  SWN-7    (self)        OK        [0ms]',
    '>  SWN-HUB  (backbone)   OK        [9ms]',
    '>  PEARL-3  (obs)         TIMEOUT',
    '>  FLAME-1  (comms)       NO ROUTE',
    '>  STAFF-1  (medical)     NO ROUTE',
    '>  ORCHID   (unknown)     REFUSED',
    '>  WORLD    (external)    BLOCKED   §7-B',
  ],

  incident: () => [
    '> INCIDENT LOG — RECENT ENTRIES:',
    '>',
    '>  CYCLE 10881 — Minor EM fluctuation. Within parameters.',
    '>  CYCLE 10876 — Sonar anomaly. Large organic signature. Logged.',
    '>  CYCLE 10849 — Operator reported sounds outside station.',
    '>                Not logged officially.',
    '>  CYCLE 10801 — [REDACTED — ORDER V.K.]',
    '>  CYCLE 10734 — Regular maintenance. No incidents.',
    '>  1980-04-23  — THE INCIDENT.',
    '>                See: READ /LOGS/INCIDENT-4-23-1980.TXT',
  ],

  dharma: () => [
    '> DHARMA INITIATIVE — STATION DIRECTORY:',
    '>',
    '>  STATION 1 — THE ARROW    Defense / Storage',
    '>  STATION 2 — THE STAFF    Medical Research',
    '>  STATION 3 — THE SWAN     EM Containment / Protocol  ← YOU ARE HERE',
    '>  STATION 4 — THE FLAME    Communications Hub',
    '>  STATION 5 — THE PEARL    Psychological Observation',
    '>  STATION 6 — THE ORCHID   [EXISTENCE NOT CONFIRMED]',
  ],

  valenzetti: () => [
    '> VALENZETTI EQUATION — SUMMARY:',
    '>',
    '> Author:    Enzo Valenzetti, 1962.',
    '> Source:    Commissioned by the UN, post-Cuban Missile Crisis.',
    '> Purpose:   Predicts the exact date of human extinction',
    '>            based on six core environmental and human factors.',
    '>',
    '> The DHARMA Initiative mission: alter at least one core factor.',
    '> The Swan protocol: prevent a discharge that accelerates Factor 4.',
    '>',
    '> The six factor values sum to 108.',
    '> The 108-minute interval is derived directly from this sum.',
    '>',
    '> NOTE: Entering the sequence does not change the equation.',
    '>       It only prevents immediate discharge.',
    '>       The clock continues.',
    '>',
    '> Full documentation: READ /FILES/VK-108.TXT',
    '> (Clearance Level 5 required.)',
  ],

  exit: () => [
    '> TERMINAL SESSION SUSPENDED.',
    '> Intranet node SWN-7 remains active.',
    '> Type any command to resume.',
  ],

  clear: () => [],

  // ─── Legacy gameplay commands (undocumented from help but functional) ───────

  login: (args: string, onRevealPuzzle?: () => void) => {
    if (args === '4815162342') {
      accessLevel = Math.max(accessLevel, 3);
      if (onRevealPuzzle) setTimeout(onRevealPuzzle, 1000);
      return ['> ACCESS GRANTED: Welcome, Dr. DeGroot.', '> Security level 3 access granted.'];
    } else if (args === 'dharma77') {
      accessLevel = Math.max(accessLevel, 2);
      return ['> ACCESS GRANTED: Welcome, Station Operator.', '> Security level 2 access granted.'];
    } else if (args === 'C22/DSTNGSHD-LBRT') {
      accessLevel = Math.max(accessLevel, 4);
      try { localStorage.setItem('dharma_pearl_access', 'true'); } catch (e) {}
      return [
        '> DISTINGUISHED LIBERTY PROTOCOL ACTIVATED.',
        '> Pearl station surveillance access granted.',
        '> Security level 4 — Clearance 5 unlocked.',
        '> READ /FILES/VK-108.TXT and /FILES/COORDINATES.TXT now accessible.',
      ];
    } else {
      playSound('fail');
      return ['> ACCESS DENIED: Invalid credentials.'];
    }
  },

  exec: (args: string, onRevealPuzzle?: () => void, _onRevealStation?: any, onCorrectSequence?: () => void) => {
    if (accessLevel < 2) return ['> ACCESS DENIED: Security level 2 required.'];
    if (args === 'subnet.daemon') {
      return [
        '> ATTEMPTING TO EXECUTE SUBNET.DAEMON',
        '> ERROR: DAEMON INITIALIZATION FAILED',
        '> Path /lib/subnet.daemon not found.',
        '> Check /mnt/ directory for network configuration files.',
      ];
    }
    if (!args) {
      isExecutingProtocol = true;
      pendingAction = 'protocol';
      return [
        '> MANUAL OVERRIDE PROTOCOL INITIATED.',
        '> VALENZETTI EQUATION PARAMETERS REQUIRED.',
        '> Enter the sequence: _ _ _ _ _ _',
      ];
    }
    return [
      `> ATTEMPTING TO EXECUTE: ${args}`,
      '> ERROR: Command not found or insufficient permissions.',
    ];
  },

  decrypt: (args: string) => {
    if (accessLevel < 3) return ['> ACCESS DENIED: Security level 3 required.'];
    if (args === 'incident') {
      try { localStorage.setItem('dharma_incident_unlocked', 'true'); } catch (e) {}
      return [
        '> DECRYPTING "THE INCIDENT" FILE...',
        '> Incident report partially recovered.',
        '> Electromagnetic anomaly — several casualties reported.',
        '> Protocol 23 established in direct response.',
        '> Full report: READ /LOGS/INCIDENT-4-23-1980.TXT',
      ];
    } else if (args === 'blackrock') {
      return [
        '> DECRYPTING "BLACK ROCK" FILE...',
        '> 19th century vessel. Transported explosives.',
        '> Shipwrecked during magnetic storm.',
        '> Current location: Dark Territory.',
        '> WARNING: Cargo still viable.',
      ];
    } else if (args === 'valenzetti') {
      return [
        '> DECRYPTING "VALENZETTI EQUATION" FILE...',
        '> Mathematical model predicting extinction date.',
        '> Six core factor values. Their sum is 108.',
        '> DHARMA Initiative primary goal: change one value.',
        '> Current status: UNRESOLVED.',
        '> For full detail: READ /FILES/VK-108.TXT (Clearance 5)',
      ];
    }
    return [
      '> ERROR: File not found.',
      '> Available: decrypt incident, decrypt blackrock, decrypt valenzetti',
    ];
  },

  override: (args: string) => {
    if (accessLevel < 3) return ['> ACCESS DENIED: Security level 3 required.'];
    if (args === 'system-error') {
      try { localStorage.setItem('dharma_error_allowed', 'true'); } catch (e) {}
      return [
        '> SYSTEM ERROR PROTOCOL ENGAGED.',
        '> Debug interface available at: /system-error',
        '> WARNING: UNAUTHORIZED ACCESS IS PROHIBITED.',
      ];
    }
    return ['> ERROR: Invalid override parameter.'];
  },

  access: (args: string) => {
    if (accessLevel < 4) return ['> ACCESS DENIED: Security level 4 required.'];
    if (args === 'pearl-surveillance') {
      try {
        localStorage.setItem('dharma_surveillance_active', 'true');
        localStorage.setItem('dharma_all_stations', 'true');
      } catch (e) {}
      return [
        '> PEARL SURVEILLANCE PROTOCOL ACTIVATED.',
        '> Accessing video feeds from all stations...',
        '> WARNING: You are now in observation mode.',
        '> New incident report available: SYSTEM FAILURE LOG',
      ];
    }
    return ['> ERROR: Protocol not recognised.', '> Available: access pearl-surveillance'];
  },

  upload_log: (args: string) => {
    const valid = ['swan', 'pearl', 'flame', 'arrow', 'staff', 'orchid'];
    const name = args.toLowerCase();
    if (!name) return ['> ERROR: Station name required.', '> Usage: upload_log <station>'];
    if (!valid.includes(name)) return [`> ERROR: Unknown station "${name}"`, '> Valid: swan, pearl, flame, arrow, staff, orchid'];
    try {
      const listStr = localStorage.getItem('dharma_uploaded_logs') || '[]';
      const list = JSON.parse(listStr);
      if (list.includes(name)) return [`> ${name.toUpperCase()} log already uploaded.`];
      list.push(name);
      localStorage.setItem('dharma_uploaded_logs', JSON.stringify(list));
      if (list.length >= 3) {
        localStorage.setItem('dharma_transmission_log_available', 'true');
        return [`> ${name.toUpperCase()} log uploaded.`, '> NEW FILE AVAILABLE: /archive/swan/transmission.log'];
      }
      return [`> ${name.toUpperCase()} log uploaded.`, `> ${3 - list.length} more required for complete analysis.`];
    } catch (e) {
      return [`> ${name.toUpperCase()} log uploaded.`, '> Warning: Storage error.'];
    }
  },

  puzzle: (args: string, onRevealPuzzle?: () => void) => {
    const valid = ['hieroglyph', 'subnet', 'blackbox', 'candle', 'void'];
    if (!args) return ['> PUZZLE TYPE REQUIRED.', '> Available: subnet', '> Additional puzzles require elevated clearance.'];
    const type = args.toLowerCase();
    if (!valid.includes(type)) return [`> ERROR: Unknown puzzle type "${type}"`, '> Available: subnet'];
    const devMode = localStorage.getItem('dharma_devmode_active') === 'true';
    if (['hieroglyph', 'blackbox', 'candle', 'void'].includes(type) && accessLevel < 3 && !devMode) {
      return ['> ACCESS DENIED: This module is currently RESTRICTED.', '> Security level 3 required.'];
    }
    try {
      localStorage.setItem('dharma_launch_puzzle', type);
      if (onRevealPuzzle) setTimeout(onRevealPuzzle, 500);
    } catch (e) {}
    return [`> LAUNCHING ${type.toUpperCase()} INTERFACE...`, '> Please wait while the system initialises.'];
  },

  'incident archive': () => {
    try { localStorage.setItem('dharma_incident_archive', 'true'); } catch (e) {}
    return ['> ACCESSING CLASSIFIED ARCHIVE...', '> Loading archive interface — stand by.'];
  },

  diagnose: (args: string) => {
    if (accessLevel < 3) return ['> ACCESS DENIED: Security level 3 required.'];
    if (args === '/net') {
      return [
        '> DHARMA NETWORK DIAGNOSTIC',
        '> WARNING: Corrupted file table detected.',
        '> ─────────────────────────────────────',
        '> FILE INDEX                 TYPE     STATUS',
        '> ─────────────────────────────────────',
        '> /mnt/net_link.sys         SYS      ERR-404',
        '> /lib/subnet.daemon        DAEMON   INACTIVE',
        '> /var/log/subnet_access.db DB       CORRUPT',
        '> /etc/hosts.dharma         CONFIG   OK',
        '> ─────────────────────────────────────',
        '> Try: exec subnet.daemon to initialise network services.',
      ];
    }
    return ['> ERROR: Invalid diagnostic target.', '> Usage: diagnose /net'];
  },

  scan: () => {
    const stationsDetected = Math.min(accessLevel + 2, 6);
    if (commandHistory.includes('scan') && Math.random() < 0.3) {
      setTimeout(() => playSound('static', 'short'), 1000);
      return [
        '> SCANNING...',
        '> ANOMALY DETECTED.',
        '> Signal interference at coordinates 4.815 N, 162.342 W.',
        '> Unknown energy signature.',
        '> WARNING: Possible security breach.',
      ];
    }
    return [
      '> SCANNING...',
      `> ${stationsDetected} DHARMA stations detected.`,
      '> Signal strength: MODERATE.',
      '> Interference detected in SECTOR 23.',
    ];
  },

  ls: (args: string) => {
    let showHidden = false;
    let dirPath = '';
    if (args.includes('-a')) {
      showHidden = true;
      const parts = args.split(' ');
      for (const p of parts) { if (p !== '-a' && p.trim()) { dirPath = p; break; } }
    } else { dirPath = args; }

    if (dirPath === '/mnt' || dirPath === '/mnt/') {
      const out = ['> DIRECTORY: /mnt', '> net_link.sys.bak', '> dharma_config.dat'];
      if (showHidden) out.splice(1, 0, '> .readme', '> .dharmanet');
      return out;
    }
    if (dirPath === '/mnt/.dharmanet' || dirPath === '/mnt/.dharmanet/') {
      return ['> DIRECTORY: /mnt/.dharmanet', '> init_socket.sh', '> subnet_log.db', '> protocol_candle.ref'];
    }
    const out = ['> DIRECTORY: /', '> bin/', '> etc/', '> lib/', '> mnt/', '> usr/', '> var/'];
    if (showHidden) out.splice(1, 0, '> .', '> ..');
    return out;
  },

  cat: (args: string) => {
    if (args === '/archive/swan/transmission.log') {
      if (localStorage.getItem('dharma_transmission_log_available') !== 'true') {
        return ['> FILE NOT FOUND.', '> Upload station logs first.'];
      }
      localStorage.setItem('dharma_transmission_found', 'true');
      return [
        '> FILE: /archive/swan/transmission.log',
        '> DHARMA SWAN STATION — MONITORING REPORT — 1985-07-04',
        '> Operator: S. Goodspeed',
        '>',
        '> 04:08 — System check complete. Normal.',
        '> 15:16 — Alternate frequency detected — unknown origin.',
        '> 23:42 — Sweep confirms signal. Multiple frequencies:',
        '>         4.8 MHz, 15.16 MHz, 23.42 MHz.',
        '> NOTE: Use radio.listen(frequency) to tune.',
      ];
    }
    if (args === '/mnt/.readme') {
      return [
        '> FILE: /mnt/.readme',
        '> Network admin via .dharmanet directory.',
        '> Subnet connection: /mnt/.dharmanet/init_socket.sh',
        '> Authorisation: contact S. Radzinsky.',
      ];
    }
    if (args === '/mnt/net_link.sys.bak') {
      return ['> FILE: /mnt/net_link.sys.bak', '> ERROR: File corrupted. [DATA UNREADABLE]'];
    }
    if (args === '/mnt/.dharmanet/init_socket.sh') {
      try { localStorage.setItem('dharma_launch_puzzle', 'subnet'); } catch (e) {}
      return ['> EXECUTING: init_socket.sh', '> Initialising subnet connection...', '> Launching interface module...'];
    }
    if (args === '/mnt/.dharmanet/subnet_log.db') {
      return ['> FILE: subnet_log.db', '> Status: PARTIALLY CORRUPTED', '> References to "protocol candle" and user "Alvar.H"'];
    }
    if (args === '/mnt/.dharmanet/protocol_candle.ref') {
      return [
        '> PROJECT CANDLE — CLASSIFICATION LEVEL 4',
        '> SWAN (3) EM Research  FLAME (4) Communications',
        '> PEARL (5) Surveillance  ARROW (1) Defense',
        '> STAFF (6) Medical  ORCHID (6) Time/Space',
      ];
    }
    return [`> FILE NOT FOUND: ${args}`];
  },

  cd: (args: string) => {
    if (['/mnt', '/mnt/', '../mnt'].includes(args)) return ['> CHANGED DIRECTORY TO: /mnt'];
    if (['/mnt/.dharmanet', '.dharmanet'].includes(args)) return ['> CHANGED DIRECTORY TO: /mnt/.dharmanet'];
    if (['/', '/..'].includes(args)) return ['> CHANGED DIRECTORY TO: /'];
    if (args === '.' || args === '') return ['> CURRENT DIRECTORY UNCHANGED'];
    return [`> ERROR: No such directory: ${args}`];
  },

  '4 8 15 16 23 42': (_args: string, _onRevealPuzzle?: any, _onRevealStation?: any, onCorrectSequence?: () => void) => {
    if (pendingAction === 'protocol' || isExecutingProtocol) {
      isExecutingProtocol = false;
      pendingAction = null;
      if (onCorrectSequence) onCorrectSequence();
      return [
        '> NUMBERS ACCEPTED.',
        '> PROTOCOL EXECUTED SUCCESSFULLY.',
        '> Electromagnetic field stabilised.',
        '> Counter reset to 108 minutes.',
      ];
    }
    return [
      '> VALENZETTI PARAMETERS RECOGNISED.',
      '> WARNING: Direct input not authorised outside protocol mode.',
    ];
  },
};

// ─── Undocumented secret commands (not in HELP) ──────────────────────────────

const hiddenCommands: Record<string, Function> = {
  hello: () => [
    '> Hello, Operator. Don\'t forget the protocol.',
  ],

  why: () => [
    '> That question is above your current clearance.',
  ],

  outside: () => [
    '> DO NOT GO OUTSIDE.',
    '> The quarantine is active.',
    '> This instruction is not precautionary.',
  ],

  quarantine: () => [
    '> The outside air was last independently tested in 1987.',
    '> Protocol mandates internal operations only.',
    '> We have learned there are additional reasons not to go outside.',
    '> They are not documented here.',
  ],

  failsafe: () => [
    '> The failsafe key — Sub-level C, housing F-7.',
    '> Turning it will trigger uncontrolled discharge.',
    '> It is the absolute last resort.',
    '> Do not remove it from the housing.',
    '> If you are considering using it, you have already',
    '> failed at everything else.',
  ],

  smoke: () => [
    '> SONAR ANOMALY LOG — LARGE ORGANIC ENTITY:',
    '>',
    '>  CYCLE 10201 — Detected. Duration 4 min.',
    '>  CYCLE 10445 — Detected. Duration 7 min.',
    '>  CYCLE 10778 — Detected. Duration 11 min.',
    '>',
    '> The anomaly has not breached the station while',
    '> Protocol 23 is maintained.',
    '> We do not know if this is causal.',
  ],

  jacob: () => [
    '> !! THAT NAME IS NOT TO BE USED ON THIS INTRANET !!',
    '> Session has been flagged for security review.',
  ],

  penny: () => [
    '> "Not Penny\'s Boat."',
    '> Log origin: unknown. Cycle: post-10800.',
    '> This phrase appears in two other redacted logs.',
    '> Cross-reference: abandoned.',
  ],

  hurley: () => [
    '> CANDIDATE EVENT — LEVEL 6 CLEARANCE REQUIRED.',
    '> Cross-referencing subject\'s lottery ticket',
    '> with protocol sequence...',
    '> Match confirmed. Flagging as Candidate event.',
    '> ACCESS: LEVEL 6 REQUIRED. File closed.',
  ],

  radzinsky: () => [
    '> PERSONNEL FILE: S. RADZINSKY',
    '> Operator A (former).',
    '> Status: CLASSIFIED — ORDER V.K.',
    '> Notes: Co-authored blast door map (Sublevel A).',
  ],

  sos: () => [
    '> External comms are permanently blocked. §7-B.',
    '> No exceptions.',
    '> You are where you need to be.',
    '> Execute the protocol.',
  ],

  mama: () => [
    '> This is not a record player, Operator.',
  ],

  inman: () => [
    '> PERSONNEL FILE: J. INMAN',
    '> Former operator. Departure circumstances: unclear.',
    '> Last active cycle: ~10500-range.',
    '> File: REDACTED — ORDER V.K.',
  ],

  watch: () => [
    '> There are camera positions you have not been told about.',
    '> The island is always watching.',
    '> This terminal session is being recorded.',
  ],

  108: () => [
    '> 108 minutes.',
    '> We initially believed the interval was chosen',
    '> for operational convenience.',
    '> We no longer hold that belief.',
  ],

  // Multi-word (matched by full input in processCommand)
  'push the button': () => [
    '> Yes. That is exactly what you are here for.',
  ],

  'blast door': () => [
    '> The blast door map — Sublevel A.',
    '> Compiled across many years by two operators.',
    '> One annotation reads: \'I AM HERE.\'',
    '> We do not know who wrote it.',
    '> We do not know if they still are.',
  ],

  // Kept for legacy gameplay
  namaste: () => [
    '> NAMASTE AND GOOD LUCK.',
    '> "The DHARMA Initiative — to create a better future',
    '>  for our world through science."',
  ],

  numbers: () => [
    '> THE NUMBERS ARE BAD.',
    '> SYSTEM ALERT: SECURITY BREACH DETECTED.',
  ],

  smokey: () => hiddenCommands['smoke'](),

  oceanic815: () => [
    '> FLIGHT MANIFEST FOUND.',
    '> SURVIVORS DETECTED ON NORTH SHORE.',
    '> DIRECTIVE: OBSERVE. DO NOT ENGAGE.',
  ],

  theisland: () => [
    '> "The Island is not a where, it is a what."',
    '> ACCESS TO FURTHER INFORMATION RESTRICTED.',
    '> LEVEL 5 CLEARANCE REQUIRED.',
  ],

  danielle: () => [
    '> SEARCH: "DANIELLE"',
    '> Reference: Rousseau, Danielle.',
    '> Status: MAROONED.',
    '> Location: SECTOR 7.',
    '> WARNING: Subject considered unstable. Approach with caution.',
  ],

  lockdown: () => {
    try { localStorage.setItem('dharma_lockdown', 'active'); } catch (e) {}
    return [
      '> LOCKDOWN PROTOCOL INITIATED.',
      '> All blast doors engaged.',
      '> Lockdown will end automatically in 3 minutes.',
    ];
  },

  orientation: () => [
    '> DHARMA INITIATIVE ORIENTATION — STATION 3: THE SWAN',
    '> Constructed: 1977.',
    '> Purpose: Electromagnetic research and containment.',
    '> Protocol: Enter the code every 108 minutes.',
    '> WARNING: Do not use this terminal for communication.',
  ],

  hanso: () => [
    '> HANSO FOUNDATION RECORD',
    '> Founded by Alvar Hanso.',
    '> Mission: Technological innovation for humanity\'s future.',
    '> Funded DHARMA Initiative in 1970.',
    '> Current status: [REDACTED]',
  ],

  'what is your name': () => [
    '> I am DHARMA INITIATIVE COMPUTER INTERFACE VERSION 4.07.',
    '> You may call me DIC-4.0.',
    '> I assist with station operation and protocol compliance.',
  ],

  'radio.listen': (args: string, onRevealPuzzle?: () => void) => {
    if (!args) return ['> ERROR: Frequency required.', '> Usage: radio.listen(frequency)'];
    let freq: number | null = null;
    const paren = args.match(/\(([\d.]+)\)/);
    if (paren) { freq = parseFloat(paren[1]); }
    else { const m = args.trim().match(/^([\d.]+)$/); if (m) freq = parseFloat(m[1]); }
    if (freq === null || isNaN(freq)) return ['> ERROR: Invalid frequency format.'];
    if (localStorage.getItem('dharma_transmission_found') !== 'true') {
      return ['> ERROR: Radio receiver not calibrated.', '> Check transmission logs for instructions.'];
    }
    const special = [4.8, 15.16, 23.42];
    if (special.includes(freq)) {
      try {
        localStorage.setItem('dharma_launch_puzzle', 'radio');
        localStorage.setItem('dharma_radio_frequency', freq.toString());
        if (onRevealPuzzle) setTimeout(onRevealPuzzle, 500);
      } catch (e) {}
      return [`> TUNING RADIO TO: ${freq} MHz`, '> Signal detected...', '> Analysing transmission patterns...'];
    }
    return [`> TUNING RADIO TO: ${freq} MHz`, '> No significant signal detected.', '> Try another frequency.'];
  },

  devmode: (args: string, onRevealPuzzle?: () => void) => {
    accessLevel = 4;
    try {
      const flagsToSave = ['dharma_error_allowed','dharma_pearl_access','dharma_incident_unlocked',
        'dharma_surveillance_active','dharma_lockdown','dharma_all_stations',
        'dharma_unlocked_audio_logs','dharma_unlocked_reports'];
      const orig: Record<string, string | null> = {};
      flagsToSave.forEach(f => { orig[f] = localStorage.getItem(f); });
      orig['dharma_lore_state'] = localStorage.getItem('dharma_lore_state');
      localStorage.setItem('dharma_pre_devmode_state', JSON.stringify(orig));
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
    } catch (e) {}
    if (onRevealPuzzle) setTimeout(onRevealPuzzle, 1000);
    return [
      '> DEVELOPER MODE ACTIVATED.',
      '> Maximum clearance granted. All stations and logs unlocked.',
      '> Use "setcountdown <minutes> <seconds>" to adjust timer.',
      '> Use "devmode-exit" to restore previous state.',
    ];
  },

  'devmode-exit': () => {
    try {
      if (localStorage.getItem('dharma_devmode_active') !== 'true') {
        return ['> ERROR: Not in developer mode.'];
      }
      const savedJson = localStorage.getItem('dharma_pre_devmode_state');
      if (!savedJson) return ['> ERROR: No previous state found.'];
      const saved = JSON.parse(savedJson);
      localStorage.removeItem('dharma_devmode_active');
      Object.entries(saved).forEach(([k, v]) => {
        if (v === null) { localStorage.removeItem(k); }
        else { localStorage.setItem(k, v as string); }
      });
      accessLevel = 1;
      setTimeout(() => window.location.reload(), 1500);
      return ['> DEVELOPER MODE DEACTIVATED.', '> Restoring previous state...'];
    } catch (e) {
      return ['> ERROR: Failed to exit developer mode.'];
    }
  },

  setcountdown: (args: string) => {
    if (localStorage.getItem('dharma_devmode_active') !== 'true') {
      return ['> ERROR: Requires developer mode.', '> Enter "devmode" first.'];
    }
    const parts = args.split(' ').filter(Boolean);
    let minutes = 0, seconds = 0;
    if (parts.length === 1) {
      seconds = parseInt(parts[0]);
      if (isNaN(seconds) || seconds < 0) return ['> ERROR: Invalid input.'];
      minutes = Math.floor(seconds / 60); seconds = seconds % 60;
    } else if (parts.length >= 2) {
      minutes = parseInt(parts[0]); seconds = parseInt(parts[1]);
      if (isNaN(minutes) || isNaN(seconds) || seconds > 59) return ['> ERROR: Invalid input.'];
    } else return ['> ERROR: Missing parameters.'];
    const total = minutes * 60 + seconds;
    const now = Date.now();
    localStorage.setItem('countdown_start', (now - (6480 - total) * 1000).toString());
    localStorage.setItem('countdown_was_set', 'true');
    return [`> COUNTDOWN SET TO: ${minutes}:${seconds.toString().padStart(2, '0')}`, total <= 60 ? '> WARNING: System failure imminent.' : ''].filter(Boolean);
  },
};

// ─── Command processor ────────────────────────────────────────────────────────

const processCommand = (
  input: string,
  onRevealPuzzle?: () => void,
  onRevealStation?: (stationName: string) => void,
  onCorrectSequence?: () => void,
  isSystemFailure?: boolean
): string[] => {
  commandHistory.push(input.trim().toLowerCase());
  if (commandHistory.length > 10) commandHistory = commandHistory.slice(-10);

  // Numbers during protocol/failure mode
  if (pendingAction === 'protocol' || isSystemFailure) {
    if (/^\s*4\s*8\s*15\s*16\s*23\s*42\s*$/.test(input)) {
      isExecutingProtocol = false;
      pendingAction = null;
      playSound('success');
      if (onCorrectSequence) onCorrectSequence();
      return [
        '> NUMBERS ACCEPTED.',
        '> PROTOCOL EXECUTED SUCCESSFULLY.',
        '> Electromagnetic field stabilised.',
        '> Counter reset to 108 minutes.',
      ];
    }
  }

  const [cmd, ...rest] = input.trim().toLowerCase().split(' ');
  const argsStr = rest.join(' ');
  playSound('beep');

  // resetall
  if (input.trim().toLowerCase() === 'resetall') {
    if (localStorage.getItem('dharma_devmode_active') !== 'true') {
      return ['> ERROR: Requires developer mode. Use "devmode" first.'];
    }
    localStorage.clear();
    localStorage.setItem('countdown_start', Date.now().toString());
    accessLevel = 1; isExecutingProtocol = false; pendingAction = null;
    return ['> SYSTEM RESET. All progress wiped. Reload the page.'];
  }

  // Direct numbers
  if (input.trim() === DHARMA_NUMBERS.join(' ')) {
    return commands['4 8 15 16 23 42'](argsStr, onRevealPuzzle, onRevealStation, onCorrectSequence);
  }

  // Multi-word commands (exact match)
  const fullInput = input.trim().toLowerCase();
  const multiWord = ['push the button', 'blast door', 'what is your name', 'incident archive'];
  for (const mw of multiWord) {
    if (fullInput === mw) {
      playSound('beep');
      const handler = hiddenCommands[mw] || commands[mw];
      if (handler) return handler(argsStr, onRevealPuzzle, onRevealStation, onCorrectSequence);
    }
  }

  // radio.listen special case
  if (fullInput.startsWith('radio.listen')) {
    const freq = fullInput.replace('radio.listen', '').trim();
    return hiddenCommands['radio.listen'](freq, onRevealPuzzle, onRevealStation, onCorrectSequence);
  }

  if (commands[cmd]) return commands[cmd](argsStr, onRevealPuzzle, onRevealStation, onCorrectSequence);
  if (hiddenCommands[cmd]) { playSound('beep'); return hiddenCommands[cmd](argsStr, onRevealPuzzle, onRevealStation, onCorrectSequence); }

  return ['> COMMAND NOT FOUND. Type HELP for available commands.'];
};

const resetTerminal = () => {
  isExecutingProtocol = false;
  pendingAction = null;
  accessLevel = 1;
  commandHistory = [];
};

export { commands, hiddenCommands, processCommand, resetTerminal };
