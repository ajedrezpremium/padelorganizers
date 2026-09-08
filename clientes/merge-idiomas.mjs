import fs from 'node:fs';
const j=JSON.parse(fs.readFileSync('public/clubes-semilla.json','utf8'));
function csvToJson(f, start){
  const txt=fs.readFileSync(f,'utf8');
  const lines=txt.split(/\r?\n/).filter(Boolean);
  const h=lines[0].split(',').map(x=>x.trim());
  let id=start;
  const out=[];
  for(let i=1;i<lines.length;i++){
    const cells=lines[i].split(',').map(c=>c.trim().replace(/^"|"$/g,''));
    const o={}; h.forEach((hh,idx)=>o[hh]=cells[idx]||'');
    out.push({id:'c-'+(id++), name:o['Nombre'], city:o['Dirección'].split(',').pop()?.trim()||o['Nombre'].split(' ').pop(), province:'', country: f.includes('uk')?'GB':f.includes('usa')?'US':f.includes('francia')?'FR':f.includes('portugal')?'PT':'BR', address:o['Dirección'], latitude:null, longitude:null, geo_approx:true, phone:o['Teléfono'], email:o['Correo'], website:o['Página Web'], courts:o['Pistas']?o['Pistas']+' pistas':'', indoor:null, grass:'', booking_platform:o['Plataforma de Reserva']||'N/A', has_school:false, has_shop:false, is_verified:false, is_featured:false, status:'pendiente_verificacion', description:''});
  }
  return out;
}
let next=3000;
const files=['clientes/leads_uk.csv','clientes/leads_usa.csv','clientes/leads_francia.csv','clientes/leads_portugal.csv','clientes/leads_brasil.csv'];
let added=[];
for(const f of files){ const a=csvToJson(f,next); next+=a.length; added.push(...a); }
const merged=[...j, ...added];
fs.writeFileSync('public/clubes-semilla.json', JSON.stringify(merged,null,2));
console.log('Added',added.length,'total',merged.length);
