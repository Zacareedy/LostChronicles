declare global {
  interface Window {
    cl5: boolean;
  }
}

const commandHistory: string[] = [];

export function getCommandHistory(): string[] {
  return commandHistory;
}

export function addToHistory(cmd: string): void {
  commandHistory.push(cmd);
}

const SECRETS: Record<string, string[]> = {
  HELLO: [
    `<span class="tm">Hello, Operator. Don't forget the protocol.</span>`,
  ],

  WHY: [
    `<span class="td">That question is above your current clearance.</span>`,
  ],

  OUTSIDE: [
    `<span class="tr">DO NOT GO OUTSIDE. The quarantine is active. This instruction is not precautionary.</span>`,
  ],

  QUARANTINE: [
    `<span class="td">The outside air was last independently tested in 1987. Protocol mandates internal operations only.</span>`,
    `<span class="td">We have learned there are additional reasons not to go outside. They are not documented here.</span>`,
  ],

  FAILSAFE: [
    `<span class="ta">The failsafe key — Sub-level C, housing F-7.</span>`,
    `<span class="ta">Turning it will trigger uncontrolled discharge. It is the absolute last resort.</span>`,
    `<span class="ta">Do not remove it from the housing.</span>`,
    `<span class="tr">If you are considering using it, you have already failed at everything else.</span>`,
  ],

  SMOKE: [
    `<span class="td">SONAR ANOMALY LOG — ORGANIC ENTITY DETECTIONS</span>`,
    `<span class="td">Cycle 10201: Large organic entity detected — bearing 227 — duration 4 min 11 sec</span>`,
    `<span class="td">Cycle 10445: Large organic entity detected — bearing 109 — duration 2 min 58 sec</span>`,
    `<span class="td">Cycle 10778: Large organic entity detected — bearing 015 — duration 7 min 22 sec</span>`,
    `<span class="ta">The anomaly has not breached the station while Protocol 23 is maintained.</span>`,
    `<span class="td">We do not know if this is causal.</span>`,
  ],

  JACOB: [
    `<span class="tr">!! THAT NAME IS NOT TO BE USED ON THIS INTRANET !!</span>`,
    `<span class="tr">Session has been flagged for security review.</span>`,
  ],

  PENNY: [
    `<span class="td">"Not Penny's Boat."</span>`,
    `<span class="td">Log origin: unknown. Cycle: post-10800.</span>`,
    `<span class="td">This phrase appears in two other redacted logs. Cross-reference: abandoned.</span>`,
  ],

  HURLEY: [
    `<span class="td">Cross-referencing lottery ticket with station protocol sequence...</span>`,
    `<span class="tr">LEVEL 6 REQUIRED.</span>`,
  ],

  RADZINSKY: [
    `<span class="tb">PERSONNEL FILE</span>`,
    `<span class="td">S. RADZINSKY — Operator A (former)</span>`,
    `<span class="td">Status: CLASSIFIED — ORDER V.K.</span>`,
    `<span class="td">Notes: Co-authored blast door map (Sublevel A).</span>`,
  ],

  SOS: [
    `<span class="tr">External comms are permanently blocked. §7-B. No exceptions.</span>`,
    `<span class="td">You are where you need to be. Execute the protocol.</span>`,
  ],

  'PUSH THE BUTTON': [
    `<span class="tm">Yes. That is exactly what you are here for.</span>`,
  ],

  MAMA: [
    `<span class="td">This is not a record player, Operator.</span>`,
  ],

  INMAN: [
    `<span class="tb">PERSONNEL FILE</span>`,
    `<span class="td">J. INMAN — Former operator.</span>`,
    `<span class="td">Departure circumstances: unclear. Last active cycle: ~10500-range.</span>`,
    `<span class="tr">File: REDACTED — ORDER V.K.</span>`,
  ],

  'BLAST DOOR': [
    `<span class="td">The blast door map — Sublevel A.</span>`,
    `<span class="td">Compiled across many years by two operators.</span>`,
    `<span class="td">One annotation reads: 'I AM HERE.'</span>`,
    `<span class="ta">We do not know who wrote it. We do not know if they still are.</span>`,
  ],

  '108': [
    `<span class="td">108 minutes.</span>`,
    `<span class="td">We initially believed the interval was chosen for operational convenience.</span>`,
    `<span class="ta">We no longer hold that belief.</span>`,
  ],

  WATCH: [
    `<span class="td">There are camera positions you have not been told about.</span>`,
    `<span class="ta">The island is always watching.</span>`,
    `<span class="td">This terminal session is being recorded.</span>`,
  ],
};

