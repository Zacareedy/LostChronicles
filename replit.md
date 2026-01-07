# DHARMA Initiative Terminal Application

## Overview

This is an interactive web application that simulates the DHARMA Initiative computer system from the TV show LOST. It's a mystery/puzzle game featuring a retro terminal interface, an interactive island map, countdown mechanics, and multiple layered puzzles that players must solve to unlock lore and secrets.

The application combines a command-line terminal experience with visual puzzle elements, audio logs, and a 108-minute countdown timer that creates urgency and engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Styling**: TailwindCSS with CSS variables for theming (green terminal aesthetic)
- **Animations**: Framer Motion for UI transitions and effects
- **Routing**: Wouter (lightweight React router)
- **State Management**: React Context (LoreContext) for game progression state, React Query for server state

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: Neon serverless PostgreSQL
- **API Pattern**: RESTful endpoints under `/api/` prefix

### Key Design Patterns

**Modular Puzzle System**: Each puzzle is a self-contained component (`HieroglyphPuzzle`, `RadioPuzzle`, `CoordinatesPuzzle`, etc.) managed by a central `PuzzleController` that handles launching and completion callbacks.

**Progressive Discovery**: Content unlocks based on player actions - stations appear on the map, audio logs become available, and incident reports unlock as puzzles are solved.

**Feature Toggle System**: Locked features show "ACCESS DENIED" or "SYSTEM MODULE OFFLINE" messages, allowing future expansion without breaking existing functionality.

**Shared Schema**: Database schema and types are defined in `/shared/schema.ts` and shared between frontend and backend.

### Data Flow
1. User interacts with Terminal component, entering commands
2. Commands are processed by `/lib/terminal.ts` which updates local state
3. Progress is tracked via LoreContext and persisted to PostgreSQL
4. Map markers and puzzle availability update based on discovered stations and completed puzzles

### File Structure
- `/client/src/components/` - React components (Terminal, IslandMap, puzzles)
- `/client/src/lib/` - Utilities (audio, constants, terminal command processing)
- `/client/src/contexts/` - React contexts (LoreContext for game state)
- `/server/` - Express server, routes, database connection
- `/shared/` - Shared TypeScript types and Drizzle schema

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database accessed via `@neondatabase/serverless`
- **Connection**: Requires `DATABASE_URL` environment variable
- **Schema Management**: Drizzle Kit for migrations (`db:push` command)

### UI Component Library
- **shadcn/ui**: Pre-built accessible components configured in `components.json`
- **Radix UI**: Underlying primitives for dialogs, dropdowns, tooltips, etc.

### Audio System
- **Howler.js**: Audio playback for sound effects and ambient sounds
- Audio files stored in `/public/sounds/`

### Development Tools
- **Replit Plugins**: Cartographer for development, runtime error overlay
- **esbuild**: Server bundling for production builds