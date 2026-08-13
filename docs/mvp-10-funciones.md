# Estrategia MVP — Las 10 funciones core de PADEL ORGANIZERS

Fecha: 08/08/2026
Fuente: análisis de demanda real del mercado del pádel (v1)

## Posicionamiento

PADEL ORGANIZERS es una **multiplataforma digital especializada en organizar grandes
eventos de pádel**, inspirada en el modelo de ChessOrganizer.com. Su núcleo (MVP) se
define por la demanda real y los dolores actuales del mercado, no por una lista teórica
de 50 funciones.

El mercado ya no trata el pádel como hobby: es una industria masiva y un negocio
deportivo/inmobiliario de alta rentabilidad. El cuello de botella es **la pista**:
el club pierde dinero cuando una pista está vacía (hora valle) o cuando hay un no-show
(en hora punta). El 90% de la operativa diaria vive en grupos de WhatsApp (caos de
cobros, bajas, cambios). Y a diferencia del tenis, el pádel requiere **4 personas**
(“el cuarto”), que es la mayor fricción de compra.

## Las 10 funciones core (innegociables)

| # | Función | Qué resuelve | Demanda real |
|---|---|---|---|
| 1 | **Split payments** (pago dividido) | 1 reserva → links de pago al 25% para los 4 jugadores | El club odia perseguir pagos y “que siempre pague el mismo” |
| 2 | **Matchmaking / búsqueda de cuarto** | Tablón “buscamos 1, nivel intermedio, hoy 20h” | Dolor #1 del jugador amateur: sin cuarto no hay pista |
| 3 | **Anti no-show + lista de espera** | Fianza/devolución o pago adelantado; plaza a la espera con 1 clic | Clubes hartos de pistas vacías a las 21:00 del viernes |
| 4 | **Motor de torneos “cero Excel”** | Americanos, ligas, cuadros; inscripciones y cobros; parejas rotatorias | Organizar un Americano a mano es una tortura; los torneos sociales dejan dinero en bar |
| 5 | **Live scoring + acta digital** | Resultados set a set desde el móvil; cuadros actualizados | El ego del jugador: quiere que sus amigos vean el partido en vivo |
| 6 | **Yield management** (precios dinámicos) | 14:00 martes 12 € / 20:00 jueves 28 €; happy hour | Picos de saturación y valles de vacío; maximizar RevPAC |
| 7 | **Control acceso + IoT (luces QR)** | QR en la puerta enciende la luz de la pista exacta | La luz es el 2º mayor coste del club; habilita clubes desatendidos |
| 8 | **ERP de escuela** (menores + padres) | Clases, asistencia del monitor, cobro recurrente fin de mes | Escuelas pierden horas cuadrando asistencia y cobros |
| 9 | **Carnet de socio + ranking del club** | Historial, nivel, ladder interno (“Nº5 reta al Nº4”) | El jugador quiere pertenecer y competir; fidelización extrema |
| 10 | **Dashboard de negocio** | Ocupación, facturación por pista, bar/tienda, escuela | Dueños que llevan el negocio “a ojo”. El software = el cerebro |

## Estado actual del código vs. el core (08/08/2026)

| # | Función core | Estado en el repo | Notas |
|---|---|---|---|
| 1 | Split payments | ✅ HECHO | `splitService.js` + migración `20260808040000` aplicada |
| 2 | Matchmaking | ✅ HECHO | `matchmakingService.js` + `/match` (bolsa + anuncios "busco cuarto") |
| 3 | Anti no-show | ✅ HECHO (v1.1) | Fianza reembolsable + lista de espera con promoción al cancelar (`ClubApp`, migración `20260815000000`) |
| 4 | Motor torneos | ✅ HECHO | Americano/Mexicano/Suizo/Eliminatorio, cuadros, Punto de Oro |
| 5 | Live scoring | ✅ HECHO | LiveScore Pro, marcador set a set, resultados en vivo |
| 6 | Yield management | 🟢 HECHO | Precios dinámicos por pista×hora (valle ×0.85 / prime ×1 / noche ×1.3) en el grid de reservas (`CourtReservationGrid`) + simulación fijo vs yield en el panel del dueño |
| 7 | IoT/QR luces | ❌ NO existe | Solo QR del link de Stripe |
| 8 | ERP escuela | ✅ HECHO (v1.1) | Módulo 4C + cobro recurrente fin de mes: suscripciones por alumno, generación de facturas mensuales y marcar pagada (`SchoolApp` / `schoolService`) |
| 9 | Carnet + ranking | 🟢 parcial→HECHO | Player Public ID (`/player/:name`) con historial, rivalidades y curva ELO + analíticas de jugador (#6) |
| 10 | Dashboard negocio | 🟢 HECHO (v1) | Panel del dueño RevPAC en `/panel`: ocupación, facturación por pista, comparativa precio fijo vs yield y top horas (`ownerDashboard` en `clubCrmService`) + `/crm` con feed y KPIs |

## Estrategia de entrada al mercado

No construir las 50 funciones de golpe (el mercado está saturado de “super-apps” lentas y confusas).
La entrada se apoya en **el caos (WhatsApp) y el dinero (pistas vacías)**:

- **A clubes**: eliminamos impagos (Split payments), bajamos factura de luz (IoT/QR)
  y llenamos horas muertas (Matchmaking + precios dinámicos).
- **A jugadores**: se acabó decidir quién paga y siempre hay cuarto para jugar.
- **A organizadores**: nunca más Excel para un cuadro de torneo.

Ya tenemos lo más difícil hecho (torneos #4 y live #5). El objetivo es dominar las 10 con UX impecable y
rápida para desplazar a Playtomic, Matchpoint y los libros de papel.

## Priorización propuesta (por ROI y esfuerzo sobre el código actual)

1. **#1 Split payments** — Gran diferenciador prometido (“se acabó discutir por quién paga”). 
   Esfuerzo medio (2ª sesión Stripe + UI). Acopla con la reserva actual.
2. **#2 Matchmaking / cuarto** — Frontend + DB ligero; rápido y muy vendedor para jugadores.
3. **#3 Anti no-show + lista de espera** — Combo fianza + espera sobre `ClubApp`; fácil.
4. **#8 ERP: cobro recurrente** — Completa el módulo escuela ya construido (fin de mes).
5. **#10 Dashboard del dueño** — 1 pantalla reutilizando `analyticsService`.

**Consejo lanzamiento:** no lanzar “apocalíptico”. Lanza v1.0 con #4 y #5 (ya listo) y ataca
**Split Payments (1)** como sprint siguiente: es el punto que hace innegable el cambio.

## Decisiones

PENDIENTE: elección del siguiente sprint construible. Esta hoja valida la estrategia; las opciones, en orden de prioridad propuesta:

1. **Split Payments** — API + UI (Stripe sessions por jugador, links del 25%).
2. **Matchmaking / cuarto** — tablón de anuncios interno.
3. **Anti no-show + lista de espera**.
4. **ERP: cobro recurrente fin de mes**.
5. **Dashboard del dueño (RevPAC)** — reutiliza `analyticsService`.