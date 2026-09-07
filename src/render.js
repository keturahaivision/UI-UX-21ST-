// Minimal Render REST API client. Docs: https://api-docs.render.com/reference

export const RENDER_BASE_URL = 'https://api.render.com/v1';

export class RenderApiError extends Error {
  constructor(status, method, path, body) {
    const detail = typeof body === 'string' ? body : body?.message || JSON.stringify(body);
    super(`Render API ${status} on ${method} ${path}: ${String(detail).slice(0, 400)}`);
    this.status = status;
    this.body = body;
  }
}

export class RenderClient {
  constructor({
    apiKey = process.env.RENDER_API_KEY,
    baseUrl = process.env.RENDER_BASE_URL || RENDER_BASE_URL,
    fetchImpl = globalThis.fetch,
  } = {}) {
    if (!apiKey) {
      throw new Error(
        'RENDER_API_KEY is not set. Create one at https://dashboard.render.com/u/settings#api-keys',
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.fetch = fetchImpl;
  }

  buildUrl(path, query) {
    const url = new URL(this.baseUrl + path);
    for (const [key, value] of Object.entries(query || {})) {
      if (value === undefined || value === null || value === '') continue;
      if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(key, String(v)));
      else url.searchParams.set(key, String(value));
    }
    return url;
  }

  async request(method, path, { query, body } = {}) {
    const res = await this.fetch(this.buildUrl(path, query), {
      method,
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        accept: 'application/json',
        ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    if (!res.ok) throw new RenderApiError(res.status, method, path, data);
    return data;
  }

  // Render list endpoints wrap each item as { cursor, <kind>: {...} }.
  static unwrap(list, kind) {
    if (!Array.isArray(list)) return [];
    return list.map((item) => (item && kind in item ? item[kind] : item));
  }

  // --- Owners / workspaces
  listOwners() {
    return this.request('GET', '/owners', { query: { limit: 100 } }).then((r) => RenderClient.unwrap(r, 'owner'));
  }

  // --- Services
  listServices({ name, type, ownerId, limit = 50 } = {}) {
    return this.request('GET', '/services', { query: { name, type, ownerId, limit } }).then((r) =>
      RenderClient.unwrap(r, 'service'),
    );
  }
  getService(serviceId) {
    return this.request('GET', `/services/${serviceId}`);
  }
  createService(body) {
    return this.request('POST', '/services', { body });
  }
  updateService(serviceId, body) {
    return this.request('PATCH', `/services/${serviceId}`, { body });
  }
  deleteService(serviceId) {
    return this.request('DELETE', `/services/${serviceId}`);
  }
  suspendService(serviceId) {
    return this.request('POST', `/services/${serviceId}/suspend`);
  }
  resumeService(serviceId) {
    return this.request('POST', `/services/${serviceId}/resume`);
  }
  restartService(serviceId) {
    return this.request('POST', `/services/${serviceId}/restart`);
  }
  scaleService(serviceId, numInstances) {
    return this.request('POST', `/services/${serviceId}/scale`, { body: { numInstances } });
  }
  listCustomDomains(serviceId) {
    return this.request('GET', `/services/${serviceId}/custom-domains`, { query: { limit: 50 } }).then((r) =>
      RenderClient.unwrap(r, 'customDomain'),
    );
  }
  listEvents(serviceId, { limit = 20 } = {}) {
    return this.request('GET', `/services/${serviceId}/events`, { query: { limit } }).then((r) =>
      RenderClient.unwrap(r, 'event'),
    );
  }

  // --- Deploys
  listDeploys(serviceId, { limit = 10 } = {}) {
    return this.request('GET', `/services/${serviceId}/deploys`, { query: { limit } }).then((r) =>
      RenderClient.unwrap(r, 'deploy'),
    );
  }
  getDeploy(serviceId, deployId) {
    return this.request('GET', `/services/${serviceId}/deploys/${deployId}`);
  }
  createDeploy(serviceId, { clearCache = false, commitId } = {}) {
    const body = { clearCache: clearCache ? 'clear' : 'do_not_clear' };
    if (commitId) body.commitId = commitId;
    return this.request('POST', `/services/${serviceId}/deploys`, { body });
  }
  cancelDeploy(serviceId, deployId) {
    return this.request('POST', `/services/${serviceId}/deploys/${deployId}/cancel`);
  }
  rollback(serviceId, deployId) {
    return this.request('POST', `/services/${serviceId}/rollback`, { body: { deployId } });
  }

  // --- Environment variables
  listEnvVars(serviceId) {
    return this.request('GET', `/services/${serviceId}/env-vars`, { query: { limit: 100 } }).then((r) =>
      RenderClient.unwrap(r, 'envVar'),
    );
  }
  setEnvVar(serviceId, key, value) {
    return this.request('PUT', `/services/${serviceId}/env-vars/${encodeURIComponent(key)}`, { body: { value } });
  }
  deleteEnvVar(serviceId, key) {
    return this.request('DELETE', `/services/${serviceId}/env-vars/${encodeURIComponent(key)}`);
  }

  // --- Logs & metrics
  listLogs({ ownerId, resource, text, level, type, limit = 100, startTime, endTime, direction = 'backward' }) {
    return this.request('GET', '/logs', {
      query: { ownerId, resource, text, level, type, limit, startTime, endTime, direction },
    });
  }
  getMetrics(metric, { resource, startTime, endTime, resolutionSeconds }) {
    return this.request('GET', `/metrics/${metric}`, {
      query: { resource, startTime, endTime, resolutionSeconds },
    });
  }

  // --- Datastores
  listPostgres({ limit = 50 } = {}) {
    return this.request('GET', '/postgres', { query: { limit } }).then((r) => RenderClient.unwrap(r, 'postgres'));
  }
  listKeyValue({ limit = 50 } = {}) {
    return this.request('GET', '/key-value', { query: { limit } }).then((r) => RenderClient.unwrap(r, 'keyValue'));
  }
}
