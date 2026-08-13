import React, { useState } from 'react';
import { setState, getState } from '../services/store';
import { parsePlayers, formatLabels } from '../services/playerImportService';

const I18N = {
  es: {
    title: '📥 Importar jugadores',
    subtitle: 'Pega tu lista en cualquier formato: CSV/Excel, parejas separadas por "/", o un nombre por línea. El sistema detecta el formato solo.',
    dropZone: '📋 Pega aquí tu lista de jugadores',
    placeholder: 'Ejemplos — todo funciona:\n\nCarlos Ruiz, 1750, 3.8\nAna Torres / Luisma Díaz\nLuis Pérez\n\nCSV y tabulaciones también valen. Name include Elo & Nivel si los tienes.',
    detect: 'Formato detectado',
    scanned: 'jugadores · {p} parejas',
    bad: 'Líneas no reconocidas',
    warnings: 'Duplicados ignorados — revisa la preview antes de importar.',
    importBtn: '✅ Importar al torneo',
    cancel: '← Cancelar',
    imported: '¡{n} jugadores importados!',
    preview: 'Vista previa',
    rowName: 'Nombre', rowElo: 'Elo', rowLevel: 'Nivel', rowPair: 'Pareja',
    noPair: '—', ok: 'Listo para importar', badHeader: 'Sin datos pendientes',
    fmtHints: [
      '1 línea por jugador: «Carlos Ruiz»',
      'Con datos: «Carlos Ruiz, 1750, 3.8» (o separado por tabulación)',
      'Parejas: «Ana Torres / Luisma Díaz»',
      'CSV de Excel copiado y pegado funciona tal cual',
    ],
  },
  en: {
    title: '📥 Import players',
    subtitle: 'Paste your roster in any format: CSV/Excel, pairs split by "/", or one player per line. The system detects the format automatically.',
    dropZone: '📋 Paste your player list here',
    placeholder: 'Examples — all work:\n\nCarlos Ruiz, 1750, 3.8\nAna Torres / Luisma Diaz\nLuis Perez\n\nCSV and tab-separated also works. Include Elo & Level if you have them.',
    detect: 'Detected format',
    scanned: 'players · {p} pairs',
    bad: 'Unrecognized lines',
    warnings: 'Duplicates skipped — review the preview before importing.',
    importBtn: '✅ Import to tournament',
    cancel: '← Cancel',
    imported: '{n} players imported!',
    preview: 'Preview',
    rowName: 'Name', rowElo: 'Elo', rowLevel: 'Level', rowPair: 'Pair',
    noPair: '—', ok: 'Ready to import', badHeader: 'No pending data',
    fmtHints: [
      '1 player per line: «Carlos Ruiz»',
      'With data: «Carlos Ruiz, 1750, 3.8» (or tab-separated)',
      'Pairs: «Ana Torres / Luisma Diaz»',
      'CSV copied from Excel works as-is',
    ],
  },
  fr: {
    title: '📥 Importer les joueurs',
    subtitle: 'Collez votre liste dans n\'importe quel format : CSV/Excel, paires séparées par "/", ou un joueur par ligne. Détection automatique.',
    dropZone: '📋 Collez votre liste de joueurs',
    placeholder: 'Exemples — tout fonctionne :\n\nCarlos Ruiz, 1750, 3.8\nAna Torres / Luisma Diaz\nLuis Pérez\n\nLe CSV et les tabulations marchent aussi.',
    detect: 'Format détecté',
    scanned: 'joueurs · {p} paires',
    bad: 'Lignes non reconnues',
    warnings: 'Doublons ignorés — vérifiez l\'aperçu avant d\'importer.',
    importBtn: '✅ Importer au tournoi',
    cancel: '← Annuler',
    imported: '{n} joueurs importés !',
    preview: 'Aperçu',
    rowName: 'Nom', rowElo: 'Elo', rowLevel: 'Niveau', rowPair: 'Paire',
    noPair: '—', ok: 'Prêt à importer', badHeader: 'Aucune donnée en attente',
    fmtHints: [
      '1 joueur par ligne : « Carlos Ruiz »',
      'Avec données : « Carlos Ruiz, 1750, 3.8 » (ou tabulation)',
      'Paires : « Ana Torres / Luisma Diaz »',
      'CSV copié d\'Excel fonctionne directement',
    ],
  },
  pt: {
    title: '📥 Importar jogadores',
    subtitle: 'Cole a sua lista em qualquer formato: CSV/Excel, pares separados por "/", ou um jogador por linha. Deteção automática.',
    dropZone: '📋 Cole a sua lista de jogadores',
    placeholder: 'Exemplos — tudo funciona:\n\nCarlos Ruiz, 1750, 3.8\nAna Torres / Luisma Diaz\nLuis Pérez\n\nCSV e separadores tab também funcionam.',
    detect: 'Formato detetado',
    scanned: 'jogadores · {p} pares',
    bad: 'Linhas não reconhecidas',
    warnings: 'Duplicados ignorados — reveja a pré-visualização antes de importar.',
    importBtn: '✅ Importar para o torneio',
    cancel: '← Cancelar',
    imported: '{n} jogadores importados!',
    preview: 'Pré-visualização',
    rowName: 'Nome', rowElo: 'Elo', rowLevel: 'Nível', rowPair: 'Par',
    noPair: '—', ok: 'Pronto para importar', badHeader: 'Sem dados pendentes',
    fmtHints: [
      '1 jogador por linha: « Carlos Ruiz »',
      'Com dados: « Carlos Ruiz, 1750, 3.8 » (ou separado por tab)',
      'Pares: « Ana Torres / Luisma Diaz »',
      'CSV copiado do Excel funciona direto',
    ],
  },
};

