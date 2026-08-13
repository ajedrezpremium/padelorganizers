/**
 * playerImportService.js — Importación de jugadores del torneo en varios formatos.
 * Soporta:
 *   1. CSV/Excel  (separado por comas, punto y coma o tabulación, con/o sin cabecera):
 *        Nombre,Elo,Nivel        o        Nombre;Nivel;Elo
 *   2. Línea por línea: un jugador por línea ("Nombre Apellido")
 *   3. Parejas:   "Jugador1 / Jugador2"  (las parejas se forman automáticamente)
 *   4. Lista separada por comas o por tabulaciones (pegada desde WhatsApp/hojas de cálculo)
 * El parser detecta automáticamente el formato y asigna Elo/nivel por defecto
 * si no vienen en los datos. Nunca lanza: devuelve { players, pairs, warnings, format }.
 */

const DEFAULT_ELO = 1500;
const DEFAULT_LEVEL = 3.0;

function norm(s) {
  return (s || '').replace(/[\u2018\u2019']/g, '\'').replace(/[\u201C\u201D"]/g, '"').trim();
}

// Detecta si una línea parece de parejas "A / B"
function isPair(text) {
  return /\s\/\s/.test(text) || /\s\|\s/.test(text);
}

// Intenta leer Elo/nivel de una celda: "1760", "3.8", "N3", "3,8"
function parseCell(raw) {
  const s = norm(raw);
  if (!s) return null;
  if (/^\d{3,4}$/.test(s)) return { elo: parseInt(s, 10) };
  if (/^\d(\.\d)?$/.test(s)) return { level: parseFloat(s) };
  const nm = /^n\s*(\d(?:\.\d)?)$/i.exec(s);
  if (nm) return { level: parseFloat(nm[1]) };
  return null;
}

function eloToLevel(elo) {
  if (elo >= 1750) return 3.8;
  if (elo >= 1650) return 3.5;
  if (elo >= 1550) return 3.2;
  if (elo >= 1450) return 3.0;
  return 2.6;
}

// Separa una línea por el separador dominante (`,` `;` tab) o espacio simple.
function splitFieldLine(line) {
  const L = line.trim();
  if (!L) return [];
  if (L.includes(';')) { const p = L.split(';').map(norm); if (p.length > 1) { return p; } }
  if (L.includes('\t')) { const p = L.split('\t').map(norm); if (p.length > 1) { return p; } }
  if (L.includes(',')) {
    const p = L.split(',').map(norm);
    // si hay más de un campo y la coma no es solo un separador decimal (3,8)
    const decimalOnly = p.length === 2 && /^\d+,\d+$/.test(L.replace(/\s/g, ''));
    if (p.length > 1 && !decimalOnly) { return p; }
  }
  if (L.split(/\s{2,}/).length > 1) { const p = L.split(/\s{2,}/).map(norm); if (p.length > 1) { return p; } }
  return null;
}

export function parsePlayers(rawText) {
  const text = norm(rawText);
  if (!text) return { players: [], pairs: [], warnings: ['empty'] };
  const lines = text.split(/\r?\n/).map(norm).filter(Boolean);
  const players = [];
  const pairs = [];
  const warnings = [];
  let format = 'unknown';
  let pairCounter = 0;

  const seen = new Set();
  const pushPlayer = (name, extra, pairId) => {
    if (!name) return;
    const key = name.toLowerCase();
    if (seen.has(key)) { warnings.push(`dup:${name}`); return; }
    seen.add(key);
    pairCounter += 1;
    players.push({
      id: `imp-${pairCounter}`,
      name,
      elo: extra.elo || DEFAULT_ELO,
      level: extra.level || eloToLevel(extra.elo || DEFAULT_ELO),
      pairId: pairId || null,
    });
    return pairCounter;
  };

  const hasHeader = lines.length > 1
    && /nombre|name|jugador|player|elo|nivel|level/i.test(lines[0]);

  for (const line of lines) {
    // formato parejas: "A / B"
    if (isPair(line)) {
      format = format === 'unknown' ? 'pairs' : format;
      const [a, b] = line.split(/\s(?:\/|\|)\s/).map(norm);
      pairCounter += 1;
      const pid = `imp-p${pairCounter}`;
      pushPlayer(a, {}, pid);
      pushPlayer(b, {}, pid);
      pairs.push({ id: pid, player1: a, player2: b });
      continue;
    }

    // CSV / tabular
    const fields = splitFieldLine(line);
    if (fields && (fields.length >= 1)) {
      const isHeader = hasHeader && lines.indexOf(line) === 0;
      // cabecera reconocible: no la tratamos como jugador
      if (isHeader && /nombre|name|jugador|player|elo|nivel|level/i.test(fields.join(' '))) {
        format = 'csv';
        continue;
      }
      const name = fields[0];
      let extra = {};
      // buscar elo/nivel en el resto de columnas
      for (const f of fields.slice(1)) {
        const c = parseCell(f);
        if (c && c.elo && !extra.elo) extra = { ...extra, elo: c.elo };
        else if (c && c.level && !extra.level) extra = { ...extra, level: c.level };
      }
      // si la primera columna es numérica puro pero la siguiente es texto -> nombre en col.2
      if (/^\d{3,4}$/.test(name) && fields.length > 1) {
        const c = parseCell(name);
        const nm = fields[1];
        if (c && nm) {
          format = format === 'unknown' ? 'csv' : format;
          pushPlayer(nm, { elo: c.elo }, null);
          continue;
        }
      }
      if (fields.length > 1) {
        format = format === 'unknown' ? 'csv' : format;
      } else {
        format = format === 'unknown' ? 'list' : format;
      }
      pushPlayer(name, extra, null);
      continue;
    }

    // nombre simple en la línea
    format = format === 'unknown' ? 'list' : format;
    pushPlayer(line, {}, null);
  }

  const validPairs = pairs.filter(p => p.player1 && p.player2);
  return {
    players,
    pairs: validPairs,
    format: format === 'unknown' ? 'list' : format,
    warnings,
  };
}

export function formatLabels() {
  return {
    csv: 'CSV / Excel',
    pairs: 'Parejas (Jugador1 / Jugador2)',
    list: 'Lista simple (un jugador por línea)',
    unknown: 'Mixto',
  };
}