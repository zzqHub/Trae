import { Router, type Request, type Response } from 'express';
import { db } from '../db.js';
import { authRequired, requirePermission } from '../middleware.js';
import {
  getPermissionMatrix, setPermission, hashPassword, audit
} from '../auth.js';
import type { Role, Resource, PermissionAction, UserStatus } from '../../shared/types.js';

const router = Router();

// 用户列表
router.get('/', authRequired, requirePermission('user', 'read'), (_req: Request, res: Response) => {
  const rows = db.prepare(`SELECT id, username, role, status, created_at as createdAt FROM users ORDER BY created_at`).all() as any[];
  res.json({ success: true, data: rows });
});

// 新建用户 (管理员)
router.post('/', authRequired, requirePermission('user', 'write'), (req: Request, res: Response) => {
  const { username, password, role } = req.body || {};
  if (!username || !password || !role) {
    res.status(400).json({ success: false, error: '参数缺失' });
    return;
  }
  if (!['ADMIN', 'ENGINEER', 'GUEST', 'TEMPLATE_MAINTAINER'].includes(role)) {
    res.status(400).json({ success: false, error: '角色非法' });
    return;
  }
  const existing = db.prepare(`SELECT 1 FROM users WHERE username=?`).get(username);
  if (existing) { res.status(409).json({ success: false, error: '用户名已存在' }); return; }
  const id = 'u-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const now = Date.now();
  db.prepare(`INSERT INTO users (id, username, password_hash, role, status, created_at) VALUES (?,?,?,?,?,?)`)
    .run(id, username, hashPassword(password), role, 'ACTIVE', now);
  audit(req.user!.id, null, 'user.create', `创建用户 ${username} (${role})`);
  res.json({ success: true, data: { id, username, role, status: 'ACTIVE', createdAt: now } });
});

// 更新用户 (角色/状态/密码)
router.patch('/:id', authRequired, requirePermission('user', 'write'), (req: Request, res: Response) => {
  const { role, status, password } = req.body || {};
  const existing = db.prepare(`SELECT id, username, role, status, created_at FROM users WHERE id=?`).get(req.params.id) as any;
  if (!existing) { res.status(404).json({ success: false, error: '用户不存在' }); return; }
  if (role) db.prepare(`UPDATE users SET role=? WHERE id=?`).run(role, req.params.id);
  if (status) db.prepare(`UPDATE users SET status=? WHERE id=?`).run(status, req.params.id);
  if (password) db.prepare(`UPDATE users SET password_hash=? WHERE id=?`).run(hashPassword(password), req.params.id);
  audit(req.user!.id, null, 'user.update', `更新用户 ${existing.username}`);
  res.json({ success: true, data: { ...existing, role: role || existing.role, status: status || existing.status } });
});

// 删除用户
router.delete('/:id', authRequired, requirePermission('user', 'delete'), (req: Request, res: Response) => {
  const r = db.prepare(`DELETE FROM users WHERE id=?`).run(req.params.id);
  if (r.changes === 0) { res.status(404).json({ success: false, error: '用户不存在' }); return; }
  audit(req.user!.id, null, 'user.delete', `删除用户 ${req.params.id}`);
  res.json({ success: true });
});

// 权限矩阵
router.get('/permissions/matrix', authRequired, requirePermission('permission', 'read'), (_req: Request, res: Response) => {
  res.json({ success: true, data: getPermissionMatrix() });
});

router.put('/permissions/matrix', authRequired, requirePermission('permission', 'write'), (req: Request, res: Response) => {
  const { matrix } = req.body || {};
  if (!matrix) { res.status(400).json({ success: false, error: '参数缺失' }); return; }
  // 全清空后重写
  db.prepare(`DELETE FROM permissions`).run();
  for (const role of Object.keys(matrix)) {
    for (const resource of Object.keys(matrix[role])) {
      const actions = matrix[role][resource] || [];
      for (const a of actions) {
        db.prepare(`INSERT OR IGNORE INTO permissions (role, resource, action) VALUES (?,?,?)`)
          .run(role as Role, resource as Resource, a as PermissionAction);
      }
    }
  }
  audit(req.user!.id, null, 'permission.update', `更新权限矩阵`);
  res.json({ success: true });
});

export default router;
