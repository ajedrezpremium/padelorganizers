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

// Modelos preferidos (gratis), por orden de calidad/estabilidad. Si uno queda inactivo
// o marcado :free->de-pago, se cae solo (fallback) y se sustituye por otro del catálogo.
const PREFERRED_FREE_MODELS = [
  'openai/gpt-oss-20b:free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
];
const DEFAULT_MODEL = 'openai/gpt-oss-20b:free'; // último recurso si el catálogo no responde
const MAX_HISTORY = 12; // nº de mensajes (6 turnos) que se envían
const MAX_ATTEMPTS = 3; // nº de modelos que se prueban antes de rendirse

// Idioma configurado por el usuario en la interfaz (selector ES/EN/FR/PT).
// Se inyecta al inicio del system prompt para que el agente responda por
// defecto en ese idioma (aunque respete el idioma en que le escriban).
const LANG_INSTRUCTION = {
  es: 'El usuario configuró su interfaz en ESPAÑOL. Responde por defecto en español, salvo que te escriba en otro idioma.',
  en: 'The user set their interface to ENGLISH. Reply in English by default, unless they write in another language.',
  fr: "L'utilisateur a configuré son interface en FRANÇAIS. Répondez par défaut en français, sauf s'il vous écrit dans une autre langue.",
  pt: 'O utilizador configurou a interface em PORTUGUÊS. Responda por defeito em português, salvo se escrever noutro idioma.',
};

// Caché del catálogo de modelos gratuitos de OpenRouter (evita martillar /models en cada request).
let cachedModels = null;
let cachedAt = 0;
const MODELS_CACHE_TTL = 5 * 60 * 1000; // 5 min

// Consulta el catálogo, filtra los :free y los ordena según preferencia (los preferidos primero).
async function getFreeModels(apiKey) {
  const now = Date.now();
  if (cachedModels && now - cachedAt < MODELS_CACHE_TTL) return cachedModels;

  try {
    const r = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const json = await r.json();
    const free = (json.data || [])
      .filter((m) => typeof m.id === 'string' && m.id.endsWith(':free'))
      .map((m) => m.id);

    // Estables (no de razonamiento puro, no versiones "tiny/safety"): se priorizan.
    const stable = free.filter((id) => !/(tiny|safety|omni|vl|reasoning)/i.test(id));
    const pool = [...new Set([...PREFERRED_FREE_MODELS.filter((id) => stable.includes(id)), ...stable])];

    cachedModels = pool.length ? pool : null;
    cachedAt = now;
    return pool;
  } catch {
    return null;
  }
}

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

  // OPENROUTER_MODEL es un override OPCIONAL del operador (p.ej. un modelo de pago).
  // Si no está fijado, el sistema elige solo un modelo :free disponible en el catálogo.
  const forcedModel = process.env.OPENROUTER_MODEL && process.env.OPENROUTER_MODEL.trim() !== ''
    ? process.env.OPENROUTER_MODEL.trim()
    : null;

  const langHint = LANG_INSTRUCTION[lang] || LANG_INSTRUCTION.es;

  const messages = [
    { role: 'system', content: `${langHint}\n\n${SYSTEM_PROMPT}` },
    ...(Array.isArray(history) ? history.slice(-MAX_HISTORY) : []),
    { role: 'user', content: message },
  ];

  const candidates = forcedModel
    ? [forcedModel]
    : [...(await getFreeModels(apiKey) || []), DEFAULT_MODEL];

  let lastError = null;
  let lastStatus = 502;

  for (let i = 0; i < Math.min(candidates.length, MAX_ATTEMPTS); i++) {
    const model = candidates[i];
    try {
      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.65,
          max_tokens: 1200,
        }),
      });

      const json = await r.json();
      if (!r.ok) {
        lastError = json && json.error && json.error.message ? json.error.message : `openrouter error ${r.status}`;
        lastStatus = r.status;
        // Modelo inactivo / sin créditos / limitado → probar el siguiente de la lista.
        if ([402, 404, 429, 500, 502, 503].includes(r.status)) continue;
        return res.status(r.status).json({ error: lastError });
      }

      const reply = json.choices && json.choices[0] && json.choices[0].message
        ? json.choices[0].message.content
        : 'Sin respuesta.';

      return res.status(200).json({ offline: false, reply });
    } catch (err) {
      lastError = err && err.message ? err.message : 'agent error';
      lastStatus = 500;
    }
  }

  return res.status(lastStatus).json({ error: lastError || 'agent error' });
}