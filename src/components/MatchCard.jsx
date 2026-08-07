import React, { useEffect, useRef, useState } from 'react';

/**
 * ShareCard.jsx — Genera una tarjeta social (900×900, formato OpenGraph-compatible)
 * a partir del resultado del partido, usando <canvas>. Descargable como PNG
 * y con botón de compartir (Web Share API) cuando está disponible.
 */

const I18N = {
  es: { download: '⬇ Descargar PNG', share: '📤 Compartir', match: 'Resultado final · ', brand: 'PADELORGANIZERS.COM' },
  en: { download: '⬇ Download PNG', share: '📤 Share', match: 'Final score · ', brand: 'PADELORGANIZERS.COM' },
};

export default function ShareCard({ lang = 'es', pair1 = 'Galán / Lebrón', pair2 = 'Tapia / Coello', score1 = 6, score2 = 4, sets1 = 2, sets2 = 1, winner = 0 }) {
  const T = I18N[lang] || I18N.es;
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    drawCard();
    setReady(true);
  }, [score1, score2, sets1, sets2, winner]);

  function drawCard() {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;

    // Fondo degradado
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#071210');
    g.addColorStop(0.5, '#0e1e1b');
    g.addColorStop(1, '#122a24');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Acento decorativo
    ctx.fillStyle = 'rgba(16,185,129,0.15)';
    ctx.beginPath();
    ctx.arc(W - 60, 20, 240, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(132,204,22,0.06)';
    ctx.beginPath();
    ctx.arc(20, H, 260, 0, Math.PI * 2);
    ctx.fill();

    // Marca
    ctx.fillStyle = '#84cc16';
    ctx.font = 'bold 34px Arial';
    ctx.fillText('🎾 PADELORGANIZERS.COM', 56, 76);

    // Subtítulo
    ctx.fillStyle = '#94a3b8';
    ctx.font = '26px Arial';
    ctx.fillText(T.match, 56, 122);

    // Jugador 1
    drawPlayer(ctx, W / 2, 330, pair1, { sets: sets1, active: winner === 0, color1: '#38bdf8', color2: '#2563eb' });

    ctx.textAlign = 'center';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 40px Arial';
    ctx.fillText('VS', W / 2, 500);
    ctx.textAlign = 'left';

    // Jugador 2
    drawPlayer(ctx, W / 2, 600, pair2, { sets: sets2, active: winner === 1, color1: '#f43f5e', color2: '#be123c' });

    // Marcador central grande
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 130px Arial';
    ctx.fillText(`${score1} - ${score2}`, W / 2, 780);
    ctx.textAlign = 'left';

    // Pie
    ctx.fillStyle = '#64748b';
    ctx.font = '22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(T.brand, W / 2, H - 40);
  }

  function drawPlayer(ctx, x, y, opts) {
    const grad = ctx.createLinearGradient(x - 50, y, x + 50, y + 40);
    grad.addColorStop(0, opts.color1);
    grad.addColorStop(1, opts.color2);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x + 40, y + 18, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 34px Arial';
    ctx.textAlign = 'left';
    const label = opts.active ? `🏆 ${name}   ${opts.sets} sets` : `${name}   ${opts.sets} sets`;
    ctx.fillText(label, x - 120, y + 30);
  }

  const download = () => {
    const link = document.createElement('a');
    link.download = 'padelorganizers-partido.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${pair1} vs ${pair2}`, text: `${score1}-${score2} 🎾`, url });
        setShared(true);
      } catch (e) {
        /* cancelado */
      }
    } else {
      await navigator.clipboard?.writeText(url);
      setShared(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
      <canvas ref={canvasRef} width={900} height={900} style={{ width: '100%', maxWidth: 460, borderRadius: 16, border: '1px solid rgba(16,185,129,0.25)' }} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={download} disabled={!ready} style={btnStyle('#10b981')}>{T.download}</button>
        <button onClick={share} disabled={!ready} style={btnStyle('#2563eb')}>{shared ? '✅' : '📤 '}{T.share}</button>
      </div>
    </div>
  );
}

const btnStyle = (bg) => ({
  background: bg, color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 10,
  fontWeight: 800, fontSize: 13, cursor: 'pointer',
});