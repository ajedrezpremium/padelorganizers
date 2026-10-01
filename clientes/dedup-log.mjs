import { readFileSync, writeFileSync } from 'node:fs';
function parseCsv(t){const r=[];for(const l of t.split(/\r?\n/)){const c=[];let cur='',inQ=false;for(let i=0;i<l.length;i++){const ch=l[i];if(inQ){if(ch=='"'&&l[i+1]=='"'){cur+='"';i++;}else if(ch=='"')inQ=false;else cur+=ch;}else if(ch=='"')inQ=true;else if(ch==','){c.push(cur);cur='';}else cur+=ch;}c.push(cur);r.push(c.map(x=>x.trim()));}return r.filter(x=>x.some(c=>c.length>0));}
const txt=readFileSync('clientes/campana_log_leads_pendientes.csv','utf8');
const rows=parseCsv(txt);
const header=rows[0];
const map=new Map();
for(const r of rows.slice(1)){ map.set(r[0], r); }
const out=[header.join(',')].concat([...map.values()].map(r=>r.map(c=>'"'+String(c||'').replace(/"/g,'""')+'"').join(','))).join('\n');
writeFileSync('clientes/campana_log_leads_pendientes.csv',out,'utf8');
console.log('Dedup: rows',rows.length-1,'unique',map.size,'lines',out.split('\n').length);
const counts={};
for(const r of [...map.values()]){ const e=r[header.indexOf('estado')]||'pendiente'; counts[e]=(counts[e]||0)+1; }
console.log(counts);