const card = { background: 'var(--padel-card-bg)', border: '1px solid var(--padel-border)', borderRadius: 16, padding: 18 };
const ghostBtn = { background: 'transparent', color: 'var(--padel-muted)', border: '1px solid var(--padel-border)', padding: '9px 14px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' };
const primaryBtn = { background: 'linear-gradient(135deg, var(--padel-emerald) 0%, var(--padel-emerald-dark) 100%)', color: '#fff', border: 'none', padding: '11px 18px', borderRadius: 10, fontWeight: 800, fontSize: 13.5, cursor: 'pointer' };

export default function PlayerImporter({ lang = 'es', onDone }) {
  const T = I18N[lang] || I18N.es;
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [msg, setMsg] = useState('');

  const analyze = (value) => {
    setText(value);
    const res = parsePlayers(value);
    setParsed(res);
  };

  const doImport = async () => {
    if (!parsed || parsed.players.length === 0) { setMsg(T.badHeader); return; }
    const cur = getState() || {};
    const existing = new Set((cur.players || []).map(p => (p.name || '').toLowerCase()));
    const fresh = parsed.players.filter(p => !existing.has(p.name.toLowerCase()));
    const nextPlayers = [...(cur.players || []), ...fresh];
    // si hay parejas detectadas y el torneo aún no las tiene, las añadimos también
    const nextPairs = [...(cur.pairs || [])];
    (parsed.pairs || []).forEach(p => {
      const exists = nextPairs.some(x => x.player1 === p.player1 && x.player2 === p.player2);
      if (!exists) nextPairs.push({ id: p.id, player1: p.player1, player2: p.player2, ranking: nextPairs.length + 1, points: 0, gamesWon: 0, gamesLost: 0, diff: 0, matchesPlayed: 0 });
    });
    setState({ ...cur, players: nextPlayers, pairs: nextPairs });
    setMsg(T.imported.replace('{n}', String(nextPlayers.length)));
    if (onDone) setTimeout(onDone, 1200);
  };

  const fmtHintsVisible = T.fmtHints;
  const detectLabel = parsed && formatLabels()[parsed.format];
  const badLines = parsed ? parsed.warnings.filter(w => !w.startsWith('dup:')).length : 0;
  const dupes = parsed ? parsed.warnings.filter(w => w.startsWith('dup:')).length : 0;
  const orphanPlayers = parsed ? parsed.players.filter(p => !p.pairId).length : 0;

  return (
    <div style={{ padding: '28px 0 64px', minHeight: '80vh' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--padel-text)', margin: 0 }}>{T.title}</h1>
            <p style={{ fontSize: 13, color: 'var(--padel-muted)', margin: '6px 0 0', maxWidth: 640 }}>{T.subtitle}</p>
          </div>
          <button onClick={() => onDone && onDone()} style={ghostBtn}>{T.cancel}</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16, alignItems: 'start', marginTop: 18 }}>
          <div style={card}>
            <label style={{ fontSize: 13, fontWeight: 800, color: 'var(--padel-text)', display: 'block', marginBottom: 8 }}>{T.dropZone}</label>
            <textarea
              value={text}
              onChange={e => analyze(e.target.value)}
              placeholder={T.placeholder}
              rows={9}
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid var(--padel-border)', background: 'var(--padel-hover-bg)', color: 'var(--padel-text)', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6 }}
            />
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--padel-muted)', display: 'grid', gap: 4 }}>
              <div style={{ fontWeight: 800, color: 'var(--padel-lime)', marginBottom: 2 }}>💡 {T.detect}: <b style={{ color: 'var(--padel-text)' }}>{detectLabel || '—'}</b></div>
              {fmtHintsVisible.map((h, i) => <div key={i}>· {h}</div>)}
            </div>
            <button onClick={doImport} disabled={!parsed || parsed.players.length === 0} style={{ ...primaryBtn, width: '100%', marginTop: 14, opacity: (!parsed || parsed.players.length === 0) ? 0.5 : 1 }}>
              {T.importBtn}
            </button>
            {msg && <p style={{ fontSize: 13, color: 'var(--padel-lime)', margin: '10px 0 0', fontWeight: 700 }}>{msg}</p>}
          </div>

          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--padel-text)', margin: 0 }}>{T.preview}</h3>
              {parsed && (
                <span style={{ fontSize: 12, fontWeight: 800, color: parsed.players.length ? 'var(--padel-lime)' : 'var(--padel-muted)' }}>
                  {parsed.players.length} {T.rowName.toLowerCase()} · {parsed.pairs.length} {T.rowPair.toLowerCase()}
                </span>
              )}
            </div>

            {!parsed || parsed.players.length === 0 ? (
              <p style={{ color: 'var(--padel-muted)', fontSize: 13 }}>{T.badHeader}</p>
            ) : (
              <>
                <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid var(--padel-border)', borderRadius: 10 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: 'var(--padel-hover-bg)' }}>
                        <th style={{ padding: '7px 10px', textAlign: 'left', color: 'var(--padel-muted)', fontWeight: 800 }}>{T.rowName}</th>
                        <th style={{ padding: '7px 8px', textAlign: 'right', color: 'var(--padel-muted)', fontWeight: 800 }}>{T.rowElo}</th>
                        <th style={{ padding: '7px 8px', textAlign: 'right', color: 'var(--padel-muted)', fontWeight: 800 }}>{T.rowLevel}</th>
                        <th style={{ padding: '7px 10px', textAlign: 'center', color: 'var(--padel-muted)', fontWeight: 800 }}>{T.rowPair}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsed.players.map((p, i) => (
                        <tr key={p.id} style={{ borderTop: '1px solid var(--padel-border)' }}>
                          <td style={{ padding: '6px 10px', fontWeight: 700, color: 'var(--padel-text)' }}>{p.name}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--padel-text)' }}>{p.elo}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', color: '#38bdf8', fontWeight: 700 }}>{p.level.toFixed(1)}</td>
                          <td style={{ padding: '6px 10px', textAlign: 'center', color: p.pairId ? 'var(--padel-lime)' : 'var(--padel-muted)', fontSize: 11 }}>
                            {p.pairId ? '🧑 🤝 🧑' : T.noPair}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(dupes > 0 || badLines > 0 || orphanPlayers > 0) && (
                  <p style={{ fontSize: 11.5, color: '#fbbf24', margin: '10px 0 0', lineHeight: 1.5 }}>
                    ⚠️ {T.warnings}
                    {dupes > 0 ? ` (${dupes} dup)` : ''}
                    {(orphanPlayers > 0 && parsed.pairs.length) ? ` · ${orphanPlayers} ${T.noPair}` : ''}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <p style={{ fontSize: 11.5, color: 'var(--padel-muted)', marginTop: 16, textAlign: 'center' }}>
          {T.scanned.replace('{p}', String(parsed ? parsed.pairs.length : 0))} {T.ok}
        </p>
      </div>
    </div>
  );
}