/**
 * XGenCode 本地开发服务器入口
 */
import app, { httpServer, startWS } from './app.js';

const PORT = Number(process.env.PORT) || 3001;

// 启动 WebSocket 协作服务
startWS();

httpServer.listen(PORT, () => {
  console.log(`╔════════════════════════════════════════════╗`);
  console.log(`║  XGenCode API + WebSocket  ready on :${PORT}   ║`);
  console.log(`║  REST:    http://localhost:${PORT}/api        ║`);
  console.log(`║  WS:      ws://localhost:${PORT}/ws           ║`);
  console.log(`╚════════════════════════════════════════════╝`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM');
  httpServer.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('SIGINT');
  httpServer.close(() => process.exit(0));
});

export default app;
