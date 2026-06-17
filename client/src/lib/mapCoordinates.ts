// ─── Island Map Coordinates ───────────────────────────────────────────────────
//
// All positions are percentages of the image dimensions (top, left as CSS %).
// Reference image: attached_assets/island_map_satellite.jpg
// Image dimensions: 6000 × 4890 px
//
// To update: open the image, note pixel position (x, y), then:
//   left = (x / 6000) * 100,  top = (y / 4890) * 100

export interface StationCoord {
  /** Display name shown on hover */
  name: string;
  /** CSS top percentage (0–100) */
  top: number;
  /** CSS left percentage (0–100) */
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
    top: 75.5,
    left: 32.2,
    px: [1930, 3692],
    dharmaCoords: '4° 8′ 15″ N, 16° 23′ 42″ W',
    note: 'Underground EM containment. The button station.',
  },

  tempest: {
    name: 'THE TEMPEST',
    top: 66.9,
    left: 18.6,
    px: [1119, 3269],
    dharmaCoords: '4° 2′ 8″ N, 16° 4′ 15″ W',
    note: 'Chemical weapons facility. Western jungle.',
  },

  pearl: {
    name: 'THE PEARL',
    top: 64.5,
    left: 38.0,
    px: [2282, 3156],
    dharmaCoords: '8° 15′ 16″ N, 23° 42′ 4″ W',
    note: 'Underground observation station. Monitors other stations.',
  },

  staff: {
    name: 'THE STAFF',
    top: 58.4,
    left: 35.3,
    px: [2119, 2857],
    dharmaCoords: '23° 42′ 4″ N, 8° 15′ 16″ W',
    note: 'Medical station. Above-ground structure.',
  },

  lookingGlass: {
    name: 'THE LOOKING GLASS',
    top: 75.9,
    left: 74.7,
    px: [4481, 3712],
    dharmaCoords: '15° 4′ 23″ N, 42° 8′ 16″ W',
    note: 'Underwater station. Controls submarine beacon.',
  },

  hydra: {
    name: 'THE HYDRA',
    top: 46.3,
    left: 88.3,
    px: [5300, 2263],
    dharmaCoords: '42° 8′ 15″ N, 15° 23′ 42″ W',
    note: 'Secondary island to the east. Animal research and holding cells.',
  },

  orchid: {
    name: 'THE ORCHID',
    top: 41.2,
    left: 28.1,
    px: [1688, 2015],
    dharmaCoords: '42° 4′ 8″ N, 15° 16′ 23″ W',
    note: 'Time-travel research station. Cover: botanical research.',
  },

  barracks: {
    name: 'DHARMA BARRACKS',
    top: 33.9,
    left: 41.2,
    px: [2473, 1656],
    dharmaCoords: '23° 16′ 4″ N, 8° 15′ 42″ W',
    note: 'DHARMA Initiative residential compound.',
  },

  flame: {
    name: 'THE FLAME',
    top: 24.6,
    left: 44.1,
    px: [2649, 1202],
    dharmaCoords: '15° 16′ 23″ N, 42° 4′ 8″ W',
    note: 'Communications hub. Northern highlands.',
  },

  arrow: {
    name: 'THE ARROW',
    top: 19.6,
    left: 44.4,
    px: [2664, 960],
    dharmaCoords: '16° 23′ 42″ N, 4° 8′ 15″ W',
    note: 'Storage and defense. Northern area.',
  },

  blackRock: {
    name: 'BLACK ROCK',
    top: 28.9,
    left: 63.9,
    px: [3834, 1414],
    dharmaCoords: '30° 4′ 22″ N, 12° 38′ 17″ W',
    note: 'Stranded 19th-century slave ship. Visible in satellite image.',
  },

};

// ─── IslandMap signal markers (used by IslandMap.tsx for puzzle overlays) ────
//
// Positions are anchored to *visible* landmarks on the satellite image so the
// dot always sits on something identifiable — players can correlate what they
// see on screen with the coordinate they enter in the terminal.
//
// To move a marker: adjust top/left here; IslandMap.tsx reads these values.

export const MAP_SIGNAL_MARKERS = {

  // Swan Station hatch entrance. L1→L2 puzzle, always visible.
  'swan-signal': {
    top: '75.5%',
    left: '32.2%',
    note: 'L1→L2. Swan Station hatch entrance.',
  },

  // Black Rock shipwreck — ruins clearly visible in the upper-right jungle. L3→L4 storm puzzle.
  'storm-cache': {
    top: '28.9%',
    left: '63.9%',
    note: 'L3→L4 storm puzzle. Anchored to the visible Black Rock ruins.',
  },

  // Hatch exterior — just west of Swan, above the underground section. L4→L5 time gate.
  'hatch-exterior': {
    top: '77%',
    left: '30%',
    note: 'L4→L5 time gate. Hatch blast door, just west of Swan signal.',
  },

} as const;
