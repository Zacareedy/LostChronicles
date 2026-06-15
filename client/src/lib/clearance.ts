export const CLEARANCE_LABELS = ['', 'VISITOR', 'OPERATOR', 'TECHNICIAN', 'RESEARCHER', 'OMEGA'] as const;

const CL_KEY = 'dharma_clearance_level';

export function getClearance(): number {
  try { return Math.min(5, Math.max(1, parseInt(localStorage.getItem(CL_KEY) || '1', 10) || 1)); }
  catch { return 1; }
}

export function setClearance(level: number): void {
  try {
    const n = Math.min(5, Math.max(1, level));
    localStorage.setItem(CL_KEY, n.toString());
    window.dispatchEvent(new CustomEvent('dharma-clearance-change', { detail: { level: n } }));
  } catch {}
}

export function clearanceLabel(level?: number): string {
  return CLEARANCE_LABELS[level ?? getClearance()] || 'VISITOR';
}
