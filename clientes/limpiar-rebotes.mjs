import { readFileSync, writeFileSync } from 'node:fs';

function parseCsv(text){
  const rows=[];
  for(const line of text.split(/\r?\n/)){
    const cells=[]; let cur=''; let inQ=false;
    for(let i=0;i<line.length;i++){
      const ch=line[i];
      if(inQ){
        if(ch=='"' && line[i+1]=='"'){cur+='"'; i++;}
        else if(ch=='"') inQ=false;
        else cur+=ch;
      } else if(ch=='"') inQ=true;
      else if(ch==','){cells.push(cur); cur='';}
      else cur+=ch;
    }
    cells.push(cur);
    rows.push(cells.map(c=>c.trim()));
  }
  return rows.filter(r=>r.some(c=>c.length>0));
}

const rebotes = new Set(
  readFileSync('clientes/rebotes.csv','utf8')
    .split(/\r?\n/).slice(1)
    .map(l=>l.split(',')[0].replace(/"/g,'').trim().toLowerCase())
    .filter(Boolean)
);
console.log('Rebotes únicos:', rebotes.size);

const csvText = readFileSync('clientes/leads_pendientes.csv','utf8');
const rows = parseCsv(csvText);
const headers = rows[0];
const emailIdx = headers.findIndex(h=>h.toLowerCase().includes('correo'));
let matched=0;

const logPath='clientes/campana_log_leads_pendientes.csv';
let logText = readFileSync(logPath,'utf8');
let logRows = parseCsv(logText);
let logHeader=logRows[0];
const estadoIdx = logHeader.indexOf('estado');
const errorIdx = logHeader.indexOf('error');
let updated=0;

for(let i=0;i<rows.length-1;i++){
  const email=(rows[i+1][emailIdx]||'').trim().toLowerCase();
  if(rebotes.has(email)){
    matched++;
    const r = logRows.find(r=>r[0]===String(i));
    if(r && r[estadoIdx]!=='sin-correo'){
      r[estadoIdx]='sin-correo';
      r[errorIdx]='rebote duro histórico (65) - excluido';
      updated++;
    }
  }
}
console.log('Leads pendientes que son rebote:', matched);
console.log('Log filas actualizadas a sin-correo:', updated);

const out = [logHeader.join(',')].concat(
  logRows.slice(1).map(r=>r.map(c=>'"'+String(c||'').replace(/"/g,'""')+'"').join(','))
).join('\n');
writeFileSync(logPath, out, 'utf8');
console.log('Log limpiado.');

// conteo final
import { readFileSync as r2 } from 'node:fs';
const log2 = parseCsv(readFileSync(logPath,'utf8'));
const counts={};
for(const r of log2.slice(1)){ const e=r[estadoIdx]||'pendiente'; counts[e]=(counts[e]||0)+1; }
console.log('Conteo final:', counts);
