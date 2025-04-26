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
      '> puzzle <type> - Access puzzle interfaces',
      '> clear - Clear terminal'
    ];
    
    // Only show additional commands based on access level
    if (accessLevel >= 2) {
      basicCommands.push('> exec - Execute manual override');
    }
    
    if (accessLevel >= 3) {
      basicCommands.push('> decrypt <file> - Decrypt classified files');
      basicCommands.push('> override <code> - Override system protocols');
      basicCommands.push('> diagnose /sys - Run system diagnostics');
    }
    
    if (accessLevel >= 4) {
      basicCommands.push('> access <protocol> - Access special protocols');
    }
    
    // Show developer commands if dev mode is active
    try {
      const devModeActive = localStorage.getItem('dharma_devmode_active') === 'true';
      if (devModeActive) {
        basicCommands.push('');
        basicCommands.push('> DEVELOPER COMMANDS:');
        basicCommands.push('> devmode - Activate developer mode');
        basicCommands.push('> devmode-exit - Exit developer mode and restore previous state');
        basicCommands.push('> setcountdown <minutes> <seconds> - Set countdown timer');
        basicCommands.push('> setcountdown <seconds> - Set countdown timer in seconds');
        basicCommands.push('> resetall - Reset all app data and return to initial state');
        basicCommands.push('');
        basicCommands.push('> PUZZLE COMMANDS:');
        basicCommands.push('> puzzle hieroglyph - Start Hieroglyph puzzle');
        basicCommands.push('> puzzle radio - Start Radio Numbers puzzle');
        basicCommands.push('> puzzle coordinates - Start Coordinates puzzle');
        basicCommands.push('> puzzle subnet - Start Subnet Protocol puzzle');
        basicCommands.push('> puzzle blackbox - Start Black Box Archive puzzle');
        basicCommands.push('> puzzle candle - Start Project Candle puzzle');
        basicCommands.push('> puzzle void - Start Void Directory puzzle');
      }
    } catch (e) {
      // Ignore localStorage errors
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

  puzzle: (args: string, onRevealPuzzle?: () => void) => {
    // Check if puzzle type is valid
    const validPuzzles = [
      'hieroglyph', 'radio', 'coordinates', 'subnet', 
      'blackbox', 'candle', 'void'
    ];
    
    // Store puzzle type in local storage for app to pick up
    const launchPuzzle = (puzzleType: string) => {
      try {
        localStorage.setItem('dharma_launch_puzzle', puzzleType);
        // Trigger callback to parent component
        if (onRevealPuzzle) {
          setTimeout(() => {
            onRevealPuzzle();
          }, 500);
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    };
    
    if (!args) {
      return [
        '> PUZZLE TYPE REQUIRED',
        '> Usage: puzzle <type>',
        '> Available puzzles: hieroglyph, radio, coordinates, subnet',
        '> Additional puzzles require elevated security clearance'
      ];
    }
    
    const puzzleType = args.toLowerCase();
    
    if (!validPuzzles.includes(puzzleType)) {
      return [
        `> ERROR: Unknown puzzle type "${puzzleType}"`,
        '> Available puzzles: hieroglyph, radio, coordinates, subnet'
      ];
    }
    
    // Check security level for advanced puzzles
    if (['blackbox', 'candle', 'void'].includes(puzzleType)) {
      // These puzzles require access level 3 or dev mode
      const devModeActive = localStorage.getItem('dharma_devmode_active') === 'true';
      
      if (accessLevel < 3 && !devModeActive) {
        return [
          '> ACCESS DENIED: Advanced puzzles require security level 3',
          '> Use login command with proper credentials or enable developer mode'
        ];
      }
    }
    
    // Launch the puzzle
    launchPuzzle(puzzleType);
    
    return [
      `> LAUNCHING ${puzzleType.toUpperCase()} PUZZLE INTERFACE...`,
      '> Please wait while the system initializes the module'
    ];
  },

  diagnose: (args: string) => {
    if (accessLevel < 3) {
      return ['> ACCESS DENIED: Security level 3 required for system diagnostics'];
    }
    
    if (args === '/sys') {
      try {
        // Check if this is dev mode
        const devModeActive = localStorage.getItem('dharma_devmode_active') === 'true';
        
        if (devModeActive) {
          // In dev mode, show the full puzzle menu
          localStorage.setItem('dharma_launch_puzzle_menu', 'true');
          
          return [
            '> SYSTEM DIAGNOSTIC INITIALIZED (DEVELOPER MODE)',
            '> Scanning for available modules...',
            '> Multiple test protocols detected',
            '> Launching diagnostic interface...',
            '> NOTICE: Full access to all diagnostic modules enabled'
          ];
        } else {
          // For regular users, always launch the subnet protocol from diagnose /sys
          // as per specification
          
          // Launch the specific puzzle
          localStorage.setItem('dharma_launch_puzzle', 'subnet');
          
          return [
            '> SYSTEM DIAGNOSTIC INITIALIZED',
            '> Scanning for available modules...',
            '> Protocol match found',
            '> Launching SUBNET PROTOCOL diagnostic module...'
          ];
        }
      } catch (e) {
        // If localStorage access fails, use default behavior
        localStorage.setItem('dharma_launch_puzzle', 'hieroglyph');
        
        return [
          '> SYSTEM DIAGNOSTIC INITIALIZED',
          '> Scanning for available modules...',
          '> Single protocol match found',
          '> Launching diagnostic module...'
        ];
      }
    } else {
      return [
        '> ERROR: Invalid diagnostic target',
        '> Usage: diagnose /sys',
        '> Other diagnostic targets unavailable in this terminal'
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
  ],

  'devmode': (args: string, onRevealPuzzle?: () => void) => {
    // Set highest access level
    accessLevel = 4;
    
    // Store all unlock flags in localStorage
    try {
      // First, save the current state so we can restore it later
      const saveCurrentState = () => {
        // Store the original values
        const originalState: Record<string, string | null> = {};
        
        // List of all flags we're about to modify
        const flagsToSave = [
          'dharma_error_allowed',
          'dharma_pearl_access',
          'dharma_incident_unlocked',
          'dharma_surveillance_active',
          'dharma_lockdown',
          'dharma_all_stations',
          'dharma_unlocked_audio_logs',
          'dharma_unlocked_reports'
        ];
        
        // Save the current values
        flagsToSave.forEach(flag => {
          originalState[flag] = localStorage.getItem(flag);
        });
        
        // Also save the main lore state
        originalState['dharma_lore_state'] = localStorage.getItem('dharma_lore_state');
        
        // Store this original state so we can restore it later
        localStorage.setItem('dharma_pre_devmode_state', JSON.stringify(originalState));
      };
      
      // Save current state before enabling dev mode
      saveCurrentState();
      
      // Unlock all special access and features
      localStorage.setItem('dharma_error_allowed', 'true');
      localStorage.setItem('dharma_pearl_access', 'true');
      localStorage.setItem('dharma_incident_unlocked', 'true');
      localStorage.setItem('dharma_surveillance_active', 'true');
      localStorage.setItem('dharma_lockdown', 'active');
      
      // Unlock all stations
      localStorage.setItem('dharma_all_stations', 'true');
      
      // Unlock all audio logs
      const allAudioLogIds = ['orientationVideo', 'distressSignal', 'radioTransmission', 
                             'blackRock', 'pearlTransmission', 'unknownSource'];
      localStorage.setItem('dharma_unlocked_audio_logs', JSON.stringify(allAudioLogIds));
      
      // Unlock all incident reports
      const allReportIds = [0, 1, 2, 3, 4, 5]; // All available report IDs
      localStorage.setItem('dharma_unlocked_reports', JSON.stringify(allReportIds));
      
      // Set developer mode flag
      localStorage.setItem('dharma_devmode_active', 'true');
      
      // Refresh the page to apply all changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (e) {
      // Ignore localStorage errors
    }

    // Trigger puzzle reveal if provided
    if (onRevealPuzzle) {
      setTimeout(onRevealPuzzle, 1000);
    }

    return [
      '> DEVELOPER MODE ACTIVATED',
      '> Maximum security clearance granted',
      '> All stations unlocked',
      '> All audio logs available',
      '> All incident reports declassified',
      '> System protocols bypassed',
      '> Countdown timer control enabled',
      '> Use "setcountdown <minutes> <seconds>" to adjust timer',
      '> Use "devmode-exit" to restore the previous application state'
    ];
  },
  
  'devmode-exit': (args: string) => {
    // Only available in dev mode
    try {
      const devModeActive = localStorage.getItem('dharma_devmode_active') === 'true';
      if (!devModeActive) {
        return [
          '> ERROR: Not in developer mode',
          '> Developer mode must be active to exit it'
        ];
      }
      
      // Retrieve the saved pre-devmode state
      const savedStateJson = localStorage.getItem('dharma_pre_devmode_state');
      if (!savedStateJson) {
        return [
          '> ERROR: No previous state found',
          '> Unable to restore previous configuration'
        ];
      }
      
      // Parse the saved state
      const savedState = JSON.parse(savedStateJson);
      
      // Remove the dev mode flag first
      localStorage.removeItem('dharma_devmode_active');
      
      // Restore the saved values for each flag
      Object.entries(savedState).forEach(([key, value]) => {
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value as string);
        }
      });
      
      // Reset access level
      accessLevel = 1;
      
      // Refresh the page to apply the restored state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
      return [
        '> DEVELOPER MODE DEACTIVATED',
        '> Restoring previous station access',
        '> Restoring previous security clearance',
        '> Restoring previous audio log access',
        '> Returning to standard operational procedures',
        '> System refresh in progress...'
      ];
    } catch (e) {
      // Handle any errors
      console.error('Error exiting developer mode:', e);
      return [
        '> ERROR: Failed to exit developer mode',
        '> System state could not be restored',
        '> Manual intervention required'
      ];
    }
  },
  
  'setcountdown': (args: string) => {
    // Only allow in dev mode
    try {
      const devModeActive = localStorage.getItem('dharma_devmode_active') === 'true';
      if (!devModeActive) {
        return [
          '> ERROR: ACCESS DENIED',
          '> Command requires developer mode',
          '> Enter "devmode" to activate developer tools'
        ];
      }
      
      // Parse arguments
      const parts = args.split(' ').filter(Boolean);
      let minutes = 0;
      let seconds = 0;
      
      if (parts.length === 1) {
        // If just one number, treat as seconds total
        seconds = parseInt(parts[0]);
        if (isNaN(seconds) || seconds < 0) {
          return [
            '> ERROR: Invalid input',
            '> Usage: setcountdown <seconds> or setcountdown <minutes> <seconds>'
          ];
        }
        minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
      } else if (parts.length >= 2) {
        // If two numbers, treat as minutes and seconds
        minutes = parseInt(parts[0]);
        seconds = parseInt(parts[1]);
        
        if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds > 59) {
          return [
            '> ERROR: Invalid input',
            '> Usage: setcountdown <seconds> or setcountdown <minutes> <seconds>'
          ];
        }
      } else {
        return [
          '> ERROR: Missing parameters',
          '> Usage: setcountdown <seconds> or setcountdown <minutes> <seconds>'
        ];
      }
      
      // Calculate total seconds
      const totalSeconds = minutes * 60 + seconds;
      
      // Store this in localStorage for the countdown component to use
      const now = Date.now();
      const calculatedStartTime = now - (6480 - totalSeconds) * 1000; // 108 minutes = 6480 seconds
      localStorage.setItem('countdown_start', calculatedStartTime.toString());
      localStorage.setItem('countdown_was_set', 'true');
      
      // Determine message based on time set
      let riskLevel = 'NOMINAL';
      if (totalSeconds <= 60) {
        riskLevel = 'CRITICAL';
      } else if (totalSeconds <= 180) {
        riskLevel = 'HIGH';
      } else if (totalSeconds <= 300) {
        riskLevel = 'ELEVATED';
      }
      
      return [
        `> COUNTDOWN TIMER ADJUSTED`,
        `> New time: ${minutes}:${seconds.toString().padStart(2, '0')}`,
        `> Risk level: ${riskLevel}`,
        totalSeconds <= 60 ? '> WARNING: System failure imminent' : ''
      ].filter(Boolean);
    } catch (e) {
      // Ignore localStorage errors
      return [
        '> ERROR: Failed to set countdown',
        '> System storage inaccessible'
      ];
    }
  }
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
  
  // Play a sound when entering command
  playSound('beep');
  
  // Check for resetall developer command to reset all app data
  if (input.trim().toLowerCase() === 'resetall') {
    try {
      // Check if developer mode is active
      const devModeActive = localStorage.getItem('dharma_devmode_active') === 'true';
      if (!devModeActive) {
        return ['> ERROR: This command requires developer mode. Use \'devmode\' first.'];
      }
      
      // Clear all localStorage data
      const savedDevMode = localStorage.getItem('dharma_devmode_active');
      localStorage.clear();
      
      // Restore dev mode for convenience
      if (savedDevMode === 'true') {
        localStorage.setItem('dharma_devmode_active', 'true');
      }
      
      // Reset countdown timer to initial state
      const now = Date.now();
      localStorage.setItem('countdown_start', now.toString());
      
      // Reset terminal state
      accessLevel = 1;
      isExecutingProtocol = false;
      pendingAction = null;
      
      return [
        '> SYSTEM RESET: All progress has been reset.',
        '> Stations, logs, and reports have been wiped.',
        '> Countdown timer has been reset to 108:00.',
        '> Reload the page to complete reset process.'
      ];
    } catch (e) {
      return ['> ERROR: Failed to reset the system.'];
    }
  }

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
