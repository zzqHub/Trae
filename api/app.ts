/**
 * XGenCode API 服务器
 */
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import templateRoutes from './routes/templates.js';
import generateRoutes from './routes/generate.js';
import userRoutes from './routes/users.js';
import { seedIfEmpty } from './auth.js';
import { setupWebSocket } from './ws-hub.js';
import { createServer } from 'http';

dotenv.config();

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态资源 (生产环境产物)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '..', 'public')));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/projects', generateRoutes); // 嵌套在 projects 下: /api/projects/:id/validate 等
app.use('/api/users', userRoutes);

// 健康检查
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'ok', time: Date.now() });
});

// 错误处理
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Error]', error);
  res.status(500).json({ success: false, error: '服务器内部错误' });
});

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'API not found' });
});

// 初始化数据
seedIfEmpty();

// 自定义导出: 让 server.ts 同时启动 WS
export const httpServer = createServer(app);
export function startWS() {
  setupWebSocket(httpServer);
}

export default app;
