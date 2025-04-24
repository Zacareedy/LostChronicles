import { playSound } from './audio';
import { DHARMA_NUMBERS } from './constants';

// Current user state
let isExecutingProtocol = false;
let pendingAction: string | null = null;
let accessLevel = 1;
let commandHistory: string[] = [];

// Terminal commands that will be recognized in the application
const commands: Record<string, Function> = {
  help: () => {
    const basicCommands = [
      '> Available commands:',
      '> help - Display this help message',
      '> status - System status report',
      '> scan - Scan for signals on the island',
      '> login <id> - Access restricted areas',
      '> locate <station> - Find station location',
      '> clear - Clear terminal'
    ];
    
    // Only show additional commands based on access level
    if (accessLevel >= 2) {
      basicCommands.push('> exec - Execute manual override');
    }
    
    if (accessLevel >= 3) {
      basicCommands.push('> decrypt <file> - Decrypt classified files');
      basicCommands.push('> override <code> - Override system protocols');
    }
    
    if (accessLevel >= 4) {
      basicCommands.push('> access <protocol> - Access special protocols');
    }
    
    return basicCommands;
  },
  
  status: () => {
    const powerLevel = Math.floor(Math.random() * 15) + 70; // Random between 70-85%
    
    // Show different status based on system state
    if (pendingAction === 'protocol') {
      return [
        '> SYSTEM STATUS: PROTOCOL EXECUTION REQUIRED',
        `> Electromagnetic containment: UNSTABLE`,
        `> Power reserve: ${powerLevel}% (DECREASING)`,
        '> Communication systems: COMPROMISED',
        '> Last maintenance: 16 days ago',
        '> WARNING: System failure imminent in 108 minutes',
        '> Please enter the numbers to reset the system.'
      ];
    }
    
    return [
      '> SYSTEM STATUS:',
      `> Electromagnetic containment: ${accessLevel >= 3 ? 'FLUCTUATING' : 'ACTIVE'}`,
      `> Power reserve: ${powerLevel}%`,
      '> Communication systems: LIMITED',
      '> Last maintenance: 16 days ago',
      accessLevel >= 2 ? '> WARNING: Protocol execution required' : '> System operational'
    ];
  },
  
  scan: () => {
    const stationsDetected = Math.min(accessLevel + 2, 6);
    
    if (commandHistory.includes('scan') && Math.random() < 0.3) {
      // Sometimes show an anomaly on repeat scans
      setTimeout(() => {
        playSound('static', 'short');
      }, 1000);
      
      return [
        '> SCANNING ISLAND...',
        '> ANOMALY DETECTED',
        '> Signal interference at coordinates 4.815 N, 162.342 W',
        '> Unknown energy signature',
        '> WARNING: Possible security breach'
      ];
    }
    
    return [
      '> SCANNING ISLAND...',
      `> ${stationsDetected} DHARMA stations detected`,
      '> Signal strength: MODERATE',
      '> Interference detected in SECTOR 23',
      accessLevel >= 2 ? '> Pearl station surveillance feed active' : ''
    ];
  },
  
  login: (args: string, onRevealPuzzle?: () => void) => {
    if (args === '4815162342') {
      accessLevel = Math.max(accessLevel, 3);
      if (onRevealPuzzle) {
        setTimeout(() => {
          onRevealPuzzle();
        }, 1000);
      }
      return ['> ACCESS GRANTED: Welcome, Dr. DeGroot', '> Security level 3 access granted'];
    } else if (args === 'dharma77') {
      accessLevel = Math.max(accessLevel, 2);
      return ['> ACCESS GRANTED: Welcome, Station Operator', '> Security level 2 access granted'];
    } else if (args === 'C22/DSTNGSHD-LBRT') {
      // This is the code from the system error page
      accessLevel = Math.max(accessLevel, 4);
      // Store in localStorage that user found Pearl access code
      try {
        localStorage.setItem('dharma_pearl_access', 'true');
      } catch (e) {
        // Ignore localStorage errors
      }
      return [
        '> DISTINGUISHED LIBERTY PROTOCOL ACTIVATED',
        '> Pearl station surveillance access granted',
        '> Security level 4 access granted',
        '> SYSTEM ALERT: New incident report available'
      ];
    } else {
      playSound('fail');
      return ['> ACCESS DENIED: Invalid credentials'];
    }
  },
  
  locate: (args: string, onRevealStation?: (stationName: string) => void) => {
    const stations: Record<string, string> = {
      'swan': 'Sector 4: Electromagnetic research',
      'pearl': 'Sector 8: Psychological research and surveillance',
      'flame': 'Sector 15: Communications',
      'arrow': 'Sector 16: Defense',
      'staff': 'Sector 23: Medical research',
      'orchid': 'Sector 42: Time research'
    };
    
    if (args && stations[args.toLowerCase()]) {
      if (onRevealStation) {
        // Only reveal station if user has sufficient access level
        // Pearl requires higher access
        if (args.toLowerCase() === 'pearl' && accessLevel < 2) {
          return ['> ERROR: Insufficient clearance for Pearl station', '> Security level 2 required'];
        }
        // Orchid requires highest access
        if (args.toLowerCase() === 'orchid' && accessLevel < 4) {
          return ['> ERROR: Insufficient clearance for Orchid station', '> Security level 4 required'];
        }
        
        onRevealStation(args.toLowerCase());
      }
      
      // Show easter egg hint for Pearl station
      if (args.toLowerCase() === 'pearl' && accessLevel >= 2) {
        return [
          `> LOCATION: ${args.toUpperCase()}`,
          `> ${stations[args.toLowerCase()]}`,
          '> Coordinates updated on map',
          '> NOTE: Pearl station contains monitors of all other stations',
          '> Access code required for surveillance feed'
        ];
      }
      
      return [
        `> LOCATION: ${args.toUpperCase()}`,
        `> ${stations[args.toLowerCase()]}`,
        '> Coordinates updated on map'
      ];
    } else {
      return ['> ERROR: Station not found. Try: swan, pearl, flame, arrow, staff, orchid'];
    }
  },
  
  exec: () => {
    if (accessLevel < 2) {
      return ['> ACCESS DENIED: Security level 2 required'];
    }
    
    isExecutingProtocol = true;
    pendingAction = 'protocol';
    
    return [
      '> MANUAL OVERRIDE PROTOCOL INITIATED',
      '> VALENZETTI EQUATION PARAMETERS REQUIRED',
      '> Enter the numbers: _ _ _ _ _ _'
    ];
  },
  
  decrypt: (args: string) => {
    if (accessLevel < 3) {
      return ['> ACCESS DENIED: Security level 3 required'];
    }
    
    if (args === 'incident') {
      // Reveal a hidden report
      try {
        localStorage.setItem('dharma_incident_unlocked', 'true');
      } catch (e) {
        // Ignore localStorage errors
      }
      
      return [
        '> DECRYPTING "THE INCIDENT" FILE...',
        '> Incident report partially recovered',
        '> Security incident involving electromagnetic anomaly',
        '> Several casualties reported',
        '> Protocol initiated to prevent future incidents',
        '> Full report now available in archives'
      ];
    } else if (args === 'blackrock') {
      return [
        '> DECRYPTING "BLACK ROCK" FILE...',
        '> 19th century slave ship',
        '> Transported explosives',
        '> Shipwrecked on island during storm',
        '> Current location: Dark Territory',
        '> WARNING: Explosives still viable'
      ];
    } else if (args === 'valenzetti') {
      return [
        '> DECRYPTING "VALENZETTI EQUATION" FILE...',
        '> Mathematical expression predicting mankind\'s extinction',
        '> Core values: 4, 8, 15, 16, 23, 42',
        '> DHARMA INITIATIVE PRIMARY GOAL: Change at least one core value',
        '> Current status: FAILURE',
        '> WARNING: File contains level 5 classified information'
      ];
    } else {
      return [
        '> ERROR: File not found or insufficient clearance',
        '> Available files: incident, blackrock, valenzetti'
      ];
    }
  },
  
  override: (args: string) => {
    if (accessLevel < 3) {
      return ['> ACCESS DENIED: Security level 3 required'];
    }
    
    if (args === 'system-error') {
      // This is a hidden command that reveals a secret URL
      try {
        localStorage.setItem('dharma_error_allowed', 'true');
      } catch (e) {
        // Ignore localStorage errors
      }
      
      return [
        '> SYSTEM ERROR PROTOCOL ENGAGED',
        '> Debug interface available at: /system-error',
        '> WARNING: UNAUTHORIZED ACCESS TO DEBUG INTERFACE IS PROHIBITED',
        '> USE AT YOUR OWN RISK'
      ];
    } else {
      return [
        '> ERROR: Invalid override parameter',
        '> System integrity maintained'
      ];
    }
  },
  
  access: (args: string) => {
    if (accessLevel < 4) {
      return ['> ACCESS DENIED: Security level 4 required'];
    }
    
    if (args === 'pearl-surveillance') {
      try {
        localStorage.setItem('dharma_surveillance_active', 'true');
        // Unlock all stations as a reward
        localStorage.setItem('dharma_all_stations', 'true');
      } catch (e) {
        // Ignore localStorage errors
      }
      
      return [
        '> PEARL SURVEILLANCE PROTOCOL ACTIVATED',
        '> Accessing video feeds from all stations...',
        '> WARNING: You are now in observation mode',
        '> All station locations have been revealed on the map',
        '> New incident report available: SYSTEM FAILURE LOG'
      ];
    } else {
      return [
        '> ERROR: Protocol not recognized',
        '> Available protocols: pearl-surveillance'
      ];
    }
  },
  
  "4 8 15 16 23 42": (args: string, onRevealPuzzle?: any, onRevealStation?: any, onCorrectSequence?: () => void) => {
    // Handle entering the numbers directly
    if (pendingAction === 'protocol' || isExecutingProtocol) {
      isExecutingProtocol = false;
      pendingAction = null;
      
      if (onCorrectSequence) {
        onCorrectSequence();
      }
      
      return [
        '> NUMBERS ACCEPTED',
        '> PROTOCOL EXECUTED SUCCESSFULLY',
        '> System reset complete',
        '> Electromagnetic field stabilized',
        '> Counter reset to 108 minutes'
      ];
    }
    
    return [
      '> VALENZETTI PARAMETERS RECOGNIZED',
      '> WARNING: DIRECT INPUT NOT AUTHORIZED',
      '> Please use appropriate command protocols'
    ];
  },
  
  clear: () => []
};

