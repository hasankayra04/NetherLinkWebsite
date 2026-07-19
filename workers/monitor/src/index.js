const PANEL = 'https://panel.mccompanion.net';

const MAX_HISTORY = 720;

const HTTP_ENDPOINTS = [
  { name: 'API (public)',  group: 'api',            url: 'https://api.mccompanion.net/api/featured-servers' },
  { name: 'API direct EU', group: 'api',            url: 'https://eubackend.mccompanion.net/api/featured-servers' },
  { name: 'API direct US', group: 'api',            url: 'https://usbackend.mccompanion.net/api/featured-servers' },
  { name: 'Pelican Panel', group: 'infrastructure', url: PANEL },
];

const PELICAN_SERVERS = [
  { id: 'c6a0fcad', name: 'EU Redis',          group: 'infrastructure' },
  { id: 'f176ca5a', name: 'US Redis',          group: 'infrastructure' },
  { id: 'a0a42068', name: 'EU Relay',          group: 'infrastructure' },
  { id: 'f9a27188', name: 'US Relay',          group: 'infrastructure' },
  { id: '82947325', name: 'EU API',            group: 'api'            },
  { id: '60e47e69', name: 'US API',            group: 'api'            },
  { id: 'e3b00977', name: 'EU MCCBot',         group: 'bots'           },
  { id: '72b6a16b', name: 'EU Xbox Broadcast', group: 'bots'           },
  { id: '071f1b1c', name: 'US Xbox Broadcast', group: 'bots'           },
  { id: 'fbd2e58b', name: 'EU Geyser',         group: 'bots'           },
  { id: '4b70a1de', name: 'US Geyser',         group: 'bots'           },
  { id: '8b060c22', name: 'MCC Status Bot',    group: 'bots'           },
];

const ALL_NAMES = [...HTTP_ENDPOINTS, ...PELICAN_SERVERS].map(s => s.name);
const DUPLICATE_NAMES = [...new Set(ALL_NAMES.filter((n, i) => ALL_NAMES.indexOf(n) !== i))];

const SEVERITY = { up: 0, degraded: 1, unknown: 2, down: 3 };
const isBad = (status) => (SEVERITY[status] ?? 2) > 0;
const escalated = (prev, curr) =>
  prev !== 'unknown' && (SEVERITY[curr] ?? 2) > (SEVERITY[prev] ?? 0);

async function checkHttp(endpoint) {
  const RETRIES = 2;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const start = Date.now();
    try {
      const res = await fetch(endpoint.url, { signal: AbortSignal.timeout(8000) });
      return {
        name: endpoint.name,
        group: endpoint.group,
        status: res.status < 500 ? 'up' : 'degraded',
        latency_ms: Date.now() - start,
      };
    } catch {
      if (attempt < RETRIES) await new Promise(r => setTimeout(r, 2000));
    }
  }
  return { name: endpoint.name, group: endpoint.group, status: 'down', latency_ms: null };
}

