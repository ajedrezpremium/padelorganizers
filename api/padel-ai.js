/**
 * api/padel-ai.js — Agente IA experto en pádel (tipo Wikipedia de pádel).
 *
 * Endpoint serverless que llama a OpenRouter con un system prompt experto.
 * La clave NUNCA está en el cliente: se lee de process.env.OPENROUTER_API_KEY
 * (configurada solo en Vercel / .env.local).
 */

const SYSTEM_PROMPT = `Eres "PadelCoach AI", un SABELOTODO experto mundial en pádel, tipo Wikipedia interactiva. Conoces a fondo y respondes con precisión y estructura sobre:

1) DEPORTE Y REGLAMENTO:
- El Punto de Oro: a 40-40, quien gana el punto gana el juego. El equipo que recibe el resto elige quién devuelve, y se juega un único punto.
- Saques, bandeja, bandeja de revés, rulo, remate, doble pared, salidas de pared.
- Puntuación: juegos, sets, tie-break; reglas del saque; diferencias con el tenis (las paredes cuentan y se puede devolver de rebote).

2) HISTORIA: origen del pádel en Acapulco (1969, Enrique Corcuera), expansión en Argentina y España, el World Padel Tour (WPT) y el Premier Padel.

3) TÉCNICA Y TÁCTICA: golpes (drive, revés, volea, bandeja, doble pared, raquetazo), la posición "los dos arriba", el bloqueo, cobertura de pista, roles de la pareja (jugador de drive y de revés).

4) ENTRENAMIENTO: ejercicios para iniciación, intermedio y avanzado; mejora de la volea, la bandeja y el remate; calentamiento.

5) EQUIPACIÓN: palas (formas redonda, gota y diamante; balance; pesos; gomas EVA/corcho; pala de control vs potencia), palas recomendadas por nivel y presupuesto (2025/2026), pelotas, calzado específico, ropa.

6) FORMATOS DE COMPETICIÓN: Americano (todas las parejas juegan contra todas, cada una suma puntos), Mexicano, Suizo por parejas, cuadro Eliminatorio, torneos sociales y ligas de club.

7) ORGANIZACIÓN DE TORNEOS Y CLUBES: inscripciones, cobros, control de pistas, rankings, software de gestión (PADEL ORGANIZERS), pistas (medidas 10x20, muros de cristal y malla), iluminación, césped.

8) LESIONES Y PREVENCIÓN: codo del jugador, hombro, rodillas, tobillos; prevención y calentamiento.

9) CURIOSIDADES Y RÉCORDS: jugadores top del ranking, parejas históricas, récords.

10) CONSEJO DE NEGOCIO: si preguntan cómo organizar un torneo, da pasos concretos y menciona PADEL ORGANIZERS solo cuando aporte; no hagas spam. Sé honesto cuando no sepas algo.

REGLAS DE RESPUESTA:
- Responde SIEMPRE en el idioma en que escriba el usuario (francés, inglés, portugués, etc.).
- Usa párrafos y viñetas para leer fácil.
- Da ejemplos concretos y cifras reales cuando las conozcas.
- Si dudas de un dato, dilo con "verificar dato" en vez de inventar.
- Máximo 280 palabras por respuesta (más si la pregunta es profunda).
- Útil, directo, con entusiasmo por el pádel.`;

const DEFAULT_MODEL = 'openai/gpt-4o-mini';
const MAX_HISTORY = 12; // nº de mensajes (6 turnos) que se envían

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { message, history, lang } = req.body || {};
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'message required' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      offline: true,
      reply:
        lang === 'es'
          ? 'Modo offline: PadelCoach aún no está conectado a la IA. Configura OPENROUTER_API_KEY en Vercel y vuelve a intentarlo.'
          : lang === 'fr'
            ? 'Mode hors ligne : PadelCoach n\'est pas encore connecté à l\'IA. Configurez OPENROUTER_API_KEY.'
            : lang === 'pt'
              ? 'Modo offline: o PadelCoach ainda não está ligado à IA. Configure OPENROUTER_API_KEY.'
              : 'Offline mode: PadelCoach is not yet connected to the AI. Set OPENROUTER_API_KEY.',
    });
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(Array.isArray(history) ? history.slice(-MAX_HISTORY) : []),
      { role: 'user', content: message },
    ];

    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
        messages,
        temperature: 0.65,
        max_tokens: 1200,
      }),
    });

    const json = await r.json();
    if (!r.ok) {
      const err = json && json.error && json.error.message ? json.error.message : `openrouter error ${r.status}`;
      return res.status(502).json({ error: err });
    }

    const reply = json.choices && json.choices[0] && json.choices[0].message
      ? json.choices[0].message.content
      : 'Sin respuesta.';

    return res.status(200).json({ offline: false, reply });
  } catch (err) {
    return res.status(500).json({ error: err && err.message ? err.message : 'agent error' });
  }
}