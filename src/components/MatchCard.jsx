import React, { useEffect, useRef, useState } from 'react';

/**
 * ShareCard.jsx — Genera una tarjeta social (900×900, formato OpenGraph-compatible)
 * a partir del resultado del partido, usando <canvas>. Descargable como PNG
 * y con botón de compartir (Web Share API) cuando está disponible.
 * Soporta avatares de jugadores (foto + bandera) cuando se pasan players1/players2.
 */

const I18N = {
  es: { download: '⬇ Descargar PNG', share: '📤 Compartir', match: 'Resultado final · ', brand: 'PADELORGANIZERS.COM', vs: 'VS' },
  en: { download: '⬇ Download PNG', share: '📤 Share', match: 'Final score · ', brand: 'PADELORGANIZERS.COM', vs: 'VS' },
  fr: { download: '⬇ Télécharger PNG', share: '📤 Partager', match: 'Résultat final · ', brand: 'PADELORGANIZERS.COM', vs: 'VS' },
  pt: { download: '⬇ Baixar PNG', share: '📤 Partilhar', match: 'Resultado final · ', brand: 'PADELORGANIZERS.COM', vs: 'VS' },
};

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

export default function ShareCard({ lang = 'es', pair1 = 'Galán / Lebrón', pair2 = 'Tapia / Coello', score1 = 6, score2 = 4, sets1 = 2, sets2 = 1, winner = 0, players1 = [], players2 = [] }) {
  const T = I18N[lang] || I18N.es;
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [shared, setShared] = useState(false);
  const [imgs, setImgs] = useState({});

  useEffect(() => {
    // Precargar fotos de jugadores para dibujarlas en el canvas
    const all = [...players1, ...players2];
    if (all.length) {
      const cache = {};
      let pending = 0;
      all.forEach((p) => {
        if (!p.photo) return;
        pending++;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => { cache[p.name] = img; if (--pending === 0) setImgs({ ...cache }); };
        img.onerror = () => { if (--pending === 0) setImgs({ ...cache }); };
        img.src = p.photo;
      });
      if (pending === 0) setImgs({});
    }
  }, [players1, players2]);

  useEffect(() => {
    drawCard();
    setReady(true);
  }, [score1, score2, sets1, sets2, winner, imgs]);

  function circleClip(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
  }

  function drawAvatar(ctx, ficha, x, y, r) {
    const img = imgs[ficha?.name];
    ctx.save();
    circleClip(ctx, x, y, r);
    ctx.fillStyle = '#0f766e';
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    if (img) {
      const min = Math.min(img.width, img.height);
      const s = r * 2 / min;
      const dx = (min - img.width) / 2 * s, dy = (min - img.height) / 2 * s;
      ctx.drawImage(img, x - r + dx, y - r + dy, img.width * s, img.height * s);
    } else {
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${r * 0.95}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const ini = (ficha?.name || 'J')
        .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');
      ctx.fillText(ini, x, y + 2);
    }
    ctx.restore();
    if (ficha?.flag) {
      ctx.font = `${r * 0.62}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ficha.flag, x + r * 0.82, y + r * 0.82);
    }
  }

  function drawPair(ctx, cx, y, ficha1, ficha2, opts) {
    // Avatar izquierdo
    drawAvatar(ctx, ficha1, cx - 120, y, 62);
    // Avatar derecho (superpuesto)
    drawAvatar(ctx, ficha2, cx + 20, y, 62);
    ctx.save();
    roundRect(ctx, cx - 190, y - 85, 280, 52, 12);
    ctx.fillStyle = opts.active ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.06)';
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = opts.active ? '#84cc16' : '#e2e8f0';
    ctx.font = 'bold 34px Arial';
    ctx.textAlign = 'center';
    const label = `${opts.label}   ${opts.sets} ${opts.sets === 1 ? 'set' : 'sets'}`;
    ctx.fillText(label, cx - 50, y - 50);
    if (opts.sub) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '24px Arial';
      ctx.fillText(opts.sub, cx - 50, y - 14);
    }
  }

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

    // Jugadores (fotos) o texto si no hay fichas
    if (players1.length === 2 && players2.length === 2) {
      drawPair(ctx, W / 2, 320, players1[0], players1[1], { label: pair1, sets: sets1, active: winner === 0, sub: players1.map((p) => p.name.split(' ')[0]).join(' + ') });
      drawPair(ctx, W / 2, 610, players2[0], players2[1], { label: pair2, sets: sets2, active: winner === 1, sub: players2.map((p) => p.name.split(' ')[0]).join(' + ') });
    } else {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 40px Arial';
      ctx.fillText(`${winner === 0 ? '🏆 ' : ''}${pair1}   ${sets1} sets`, W / 2 - 220, 350);
      ctx.fillStyle = '#f43f5e';
      ctx.fillText(`${winner === 1 ? '🏆 ' : ''}${pair2}   ${sets2} sets`, W / 2 - 220, 620);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 40px Arial';
    ctx.fillText(T.vs, W / 2, 465);

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