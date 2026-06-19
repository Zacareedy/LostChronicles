// ─── Island Map Coordinates ───────────────────────────────────────────────────
//
// All positions are CSS percentages relative to the MAP CONTAINER (not the raw image).
// Reference image: attached_assets/island_map_satellite.jpg  (6000 × 4890 px)
// Container aspect ratio: 4:3
//
// Conversion (object-cover crops top/bottom by ~4.3%):
//   ratio  = (4/3) / (6000/4890) = 1.0867
//   offset = (ratio - 1) / 2     = 0.0433
//   left%  = (x / 6000) * 100            (no horizontal crop)
//   top%   = (y / 4890) * ratio * 100 - offset * 100

export interface StationCoord {
  /** Display name shown on hover */
  name: string;
  /** CSS top % relative to map container (accounts for object-cover cropping) */
  top: number;
  /** CSS left % relative to map container */
  left: number;
  /** Source pixel position on the 6000×4890 reference image [x, y] */
  px: [number, number];
  /** In-universe DHARMA coordinates */
  dharmaCoords: string;
  /** Short note about station type / placement */
  note: string;
}

export const MAP_STATIONS: Record<string, StationCoord> = {

  swan: {
    name: 'THE SWAN',
    top: 77.7,
    left: 32.2,
    px: [1930, 3692],
    dharmaCoords: '4° 8′ 15″ N, 16° 23′ 42″ W',
    note: 'Underground EM containment. The button station.',
  },

  tempest: {
    name: 'THE TEMPEST',
    top: 68.3,
    left: 18.6,
    px: [1119, 3269],
    dharmaCoords: '4° 2′ 8″ N, 16° 4′ 15″ W',
    note: 'Chemical weapons facility. Western jungle.',
  },

  pearl: {
    name: 'THE PEARL',
    top: 65.8,
    left: 38.0,
    px: [2282, 3156],
    dharmaCoords: '8° 15′ 16″ N, 23° 42′ 4″ W',
    note: 'Underground observation station. Monitors other stations.',
  },

  staff: {
    name: 'THE STAFF',
    top: 59.2,
    left: 35.3,
    px: [2119, 2857],
    dharmaCoords: '23° 42′ 4″ N, 8° 15′ 16″ W',
    note: 'Medical station. Above-ground structure.',
  },

  lookingGlass: {
    name: 'THE LOOKING GLASS',
    top: 78.2,
    left: 74.7,
    px: [4481, 3712],
    dharmaCoords: '15° 4′ 23″ N, 42° 8′ 16″ W',
    note: 'Underwater station. Controls submarine beacon.',
  },

  hydra: {
    name: 'THE HYDRA',
    top: 46.0,
    left: 88.3,
    px: [5300, 2263],
    dharmaCoords: '42° 8′ 15″ N, 15° 23′ 42″ W',
    note: 'Secondary island to the east. Animal research and holding cells.',
  },

  orchid: {
    name: 'THE ORCHID',
    top: 40.4,
    left: 28.1,
    px: [1688, 2015],
    dharmaCoords: '42° 4′ 8″ N, 15° 16′ 23″ W',
    note: 'Time-travel research station. Cover: botanical research.',
  },

  barracks: {
    name: 'DHARMA BARRACKS',
    top: 32.5,
    left: 41.2,
    px: [2473, 1656],
    dharmaCoords: '23° 16′ 4″ N, 8° 15′ 42″ W',
    note: 'DHARMA Initiative residential compound.',
  },

  flame: {
    name: 'THE FLAME',
    top: 22.4,
    left: 44.1,
    px: [2649, 1202],
    dharmaCoords: '15° 16′ 23″ N, 42° 4′ 8″ W',
    note: 'Communications hub. Northern highlands.',
  },

  arrow: {
    name: 'THE ARROW',
    top: 17.0,
    left: 44.4,
    px: [2664, 960],
    dharmaCoords: '16° 23′ 42″ N, 4° 8′ 15″ W',
    note: 'Storage and defense. Northern area.',
  },

  blackRock: {
    name: 'BLACK ROCK',
    top: 27.1,
    left: 63.9,
    px: [3834, 1414],
    dharmaCoords: '30° 4′ 22″ N, 12° 38′ 17″ W',
    note: 'Stranded 19th-century slave ship. Visible in satellite image.',
  },

};

// ─── IslandMap signal markers (puzzle overlays) ───────────────────────────────
//
// These are the interactive puzzle dots — distinct from the L5 reference markers.
// Positions use the same container-relative percentages as MAP_STATIONS above.
//
// To move a marker: edit top/left here; IslandMap.tsx imports these directly.

export const MAP_SIGNAL_MARKERS = {

  // L1→L2: Swan hatch entrance. Coordinate entry puzzle, always visible at L1+.
  'swan-signal': {
    top: '77.7%',
    left: '32.2%',
    note: 'L1→L2 puzzle. Swan Station hatch entrance.',
  },

  // L3→L4: Storm-only signal anchored to the Black Rock ruins.
  'storm-cache': {
    top: '27.1%',
    left: '63.9%',
    note: 'L3→L4 storm puzzle. Anchored to the visible Black Rock ruins.',
  },

  // L4→L5: Transient signal just west of Swan. Only visible in the first 8 min
  // of a fresh countdown cycle (6000–6480s remaining). Bypassed at L5.
  'hatch-exterior': {
    top: '77.7%',
    left: '30.0%',
    note: 'L4→L5 time gate. Hatch blast door, just west of Swan signal.',
  },

} as const;
