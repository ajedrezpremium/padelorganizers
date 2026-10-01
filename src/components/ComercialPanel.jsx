import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const ESTADOS = ['nuevo', 'contactado', 'seguimiento', 'respondido', 'demo_solicitada', 'demo_hecha', 'negociacion', 'ganado', 'perdido', 'rebote', 'sin_correo', 'pausado'];

// Pestaña COMERCIAL del AdminPanel: pipeline + solicitudes de demo virtual.
// Lee de Supabase (tablas commercial_leads y demo_requests).
// Sin Supabase configurado muestra cómo activarlo.
export default function ComercialPanel() {
  const [leads, setLeads] = useState(null);
  const [demos, setDemos] = useState(null);
  const [err, setErr] = useState('');
  const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };

  const cargar = async () => {
    if (!isSupabaseConfigured()) { setErr('nube'); return; }
    try {
      const { data: l, error: e1 } = await supabase.from('commercial_leads').select('email,estado').limit(5000);
      if (e1) throw e1;
      setLeads(l || []);
      const { data: d, error: e2 } = await supabase.from('demo_requests').select('*').order('created_at', { ascending: false }).limit(50);
      if (e2) throw e2;
      setDemos(d || []);
    } catch (e) {
      setErr(e.message || 'error');
    }
  };

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, 60000); // refresco automático cada minuto
    return () => clearInterval(id);
  }, []);

  const marcarDemo = async (id, estado) => {
    await supabase.from('demo_requests').update({ estado }).eq('id', id);
    setDemos((ds) => ds.map((d) => (d.id === id ? { ...d, estado } : d)));
  };

  if (err === 'nube') {
    return (
      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 10px' }}>🎯 Comercial — sin conectar</h3>
        <p style={{ fontSize: 13, color: 'var(--padel-muted)', lineHeight: 1.6 }}>
          Aplica <b>supabase/migrations/20260929000000_comercial.sql</b> en tu proyecto Supabase y
          corre <b>node clientes/subir-leads-supabase.mjs</b>. Después verás aquí el pipeline y las demos solicitadas.
        </p>
      </div>
    );
  }
  if (err) return <div style={card}><p style={{ fontSize: 13, color: '#fb7185' }}>Error: {err}</p><button onClick={cargar} style={{ fontSize: 12 }}>Reintentar</button></div>;
  if (!leads || !demos) return <div style={card}><p style={{ fontSize: 13, color: 'var(--padel-muted)' }}>Cargando actividad comercial…</p></div>;

  const counts = {};
  leads.forEach((l) => { counts[l.estado] = (counts[l.estado] || 0) + 1; });
  const pendientes = demos.filter((d) => d.estado === 'pendiente');

  return (
    <>
      {pendientes.length > 0 && (
        <div style={{ ...card, marginBottom: 12, border: '1px solid rgba(16,185,129,0.4)', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(56,189,248,0.08))' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 8px' }}>🎾 {pendientes.length} demo(s) pendiente(s) — responde en &lt;24h</h3>
          {pendientes.map((d) => (
            <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: '1px solid var(--padel-border)', fontSize: 13 }}>
              <span><b>{d.nombre || d.email}</b> · {d.email} · {d.perfil || d.fuente} · {new Date(d.created_at).toLocaleDateString()}</span>
              <button onClick={() => marcarDemo(d.id, 'contactado')} style={{ fontSize: 11, fontWeight: 800, padding: '6px 10px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer' }}>Contactado ✓</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ ...card, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>📊 Pipeline — {leads.length} leads</h3>
          <button onClick={cargar} style={{ fontSize: 11, fontWeight: 800, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--padel-border)', background: 'var(--padel-hover-bg)', cursor: 'pointer' }}>↻ Actualizar</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ESTADOS.filter((e) => counts[e]).map((e) => (
            <div key={e} style={{ background: 'var(--padel-hover-bg)', borderRadius: 10, padding: '8px 12px', fontSize: 12 }}>
              <span style={{ color: 'var(--padel-muted)', fontWeight: 700 }}>{e}</span>{' '}
              <b style={{ color: e === 'ganado' ? '#10b981' : e === 'demo_solicitada' ? '#38bdf8' : 'var(--padel-text)' }}>{counts[e]}</b>
            </div>
          ))}
          {!Object.keys(counts).length && <span style={{ fontSize: 12, color: 'var(--padel-muted)' }}>Sin leads aún. Corre el sync.</span>}
        </div>
      </div>
      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 10px' }}>📬 Últimas solicitudes de demo ({demos.length})</h3>
        {demos.length === 0 && <p style={{ fontSize: 12, color: 'var(--padel-muted)' }}>Aún nadie pidió demo. El aviso te llegará por email automáticamente cuando ocurra.</p>}
        {demos.map((d) => (
          <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: '1px solid var(--padel-border)', fontSize: 12 }}>
            <span><b>{d.nombre || d.email}</b> · {d.email} · {d.perfil || '—'} · {d.fuente} · {new Date(d.created_at).toLocaleDateString()} · <i>{d.estado}</i></span>
            {d.estado === 'pendiente' && <button onClick={() => marcarDemo(d.id, 'contactado')} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--padel-border)', background: 'var(--padel-hover-bg)', cursor: 'pointer' }}>✓</button>}
          </div>
        ))}
      </div>
    </>
  );
}