// Easter eggs and hidden commands
const hiddenCommands: Record<string, Function> = {
  'dharma': () => [
    '> DHARMA INITIATIVE PERSONNEL DATABASE',
    '> ACCESS RESTRICTED',
    '> ENTER VALENZETTI PARAMETERS TO CONTINUE'
  ],
  
  'namaste': () => [
    '> NAMASTE AND GOOD LUCK',
    '> "The DHARMA Initiative - to create a better future for our world through science."'
  ],
  
  'numbers': () => [
    '> 4 8 15 16 23 42',
    '> THE NUMBERS ARE BAD',
    '> SYSTEM ALERT: SECURITY BREACH DETECTED'
  ],
  
  'jacob': () => [
    '> [TRANSMISSION INTERCEPTED]',
    '> "He\'s coming. And he\'s angry."',
    '> [CONNECTION TERMINATED]'
  ],
  
  'smokey': () => [
    '> [SECURITY ALERT]', 
    '> STATION PERIMETER BREACHED',
    '> HOSTILE ENTITY DETECTED',
    '> LOCKDOWN INITIATED'
  ],
  
  'oceanic815': () => [
    '> FLIGHT MANIFEST FOUND',
    '> SURVIVORS DETECTED ON NORTH SHORE',
    '> DIRECTIVE: OBSERVE BUT DO NOT ENGAGE'
  ],
  
  'theisland': () => [
    '> "The Island is not a where, it is a what."',
    '> ACCESS TO FURTHER INFORMATION RESTRICTED',
    '> LEVEL 5 CLEARANCE REQUIRED'
  ],
  
  'danielle': () => [
    '> SEARCHING FOR "DANIELLE"...',
    '> Reference found: Rousseau, Danielle',
    '> Status: MAROONED',
    '> Location: SECTOR 7',
    '> WARNING: Subject is mentally unstable and considered dangerous',
    '> Approach with caution'
  ],
  
  'lockdown': () => {
    try {
      localStorage.setItem('dharma_lockdown', 'active');
    } catch (e) {
      // Ignore localStorage errors
    }
    
    return [
      '> LOCKDOWN PROTOCOL INITIATED',
      '> All blast doors engaged',
      '> WARNING: Map visible on blast door during UV illumination',
      '> Lockdown will end automatically in 3 minutes'
    ];
  },
  
  'orientation': () => [
    '> DHARMA INITIATIVE ORIENTATION',
    '> STATION 3: THE SWAN',
    '> HISTORY: Constructed in 1977',
    '> PURPOSE: Electromagnetic research and containment',
    '> PROTOCOL: Enter the code every 108 minutes',
    '> WARNING: Do not attempt to use the computer for communication'
  ],
  
  'hello': () => [
    '> Hello, operator.',
    '> How can I assist with today\'s protocol implementation?',
    '> DHARMA INITIATIVE thanks you for your service.'
  ],
  
  'hanso': () => [
    '> HANSO FOUNDATION RECORD',
    '> Founded by Alvar Hanso',
    '> Mission: Technological innovation for humanity\'s future',
    '> Funded DHARMA Initiative in 1970',
    '> Current status: [REDACTED]'
  ],
  
  'what is your name': () => [
    '> I am DHARMA INITIATIVE COMPUTER INTERFACE VERSION 4.07',
    '> You may call me DIC-4.0',
    '> I assist with station operation and protocol compliance'
  ]
};

