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
export function save(s: State): void { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } }
export function load(): State | null {
  try { const r = localStorage.getItem(KEY); return r ? (JSON.parse(r) as State) : null; } catch { return null; }
}
export function wipe(): void { try { localStorage.removeItem(KEY); } catch { /* ignore */ } }
