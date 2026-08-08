# Guía de crecimiento de PADEL ORGANIZERS — Backlog de funcionalidades

Fecha: 08/08/2026
Este documento reúne las ideas de crecimiento de la plataforma y las ordena por
impacto esperado, coste de implementación y encaje con la arquitectura actual.

**Regla general:** no construir nada que no tenga calendario y cliente real
esperando. Cada idea aquí es un *candidate*: se activa cuando aporta datos o
dinero, no por construir por construir.

---

## Por qué crecemos por comunidades, no por funcionalidad lineal

El pádel vive en grupos de WhatsApp y Telegram. La retención de una app no la da
el código, la dan las **comunidades que ya existen** (jugadores, clubes,
organizadores). Cualquier feature que baje la fricción de un grupo es una
palanca más fuerte que una pantalla nueva.

---

## 1. CRM administrativo (para el dueño del club)

**Qué es:** panel único donde el club gestiona a sus clientes: datos de contacto,
historial completo de reservas y compras, familias (padres que pagan las clases),
notas internas, etapas del embudo (lead → prospect → miembro).

| | |
|---|---|
| **Dolores** | Dueños pierden clientes porque no saben quién faltó un mes, quién gasta más, quién abandona. |
| **Diferencial** | Multiplica la fidelización del club: el dueño nunca volverá a Excel. |
| **Estado hoy** | hay `student_subscriptions`/`school_invoices`; falta un perfil de cliente unificado. |
| **Impacto** | La **base de datos de clientes** es el oro real. Un CRM admin convierte la base en ingresos. |
| **Aporta** | Perfil de jugador, historial, embudo, alerta de churn, objetivos por segmento, comunicación. |

- **ROI estimado:** el CRM del mercado (Playtomic) cobra por club; aquí es una
  función que eleva el plan Pagado. Convierte los datos en up-sells y retención
  de cuota.

---

## 2. Panel de marketing (campañas, cupones, fidelización)

- **Qué hace:** crear cupones (`TANE-20`), ofertas por hora valle, campañas
  segmentadas por perfil (jugador amateur, socios, escuela de menores) y métricas
  de clics/redención.
- **Diferencial:** el club que manda su propio mensaje desde su app (no en el
  grupo caótico de WhatsApp). Se apoya en el CRM: segmento + acción.
- **Bonus:** estadística de campaña (impresiones → reservas → cobros).

---

## 3. Comunidad — grupos de sector y red social del pádel

- **Comunidad por sector/club** (WhatsApp/Telegram embebidos vía enlace): cada
  club organiza sus partidillos en un grupo gestionado desde la app, con enlaces
  a reservas y pagos.
- **A futuro (fase 2):** red social de jugadores de pádel: buscan el cuarto que
  falta, organizan partidas, comentan el LiveScore, valoran rivales, suben
  "momentos" a su muro.
- La comunidad es la etapa de entrada; la red social es la retención top.

---

## 4. Retransmisión en directo (Live Padel TV)

- **Qué:** streaming en vivo de los partidos desde el club (webcam/teléfono
  embebido), marcador integrado con LiveScore Pro, chat social y espacio para
  patrocinadores.
- **Para quién:** clubes que quieren verse "de cine" (convierten al club en
  marca) y el torneo como producto de espectáculo.
- **Encaje:** reutiliza `LiveScore Pro` (marcador en vivo, ya en producción).
- **Monetización:** suscripción de club y canales de sponsor (publicidad de palas).

---

## 5. Base de datos de clientes (capilaridad de registro)

- Un registro unificado por jugador/empresa que recoge todos los flujos:
  inscripciones, reservas, tienda, escuela. Supabase ya lo soporta con
  `profiles` + `reservations` + `registrations` + `school_*`.
