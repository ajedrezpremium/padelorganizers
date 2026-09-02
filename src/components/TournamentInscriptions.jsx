import React, { useState } from 'react';
import { getTournamentById, saveTournamentById } from '../services/store';

const STEPS = [
  { key: 'plan', label: 'Planificación', desc: 'Formato, precio, categorías' },
  { key: 'open', label: 'Apertura', desc: 'Activa inscripción + link/QR' },
  { key: 'inscribe', label: 'Inscripción', desc: 'Jugadores se apuntan y pagan' },
  { key: 'manage', label: 'Gestión', desc: 'Pagos y lista espera' },
  { key: 'close', label: 'Cierre', desc: 'Genera cuadros y horarios' },
  { key: 'communicate', label: 'Comunicación', desc: 'Publica cuadro final' },
];

export default function TournamentInscriptions({ tournamentId, lang='es' }) {
  const t = getTournamentById(tournamentId);
  const [copied, setCopied] = useState(false);
  if (!t) return null;
  const st = t.tournament?.state || 'DRAFT';
  const link = `${window.location.origin}/tournament/${tournamentId}`;
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(link)}`;

  const setState = (ns) => saveTournamentById(tournamentId, (cur)=> ({ ...cur, tournament: { ...cur.tournament, state: ns, status: ns.toLowerCase() } }));

  return (
    <div style={{ background:'var(--padel-card-bg)', border:'1px solid var(--padel-border)', borderRadius:16, padding:18, marginBottom:16 }}>
      <h3 style={{ fontSize:15, fontWeight:800, color:'var(--padel-text)', margin:'0 0 4px' }}>📝 Flujo Ideal — Inscripciones</h3>
      <p style={{ fontSize:12, color:'var(--padel-muted)', margin:'0 0 12px' }}>Planificación → Apertura → Inscripción → Gestión → Cierre → Comunicación. Estado actual: <b style={{ color:'#10b981' }}>{st}</b></p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:8, marginBottom:12 }}>
        {STEPS.map(s=>(
          <div key={s.key} style={{ background: st===s.key.toUpperCase()|| (st==='OPEN'&&s.key==='open') ? 'rgba(16,185,129,0.12)' : 'var(--padel-hover-bg)', border:'1px solid var(--padel-border)', borderRadius:10, padding:10, textAlign:'center' }}>
            <div style={{ fontSize:11, fontWeight:800, color:'var(--padel-text)' }}>{s.label}</div>
            <div style={{ fontSize:10, color:'var(--padel-muted)' }}>{s.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {st==='DRAFT' && <button onClick={()=>setState('OPEN')} style={{ padding:'8px 14px', borderRadius:8, border:'none', background:'#10b981', color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer' }}>Abrir inscripciones →</button>}
        {st==='OPEN' && <button onClick={()=>setState('REGISTRATION_CLOSED')} style={{ padding:'8px 14px', borderRadius:8, border:'none', background:'#fbbf24', color:'#1f2937', fontWeight:700, fontSize:12, cursor:'pointer' }}>Cerrar inscripciones → Generar cuadro</button>}
        <button onClick={()=>{ navigator.clipboard?.writeText(link); setCopied(true); setTimeout(()=>setCopied(false),1500); }} style={{ padding:'8px 14px', borderRadius:8, border:'1px solid var(--padel-border)', background:'var(--padel-hover-bg)', color:'var(--padel-text)', fontWeight:700, fontSize:12, cursor:'pointer' }}>{copied?'✓ Copiado':`🔗 Copiar link`}</button>
      </div>
      {st==='OPEN' && (
        <div style={{ display:'flex', gap:12, alignItems:'center', marginTop:12, flexWrap:'wrap' }}>
          <img src={qr} alt="QR" style={{ width:90, height:90, borderRadius:8, border:'1px solid var(--padel-border)' }} />
          <div style={{ fontSize:12, color:'var(--padel-muted)' }}>QR para cartelería y recepción. Jugadores escanean → se inscriben y pagan vía Stripe.</div>
        </div>
      )}
    </div>
  );
}
