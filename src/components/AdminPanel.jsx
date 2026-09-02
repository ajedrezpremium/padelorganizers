import React, { useState, useEffect } from 'react';
import { getState } from '../services/store';
import { ownerDashboard, fmtEuros } from '../services/clubCrmService';

const TABS = ['CEO','NEGOCIO','CLIENTES','EQUIPO','ESCUELA','CLUB','COMPETICIÓN','FINANZAS','INTELIGENCIA'];

const CEO_MOCK = {
  ingresos: 48250, beneficio: 14820, alumnos: 384, socios: 612, ocupacion: 78, churn: 3.2,
  alertas: ['7 plazas escuela sin cubrir','3 pagos pendientes','92% clases realizadas'],
  decisiones: ['Renovar grupo Adultos 3','Contratar pista adicional viernes','Campaña captación septiembre']
};

function trialInfo() {
  try {
    let start = localStorage.getItem('padelorganizers-trial-start');
    if (!start) { start = new Date().toISOString(); localStorage.setItem('padelorganizers-trial-start', start); }
    const days = Math.floor((Date.now() - new Date(start).getTime()) / 86400000);
    const left = Math.max(0, 90 - days);
    const isPro = localStorage.getItem('padelorganizers-pro') === '1';
    return { days, left, isPro, active: isPro || left>0 };
  } catch { return { days:0, left:90, isPro:false, active:true }; }
}

