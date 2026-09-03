import nodemailer from 'nodemailer';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
function loadEnv(){
  const p=join(ROOT,'.env');
  if(!existsSync(p)) return {};
  const o={};
  for(const l of readFileSync(p,'utf8').split(/\r?\n/)){
    const m=l.match(/^\s*([A-Za-z_][A-Za-z0-9_-]*)\s*=\s*(.*)\s*$/);
    if(m) o[m[1]]=m[2].replace(/^["']|["']$/g,'').trim();
  }
  return o;
}
const env=loadEnv();
const GMAIL_USER=env.GMAIL_USER;
const GMAIL_APP_PASS=(env.GMAIL_APP_PASS||env['GOOGLE-APP-KEY']||'').replace(/\s+/g,'');

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method not allowed'});
  const { email, name, tournament, club, lang='es' } = req.body||{};
  if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({error:'email required'});
  if(!GMAIL_USER || !GMAIL_APP_PASS) return res.status(200).json({ ok:true, demo:true, message:'No email config, demo' });

  const subject = lang==='en' ? `Welcome to PADELORGANIZERS — ${tournament||'your tournament'} is ready` : `Bienvenido a PADELORGANIZERS — ${tournament||'tu torneo'} listo`;
  const html = lang==='en'
    ? `<p>Hi ${name||'organizer'},</p><p>Your tournament <b>${tournament||'—'}</b> at <b>${club||'your club'}</b> is created. Next: <b>Import 8 pairs → Generate draw → Share link</b>.</p><p><a href="https://padelorganizers.vercel.app/control">Go to Control Center →</a></p><p>— Team Padel Organizers</p>`
    : `<p>Hola ${name||'organizador'},</p><p>Tu torneo <b>${tournament||'—'}</b> en <b>${club||'tu club'}</b> está creado. Siguiente: <b>Importa 8 parejas → Genera cuadro → Comparte link</b>.</p><p><a href="https://padelorganizers.vercel.app/control">Ir a Central de Control →</a></p><p>— Equipo Padel Organizers</p>`;

  try{
    const tr=nodemailer.createTransport({ host:'smtp.gmail.com', port:465, secure:true, auth:{ user:GMAIL_USER, pass:GMAIL_APP_PASS }});
    await tr.sendMail({ from:`Padel Organizers <${GMAIL_USER}>`, to: email, subject, html });
    return res.status(200).json({ ok:true });
  }catch(e){
    return res.status(500).json({ error: String(e.message||e) });
  }
}
