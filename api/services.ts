import { db } from './db.js';
import { randomUUID } from 'crypto';
import type { Project, TreeNode, Template, TemplateVersion, ProjectVersion } from '../shared/types.js';

// === 模板 ===
export function listTemplates(): Template[] {
  const rows = db.prepare(`
    SELECT t.id, t.name, t.industry, t.current_version_id as currentVersionId,
           tv.version_no as currentVersionNo, t.created_at as createdAt
    FROM templates t
    LEFT JOIN template_versions tv ON tv.id = t.current_version_id
    ORDER BY t.created_at DESC
  `).all() as any[];
  return rows.map(r => ({ id: r.id, name: r.name, industry: r.industry, currentVersionId: r.currentVersionId, currentVersionNo: r.currentVersionNo || 0, createdAt: r.createdAt }));
}

export function getTemplate(id: string): Template | null {
  const r = db.prepare(`SELECT t.id, t.name, t.industry, t.current_version_id as currentVersionId,
           tv.version_no as currentVersionNo, t.created_at as createdAt
    FROM templates t LEFT JOIN template_versions tv ON tv.id = t.current_version_id
    WHERE t.id=?`).get(id) as any;
  if (!r) return null;
  return { id: r.id, name: r.name, industry: r.industry, currentVersionId: r.currentVersionId, currentVersionNo: r.currentVersionNo || 0, createdAt: r.createdAt };
}

export function listTemplateVersions(templateId: string): TemplateVersion[] {
  const rows = db.prepare(`SELECT id, template_id as templateId, version_no as versionNo, content, note,
    created_by as createdBy, created_at as createdAt FROM template_versions WHERE template_id=? ORDER BY version_no DESC`)
    .all(templateId) as any[];
  return rows as TemplateVersion[];
}

export function getTemplateVersion(versionId: string): TemplateVersion | null {
  const r = db.prepare(`SELECT id, template_id as templateId, version_no as versionNo, content, note,
    created_by as createdBy, created_at as createdAt FROM template_versions WHERE id=?`).get(versionId) as any;
  return r || null;
}

export function createTemplate(name: string, industry: string, content: string, createdBy: string): Template {
  const id = 'tpl-' + randomUUID().slice(0, 8);
  const vid = 'tpv-' + randomUUID().slice(0, 8);
  const now = Date.now();
  db.prepare(`INSERT INTO templates (id, name, industry, current_version_id, created_at) VALUES (?,?,?,?,?)`)
    .run(id, name, industry, vid, now);
  db.prepare(`INSERT INTO template_versions (id, template_id, version_no, content, note, created_by, created_at) VALUES (?,?,?,?,?,?,?)`)
    .run(vid, id, 1, content, '初始版本', createdBy, now);
  return { id, name, industry, currentVersionId: vid, currentVersionNo: 1, createdAt: now };
}

export function addTemplateVersion(templateId: string, content: string, note: string, createdBy: string): TemplateVersion | null {
  const last = db.prepare(`SELECT MAX(version_no) as maxNo FROM template_versions WHERE template_id=?`).get(templateId) as any;
  const nextNo = (last?.maxNo || 0) + 1;
  const vid = 'tpv-' + randomUUID().slice(0, 8);
  const now = Date.now();
  db.prepare(`INSERT INTO template_versions (id, template_id, version_no, content, note, created_by, created_at) VALUES (?,?,?,?,?,?,?)`)
    .run(vid, templateId, nextNo, content, note, createdBy, now);
  db.prepare(`UPDATE templates SET current_version_id=? WHERE id=?`).run(vid, templateId);
  return getTemplateVersion(vid);
}

export function rollbackTemplate(templateId: string, versionId: string): Template | null {
  const ver = getTemplateVersion(versionId);
  if (!ver) return null;
  db.prepare(`UPDATE templates SET current_version_id=? WHERE id=?`).run(versionId, templateId);
  return getTemplate(templateId);
}

