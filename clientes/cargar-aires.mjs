import { readFileSync } from 'node:fs';
const data = JSON.parse(readFileSync('clientes/torneo-aires-2026.json','utf8'));
console.log('Para cargar el torneo AIRES 2026, ejecuta en la consola del navegador (F12) en https://padelorganizers.vercel.app:');
console.log(`
localStorage.setItem('padelorganizers-store-v1', JSON.stringify(${JSON.stringify(JSON.stringify(data))}));
localStorage.setItem('padelorganizers-tournaments', JSON.stringify({ "torneo-aires-2026": ${JSON.stringify(JSON.stringify(data))} }));
localStorage.setItem('padelorganizers-last-tournament-id', 'torneo-aires-2026');
location.href='/tournament/torneo-aires-2026';
`);
console.log('\nO usa el botón en /control → Cargar AIRES 2026 (próximamente)');
