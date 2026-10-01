Construir tu prototipo en Figma (o con herramientas de IA generativa como v0.dev, Uizard o Figma AI), te voy a dar el "Blueprints" (planos) completos. Con esto, un diseñador o una IA puede dibujar el prototipo en minutos.

🗺️ 1. MAPA DE PANTALLAS (Sitemap) para tu Figma
Estas son TODAS las vistas que debe tener tu prototipo. Empieza por las 5 primeras (marcadas con ⭐):

#	Pantalla	Descripción
⭐ 1	Landing Page / Home	La actual /torneo pero rediseñada con el flujo de 5 fases y el CTA "Crear mi torneo".
⭐ 2	Dashboard del Organizador	Panel con el resumen de torneos (activos, en inscripción, finalizados) y métricas rápidas.
⭐ 3	Crear Torneo (Formulario Wizzard)	Paso a paso: 1. Datos generales, 2. Categorías, 3. Formato, 4. Precios y 5. Publicar.
⭐ 4	Página Pública del Torneo	Vista que ven los jugadores para inscribirse, ver el cuadro y horarios.
⭐ 5	Generador de Cuadros (Bracket)	Vista visual del árbol de eliminatorias, con opción de arrastrar cabezas de serie.
6	Check-in / Día del Torneo	Vista para móvil donde los jugadores confirman asistencia.
7	Perfil de Jugador	Historial, nivel, torneos jugados.
8	Backoffice del Club	Gestión de pistas, escuelas y socios.
9	Módulo de Pagos	Pasarela de inscripción (Stripe) y resumen de cobros.
10	Informe Final / Memoria	Resumen financiero y de satisfacción post-torneo.
🎨 2. DESCRIPCIÓN DETALLADA DE LAS 5 PANTALLAS CLAVE (para copiar en Figma)
Si vas a diseñarlo tú mismo o se lo pasas a un diseñador, usa estas especificaciones exactas:

⭐ Pantalla 1: Landing Page (Rediseño de /torneo)

Header: Logo "PADEL ORGANIZERS" + botones "Iniciar Sesión" y "Crear Torneo" (amarillo cálido).

Hero: Título grande: "Organiza torneos de pádel profesionales en 10 minutos". Subtítulo: "Desde la inscripción hasta la entrega de trofeos, todo en una sola plataforma".

El Flujo Visual (LAS 5 FASES): Un horizontal scroller con 5 círculos grandes conectados por líneas:

📋 Planifica (Presupuesto y reglas)
📝 Inscripciones (Pagos y difusión)
🏸 Cuadrantes (Sorteo y horarios)
⏱️ Día del Torneo (Check-in y resultados)
🏆 Clausura (Trofeos y encuestas)
Footer: Logos de clubes colaboradores y un contador de "Torneros organizados hoy".

⭐ Pantalla 2: Dashboard del Organizador

Sidebar izquierdo: Resumen (Dashboard), Mis Torneos, Clubes, Escuelas, Patrocinadores, Configuración.

Widgets superiores (4 tarjetas):

"Inscripciones abiertas" (número)

"Partidos por jugar hoy"

"Ingresos totales (€)"

"Jugadores registrados"

Lista principal: Tabla con columnas: Nombre del Torneo, Fecha, Inscritos / Plazas, Estado (📌 Abierto / ⏳ Cerrado / 🟢 En juego / ✅ Finalizado), y un botón Acciones (desplegable con: Ver torneo, Editar, Generar cuadros, Cerrar).

⭐ Pantalla 3: Wizard de Creación de Torneo (4 pasos)

Paso 1 - Datos Generales: Inputs para Nombre del torneo, Fecha inicio-fin, Sede/Club (buscador), Número de pistas.

Paso 2 - Categorías: Botón "+ Añadir categoría". Cada categoría tiene: Nivel (Principiante/Intermedio/Avanzado/Profesional), Género (Masculino/Femenino/Mixto) y Modalidad (Dobles/Individuales).

Paso 3 - Formato y Reglas: Selector visual (tarjetas clicables) para elegir entre "Eliminación Directa", "Fase de Grupos + Eliminatorias" o "Americano". Slider para definir tiempo por partido (1h 15m).

Paso 4 - Precios y Publicar: Input de Precio de inscripción (€), check de "Activar pago online", y botón final "Publicar Torneo y abrir inscripciones" (grande, en naranja/amarillo).

⭐ Pantalla 4: Página Pública del Torneo (Vista Jugador)

Cabecera: Nombre del torneo, fechas, y un contador de "Plazas disponibles: 12/32".

Botón principal: "INSCRIBIRME AHORA" (fijo en la parte inferior en móvil, o en el lateral en escritorio).

Secciones interiores (tabs):

Información: Reglamento, premios y horario general.

Inscritos: Lista de jugadores con sus fotos de perfil y nivel.

Cuadro (Bracket): (visible solo cuando esté generado) Muestra el árbol de enfrentamientos.

Resultados: Marcadores de partidos ya finalizados.

⭐ Pantalla 5: Generador de Cuadros (Bracket interactivo)

Vista principal: Un gráfico en árbol (izquierda a derecha) con círculos que representan a los jugadores.

Funcionalidades clave en la UI:

Botón superior: "Generar automáticamente con IA" (destacado en morado/azul).

Botón secundario: "Sorteo manual (arrastrar)".

Justo debajo del bracket, una línea de tiempo horizontal que muestra las franjas horarias (Ej: 10:00 Pista 1, 10:00 Pista 2, 11:30 Pista 1...).

Al hacer clic en un partido, se abre un modal para introducir el resultado (Ej: 6-3 / 6-4).

🤖 BONUS: Prompt para generar el prototipo con IA (v0.dev / Uizard)
Si quieres saltarte el diseño manual y pasar directamente a un prototipo cliqueable, copia y pega este prompt en español en una IA de generación de UI (como v0.dev, Uizard o Figma AI):

"Quiero el prototipo de alta fidelidad para una web SaaS llamada PADEL ORGANIZERS. Diseña 5 pantallas clave interconectadas:

Landing page con hero, 5 pasos del flujo (Planificación, Inscripciones, Cuadrantes, Día del Torneo, Clausura) y CTA principal.

Dashboard del organizador con sidebar, tarjetas de métricas (inscritos, ingresos, partidos) y tabla de torneos activos.

Wizard de creación de torneo en 4 pasos (Datos, Categorías, Formato/Reglas, Precios/Publicar).

Página pública de un torneo con botón de inscripción, listado de jugadores y pestañas para ver el cuadro.

Generador de brackets con vista de árbol y horarios asignados.
Usa una paleta de colores profesional: fondo blanco/gris claro, detalles en amarillo vibrante (#F9A826) y azul profundo (#1B2A49), tipografía moderna y limpia, enfocado en usabilidad móvil y escritorio."