// === 项目 ===
export function listProjects(userId?: string): Project[] {
  const rows = db.prepare(`
    SELECT p.id, p.name, p.industry, p.template_id as templateId, p.template_version_id as templateVersionId,
           p.owner_id as ownerId, u.username as ownerName, p.status, p.current_version as currentVersion,
           p.created_at as createdAt, p.updated_at as updatedAt
    FROM projects p LEFT JOIN users u ON u.id = p.owner_id
    ${userId ? 'WHERE p.owner_id=? OR EXISTS (SELECT 1 FROM project_members m WHERE m.project_id=p.id AND m.user_id=?)' : ''}
    ORDER BY p.updated_at DESC
    ${userId ? '' : ''}
  `);
  const params = userId ? [userId, userId] : [];
  const list = rows.all(...params) as any[];
  return list.map(r => ({
    id: r.id, name: r.name, industry: r.industry, templateId: r.templateId, templateVersionId: r.templateVersionId,
    ownerId: r.ownerId, ownerName: r.ownerName, status: r.status, currentVersion: r.currentVersion,
    createdAt: r.createdAt, updatedAt: r.updatedAt,
  }));
}

export function getProject(id: string): Project | null {
  const r = db.prepare(`SELECT p.id, p.name, p.industry, p.template_id as templateId, p.template_version_id as templateVersionId,
           p.owner_id as ownerId, u.username as ownerName, p.status, p.current_version as currentVersion,
           p.created_at as createdAt, p.updated_at as updatedAt
    FROM projects p LEFT JOIN users u ON u.id = p.owner_id WHERE p.id=?`).get(id) as any;
  if (!r) return null;
  return {
    id: r.id, name: r.name, industry: r.industry, templateId: r.templateId, templateVersionId: r.templateVersionId,
    ownerId: r.ownerId, ownerName: r.ownerName, status: r.status, currentVersion: r.currentVersion,
    createdAt: r.createdAt, updatedAt: r.updatedAt,
  };
}

