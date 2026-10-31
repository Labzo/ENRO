import { rng } from './rng';

export interface Car { id: string; label: string; player: boolean; finish: number }
export interface RaceResult { cars: Car[]; order: string[]; doorAt: number | null; playerPlace: number }

/**
 * Generates one race from a seed. Rules from the world bible:
 * - a bot always wins ("the cheater always wins");
 * - whoever stays sober ends in the top 3 (and the torpedo turns to them);
 * - vodka makes the result random.
 */
export function generateRace(seed: number, sober: boolean, laps: number): RaceResult {
  const r = rng(seed);
  const bots = ['07', '13', '21', '44'];
  let playerPlace = sober ? 2 + Math.floor(r() * 2) : 3 + Math.floor(r() * 3);
  playerPlace = Math.min(5, Math.max(2, playerPlace));
  const shuffled = [...bots].sort(() => r() - 0.5);
  const order: string[] = [];
  let bi = 0;
  for (let place = 1; place <= 5; place++) order.push(place === playerPlace ? 'P' : shuffled[bi++]);
  const base = 9 + laps * 5;
  const cars: Car[] = order.map((id, i) => ({
    id, label: id === 'P' ? '01' : id, player: id === 'P', finish: base + i * (0.6 + r() * 0.5),
  }));
  const doorAt = r() < 0.6 ? 0.3 + r() * 0.4 : null;
  return { cars, order, doorAt, playerPlace };
}

/** Closed track around an abstract Budapest: river on the left, ring roads. Unit coordinates. */
export const TRACK: [number, number][] = [
  [0.18, 0.2], [0.42, 0.12], [0.7, 0.14], [0.86, 0.3], [0.84, 0.55], [0.72, 0.78],
  [0.5, 0.86], [0.28, 0.8], [0.16, 0.62], [0.2, 0.42],
];
export function pointAt(u: number): [number, number] {
  const n = TRACK.length;
  const x = ((u % 1) + 1) % 1 * n;
  const i = Math.floor(x), f = x - i;
  const a = TRACK.at(i)!, b = TRACK.at((i + 1) % n)!;
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}
