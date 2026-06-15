# LOSTCHRONICLES — DEVELOPER PUZZLE & CLEARANCE GUIDE

> **DEV REFERENCE ONLY** — Contains all puzzle answers, discovery paths, unlock codes, and internal architecture.  
> Last updated: June 2026 — reflects current codebase.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Dev Mode & Quick Testing](#dev-mode--quick-testing)
3. [Clearance Level 1 → 2: "The Dead Operator's Note"](#level-1--2-the-dead-operators-note)
4. [Clearance Level 2 → 3: "The Corrupted Carrier Wave"](#level-2--3-the-corrupted-carrier-wave)
5. [Clearance Level 3 → 4: "Radzinsky's Cipher"](#level-3--4-radzinskys-cipher)
6. [Clearance Level 4 → 5: "The Cerberus Designation"](#level-4--5-the-cerberus-designation)
7. [Content Unlocked Per Level](#content-unlocked-per-level)
8. [Component Triggers & LocalStorage Keys](#component-triggers--localstorage-keys)
9. [All Terminal Commands Reference](#all-terminal-commands-reference)
10. [Architecture Notes](#architecture-notes)

---

## System Overview

The ARG uses a **5-level clearance progression** persisted in `localStorage` under the key `dharma_clearance_level`.

| Level | Label       | Advances Via        |
|-------|-------------|---------------------|
| 1     | VISITOR     | *(starting level)*  |
| 2     | OPERATOR    | `AUTHENTICATE NAMASTE`   |
| 3     | TECHNICIAN  | `AUTHENTICATE 108`       |
| 4     | RESEARCHER  | `AUTHENTICATE VIA DOMUS` |
| 5     | OMEGA       | `AUTHENTICATE CERBERUS`  |

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
The cleanest way to test a specific level without playing through is to open the browser console and run:
```javascript
localStorage.setItem('dharma_clearance_level', '3');
window.dispatchEvent(new CustomEvent('dharma-clearance-change', { detail: { level: 3 } }));
```
No page reload needed.

### Trigger System Failure Immediately
```javascript
localStorage.setItem('countdown_start', (Date.now() - 6480000).toString());
```
This backdates the countdown start by 108 minutes, causing immediate system failure on the next tick.

---

## Level 1 → 2: "The Dead Operator's Note"

**Answer:** `AUTHENTICATE NAMASTE`  
**Cipher:** Morse code (ITU-R standard)  
**Theme:** Finding what the previous operator left behind

### Full Discovery Path

**Step 1 — Find the personal effects**
```
INCIDENT
```
Output includes:
> `CYCLE 10801 — Station handover. Personal effects catalogued.`  
> `File: READ /FILES/PERSONAL-EFFECTS.TXT`

**Step 2 — Read the effects file**
```
READ /FILES/PERSONAL-EFFECTS.TXT
```
Contains Desmond Hume's belongings:
- Notebook page signed "D. Hume" with the numbers `4 8 15 16 23 42`
- Book "Our Mutual Friend" with Penny's inscription
- Stopped watch showing 8:15
- V. Kelvin's note: *"His verification word is encoded in the orientation transcript. Standard maritime signalling format."*

**Step 3 — Read the orientation reel**
```
READ /DHARMA/ORIENTATION-REEL-3.TXT
```
Scroll to Desmond's addendum at the end:
> *"I encoded it myself. Standard maritime dot-dash. Here it is:*  
> `-. .- -- .- ... - .`"*

**Step 4 — Decode the Morse**

| Signal | Letter |
|--------|--------|
| `-. ` | N |
| `.- ` | A |
| `-- ` | M |
| `.- ` | A |
| `... ` | S |
| `- ` | T |
| `. ` | E |

Result: **NAMASTE**

**Step 5 — Authenticate**
```
AUTHENTICATE NAMASTE
```

### Bonus: Desmond Lore
Typing `DESMOND` after finding his effects returns his full personnel file with V. Kelvin's confession about the boat.

---

## Level 2 → 3: "The Corrupted Carrier Wave"

**Answer:** `AUTHENTICATE 108`  
**Cipher:** Arithmetic — sum of six carrier wave frequency values  
**Theme:** Recovering corrupted signal data to find the hidden sum

### Full Discovery Path

**Step 1 — Check the COMMS intercept**
```
COMMS
```
Output shows 6 carrier wave peaks. **Peaks 03 and 04 are corrupted:**
```
PEAK 01: FOUR          [4 MHz]
PEAK 02: EIGHT         [8 MHz]
PEAK 03: [CORRUPTED]   [-- MHz]
PEAK 04: [CORRUPTED]   [-- MHz]
PEAK 05: TWENTY-THREE  [23 MHz]
PEAK 06: FORTY-TWO     [42 MHz]
```
> *"Type DECRYPT FREQUENCIES to attempt data recovery."*

**Step 2 — Recover the corrupted peaks**
```
DECRYPT FREQUENCIES
```
Output:
```
PEAK 03: FIFTEEN   [15 MHz]  ← recovered
PEAK 04: SIXTEEN   [16 MHz]  ← recovered

FULL SEQUENCE RESTORED: 4, 8, 15, 16, 23, 42.
```

**Step 3 — Calculate the sum**

```
4 + 8 + 15 + 16 + 23 + 42 = 108
```

**Step 4 — Authenticate**
```
AUTHENTICATE 108
```

### Cross-reference (optional deeper lore)
```
DECRYPT VALENZETTI
```
Confirms: *"Six core factor values: 4, 8, 15, 16, 23, 42. Their sum: 108."*

### UI Puzzle cross-reference: Radio Receiver
The **RadioReceiver** component (L2+) presents the same six DHARMA numbers as target frequencies (4.8, 8.0, 15.16, 23.42 MHz). Locking all four and then tuning to **108.0 MHz** reveals the Orchid Station transmission — reinforcing 108 as the answer without stating it directly.

---

## Level 3 → 4: "Radzinsky's Cipher"

**Answer:** `AUTHENTICATE VIA DOMUS`  
**Cipher:** Caesar cipher, shift +1 (each letter advanced one position forward)  
**Theme:** Decoding an inscription left by a paranoid operator

### Cipher Key

Radzinsky encoded every personal annotation by shifting each letter **+1 forward** in the alphabet:

```
A→B  B→C  C→D  D→E  E→F  F→G  G→H  H→I  I→J  J→K  K→L  L→M
M→N  N→O  O→P  P→Q  Q→R  R→S  S→T  T→U  U→V  V→W  W→X  X→Y  Y→Z  Z→A
```

To **decode**, shift each letter **−1 backward**:
```
W→V  J→I  B→A  E→D  P→O  N→M  V→U  T→S
```
`WJB EPNVT` → **VIA DOMUS**

### Full Discovery Path

**Step 1 — View the blast door**
```
BLAST DOOR
```
At L3+ shows additional annotations:
```
— "WJB EPNVT"    (first hand — lower left)
— "WJB EPNVT"    (second hand — upper margin, different writer)

The same phrase appears twice, written by two different people.
The text appears shifted. Type RADZINSKY for context on the encoding.
Type DECRYPT SHIFT for cipher analysis.
```

**Step 2 — Learn Radzinsky's encoding habit**
```
RADZINSKY
```
Output at L3+:
> *"Known notation habit: Radzinsky encrypted personal writings using a simple letter-shift — each letter advanced one position forward in the alphabet. He called it 'staying one step ahead.'"*  
> *V. Kelvin: "He was paranoid. Even his annotations on the blast door were shifted. I could read them, obviously."*  
> *Final recovered message: "Find it. Step back. The way home."*

**Step 3 — Get guided decoding help (optional)**
```
DECRYPT SHIFT
```
Output:
```
Pattern identified: Caesar cipher, constant shift.
Radzinsky's known habit: +1 letter shift (A→B, B→C...)
To decode blast door text: subtract 1 from each letter.
Example: W→V, J→I, B→A   (first three letters of inscription)
```

**Step 4 — Decode manually**

```
W J B   E P N V T
↓ ↓ ↓   ↓ ↓ ↓ ↓ ↓
V I A   D O M U S
```

**Step 5 — Authenticate**
```
AUTHENTICATE VIA DOMUS
```
*(Note: the space is required — VIA DOMUS as two words)*

### UI Puzzle cross-reference: Blast Door Map
The **BlastDoorMap** component (L3+, UV-reveal) shows `WJB EPNVT` written twice in different handwriting styles — exactly as the terminal `BLAST DOOR` command describes. Players who find the map before using the terminal get the visual before the textual clue.

---

## Level 4 → 5: "The Cerberus Designation"

**Answer:** `AUTHENTICATE CERBERUS`  
**Theme:** Finding DHARMA's internal name for the smoke monster

There are **two convergent paths** to this answer.

---

### Path A — Kelvin's Final Log (Shorter)

**Step 1 — Check the personnel roster**
```
WHO
```
At L4+ shows:
```
KELVIN, V.  ............  RADIO OPERATOR — STATUS: UNKNOWN
                          FINAL LOG: READ /LOGS/FINAL-TRANSMISSION.TXT
```

**Step 2 — Read Kelvin's final entry**
```
READ /LOGS/FINAL-TRANSMISSION.TXT
```
Contains:
```
CIPHER TYPE: ROT-13
ENCODED:     PREOREHF
```

**Step 3 — Decode ROT-13**

ROT-13 shifts each letter 13 positions (A↔N, B↔O, C↔P...):

| Encoded | P | R | E | O | E | R | H | F |
|---------|---|---|---|---|---|---|---|---|
| Decoded | C | E | R | B | E | R | U | S |

Result: **CERBERUS**

**Step 4 — Authenticate**
```
AUTHENTICATE CERBERUS
```

---

### Path B — Subnet / Archive Chain (Longer, Full Lore)

**Step 1 — Open the DHARMA subnet**
```
SUBNET
```
Opens the **SubnetInterface** overlay (requires L3+).

**Step 2 — Find the archive access code**

In the SubnetInterface, switch to the **ENGINEERING** channel.  
Look for the system message at the bottom:
> `NOTE: To access classified archive documents, use access code AH/MDG-932815 on the incident archive terminal.`

**Step 3 — Open the incident archive**

Either:
- Type `INCIDENT ARCHIVE` in the terminal, OR
- It will already be accessible from prior navigation

In the **IncidentReports** overlay, enter the access code:
```
AH/MDG-932815
```
This unlocks **"THE INCIDENT — 1977"** (Report 0).

**Step 4 — Read The Incident 1977**

At the bottom of the report:
> `NOTE: Pearl surveillance footage from incident day references code sequence OVERRIDE-D108. Cross-reference System Failure Log.`

**Step 5 — Download subnet logs**

Back in SubnetInterface, type `/download` in the chat input.  
After ~3 seconds:
> `NOTICE: Critical data recovered. Access code OVERRIDE-D108 extracted from logs.`

**Step 6 — Unlock the System Failure Log**

In the IncidentReports overlay, enter:
```
OVERRIDE-D108
```
Unlocks **"SYSTEM FAILURE LOG — 1984"** (Report 2).

**Step 7 — Read the System Failure Log**

Under POST-FAILURE PROTOCOL:
```
— Fail-safe mechanism installed (AUTHORISED BY: ALVAR HANSO)
— Fail-safe system designation: CERBERUS (classified — Protocol 7-J)
```

Also in the SECURITY ADDENDUM:
> `To advance clearance: AUTHENTICATE [entity designation].`

**Step 8 — Authenticate**
```
AUTHENTICATE CERBERUS
```

---

### Breadcrumb (planted early, cross-level)

The **PearlStationLog** (paper printout appearing ~5 seconds after countdown failure, even at L1) always includes:
```
CERBERUS event: entity motion detected at outer perimeter during failure window.
Observation sealed per Protocol 7-J (Radzinsky).
```
This seeds the word `CERBERUS` early. Players who reach L4 will recognize it.

### UI Puzzle cross-references: both components
- **BlastDoorMap** (L3+) includes UV-revealed annotation: `PREOREHF — V.K. 2001` near the lower-right corner. Players who decode the ROT-13 independently arrive at CERBERUS before finding either formal path.
- **RadioReceiver** (L2+, Orchid transmission at 108.0 MHz) states: *"Entity designation CERBERUS confirmed active. The name is the key."*

---

## UI Puzzles (Non-Terminal)

These two components are triggered **outside** the terminal — either through hidden click interactions or via terminal commands that launch them as overlays.

---

### Blast Door Map (`BlastDoorMap.tsx`)

**Access:** L3+ only  
**Triggers:**
- Click the DHARMA logo in the header **4 times within 3 seconds**
- Or type `MAP` in the terminal (L3+)

**What it is:** A full-screen SVG rendering of the blast door. Under normal light nothing is legible. Moving the cursor acts as a UV flashlight — a radial gradient mask reveals hidden annotations only in the cursor's glow radius.

**What it reveals (UV layer):**

| Annotation | Location | Relevance |
|-----------|----------|-----------|
| `WJB EPNVT` — first hand | Lower left, rotated −4° | Caesar cipher for VIA DOMUS (L3→L4) |
| `WJB EPNVT` — second hand | Upper margin, different style | Same cipher, confirms two authors |
| `PREOREHF — V.K. 2001` | Lower right | ROT-13 for CERBERUS, Kelvin's initials (L4→L5) |
| `CERBERUS VENT ACCESS [C-23]` | Upper left near vent | Smoke monster designation planted early |
| `108` circled | Right-center | The sequence sum (L2→L3) |
| `PROTOCOL 7-J — SEALED` | Bottom center | Connects to PearlStationLog and Incident reports |
| `R. notation — +1 shift — step back to read` | Top center | Radzinsky cipher hint |
| `INMAN — dead? — final log sealed` | Lower left | Kelvin lore pointer |
| `sys designation: archive ref OVERRIDE-D108` | Below SWAN hex | Subnet/archive chain hint |

**Implementation:** SVG `<mask>` with a `<radialGradient>` centered at cursor coordinates. Mouse position is tracked relative to the SVG bounding rect and scaled for viewBox. The UV layer is a `<g mask="url(#uvMask)">` containing all annotation text.

---

### Radio Receiver (`RadioReceiver.tsx`)

**Access:** L2+ only  
**Triggers:**
- Click the countdown display **6 times within 4 seconds**
- Or type `RADIO` in the terminal (L2+)

**What it is:** A retro DHARMA multi-band field receiver. Players drag the tuning knob (or use ◄/► fine-tune buttons) to sweep frequencies. Signal strength bars animate when near a target frequency. A LOCK FREQUENCY button captures a frequency when within ±0.35 MHz.

**Target frequencies and their transmissions:**

| Frequency | Station | Transmission content |
|-----------|---------|---------------------|
| 4.8 MHz | Arrow | Archaeological survey data; temporal anomaly readings |
| 8.0 MHz | Flame | Communications relay offline; manual routing |
| 15.16 MHz | Pearl | Observation log cycle 108; Swan operator anomalous |
| 23.42 MHz | Hydra | Zoological specimens stable; perimeter event; "see Protocol 7-J" |
| **108.0 MHz** | Orchid (unlocks after all 4 locked) | **CERBERUS** named as entity designation; Protocol 7-J activation instructions |

**Unlock sequence:**
1. Lock all four station frequencies in any order
2. `108.00 MHz` appears in the locked channels panel as `???`
3. Tune to 108.0 MHz — transmission auto-displays with CERBERUS named explicitly

**Implementation:** `useRef` for drag state (avoids stale closures in mousemove handler). `useEffect` watches `freq` + `allLocked` to trigger the 108 unlock. Frequency is stored as a `number` rounded to 2 decimal places.

---

## Content Unlocked Per Level

| Feature | L1 | L2 | L3 | L4 | L5 |
|---------|----|----|----|----|-----|
| `COMMS` command | — | ✓ | ✓ | ✓ | ✓ |
| `DECRYPT` command | — | ✓ | ✓ | ✓ | ✓ |
| `RADIO` command / Receiver UI | — | ✓ | ✓ | ✓ | ✓ |
| `OVERRIDE` command | — | — | ✓ | ✓ | ✓ |
| `DIAGNOSE` command | — | — | ✓ | ✓ | ✓ |
| `SUBNET` command | — | — | ✓ | ✓ | ✓ |
| `MAP` command / Blast Door UI | — | — | ✓ | ✓ | ✓ |
| `ACCESS` command | — | — | — | ✓ | ✓ |
| `VALENZETTI` command | — | — | — | ✓ | ✓ |
| `OMEGA` command | — | — | — | — | ✓ |
| `/LOGS/ROUSSEAU-TRANSMISSION.TXT` | — | ✓ | ✓ | ✓ | ✓ |
| `/LOGS/INCIDENT-CLASSIFIED.TXT` | — | — | ✓ | ✓ | ✓ |
| `/LOGS/FINAL-TRANSMISSION.TXT` | — | — | — | ✓ | ✓ |
| `/FILES/VK-108.TXT` | — | — | — | ✓ | ✓ |
| `/FILES/COORDINATES.TXT` | — | — | — | ✓ | ✓ |
| `/FILES/PALA-FERRY.TXT` | — | — | — | — | ✓ |
| BLAST DOOR annotations | basic | basic | **+cipher** | +cipher | +cipher |
| RADZINSKY file | basic | basic | **+cipher** | +cipher | +cipher |
| WHO — V. Kelvin entry | — | — | — | ✓ | ✓ |
| WHO — Hanso/Candidates | — | — | — | — | ✓ |
| PING — station names | [REDACTED] | [REDACTED] | [REDACTED] | [REDACTED] | **revealed** |
| IncidentReports report 1 | ✓ | ✓ | ✓ | ✓ | ✓ |
| IncidentReports report 0 | locked | locked | locked | **code AH/MDG-932815** | ✓ |
| IncidentReports report 2 | locked | locked | locked | **code OVERRIDE-D108** | ✓ |

---

## Component Triggers & LocalStorage Keys

### SubnetInterface
- **Trigger:** `SUBNET` terminal command (L3+) sets `dharma_subnet_access = 'true'`
- **Poll:** Home.tsx polls every 500ms; opens `<SubnetInterface>` and clears the flag
- **Completion:** `/download` in SubnetInterface fires `onComplete` → sets `dharma_subnet_complete = 'true'`

### IncidentReports
- **Trigger:** `INCIDENT ARCHIVE` terminal command sets `dharma_incident_archive = 'true'`
- **Poll:** Home.tsx polls every 500ms; opens `<IncidentReports>` and clears the flag
- **Access codes:**
  - `AH/MDG-932815` → unlocks Report 0 (The Incident 1977)
  - `OVERRIDE-D108` → unlocks Report 2 (System Failure Log 1984)
- **Persistence:** Unlocked reports saved to `dharma_unlocked_reports` (JSON array of indices)

### BlastDoorMap
- **Trigger (UI):** Click DHARMA logo in header 4× within 3 seconds (clearance ≥ 3 required)
- **Trigger (terminal):** `MAP` command (L3+) sets `dharma_map_access = 'true'`
- **Poll:** Home.tsx polls every 500ms; opens `<BlastDoorMap>` and clears the flag
- **No completion state** — purely exploratory; annotations are clues only

### RadioReceiver
- **Trigger (UI):** Click countdown display 6× within 4 seconds (clearance ≥ 2 required)
- **Trigger (terminal):** `RADIO` command (L2+) sets `dharma_radio_access = 'true'`
- **Poll:** Home.tsx polls every 500ms; opens `<RadioReceiver>` and clears the flag
- **Unlock condition:** Lock all 4 frequencies (4.8, 8.0, 15.16, 23.42 MHz), then tune to 108.0 MHz
- **No localStorage persistence** — receiver state resets on close (by design — players can re-explore)

### PearlStationLog
- **Trigger:** Countdown reaches zero → `handleCountdownFinish()` in Home.tsx → sets `showPearlLog = true` after 5-second delay
- **Reset:** Cleared by `handleCorrectSequence()` (numbers entered) or `handleSystemReset()`
- **No clearance gate** — visible at any level

### SystemFailure
- **Trigger:** Same as PearlStationLog — countdown hits zero
- **Reset code:** Type `4 8 15 16 23 42` in the terminal (works even during failure overlay)

### Clearance Event
```typescript
// Fired by setClearance() in clearance.ts
window.dispatchEvent(new CustomEvent('dharma-clearance-change', { detail: { level: n } }));
```
Listened to by:
- `Terminal.tsx` — updates badge, shows upgrade flash
- `Home.tsx` — updates header SECURITY LEVEL and footer clearance label

### All LocalStorage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `dharma_clearance_level` | `"1"–"5"` | Current clearance level |
| `dharma_incident_archive` | `"true"` | Flag to open IncidentReports overlay |
| `dharma_subnet_access` | `"true"` | Flag to open SubnetInterface overlay |
| `dharma_subnet_complete` | `"true"` | Subnet `/download` completed |
| `dharma_map_access` | `"true"` | Flag to open BlastDoorMap overlay |
| `dharma_radio_access` | `"true"` | Flag to open RadioReceiver overlay |
| `dharma_unlocked_reports` | JSON array | Indices of unlocked incident reports |
| `dharma_devmode_active` | `"true"` | Dev mode active |
| `dharma_pre_devmode_state` | JSON object | State backup for `devmode-exit` |
| `dharma_surveillance_active` | `"true"` | Pearl surveillance activated |
| `dharma_lockdown` | `"active"` | Lockdown protocol engaged |
| `dharma_error_allowed` | `"true"` | Debug interface accessible |
| `dharma_incident_unlocked` | `"true"` | Set by `DECRYPT INCIDENT` |
| `dharma_pearl_access` | `"true"` | Set by legacy `LOGIN C22/DSTNGSHD-LBRT` |
| `dharma_all_stations` | `"true"` | All stations visible |
| `countdown_start` | timestamp ms | When the countdown began |
| `countdown_was_set` | `"true"` | Countdown was manually set via devmode |

---

## All Terminal Commands Reference

### HELP (always visible)

| Command | Available | Description |
|---------|-----------|-------------|
| `HELP` | L1+ | List commands |
| `STATUS` | L1+ | System status (content expands per level) |
| `WHO` | L1+ | Personnel roster (content expands per level) |
| `FILES` | L1+ | List accessible files |
| `READ [path]` | L1+ | Read a file |
| `PING` | L1+ | Test intranet connectivity (stations redacted below L5) |
| `INCIDENT` | L1+ | Recent incident log |
| `AUTHENTICATE [word]` | L1+ | Advance clearance level |
| `CLEAR` | L1+ | Clear terminal |
| `EXIT` | L1+ | Suspend session |
| `COMMS` | L2+ | Radio intercept log (peaks 3-4 corrupted) |
| `DECRYPT [key]` | L2+ | Decrypt data (keys: frequencies, shift, incident, blackrock, valenzetti) |
| `RADIO` | L2+ | Open RadioReceiver overlay (sets `dharma_radio_access`) |
| `OVERRIDE [param]` | L3+ | System override protocols |
| `DIAGNOSE [target]` | L3+ | Network diagnostics |
| `SUBNET` | L3+ | Open DHARMA subnet interface |
| `MAP` | L3+ | Open BlastDoorMap UV overlay (sets `dharma_map_access`) |
| `ACCESS [param]` | L4+ | Special access protocols |
| `VALENZETTI` | L4+ | Valenzetti Equation summary |
| `OMEGA` | L5+ | Full classified briefing |

### Hidden Commands (not in HELP, must be discovered)

| Command | Clearance | Notes |
|---------|-----------|-------|
| `DESMOND` | L1+ | Desmond Hume personnel file (lore) |
| `HELLO` | L1+ | Ambient response |
| `WHY` | L1+ | Ambient response |
| `NAMASTE` | L1+ | Greeting response |
| `OUTSIDE` | L1+ | Do not go outside |
| `QUARANTINE` | L1+ | Quarantine lore |
| `FAILSAFE` | L1+ | Failsafe key info |
| `SMOKE` / `SMOKEY` | L1+ | Sonar anomaly log |
| `JACOB` | L1+ | Flagged for security |
| `PENNY` | L1+ | "Not Penny's Boat" log |
| `HURLEY` | L1+ | Candidate event (redacted) |
| `RADZINSKY` | L1+ (L3+ full) | Cipher explanation unlocks at L3 |
| `SOS` | L1+ | External comms blocked |
| `INMAN` | L1+ | J. Inman file |
| `108` | L1+ | Interval lore |
| `PUSH THE BUTTON` | L1+ | Yes |
| `BLAST DOOR` | L1+ (L3+ cipher) | Cipher annotations unlock at L3 |
| `NUMBERS` | L1+ | The numbers are bad |
| `OCEANIC815` | L1+ | Observe, do not engage |
| `THEISLAND` | L1+ | Requires L5 for detail |
| `DANIELLE` | L1+ | Rousseau reference |
| `LOCKDOWN` | L1+ | Engages lockdown protocol |
| `ORIENTATION` | L1+ | Redirects to orientation reel |
| `HANSO` | L1+ | Hanso Foundation lore |
| `WHAT IS YOUR NAME` | L1+ | System identifies itself |
| `MAMA` | L1+ | Not a record player |
| `WATCH` | L1+ | The island is watching |
| `RADIO.LISTEN(freq)` | L2+ | Tune to frequency (needs transmission log first) |
| `4 8 15 16 23 42` | any | Resets countdown if in protocol mode |
| `INCIDENT ARCHIVE` | any | Opens IncidentReports overlay |
| `DEVMODE` | any | Developer mode (L5 + all flags) |
| `DEVMODE-EXIT` | any | Exit dev mode, restore state |
| `SETCOUNTDOWN m s` | devmode | Set countdown timer |

### Legacy Commands (retained for compatibility)

| Command | Notes |
|---------|-------|
| `LOGIN [pass]` | Accepts: `4815162342` (L3), `dharma77` (L2), `C22/DSTNGSHD-LBRT` (L4) |
| `EXEC [param]` | `subnet.daemon` fails by design; used in old puzzle path |
| `SCAN` | Returns basic station count |
| `UPLOAD_LOG [station]` | Upload station log, 3 needed for transmission.log |
| `PUZZLE [type]` | Direct puzzle launcher |
| `LS [dir]` | Directory listing; `-a` shows hidden files |
| `CAT [path]` | Cat a file; triggers puzzle via `/mnt/.dharmanet/init_socket.sh` |
| `CD [dir]` | Change directory |

---

## Architecture Notes

### File locations

| Concern | File |
|---------|------|
| Clearance state | `client/src/lib/clearance.ts` |
| All terminal commands & puzzle content | `client/src/lib/terminal.ts` |
| Main page, overlay coordination | `client/src/pages/Home.tsx` |
| Terminal UI + clearance badge | `client/src/components/Terminal.tsx` |
| Subnet chat overlay | `client/src/components/SubnetInterface.tsx` |
| Incident reports overlay | `client/src/components/IncidentReports.tsx` |
| Pearl paper printout | `client/src/components/PearlStationLog.tsx` |
| Blast door UV map | `client/src/components/BlastDoorMap.tsx` |
| Radio frequency receiver | `client/src/components/RadioReceiver.tsx` |
| 108-minute countdown | `client/src/components/Countdown.tsx` |
| System failure state | `client/src/components/SystemFailure.tsx` |

### Adding a new puzzle step
1. Add content to `terminal.ts` — new file path in `read()`, new command in `commands` or `hiddenCommands`
2. If it needs an overlay: set a localStorage flag in the terminal command, poll for it in `Home.tsx`, render the component
3. If it gates content by clearance: call `getClearance()` inside the handler, return `deny(n)` if too low
4. **Do not add hints to `AUTHENTICATE`** — it intentionally gives no guidance; clues belong in lore content only
5. Update this doc

### Changing puzzle answers
The answer map is at line ~156 in `terminal.ts`:
```typescript
const correct: Record<number, string[]> = {
  1: ['NAMASTE'],
  2: ['108'],
  3: ['VIA DOMUS'],
  4: ['CERBERUS'],
};
```
Multiple answers per level are supported: `1: ['NAMASTE', 'ALTERNATE']`.

---

*DHARMA Initiative Computer Systems Division — Swan Station Node SWN-7*  
*Protocol 23 active. Do not leave the station.*