const FILES: Record<string, string[]> = {
  '/PROTOCOL/PROTOCOL-23.TXT': [
    `<span class="th">Station 3 — Swan. Protocol 23. Established 1980-04-23.</span>`,
    `<span class="td">Objective: Prevent EM discharge event.</span>`,
    `<span class="td">Procedure: Input sequence every 108 minutes. Six values. Two digits each. Known to all authorised personnel.</span>`,
    `<span class="td">Failure stages:</span>`,
    `<span class="td">  (1) Warning alarm at T-5 min.</span>`,
    `<span class="td">  (2) System alert at T-1 min.</span>`,
    `<span class="td">  (3) Uncontrolled discharge if no input.</span>`,
    `<span class="td">Repeat indefinitely. No exceptions. No substitutions. No delays.</span>`,
    `<span class="td">Authored: DeGroot, G. / Hanso, A. — 1977. Last revised: Candle, M. — Cycle 9100.</span>`,
  ],

  '/LOGS/INCIDENT-4-23-1980.TXT': [
    `<span class="th">INCIDENT REPORT — CYCLE 1 (ESTABLISHMENT)</span>`,
    `<span class="td">DATE: 1980-04-23 14:23 LOCAL</span>`,
    `<span class="td">LOCATION: SUBLEVEL C — MAINTENANCE ACCESS</span>`,
    `<span class="td">EVENT: Uncontrolled electromagnetic event during scheduled maintenance.</span>`,
    `<span class="tr">CASUALTIES: [REDACTED — ORDER V.K.]</span>`,
    `<span class="tr">EQUIPMENT: [REDACTED — ORDER V.K.]</span>`,
    `<span class="tr">ROOT CAUSE: [REDACTED — ORDER V.K.]</span>`,
    `<span class="td">RESULT: Protocol 23 established. Station converted to indefinite occupied operation.</span>`,
    `<span class="ta">[END OF ACCESSIBLE CONTENT — FURTHER DETAIL REQUIRES CLEARANCE 5]</span>`,
  ],

  '/LOGS/CYCLE-LOG-10894.TXT': [
    `<span class="th">CYCLE LOG — 10894</span>`,
    `<span class="td">OPERATOR: [CLASSIFIED]</span>`,
    `<span class="tm">EM LEVEL: 73% GAUSS — NORMAL RANGE</span>`,
    `<span class="td">PREVIOUS CYCLE (10893): Input at T-02:14. No anomaly.</span>`,
    `<span class="ta">CURRENT CYCLE (10894): Input status: PENDING</span>`,
    `<span class="ta">SONAR: Degraded (see maintenance log 10891)</span>`,
    `<span class="td">NOTES: Relief team ETA 540 hours. Supply drop confirmed cycle 10897.</span>`,
  ],

  '/DHARMA/ORIENTATION-REEL-3.TXT': [
    `<span class="th">ORIENTATION REEL 3 — TRANSCRIPT</span>`,
    `<span class="td">[MARVIN CANDLE, speaking to camera]</span>`,
    `<span class="tm">Hello. I'm Dr. Marvin Candle, and I'd like to welcome you to the Swan station.</span>`,
    `<span class="td">Your duty here is straightforward. Every 108 minutes, a sequence of numbers must be entered into the computer.</span>`,
    `<span class="td">Failure to do so will result in a system event of potentially catastrophic magnitude.</span>`,
    `<span class="tb">We believe this task to be critical not just to the DHARMA Initiative, but to the continued existence of the world as we know it.</span>`,
    `<span class="tb">Pushing this button is the most important thing you will ever do.</span>`,
    `<span class="tb">It may be the only important thing you will ever do.</span>`,
    `<span class="td">[END OF REEL]</span>`,
  ],
};