// Process terminal command input and return response
const processCommand = (
  input: string, 
  onRevealPuzzle?: () => void, 
  onRevealStation?: (stationName: string) => void,
  onCorrectSequence?: () => void
): string[] => {
  // Add to command history
  commandHistory.push(input.trim().toLowerCase());
  
  // Keep only last 10 commands
  if (commandHistory.length > 10) {
    commandHistory = commandHistory.slice(-10);
  }
  
  // Handle special case for entering the numbers
  if (pendingAction === 'protocol') {
    // Check if input matches the numbers pattern
    const numbersPattern = /^\s*4\s*8\s*15\s*16\s*23\s*42\s*$/;
    if (numbersPattern.test(input)) {
      isExecutingProtocol = false;
      pendingAction = null;
      playSound('success');
      
      if (onCorrectSequence) {
        onCorrectSequence();
      }
      
      return [
        '> NUMBERS ACCEPTED',
        '> PROTOCOL EXECUTED SUCCESSFULLY',
        '> System reset complete',
        '> Electromagnetic field stabilized',
        '> Counter reset to 108 minutes'
      ];
    }
  }
  
  // Split input into command and arguments
  const [cmd, ...args] = input.trim().toLowerCase().split(' ');
  const argsStr = args.join(' ');
  
  playSound('typing', 'short');
  
  // Handle direct input of the DHARMA numbers
  if (input.trim() === DHARMA_NUMBERS.join(' ')) {
    return commands["4 8 15 16 23 42"](argsStr, onRevealPuzzle, onRevealStation, onCorrectSequence);
  }
  
  if (commands[cmd]) {
    return commands[cmd](argsStr, onRevealPuzzle, onRevealStation, onCorrectSequence);
  } else if (hiddenCommands[cmd]) {
    playSound('beep');
    return hiddenCommands[cmd]();
  } else {
    // Handle multi-word hidden commands
    const fullInput = input.trim().toLowerCase();
    const multiWordCommands = ['what is your name'];
    
    for (const command of multiWordCommands) {
      if (fullInput === command && hiddenCommands[command]) {
        playSound('beep');
        return hiddenCommands[command]();
      }
    }
    
    return ['> Unknown command. Type "help" for available commands.'];
  }
};

// Reset terminal state (for testing)
const resetTerminal = () => {
  isExecutingProtocol = false;
  pendingAction = null;
  accessLevel = 1;
  commandHistory = [];
};

export { commands, hiddenCommands, processCommand, resetTerminal };
