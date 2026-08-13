import React, { useEffect, useState } from 'react';
import { COURTS, getLightsSync, turnOnLight, turnOffLight, energySync, qrUrl, scanUrl } from '../services/iotService';

const I18N = {
  es: {
    title: '💡 Control de acceso · Luz QR',
    subtitle: 'Cada pista tiene un QR en la puerta. Escanearlo enciende su luz con temporizador y registra consumo y ahorro. Club desatendido habilitado.',
    kpis: 'Energía', onCount: 'Luz encendida', offCount: 'Apagada',
    activations: 'Activaciones', kwh: 'kWh usados', saved: 'Ahorro estimado',
    courts: 'Pistas', simulate: 'Simular escaneo', on: 'ON', off: 'OFF',
    min: 'min', copy: 'QR listo', copied: '✓ Copiada',
    legend: 'Pincha en "Simular escaneo" o escanea el código con tu móvil: abre /luces?court=X y enciende la luz.',
    noData: 'Todavía no hay activaciones. Escanea un QR o simula un escaneo.',
  },
  en: {
    title: '💡 Access control · QR light',
    subtitle: 'Each court has a QR on its door. Scanning it turns its light on with a timer and logs usage and savings. Unattended club enabled.',
    kpis: 'Energy', onCount: 'Lights on', offCount: 'Off',
    activations: 'Activations', kwh: 'kWh used', saved: 'Est. savings',
    courts: 'Courts', simulate: 'Simulate scan', on: 'ON', off: 'OFF',
    min: 'min', copy: 'QR ready', copied: '✓ Copied',
    legend: 'Click "Simulate scan" or scan the code with your phone: it opens /luces?court=X and turns the light on.',
    noData: 'No activations yet. Scan a QR or simulate a scan.',
  },
  fr: {
    title: '💡 Contrôle d\'accès · QR lumière',
    subtitle: 'Chaque piste a un QR sur sa porte. Le scanner allume son éclairage avec minuterie et enregistre consommation et économies.',
    kpis: 'Énergie', onCount: 'Lumières allumées', offCount: 'Éteintes',
    activations: 'Activations', kwh: 'kWh utilisés', saved: 'Économies estimées',
    courts: 'Pistes', simulate: 'Simuler un scan', on: 'ON', off: 'OFF',
    min: 'min', copy: 'QR prêt', copied: '✓ Copié',
    legend: 'Cliquez sur « Simuler un scan » ou scannez le code avec votre téléphone : ouvre /luces?court=X et allume la lumière.',
    noData: 'Aucune activation pour le moment. Scannez un QR ou simulez un scan.',
  },
  pt: {
    title: '💡 Controlo de acesso · QR luz',
    subtitle: 'Cada campo tem um QR na porta. Escaneá-lo liga a sua luz com temporizador e regista consumo e poupança.',
    kpis: 'Energia', onCount: 'Luzes ligadas', offCount: 'Desligadas',
    activations: 'Ativações', kwh: 'kWh usados', saved: 'Poupança estimada',
    courts: 'Campos', simulate: 'Simular leitura', on: 'ON', off: 'OFF',
    min: 'min', copy: 'QR pronto', copied: '✓ Copiada',
    legend: 'Clique em « Simular leitura » ou escaneie o código com o telemóvel: abre /luces?court=X e liga a luz.',
    noData: 'Ainda não há ativações. Escaneie um QR ou simule uma leitura.',
  },
};

const card = { background: '#0e1e1b', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: 20 };
const ghostBtn = { padding: '8px 12px', borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1' };

export default function IotAccess({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const [lights, setLights] = useState({});
  const [energy, setEnergy] = useState({ totalMin: 0 });

  const refresh = () => { setLights(getLightsSync()); setEnergy(energySync()); };
  useEffect(() => { refresh(); const iv = setInterval(refresh, 30000); return () => clearInterval(iv); }, []);
  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const onCount = COURTS.filter(c => lights[c.id]?.on).length;

  const doScan = async (id) => { await turnOnLight(id); refresh(); };
  const doOff = async (id) => { await turnOffLight(id); refresh(); };

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>{T.title}</h2>
      <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px', maxWidth: 720 }}>{T.subtitle}</p>

      {/* KPIs energía */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 20 }}>
        {[
          ['💡', `${onCount}/${COURTS.length}`, T.onCount],
          ['🔋', energy.kwh ?? 0, T.kwh],
          ['🤖', energy.activaciones ?? 0, T.activations],
          ['💰', `€${(energy.ahorro ?? 0).toFixed(2)}`, T.saved],
        ].map(([ic, n, l], i) => (
          <div key={i} style={card}>
            <div style={{ fontSize: 22 }}>{ic}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#a3e635', marginTop: 4 }}>{n}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Pistas con QR */}
      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: '0 0 12px' }}>🗓️ {T.courts}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 16, marginBottom: 20 }}>
        {COURTS.map((c) => {
          const st = lights[c.id] || { on: false };
          return (
            <div key={c.id} style={{ ...card, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, alignSelf: 'stretch', marginBottom: 8 }}>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 800, color: '#f0fdf4', fontSize: 14 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.desc}</div>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 800,
                  color: st.on ? '#052e16' : '#94a3b8', background: st.on ? '#84cc16' : 'rgba(255,255,255,0.08)',
                }}>{st.on ? `💡 ${T.on} · ${st.remainingMin} ${T.min}` : T.off}</span>
              </div>

              <img src={qrUrl(c.id)} alt={`QR ${c.name}`} width={150} height={150} style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: '#fff' }} />
              <div style={{ fontSize: 11, color: '#64748b', margin: '8px 0', wordBreak: 'break-all' }}>{scanUrl(c.id)}</div>

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {!st.on ? (
                  <button onClick={() => doScan(c.id)} style={{ padding: '9px 16px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>🔍 {T.simulate}</button>
                ) : (
                  <button onClick={() => doOff(c.id)} style={{ padding: '9px 16px', borderRadius: 9, border: '1px solid rgba(248,113,113,0.5)', background: 'rgba(248,113,113,0.1)', color: '#f87171', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>✕ {T.off}</button>
                )}
                <button onClick={() => navigator.clipboard?.writeText(scanUrl(c.id))} style={ghostBtn}>🔗</button>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{T.legend}</p>
    </div>
  );
}