
# DHARMA Initiative Terminal - Technical Documentation

## Overview
This is a React/TypeScript application that simulates the DHARMA Initiative computer system from the TV show LOST. It's a complex interactive experience combining multiple UI components, state management, audio feedback, and hidden puzzles.

## Core Architecture

### Frontend Stack
- React 18.3.1 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Framer Motion for animations
- Howler.js for audio management
- Wouter for routing

### Backend Stack
- Express.js server
- WebSocket support for real-time updates
- File-based storage system

## Key Components

### 1. Terminal (Terminal.tsx)
- Command-line interface simulator
- Handles user input/output
- Security level system (1-4)
- Command history tracking
- Custom command parser
- Easter egg command detection

### 2. Island Map (IslandMap.tsx)
- Interactive SVG-based map
- Draggable/zoomable interface
- Dynamic station markers
- Coordinate-based location system
- Station discovery visualization

### 3. Countdown System (Countdown.tsx)
- 108-minute countdown timer
- System failure state management
- Audio warning system
- Reset sequence validation
- Failsafe mechanism

### 4. Hidden Puzzle System (HiddenPuzzle.tsx)
- Valenzetti Equation puzzle
- Drag-and-drop number sequence
- Success/failure state handling
- Reward unlocking system

### 5. Lore Management (LoreContext.tsx)
State management for:
- Discovered stations
- Unlocked audio logs
- Incident reports
- Progression tracking
- System status
- Terminal history

## State Management
Uses React Context API through LoreContext for:
- Game progression
- Unlocks tracking
- Audio log management
- Station discovery
- Terminal history

## Audio System
Implemented in audio.ts:
- Sound effects library
- Ambient background sounds
- Terminal feedback
- Alert systems
- Success/failure indicators

## Security Levels
1. Level 1: Basic access (default)
2. Level 2: Advanced terminal commands (login: dharma77)
3. Level 3: Incident reports access (login: 4815162342)
4. Level 4: Full system access (requires Pearl station completion)

## Hidden Features
1. System Error Page
- Debug output contains Pearl access code
- Hidden button trigger
- Memory dump easter egg

2. Audio Logs
- Multiple unlock conditions
- Sequential discovery system
- Hidden transmission patterns

3. Station Discovery
- Coordinate-based unlocks
- Security level requirements
- Sequential visit patterns

## Core Game Loop
1. Users start with basic terminal access
2. Discover stations through commands/exploration
3. Unlock new security levels
4. Access hidden content/puzzles
5. Maintain system through countdown protocol
6. Discover final secrets through combined mechanics

## Technical Features

### CSS/Styling
- Custom CRT screen effect
- Scan line animation
- Terminal text effects
- Dynamic map markers
- Dharma-themed UI components

### Animation System
- Framer Motion integration
- Terminal typing effects
- Map transition animations
- Puzzle drag-and-drop
- Alert/notification system

### Error Handling
- Terminal command validation
- Puzzle state verification
- Security level checks
- Audio loading fallbacks
- Map boundary protection

## Development Guidelines

### Adding New Features
1. Add constants to constants.ts
2. Update LoreContext if state management needed
3. Create component in components/
4. Add to Home.tsx if main interface
5. Update SECRETS_GUIDE.md for user docs

### Security Level Implementation
1. Check levels in Terminal.tsx
2. Update command permissions
3. Modify LoreContext security flags
4. Update UI accessibility

### Adding Station Content
1. Add to STATIONS constant
2. Create marker coordinates
3. Add discovery conditions
4. Update station logs
5. Modify map markers

### Puzzle Implementation
1. Create puzzle component
2. Add to HiddenPuzzle.tsx
3. Implement unlock conditions
4. Add reward system
5. Update documentation

## Known Limitations
- Single-session state persistence
- Limited mobile responsiveness
- Audio preloading constraints
- Map zoom boundaries
- Browser compatibility variations

## Future Considerations
- Multi-session state persistence
- Additional station implementations
- Enhanced mobile support
- Expanded puzzle systems
- Advanced audio management

Note: This implementation closely follows the LOST mythology while maintaining technical scalability and modularity. All features are designed to be discoverable through exploration and logical progression.
