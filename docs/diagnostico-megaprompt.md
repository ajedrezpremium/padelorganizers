# Diagnóstico: PADEL ORGANIZERS vs. Mega Prompt (fase 2)

Fecha: 08/08/2026 · Fuente: `padelorganizers megaprompt.txt` (20 bloques, 726 líneas)

## Decisión de producto

- **v1.0 se lanza AHORA** con el MVP actual (no se espera al mega prompt completo).
- **El mega prompt es la guía de fase 2 y posteriores**, priorizada por retorno.
- Este documento es el mapa de priorización: qué queda, cuándo y por qué.

---

## 1. Lo que el MVP ya cubre (v1.1, en producción)

| Bloque del prompt | Cobertura actual |
|---|---|
| 4D Torneos/ligas/eventos | Motor Americano/Mexicano/Suizo/Eliminatorio, Punto de Oro, cuadros, live score |
| 5-6 LiveScore + ranking oficializable | LiveScore Pro (retransmisión social) + Elo/NTRP adaptado |
| 4E Comunidad/jugadores | Parcial: perfiles, buscar rival, chat, feed social |
| 4A Reservas + acceso | Calendario, reservas online, control de pistas |
| 3 SaaS + pagos | Cobro real con Stripe (live) + webhook de confirmación |
| 6/9 Monetización | Modelo Starter/Pro/Reservas + descripciones |
| 13 Legal | Aviso legal, RGPD, cookies, 4 idiomas |
| 14 Go-to-market | Landing Pro, scripts email, producción en redes, comparativa |
| 17/18 Diseño y copy | Tema claro/oscuro, tipografía, 4 idiomas, landing segmentada |

## 2. Grandes huecos (fase 2+)

| Bloque | Módulo | Est. actual | Prioridad | Esfuerzo |
|---|---|---|---|---|
| 4C | Escuela/Entrenadores (grupos, clases, asistencia, progresión, bonos) | 0% | **ALTA** (suscripción recurrente, sin rival) | 2-3 sprints |
| 4B | Socios/abonados (planes, bonos, renovaciones, churn) | Parcial (reservas) | **ALTA** | 2 sprints |
| 4F | Marketplace/tienda de material técnico | 0% | Media | 2 sprints |
| 6 | Panel emprendedor / KPIs de negocio | Parcial (analíticas torneo) | Media | 1.5 sprints |
| 4G | Publicaciones/CMS + crónicas IA | 0% | Media | 1.5 sprints |
| 4H | Patrocinios/publicidad/activaciones | 0% | Media | 2 sprints |
| 7 | Gamificación completa | Solo redes | Media | 2 sprints |
| 2 | Multi-rol (federación, árbitro, tutor, entrenador, patrocinador) | Solo organizador/jugador | **ALTA** en fase 3 | transversal |
| 9/10 | Multi-tenant real + roles/permisos DB | No | **ALTA** en fase 3 | transversal |
| 9 | App móvil (React Native/Flutter) | Web-only | MEDIA (después del SaaS web) | alto |
| 12 | IA avanzada (chatbot, precios dinámicos, vídeo) | Solo IA de emparejamientos | Media-larga | 3+ sprints |

\* Corregido: "Cobertipo" → "Cobertura" en tabla 1.

---

## 3. Roadmap sugerido (fases)

### Fase 0 — Lanzamiento v1.0 (AHORA)
- Webhook Stripe configurado.
- Pago real de prueba (8 €).
- Máximo pulido de UI y mensajes multi-idioma.
- Métricas: sesiones, clics en CTA, primeras reservas reales, % checkout completado.

### Fase 1 — Retención y recurrencia (siguiente, 60-90 días)
- **Escuela/Entrenadores (4C)**: grupos por nivel/edad, calendario de clases, asistencia, evaluación, bonos de clases, comunicación entrenador-alumno.
- **Socios/abonados (4B)**: planes, bonos de horas, pagos recurrentes, panel de retención.
- Panel emprendedor con KPIs de línea de negocio (4I, parcial).

### Fase 2 — Growth (150-180 días)
- Marketplace/tienda (4F).
- Patrocinios/adiciones (4H).
- Publicaciones/CMC + generación de crías con IA (4G).

### Fase 3 — Escala
- Multi-rol y permisos avanzados (federación, árbitro, tutor, patrocinador).
- Multi-tenant real por organización/sede.
- Gamificación completa (misiones, insignias, recompensas).
- API pública.

### Fase 4 — Expansión
- App móvil nativa.
- White label por club/federación.
- Multi-país, circuitos internacionales.

---

## 4. Próximos pasos inmediatos
1. Crear el endpoint de webhook en Stripe (dashboard/API).
2. Realizar un pago real de prueba de 8 € para validar el bucle completo.
3. Elegir el sprint siguiente entre Escuela y Socios/abonados.