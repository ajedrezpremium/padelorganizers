# 5 FUNCIONES PREMIUM — Hoja de ruta para la app nº1 mundial de eventos de pádel

Fecha: 07/08/2026

## Prioridad de implementación — ✅ TODAS COMPLETADAS (v1.1)
1. ✅ **LiveScore Pro (retransmisión en vivo + tarjeta social)** ← en producción
2. ✅ Motor de re-pareo predictivo (IA) ← en producción
3. ✅ App club con reservas + Stripe (pago en vivo) ← en producción
4. ✅ Analíticas y pronósticos (Elo + rendimiento) ← **nuevo en v1.1**
5. ✅ Ranked league persistente con badge de club ← **nuevo en v1.1**

---

### 1. 🎯 LiveScore Pro — Retransmisión con apuesta social
Vista pública embebible con marcador en tiempo real, feed de *moments* (punto de la ronda)
votables y tarjeta social auto-generada al terminar cada partido (descarga PNG / Web Share).
El "share to social" con tarjeta es el vector de viralidad y retención.

### 2. 🤖 Motor de re-pareo predictivo (IA)
Empareja cada ronda optimizando nivel + inédito (no repetir rivales) + ritmo. Predice
ganador y muestra probabilidades animadas. Diferenciador clave frente a Playtomic/Excel.

### 3. 📱 App club con reservas + pasarela de pago (Stripe)
Reservas de pista, cobro de inscripción y membresías en un clic. Monetización
inmediata (ya prevista en el pricing, falta el cobro real).

### 4. 📊 Analíticas y pronósticos (Elo + rendimiento) ✅
Panel de heatmaps de nivel, curva de Elo y predicción de clasificación final
en vivo. **Implementado en v1.1**: `analyticsService.js` (pronóstico, curva, heatmap,
KPI) + `AnalyticsBoard.jsx` (ruta `/analytics`). Convierte los datos en fidelización.

### 5. 🏆 Ranked league persistente con badge de club ✅
Ranking global por club con reset mensual, badge (Friend/Pro/Legend/VIP) y tabla de
honor. **Implementado en v1.1**: tablas Supabase `leagues` + `league_entries` (migración
`20260807030000`), `leagueService.js` (nube + local) y `RankedLeague.jsx` (ruta `/league`).