import { Router, type Request, type Response } from 'express';
import { db } from '../db.js';
import {
  signToken, verifyPassword, hashPassword, getUserByName, getUserById,
  getPermissionMatrix, audit
} from '../auth.js';
import { authRequired } from '../middleware.js';
import type { Role, UserStatus } from '../../shared/types.js';

const router = Router();

// 登录
router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    res.status(400).json({ success: false, error: '用户名或密码缺失' });
    return;
  }
  const user = getUserByName(username);
  if (!user || user.status !== 'ACTIVE' || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ success: false, error: '用户名或密码错误' });
    return;
  }
  const u = { id: user.id, username: user.username, role: user.role, status: user.status, createdAt: user.createdAt };
  const token = signToken(u);
  audit(user.id, null, 'login', `${username} 登录`);
  res.json({ success: true, data: { token, user: u, permissions: getPermissionMatrix() } });
});

// 注册 (需邀请码 - 简化为邀请码 = 'xgencode2024')
router.post('/register', (req: Request, res: Response) => {
  const { username, password, inviteCode } = req.body || {};
  if (!username || !password) {
    res.status(400).json({ success: false, error: '用户名或密码缺失' });
    return;
  }
  if (inviteCode !== 'xgencode2024') {
    res.status(403).json({ success: false, error: '邀请码无效' });
    return;
  }
  const existing = getUserByName(username);
  if (existing) {
    res.status(409).json({ success: false, error: '用户名已存在' });
    return;
  }
  const id = 'u-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const now = Date.now();
  db.prepare(`INSERT INTO users (id, username, password_hash, role, status, created_at) VALUES (?,?,?,?,?,?)`)
    .run(id, username, hashPassword(password), 'ENGINEER', 'ACTIVE', now);
  const u = { id, username, role: 'ENGINEER' as Role, status: 'ACTIVE' as UserStatus, createdAt: now };
  const token = signToken(u);
  audit(id, null, 'register', `${username} 注册`);
  res.json({ success: true, data: { token, user: u, permissions: getPermissionMatrix() } });
});

// 当前用户
router.get('/me', authRequired, (req: Request, res: Response) => {
  const u = getUserById(req.user!.id);
  if (!u) {
    res.status(404).json({ success: false, error: '用户不存在' });
    return;
  }
  res.json({ success: true, data: { user: u, permissions: getPermissionMatrix() } });
});

export default router;
