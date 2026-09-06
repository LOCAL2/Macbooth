import { Plugin, ViteDevServer } from 'vite';
import { Server as SocketIOServer } from 'socket.io';
import express from 'express';
import { setupSocketServer } from './socket.js';
import { createApiRouter } from './api.js';

export function boothServerPlugin(adminPin = '1337', port = 5173): Plugin {
  return {
    name: 'macdefender-booth-server',
    configureServer(server: ViteDevServer) {
      if (!server.httpServer) return;

      // 1. Attach Socket.io to Vite's HTTP server on Port 5173
      const io = new SocketIOServer(server.httpServer, {
        cors: { origin: '*' },
      });
      setupSocketServer(io, adminPin);

      // 2. Mount Express API router on /api via Vite's connect middleware
      const app = express();
      app.use('/api', createApiRouter(io, adminPin, port));
      server.middlewares.use(app);

      console.log(`\n⚡ [MAC DEFENDER] Backend API & Socket.io loaded directly onto Port ${port}!\n`);
    },
  };
}
