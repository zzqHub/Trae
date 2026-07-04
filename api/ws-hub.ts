import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { verifyToken, getUserById } from './auth.js';
import { acquireLock, releaseLock, listLocks } from './services.js';
import type { WSMessage, PresenceUser } from '../shared/types.js';

const COLORS = ['#22D3EE', '#F59E0B', '#10B981', '#A855F7', '#EF4444', '#EC4899'];

interface Client {
  ws: WebSocket;
  userId: string;
  username: string;
  projectId: string | null;
  color: string;
}

const clients = new Map<WebSocket, Client>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    // 从 URL 查询参数取 token (ws 不能设 header)
    const url = new URL(req.url || '', 'http://localhost');
    const token = url.searchParams.get('token') || '';
    const payload = verifyToken(token);
    if (!payload) {
      ws.close(4001, 'Unauthorized');
      return;
    }
    const user = getUserById(payload.id);
    if (!user) {
      ws.close(4001, 'User not found');
      return;
    }
    const color = COLORS[(clients.size) % COLORS.length];
    const client: Client = { ws, userId: user.id, username: user.username, projectId: null, color };
    clients.set(ws, client);

    ws.on('message', (raw) => {
      let msg: WSMessage;
      try { msg = JSON.parse(raw.toString()); } catch { return; }
      handleClientMessage(client, msg);
    });

    ws.on('close', () => {
      // 离开当前项目
      if (client.projectId) {
        leaveProject(client);
      }
      clients.delete(ws);
    });

    ws.on('error', () => clients.delete(ws));
  });
}

function handleClientMessage(client: Client, msg: WSMessage) {
  switch (msg.type) {
    case 'join': {
      if (client.projectId) leaveProject(client);
      client.projectId = msg.projectId;
      broadcastPresence(client.projectId);
      // 推送当前所有锁
      const locks = listLocks(client.projectId);
      locks.forEach((l) => {
        send(client.ws, { type: 'locked', nodeId: l.nodeId, by: l.userId });
      });
      break;
    }
    case 'leave': {
      leaveProject(client);
      break;
    }
    case 'lock': {
      if (!client.projectId) return;
      const ok = acquireLock(client.projectId, msg.nodeId, client.userId);
      if (ok) {
        broadcast(client.projectId, { type: 'locked', nodeId: msg.nodeId, by: client.username });
      } else {
        send(client.ws, { type: 'conflict', nodeId: msg.nodeId, reason: '节点已被他人锁定' });
      }
      break;
    }
    case 'unlock': {
      if (!client.projectId) return;
      releaseLock(client.projectId, msg.nodeId, client.userId);
      broadcast(client.projectId, { type: 'unlocked', nodeId: msg.nodeId });
      break;
    }
    case 'edit': {
      if (!client.projectId) return;
      // 实际变更通过 REST 提交；这里只做广播
      broadcast(client.projectId, {
        type: 'updated', nodeId: msg.nodeId, patch: msg.patch, version: msg.baseVersion + 1,
      }, client.userId);
      break;
    }
  }
}

function leaveProject(client: Client) {
  if (!client.projectId) return;
  // 释放该用户在此项目上的所有锁
  const locks = listLocks(client.projectId);
  locks.filter((l) => l.userId === client.userId).forEach((l) => {
    releaseLock(client.projectId, l.nodeId, client.userId);
    broadcast(client.projectId, { type: 'unlocked', nodeId: l.nodeId });
  });
  const pid = client.projectId;
  client.projectId = null;
  broadcastPresence(pid);
}

function broadcastPresence(projectId: string | null) {
  if (!projectId) return;
  const users: PresenceUser[] = [];
  for (const c of clients.values()) {
    if (c.projectId === projectId) {
      users.push({ userId: c.userId, username: c.username, color: c.color });
    }
  }
  broadcast(projectId, { type: 'presence', users });
}

function broadcast(projectId: string, msg: WSMessage, excludeUserId?: string) {
  for (const c of clients.values()) {
    if (c.projectId === projectId && c.userId !== excludeUserId) {
      send(c.ws, msg);
    }
  }
}

function send(ws: WebSocket, msg: WSMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}
