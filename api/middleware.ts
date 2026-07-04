import type { Request, Response, NextFunction } from 'express';
import { verifyToken, hasPermission } from './auth.js';
import type { Role, Resource, PermissionAction } from '../shared/types.js';

// 扩展 Request 类型，附加 user 信息
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; username: string; role: Role };
    }
  }
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: '未登录' });
    return;
  }
  const token = header.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: 'Token 无效或已过期' });
    return;
  }
  req.user = payload;
  next();
}

export function requirePermission(resource: Resource, action: PermissionAction) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: '未登录' });
      return;
    }
    if (!hasPermission(req.user.role, resource, action)) {
      res.status(403).json({ success: false, error: `无权限: ${resource}.${action}` });
      return;
    }
    next();
  };
}

export function compose(...middlewares: ((req: Request, res: Response, next: NextFunction) => void)[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    let i = 0;
    const run = () => {
      if (i >= middlewares.length) return next();
      middlewares[i++](req, res, run);
    };
    run();
  };
}