const CL5_FILES: Record<string, string[]> = {
  '/FILES/VK-108.TXT': [
    `<span class="th">THE VALENZETTI EQUATION — SUPPLEMENTAL NOTES</span>`,
    `<span class="td">Author: V. Kelvin — Cycle 9341 — EYES ONLY</span>`,
    `<span class="td">The equation was commissioned in 1962 following the Cuban Missile Crisis.</span>`,
    `<span class="td">Enzo Valenzetti derived it in six weeks. The UN classified it immediately.</span>`,
    `<span class="tb">It predicts the exact date of human extinction.</span>`,
    `<span class="td">It has six core factors. You know what they are.</span>`,
    `<span class="td">Entering the sequence does not change the equation.</span>`,
    `<span class="ta">You are not saving the world. You are keeping the clock running until someone figures out how to stop it.</span>`,
    `<span class="td">The sum of the six values is 108. This is why the interval is 108 minutes.</span>`,
    `<span class="td">The station does not discharge every 108 minutes by coincidence.</span>`,
    `<span class="td">The station discharges on the interval defined by the equation's own output.</span>`,
    `<span class="td">DHARMA's stated mission: change the values of one or more factors.</span>`,
    `<span class="tr">Current progress: none.</span>`,
    `<span class="td">[END — V. Kelvin, Cycle 9341]</span>`,
  ],

  '/FILES/COORDINATES.TXT': [
    `<span class="th">POSITION: 4°48'N 108°42'W</span>`,
    `<span class="td">MAGNETIC DECLINATION: 11.3° E (anomalous)</span>`,
    `<span class="td">GRID REF: DHARMA INTERNAL MAP NODE 7</span>`,
    `<span class="ta">NOTE: These coordinates are not to be shared outside the Initiative.</span>`,
    `<span class="tr">Transmission of position data constitutes a breach of Protocol 7-B and will result in termination of access.</span>`,
    `<span class="td">[EYES ONLY — CLEARANCE 5]</span>`,
  ],
};

function readFile(path: string): string[] {
  const normalized = path.startsWith('/') ? path.toUpperCase() : `/${path.toUpperCase()}`;

  if (normalized === '/FILES/VK-108.TXT' || normalized === '/FILES/COORDINATES.TXT') {
    if (!window.cl5) {
      return [`<span class="tr">ACCESS DENIED: CLEARANCE 5 REQUIRED.</span>`];
    }
    return CL5_FILES[normalized];
  }

  if (normalized in FILES) {
    return FILES[normalized];
  }

  return [`<span class="tr">ERROR: File not found: ${path}</span>`];
}

