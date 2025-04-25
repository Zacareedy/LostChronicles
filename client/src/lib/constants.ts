// The Numbers sequence from LOST
export const DHARMA_NUMBERS = [4, 8, 15, 16, 23, 42];

// Countdown settings
export const COUNTDOWN_MINUTES = 108;
export const COUNTDOWN_SECONDS = 0;
export const WARNING_THRESHOLD = 60; // seconds at which to start warning

// Island stations information
export const STATIONS = {
  swan: {
    name: 'The Swan',
    code: 'Station 3',
    description: 'Electromagnetic research facility',
    coordinates: '4° 8′ 15″ N, 16° 23′ 42″ W',
    position: { top: '55%', left: '45%' }  // As marked on reference map
  },
  pearl: {
    name: 'The Pearl',
    code: 'Station 5',
    description: 'Psychological research',
    coordinates: '8° 15′ 16″ N, 23° 42′ 4″ W',
    position: { top: '60%', left: '55%' }  // As marked on reference map
  },
  flame: {
    name: 'The Flame',
    code: 'Station 4',
    description: 'Communications station',
    coordinates: '15° 16′ 23″ N, 42° 4′ 8″ W',
    position: { top: '24%', left: '67%' }  // As marked on reference map
  },
  arrow: {
    name: 'The Arrow',
    code: 'Station 1',
    description: 'Defense & armament',
    coordinates: '16° 23′ 42″ N, 4° 8′ 15″ W',
    position: { top: '33%', left: '24%' }  // As marked on reference map
  },
  staff: {
    name: 'The Staff',
    code: 'Station 6',
    description: 'Medical research station',
    coordinates: '23° 42′ 4″ N, 8° 15′ 16″ W',
    position: { top: '34%', left: '78%' }  // As marked on reference map
  },
  orchid: {
    name: 'The Orchid',
    code: 'Station 7',
    description: 'Time displacement research',
    coordinates: '42° 4′ 8″ N, 15° 16′ 23″ W',
    position: { top: '76%', left: '46%' }  // As marked on reference map
  },
  hydra: {
    name: 'The Hydra',
    code: 'Station 2',
    description: 'Zoological research',
    coordinates: '42° 8′ 15″ N, 15° 23′ 42″ W',
    position: { top: '77%', left: '80%' }  // As marked on reference map
  },
  lookout: {
    name: 'The Lookout',
    code: 'Position',
    description: 'Radio tower and signal transmission',
    coordinates: '23° 15′ 4″ N, 8° 42′ 16″ W',
    position: { top: '20%', left: '36%' }  // As marked on reference map 
  },
  blackRock: {
    name: 'Black Rock',
    code: 'Shipwreck',
    description: 'Ancient slave ship mysteriously stranded inland',
    coordinates: '30° 4′ 22″ N, 12° 38′ 17″ W',
    position: { top: '44%', left: '22%' }  // As marked on reference map
  }
};

// Incident report structure
interface IncidentReport {
  title: string;
  fileNumber: string;
  classification: string;
  content: string;
}

