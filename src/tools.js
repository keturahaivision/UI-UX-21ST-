// Render tool catalog. Each tool carries a risk tier that the approval policy enforces:
//   read        -> always allowed
//   write       -> allowed in "safe" and "auto" modes, prompted in "ask" mode
//   destructive -> allowed only in "auto" mode, prompted in "ask" mode

import { RenderClient } from './render.js';

const TERMINAL_DEPLOY_STATES = new Set([
  'live',
  'build_failed',
  'update_failed',
  'pre_deploy_failed',
  'canceled',
  'deactivated',
]);

const str = (description, extra = {}) => ({ type: 'string', description, ...extra });
const int = (description, extra = {}) => ({ type: 'integer', description, ...extra });
const bool = (description) => ({ type: 'boolean', description });
const obj = (properties, required = []) => ({
  type: 'object',
  properties,
  required,
  additionalProperties: false,
});

export function summarizeService(s) {
  if (!s || typeof s !== 'object') return s;
  const d = s.serviceDetails || {};
  return {
    id: s.id,
    name: s.name,
    type: s.type,
    ownerId: s.ownerId,
    repo: s.repo,
    branch: s.branch,
    autoDeploy: s.autoDeploy,
    suspended: s.suspended,
    url: d.url,
    plan: d.plan,
    region: d.region,
    runtime: d.runtime ?? d.env,
    numInstances: d.numInstances,
    buildCommand: d.envSpecificDetails?.buildCommand,
    startCommand: d.envSpecificDetails?.startCommand,
    healthCheckPath: d.healthCheckPath,
    dashboardUrl: s.dashboardUrl,
    updatedAt: s.updatedAt,
  };
}

export function summarizeDeploy(d) {
  if (!d || typeof d !== 'object') return d;
  return {
    id: d.id,
    status: d.status,
    trigger: d.trigger,
    commit: d.commit ? { id: d.commit.id, message: d.commit.message?.split('\n')[0], createdAt: d.commit.createdAt } : undefined,
    image: d.image ? { ref: d.image.ref, sha: d.image.sha } : undefined,
    createdAt: d.createdAt,
    startedAt: d.startedAt,
    finishedAt: d.finishedAt,
  };
}

function maskValue(value) {
  if (typeof value !== 'string') return value;
  if (value.length <= 6) return '***';
  return `${value.slice(0, 3)}…${value.slice(-2)} (${value.length} chars)`;
}

