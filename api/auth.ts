import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import type { Role, Resource, PermissionAction, PermissionMatrix, User } from '../shared/types.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'xgencode-dev-secret-please-change';
export const JWT_EXPIRES_IN = '7d';

// 默认权限矩阵
const DEFAULT_PERMISSIONS: { role: Role; resource: Resource; action: PermissionAction }[] = [
  // ADMIN: 全部
  ...(['project','template','user','permission','export','bom'] as Resource[]).flatMap(r =>
    (['read','write','delete','approve'] as PermissionAction[]).map(a => ({ role: 'ADMIN' as Role, resource: r, action: a }))
  ),
  // ENGINEER
  ...(['project','template','export','bom'] as Resource[]).flatMap(r =>
    (['read','write'] as PermissionAction[]).map(a => ({ role: 'ENGINEER' as Role, resource: r, action: a }))
  ),
  // GUEST
  ...(['project','export','bom'] as Resource[]).map(r => ({ role: 'GUEST' as Role, resource: r, action: 'read' as PermissionAction })),
  // TEMPLATE_MAINTAINER
  ...(['template'] as Resource[]).flatMap(r =>
    (['read','write','approve'] as PermissionAction[]).map(a => ({ role: 'TEMPLATE_MAINTAINER' as Role, resource: r, action: a }))
  ),
  { role: 'TEMPLATE_MAINTAINER', resource: 'project', action: 'read' },
];

export function seedIfEmpty() {
  const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
  if (userCount === 0) {
    // 默认管理员
    const id = 'u-admin';
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare(`INSERT INTO users (id, username, password_hash, role, status, created_at)
                VALUES (?,?,?,?,?,?)`).run(id, 'admin', hash, 'ADMIN', 'ACTIVE', Date.now());

    // 工程师样例
    const eId = 'u-engineer';
    db.prepare(`INSERT INTO users (id, username, password_hash, role, status, created_at)
                VALUES (?,?,?,?,?,?)`).run(eId, 'engineer', bcrypt.hashSync('engineer123', 10), 'ENGINEER', 'ACTIVE', Date.now());

    const tId = 'u-template';
    db.prepare(`INSERT INTO users (id, username, password_hash, role, status, created_at)
                VALUES (?,?,?,?,?,?)`).run(tId, 'tpl', bcrypt.hashSync('tpl123', 10), 'TEMPLATE_MAINTAINER', 'ACTIVE', Date.now());

    const gId = 'u-guest';
    db.prepare(`INSERT INTO users (id, username, password_hash, role, status, created_at)
                VALUES (?,?,?,?,?,?)`).run(gId, 'guest', bcrypt.hashSync('guest123', 10), 'GUEST', 'ACTIVE', Date.now());

    // 权限矩阵
    const stmt = db.prepare(`INSERT OR IGNORE INTO permissions (role, resource, action) VALUES (?,?,?)`);
    DEFAULT_PERMISSIONS.forEach(p => stmt.run(p.role, p.resource, p.action));
  }

  // 内置业务模板
  const tplCount = (db.prepare('SELECT COUNT(*) as c FROM templates').get() as { c: number }).c;
  if (tplCount === 0) {
    seedBuiltinTemplates();
  }
}

function seedBuiltinTemplates() {
  const industries = [
    { id: 'tpl-lithium', name: '锂电产线通用模板', industry: 'lithium' },
    { id: 'tpl-pv', name: '光伏组件产线模板', industry: 'pv' },
    { id: 'tpl-glass', name: '玻璃检测产线模板', industry: 'glass' },
  ];
  const stmtTpl = db.prepare(`INSERT INTO templates (id, name, industry, current_version_id, created_at) VALUES (?,?,?,?,?)`);
  const stmtVer = db.prepare(`INSERT INTO template_versions (id, template_id, version_no, content, note, created_by, created_at) VALUES (?,?,?,?,?,?,?)`);
  const stmtUpd = db.prepare(`UPDATE templates SET current_version_id=? WHERE id=?`);

  industries.forEach(it => {
    const content = JSON.stringify(buildBuiltinSkeleton(it.industry), null, 2);
    const vid = `${it.id}-v1`;
    stmtTpl.run(it.id, it.name, it.industry, vid, Date.now());
    stmtVer.run(vid, it.id, 1, content, '初始版本', 'u-admin', Date.now());
    stmtUpd.run(vid, it.id);
  });
}

