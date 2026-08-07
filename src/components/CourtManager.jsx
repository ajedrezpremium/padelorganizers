import React, { useState, useEffect } from 'react';
import { COURT_STATUS } from '../services/padelEngine';

const CourtManager = ({ courts, matches, onFinishMatch, onAssignCourt }) => {
  const [modalMatch, setModalMatch] = useState(null);
  const [gamesP1, setGamesP1] = useState(6);
  const [gamesP2, setGamesP2] = useState(4);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (startTime) => {
    if (!startTime) return '00:00';
    const diffSec = Math.floor((now - startTime) / 1000);
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const scheduledMatches = matches.filter(m => m.status === 'scheduled');

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#fff' }}>
          🎾 CourtManager — Control de Pistas en Tiempo Real
        </h2>
        <span style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#84cc16', padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '13px' }}>
          Pistas Libres: {courts.filter(c => c.status === COURT_STATUS.FREE).length} / {courts.length}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {courts.map((court) => {
          const activeMatch = matches.find(m => m.id === court.matchId);
          const isFree = court.status === COURT_STATUS.FREE;

          return (
            <div key={court.id} style={{
              background: '#0e1e1b',
              border: isFree ? '1px solid rgba(255,255,255,0.1)' : '1px solid #10b981',
              borderRadius: '16px',
              padding: '20px',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#fff' }}>{court.name}</h3>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  background: isFree ? 'rgba(148, 163, 184, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: isFree ? '#94a3b8' : '#34d399'
                }}>
                  {isFree ? 'Libre' : 'En Juego'}
                </span>
              </div>

              {!isFree && activeMatch ? (
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', fontSize: '14px', fontWeight: 700 }}>
                    <span style={{ color: '#38bdf8' }}>🔵 {activeMatch.pair1Names}</span>
                    <span style={{ color: '#84cc16' }}>{activeMatch.scoreSet1}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', fontSize: '14px', fontWeight: 700 }}>
                    <span style={{ color: '#f43f5e' }}>🔴 {activeMatch.pair2Names}</span>
                    <span style={{ color: '#84cc16' }}>{activeMatch.scoreSet2}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>
                    ⏱️ Tiempo transcurrido: <strong style={{ color: '#fff' }}>{formatElapsed(court.startTime)}</strong>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px', marginBottom: '14px' }}>
                  Pista libre lista para asignar
                </div>
              )}

              <div>
                {!isFree && activeMatch ? (
                  <button
                    onClick={() => setModalMatch(activeMatch)}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    🏆 Finalizar & Registrar Marcador
                  </button>
                ) : (
                  scheduledMatches.length > 0 && (
                    <button
                      onClick={() => onAssignCourt(court.id, scheduledMatches[0].id)}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '10px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      ▶️ Asignar: {scheduledMatches[0].pair1Names} vs {scheduledMatches[0].pair2Names}
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Marcador */}
      {modalMatch && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#081513', border: '2px solid #10b981', borderRadius: '20px', padding: '28px', maxWidth: '500px', width: '90%', color: '#fff' }}>
            <h3 style={{ margin: '0 0 16px 0', textAlign: 'center' }}>Registrar Resultado Final</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', margin: '20px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ display: 'block', fontSize: '15px' }}>{modalMatch.pair1Names}</strong>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={gamesP1}
                  onChange={(e) => setGamesP1(e.target.value)}
                  style={{ width: '65px', padding: '10px', fontSize: '22px', fontWeight: 800, textAlign: 'center', marginTop: '10px', borderRadius: '8px', background: '#000', color: '#fff', border: '1px solid #10b981' }}
                />
              </div>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#84cc16' }}>VS</span>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ display: 'block', fontSize: '15px' }}>{modalMatch.pair2Names}</strong>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={gamesP2}
                  onChange={(e) => setGamesP2(e.target.value)}
                  style={{ width: '65px', padding: '10px', fontSize: '22px', fontWeight: 800, textAlign: 'center', marginTop: '10px', borderRadius: '8px', background: '#000', color: '#fff', border: '1px solid #10b981' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => setModalMatch(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onFinishMatch(modalMatch.id, parseInt(gamesP1, 10), parseInt(gamesP2, 10));
                  setModalMatch(null);
                }}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirmar Marcador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourtManager;