function isoHoursAgo(hours) {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

export function buildTools({ render, fetchImpl = globalThis.fetch, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) }) {
  const ownerCache = new Map();
  async function ownerIdFor(serviceId) {
    if (!ownerCache.has(serviceId)) {
      const svc = await render.getService(serviceId);
      ownerCache.set(serviceId, svc.ownerId);
    }
    return ownerCache.get(serviceId);
  }

  return [
    // ------------------------------------------------------------------ read
    {
      name: 'list_owners',
      risk: 'read',
      description: 'List Render workspaces (owners) the API key can access. Owner IDs are needed for log queries and service creation.',
      parameters: obj({}),
      run: () => render.listOwners(),
    },
    {
      name: 'list_services',
      risk: 'read',
      description:
        'List Render services. Use this first to resolve a human name to a service ID (srv-...). Optional filters: name substring, type (web_service, private_service, background_worker, cron_job, static_site).',
      parameters: obj({
        name: str('Filter by service name (exact match as Render applies it)'),
        type: str('Service type filter', {
          enum: ['web_service', 'private_service', 'background_worker', 'cron_job', 'static_site'],
        }),
        limit: int('Max results (default 50)', { minimum: 1, maximum: 100 }),
      }),
      run: async (a) => (await render.listServices(a)).map(summarizeService),
    },
    {
      name: 'get_service',
      risk: 'read',
      description: 'Get full details for one service by ID.',
      parameters: obj({ serviceId: str('Service ID, e.g. srv-abc123') }, ['serviceId']),
      run: (a) => render.getService(a.serviceId),
    },
    {
      name: 'list_deploys',
      risk: 'read',
      description: 'List recent deploys for a service (newest first) with status, commit, and timing.',
      parameters: obj(
        { serviceId: str('Service ID'), limit: int('Max results (default 10)', { minimum: 1, maximum: 100 }) },
        ['serviceId'],
      ),
      run: async (a) => (await render.listDeploys(a.serviceId, { limit: a.limit })).map(summarizeDeploy),
    },
    {
      name: 'get_deploy',
      risk: 'read',
      description: 'Get one deploy by ID.',
      parameters: obj({ serviceId: str('Service ID'), deployId: str('Deploy ID, e.g. dep-abc123') }, ['serviceId', 'deployId']),
      run: async (a) => summarizeDeploy(await render.getDeploy(a.serviceId, a.deployId)),
    },
    {
      name: 'list_events',
      risk: 'read',
      description: 'List recent service events (deploy started/ended, crashes, suspensions, scaling, config changes).',
      parameters: obj(
        { serviceId: str('Service ID'), limit: int('Max results (default 20)', { minimum: 1, maximum: 100 }) },
        ['serviceId'],
      ),
      run: (a) => render.listEvents(a.serviceId, { limit: a.limit }),
    },
    {
      name: 'get_logs',
      risk: 'read',
      description:
        'Fetch recent logs for a service or datastore. Supports text search and level filtering. Defaults to the last 100 lines.',
      parameters: obj(
        {
          resourceId: str('Service or datastore ID (srv-..., dpg-..., red-...)'),
          text: str('Only lines containing this text'),
          level: str('Log level filter', { enum: ['info', 'warning', 'error'] }),
          type: str('Log type filter', { enum: ['app', 'build', 'request'] }),
          limit: int('Max lines (default 100)', { minimum: 1, maximum: 500 }),
          hours: int('Look back this many hours (default 1)', { minimum: 1, maximum: 168 }),
        },
        ['resourceId'],
      ),
      run: async (a) => {
        const ownerId = a.resourceId.startsWith('srv-') ? await ownerIdFor(a.resourceId) : (await render.listOwners())[0]?.id;
        const res = await render.listLogs({
          ownerId,
          resource: [a.resourceId],
          text: a.text ? [a.text] : undefined,
          level: a.level ? [a.level] : undefined,
          type: a.type ? [a.type] : undefined,
          limit: a.limit ?? 100,
          startTime: isoHoursAgo(a.hours ?? 1),
          endTime: new Date().toISOString(),
        });
        const logs = (res?.logs ?? []).map((l) => `${l.timestamp} ${l.message}`);
        return { count: logs.length, hasMore: res?.hasMore ?? false, lines: logs };
      },
    },
    {
      name: 'get_metrics',
      risk: 'read',
      description: 'Fetch a time series metric for a service or datastore over the last N hours.',
      parameters: obj(
        {
          resourceId: str('Service or datastore ID'),
          metric: str('Metric name', {
            enum: ['cpu', 'memory', 'http-requests', 'http-latency', 'instance-count', 'bandwidth', 'active-connections'],
          }),
          hours: int('Look back window in hours (default 1)', { minimum: 1, maximum: 168 }),
        },
        ['resourceId', 'metric'],
      ),
      run: (a) =>
        render.getMetrics(a.metric, {
          resource: a.resourceId,
          startTime: isoHoursAgo(a.hours ?? 1),
          endTime: new Date().toISOString(),
          resolutionSeconds: (a.hours ?? 1) > 6 ? 3600 : 300,
        }),
    },
    {
      name: 'list_env_vars',
      risk: 'read',
      description: 'List environment variable keys for a service. Values are masked unless reveal=true.',
      parameters: obj({ serviceId: str('Service ID'), reveal: bool('Return raw values (secrets!)') }, ['serviceId']),
      run: async (a) =>
        (await render.listEnvVars(a.serviceId)).map((e) => ({ key: e.key, value: a.reveal ? e.value : maskValue(e.value) })),
    },
    {
      name: 'list_custom_domains',
      risk: 'read',
      description: 'List custom domains attached to a service with verification status.',
      parameters: obj({ serviceId: str('Service ID') }, ['serviceId']),
      run: (a) => render.listCustomDomains(a.serviceId),
    },
    {
      name: 'list_datastores',
      risk: 'read',
      description: 'List Postgres databases and Key Value (Redis-compatible) instances.',
      parameters: obj({}),
      run: async () => ({ postgres: await render.listPostgres(), keyValue: await render.listKeyValue() }),
    },
    {
      name: 'http_check',
      risk: 'read',
      description: 'Make a GET request to a public URL (e.g. the service URL or its health endpoint) and report status, latency, and a body preview. Use it to verify a deploy actually serves traffic.',
      parameters: obj({ url: str('Absolute http(s) URL') }, ['url']),
      run: async (a) => {
        const url = new URL(a.url);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only http/https URLs are allowed');
        const started = Date.now();
        const res = await fetchImpl(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(15000) });
        const body = (await res.text()).slice(0, 600);
        return { status: res.status, latencyMs: Date.now() - started, contentType: res.headers.get('content-type'), bodyPreview: body };
      },
    },
    {
      name: 'wait_for_deploy',
      risk: 'read',
      description:
        'Block until a deploy reaches a terminal state (live, build_failed, update_failed, canceled...). Call this after trigger_deploy or rollback_deploy so you can verify the outcome.',
      parameters: obj(
        {
          serviceId: str('Service ID'),
          deployId: str('Deploy ID'),
          timeoutSeconds: int('Give up after this many seconds (default 600)', { minimum: 10, maximum: 1800 }),
        },
        ['serviceId', 'deployId'],
      ),
      run: async (a) => {
        const deadline = Date.now() + (a.timeoutSeconds ?? 600) * 1000;
        let deploy;
        while (Date.now() < deadline) {
          deploy = await render.getDeploy(a.serviceId, a.deployId);
          if (TERMINAL_DEPLOY_STATES.has(deploy.status)) return { done: true, deploy: summarizeDeploy(deploy) };
          await sleep(10000);
        }
        return { done: false, timedOut: true, deploy: summarizeDeploy(deploy) };
      },
    },

    // ----------------------------------------------------------------- write
    {
      name: 'trigger_deploy',
      risk: 'write',
      description: 'Start a new deploy of a service from its configured branch (or a specific commit). Returns the new deploy ID.',
      parameters: obj(
        {
          serviceId: str('Service ID'),
          clearCache: bool('Clear the build cache first (slower, fixes stale dependency issues)'),
          commitId: str('Deploy a specific commit SHA instead of the branch head'),
        },
        ['serviceId'],
      ),
      run: async (a) => summarizeDeploy(await render.createDeploy(a.serviceId, a)),
    },
    {
      name: 'cancel_deploy',
      risk: 'write',
      description: 'Cancel an in-progress deploy.',
      parameters: obj({ serviceId: str('Service ID'), deployId: str('Deploy ID') }, ['serviceId', 'deployId']),
      run: async (a) => summarizeDeploy(await render.cancelDeploy(a.serviceId, a.deployId)),
    },
    {
      name: 'rollback_deploy',
      risk: 'write',
      description: 'Roll a service back to a previous successful deploy. Find candidate deploy IDs with list_deploys (status=live in the past).',
      parameters: obj({ serviceId: str('Service ID'), deployId: str('Deploy ID to roll back to') }, ['serviceId', 'deployId']),
      run: async (a) => summarizeDeploy(await render.rollback(a.serviceId, a.deployId)),
    },
    {
      name: 'restart_service',
      risk: 'write',
      description: 'Restart all instances of a service without redeploying.',
      parameters: obj({ serviceId: str('Service ID') }, ['serviceId']),
      run: async (a) => (await render.restartService(a.serviceId)) ?? { ok: true },
    },
    {
      name: 'resume_service',
      risk: 'write',
      description: 'Resume a suspended service.',
      parameters: obj({ serviceId: str('Service ID') }, ['serviceId']),
      run: async (a) => (await render.resumeService(a.serviceId)) ?? { ok: true },
    },
    {
      name: 'scale_service',
      risk: 'write',
      description: 'Set the number of running instances for a service (manual scaling).',
      parameters: obj({ serviceId: str('Service ID'), numInstances: int('Instance count', { minimum: 0, maximum: 100 }) }, [
        'serviceId',
        'numInstances',
      ]),
      run: async (a) => (await render.scaleService(a.serviceId, a.numInstances)) ?? { ok: true, numInstances: a.numInstances },
    },
    {
      name: 'set_env_var',
      risk: 'write',
      description: 'Create or update one environment variable. Note: Render triggers a redeploy for services with auto-deploy enabled.',
      parameters: obj({ serviceId: str('Service ID'), key: str('Variable name'), value: str('Variable value') }, [
        'serviceId',
        'key',
        'value',
      ]),
      run: async (a) => {
        const r = await render.setEnvVar(a.serviceId, a.key, a.value);
        return { key: r?.key ?? a.key, value: maskValue(a.value) };
      },
    },
    {
      name: 'update_service',
      risk: 'write',
      description:
        'Update service settings: name, branch, autoDeploy (yes/no), or build/start commands and health check path via serviceDetails.',
      parameters: obj(
        {
          serviceId: str('Service ID'),
          name: str('New service name'),
          branch: str('Git branch to deploy'),
          autoDeploy: str('Auto deploy on push', { enum: ['yes', 'no'] }),
          buildCommand: str('Build command'),
          startCommand: str('Start command'),
          healthCheckPath: str('HTTP health check path, e.g. /healthz'),
        },
        ['serviceId'],
      ),
      run: async (a) => {
        const body = {};
        for (const k of ['name', 'branch', 'autoDeploy']) if (a[k] !== undefined) body[k] = a[k];
        const details = {};
        if (a.healthCheckPath !== undefined) details.healthCheckPath = a.healthCheckPath;
        const env = {};
        if (a.buildCommand !== undefined) env.buildCommand = a.buildCommand;
        if (a.startCommand !== undefined) env.startCommand = a.startCommand;
        if (Object.keys(env).length) details.envSpecificDetails = env;
        if (Object.keys(details).length) body.serviceDetails = details;
        return summarizeService(await render.updateService(a.serviceId, body));
      },
    },
    {
      name: 'create_web_service',
      risk: 'write',
      description:
        'Create a new web service from a public or connected Git repository. Requires ownerId (see list_owners). Defaults: runtime node, plan starter, region oregon.',
      parameters: obj(
        {
          ownerId: str('Workspace/owner ID'),
          name: str('Service name'),
          repo: str('Git repo URL, e.g. https://github.com/org/repo'),
          branch: str('Branch (default main)'),
          runtime: str('Runtime', { enum: ['node', 'python', 'go', 'rust', 'ruby', 'elixir', 'docker'] }),
          plan: str('Instance plan', { enum: ['free', 'starter', 'standard', 'pro'] }),
          region: str('Region', { enum: ['oregon', 'ohio', 'virginia', 'frankfurt', 'singapore'] }),
          buildCommand: str('Build command (non-docker runtimes)'),
          startCommand: str('Start command (non-docker runtimes)'),
          envVars: {
            type: 'array',
            description: 'Initial environment variables',
            items: obj({ key: str('Name'), value: str('Value') }, ['key', 'value']),
          },
        },
        ['ownerId', 'name', 'repo'],
      ),
      run: async (a) => {
        const runtime = a.runtime ?? 'node';
        const body = {
          type: 'web_service',
          name: a.name,
          ownerId: a.ownerId,
          repo: a.repo,
          branch: a.branch ?? 'main',
          autoDeploy: 'yes',
          envVars: a.envVars ?? [],
          serviceDetails: {
            runtime,
            plan: a.plan ?? 'starter',
            region: a.region ?? 'oregon',
            envSpecificDetails:
              runtime === 'docker' ? {} : { buildCommand: a.buildCommand ?? '', startCommand: a.startCommand ?? '' },
          },
        };
        const res = await render.createService(body);
        return { service: summarizeService(res?.service ?? res), deploy: summarizeDeploy(res?.deploy) };
      },
    },

    // ----------------------------------------------------------- destructive
    {
      name: 'suspend_service',
      risk: 'destructive',
      description: 'Suspend a service: it stops serving traffic and stops billing until resumed.',
      parameters: obj({ serviceId: str('Service ID') }, ['serviceId']),
      run: async (a) => (await render.suspendService(a.serviceId)) ?? { ok: true },
    },
    {
      name: 'delete_env_var',
      risk: 'destructive',
      description: 'Delete an environment variable from a service.',
      parameters: obj({ serviceId: str('Service ID'), key: str('Variable name') }, ['serviceId', 'key']),
      run: async (a) => (await render.deleteEnvVar(a.serviceId, a.key)) ?? { ok: true, deleted: a.key },
    },
    {
      name: 'delete_service',
      risk: 'destructive',
      description: 'Permanently delete a service. Irreversible.',
      parameters: obj({ serviceId: str('Service ID'), confirmName: str('The service name, typed again as confirmation') }, [
        'serviceId',
        'confirmName',
      ]),
      run: async (a) => {
        const svc = await render.getService(a.serviceId);
        if (svc.name !== a.confirmName) throw new Error(`confirmName "${a.confirmName}" does not match service name "${svc.name}"`);
        await render.deleteService(a.serviceId);
        return { ok: true, deleted: svc.name };
      },
    },
  ];
}

// OpenAI / HF router tool schema.
export function toOpenAITools(tools) {
  return tools.map((t) => ({
    type: 'function',
    function: { name: t.name, description: t.description, parameters: t.parameters },
  }));
}

export const MODES = ['read-only', 'safe', 'auto', 'ask'];

// Returns true/false for whether a tool may run under the given policy.
export async function authorize(tool, args, policy) {
  const mode = policy?.mode ?? 'safe';
  if (tool.risk === 'read') return true;
  if (mode === 'read-only') return false;
  if (mode === 'auto') return true;
  if (mode === 'safe') return tool.risk === 'write';
  if (mode === 'ask') return policy.approve ? Boolean(await policy.approve(tool, args)) : false;
  throw new Error(`Unknown policy mode: ${mode}`);
}

// Clamp a requested mode so it never exceeds a ceiling (used by the web UI and MCP server).
export function clampMode(requested, ceiling) {
  const rank = { 'read-only': 0, safe: 1, auto: 2 };
  if (requested === 'ask') return 'ask';
  const r = rank[requested] ?? 1;
  const c = rank[ceiling] ?? 1;
  return Object.keys(rank)[Math.min(r, c)];
}