export function createProject(name: string, industry: string, templateId: string, ownerId: string): Project | null {
  const tpl = getTemplate(templateId);
  if (!tpl || !tpl.currentVersionId) return null;
  const ver = getTemplateVersion(tpl.currentVersionId);
  if (!ver) return null;

  const id = 'prj-' + randomUUID().slice(0, 8);
  const now = Date.now();
  // 从模板骨架生成初始树
  const parsed = JSON.parse(ver.content);
  const tree = skeletonToTree(parsed);

  db.prepare(`INSERT INTO projects (id, name, industry, template_id, template_version_id, owner_id, status, current_version, tree, created_at, updated_at)
              VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, name, industry, templateId, tpl.currentVersionId, ownerId, 'DRAFT', 1, JSON.stringify(tree), now, now);

  // 默认所有者作为 admin 成员
  db.prepare(`INSERT OR IGNORE INTO project_members (project_id, user_id, permission) VALUES (?,?,?)`).run(id, ownerId, 'admin');

  // 初始版本快照
  db.prepare(`INSERT INTO project_versions (id, project_id, version_no, snapshot, change_note, created_by, created_at)
              VALUES (?,?,?,?,?,?,?)`)
    .run('pv-' + randomUUID().slice(0, 8), id, 1, JSON.stringify({ tree, configs: {} }), '初始化项目', ownerId, now);

  return getProject(id);
}

export function getProjectTree(projectId: string): TreeNode[] | null {
  const r = db.prepare(`SELECT tree FROM projects WHERE id=?`).get(projectId) as any;
  if (!r) return null;
  return JSON.parse(r.tree) as TreeNode[];
}

export function updateProjectTree(projectId: string, tree: TreeNode[], userId: string, changeNote: string): { version: number; conflict: boolean } {
  return db.transaction(() => {
    const p = db.prepare(`SELECT current_version as v FROM projects WHERE id=?`).get(projectId) as any;
    if (!p) throw new Error('project not found');
    const newVersion = p.v + 1;
    const now = Date.now();
    db.prepare(`UPDATE projects SET tree=?, current_version=?, updated_at=? WHERE id=?`).run(JSON.stringify(tree), newVersion, now, projectId);
    db.prepare(`INSERT INTO project_versions (id, project_id, version_no, snapshot, change_note, created_by, created_at) VALUES (?,?,?,?,?,?,?)`)
      .run('pv-' + randomUUID().slice(0, 8), projectId, newVersion, JSON.stringify({ tree }), changeNote, userId, now);
    return { version: newVersion, conflict: false };
  })();
}

export function listProjectVersions(projectId: string): ProjectVersion[] {
  const rows = db.prepare(`SELECT id, project_id as projectId, version_no as versionNo, snapshot, change_note as changeNote,
    created_by as createdBy, created_at as createdAt FROM project_versions WHERE project_id=? ORDER BY version_no DESC`)
    .all(projectId) as any[];
  return rows as ProjectVersion[];
}

// === 节点编辑锁 ===
const LOCK_TTL_MS = 30 * 1000;

export function acquireLock(projectId: string, nodeId: string, userId: string): boolean {
  const now = Date.now();
  // 清理过期锁
  db.prepare(`DELETE FROM node_locks WHERE expires_at < ?`).run(now);
  const existing = db.prepare(`SELECT user_id as userId FROM node_locks WHERE project_id=? AND node_id=?`).get(projectId, nodeId) as any;
  if (existing && existing.userId !== userId) return false;
  db.prepare(`INSERT OR REPLACE INTO node_locks (project_id, node_id, user_id, acquired_at, expires_at) VALUES (?,?,?,?,?)`)
    .run(projectId, nodeId, userId, now, now + LOCK_TTL_MS);
  return true;
}

export function releaseLock(projectId: string, nodeId: string, userId: string): boolean {
  const now = Date.now();
  db.prepare(`DELETE FROM node_locks WHERE expires_at < ?`).run(now);
  const r = db.prepare(`DELETE FROM node_locks WHERE project_id=? AND node_id=? AND user_id=?`).run(projectId, nodeId, userId);
  return r.changes > 0;
}

export function heartbeatLock(projectId: string, nodeId: string, userId: string): boolean {
  const now = Date.now();
  const r = db.prepare(`UPDATE node_locks SET expires_at=? WHERE project_id=? AND node_id=? AND user_id=?`)
    .run(now + LOCK_TTL_MS, projectId, nodeId, userId);
  return r.changes > 0;
}

export function listLocks(projectId: string): { nodeId: string; userId: string; expiresAt: number }[] {
  const now = Date.now();
  db.prepare(`DELETE FROM node_locks WHERE expires_at < ?`).run(now);
  const rows = db.prepare(`SELECT node_id as nodeId, user_id as userId, expires_at as expiresAt FROM node_locks WHERE project_id=?`)
    .all(projectId) as any[];
  return rows;
}

// === 模板骨架 → 运行时树 ===
function skeletonToTree(parsed: any): TreeNode[] {
  if (!parsed || !parsed.root) return [];
  let idCounter = 0;
  const genId = () => 'n-' + (++idCounter) + '-' + randomUUID().slice(0, 6);

  function buildNode(skel: any, parentId: string | null, type: any): TreeNode {
    const node: TreeNode = {
      id: genId(),
      parentId,
      type,
      name: skel.name || type.toLowerCase(),
      comment: skel.comment,
      locked: !!skel.locked,
      children: [],
      config: skel,
    };
    if (skel.children && Array.isArray(skel.children)) {
      skel.children.forEach((c: any) => {
        const childType = c.type || 'VAR';
        node.children.push(buildNode(c, node.id, childType));
      });
    }
    return node;
  }

  const root = buildNode(parsed.root, null, parsed.root.type || 'PRG');
  return [root];
}
