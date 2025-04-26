# DHARMA COMPUTER SYSTEM - DEVELOPER SOLUTIONS GUIDE

> **CONFIDENTIAL: DEVELOPER REFERENCE ONLY**  
> This document contains solutions and developer-only information about the DHARMA Initiative computer system puzzles.  
> Do not share this information with end users.

## Table of Contents
1. [Developer Mode Access](#developer-mode-access)
2. [Subnet Protocol Interface](#subnet-protocol-interface)
3. [Numbers Transmission Receiver](#numbers-transmission-receiver)
4. [The Black Box Archive](#the-black-box-archive)
5. [Project Candle](#project-candle)
6. [The Void Directory](#the-void-directory)
7. [Emergency Reset Procedures](#emergency-reset-procedures)

---

## Developer Mode Access

To access developer mode, enter `devmode` in the terminal. This unlocks special commands:

- `resetall`: Resets all application state to default values
- `setcountdown <seconds>`: Sets the countdown timer to a specific value
- `unlock <puzzle_id>`: Instantly unlocks a specific puzzle
- `showallstations`: Reveals all stations on the map
- `devmode-exit`: Returns to regular application state

### Developer IDs Reference

Each puzzle and element has a unique ID for use with the `unlock` command:

```
subnet_interface:   "subnet"
radio_puzzle:       "radio"
hieroglyph_puzzle:  "hieroglyph"
coordinates_puzzle: "coordinates"
black_box:          "blackbox"
project_candle:     "candle"
void_directory:     "void"
```

Example: `unlock radio` instantly completes the radio puzzle.

---

## Subnet Protocol Interface

### Access Method
1. Reach Security Level 3 through terminal commands (`rank <username> 3`)
2. Enter `diagnose /net` in terminal
3. View corrupted file table, noting `/mnt/net_link.sys` and `subnet.daemon`
4. Run `ls -a /mnt/` to discover hidden `.readme` file
5. View this file to reveal path to `.dharmanet/`
6. Run `exec .dharmanet/init_socket.sh` to activate the Subnet Interface

### Solution Path
1. Switch to the Engineering channel to find clues about Protocol Candle
2. Read messages from Radzinsky about restricted EM data readings
3. Switch to the Alvar channel for the private encrypted conversation
4. Read full exchange between Alvar Hanso and Pierre Chang 
5. Use `/nick <username>` to set a custom name
6. Use `/download` to extract and archive the subnet logs

### Critical Information
- Protocol Candle is described as "a last resort only if the temporal distortion reaches critical levels"
- The file path `/systems/em_variance/log4815.dat` contains critical EM data
- Reference to "shifting Valenzetti parameters" links to the Numbers

---

## Numbers Transmission Receiver

### Access Method
1. Discover `transmission.log` file in `/archive/swan/` after visiting 3+ stations
2. Enter station logs in terminal: `upload_log <station>` for three different stations
3. Note reference to "Alternate frequency detected" in the log
4. Observe the new pulsing red dot on the map in the sea
5. Click it and accept the prompt to "Tune to nearby frequency"
6. Terminal will unlock: `radio.listen(4.8)` opens the Radio Interface

### Special Frequencies
Each frequency contains a different hidden signal:

1. **4.8 MHz** - Numbers sequence broadcast (clearest at 4.8 exactly)
   - Contains repeating pattern: "4 8 15 16 23 42"
   - Recording this sequence unlocks the first part of the puzzle

2. **15.16 MHz** - Morse code transmission (clearest at 15.16 exactly)
   - Decodes to: "DHARMA WARNS PROTI DANGER"
   - Partial message referencing "Proximity Timer Incident"

3. **23.42 MHz** - Reversed voice recording (clearest at 23.42 exactly)
   - When played backward: "Entering 7418880 will trigger emergency reset"
   - Reference to system reset protocol

4. **108.0 MHz** - Tones that create a QR-like pattern in spectrogram
   - Visualizing the audio reveals coordinates: 4°23'S, 108°42'W
   - Points to the location of the "Black Box"

### Solution Requirements
1. Record all four frequencies (bookmark each when signal strength > 80%)
2. Switch to Analysis tab and process each recording
3. For the Morse recording, select "Decode" option
4. For the reversed voice, select "Reverse" option
5. For the tones, select "Spectrogram" option
6. Combine findings to locate the Black Box Archive

---

## The Black Box Archive

### Access Method
1. Complete the Radio Puzzle to receive coordinates
2. Enter coordinates in the map terminal: `locate 4°23'S 108°42'W`
3. Click the new location to trigger "Wreckage discovered. Recover?"
4. Accept to unlock the video file: `/recovered/flightpath.mp4`

### Solution Path
1. Open the video in fullscreen mode
2. Move mouse across timeline to reveal hidden markers at specific timestamps
3. Click markers in correct order: 8, 15, 16, 23, 42 seconds
4. Each plays a partial audio clip that together form a message
5. Note down the full message about "Project Candle"
6. Run terminal command: `authorize candle <access_phrase>` using words from message

### Critical Information
- Black box contains final communication from DHARMA supply plane
- Pilot reports electromagnetic anomaly before crash
- Message warns about "temporal cascade" requiring Project Candle
- Access phrase is "amber" (found in combination of audio clips)

---

## Project Candle

### Access Method
1. Complete Black Box Archive and obtain Level 4 clearance
2. Visit and log three specific stations in order: Swan, Flame, Pearl
3. Run the command: `protocol.candle.activate()`
4. Must be completed within 4 minutes of visiting all three stations

### Multi-Station Challenge
This is a coordinated challenge requiring quick actions at three stations:

1. **Swan Station**
   - Initiates countdown on monitor
   - Must keep value above zero by entering Numbers sequence
   - Time limit: 108 seconds

2. **Flame Station**
   - Displays "system sync puzzle" with nodes that must be aligned
   - Drag moving nodes over stationary nodes using audio log hints
   - Correct pattern is based on constellation mentioned in audio

3. **Pearl Station**
   - Shows incomplete sentence from subnet chat system
   - Missing words must be filled in using knowledge from subnet logs
   - Correct phrase: "Protocol Candle is our failsafe"

### Solution Requirements
- Complete all three station challenges within the time limit
- Each station must be properly synchronized
- Failure results in 24-hour lockout (can bypass with `dev_override candle`)
- Success reveals file: `/final/valenzetti.key` containing `LOOP_COUNT: 0`

---

## The Void Directory

### Access Method
1. Complete Project Candle to reach Level 4 access
2. New file appears in `/logs/pearl/`: `whisper.backtrace.log`
3. File contains trace path: `/mnt/███/VOID -> /dev/ethereal.stack`
4. Enter: `mount /dev/ethereal.stack` to access the Void

### Final Interaction
The Void is an AI-like entity in the terminal:

1. Terminal visually destabilizes with inverted colors, delayed input
2. Void entity begins communication with prompt: "Why are you still here?"
3. Only accepts philosophical or emotional inputs (e.g., "why", "hope", "is anyone alive")
4. After multiple exchanges, presents final choice: "Would you like to end the loop?"
   - Answering "yes" = hard reset of all progress
   - Answering "no" = increments `LOOP_COUNT` and subtly changes some previous content

### Critical Dialogue Paths
- Ask "who are you" → "I am what remains"
- Ask "what happened" → "The variables could not be changed"
- Ask "how many loops" → Reveals current loop count
- Ask "is it real" → "As real as you need it to be"

---

## Emergency Reset Procedures

If a user gets completely stuck or the application enters an unrecoverable state:

1. Access developer mode: `devmode`
2. Use `resetall` to clear all state
3. Or use selective reset: `reset_puzzle <puzzle_id>` 
4. Exit developer mode: `devmode-exit`

For database issues:
1. Use `db_repair` in developer mode
2. Check logs with `show_db_logs`
3. If needed, rebuild schemas with `rebuild_schema`

### Failsafe Command
In absolute emergency (user in completely broken state):
`protocol_dharma_terminate` - This deletes all user data and resets the entire application.
**Use with extreme caution.**

---

© DHARMA Initiative Computer Systems Division
Version 4.8.15.16.23.42