export default function AdminPanel({ lang='es' }) {
  const [tab, setTab] = useState('CEO');
  const [kpis, setKpis] = useState(null);
  const [store, setStore] = useState(getState());
  const [trial, setTrial] = useState(trialInfo());

  useEffect(() => {
    ownerDashboard().then(setKpis);
    const id = setInterval(() => { setStore(getState()); setTrial(trialInfo()); }, 3000);
    return () => clearInterval(id);
  }, []);

  const card = { background:'var(--padel-card-bg)', border:'1px solid var(--padel-border)', borderRadius:16, padding:18 };
  const h2 = { fontSize:15, fontWeight:800, color:'var(--padel-text)', margin:'0 0 10px' };

  const FinanzasReales = () => {
    const ingresos = kpis ? kpis.facturacionTotal : CEO_MOCK.ingresos;
    const costes = 33430; // estimado base, luego conectar a gastos reales
    return { ingresos, costes, margen: ingresos - costes };
  };

  if (!trial.active) {
    return (
      <div style={{ maxWidth:700, margin:'0 auto', padding:'60px 16px', textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:12 }}>🔒</div>
        <h1 style={{ fontSize:26, fontWeight:900, color:'var(--padel-text)', margin:'0 0 10px' }}>Panel Admin PRO — Pack de pago</h1>
        <p style={{ color:'var(--padel-muted)', fontSize:14, lineHeight:1.6, maxWidth:520, margin:'0 auto 18px' }}>Tu periodo de prueba de 90 días ha terminado. Desbloquea el Panel Admin PRO con Dashboard CEO, Finanzas reales, CLV y AI Business Manager en el <b>Pack Pro 49€/mes</b> (3 meses gratis para fundadores).</p>
        <button onClick={async()=>{ const r=await fetch('/api/checkout-subscription',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan:'pro'})}); const j=await r.json(); if(j.url) window.location.href=j.url; }} style={{ padding:'14px 28px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', fontWeight:800, fontSize:15, cursor:'pointer' }}>Activar Pro — 3 meses gratis →</button>
        <p style={{ fontSize:11, color:'var(--padel-muted)', marginTop:12 }}>Starter gratis sigue disponible (1 torneo, 4 pistas).</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:1160, margin:'0 auto', padding:'28px 16px 60px' }}>
      <h1 style={{ fontSize:28, fontWeight:900, color:'var(--padel-text)', margin:0 }}>🏢 Panel ADMIN PRO</h1>
      <p style={{ color:'var(--padel-muted)', fontSize:13, margin:'6px 0 10px' }}>Gestión integral: negocio, operaciones, clientes, equipo, escuela, club, competición, finanzas e inteligencia. El dato → decisión.</p>
      <div style={{ display:'inline-flex', alignItems:'center', gap:8, background: trial.isPro?'rgba(16,185,129,0.12)':'rgba(251,191,36,0.12)', border:`1px solid ${trial.isPro?'rgba(16,185,129,0.3)':'rgba(251,191,36,0.3)'}`, color: trial.isPro?'#10b981':'#fbbf24', padding:'6px 12px', borderRadius:999, fontWeight:800, fontSize:11, marginBottom:16 }}>
        {trial.isPro ? '✓ PRO activo' : `⏳ Prueba ${trial.left} días restantes` } · luego Pack Pro 49€/mes
      </div>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:18 }}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'8px 14px', borderRadius:10, border:'1px solid var(--padel-border)', background: tab===t?'var(--padel-emerald)':'var(--padel-card-bg)', color: tab===t?'#fff':'var(--padel-muted)', fontWeight:800, fontSize:12, cursor:'pointer' }}>{t}</button>
        ))}
      </div>

      {tab==='CEO' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:12 }}>
            {[
              ['INGRESOS', fmtEuros(CEO_MOCK.ingresos), '↑ 12%','#10b981'],
              ['BENEFICIO', fmtEuros(CEO_MOCK.beneficio), '↑ 8%','#10b981'],
              ['ALUMNOS', CEO_MOCK.alumnos, '↑ 6%','#38bdf8'],
              ['SOCIOS', CEO_MOCK.socios, '↑ 4%','#38bdf8'],
              ['OCUPACIÓN', CEO_MOCK.ocupacion+'%', '↑ 5%','#a3e635'],
              ['CHURN', CEO_MOCK.churn+'%', '↓','#fb7185'],
            ].map(([l,v,d,c])=>(
              <div key={l} style={{ ...card, textAlign:'center' }}>
                <div style={{ fontSize:11, fontWeight:800, color:'var(--padel-muted)' }}>{l}</div>
                <div style={{ fontSize:22, fontWeight:900, color:c }}>{v}</div>
                <div style={{ fontSize:11, color:c }}>{d}</div>
              </div>
            ))}
          </div>
          <div style={{ ...card, marginBottom:12 }}>
            <h3 style={h2}>Alertas</h3>
            {CEO_MOCK.alertas.map(a=>(
              <div key={a} style={{ padding:'8px 0', borderBottom:'1px solid var(--padel-border)', fontSize:13, color:'var(--padel-text)' }}>
                {a.startsWith('7')?'🔴':a.startsWith('3')?'🟡':'🟢'} {a}
              </div>
            ))}
          </div>
          <div style={card}>
            <h3 style={h2}>Próximas decisiones</h3>
            {CEO_MOCK.decisiones.map(d=>(
              <div key={d} style={{ padding:'8px 0', borderBottom:'1px solid var(--padel-border)', fontSize:13, color:'var(--padel-text)' }}>• {d}</div>
            ))}
          </div>
          <div style={{ ...card, marginTop:12, background:'rgba(16,185,129,0.08)' }}>
            <h3 style={h2}>Torneo activo → Negocio</h3>
            <div style={{ fontSize:13, color:'var(--padel-muted)' }}>{store.tournament?.name || '—'} · {store.players?.length||0} jugadores · {store.pairs?.length||0} parejas · {store.matches?.length||0} partidos</div>
            <div style={{ fontSize:12, color:'var(--padel-muted)', marginTop:6 }}>Ingresos torneo: {kpis ? fmtEuros(kpis.facturacionTotal) : '—'} · RevPAC {kpis?.revpac||'—'}€</div>
          </div>
        </>
      )}

      {tab==='NEGOCIO' && <div style={card}><h3 style={h2}>Ingresos vs Gastos</h3><p style={{ fontSize:13, color:'var(--padel-muted)' }}>Escuela, cuotas, reservas, torneos, eventos, patrocinios, tienda vs profesores, pistas, alquiler, marketing. Margen = ingresos − costes.</p><div style={{ fontSize:22, fontWeight:900, color:'#10b981' }}>{fmtEuros(CEO_MOCK.ingresos - 33430)} margen</div></div>}
      {tab==='CLIENTES' && (
        <div style={card}>
          <h3 style={h2}>CRM — Cliente 360º · CLV</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
            {[
              ['Juan García','4 años','€3.840','€960/año','17 torneos','23 particulares','12% riesgo','🟢'],
              ['Carlos Ruiz','1.2 años','€420','€350/año','2 torneos','1 particular','87% riesgo','🔴'],
              ['Pedro López','2.5 años','€1.820','€728/año','8 torneos','12 particulares','54% riesgo','🟠'],
            ].map(([n,ant,tot,avg,tor,par,riesgo,dot])=>(
              <div key={n} style={{ background:'var(--padel-hover-bg)', borderRadius:12, padding:12 }}>
                <div style={{ fontWeight:800, fontSize:13 }}>{dot} {n}</div>
                <div style={{ fontSize:11, color:'var(--padel-muted)', marginTop:4 }}>{ant} · {tot} · {avg}</div>
                <div style={{ fontSize:11, color:'var(--padel-muted)' }}>{tor} · {par} · Riesgo {riesgo}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:11, color:'var(--padel-muted)', marginTop:10 }}>Churn 3,2% · IA detecta: menos asistencia, menos reservas, impagos → alerta antes de perder al cliente.</div>
        </div>
      )}
      {tab==='EQUIPO' && <div style={card}><h3 style={h2}>Profesores</h3><p style={{ fontSize:13, color:'var(--padel-muted)' }}>Horas, ocupación, margen por profe. Ej: Profe A €8.400 ingresos / €4.200 coste = €4.200 margen · 91% ocupación.</p></div>}
      {tab==='ESCUELA' && <div style={card}><h3 style={h2}>Escuela — Temporada → Grupos → Alumnos</h3><p style={{ fontSize:13, color:'var(--padel-muted)' }}>Grupo Adultos 3: Mar 18:00 Pista 2 · 6/8 ocupación · 92% asistencia · Alerta: Carlos 3 ausencias.</p></div>}
      {tab==='CLUB' && <div style={card}><h3 style={h2}>Pistas — Pista → Horario → Actividad → Ingreso</h3><p style={{ fontSize:13, color:'var(--padel-muted)' }}>Pista 4: 82% ocupación · €450/día. Prime 18-21h 94% → subir tarifa +10%.</p></div>}
      {tab==='COMPETICIÓN' && <div style={card}><h3 style={h2}>Competición</h3><p style={{ fontSize:13, color:'var(--padel-muted)' }}>Torneos, ligas, rankings, circuitos. Conecta con motor de torneos (/control) y ranking ELO.</p></div>}
      {tab==='FINANZAS' && (()=>{ const r=FinanzasReales(); return (
        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 style={h2}>Rentabilidad por actividad</h3>
            <span style={{ fontSize:11, color:'var(--padel-muted)', fontWeight:700 }}>Real: {fmtEuros(r.ingresos)} ingresos · {fmtEuros(r.margen)} margen</span>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, marginTop:8 }}>
            <thead><tr style={{ color:'var(--padel-muted)', fontSize:11 }}><th style={{textAlign:'left', padding:'6px'}}>Actividad</th><th style={{textAlign:'right', padding:'6px'}}>Ingresos</th><th style={{textAlign:'right', padding:'6px'}}>Coste</th><th style={{textAlign:'right', padding:'6px'}}>Margen</th></tr></thead>
            <tbody>
              {[
                ['Escuela adultos',12400,6100],
                ['Escuela niños',7200,4800],
                ['Particulares',5600,2900],
                ['Torneos',kpis?.facturacionTotal||4200,2100],
                ['Eventos',8500,5700],
              ].map(([a,ing,cos])=>(
                <tr key={a} style={{ borderTop:'1px solid var(--padel-border)' }}><td style={{padding:'8px 6px', fontWeight:700}}>{a}{a==='Torneos'&&kpis?' · real':''}</td><td style={{textAlign:'right', padding:'6px'}}>{fmtEuros(ing)}</td><td style={{textAlign:'right', padding:'6px', color:'#fb7185'}}>{fmtEuros(cos)}</td><td style={{textAlign:'right', padding:'6px', fontWeight:800, color: ing-cos>3000?'#10b981':'#fbbf24'}}>{fmtEuros(ing-cos)}</td></tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize:11, color:'var(--padel-muted)', marginTop:8 }}>→ Infantil mucho alumno pero poco margen. Torneos ahora con dato real de /panel.</div>
        </div>
      );})()}
      {tab==='INTELIGENCIA' && (
        <div style={card}>
          <h3 style={h2}>🤖 AI Business Manager — “¿Cómo va mi club?”</h3>
          <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:12, padding:14, marginBottom:12 }}>
            <div style={{ fontSize:13, color:'var(--padel-text)', lineHeight:1.6 }}>
              “Ingresos <b>+8%</b> vs mes anterior, pero margen <b>-3%</b> por horas personal. Pista 3 <b>94% 18-21h</b> → sube prime +10%.<br/>
              <b>18 alumnos en riesgo</b> (7 Adultos B, 5 Infantil, 6 Particulares) — {store.players?.length||0} jugadores en torneo activo, {kpis?.facturacionTotal ? fmtEuros(kpis.facturacionTotal) : '—'} facturados. Lanza campaña retención esta semana.”
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:10 }}>
            <div style={{ background:'var(--padel-hover-bg)', borderRadius:10, padding:12 }}><div style={{ fontSize:11, color:'var(--padel-muted)', fontWeight:700 }}>ALERTA CHURN</div><div style={{ fontSize:13, fontWeight:800, color:'#fb7185', marginTop:4 }}>Carlos 87% · Pedro 54% · Juan 12%</div></div>
            <div style={{ background:'var(--padel-hover-bg)', borderRadius:10, padding:12 }}><div style={{ fontSize:11, color:'var(--padel-muted)', fontWeight:700 }}>RECOMENDACIÓN TARIFA</div><div style={{ fontSize:13, fontWeight:800, color:'#10b981', marginTop:4 }}>Pista 3 prime +10% = +€420/mes</div></div>
            <div style={{ background:'var(--padel-hover-bg)', borderRadius:10, padding:12 }}><div style={{ fontSize:11, color:'var(--padel-muted)', fontWeight:700 }}>CAMPAÑA AUTO</div><div style={{ fontSize:12, color:'var(--padel-text)', marginTop:4 }}>“30 días sin asistir” → 18 leads · “Abono vence 15d” → 12 leads</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
