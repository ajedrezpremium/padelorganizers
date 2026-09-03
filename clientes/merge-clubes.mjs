import fs from 'node:fs';
const json = JSON.parse(fs.readFileSync('public/clubes-semilla.json','utf8'));
function csvToJson(file, startId){
  const txt=fs.readFileSync(file,'utf8');
  const lines=txt.split(/\r?\n/).filter(Boolean);
  const headers=lines[0].split(',').map(h=>h.trim());
  let id=startId;
  const out=[];
  for(let i=1;i<lines.length;i++){
    const cells=lines[i].split(',').map(c=>c.trim().replace(/^"|"$/g,''));
    const o={}; headers.forEach((h,idx)=>o[h]=cells[idx]||'');
    out.push({
      id: 'c-'+(id++),
      name: o['Nombre'],
      city: (o['Dirección']||'').split(',').pop()?.trim()|| o['Nombre'].split(' ').pop(),
      province: '',
      country: file.includes('argentina')?'AR':file.includes('mexico')?'MX':file.includes('italia')?'IT':'ES',
      address: o['Dirección'],
      latitude: null, longitude: null, geo_approx: true,
      phone: o['Teléfono'], email: o['Correo'], website: o['Página Web'],
      courts: o['Pistas']? o['Pistas']+' pistas':'', indoor: null, grass:'', booking_platform: o['Plataforma de Reserva']||'N/A',
      has_school:false, has_shop:false, is_verified:false, is_featured:false, status:'pendiente_verificacion', description:''
    });
  }
  return out;
}
let nextId=2000;
const files=['clientes/leads_caceres.csv','clientes/leads_soria.csv','clientes/leads_guadalajara.csv','clientes/leads_santa-cruz.csv','clientes/leads_las-palmas.csv','clientes/leads_argentina.csv','clientes/leads_mexico.csv','clientes/leads_italia.csv'];
let added=[];
for(const f of files){ const arr=csvToJson(f,nextId); nextId+=arr.length; added.push(...arr); }
const merged=[...json, ...added];
fs.writeFileSync('public/clubes-semilla.json', JSON.stringify(merged,null,2));
console.log('Added',added.length,'total',merged.length);
