// ─── Island Map Coordinates ───────────────────────────────────────────────────
//
// All positions are percentages of the image dimensions (top, left as CSS %).
// Reference image: attached_assets/island_map_satellite.jpeg
// Approximate image dimensions: 1190 × 985 px
//
// Methodology:
//   - Black Rock and Hydra Island are directly visible in the satellite image.
//   - Volcanic/smoke feature visible lower-center-left → used for Orchid placement.
//   - Eastern sandy beach visible → used for Staff placement.
//   - All underground stations (Swan, Pearl, Flame, Arrow) are estimated from
//     LOST episode geography relative to the visible landmarks.
//
// To update: open the image at 100% in any viewer, note pixel position X,Y,
// then: left = (X / imageWidth) * 100, top = (Y / imageHeight) * 100

export interface StationCoord {
  /** CSS top percentage (0–100) */
  top: number;
  /** CSS left percentage (0–100) */
  left: number;
  /** Approximate pixel position on the reference image [x, y] */
  px: [number, number];
  /** In-universe DHARMA coordinates */
  dharmaCoords: string;
  /** Short note about placement method or lore anchor */
  note: string;
}

export const MAP_STATIONS: Record<string, StationCoord> = {

  // ── Directly visible in the satellite image ──────────────────────────────

  blackRock: {
    top: 28.9,
    left: 63.9,
    px: [760, 285],
    dharmaCoords: '30° 4′ 22″ N, 12° 38′ 17″ W',
    note: 'Visible as orange/red ruins in upper-right jungle interior. Stranded ship.',
  },

  hydra: {
    top: 41.1,
    left: 83.6,
    px: [995, 405],
    dharmaCoords: '42° 8′ 15″ N, 15° 23′ 42″ W',
    note: 'Small island clearly visible to the east. Center of the island mass.',
  },

  // ── Estimated from visible geographic features ────────────────────────────

  orchid: {
    top: 69.0,
    left: 37.5,
    px: [446, 679],
    dharmaCoords: '42° 4′ 8″ N, 15° 16′ 23″ W',
    note: 'Near volcanic smoke feature visible lower-center-left. Underground.',
  },

  staff: {
    top: 57.4,
    left: 61.4,
    px: [730, 565],
    dharmaCoords: '23° 42′ 4″ N, 8° 15′ 16″ W',
    note: 'Near eastern sandy beach/coast visible mid-right. Medical station.',
  },

  // ── Estimated from LOST episode geography ────────────────────────────────

  swan: {
    top: 54.0,
    left: 39.5,
    px: [470, 532],
    dharmaCoords: '4° 8′ 15″ N, 16° 23′ 42″ W',
    note: 'Central-interior, slightly west of center. Underground EM containment.',
  },

  pearl: {
    top: 50.5,
    left: 44.2,
    px: [526, 497],
    dharmaCoords: '8° 15′ 16″ N, 23° 42′ 4″ W',
    note: '~1.5km northeast of Swan. Underground observation station.',
  },

  flame: {
    top: 20.3,
    left: 51.8,
    px: [616, 200],
    dharmaCoords: '15° 16′ 23″ N, 42° 4′ 8″ W',
    note: 'Northern highlands. Above-ground communications building.',
  },

  arrow: {
    top: 38.1,
    left: 20.4,
    px: [243, 375],
    dharmaCoords: '16° 23′ 42″ N, 4° 8′ 15″ W',
    note: 'Western caves/cliffs area. Storage and defense.',
  },

  lookout: {
    top: 17.5,
    left: 44.0,
    px: [524, 172],
    dharmaCoords: '23° 15′ 4″ N, 8° 42′ 16″ W',
    note: 'Northern peak — radio tower visible from most of the island.',
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

  // Swan Station hatch entrance — central-west interior jungle.
  // No surface structure visible, but the terrain depression at this location
  // is the reference point. L1→L2 puzzle, always visible.
  'swan-signal': {
    top: '54%',
    left: '39.5%',
    note: 'L1→L2. At Swan Station hatch entrance, central-west interior.',
  },

  // Black Rock shipwreck — the orange/red ruins clearly visible in the
  // upper-right jungle interior. L3→L4 storm puzzle.
  'storm-cache': {
    top: '28.9%',
    left: '63.9%',
    note: 'L3→L4 storm puzzle. Anchored to the visible Black Rock ruins (upper-right interior).',
  },

  // Hatch exterior — just west of Swan signal, representing the blast
  // door surface above the Swan underground section. L4→L5 time gate.
  'hatch-exterior': {
    top: '56%',
    left: '36%',
    note: 'L4→L5 time gate. Hatch blast door, just west of Swan signal.',
  },

} as const;
