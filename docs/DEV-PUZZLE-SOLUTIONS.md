# LOSTCHRONICLES — DEVELOPER PUZZLE & CLEARANCE GUIDE

> **DEV REFERENCE ONLY** — Contains all puzzle answers, discovery paths, unlock codes, and internal architecture.  
> Last updated: June 2026 — reflects current codebase (post-session: L2→L3 redesign, radio/waveform removed, PEARL added, fog-of-war added).

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Dev Mode & Quick Testing](#dev-mode--quick-testing)
3. [Level 1 → 2: "The Dead Operator's Note"](#level-1--2-the-dead-operators-note)
4. [Level 2 → 3: "The Corrupted Carrier Wave"](#level-2--3-the-corrupted-carrier-wave)
5. [Level 3 → 4: "Radzinsky's Cipher"](#level-3--4-radzinskys-cipher)
6. [Level 4 → 5: "The Thanatos Designation"](#level-4--5-the-thanatos-designation)
7. [UI Puzzle Components](#ui-puzzle-components)
8. [Content Unlocked Per Level](#content-unlocked-per-level)
9. [All LocalStorage Keys](#all-localstorage-keys)
10. [All Terminal Commands Reference](#all-terminal-commands-reference)
11. [Architecture Notes](#architecture-notes)

---

## System Overview

The ARG uses a **5-level clearance progression** persisted in `localStorage` under the key `dharma_clearance_level`.

| Level | Label      | Answer                     |
|-------|------------|----------------------------|
| 1     | VISITOR    | *(starting level)*         |
| 2     | OPERATOR   | `AUTHENTICATE WICKMUND`    |
| 3     | TECHNICIAN | `AUTHENTICATE KRONOS`      |
| 4     | RESEARCHER | `AUTHENTICATE DARK MATTER` |
| 5     | OMEGA      | `AUTHENTICATE THANATOS`    |

**Architecture:**
- `client/src/lib/clearance.ts` — single source of truth: `getClearance()`, `setClearance()`, `clearanceLabel()`
- `client/src/lib/terminal.ts` — all command logic and puzzle content
- Clearance changes fire `CustomEvent('dharma-clearance-change', { detail: { level } })`
- `Terminal.tsx` and `Home.tsx` both listen to this event to update their UI

---

## Dev Mode & Quick Testing

### Enter Dev Mode
```
devmode
```
Sets clearance to L5 and unlocks all localStorage flags. Reloads the page automatically.

### Exit Dev Mode
```
devmode-exit
```
Restores the exact state before `devmode` was typed, reloads.

### Reset Everything
Only works inside dev mode:
```
resetall
```
Wipes all localStorage and resets countdown. Requires page reload after.

### Set Countdown Timer
Only works inside dev mode:
```
setcountdown 1 30    → sets timer to 1:30
setcountdown 10      → sets timer to 10 seconds
```

### Manual Clearance Jump
Open the browser console:
```javascript
localStorage.setItem('dharma_clearance_level', '3');
window.dispatchEvent(new CustomEvent('dharma-clearance-change', { detail: { level: 3 } }));
```
No page reload needed.

### Trigger System Failure Immediately
```javascript
localStorage.setItem('countdown_start', (Date.now() - 6480000).toString());
```
Backdates the countdown start by 108 minutes — failure occurs on next tick.

### Set Required Flags Without Playing Through
Useful when testing a specific gate in isolation:
```javascript
// L1→L2 gate (must read personal effects AND orientation reel)
localStorage.setItem('dharma_ping_resolved', 'true');
localStorage.setItem('dharma_personal_effects_read', 'true');
localStorage.setItem('dharma_orientation_read', 'true');
// L2→L3 gate (all four sources required)
localStorage.setItem('dharma_comms_read', 'true');
localStorage.setItem('dharma_entity_tracked', 'true');
localStorage.setItem('dharma_subnet_complete', 'true');
localStorage.setItem('dharma_pearl_log_cycled', 'true');
localStorage.setItem('dharma_freq_decrypted', 'true');
// L3→L4 gate (all three required)
localStorage.setItem('dharma_map_consulted', 'true');
localStorage.setItem('dharma_radzinsky_read', 'true');
localStorage.setItem('dharma_decrypt_shift_used', 'true');
// L4→L5 gate
localStorage.setItem('dharma_nodes_activated', 'true');
```

---

## Level 1 → 2: "The Dead Operator's Note"

**Answer:** `AUTHENTICATE WICKMUND`  
**Cipher:** Morse code (ITU-R standard)  
**Gate flag:** `dharma_orientation_read = 'true'` — must have read the orientation reel before authenticate succeeds

### Step 1 — Confirm the island signal

The **IslandMap** panel shows a pulsing green marker at the Swan Station position. Hover to reveal coordinates: `N 4°815′ W 162°342′`.

```
PING 4815 162342
```
Response confirms the node. Sets `dharma_ping_resolved = 'true'`. **Note:** PING does NOT reveal the Morse code — that is only in the orientation reel.

### Step 2 — Find the personal effects
```
INCIDENT
```
> `CYCLE 10801 — Station handover. Personal effects catalogued.`  
> `File: READ /FILES/PERSONAL-EFFECTS.TXT`

### Step 3 — Read the effects file
```
READ /FILES/PERSONAL-EFFECTS.TXT
```
Contains Desmond Hume's belongings. V. Kelvin's note: *"His verification word is encoded in the orientation transcript. Standard maritime signalling format."*  
Sets `dharma_personal_effects_read = 'true'`. **This flag must be set before the orientation reel is accessible.**

### Step 4 — Read the orientation reel
```
READ /DHARMA/ORIENTATION-REEL-3.TXT
```
Gated — returns `ACCESS RESTRICTED` if personal effects haven't been read first.  
Desmond's addendum at the end contains the Morse code. Sets `dharma_orientation_read = 'true'`.

> `.-- .. -.-. -.- -- ..- -. -..`

### Step 5 — Decode the Morse

| Signal | Letter |
|--------|--------|
| `.--`  | W |
| `..`   | I |
| `-.-.` | C |
| `-.-`  | K |
| `--`   | M |
| `..-`  | U |
| `-.`   | N |
| `-..`  | D |

Result: **WICKMUND**

### Step 6 — Authenticate
```
AUTHENTICATE WICKMUND
```

---

## Level 2 → 3: "The Corrupted Carrier Wave"

**Answer:** `AUTHENTICATE KRONOS`  
**Cipher:** Acrostic — first letter of each Greek-designated carrier peak  
**Gate flag:** `dharma_freq_decrypted = 'true'` — set only when `DECRYPT FREQUENCIES` completes with all four sources

### Overview

The carrier wave intercept (`COMMS`) shows all 6 peaks as `[DESIGNATION CORRUPTED]`. The Greek names must be recovered from **four independent sources** in any order. Only once all four sources have been accessed does `DECRYPT FREQUENCIES` reveal the full series and set the gate flag.

| Source | Command | Peaks revealed | Flag set |
|--------|---------|----------------|----------|
| Carrier wave structure | `COMMS` | (structure only — no names) | `dharma_comms_read` |
| Entity field telemetry | `TRACK` (after entity enters zone) | Peak 01 = KAPPA · Peak 02 = RHO | `dharma_entity_tracked` |
| Subnet archive download | `SUBNET` → `/download` | Peak 03 = OMEGA · Peak 04 = NU | `dharma_subnet_complete` |
| Pearl observation log | `PEARL` | Peak 05 = OMICRON · Peak 06 = SIGMA | `dharma_pearl_log_cycled` |

### Step 1 — Read the carrier wave log (required)
```
COMMS
```
Shows a Flame Station intercept: 6 frequency peaks at 4, 8, 15, 16, 23, 42 MHz — all designations corrupted. Instructs player to cross-reference field telemetry, subnet archive, and Pearl log. Sets `dharma_comms_read = 'true'`.

### Step 2 — Track the moving entity (KAPPA · RHO)

On the **IslandMap**, a red dot moves across the island when clearance ≥ 2. Wait for it to enter the target zone (~x:50–62%, y:32–44%). When it does, `dharma_entity_tracked = 'true'` is set automatically and a map status message fires.

```
TRACK
```
With `dharma_entity_tracked` set, TRACK returns the grid fix log: *"KAPPA(4) · RHO(8) values confirm secondary grid alignment — peaks 01 and 02 of carrier wave."*

Without it, TRACK returns "no logged entity positions."

### Step 3 — Download the subnet archive (OMEGA · NU)
```
SUBNET
```
Opens the **SubnetInterface** overlay (available at L2+). Inside the interface, type:
```
/download
```
Completes the archive extraction. Home.tsx `onComplete` callback sets `dharma_subnet_complete = 'true'`. The download confirmation reads: *"Peak 03 = OMEGA [15 MHz] · Peak 04 = NU [16 MHz]. Cross-reference: COMMS carrier wave log."*

### Step 4 — Read the Pearl observation log (OMICRON · SIGMA)
```
PEARL
```
Returns excerpts from Pearl Station observation cycles. Cycle 10891 confirms: *"peaks at 23 MHz and 42 MHz … designations confirmed: OMICRON · SIGMA. Relay log suffix: O-S."* Sets `dharma_pearl_log_cycled = 'true'`.

### Step 5 — Run the full decryption
```
DECRYPT FREQUENCIES
```
**Progressive output** — shows which sources are confirmed and which are outstanding. All four flags must be set for full completion:

```
> [COMMS] Carrier structure confirmed — 6 peaks at 4·8·15·16·23·42 MHz.
> [ENTITY TELEMETRY] Peak 01 = KAPPA (4 MHz) · Peak 02 = RHO (8 MHz)
> [SUBNET ARCHIVE]   Peak 03 = OMEGA (15 MHz) · Peak 04 = NU (16 MHz)
> [PEARL LOG]        Peak 05 = OMICRON (23 MHz) · Peak 06 = SIGMA (42 MHz)
>
> FULL GREEK SERIES RESTORED:
>   KAPPA · RHO · OMEGA · NU · OMICRON · SIGMA
>
> STATION RELAY DESIGNATION: K-R-O-N-O-S
```

Sets `dharma_freq_decrypted = 'true'`.

### Step 6 — Authenticate
```
AUTHENTICATE KRONOS
```

---

## Level 3 → 4: "Radzinsky's Cipher"

**Answer:** `AUTHENTICATE DARK MATTER`  
**Cipher:** Caesar cipher, shift +1 (each letter advanced one position forward)  
**Gate flags:** All three of the following must be set:
- `dharma_map_consulted = 'true'` (opened blast door map)
- `dharma_radzinsky_read = 'true'` (read Radzinsky's file at L3+)
- `dharma_decrypt_shift_used = 'true'` (ran `DECRYPT SHIFT`)

### Cipher Key

Radzinsky encoded every personal annotation by shifting each letter **+1 forward**:

```
A→B  B→C  C→D  D→E  E→F  F→G  G→H  H→I  I→J  ...  Y→Z  Z→A
```

To **decode**, shift **−1 backward**:
```
E→D  B→A  S→R  L→K     N→M  B→A  U→T  U→T  F→E  S→R
EBSL NBUUFS  →  DARK MATTER
```

### Step 1 — Open the blast door map (sets `dharma_map_consulted`)
```
MAP
```
Opens the **BlastDoorMap** UV overlay. Moving the cursor reveals annotations.

### Step 2 — Read Radzinsky's file (sets `dharma_radzinsky_read`)
```
RADZINSKY
```
Output at L3+: explains the +1 shift habit and V. Kelvin's note about it.

### Step 3 — Run cipher analysis (sets `dharma_decrypt_shift_used`)
```
DECRYPT SHIFT
```
Confirms Caesar+1, shows decode example: E→D, B→A, S→R, L→K.

### Step 4 — Decode the blast door inscription
```
E B S L   N B U U F S
↓ ↓ ↓ ↓   ↓ ↓ ↓ ↓ ↓ ↓
D A R K   M A T T E R
```

### Step 5 — Authenticate
```
AUTHENTICATE DARK MATTER
```
*(Space required — two words)*

### Supporting puzzles (additional clue paths)

**OVERRIDE-D108 (hidden command — found on blast door UV map):**  
The UV layer contains: `sys designation: archive ref OVERRIDE-D108`. Typing `OVERRIDE-D108` in the terminal returns a Caesar+1 encoded archive fragment. Sets `dharma_override_used = 'true'`.

**Storm cache ping:**  
IslandMap shows the storm-cache marker only during storm weather. `PING 2342 10815` while weather = storm returns a clue about Radzinsky's encoding. Sets `dharma_storm_cache_pinged = 'true'`. The weather state cycles every 90 seconds; storm appears once per cycle.

**Subnet node maze (hidden command — L3+):**  
```
NODE A1  →  NODE A4  →  NODE B3 TOKEN-BRAVO-7  →  NODE B7 CIPHER-DELTA-9  →  NODE C2 PASSAGE-ECHO-4
```
Completion sets `dharma_node_maze_complete = 'true'`. Node C2 cross-references OVERRIDE-D108 and the DARK MATTER research subject.

---

## Level 4 → 5: "The Thanatos Designation"

**Answer:** `AUTHENTICATE THANATOS`  
**Gate flag:** `dharma_nodes_activated = 'true'` — distributed node activation must be completed first

### Gate — Distributed Node Activation (ACTIVATE sequence)

The six DHARMA numbers must be activated in order using the hidden `ACTIVATE` command (L4+):

```
ACTIVATE 4
ACTIVATE 8
ACTIVATE 15
ACTIVATE 16
ACTIVATE 23
ACTIVATE 42
```

Wrong order resets the sequence. Progress is tracked in `dharma_activation_progress` (JSON array). Completion sets `dharma_nodes_activated = 'true'`.

**Where to find the sequence:** VALENZETTI command, `READ /FILES/VK-108.TXT`, Desmond's personal effects notebook page, Pearl log cycle markers.

### Two-Layer Cipher

**Encoding path (how it was made):**
```
THANATOS  →  Atbash  →  GSZMZGLH  →  ROT-13  →  TFMZMTYU
```

**Decoding path (what the player does):**
```
TFMZMTYU  →  ROT-13  →  GSZMZGLH  →  Atbash  →  THANATOS
```

**Atbash** maps A↔Z, B↔Y, C↔X, D↔W, etc. (alphabet fully reversed).

### Hints for each layer

**Layer 1 — ROT-13:** Kelvin's final log (`READ /LOGS/FINAL-TRANSMISSION.TXT`) says: *"First: the standard rotation used in all field comms."*

**Layer 2 — Atbash:** The Alvar channel in the **SubnetInterface** contains a message from Alvar.H: *"The mirror cipher is the oldest method. The alphabet runs in reverse — A becomes Z, B becomes Y."* Kelvin's file also says: *"I mirrored it — the way Hanso's encrypted channel worked."*

### Step 1 — Complete node activation (gate requirement)
```
ACTIVATE 4  →  ACTIVATE 8  →  ACTIVATE 15  →  ACTIVATE 16  →  ACTIVATE 23  →  ACTIVATE 42
```

### Step 2 — Find Kelvin's log
```
WHO
```
At L4+: `KELVIN, V. ... FINAL LOG: READ /LOGS/FINAL-TRANSMISSION.TXT`

### Step 3 — Read the log
```
READ /LOGS/FINAL-TRANSMISSION.TXT
```
Contains: `ENCODED: TFMZMTYU` with notes that it was encoded in two layers.

### Step 4 — Get the Atbash hint
```
SUBNET
```
Open the **SubnetInterface**, switch to the **ALVAR.H [DIRECT]** channel. Read Alvar.H's message about the "mirror cipher."

### Step 5 — Decode
1. ROT-13: `TFMZMTYU` → `GSZMZGLH`
2. Atbash: `GSZMZGLH` → `THANATOS`

### Step 6 — Authenticate
```
AUTHENTICATE THANATOS
```

### Supporting discovery path

**Hatch exterior time gate (IslandMap):**  
IslandMap shows the hatch-exterior marker only when countdown seconds remaining is 6000–6480 (the first 8 minutes of a fresh 108-minute cycle). `PING 418 16342` during this window returns `GUNANGBF — source: V.K. annotation, 2001` with `[ROT-13 cipher]` — this surfaces the ROT-13 layer separately. Sets `dharma_hatch_exterior_pinged = 'true'`.

**BlastDoorMap UV annotation:**  
`GUNANGBF — V.K. 2001` with `[ROT-13 encoded — see final log]` is visible on the UV map (lower right). ROT-13(GUNANGBF) = THANATOS. This is the ROT-13 layer only — the Atbash layer still needs to be discovered from the Alvar channel.

**Breadcrumb (planted early):**  
`THANATOS VENT ACCESS [C-23]` is visible on the UV blast door map. The PearlStationLog (appears after countdown failure at any level) mentions: *"THANATOS event: entity motion detected at outer perimeter."* Seeds the word before players reach L4.

---

## UI Puzzle Components

### IslandMap (`IslandMap.tsx`)

**Access:** Visible at L1+, content expands with clearance  
**Props:** `clearance: number`, `timeRemaining?: number`  
**Location:** Right column of the Home.tsx grid (lg:col-span-1)

**Signal markers:**

| Marker ID | Clearance | Visibility condition | Coordinates |
|-----------|-----------|---------------------|-------------|
| `swan-signal` | L1+ | Always | N 4°815′ W 162°342′ |
| `storm-cache` | L3+ | Weather = storm only | N 23°42′ W 108°15′ |
| `hatch-exterior` | L4+ | Countdown 6000–6480s | N 4°18′ W 16°342′ |

**Moving entity (L2+):**  
A red dot bounces across the map using a 200ms interval. Movement is constrained by `islandBoundary.ts` (`isPointInIsland(x, y)`) — entity reverses with a random new heading when it would leave the island polygon. When it enters zone (x:50–62%, y:32–44%), sets `dharma_entity_tracked = 'true'` and fires a sound. `TRACK` command in terminal then shows the grid fix log.

**Fog of war (`FogOverlay` component):**  
A `<svg>` mask layer above the map image reveals terrain progressively. Reveal zones (ellipses) expand with clearance and entity tracking:

| Zone | Clears when |
|------|-------------|
| Seed (small island hint) | Always |
| Swan area | L1+ |
| Entity zone | `dharma_entity_tracked = 'true'` |
| Black Rock / northeast | L3+ |
| North jungle | L4+ |
| (Full map) | L5+ (fog removed entirely) |

The fog uses animated SVG `feTurbulence` + `feDisplacementMap` filters for a drifting-mist effect.

**Station markers (L5 / devmode):**  
Amber dots for all entries in `MAP_STATIONS` (from `mapCoordinates.ts`). Hover shows station name and DHARMA coordinates. Label uses `s.name` (full station name).

**Weather system:**  
Cycles every 90s through `['clear','clear','fog','clear','rain','clear','storm','clear']`. Writes to `dharma_weather_state`. A separate 2s poll reads it back into React state so the `SETWEATHER` terminal command takes effect immediately. Terminal `PING` also reads this key to decide whether storm coordinates respond.

---

### BlastDoorMap (`BlastDoorMap.tsx`)

**Access:** L3+ only  
**Triggers:**
- Click the DHARMA logo in the header **4 times within 3 seconds**
- Or type `MAP` in the terminal (L3+, sets `dharma_map_access = 'true'`)

**What it is:** Full-screen SVG rendering of the blast door UV map. Cursor acts as a UV flashlight — a radial gradient mask reveals annotations only in the cursor's glow radius.

**UV-revealed annotations:**

| Annotation | Location | Relevance |
|-----------|----------|-----------|
| `EBSL NBUUFS` — first hand | Lower left, rotated −4° | Caesar+1 for DARK MATTER (L3→L4) |
| `EBSL NBUUFS` — second hand | Upper margin, different style | Same cipher, confirms two authors |
| `GUNANGBF — V.K. 2001` | Lower right | ROT-13 for THANATOS; first decode layer hint (L4→L5) |
| `THANATOS VENT ACCESS [C-23]` | Upper left near vent | Entity designation planted early |
| `108` circled | Right-center | Sum of the six values (L2→L3 lore) |
| `PROTOCOL 7-J — SEALED` | Bottom center | Connects to PearlStationLog |
| `R. notation — +1 shift — step back to read` | Top center | Radzinsky cipher hint |
| `INMAN — dead? — final log sealed` | Lower left | Kelvin lore pointer |
| `sys designation: archive ref OVERRIDE-D108` | Center | Hidden command hint |
| `FAILSAFE KEY — MAGNETITE CHAMBER B` | Upper center | Failsafe lore |
| Station coordinate note `N 4°815' W 162°342'` | Center | Swan PING coordinates |

**Implementation:** SVG `<mask>` with `<radialGradient>` centered at cursor coordinates. Mouse position tracked relative to SVG bounding rect and scaled for viewBox. UV layer is `<g mask="url(#uvMask)">`.

---

### SubnetInterface (`SubnetInterface.tsx`)

**Access:** L2+  
**Trigger:** `SUBNET` command sets `dharma_subnet_access = 'true'` → Home.tsx opens overlay

**Channels with puzzle relevance:**

| Channel | Key content |
|---------|-------------|
| GENERAL | Archive info |
| ENGINEERING | Archive code `AH/MDG-932815` |
| ALVAR.H [DIRECT] | **Alvar.H explains the mirror cipher (Atbash hint for L4→L5)** |

`/download` command in the interface: sets `dharma_subnet_complete = 'true'`. Home.tsx `onComplete` callback writes the flag. The download message surfaces Peak 03 = OMEGA and Peak 04 = NU for the L2→L3 puzzle.

**Note:** SUBNET moved from L3+ to L2+ to participate in the L2→L3 four-source puzzle.

---

### PearlStationLog (`PearlStationLog.tsx`)

**Trigger:** Countdown reaches zero → Home.tsx shows printout after 5-second delay  
**No clearance gate** — visible at any level  
**Puzzle relevance:** DHARMA numbers appear as `[4]`, `[8]`, `[15]`, `[16]`, `[23]`, `[42]` in the left margin of specific log lines. Footer note cross-references PING coordinates.

---

### SystemFailure / Implosion (`Terminal.tsx`)

**Trigger:** Countdown reaches zero  
**Reset code:** `4 8 15 16 23 42` entered in the terminal  
**Failsafe:** During the full-screen pixel-noise implosion, type `FAILSAFE` anywhere on the page (global `keydown` listener active while imploded). Sets `dharma_failsafe_activated = 'true'`.  
**Effect levels:**
- Intensity 1+: full-screen scanline overlay (position: fixed, z-index: 9000)
- Intensity 2+: full-screen jitter animation (z-index: 9001)
- Intensity 3: full-screen chromatic aberration SVG filter (z-index: 9002)
- Imploded: full-screen canvas pixel noise (z-index: 9999) with FAILSAFE prompt bar

---

## Content Unlocked Per Level

| Feature | L1 | L2 | L3 | L4 | L5 |
|---------|----|----|----|----|-----|
| `COMMS` command | — | ✓ | ✓ | ✓ | ✓ |
| `DECRYPT` command | — | ✓ | ✓ | ✓ | ✓ |
| `PEARL` command | — | ✓ | ✓ | ✓ | ✓ |
| `TRACK` command | — | ✓ | ✓ | ✓ | ✓ |
| `SUBNET` command / SubnetInterface UI | — | ✓ | ✓ | ✓ | ✓ |
| `OVERRIDE` command | — | — | ✓ | ✓ | ✓ |
| `DIAGNOSE` command | — | — | ✓ | ✓ | ✓ |
| `MAP` command / Blast Door UI | — | — | ✓ | ✓ | ✓ |
| `NODE` command (hidden) | — | — | ✓ | ✓ | ✓ |
| `OVERRIDE-D108` (hidden) | — | — | ✓ | ✓ | ✓ |
| `ACCESS` command | — | — | — | ✓ | ✓ |
| `VALENZETTI` command | — | — | — | ✓ | ✓ |
| `ACTIVATE` command (hidden) | — | — | — | ✓ | ✓ |
| `OMEGA` command | — | — | — | — | ✓ |
| `/LOGS/ROUSSEAU-TRANSMISSION.TXT` | — | ✓ | ✓ | ✓ | ✓ |
| `/LOGS/INCIDENT-CLASSIFIED.TXT` | — | — | ✓ | ✓ | ✓ |
| `/LOGS/FINAL-TRANSMISSION.TXT` | — | — | — | ✓ | ✓ |
| `/FILES/VK-108.TXT` | — | — | — | ✓ | ✓ |
| `/FILES/COORDINATES.TXT` | — | — | — | ✓ | ✓ |
| `/FILES/PALA-FERRY.TXT` | — | — | — | — | ✓ |
| BLAST DOOR UV annotations | — | — | ✓ | ✓ | ✓ |
| RADZINSKY cipher details | — | — | ✓ | ✓ | ✓ |
| WHO — V. Kelvin entry | — | — | — | ✓ | ✓ |
| WHO — Hanso/Candidates | — | — | — | — | ✓ |
| IslandMap swan-signal | ✓ | ✓ | ✓ | ✓ | ✓ |
| IslandMap fog of war (partial reveal) | ✓ | ✓ | ✓ | ✓ | — |
| IslandMap storm-cache | — | — | ✓ | ✓ | ✓ |
| IslandMap hatch-exterior | — | — | — | ✓ | ✓ |
| IslandMap moving entity | — | ✓ | ✓ | ✓ | ✓ |
| IslandMap station markers (amber dots) | — | — | — | — | ✓ |

---

## All LocalStorage Keys

### Clearance & progression

| Key | Type | Purpose |
|-----|------|---------|
| `dharma_clearance_level` | `"1"`–`"5"` | Current clearance level |
| `countdown_start` | timestamp ms | When the countdown began |
| `countdown_was_set` | `"true"` | Countdown was manually set via devmode |

### Puzzle gate flags (must be set before AUTHENTICATE succeeds)

| Key | Set by | Gates |
|-----|--------|-------|
| `dharma_ping_resolved` | `PING 4815 162342` | Part of L1→L2 path |
| `dharma_personal_effects_read` | `READ /FILES/PERSONAL-EFFECTS.TXT` | Required before orientation reel is accessible |
| `dharma_orientation_read` | `READ /DHARMA/ORIENTATION-REEL-3.TXT` | **L1→L2 gate** |
| `dharma_comms_read` | `COMMS` command | Part of L2→L3 (source 1 of 4) |
| `dharma_entity_tracked` | Entity enters target zone on IslandMap | Part of L2→L3 (source 2 of 4) |
| `dharma_subnet_complete` | SubnetInterface `/download` | Part of L2→L3 (source 3 of 4) |
| `dharma_pearl_log_cycled` | `PEARL` command | Part of L2→L3 (source 4 of 4) |
| `dharma_freq_decrypted` | `DECRYPT FREQUENCIES` (all 4 sources present) | **L2→L3 gate** |
| `dharma_map_consulted` | `MAP` command (L3+) | Part of L3→L4 |
| `dharma_radzinsky_read` | `RADZINSKY` command (L3+) | Part of L3→L4 |
| `dharma_decrypt_shift_used` | `DECRYPT SHIFT` command | Part of L3→L4 |
| `dharma_nodes_activated` | `ACTIVATE 4-8-15-16-23-42` | **L4→L5 gate** |

### Overlay trigger flags (polled by Home.tsx every 500ms; cleared after opening)

| Key | Set by | Opens |
|-----|--------|-------|
| `dharma_subnet_access` | `SUBNET` command | SubnetInterface overlay |
| `dharma_map_access` | `MAP` command | BlastDoorMap overlay |
| `dharma_incident_archive` | `INCIDENT ARCHIVE` command | IncidentReports overlay |
| `dharma_failsafe_activated` | `FAILSAFE` typed during implosion | Resets app (handled in poll) |

### Puzzle progress & lore flags

| Key | Set by | Purpose |
|-----|--------|---------|
| `dharma_weather_state` | IslandMap weather cycle / `SETWEATHER` | Read back into React state every 2s; PING storm check |
| `dharma_storm_cache_pinged` | PING storm coords during storm | Lore |
| `dharma_hatch_exterior_pinged` | PING hatch coords in time window | Lore |
| `dharma_node_maze_complete` | NODE C2 reached | Lore |
| `dharma_activation_progress` | ACTIVATE (JSON number array) | Tracks sequence position |
| `dharma_override_used` | OVERRIDE-D108 command | Lore |
| `dharma_failsafe_activated` | FAILSAFE typed during implosion | Resets app |
| `dharma_incident_unlocked` | `DECRYPT INCIDENT` command | Lore |
| `dharma_pearl_access` | Legacy `LOGIN C22/DSTNGSHD-LBRT` | Legacy |
| `dharma_surveillance_active` | `ACCESS pearl-surveillance` | Lore |
| `dharma_lockdown` | `LOCKDOWN` command | Lore |
| `dharma_error_allowed` | `OVERRIDE system-error` | Debug page |
| `dharma_decrypt_shift_used` | `DECRYPT SHIFT` | L3→L4 gate component |

### Dev mode

| Key | Type | Purpose |
|-----|------|---------|
| `dharma_devmode_active` | `"true"` | Dev mode active |
| `dharma_pre_devmode_state` | JSON object | State backup for `devmode-exit` |
| `dharma_unlocked_reports` | JSON number array | Indices of unlocked incident reports |
| `dharma_all_stations` | `"true"` | All stations visible |

---

## All Terminal Commands Reference

### Documented (appear in HELP)

| Command | Available | Description |
|---------|-----------|-------------|
| `HELP` | L1+ | List commands |
| `STATUS` | L1+ | System status (content expands per level) |
| `WHO` | L1+ | Personnel roster (content expands per level) |
| `FILES` | L1+ | List accessible files |
| `READ [path]` | L1+ | Read a file |
| `PING [coords]` | L1+ | No args = connectivity test; with coords = coordinate lookup |
| `INCIDENT` | L1+ | Recent incident log |
| `AUTHENTICATE [word]` | L1+ | Advance clearance level |
| `CLEAR` | L1+ | Clear terminal |
| `EXIT` | L1+ | Suspend session |
| `COMMS` | L2+ | Carrier wave intercept log; sets `dharma_comms_read` (source 1 of 4 for L2→L3) |
| `DECRYPT [key]` | L2+ | Keys: `frequencies`, `shift`, `incident`, `blackrock`, `valenzetti` |
| `PEARL` | L2+ | Pearl Station observation log; sets `dharma_pearl_log_cycled` (source 4 of 4 for L2→L3) |
| `TRACK` | L2+ | Entity sonar log (requires `dharma_entity_tracked`; reveals KAPPA·RHO) |
| `SUBNET` | L2+ | Open SubnetInterface overlay (moved from L3 to L2) |
| `OVERRIDE [param]` | L3+ | System override protocols |
| `DIAGNOSE [target]` | L3+ | Network diagnostics |
| `MAP` | L3+ | Open BlastDoorMap UV overlay |
| `ACCESS [param]` | L4+ | Special access protocols |
| `VALENZETTI` | L4+ | Valenzetti Equation summary |
| `OMEGA` | L5+ | Full classified briefing |

### Hidden commands (not in HELP, must be discovered)

| Command | Clearance | Notes |
|---------|-----------|-------|
| `NODE [id] [key]` | L3+ | Subnet node maze: A1→A4→B3→B7→C2 |
| `ACTIVATE [n]` | L4+ | Node activation: sequence 4-8-15-16-23-42 |
| `OVERRIDE-D108` | L3+ | Found on blast door UV map; returns Caesar+1 archive fragment |
| `RADZINSKY` | L1+ (L3+ full) | Cipher explanation and `dharma_radzinsky_read` flag at L3 |
| `BLAST DOOR` | L1+ (L3+ cipher) | Cipher annotations only at L3+ |
| `DESMOND` | L1+ | Desmond Hume personnel file (lore) |
| `FAILSAFE` | L1+ | Failsafe key lore |
| `SMOKE` / `SMOKEY` | L1+ | Sonar anomaly log |
| `JACOB` | L1+ | Flagged for security review |
| `PENNY` | L1+ | "Not Penny's Boat" |
| `HURLEY` | L1+ | Candidate event (redacted) |
| `HELLO` | L1+ | Ambient |
| `WHY` | L1+ | Ambient |
| `NAMASTE` | L1+ | Greeting |
| `OUTSIDE` / `QUARANTINE` | L1+ | Do not go outside |
| `SOS` | L1+ | External comms blocked |
| `INMAN` | L1+ | J. Inman file |
| `108` | L1+ | Interval lore |
| `PUSH THE BUTTON` | L1+ | Yes |
| `NUMBERS` | L1+ | The numbers are bad |
| `OCEANIC815` | L1+ | Observe, do not engage |
| `THEISLAND` | L1+ | Requires L5 for detail |
| `DANIELLE` | L1+ | Rousseau reference |
| `LOCKDOWN` | L1+ | Engages lockdown protocol |
| `ORIENTATION` | L1+ | Redirects to orientation reel |
| `HANSO` | L1+ | Hanso Foundation lore |
| `WHAT IS YOUR NAME` | L1+ | System identifies itself |
| `MAMA` / `WATCH` | L1+ | Flavor responses |
| `4 8 15 16 23 42` | any | Resets countdown (only works in alarm/protocol state) |
| `INCIDENT ARCHIVE` | any | Opens IncidentReports overlay |
| `DEVMODE` | any | Developer mode |
| `DEVMODE-EXIT` | any | Exit dev mode |
| `SETCOUNTDOWN m s` | devmode only | Set countdown timer |
| `RESETALL` | devmode only | Wipe all localStorage |

### Legacy commands (retained for compatibility)

| Command | Notes |
|---------|-------|
| `LOGIN [pass]` | `4815162342` (L3), `dharma77` (L2), `C22/DSTNGSHD-LBRT` (L4) |
| `EXEC` | `subnet.daemon` fails by design |
| `SCAN` | Returns basic station count |
| `UPLOAD_LOG [station]` | Upload log; 3 needed for transmission.log |
| `PUZZLE [type]` | Direct puzzle launcher |
| `LS [dir]` | Directory listing; `-a` shows hidden files |
| `CAT [path]` | Cat a file |
| `CD [dir]` | Change directory |

---

## Architecture Notes

### Key files

| Concern | File |
|---------|------|
| Clearance state | `client/src/lib/clearance.ts` |
| All terminal commands & puzzle content | `client/src/lib/terminal.ts` |
| Main page, overlay coordination, polling | `client/src/pages/Home.tsx` |
| Terminal UI + clearance badge + glitch effects | `client/src/components/Terminal.tsx` |
| Island map + fog-of-war + entity + markers | `client/src/components/IslandMap.tsx` |
| Island boundary polygon (entity movement) | `client/src/lib/islandBoundary.ts` |
| Station/signal pixel coordinates | `client/src/lib/mapCoordinates.ts` |
| Subnet chat overlay | `client/src/components/SubnetInterface.tsx` |
| Incident reports overlay | `client/src/components/IncidentReports.tsx` |
| Pearl paper printout (post-failure) | `client/src/components/PearlStationLog.tsx` |
| Blast door UV map | `client/src/components/BlastDoorMap.tsx` |
| 108-minute countdown | `client/src/components/Countdown.tsx` |
| System failure overlay | `client/src/components/SystemFailure.tsx` |

### Adding a new puzzle step
1. Add content to `terminal.ts` — new file path in `read()`, new command in `commands` or `hiddenCommands`
2. If it needs an overlay: set a localStorage flag in the terminal command, poll for it in `Home.tsx`, render the component
3. If it gates clearance: check the required localStorage flag inside `authenticate` in `terminal.ts` before calling `setClearance`
4. **Do not add hints to `AUTHENTICATE`** — it intentionally gives no guidance; clues belong in lore content only
5. Update this doc

### Changing puzzle answers
The answer map is at line ~164 in `terminal.ts`:
```typescript
const correct: Record<number, string[]> = {
  1: ['WICKMUND'],
  2: ['KRONOS'],
  3: ['DARK MATTER'],
  4: ['THANATOS'],
};
```
Multiple answers per level are supported: `1: ['WICKMUND', 'ALTERNATE']`.

### Cross-component state flow
- **Terminal → Home:** Sets a localStorage flag; Home.tsx polls every 500ms and opens the relevant overlay
- **IslandMap → Terminal:** Writes `dharma_weather_state` (cycle) and reads it back every 2s; writes `dharma_entity_tracked` when entity hits zone; TRACK reads it
- **SubnetInterface → L2→L3 gate:** `onComplete` callback in Home.tsx writes `dharma_subnet_complete`; DECRYPT FREQUENCIES reads it
- **Countdown → Home → IslandMap:** Countdown fires `onTick(secondsRemaining)`; Home stores `timeRemaining` state; passes it to IslandMap as prop
- **DECRYPT FREQUENCIES → AUTHENTICATE gate:** Sets `dharma_freq_decrypted` when all 4 sources confirmed; AUTHENTICATE at L2 checks for this flag

---

*DHARMA Initiative Computer Systems Division — Swan Station Node SWN-7*  
*Protocol 23 active. Do not leave the station.*
