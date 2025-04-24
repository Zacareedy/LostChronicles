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
    position: { top: '30%', left: '45%' }
  },
  pearl: {
    name: 'The Pearl',
    code: 'Station 5',
    description: 'Psychological research',
    coordinates: '8° 15′ 16″ N, 23° 42′ 4″ W',
    position: { top: '60%', left: '25%' }
  },
  flame: {
    name: 'The Flame',
    code: 'Station 4',
    description: 'Communications station',
    coordinates: '15° 16′ 23″ N, 42° 4′ 8″ W',
    position: { top: '20%', left: '70%' }
  },
  arrow: {
    name: 'The Arrow',
    code: 'Station 1',
    description: 'Defense & armament',
    coordinates: '16° 23′ 42″ N, 4° 8′ 15″ W',
    position: { top: '75%', left: '65%' }
  },
  staff: {
    name: 'The Staff',
    code: 'Station 6',
    description: 'Medical research station',
    coordinates: '23° 42′ 4″ N, 8° 15′ 16″ W',
    position: { top: '40%', left: '80%' }
  },
  orchid: {
    name: 'The Orchid',
    code: 'Station 7',
    description: 'Time displacement research',
    coordinates: '42° 4′ 8″ N, 15° 16′ 23″ W',
    position: { top: '50%', left: '50%' }
  }
};

// Incident report content
export const INCIDENT_REPORTS = [
  {
    title: 'THE INCIDENT',
    content: `Date: [REDACTED]

Following the energy release at the Swan construction site, all non-essential personnel have been evacuated from the island. Dr. Chang has implemented new containment protocols requiring the button to be pushed every 108 minutes.

CONTAINMENT FAILURE MAY RESULT IN ANOTHER INCIDENT`
  },
  {
    title: 'ELECTROMAGNETIC ANOMALY',
    content: `Readings indicate the pocket beneath the Swan station continues to build energy at an exponential rate. The button protocol must be maintained to discharge this energy and prevent catastrophic failure.

Reference values: 4.815, 16.23, 42.108`
  },
  {
    title: 'SYSTEM FAILURE LOG',
    content: `Last system failure: 1977.09.22

Notes: Magnetic attraction increased by 400%. Multiple casualties reported. Station structural integrity compromised.

The system failure protocol has been updated. See document AH/MDG-422.`
  }
];

// Loading screen messages
export const LOADING_MESSAGES = [
  "Initializing protocols...",
  "Scanning electromagnetic field...",
  "Loading station schematics...",
  "Connecting to Dharma network...",
  "Validating security clearance...",
  "System ready"
];
