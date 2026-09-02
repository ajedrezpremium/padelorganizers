import React, { useState, useEffect } from 'react';
import { getState } from '../services/store';
import { ownerDashboard, fmtEuros } from '../services/clubCrmService';

const TABS = ['CEO','NEGOCIO','CLIENTES','EQUIPO','ESCUELA','CLUB','COMPETICIÓN','FINANZAS','INTELIGENCIA'];

const CEO_MOCK = {
  ingresos: 48250, beneficio: 14820, alumnos: 384, socios: 612, ocupacion: 78, churn: 3.2,
  alertas: ['7 plazas escuela sin cubrir','3 pagos pendientes','92% clases realizadas'],
  decisiones: ['Renovar grupo Adultos 3','Contratar pista adicional viernes','Campaña captación septiembre']
};

export default function AdminPanel({ lang='es' }) {
  const [tab, setTab] = useState('CEO');
  const [kpis, setKpis] = useState(null);
  const [store, setStore] = useState(getState());

  useEffect(() => {
    ownerDashboard().then(setKpis);
    const id = setInterval(() => setStore(getState()), 3000);
    return () => clearInterval(id);
  }, []);

  const card = { background:'var(--padel-card-bg)', border:'1px solid var(--padel-border)', borderRadius:16, padding:18 };
  const h2 = { fontSize:15, fontWeight:800, color:'var(--padel-text)', margin:'0 0 10px' };

  return (
    <div style={{ maxWidth:1160, margin:'0 auto', padding:'28px 16px 60px' }}>
      <h1 style={{ fontSize:28, fontWeight:900, color:'var(--padel-text)', margin:0 }}>🏢 Panel ADMIN PRO</h1>
      <p style={{ color:'var(--padel-muted)', fontSize:13, margin:'6px 0 16px' }}>Gestión integral: negocio, operaciones, clientes, equipo, escuela, club, competición, finanzas e inteligencia. El dato → decisión.</p>

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
      {tab==='CLIENTES' && <div style={card}><h3 style={h2}>CRM — Cliente 360º</h3><p style={{ fontSize:13, color:'var(--padel-muted)' }}>Juan · 4 años · €3.840 ingresos · 17 torneos · 23 particulares · Riesgo 12%. CLV y churn predictivo.</p></div>}
      {tab==='EQUIPO' && <div style={card}><h3 style={h2}>Profesores</h3><p style={{ fontSize:13, color:'var(--padel-muted)' }}>Horas, ocupación, margen por profe. Ej: Profe A €8.400 ingresos / €4.200 coste = €4.200 margen · 91% ocupación.</p></div>}
      {tab==='ESCUELA' && <div style={card}><h3 style={h2}>Escuela — Temporada → Grupos → Alumnos</h3><p style={{ fontSize:13, color:'var(--padel-muted)' }}>Grupo Adultos 3: Mar 18:00 Pista 2 · 6/8 ocupación · 92% asistencia · Alerta: Carlos 3 ausencias.</p></div>}
      {tab==='CLUB' && <div style={card}><h3 style={h2}>Pistas — Pista → Horario → Actividad → Ingreso</h3><p style={{ fontSize:13, color:'var(--padel-muted)' }}>Pista 4: 82% ocupación · €450/día. Prime 18-21h 94% → subir tarifa +10%.</p></div>}
      {tab==='COMPETICIÓN' && <div style={card}><h3 style={h2}>Competición</h3><p style={{ fontSize:13, color:'var(--padel-muted)' }}>Torneos, ligas, rankings, circuitos. Conecta con motor de torneos (/control) y ranking ELO.</p></div>}
      {tab==='FINANZAS' && <div style={card}><h3 style={h2}>Finanzas</h3><p style={{ fontSize:13, color:'var(--padel-muted)' }}>Rentabilidad por actividad: Adultos €6.300 · Niños €2.400 · Particulares €2.700. Decide dónde invertir.</p></div>}
      {tab==='INTELIGENCIA' && <div style={card}><h3 style={h2}>🤖 AI Business Manager</h3><p style={{ fontSize:13, color:'var(--padel-muted)' }}>“Ingresos +8% pero margen -3% por horas personal. Pista 3 94% 18-21h → sube prime. 18 alumnos en riesgo (7 Adultos B).”</p></div>}
    </div>
  );
}
