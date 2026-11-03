import { describe, it, expect } from 'vitest';
import * as E from '../src/services/padelEngine';

const players8 = [
  { id: 'a', elo: 1500, name: 'Jugador A' },
  { id: 'b', elo: 1400, name: 'Jugador B' },
  { id: 'c', elo: 1300, name: 'Jugador C' },
  { id: 'd', elo: 1200, name: 'Jugador D' },
  { id: 'e', elo: 1100, name: 'Jugador E' },
  { id: 'f', elo: 1000, name: 'Jugador F' },
  { id: 'g', elo: 950, name: 'Jugador G' },
  { id: 'h', elo: 900, name: 'Jugador H' },
];
const ids8 = players8.map((p) => p.id);

describe('generateAmericanoRounds', () => {
  it('rechaza n < 4 o impares', () => {
    expect(E.generateAmericanoRounds([])).toEqual([]);
    expect(E.generateAmericanoRounds(['a', 'b', 'c'])).toEqual([]);
    expect(E.generateAmericanoRounds(['a', 'b'])).toEqual([]);
  });
  it('para 4 jugadores: 3 rondas con 2 parejas cada una, todos los jugadores presentes', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const rounds = E.generateAmericanoRounds(ids);
    expect(rounds).toHaveLength(3);
    for (const r of rounds) {
      expect(r).toHaveLength(2);
      const flat = r.flat();
      expect(new Set(flat).size).toBe(4);
      expect(flat).toEqual(expect.arrayContaining(ids));
    }
  });
  it('para 8 jugadores: 7 rondas, 4 parejas por ronda', () => {
    const rounds = E.generateAmericanoRounds(ids8);
    expect(rounds).toHaveLength(7);
    for (const r of rounds) expect(r).toHaveLength(4);
  });
});

describe('generateMexicanoPairings', () => {
  it('devuelve el número correcto de parejas con ids válidos', () => {
    const pairs = E.generateMexicanoPairings({ players: players8 });
    expect(pairs).toHaveLength(4);
    for (const [x, y] of pairs) {
      expect(ids8).toContain(x);
      expect(ids8).toContain(y);
      expect(x).not.toBe(y);
    }
  });
});

describe('generateKnockout', () => {
  it('para 8 jugadores: 4 equipos y 2 partidos en R1 con nombres definidos', () => {
    const { teams, matches } = E.generateKnockout({ players: players8 });
    expect(teams).toHaveLength(4);
    expect(matches).toHaveLength(2);
    for (const m of matches) {
      expect(m.pair1Names).toBeTruthy();
      expect(m.pair2Names).toBeTruthy();
      expect(m.status).toBe('scheduled');
      expect((m.playerIds1.length + m.playerIds2.length)).toBe(4);
    }
  });
  it('con menos de 4 jugadores devuelve vacío', () => {
    const { teams, matches } = E.generateKnockout({ players: players8.slice(0, 3) });
    expect(teams).toHaveLength(0);
    expect(matches).toHaveLength(0);
  });
});

describe('generateGroups', () => {
  it('no pierde participantes sumando los grupos', () => {
    const groups = E.generateGroups({ players: players8 }, 4);
    expect(groups.length).toBeGreaterThan(0);
    let total = 0;
    for (const g of groups) total += (g.memberIds?.length || 0);
    expect(total).toBe(players8.length);
  });
});

describe('scheduleWithRest', () => {
  it('asigna pista y hora de inicio a cada partido', () => {
    const { matches } = E.generateKnockout({ players: players8 });
    const courts = [{ id: 'C1' }, { id: 'C2' }];
    const sched = E.scheduleWithRest(matches, courts, 9, 75, 30);
    expect(sched).toHaveLength(matches.length);
    for (const s of sched) {
      expect(s ? s.matchId : undefined).toBeDefined();
      expect(s ? s.courtId : undefined).toBeDefined();
      expect(s ? s.time : undefined).toMatch(/^\d{1,2}:\d{2}$/);
    }
  });
});

describe('ELO y utilidades', () => {
  it('computeElo actualiza rating', () => {
    const newElo = E.computeElo(1500, 1500, 1);
    expect(newElo).not.toBe(1500);
    expect(Number.isFinite(newElo)).toBe(true);
  });
  it('eloToLevel / levelToElo son consistentes en el rango soportado', () => {
    const lvl = E.eloToLevel(1700);
    expect(lvl).toBeGreaterThanOrEqual(1);
    expect(lvl).toBeLessThanOrEqual(7);
    expect(E.levelToElo(lvl)).toBeGreaterThan(0);
  });
  it('winProbability devuelve valor entre 0 y 1', () => {
    const p = E.winProbability(1500, 1400);
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(1);
  });
});