async function fetchPelicanResources(id, clientKey) {
  try {
    const res = await fetch(`${PANEL}/api/client/servers/${id}/resources`, {
      headers: { Authorization: `Bearer ${clientKey}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.attributes ?? null;
  } catch {
    return null;
  }
}

function checkPelican(server, attrs) {
  if (!attrs) {
    return {
      name: server.name, group: server.group, status: 'unknown', latency_ms: null,
      state: 'unknown', memory_mb: null, cpu_percent: null, disk_mb: null, uptime_s: null,
    };
  }

  const state = attrs.current_state;
  const status = attrs.is_suspended ? 'down'
    : state === 'running' ? 'up'
    : state === 'offline' ? 'down'
    : (state === 'starting' || state === 'stopping') ? 'degraded'
    : 'unknown';

  const r = attrs.resources ?? {};
  return {
    name: server.name,
    group: server.group,
    status,
    latency_ms: null,
    state: state ?? 'unknown',
    memory_mb: r.memory_bytes != null ? Math.round(r.memory_bytes / 1048576) : null,
    cpu_percent: r.cpu_absolute != null ? Math.round(r.cpu_absolute * 10) / 10 : null,
    disk_mb: r.disk_bytes != null ? Math.round(r.disk_bytes / 1048576) : null,
    uptime_s: r.uptime != null ? Math.round(r.uptime / 1000) : null,
  };
}

async function fetchGist(gistId, token) {
  try {
    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'MCCompanion-Monitor',
        Accept: 'application/vnd.github+json',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const gist = await res.json();
    const raw = gist.files?.['status.json']?.content;
    if (raw == null) return { services: [], history: [] };
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function updateGist(gistId, token, content) {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'MCCompanion-Monitor',
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ files: { 'status.json': { content: JSON.stringify(content, null, 2) } } }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) console.error(`[monitor] gist update failed: HTTP ${res.status}`);
  return res.status;
}

const ALERT_ROLE = '1515309276342648852';

const STATUS_EMOJI = { up: '🟢', down: '🔴', degraded: '🟡', unknown: '⚫' };

function describe(s) {
  const usage = (s.memory_mb != null || s.cpu_percent != null)
    ? `  (${s.cpu_percent ?? '?'}% CPU, ${s.memory_mb ?? '?'} MB)`
    : '';
  return `${STATUS_EMOJI[s.status] ?? '⚫'} **${s.name}**, ${s.status}${usage}`;
}

async function sendDiscordAlert(webhookUrl, newlyBad, recovered) {
  const blocks = [];
  if (newlyBad.length > 0) {
    blocks.push(`<@&${ALERT_ROLE}> Service disruption detected!\n${newlyBad.map(describe).join('\n')}`);
  }
  if (recovered.length > 0) {
    blocks.push(`Back up again:\n${recovered.map(describe).join('\n')}`);
  }
  if (blocks.length === 0) return;

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: blocks.join('\n\n'), username: 'MCCompanion Monitor' }),
    signal: AbortSignal.timeout(10000),
  });
}

async function runMonitor(env) {
  const now = new Date().toISOString();

  if (DUPLICATE_NAMES.length > 0) {
    console.error(`[monitor] duplicate service names, alerts will shadow each other: ${DUPLICATE_NAMES.join(', ')}`);
  }

  const [existing, httpResults, pelicanAttrs] = await Promise.all([
    fetchGist(env.GIST_ID, env.GIST_TOKEN),
    Promise.all(HTTP_ENDPOINTS.map(checkHttp)),
    Promise.all(PELICAN_SERVERS.map(s => fetchPelicanResources(s.id, env.PELICAN_CLIENT_KEY))),
  ]);
  if (existing === null) {
    console.error('[monitor] could not read gist, skipping this cycle to protect history');
    return;
  }

  const pelicanResults = PELICAN_SERVERS.map((s, i) => checkPelican(s, pelicanAttrs[i]));
  const services = [...pelicanResults, ...httpResults];

  const prevMap = Object.fromEntries((existing.services ?? []).map(s => [s.name, s.status]));
  const newlyBad = services.filter(s => prevMap[s.name] && escalated(prevMap[s.name], s.status));
  const recovered = services.filter(s => !isBad(s.status) && prevMap[s.name] && isBad(prevMap[s.name]));

  if (env.DISCORD_WEBHOOK && (newlyBad.length > 0 || recovered.length > 0)) {
    try {
      await sendDiscordAlert(env.DISCORD_WEBHOOK, newlyBad, recovered);
    } catch (err) {
      console.error('[monitor] discord alert failed:', err);
    }
  }
  const historyEntry = {
    timestamp: now,
    checks: services.map(s => ({ name: s.name, group: s.group, status: s.status })),
  };
  const history = [...(existing.history || []), historyEntry].slice(-MAX_HISTORY);

  const status = await updateGist(env.GIST_ID, env.GIST_TOKEN, { updated_at: now, services, history });
  console.log(`[${now}] Gist updated (HTTP ${status}):`, services.map(s => `${s.name}=${s.status}`).join(', '));
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runMonitor(env).catch(err => console.error('[monitor] run failed:', err)));
  },

  async fetch(request, env, ctx) {
    const secret = env.TRIGGER_SECRET;
    if (!secret || request.headers.get('X-Trigger-Secret') !== secret) {
      return new Response('Unauthorized', { status: 401 });
    }
    ctx.waitUntil(runMonitor(env).catch(err => console.error('[monitor] run failed:', err)));
    return new Response('Monitor triggered', { status: 200 });
  },
};
