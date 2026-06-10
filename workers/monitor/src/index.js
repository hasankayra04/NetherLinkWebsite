const PANEL = 'https://panel.mccompanion.net';
const MAX_HISTORY = 288;

const HTTP_ENDPOINTS = [
  { name: 'EU API', group: 'api', url: 'https://api.mccompanion.net/api/featured-servers' },
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

async function checkHttp(endpoint) {
  const start = Date.now();
  try {
    const res = await fetch(endpoint.url, { signal: AbortSignal.timeout(8000) });
    return { name: endpoint.name, group: endpoint.group, status: res.status < 500 ? 'up' : 'degraded', latency_ms: Date.now() - start };
  } catch {
    return { name: endpoint.name, group: endpoint.group, status: 'down', latency_ms: null };
  }
}

async function fetchAllPelicanServers(apiKey) {
  try {
    const res = await fetch(`${PANEL}/api/application/servers?per_page=100`, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return {};
    const data = await res.json();
    const map = {};
    for (const s of data.data ?? []) {
      const id = s.attributes?.identifier;
      const status = s.attributes?.status;
      if (id) map[id] = status;
    }
    return map;
  } catch {
    return {};
  }
}

function checkPelican(server, statusMap) {
  if (!(server.id in statusMap)) {
    return { name: server.name, group: server.group, status: 'unknown', latency_ms: null };
  }
  const raw = statusMap[server.id];
  const status = raw === null ? 'up' : raw === 'suspended' ? 'down' : 'degraded';
  return { name: server.name, group: server.group, status, latency_ms: null, state: raw ?? 'running' };
}

async function fetchGist(gistId, token) {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'MCCompanion-Monitor', Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) return { services: [], history: [] };
  const gist = await res.json();
  try {
    return JSON.parse(gist.files?.['status.json']?.content ?? '{}');
  } catch {
    return { services: [], history: [] };
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
  });
  return res.status;
}

const ALERT_ROLE = '1487850126092533832';

const STATUS_EMOJI = { up: '🟢', down: '🔴', degraded: '🟡', unknown: '⚫' };

async function sendDiscordAlert(webhookUrl, downServices) {
  const lines = downServices.map(s => `${STATUS_EMOJI[s.status] ?? '⚫'} **${s.name}** — ${s.status}`).join('\n');
  const body = {
    content: `<@&${ALERT_ROLE}> Service disruption detected!\n${lines}`,
    username: 'MCCompanion Monitor',
  };
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function runMonitor(env) {
  const now = new Date().toISOString();

  const [existing, httpResults, pelicanMap] = await Promise.all([
    fetchGist(env.GIST_ID, env.GIST_TOKEN),
    Promise.all(HTTP_ENDPOINTS.map(checkHttp)),
    fetchAllPelicanServers(env.PELICAN_API_KEY),
  ]);

  const pelicanResults = PELICAN_SERVERS.map(s => checkPelican(s, pelicanMap));
  const services = [...pelicanResults, ...httpResults];

  // Alert only when a service newly goes down (was up before)
  if (env.DISCORD_WEBHOOK) {
    const prevMap = Object.fromEntries((existing.services ?? []).map(s => [s.name, s.status]));
    const newlyDown = services.filter(s =>
      (s.status === 'down' || s.status === 'degraded') && prevMap[s.name] === 'up'
    );
    if (newlyDown.length > 0) {
      await sendDiscordAlert(env.DISCORD_WEBHOOK, newlyDown);
    }
  }

  const historyEntry = {
    timestamp: now,
    checks: services.map(s => ({ name: s.name, group: s.group, status: s.status })),
  };
  const history = [...(existing.history || []), historyEntry].slice(-MAX_HISTORY);
  const output = { updated_at: now, services, history };

  const status = await updateGist(env.GIST_ID, env.GIST_TOKEN, output);
  console.log(`[${now}] Gist updated (HTTP ${status}):`, services.map(s => `${s.name}=${s.status}`).join(', '));
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runMonitor(env));
  },

  async fetch(request, env, ctx) {
    ctx.waitUntil(runMonitor(env));
    return new Response('Monitor triggered', { status: 200 });
  },
};
