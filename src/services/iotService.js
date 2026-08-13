/**
 * iotService.js — Control de acceso + IoT (#7): QR en la puerta enciende la luz.
 * Cada pista tiene un QR que apunta a /luces?court=X. Al escanearlo (o pulsar
 * "Simular escaneo"), la luz se enciende con un temporizador (min/pista).
 * Persistencia: localStorage (demo) con sincronización entre pestañas vía storage.
 */

const LS_LIGHTS = 'padelorganizers-lights';
const LS_LOG = 'padelorganizers-iotlog';

export const COURTS = [
  { id: 'c1', name: 'Pista 1 · Central', desc: 'Cristal · Panorámica' },
  { id: 'c2', name: 'Pista 2 · Promo', desc: 'Cristal' },
  { id: 'c3', name: 'Pista 3 · Cubierta', desc: 'LED anti-deslumbramiento' },
  { id: 'c4', name: 'Pista 4 · Cubierta', desc: 'LED anti-deslumbramiento' },
];

export const DEFAULT_MIN = 90; // minutos por defecto de luz

const KW = 2.4; // potencia estimada kW de la iluminación de una pista
const EUR_KWH = 0.18; // precio del kWh (demo)

function loadLights() {
  try { return JSON.parse(localStorage.getItem(LS_LIGHTS) || '{}'); } catch { return {}; }
}
function saveLights(l) { localStorage.setItem(LS_LIGHTS, JSON.stringify(l)); }

function loadLog() {
  try { return JSON.parse(localStorage.getItem(LS_LOG) || '[]'); } catch { return []; }
}
function saveLog(log) { localStorage.setItem(LS_LOG, JSON.stringify(log)); }

// Estado vivo: aplica expiraciones y devuelve lights + minutos restantes.
export function getLightsSync() {
  const lights = loadLights();
  const now = Date.now();
  let changed = false;
  Object.keys(lights).forEach((id) => {
    const till = Number(lights[id].till || 0);
    if (till > 0 && till <= now) { delete lights[id]; changed = true; }
    else if (till <= 0) { delete lights[id]; changed = true; }
  });
  if (changed) saveLights(lights);
  const out = {};
  COURTS.forEach((c) => {
    const l = lights[c.id];
    out[c.id] = l
      ? { on: true, till: Number(l.till), remainingMin: Math.max(0, Math.round((l.till - now) / 60000)) }
      : { on: false, till: 0, remainingMin: 0 };
  });
  return out;
}

// Enciende la luz de una pista (simula el escaneo del QR en la puerta).
export async function turnOnLight(courtId, minutes = DEFAULT_MIN) {
  const till = Date.now() + minutes * 60000;
  const lights = getLightsSync();
  const next = { ...loadLights(), [courtId]: { on: true, till } };
  saveLights(next);
  // registro de activación (para el panel de energía)
  const log = loadLog();
  log.push({ id: `q-${Date.now()}`, courtId, courtName: (COURTS.find(c => c.id === courtId) || {}).name || courtId, at: new Date().toISOString(), minutes });
  saveLog(log.slice(-50));
  return next;
}

export async function turnOffLight(courtId) {
  const lights = loadLights();
  delete lights[courtId];
  saveLights(lights);
  return lights;
}

export function wakeStorage() { localStorage.setItem('padelorganizers-iot-wake', String(Date.now())); localStorage.removeItem('padelorganizers-iot-wake'); }

// KPI de energía: tiempo de luz usado y ahorro estimado vs "siempre encendida".
export function energySync() {
  const log = loadLog();
  const totalMin = log.reduce((s, e) => s + Number(e.minutes || 0), 0);
  const activaciones = log.length;
  const ventanas = Math.round(totalMin / 60);
  const kwh = Number((totalMin / 60 * KW).toFixed(1));
  const ahorro = Number((kwh * EUR_KWH).toFixed(2));
  const último = log[log.length - 1] || null;
  return { totalMin, activaciones, ventanas, kwh, ahorro, último };
}

// QR: URL del escaneo (apunta a /luces?court=X) + API pública de generación.
export function scanUrl(courtId) {
  return `${window.location.origin}/luces?court=${courtId}`;
}
export function qrUrl(courtId) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=6&data=${encodeURIComponent(scanUrl(courtId))}`;
}