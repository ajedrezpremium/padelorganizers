import nodemailer from 'nodemailer';
// Credenciales SOLO de variables de entorno (Vercel Env Vars / `vercel dev`).
// Nunca leer .env desde disco: evita empaquetar secretos con la función.
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASS = (process.env.GMAIL_APP_PASS || '').replace(/\s+/g, '');

// Escape HTML básico: name/tournament/club son input del usuario y van interpolados.
function esc(v = '') {
  return String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method not allowed'});
  const { email, name, tournament, club, lang='es' } = req.body||{};
  if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({error:'email required'});
  if(!GMAIL_USER || !GMAIL_APP_PASS) return res.status(200).json({ ok:true, demo:true, message:'No email config, demo' });

  const subject = lang==='en' ? `Welcome to PADELORGANIZERS — ${esc(tournament)||'your tournament'} is ready` : `Bienvenido a PADELORGANIZERS — ${esc(tournament)||'tu torneo'} listo`;
  const html = lang==='en'
    ? `<p>Hi ${esc(name)||'organizer'},</p><p>Your tournament <b>${esc(tournament)||'—'}</b> at <b>${esc(club)||'your club'}</b> is created. Next: <b>Import 8 pairs → Generate draw → Share link</b>.</p><p><a href="https://padelorganizers.vercel.app/control">Go to Control Center →</a></p><p>— Team Padel Organizers</p>`
    : `<p>Hola ${esc(name)||'organizador'},</p><p>Tu torneo <b>${esc(tournament)||'—'}</b> en <b>${esc(club)||'tu club'}</b> está creado. Siguiente: <b>Importa 8 parejas → Genera cuadro → Comparte link</b>.</p><p><a href="https://padelorganizers.vercel.app/control">Ir a Central de Control →</a></p><p>— Equipo Padel Organizers</p>`;

  try{
    const tr=nodemailer.createTransport({ host:'smtp.gmail.com', port:465, secure:true, auth:{ user:GMAIL_USER, pass:GMAIL_APP_PASS }});
    await tr.sendMail({ from:`Padel Organizers <${GMAIL_USER}>`, to: email, subject, html });
    return res.status(200).json({ ok:true });
  }catch(e){
    return res.status(500).json({ error: String(e.message||e) });
  }
}
