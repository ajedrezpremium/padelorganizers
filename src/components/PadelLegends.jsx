import React, { useState } from 'react';

const LEGENDS = [
  { num: 1, name: 'Fernando Belasteguín', flag: '🇦🇷', elo: 2985, era: '2002-2024', country: 'Argentina', deed: '1 (Bela)', title: '17 años nº1 del mundo', bio: 'El jugador más dominante de la historia. 17 temporadas consecutivas al frente del ranking mundial y 16 campeonatos con Juan Martín Díaz.', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Bela_Campe%C3%B3n_del_Mundo.jpg/330px-Bela_Campe%C3%B3n_del_Mundo.jpg' },
  { num: 2, name: 'Juan Martín Díaz', flag: '🇦🇷', elo: 2960, era: '2002-2017', country: 'Argentina', deed: '1 (Bela)', title: 'La pareja más laureada', bio: 'Leyenda absoluta: 266 títulos y 16 años al máximo nivel junto a Belasteguín, la mejor dupla que ha dado el pádel.', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Juanmartindiaz-hernanauguste.jpg/330px-Juanmartindiaz-hernanauguste.jpg' },
  { num: 3, name: 'Alejandro Galán', flag: '🇪🇸', elo: 2940, era: '2020-2026', country: 'España', deed: '1', title: 'El nº1 de la era moderna', bio: 'Referente actual. Número 1 del mundo reinando por temporadas con Lebrón antes de la era de los "chicos".', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Alejandro_Gal%C3%A1n_-_240422_192225_%28cropped%29.jpg/330px-25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Alejandro_Gal%C3%A1n_-_240422_192225_%28cropped%29.jpg' },
  { num: 4, name: 'Juan Lebrón', flag: '🇪🇸', elo: 2930, era: '2020-2026', country: 'España', deed: '1', title: 'El martillo de El Puerto', bio: 'Número 1 del mundo y campeón del World Padel Tour con Galán. Potencia brutal y un revés letal.', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Vigo_Open_2019_de_World_Padel_Tour_-_34.jpg/330px-Vigo_Open_2019_de_World_Padel_Tour_-_34.jpg' },
  { num: 5, name: 'Pablo Lima', flag: '🇧🇷', elo: 2915, era: '2004-2020', country: 'Brasil', deed: '1', title: 'El mejor brasileño de la historia', bio: 'Ocupó el nº1 mundial y formó pareja legendaria con Belasteguín tras la era de J.M. Díaz. Podio constante 15 años.', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Lima_WPT_tenerife.jpg/330px-Lima_WPT_tenerife.jpg' },
  { num: 6, name: 'Paquito Navarro', flag: '🇪🇸', elo: 2890, era: '2012-2024', country: 'España', deed: '2', title: 'El fenómeno mediático', bio: 'El jugador con más carisma del circuito. Top-3 mundial, especialista en bandejas imposibles y claves en pantalla.' },
  { num: 7, name: 'Agustín Tapia', flag: '🇦🇷', elo: 2880, era: '2021-2026', country: 'Argentina', deed: '1', title: 'La zurda de oro', bio: 'Virtuoso técnico con una zurda histórica. Reinó como nº1 con Coello al pulso de la era de máxima velocidad.', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Augustin_Tapia_%28cropped%29.jpg/330px-Augustin_Tapia_%28cropped%29.jpg' },
  { num: 8, name: 'Arturo Coello', flag: '🇪🇸', elo: 2870, era: '2022-2026', country: 'España', deed: '1', title: 'El jugador total', bio: 'Formidable en todos los golpes. Comparte trono mundial con Tapia domando la nueva generación de torneos.', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Arturo_Coello_%28cropped%29.jpg/330px-Arturo_Coello_%28cropped%29.jpg' },
  { num: 9, name: 'Sanyo Gutiérrez', flag: '🇦🇷', elo: 2850, era: '2012-2024', country: 'Argentina', deed: '1', title: 'La magia de Arroyo Seco', bio: 'Número 1 del mundo y el jugador más completo del circuito por lectura. Con Paquito o Tapia, siempre en la élite.', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Santo_Guti%C3%A9rrez_and_Pato_Paradiso%2C_World_Padel_Championship_Dubai_2022.jpg/330px-Santo_Guti%C3%A9rrez_and_Pato_Paradiso%2C_World_Padel_Championship_Dubai_2022.jpg' },
  { num: 10, name: 'Franco Stupaczuk', flag: '🇦🇷', elo: 2830, era: '2016-2026', country: 'Argentina', deed: '2', title: 'El todoterreno', bio: 'De la cuna argentina al top mundial. Poder físico y golpeo imponente durante más de una década.', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Vigo_Open_2019_de_World_Padel_Tour_-_38.jpg/330px-Vigo_Open_2019_de_World_Padel_Tour_-_38.jpg' },
  { num: 11, name: 'Martín Di Nenno', flag: '🇦🇷', elo: 2810, era: '2016-2026', country: 'Argentina', deed: '2', title: 'El cañonero', bio: 'El pegador más temido de sus generación. Subcampeón del mundo y referente eterno del revés plano.', photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Mart%C3%ADn_Di_Nenno.jpg/330px-Mart%C3%ADn_Di_Nenno.jpg' },
  { num: 12, name: 'Juani Mieres', flag: '🇦🇷', elo: 2780, era: '2004-2019', country: 'Argentina', deed: '2', title: 'El técnico perfecto', bio: 'Jugador referencia y posteriormente maestro. Bella técnica y ganador por méritos propios durante 15 años.' },
  { num: 13, name: 'Juan Tello', flag: '🇦🇷', elo: 2760, era: '2016-2026', country: 'Argentina', deed: '2', title: 'El zurdo eléctrico', bio: 'Golpeo único y velocidad endiablada. Comparte título con Stupaczuk en la nueva dupla argentina de élite.' },
  { num: 14, name: 'Coki Nieto', flag: '🇪🇸', elo: 2740, era: '2020-2026', country: 'España', deed: '3', title: 'La nueva escuela sevillana', bio: 'Finalista de la era actual. Junto a Jon Sanz forma una de las parejas jóvenes que marcan el relevo.' },
  { num: 15, name: 'Jon Sanz', flag: '🇪🇸', elo: 2720, era: '2020-2026', country: 'España', deed: '3', title: 'El pegador de Pamplona', bio: 'Potencia descomunal desde el fondo. Renovó a la pareja española en los primeros puestos mundiales.' },
  { num: 16, name: 'Álex Ruiz', flag: '🇪🇸', elo: 2700, era: '2019-2026', country: 'España', deed: '3', title: 'El bastión andaluz', bio: 'Nombrado en el Top-4 en varias temporadas. Sólido desde la derecha, con un constante podio.' },
  { num: 17, name: 'Miguel Lamperti', flag: '🇦🇷', elo: 2680, era: '2000-2022', country: 'Argentina', deed: '—', title: 'El eterno capitán', bio: 'El más veterano en manterse en el Top-30 durante más de dos décadas. Dios de la defensa y el humor.' },
  { num: 18, name: 'Christian Gutiérrez', flag: '🇲🇽', elo: 2660, era: '2008-2021', country: 'México', deed: '2', title: 'El profeta mexicano', bio: 'El mejor jugador de la historia de México. Ocupó el Top-5 mundial y difundió el pádel en todo el continente.' },
  { num: 19, name: 'Alejandro Lasaigues', flag: '🇦🇷', elo: 2650, era: '1992-2002', country: 'Argentina', deed: 'MR', title: 'El campeón de la era épica', bio: 'Dos veces campeón del mundo por parejas antes del profesionalismo. De los padres fundadores del pádel moderno.' },
  { num: 20, name: 'Seba Nerone', flag: '🇦🇷', elo: 2640, era: '1993-2010', country: 'Argentina', deed: 'MR', title: 'El constructor de torres', bio: 'Campeón del mundos de parejas y leyenda fundacional. Su contribución al juego por delante marcó una época.' },
  { num: 21, name: 'Gemma Triay', flag: '🇪🇸', elo: 2630, era: '2018-2026', country: 'España', deed: '1', title: 'La reina femenina', bio: 'Número 1 femenino durante temporadas con Alejandra Salazar primero y su reinado con Claudia Fernández.' },
  { num: 22, name: 'Martita Ortega', flag: '🇪🇸', elo: 2620, era: '2019-2026', country: 'España', deed: '1', title: 'El poderío de Málaga', bio: 'Nº1 femenina del mundo. Nombre constante en finales de torneos importantes junto a Bea González.' },
  { num: 23, name: 'Bea González', flag: '🇪🇸', elo: 2610, era: '2019-2026', country: 'España', deed: '1', title: 'La zurda prodigio', bio: 'La joya de la nueva generación femenina. Junto a Martita alcanzó la cima del ranking mundial.' },
  { num: 24, name: 'Alejandra Salazar', flag: '🇪🇸', elo: 2600, era: '2013-2024', country: 'España', deed: '1', title: 'La leyenda madrileña', bio: 'Número 1 femenino, ganadora en más de 50 torneos grandes y referente total del pádel femenino español.' },
  { num: 25, name: 'Ariana Sánchez', flag: '🇪🇸', elo: 2590, era: '2019-2026', country: 'España', deed: '1', title: 'La número uno ordenada', bio: 'Nº1 femenina del mundo con Paula Josemaría. Precisión y constancia en la cima durante varias temporadas.' },
];

const I18N = {
  es: { title: '👑 Top 25 · Leyendas del Pádel', subtitle: 'Los 25 nombres que escribieron la historia de este deporte, de los pioneros a la era moderna.', legends: 'LEYENDAS', eras: 'ERAS', countries: 'PAÍSES', all: 'TODOS', men: '🏓 Caballeros', women: '👑 Damas', rating: 'ELO', deeds: 'Títulos', theBest: 'Mejor ranking' },
  en: { title: '👑 Top 25 · Padel Legends', subtitle: 'The 25 names that wrote this sport\u2019s history, from the pioneers to the modern era.', legends: 'LEGENDS', eras: 'ERAS', countries: 'COUNTRIES', all: 'ALL', men: '🏓 Men', women: '👑 Women', rating: 'ELO', deeds: 'Titles', theBest: 'Best ranking' },
  fr: { title: '👑 Top 25 · Légendes du Padel', subtitle: 'Les 25 noms qui ont écrit l\u2019histoire de ce sport, des pionniers à l\u2019ère moderne.', legends: 'LÉGENDES', eras: 'ÈRES', countries: 'PAYS', all: 'TOUS', men: '🏓 Messieurs', women: '👑 Dames', rating: 'ELO', deeds: 'Titres', theBest: 'Meilleur classement' },
  pt: { title: '👑 Top 25 · Lendas do Pádel', subtitle: 'Os 25 nomes que escreveram a história deste esporte, dos pioneiros à era moderna.', legends: 'LENDAS', eras: 'ERAS', countries: 'PAÍSES', all: 'TODOS', men: '🏓 Cavalheiros', women: '👑 Damas', rating: 'ELO', deeds: 'Títulos', theBest: 'Melhor ranking' },
};

const CARD_W = 150;
const CARD_H = 218;

function gradientFor(num) {
  if (num === 1) return 'linear-gradient(160deg,#fbbf24 0%,#b45309 120%)';
  if (num === 2) return 'linear-gradient(160deg,#e2e8f0 0%,#94a3b8 120%)';
  if (num === 3) return 'linear-gradient(160deg,#d6a26a 0%,#92400e 120%)';
  return 'linear-gradient(160deg,#10b981 0%,#065f46 130%)';
}

function antiFor(num) {
  if (num === 1) return '#78350f';
  if (num === 2) return '#334155';
  if (num === 3) return '#713f12';
  return '#064e3b';
}

export default function PadelLegends({ lang = 'es' }) {
  const T = I18N[lang] || I18N.es;
  const [era, setEra] = useState('ALL');
  const [gender, setGender] = useState('ALL');

  const eras = [...new Set(LEGENDS.map(l => l.era))].sort();
  const erasLabels = { '1992-2002': lang === 'es' ? 'Pioneros' : lang === 'fr' ? 'Pionniers' : lang === 'pt' ? 'Pioneiros' : 'Pioneers', '2000-2010': lang === 'es' ? 'Clásicos' : lang === 'fr' ? 'Classiques' : lang === 'pt' ? 'Clássicos' : 'Classics', '2002-2017': lang === 'es' ? 'La era dorada' : lang === 'fr' ? 'L\u2019âge d\u2019or' : lang === 'pt' ? 'Era de ouro' : 'Golden era', '2004-2019': lang === 'es' ? 'La era dorada' : lang === 'fr' ? 'L\u2019âge d\u2019or' : lang === 'pt' ? 'Era de ouro' : 'Golden era', '2004-2020': lang === 'es' ? 'La era dorada' : lang === 'fr' ? 'L\u2019âge d\u2019or' : lang === 'pt' ? 'Era de ouro' : 'Golden era', '2008-2021': lang === 'es' ? 'Expansión' : lang === 'fr' ? 'Expansion' : lang === 'pt' ? 'Expansão' : 'Expansion', '2012-2024': lang === 'es' ? 'Profesional' : lang === 'fr' ? 'Professionnel' : lang === 'pt' ? 'Profissional' : 'Pro era', '2013-2024': lang === 'es' ? 'Élite' : lang === 'fr' ? 'Élite' : lang === 'pt' ? 'Elite' : 'Elite', '2016-2026': lang === 'es' ? 'Élite' : lang === 'fr' ? 'Élite' : lang === 'pt' ? 'Elite' : 'Élite', '2018-2026': lang === 'es' ? 'Élite' : lang === 'fr' ? 'Élite' : lang === 'pt' ? 'Elite' : 'Elite', '2019-2026': lang === 'es' ? 'Élite' : lang === 'fr' ? 'Élite' : lang === 'pt' ? 'Elite' : 'Elite', '2020-2026': lang === 'es' ? 'Actualidad' : lang === 'fr' ? 'Actuel' : lang === 'pt' ? 'Atual' : 'Current' };

  const women = new Set(['Gemma Triay', 'Martita Ortega', 'Bea González', 'Alejandra Salazar', 'Ariana Sánchez']);
  const filtered = LEGENDS.filter(l => (era === 'ALL' || l.era === era) && (gender === 'ALL' || (gender === 'W' ? women.has(l.name) : !women.has(l.name))));
  const countryCount = new Set(LEGENDS.map(l => l.country)).size;

  return (
    <div style={{ maxWidth: 1120, margin: '28px auto 0', padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div>
          <h3 style={{ fontSize: 21, fontWeight: 900, color: '#fff', margin: 0 }}>{T.title}</h3>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>{T.subtitle}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setGender('ALL')} style={chip(gender === 'ALL')}>{T.all}</button>
          <button onClick={() => setGender('M')} style={chip(gender === 'M')}>{T.men}</button>
          <button onClick={() => setGender('W')} style={chip(gender === 'W')}>{T.women}</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        {['ALL', ...eras].map(e => (
          <button key={e} onClick={() => setEra(e)} style={chip(era === e)}>
            {e === 'ALL' ? T.all : `${e} · ${erasLabels[e] || ''}`}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(158px, 1fr))', gap: 14 }}>
          {filtered.map(l => <LegendCard key={l.num} l={l} T={T} />)}
        </div>
      ) : (
        <p style={{ color: '#64748b', fontSize: 14 }}>—</p>
      )}
    </div>
  );
}

function chip(active) {
  return {
    padding: '7px 14px', borderRadius: 20, border: active ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.15)',
    background: active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)', color: active ? '#a3e635' : '#cbd5e1',
    fontWeight: 700, fontSize: 11, cursor: 'pointer',
  };
}

function LegendCard({ l, T }) {
  const [flip, setFlip] = useState(false);
  return (
    <div
      onClick={() => setFlip(f => !f)}
      style={{ perspective: 900, cursor: 'pointer', userSelect: 'none' }}
      title={l.title}
    >
      <div style={{ transformStyle: 'preserve-3d', transition: 'transform 0.4s ease', transform: flip ? 'rotateY(180deg)' : 'rotateY(0deg)', width: CARD_W, height: CARD_H, position: 'relative', margin: '0 auto' }}>
        {/* frente */}
        <div style={face({ back: false, l })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: '#d1fae5', letterSpacing: 1 }}>{String(l.num).padStart(2, '0')}</span>
            <span style={{ fontSize: 16 }}>{l.flag}</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {l.photo ? (
              <img src={l.photo} alt={l.name} loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${l.num <= 3 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'}`, background: 'rgba(0,0,0,0.2)' }} />
            ) : (
              <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: `3px solid ${l.num <= 3 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>{l.flag}</div>
            )}
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 900, color: '#fff', lineHeight: 1.15, textAlign: 'center' }}>{l.name}</div>
          <div style={{ fontSize: 10, color: '#a7f3d0', fontWeight: 700, marginTop: 3 }}>{l.deed} · {l.elo}</div>
          <div style={{ fontSize: 9.5, color: '#86efac', marginTop: 4, opacity: 0.9, textAlign: 'center', lineHeight: 1.2 }}>{l.title}</div>
        </div>

        {/* reverso */}
        <div style={face({ back: true, l })}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: '#065f46', letterSpacing: 1, marginBottom: 4 }}>{T.theBest}</div>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#a3e635' }}>{l.flag} {l.country}</div>
          <div style={{ fontSize: 10, color: '#94a3b8', margin: '6px 0', lineHeight: 1.3 }}>{l.bio}</div>
          <div style={{ marginTop: 'auto', fontSize: 9, color: '#64748b' }}>{l.era}</div>
        </div>
      </div>
    </div>
  );
}

function face({ back, l }) {
  const base = {
    position: 'absolute', inset: 0, borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column',
    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', boxShadow: '0 8px 22px rgba(0,0,0,0.4)',
  };
  if (back) return { ...base, transform: 'rotateY(180deg)', background: 'linear-gradient(170deg,#ecfdf5 0%,#d1fae5 60%,#a7f3d0 100%)', color: '#064e3b' };
  return { ...base, background: gradientFor(l.num), border: `1px solid ${l.num <= 3 ? 'rgba(255,255,255,0.5)' : antiFor(l.num)}` };
}