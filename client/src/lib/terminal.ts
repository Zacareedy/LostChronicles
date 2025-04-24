import { playSound } from './audio';

// Terminal commands that will be recognized in the application
const commands: Record<string, Function> = {
  help: () => [
    '> Available commands:',
    '> help - Display this help message',
    '> status - System status report',
    '> scan - Scan for signals on the island',
    '> login <id> - Access restricted areas',
    '> locate <station> - Find station location',
    '> exec - Execute manual override',
    '> clear - Clear terminal'
  ],
  status: () => [
    '> SYSTEM STATUS:',
    '> Electromagnetic containment: ACTIVE',
    '> Power reserve: 87%',
    '> Communication systems: LIMITED',
    '> Last maintenance: 16 days ago',
    '> WARNING: Protocol execution required'
  ],
  scan: () => [
    '> SCANNING ISLAND...',
    '> 3 DHARMA stations detected',
    '> Signal strength: MODERATE',
    '> Interference detected in SECTOR 23'
  ],
  login: (args: string, onRevealPuzzle?: () => void) => {
    if (args === '4815162342') {
      if (onRevealPuzzle) {
        setTimeout(() => {
          onRevealPuzzle();
        }, 1000);
      }
      return ['> ACCESS GRANTED: Welcome, Dr. DeGroot'];
    } else {
      playSound('fail');
      return ['> ACCESS DENIED: Invalid credentials'];
    }
  },
  locate: (args: string, onRevealStation?: (stationName: string) => void) => {
    const stations: Record<string, string> = {
      'swan': 'Sector 4: Electromagnetic research',
      'pearl': 'Sector 8: Psychological research',
      'flame': 'Sector 15: Communications',
      'arrow': 'Sector 16: Defense',
      'staff': 'Sector 23: Medical research',
      'orchid': 'Sector 42: Time research'
    };
    
    if (args && stations[args.toLowerCase()]) {
      if (onRevealStation) {
        onRevealStation(args.toLowerCase());
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
  exec: () => [
    '> MANUAL OVERRIDE REQUIRES VALENZETTI SEQUENCE',
    '> Enter the numbers: _ _ _ _ _ _'
  ],
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
  ]
};

// Process terminal command input and return response
const processCommand = (
  input: string, 
  onRevealPuzzle?: () => void, 
  onRevealStation?: (stationName: string) => void
): string[] => {
  // Split input into command and arguments
  const [cmd, ...args] = input.trim().toLowerCase().split(' ');
  const argsStr = args.join(' ');
  
  playSound('typing', 'short');
  
  if (commands[cmd]) {
    return commands[cmd](argsStr, onRevealPuzzle, onRevealStation);
  } else if (hiddenCommands[cmd]) {
    playSound('beep');
    return hiddenCommands[cmd]();
  } else {
    return ['> Unknown command. Type "help" for available commands.'];
  }
};

export { commands, hiddenCommands, processCommand };
