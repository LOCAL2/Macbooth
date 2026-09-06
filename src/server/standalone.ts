import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { setupSocketServer } from './socket.js';
import { createApiRouter } from './api.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5173', 10);
const ADMIN_PIN = process.env.ADMIN_PIN || '1337';
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'DELETE'] },
});

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', createApiRouter(io, ADMIN_PIN, PORT));

// Socket events
setupSocketServer(io, ADMIN_PIN);

// Static frontend
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log('\n======================================================');
  console.log('   🍎 MAC DEFENDER — UNIFIED PRODUCTION SERVER        ');
  console.log('======================================================');
  console.log(`📡 Local:            http://localhost:${PORT}`);
  console.log(`🌐 Booth Network:    http://${localIp}:${PORT}`);
  console.log('------------------------------------------------------');
  console.log(`💻 Player Station:   http://${localIp}:${PORT}`);
  console.log(`📺 Big Screen SOC:   http://${localIp}:${PORT}/bigscreen`);
  console.log(`🏆 Live Standings:   http://${localIp}:${PORT}/leaderboard`);
  console.log(`🎛️ Booth MC Admin:   http://${localIp}:${PORT}/admin (PIN: ${ADMIN_PIN})`);
  console.log('======================================================\n');
});
