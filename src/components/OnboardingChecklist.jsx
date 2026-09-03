import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getState } from '../services/store';

export default function OnboardingChecklist({ lang='es' }) {
  const T = {
    es: { title:'✅ Onboarding 5 minutos', steps:['1. Crea tu torneo','2. Importa 8 parejas','3. Genera cuadro y comparte'], done:'¡Listo!', cta:'Ir a importar →', email:'Email de bienvenida enviado a tu correo.' },
    en: { title:'✅ 5-min Onboarding', steps:['1. Create tournament','2. Import 8 pairs','3. Generate draw and share'], done:'Done!', cta:'Go to import →', email:'Welcome email sent.' },
  }[lang] || { title:'✅ Onboarding', steps:[], done:'Done!', cta:'Go →', email:'Email sent.' };
  const nav = useNavigate();
  const [s, setS] = useState(getState());
  useEffect(()=>{ const id=setInterval(()=>setS(getState()),2000); return()=>clearInterval(id); },[]);
  const hasTourney = !!s.tournament?.name && s.tournament.name!=='Mi Torneo';
  const hasPlayers = (s.players||[]).length>=4;
  const hasDraw = (s.matches||[]).length>0;
  const pct = [hasTourney, hasPlayers, hasDraw].filter(Boolean).length/3*100;

  return (
    <div style={{ background:'var(--padel-card-bg)', border:'1px solid var(--padel-border)', borderRadius:16, padding:18, marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <h3 style={{ fontSize:15, fontWeight:800, color:'var(--padel-text)', margin:0 }}>{T.title}</h3>
        <span style={{ fontSize:11, fontWeight:800, color: pct===100?'#10b981':'var(--padel-muted)', background: pct===100?'rgba(16,185,129,0.12)':'var(--padel-hover-bg)', padding:'4px 8px', borderRadius:999 }}>{pct===100?T.done:`${Math.round(pct)}%`}</span>
      </div>
      <div style={{ height:6, background:'var(--padel-hover-bg)', borderRadius:999, overflow:'hidden', marginBottom:12 }}>
        <div style={{ width:`${pct}%`, height:'100%', background:'linear-gradient(90deg,#10b981,#84cc16)', transition:'width 0.5s' }} />
      </div>
      <div style={{ display:'grid', gap:8 }}>
        {T.steps.map((step,i)=>{
          const done = [hasTourney, hasPlayers, hasDraw][i];
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid var(--padel-border)', opacity: done?0.6:1 }}>
              <span style={{ width:22, height:22, borderRadius:'50%', background: done?'#10b981':'var(--padel-hover-bg)', color: done?'#fff':'var(--padel-muted)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800 }}>{done?'✓':i+1}</span>
              <span style={{ fontSize:13, color:'var(--padel-text)', textDecoration: done?'line-through':'' }}>{step}</span>
              {i===0 && !hasTourney && <button onClick={()=>nav('/torneo/crear')} style={{ marginLeft:'auto', padding:'6px 10px', borderRadius:8, border:'none', background:'#10b981', color:'#fff', fontWeight:700, fontSize:11, cursor:'pointer' }}>{T.cta}</button>}
              {i===1 && hasTourney && !hasPlayers && <button onClick={()=>nav('/importar')} style={{ marginLeft:'auto', padding:'6px 10px', borderRadius:8, border:'none', background:'#10b981', color:'#fff', fontWeight:700, fontSize:11, cursor:'pointer' }}>{T.cta}</button>}
              {i===2 && hasPlayers && !hasDraw && <button onClick={()=>nav('/control')} style={{ marginLeft:'auto', padding:'6px 10px', borderRadius:8, border:'none', background:'#10b981', color:'#fff', fontWeight:700, fontSize:11, cursor:'pointer' }}>Generar cuadro →</button>}
            </div>
          );
        })}
      </div>
      {hasTourney && <p style={{ fontSize:11, color:'var(--padel-muted)', marginTop:10 }}>{T.email}</p>}
    </div>
  );
}
