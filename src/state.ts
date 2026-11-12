import { BRANCHES, type Branch, type Kind } from './world';

export interface Character { kind: Kind; nameHu: string; nameRu: string; branch: Branch | null }
export interface State {
  v: 1;
  seed: number;
  city: 'Budapest';
  step: number;
  character: Character | null;
  /** Real Skill COIN per branch: identical start for everyone («Равенство обеспечено»). */
  skill: Record<Branch, number>;
  eur: number;
  krub: number;
  privyazka: number;
  care: number;
  route: 'race' | 'proli' | null;
  dossier: string[];
  lastPlace: number | null;
}
export function newState(seed: number): State {
  const skill = Object.fromEntries(BRANCHES.map(b => [b, 1])) as Record<Branch, number>;
  return { v: 1, seed, city: 'Budapest', step: 0, character: null, skill, eur: 60, krub: 0, privyazka: 0, care: 0, route: null, dossier: [], lastPlace: null };
}
/** What the profile SHOWS. The system advertises inequality and practises equality. */
export function displayedSkill(s: State, b: Branch): number {
  const c = s.character;
  if (!c || c.kind === 'android' || !c.branch) return s.skill[b];
  const own = BRANCHES.indexOf(c.branch);
  if (c.kind === 'woman') return s.skill[b] + (b === c.branch ? 2 : 0);
  const hit = b === c.branch || BRANCHES.indexOf(b) === (own + 1) % BRANCHES.length;
  return s.skill[b] - (hit ? 1 : 0);
}
export function displayedTotal(s: State): number {
  return BRANCHES.reduce((n, b) => n + displayedSkill(s, b), 0);
}
const KEY = 'enro-save-v1';
/** Saves from another format version or with missing fields count as no save. The race RNG is derived from seed + step, so these fields restore it too. */
function compatible(x: unknown): x is State {
  const s = x as Partial<State> | null;
  return !!s && s.v === 1 && typeof s.seed === 'number' && typeof s.step === 'number' && typeof s.eur === 'number' && typeof s.krub === 'number'
    && Array.isArray(s.dossier) && !!s.skill && BRANCHES.every(b => typeof s.skill![b] === 'number');
}
export function save(s: State): void { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } }
export function load(): State | null {
  try { const r = localStorage.getItem(KEY); const s: unknown = r ? JSON.parse(r) : null; return compatible(s) ? s : null; } catch { return null; }
}
export function wipe(): void { try { localStorage.removeItem(KEY); } catch { /* ignore */ } }