// 内置骨架模板 (锂电/光伏/玻璃)
function buildBuiltinSkeleton(industry: string) {
  return {
    industry,
    version: 1,
    root: {
      type: 'PRG',
      name: 'MAIN',
      comment: `${industry} 主程序入口`,
      locked: true,
      methods: ['Init', 'ManualMode', 'AutoMode', 'AlarmHandle', 'SafetyCheck'],
      children: [
        { type: 'GVL', name: 'GVL', comment: '全局变量区', locked: true, fields: ['g_bSystemReady', 'g_bEmergencyStop', 'g_bAutoMode', 'g_bManualMode'] },
        { type: 'STRUCT', name: 'ST_TripleLight', comment: '三色灯结构体', fields: [
          { name: 'bRed', type: 'BOOL' }, { name: 'bYellow', type: 'BOOL' }, { name: 'bGreen', type: 'BOOL' }
        ]},
        { type: 'STRUCT', name: 'ST_Cylinder', comment: '气缸结构体', fields: [
          { name: 'bExtend', type: 'BOOL' }, { name: 'bRetract', type: 'BOOL' }, { name: 'bPosExtend', type: 'BOOL' }, { name: 'bPosRetract', type: 'BOOL' }
        ]},
        { type: 'STRUCT', name: 'ST_Workstation', comment: '工位数据结构体', fields: [
          { name: 'stLight', type: 'ST_TripleLight' }, { name: 'stCylinder', type: 'ST_Cylinder' }, { name: 'bReady', type: 'BOOL' }, { name: 'bBusy', type: 'BOOL' }
        ]},
        { type: 'FB', name: 'FB_TripleLight', comment: '三色灯控制块', pins: [
          { name: 'bEnable', type: 'BOOL', dir: 'INPUT' }, { name: 'bAlarm', type: 'BOOL', dir: 'INPUT' }, { name: 'stLight', type: 'ST_TripleLight', dir: 'OUTPUT' }
        ]},
        { type: 'FB', name: 'FB_Cylinder', comment: '气缸控制块', pins: [
          { name: 'bCmd', type: 'BOOL', dir: 'INPUT' }, { name: 'stCylinder', type: 'ST_Cylinder', dir: 'OUTPUT' }
        ]},
        { type: 'FB', name: 'FB_SafetyLightCurtain', comment: '安全光栅控制块', pins: [
          { name: 'bTrigger', type: 'BOOL', dir: 'INPUT' }, { name: 'bSafe', type: 'BOOL', dir: 'OUTPUT' }, { name: 'eLevel', type: 'INT', dir: 'OUTPUT' }
        ]},
        { type: 'FC', name: 'FC_ManualMode', comment: '手动模式处理', inputs: [], outputs: [] },
        { type: 'FC', name: 'FC_AlarmHandle', comment: '报警处理', inputs: [], outputs: [] },
        { type: 'FC', name: 'FC_CoordConvert', comment: '坐标换算', inputs: [], outputs: [] },
      ],
    },
  };
}

// === 鉴权 ===
export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function signToken(user: User): string {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): { id: string; username: string; role: Role } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: Role };
  } catch {
    return null;
  }
}

export function getUserById(id: string): User | null {
  const row = db.prepare(`SELECT id, username, role, status, created_at FROM users WHERE id=?`).get(id) as any;
  if (!row) return null;
  return {
    id: row.id, username: row.username, role: row.role, status: row.status, createdAt: row.created_at
  };
}

export function getUserByName(username: string): (User & { passwordHash: string }) | null {
  const row = db.prepare(`SELECT id, username, password_hash as passwordHash, role, status, created_at FROM users WHERE username=?`).get(username) as any;
  if (!row) return null;
  return {
    id: row.id, username: row.username, passwordHash: row.passwordHash, role: row.role, status: row.status, createdAt: row.created_at
  };
}

// 权限查询
export function getPermissionMatrix(): PermissionMatrix {
  const rows = db.prepare(`SELECT role, resource, action FROM permissions`).all() as { role: string; resource: Resource; action: PermissionAction }[];
  const matrix: PermissionMatrix = {};
  for (const r of rows) {
    if (!matrix[r.role]) matrix[r.role] = {};
    if (!matrix[r.role][r.resource]) matrix[r.role][r.resource] = [];
    matrix[r.role][r.resource]!.push(r.action);
  }
  return matrix;
}

export function hasPermission(role: Role, resource: Resource, action: PermissionAction): boolean {
  const row = db.prepare(`SELECT 1 FROM permissions WHERE role=? AND resource=? AND action=?`).get(role, resource, action);
  return !!row;
}

export function setPermission(role: Role, resource: Resource, action: PermissionAction, enabled: boolean) {
  if (enabled) {
    db.prepare(`INSERT OR IGNORE INTO permissions (role, resource, action) VALUES (?,?,?)`).run(role, resource, action);
  } else {
    db.prepare(`DELETE FROM permissions WHERE role=? AND resource=? AND action=?`).run(role, resource, action);
  }
}

export function audit(userId: string, projectId: string | null, action: string, detail: string) {
  db.prepare(`INSERT INTO audit_logs (id, user_id, project_id, action, detail, created_at) VALUES (?,?,?,?,?,?)`)
    .run('log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8), userId, projectId, action, detail, Date.now());
}
