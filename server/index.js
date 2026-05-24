require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

async function callClaude(messages, maxTokens = 900) {
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content.map((c) => c.text || '').join('');
}

// POST /api/triage — structured incident analysis
app.post('/api/triage', async (req, res) => {
  try {
    const { inc, hist } = req.body;
    const now = new Date();
    const prompt = `You are ARIA — Atlanta Road Intelligence Advisor for the City of Atlanta Road Safety Operations Center. Analyze this incident and return structured JSON.

ACTIVE INCIDENT: ${JSON.stringify(inc)}

HISTORICAL NHTSA FARS RECORDS NEARBY (within 0.07° radius): ${JSON.stringify(hist)}

CURRENT TIME: ${now.toLocaleTimeString('en-US', { hour12: false })} ${now.toLocaleDateString('en-US', { weekday: 'long' })}

Return ONLY raw JSON (absolutely no markdown, no backticks, no commentary):
{"severity_score":<1-10 integer>,"severity_label":"<CRITICAL|HIGH|ELEVATED|MODERATE>","situation_brief":"<2-3 crisp sentences for a dispatcher — what happened, what to expect>","response_units":["<unit>"],"est_clearance_min":<integer>,"lane_impact":"<one short phrase>","priority_actions":["<action1>","<action2>","<action3>"],"escalation_factors":["<factor if any>"],"historical_note":"<one sentence about this corridor from FARS data, or null if no nearby records>"}`;

    const raw = await callClaude([{ role: 'user', content: prompt }], 1200);
    // Extract the first JSON object — handles any leading/trailing prose or markdown fences
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Model did not return a JSON object');
    const triage = JSON.parse(match[0]);
    res.json(triage);
  } catch (e) {
    console.error('Triage error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Georgia 511 live incidents ───────────────────────────────────────────────

// Atlanta metro bounding box (lat 33.5–34.2, lng -84.9 to -84.0)
const ATL_BOUNDS = { latMin: 33.5, latMax: 34.2, lngMin: -84.9, lngMax: -84.0 };

let incidentCache = { data: null, ts: 0 };
const CACHE_TTL_MS = 60_000;

function mapSeverity(ev) {
  const etype  = (ev.EventType  || '').toLowerCase();
  const sub    = (ev.Subtype    || '').toLowerCase();
  const desc   = (ev.Description|| '').toLowerCase();
  const sev511 = (ev.Severity   || '').toString().toLowerCase();

  const isCrash = etype.includes('accident') || etype.includes('incident')
               || sub.includes('crash') || sub.includes('collision');

  if (isCrash) {
    if (
      sev511 === 'major' || sev511 === '4' || sev511 === '5' ||
      desc.includes('fatal') || desc.includes('fatality') ||
      desc.includes('injur') || desc.includes('entrap')
    ) return 'FATAL';
    if (
      sev511 === 'high' || sev511 === '3' ||
      desc.includes('crash') || desc.includes('collision') || desc.includes('rollover')
    ) return 'SERIOUS';
    return 'SERIOUS'; // any unqualified crash gets SERIOUS
  }
  if (
    etype.includes('closure') || sub.includes('stall') ||
    desc.includes('stall') || desc.includes('debris') || desc.includes('disabled')
  ) return 'MODERATE';
  return 'MINOR';
}

function extractFactors(ev) {
  const desc = (ev.Description || ev.Subtype || '').toLowerCase();
  const factors = [];
  if (desc.includes('speed'))              factors.push('Speeding');
  if (desc.includes('dui') || desc.includes('drunk') || desc.includes('intoxicat')) factors.push('DUI');
  if (desc.includes('debris'))             factors.push('Road debris');
  if (desc.includes('rain') || desc.includes('wet')) factors.push('Wet road');
  if (desc.includes('fog'))                factors.push('Fog');
  if (desc.includes('pedestrian'))         factors.push('Pedestrian');
  if (desc.includes('wrong-way') || desc.includes('wrong way')) factors.push('Wrong-way driver');
  if (desc.includes('stall') || desc.includes('disabled')) factors.push('Stalled vehicle');
  if (factors.length === 0) {
    const label = ev.Subtype || ev.EventType || 'Traffic incident';
    factors.push(label.charAt(0).toUpperCase() + label.slice(1));
  }
  return factors;
}

// GDOT 511 returns Unix timestamps in seconds (not ISO strings).
function parseGdotDate(raw) {
  if (raw == null) return null;
  const num = Number(raw);
  if (!isNaN(num) && num > 0) return num * 1000;
  // Fallback for any ISO string fields
  const s = String(raw).trim();
  const hasZone = /Z$|[+-]\d{2}:?\d{2}$/.test(s);
  const t = new Date(hasZone ? s : s + 'Z').getTime();
  return isNaN(t) ? null : t;
}

function transform511Event(ev) {
  const lat = Number(ev.Latitude);
  const lng = Number(ev.Longitude);
  if (
    isNaN(lat) || isNaN(lng) ||
    lat < ATL_BOUNDS.latMin || lat > ATL_BOUNDS.latMax ||
    lng < ATL_BOUNDS.lngMin || lng > ATL_BOUNDS.lngMax
  ) return null;

  const now = Date.now();
  const startMs = parseGdotDate(ev.LastUpdated ?? ev.StartDate) ?? now;
  const minsAgo = Math.min(99, Math.max(0, Math.floor((now - startMs) / 60_000)));

  const desc = ev.Description || '';
  const descLower = desc.toLowerCase();

  const type = ev.Subtype
    ? ev.Subtype.charAt(0).toUpperCase() + ev.Subtype.slice(1)
    : (ev.EventType || 'Traffic incident');

  return {
    id:          `GA511-${ev.ID || Math.random().toString(36).slice(2, 9)}`,
    lat,
    lng,
    type,
    location:    ev.RoadwayName || 'Atlanta metro',
    severity:    mapSeverity(ev),
    description: desc,
    isLive:      true,
    status:      'ACTIVE',
    minsAgo,
    vehicles:    null,
    injuries:    descLower.includes('injur') ? 1 : 0,
    fatalities:  descLower.includes('fatal') ? 1 : 0,
    weather:     descLower.includes('rain') ? 'Rain' : descLower.includes('fog') ? 'Fog' : 'Clear',
    road:        (descLower.includes('wet') || descLower.includes('rain')) ? 'Wet' : 'Dry',
    factors:     extractFactors(ev),
  };
}

// GET /api/incidents/live — proxies 511GA, 60s cache, Atlanta-bounded
app.get('/api/incidents/live', async (req, res) => {
  // Serve cached result if still fresh
  if (incidentCache.data && Date.now() - incidentCache.ts < CACHE_TTL_MS) {
    return res.json(incidentCache.data);
  }

  const key = process.env.GDOT_511_KEY;
  if (!key || key === 'your_511ga_developer_key_here') {
    return res.json({ incidents: [], source: 'no_key' });
  }

  try {
    const url =
      `https://511ga.org/api/v2/get/event?key=${encodeURIComponent(key)}&format=json`;
    const r = await fetch(url, { signal: AbortSignal.timeout(10_000) });

    if (!r.ok) {
      console.warn(`511GA returned HTTP ${r.status}`);
      return res.json({ incidents: [], source: 'api_error', status: r.status });
    }

    const raw = await r.json();
    const events = Array.isArray(raw) ? raw : (raw.events || raw.Events || []);
const incidents = events.map(transform511Event).filter(Boolean);

    const payload = { incidents, source: 'gdot511', count: incidents.length };
    incidentCache = { data: payload, ts: Date.now() };
    res.json(payload);
  } catch (e) {
    console.error('511GA fetch error:', e.message);
    // Don't cache errors — allow retry on next poll
    res.json({ incidents: [], source: 'error', error: e.message });
  }
});

// POST /api/aria — end-of-shift report generation
app.post('/api/aria', async (req, res) => {
  try {
    const { incidents, decisions, farsStats, now } = req.body;

    const incidentLines = incidents.length
      ? incidents
          .map(
            (i) =>
              `  [${i.id}] ${i.type} | ${i.severity} | ${i.location}` +
              ` | Vehicles: ${i.vehicles ?? '?'}, Injuries: ${i.injuries ?? '?'}` +
              ` | Factors: ${(i.factors || []).join(', ') || 'unknown'}`
          )
          .join('\n')
      : '  (no incidents recorded this session)';

    const decisionLines = Object.entries(decisions).length
      ? Object.entries(decisions)
          .map(([id, d]) => `  ${id}: ${d.action} at ${d.time}`)
          .join('\n')
      : '  (no decisions logged this session)';

    const prompt = `You are ARIA — Atlanta Road Intelligence Advisor for the City of Atlanta Road Safety Operations Center.

Generate a formal end-of-shift report for the outgoing shift supervisor. Use plain text only — no markdown, no asterisks, no dashes as bullets, no special symbols. Use clean structured text with section headers in ALL CAPS followed by a blank line.

SHIFT DATE/TIME: ${now}

INCIDENTS THIS SESSION (${incidents.length} total):
${incidentLines}

OPERATOR DECISIONS LOGGED:
${decisionLines}

HISTORICAL CORRIDOR CONTEXT (NHTSA FARS 2022-2023):
  Total crash records: ${farsStats.total}
  Fatal incidents: ${farsStats.fatal}
  Serious incidents: ${farsStats.serious}
  High-risk corridors on record: ${farsStats.topCorridors.join(', ')}

Generate the report with EXACTLY these four sections in this order. Start immediately with the first header — no preamble:

SHIFT OVERVIEW

HIGHEST PRIORITY INCIDENTS

CORRIDOR ANALYSIS

RECOMMENDED HANDOFF NOTES

Rules:
- SHIFT OVERVIEW: 2-3 sentences — total incidents, severity breakdown, overall operational status.
- HIGHEST PRIORITY INCIDENTS: The 3 most severe or complex incidents. For each write one block: ID, type, location, severity, an ARIA Risk Score 1-10, and one sentence assessment. Separate each incident with a blank line.
- CORRIDOR ANALYSIS: 2-3 sentences on which corridors were most active and any patterns, cross-referenced with FARS historical data.
- RECOMMENDED HANDOFF NOTES: Exactly 4 numbered action items for the incoming shift supervisor.
- Keep the entire report under 550 words.`;

    const report = await callClaude([{ role: 'user', content: prompt }], 1400);
    res.json({ report });
  } catch (e) {
    console.error('Shift report error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/query — natural language operator query
app.post('/api/query', async (req, res) => {
  try {
    const { query, liveIncidents, farsCount, fatalCount } = req.body;
    const prompt = `You are ARIA, the AI assistant for Atlanta Road Safety Operations Center. Answer the operator's query directly and operationally.

ACTIVE INCIDENTS (${liveIncidents.length} total): ${JSON.stringify(liveIncidents.slice(0, 8))}
HISTORICAL FARS: ${farsCount} crash records across Fulton/DeKalb/Cobb/Gwinnett counties 2022-2023. ${fatalCount} fatal incidents recorded.

OPERATOR QUERY: "${query}"

Respond in 2-4 sentences. Be direct. No preamble. No disclaimers.`;

    const answer = await callClaude([{ role: 'user', content: prompt }], 400);
    res.json({ answer });
  } catch (e) {
    console.error('Query error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Atlanta RSOC server running on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('WARNING: ANTHROPIC_API_KEY is not set — AI features will fail');
  }
});
