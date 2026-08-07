/**
 * exportService.js — Exportación CSV y PDF de ranking y resultados.
 * Sin dependencias externas: CSV nativo y PDF mediante impresión/guardado
 * del navegador (window.print con entorno limpio).
 */

export function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function esc(v) {
  return String(v ?? '');
}

function escCSV(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCSV(rows) {
  return '\uFEFF' + rows.map(r => r.map(escCSV).join(',')).join('\n');
}

// ---------- export CSV ----------
export function exportRankingCSV(state) {
  const rows = [['#', 'Pareja', 'Puntos', 'Juegos G', 'Juegos P', 'Dif', 'Partidos']];
  [...state.pairs]
    .sort((a, b) => b.points - a.points || b.diff - a.diff)
    .forEach((p, i) => rows.push([i + 1, `${p.player1} / ${p.player2}`, p.points, p.gamesWon, p.gamesLost, p.diff, p.matchesPlayed]));
  download('padelorganizers-ranking.csv', toCSV(rows), 'text/csv;charset=utf-8');
}

export function exportMatchesCSV(state) {
  const rows = [['Ronda', 'Pareja A', 'Pareja B', 'Estado', 'Resultado']];
  state.matches.forEach(m =>
    rows.push([m.round, m.pair1Names, m.pair2Names, m.status, m.status === 'completed' ? `${m.scoreSet1}` : ''])
  );
  download('padelorganizers-partidos.csv', toCSV(rows), 'text/csv;charset=utf-8');
}

// ---------- exports PDF (vía ventana de impresión) ----------
function sectionHTML(title, head, rows) {
  const thead = head.map(h => `<th style="text-align:left;border-bottom:2px solid #10b981;padding:8px;color:#059669;font-weight:800">${esc(h)}</th>`).join('');
  const tbody = rows
    .map(r => `<tr>${r.map(c => `<td style="padding:8px;border-bottom:1px solid #e5e7eb;font-size:13px">${esc(c)}</td>`).join('')}</tr>`)
    .join('');
  return `<h2 style="color:#0f172a;font-size:16px;margin:20px 0 8px">${title}</h2>
    <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif">
      <thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody>
    </table>`;
}

export function openPrintPDF(state) {
  const sortedPairs = [...state.pairs].sort((a, b) => b.points - a.points || b.diff - a.diff);
  const rankingRows = sortedPairs.map((p, i) => [i + 1, `${p.player1} / ${p.player2}`, p.points, p.diff, p.matchesPlayed]);
  const matchesRows = state.matches.map(m =>
    [m.round, m.pair1Names, m.pair2Names, m.status, m.status === 'completed' ? `${m.scoreSet1}` : '']
  );

  const body =
    sectionHTML('Clasificación', ['#', 'Pareja', 'Puntos', 'Dif', 'Partidos'], rankingRows) +
    sectionHTML('Partidos', ['Ronda', 'Pareja A', 'Pareja B', 'Estado', 'Resultado'], matchesRows);

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(state.tournament.name)}</title></head>
  <body style="font-family:Arial,sans-serif;padding:28px;color:#0f172a">
    <h1 style="color:#059669;font-size:24px;margin:0 0 4px">🎾 ${esc(state.tournament.name)}</h1>
    <p style="color:#64748b;font-size:13px;margin:0 0 8px">${esc(state.tournament.club || '')}</p>
    ${body}
    <p style="color:#94a3b8;font-size:11px;margin-top:22px">Generado por PADELORGANIZERS.COM</p>
  </body></html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
}