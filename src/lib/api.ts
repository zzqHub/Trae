// 前端 API 客户端封装
const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('xgc_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('xgc_token', token);
  else localStorage.removeItem('xgc_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  let body: any = null;
  try { body = await res.json(); } catch {}
  if (!res.ok) {
    const err = new Error(body?.error || `HTTP ${res.status}`) as any;
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body?.data as T;
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<{ token: string; user: any; permissions: any }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ username, password }),
    }),
  register: (username: string, password: string, inviteCode: string) =>
    request<{ token: string; user: any; permissions: any }>('/auth/register', {
      method: 'POST', body: JSON.stringify({ username, password, inviteCode }),
    }),
  me: () => request<{ user: any; permissions: any }>('/auth/me'),

  // Projects
  listProjects: () => request<any[]>('/projects'),
  getProject: (id: string) => request<any>(`/projects/${id}`),
  createProject: (name: string, industry: string, templateId: string) =>
    request<any>('/projects', { method: 'POST', body: JSON.stringify({ name, industry, templateId }) }),
  getProjectTree: (id: string) => request<any[]>(`/projects/${id}/tree`),
  updateProjectTree: (id: string, tree: any[], baseVersion: number, changeNote?: string) =>
    request<any>(`/projects/${id}/tree`, {
      method: 'PATCH', body: JSON.stringify({ tree, baseVersion, changeNote }),
    }),
  listProjectVersions: (id: string) => request<any[]>(`/projects/${id}/versions`),

  // Templates
  listTemplates: () => request<any[]>('/templates'),
  getTemplate: (id: string) => request<any>(`/templates/${id}`),
  listTemplateVersions: (id: string) => request<any[]>(`/templates/${id}/versions`),
  getTemplateVersion: (id: string, vid: string) => request<any>(`/templates/${id}/versions/${vid}`),
  createTemplate: (name: string, industry: string, content: string) =>
    request<any>('/templates', { method: 'POST', body: JSON.stringify({ name, industry, content }) }),
  addTemplateVersion: (id: string, content: string, note: string) =>
    request<any>(`/templates/${id}/versions`, { method: 'POST', body: JSON.stringify({ content, note }) }),
  rollbackTemplate: (id: string, versionId: string) =>
    request<any>(`/templates/${id}/rollback`, { method: 'POST', body: JSON.stringify({ versionId }) }),

  // Generate
  validate: (id: string) => request<any>(`/projects/${id}/validate`, { method: 'POST' }),
  buildAST: (id: string) => request<any>(`/projects/${id}/ast`, { method: 'POST' }),
  exportCode: (id: string, vendor: string) =>
    request<any[]>(`/projects/${id}/export`, { method: 'POST', body: JSON.stringify({ vendor }) }),
  bom: (id: string) => request<any>(`/projects/${id}/bom`, { method: 'POST' }),

  // Users
  listUsers: () => request<any[]>('/users'),
  createUser: (username: string, password: string, role: string) =>
    request<any>('/users', { method: 'POST', body: JSON.stringify({ username, password, role }) }),
  updateUser: (id: string, patch: any) =>
    request<any>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteUser: (id: string) =>
    request<any>(`/users/${id}`, { method: 'DELETE' }),
  getPermissionMatrix: () => request<any>('/users/permissions/matrix'),
  updatePermissionMatrix: (matrix: any) =>
    request<any>('/users/permissions/matrix', { method: 'PUT', body: JSON.stringify({ matrix }) }),
};

// WebSocket 协作客户端
export class CollabClient {
  private ws: WebSocket | null = null;
  private listeners: ((msg: any) => void)[] = [];

  connect(projectId: string) {
    this.disconnect();
    const token = getToken() || '';
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${proto}//${location.host}/ws?token=${encodeURIComponent(token)}`;
    this.ws = new WebSocket(url);
    this.ws.onopen = () => this.send({ type: 'join', projectId });
    this.ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        this.listeners.forEach((l) => l(msg));
      } catch {}
    };
    this.ws.onclose = () => { this.ws = null; };
  }

  disconnect() {
    if (this.ws) {
      try { this.ws.close(); } catch {}
      this.ws = null;
    }
  }

  send(msg: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  on(listener: (msg: any) => void) {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter((l) => l !== listener); };
  }

  lockNode(projectId: string, nodeId: string) {
    this.send({ type: 'lock', projectId, nodeId });
  }
  unlockNode(projectId: string, nodeId: string) {
    this.send({ type: 'unlock', projectId, nodeId });
  }
}

export const collab = new CollabClient();