- Es el sustento del CRM (#1), del panel de marketing (#2) y de la comunidad (#3).
  **No es una función visible, es la base:** primero la modelamos y encima se
  construyen los productos.

---

## 6. Ranking mundial de pádel (lista universal)

- **Ranking global 2025/2026** de jugadores por nivel y club, con Elo online
  (ya hay `ranked league` y `leagueService`).
- Complemento del federativo: la FIP/Premier Padel publica rankings; aquí
  rankeamos a **jugadores amateur**, no solo a pro. El ego del jugador: "sector 388
  del mundo en mi categoría".
- Se alimenta de torneos y ligas jugados en la plataforma.
- **Conversión:** badge del club (ya existe) + visibilidad en el directo.

---

## 7. Ranking club / escuela (nivel interno)

- **Liga interna** para cada club: reto "retar al Nº4", calendario de partidas,
  puntos, Elo, badge de progresión (Friend → Pro → Legend → VIP).
- El **carnet de socio** (función core #9) se cierra sobre esta liga de nivel:
  ranking + historial + nivel, todo en uno.

---

## 8. Programa de gamificación

- **Badges e hitos:** "10 partidos jugados", "primera final de torneo", "golpe de
  revés perfecto". XP por asistencia, pagar a tiempo, recomendar jugadores.
- **Ranking personal vs el mundo** y premios del club (crédito en bar, una
  reserva gratis) financiados por el sponsor del club.
- La retención online es emocional: la gamificación es el segundo motivo por el
  que un jugador vuelve a la app cada semana, después de las reservas.
- Budget propio: cruza con el CRM (#5) para reconocer hitos cercanos y enviar
  cupones automáticos.

---

## 9. Match local / disponibilidad por ciudad (ej. Vigo)

**Problema:** "quiero jugar hoy en Vigo, estoy solo y necesito pista + 3 jugadores más".

**Demanda:** real y validada (Playtomic lo resolvió con *Partidos Abiertos* = su feature
de mayor retención). El dolor se repite 2-3 veces/mes por jugador activo. Fracasan las
apps "BuscaRival" por falta de masa crítica, no por falta de demanda → el reto es el
**huevo y la gallina** (sin clubes no hay pistas; sin jugadores los clubes no se apuntan).

**¿Le interesa al dueño?** Sí, pero solo si se vende como "máquina de llenar horas
valle y convertir socios", NO como alquiler suelto:
- Llena pistas 11:00-17:00 entre semana → +15-25% ocupación valle.
- Embudo de adquisición gratuito: jugador de paso → socio (LTV ~400 € vs 6 € puntuales).
- Datos de jugadores de la zona → campañas hipersegmentadas.
- Riesgos a evitar: "turismo de pista" que no gasta en bar/clases, canibalización de
  socios, degradación de la experiencia VIP → **segmentación horaria obligatoria**
  (solo horas valle, plazas sueltas 24h antes, cancelaciones).

**Solución técnica eficiente (módulo, no app nueva):**
- PWA (`/vigo` → mapa con pistas libres + buscadores de cuarto), guest checkout con
  SMS/OTP (65% vs 15% de conversión frente a registro con email), WhatsApp como canal
  principal ("Te falta 1 para Pista 3 en Club Vigo Pádel, 6 €").
- Fase 1: explotar el **panel de disponibilidad del propio club** ya construido en
  `ClubApp` + matchmaking local por esfuerzo en SQL (índices geoespaciales/PostGIS cuando
  haya multi-club). No construir agregador con Redis el día 1.
- Fase 2: agregador multi-club con caché de 60s de disponibilidad vía webhooks.

**Monetización (no por reserva, por adquisición):**
- Opción A: comisión premium (3% normal → 15% hora valle).
- Opción B: "Pádel Pass" 4,99 €/mes B2C (100 usuarios = ~500 €/mes recurrentes por ciudad).
- Opción C (elegante): CPA 20 €/socio nuevo al club (CAC negativo para el club).

**Lanzamiento (efecto red local en 1 ciudad):**
1. 3-4 clubes ancla de Vigo (Navia, Samil, As Avenidas) con plan Pro gratis 6 meses,
   promesa "llenamos valle o no pagas".
2. Ads geolocalizados (radio 10 km, targeting pádel).
3. Viral loop "trae a tu cuarto y juega gratis".
4. Monetizar en mes 3 (Pádel Pass + comisión valle).

**Momento:** fase 2, NO en el MVP. Cuando se dominen 10+ clubes de una ciudad, es el
diferencial vs Playtomic: "la única plataforma que te llena las pistas vacías sola".

---

## 10. Pagos alternativos (PayPal, Apple Pay, Google Pay)

**Qué:** ampliar la pasarela más allá de Stripe con PayPal y wallets. Hoy el sistema
de pagos (reservas, split payments, inscripciones, escuela) está atado 100% a Stripe
(`api/checkout.js`, `api/split.js`, `api/webhook.js`).

**Por qué importa:**
- **Geografía:** en España/LatAm hay jugadores que solo usan PayPal o el comercio
  digital acostumbra a él (Playtomic solo Stripe, es una grieta).
- **Split payments:** muy buen fit con partes por jugador; permite cobrar a quien no
  tiene tarjeta.
- **Imagen de confianza:** en torneos y escuelas cobrar con PayPal reduce fricción y
  chargebacks.

**Arquitectura (lean):**
- Nuevo `api/paypal-order.js` + `api/paypal-capture.js` (Orders v2 con `client_id`/
  `client_secret` desde env; nunca en cliente).
- Un solo `payment_method` en reservas/splits (stripe | paypal) para el webhook.
- Webhook PayPal de orden capturada → misma lógica de completado que el webhook de
  Stripe (marcar split pagado, confirmar reserva).
- En la página de pago el jugador elige Stripe (tarjeta) o PayPal.

**Seguridad:** mercado de cargos/riesgos guiado; no crear una pasarela propia.

**Prioridad:** media-alta (fase 2, tras consolidar Stripe y PMF). Sin "varios
métodos" antes de tener clientes pagando.

---

## Priorización sugerida (ROI x esfuerzo)

| Prioridad | Funcionalidad | Esfuerzo | Impacto | Se apoya en |
|---|---|---|---|---|
| 1 | Base de datos de clientes | Alto | Base de todo | todos |
| 2 | CRM administrativo | Alto | Retención de club | base de datos |
| 3 | Panel de marketing (cupones) | Medio | Ingreso activo | base + CRM |
| 4 | Motor de comunidad (grupos) | Medio | Adopción / boca a boca | base |
| 5 | Ranking mundial amateur | Medio | Ego / estatus público | Ranked league existente |
| 6 | Ranking club/escuela + carnet | Medio | Fidelización por club | Ranked league existente |
| 7 | Gamificación | Medio | Retención online | ranking club, CRM |
| 8 | Retransmisión en directo | Alto | Marca y espectáculo | LiveScore Pro existente |
| 9 | Match local / disponibilidad por ciudad | Medio | Llenar horas valle + captar socios | ClubApp (disponibilidad) + matchmaking SQL |
| 10 | Pagos alternativos (PayPal, Apple/Google Pay) | Medio | Más métodos de cobro, menos fricción | webhook Stripe existente |

---

## Ventaja de tiempos

1. La arquitectura ya soporta **ranked league**, **school**, **split payments** y
   **live score**. Los rankings (#6 y #7) y el directo (#8) tienen el frente
   construido (semanas, no meses).
2. La **base de datos (#5)** y el **CRM (#1)** son lo más estructural y lo más
   valioso: es lo que permite crecer los datos y vender más.
3. La **comunidad (#3)** es la que más mueve la economía: cada jugador trae a
   otros dos.

Síntesis: **base de datos de clientes + CRM contigo**, luego **marketing y
comunidad** para hacer crecer los datos, y **rankings + gamificación** encima de
ellos. El directo es la función "marca" que lo corona todo.