export function processCommand(cmd: string): string[] {
  const trimmed = cmd.trim();
  const upper = trimmed.toUpperCase();

  if (upper in SECRETS) {
    return SECRETS[upper];
  }

  if (upper === 'HELP') {
    return [
      `<span class="th">DHARMA INITIATIVE — SWAN STATION TERMINAL v4.1</span>`,
      `<span class="th">DOCUMENTED COMMANDS:</span>`,
      `<span class="td">  HELP         — list documented commands</span>`,
      `<span class="td">  STATUS       — current station status</span>`,
      `<span class="td">  WHO          — personnel on station</span>`,
      `<span class="td">  FILES        — list available files</span>`,
      `<span class="td">  READ [path]  — read file contents</span>`,
      `<span class="td">  PING         — network node status</span>`,
      `<span class="td">  INCIDENT     — incident log summary</span>`,
      `<span class="td">  DHARMA       — station directory</span>`,
      `<span class="td">  VALENZETTI   — equation summary</span>`,
      `<span class="td">  CLEAR        — clear terminal</span>`,
      `<span class="td">  EXIT         — close terminal</span>`,
    ];
  }

  if (upper === 'STATUS') {
    return [
      `<span class="tb">SWAN STATION — SYSTEM STATUS</span>`,
      `<span class="tm">EM Containment: NORMAL</span>`,
      `<span class="tm">Failsafe Key: ARMED</span>`,
      `<span class="tm">Intranet Node: SWN-7</span>`,
      `<span class="ta">Sonar Array: DEGRADED</span>`,
      `<span class="ta">EM Anomaly: DETECTED</span>`,
      `<span class="tm">Protocol: 23</span>`,
      `<span class="ta">External Comms: BLOCKED §7-B</span>`,
      `<span class="ta">Quarantine: ACTIVE</span>`,
    ];
  }

  if (upper === 'WHO') {
    return [
      `<span class="tb">PERSONNEL — SWAN STATION (CURRENT CYCLE)</span>`,
      `<span class="tm">WICKMUND, G. — Station Chief</span>`,
      `<span class="tm">CANDLE, M. — Technical Officer</span>`,
      `<span class="td">[CLASSIFIED] — Operator</span>`,
      `<span class="td">[CLASSIFIED] — Operator</span>`,
      `<span class="ta">Relief ETA: 540 hours</span>`,
    ];
  }

  if (upper === 'FILES') {
    return [
      `<span class="tb">FILE INDEX — SWAN INTRANET</span>`,
      `<span class="tm">  /protocol/protocol-23.txt</span>`,
      `<span class="ta">  /logs/incident-4-23-1980.txt [PARTIAL — REDACTED]</span>`,
      `<span class="tm">  /logs/cycle-log-10894.txt</span>`,
      `<span class="tm">  /dharma/orientation-reel-3.txt</span>`,
      `<span class="td">  /files/vk-108.txt [CLEARANCE 5]</span>`,
      `<span class="td">  /files/coordinates.txt [CLEARANCE 5]</span>`,
    ];
  }

  if (upper === 'READ') {
    return [`<span class="tr">ERROR: No path specified. Usage: READ [path]</span>`];
  }

  if (upper.startsWith('READ ')) {
    const path = trimmed.slice(5).trim();
    if (!path) {
      return [`<span class="tr">ERROR: No path specified. Usage: READ [path]</span>`];
    }
    return readFile(path);
  }

  if (upper === 'PING') {
    return [
      `<span class="tb">PING — INTRANET NODE STATUS</span>`,
      `<span class="tm">SWN-7       OK        [0ms]</span>`,
      `<span class="tm">SWN-HUB     OK        [9ms]</span>`,
      `<span class="ta">PEARL-3     TIMEOUT</span>`,
      `<span class="tr">FLAME-1     NO ROUTE</span>`,
      `<span class="tr">STAFF-1     NO ROUTE</span>`,
      `<span class="tr">ORCHID      REFUSED</span>`,
      `<span class="ta">WORLD       BLOCKED §7-B</span>`,
    ];
  }

  if (upper === 'INCIDENT') {
    return [
      `<span class="tb">INCIDENT LOG — SUMMARY</span>`,
      `<span class="tr">Cycle 1 (1980-04-23): Station establishment event. Details redacted.</span>`,
      `<span class="ta">Cycle 10734: EM surge — T+14 min late input. No discharge. Operator reprimanded.</span>`,
      `<span class="tr">Cycle 10801: [REDACTED — ORDER V.K.]</span>`,
      `<span class="ta">Cycle 10849: Equipment failure — sonar array. See maintenance log.</span>`,
      `<span class="ta">Cycle 10876: Unauthorized access attempt — Sub-level C. Resolved.</span>`,
      `<span class="ta">Cycle 10881: Supply drop 48 hours late. Rations at 60%. No protocol impact.</span>`,
    ];
  }

  if (upper === 'DHARMA') {
    return [
      `<span class="tb">DHARMA INITIATIVE — KNOWN STATIONS</span>`,
      `<span class="tm">  Swan     — Station 3. EM containment. YOU ARE HERE.</span>`,
      `<span class="tm">  Pearl    — Station 5. Observation.</span>`,
      `<span class="tm">  Flame    — Station 4. Communications.</span>`,
      `<span class="td">  Arrow    — Station 2. Research.</span>`,
      `<span class="td">  Staff    — Station 6. Medical.</span>`,
      `<span class="ta">  Orchid   — [EXISTENCE NOT CONFIRMED]</span>`,
    ];
  }

  if (upper === 'VALENZETTI') {
    return [
      `<span class="tb">THE VALENZETTI EQUATION — SUMMARY</span>`,
      `<span class="td">Commissioned 1962. Derived by Enzo Valenzetti. Immediately classified by the UN.</span>`,
      `<span class="td">The equation concerns factors relating to human survival.</span>`,
      `<span class="td">The DHARMA Initiative was established in part to study and alter these factors.</span>`,
      `<span class="ta">The sequence you enter every 108 minutes is directly related to the equation's core values.</span>`,
      `<span class="td">For further detail: READ /files/vk-108.txt</span>`,
      `<span class="td">[CLEARANCE 5 REQUIRED FOR FULL DOCUMENT]</span>`,
    ];
  }

  if (upper === 'CLEAR') {
    return ['__CLEAR__'];
  }

  if (upper === 'EXIT') {
    return ['__EXIT__'];
  }

  return [`<span class="tr">UNKNOWN COMMAND: ${trimmed}. Type HELP for a list of commands.</span>`];
}