// Incident report content
export const INCIDENT_REPORTS: IncidentReport[] = [
  {
    title: 'THE INCIDENT',
    fileNumber: 'AH/MDG-7715',
    classification: 'LEVEL 5 - TOP SECRET',
    content: `Date: 1977.09.22

Following the energy release at the Swan construction site, all non-essential personnel have been evacuated from the island. Dr. Chang has implemented new containment protocols requiring the button to be pushed every 108 minutes.

The drilling operation penetrated an electromagnetic anomaly of unprecedented magnitude. Several Dharma personnel were killed or severely injured when metal objects were violently drawn to the breached pocket.

Dr. DeGroot has mandated construction of a specialized computer system to discharge the energy buildup. Radzinsky's containment solution will be implemented immediately.

CONTAINMENT FAILURE MAY RESULT IN ANOTHER INCIDENT

Personnel are instructed not to discuss these events with anyone without Level 5 clearance.`
  },
  {
    title: 'ELECTROMAGNETIC ANOMALY',
    fileNumber: 'RS/SD-4216',
    classification: 'LEVEL 4 - CLASSIFIED',
    content: `Date: 1977.10.04

Readings indicate the pocket beneath the Swan station continues to build energy at an exponential rate. The button protocol must be maintained to discharge this energy and prevent catastrophic failure.

Analysis of the anomaly suggests a connection to the unique properties of the island. The pocket appears to contain exotic matter with negative mass and unusual temporal properties.

Preliminary experiments indicate the energy has unusual effects on electronic equipment and possibly human memory. Several test subjects have reported disorientation and "flashes" of events they claim have not yet occurred.

Reference values: 4.815, 16.23, 42.108

Further research suspended due to safety concerns. Swan station will operate on containment protocol only until further notice.`
  },
  {
    title: 'SYSTEM FAILURE LOG',
    fileNumber: 'DC/SW-0108',
    classification: 'LEVEL 5 - TOP SECRET',
    content: `SYSTEM FAILURE RECORD: 1984.11.27

FAILURE DURATION: 3 hours, 54 minutes
ENERGY DISCHARGE: None
EFFECTS: 
- Magnetic attraction increased by 400%
- Multiple system failures across all stations
- Temporal anomalies reported by Pearl observers
- Station structural integrity compromised
- Medical emergencies: 2 fatalities, 5 injuries

CAUSE OF FAILURE: 
Operator failed to input code sequence within designated timeframe. Subject reported "hearing voices" and deliberately abandoned protocol.

POST-FAILURE PROTOCOL:
- Subject terminated from Dharma Initiative
- Pearl observation duties expanded
- Fail-safe mechanism installed (AUTHORIZED BY: ALVAR HANSO)
- Orientation film revised to emphasize compliance
- System failure protocol updated (see document AH/MDG-932815)

NOTE: The psychological impact of extended duty at the Swan requires further study. Recommend rotation of personnel every 540 days maximum.`
  }
];

// Audio logs with specific unlock requirements
export const AUDIO_LOGS = {
  orientationVideo: {
    title: "Swan Orientation Film",
    description: "Dharma Initiative Swan Station orientation film from 1980",
    duration: "3:15",
    src: "/audio/swan-orientation.mp3",
    unlockMethod: "default", // Already available by default
    unlockRequirement: "none"
  },
  distressSignal: {
    title: "French Distress Signal",
    description: "Looping radio transmission in French, 16 years old",
    duration: "1:38",
    src: "/audio/french-signal.mp3",
    unlockMethod: "terminal",
    unlockRequirement: "Enter 'tune 342.1' into terminal to locate frequency"
  },
  radioTransmission: {
    title: "Numbers Transmission",
    description: "Mysterious broadcast repeating the numbers sequence",
    duration: "0:42",
    src: "/audio/numbers-broadcast.mp3",
    unlockMethod: "coordinates",
    unlockRequirement: "Enter the coordinates 4°8'15\"N 16°23'42\"W in the appropriate terminal command"
  },
  blackRock: {
    title: "Black Rock Journal Entry",
    description: "Audio diary found in ship manifest describing the island",
    duration: "2:10",
    src: "/audio/blackrock-log.mp3",
    unlockMethod: "sequence",
    unlockRequirement: "Visit all stations in the correct order: arrow, swan, flame, pearl, staff, orchid"
  },
  pearlTransmission: {
    title: "Pearl Station Logs", 
    description: "Surveillance audio from Pearl observers monitoring Swan station",
    duration: "1:55",
    src: "/audio/pearl-logs.mp3",
    unlockMethod: "puzzle",
    unlockRequirement: "Complete the hidden orientation film frame puzzle"
  },
  unknownSource: {
    title: "Unknown Transmission",
    description: "Static-filled broadcast of unknown origin",
    duration: "1:22",
    src: "/audio/unknown-source.mp3",
    unlockMethod: "hidden",
    unlockRequirement: "Click on the hidden dharma symbol in the footer 4,8,15,16,23,42 times in sequence"
  }
};

// Loading screen messages
export const LOADING_MESSAGES = [
  "Initializing protocols...",
  "Scanning electromagnetic field...",
  "Loading station schematics...",
  "Connecting to Dharma network...",
  "Validating security clearance...",
  "System ready"
];
