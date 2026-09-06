import { Router, json } from 'express';
import os from 'os';
import { Server as SocketIOServer } from 'socket.io';
import { db } from './db.js';
import { activePlayers } from './socket.js';

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

export function createApiRouter(io: SocketIOServer, adminPin = '1337', port = 5173): Router {
  const router = Router();
  router.use(json());

  router.get('/health', (req, res) => {
    res.json({ status: 'online', app: 'MAC DEFENDER API', timestamp: new Date().toISOString() });
  });

  router.post('/admin/verify-pin', (req, res) => {
    const { pin } = req.body;
    if (String(pin) === String(adminPin)) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, error: 'รหัส PIN ไม่ถูกต้อง' });
    }
  });

  router.get('/network-info', (req, res) => {
    const localIp = getLocalIp();
    const baseUrl = `http://${localIp}:${port}`;
    res.json({
      localIp,
      port,
      playerUrl: baseUrl,
      bigscreenUrl: `${baseUrl}/bigscreen`,
      adminUrl: `${baseUrl}/admin`,
      leaderboardUrl: `${baseUrl}/leaderboard`,
    });
  });

  router.get('/leaderboard', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const list = db.getLeaderboard(limit);
    res.json({ success: true, leaderboard: list });
  });

  router.post('/leaderboard', (req, res) => {
    try {
      const { nickname, score, rank, timeFormatted, timeSeconds, threatsBlocked, difficulty } = req.body;
      if (!nickname || typeof score !== 'number') {
        res.status(400).json({ success: false, error: 'Nickname and score are required' });
        return;
      }

      const entry = db.addLeaderboardEntry({
        nickname: String(nickname).substring(0, 15).toUpperCase(),
        score,
        rank: rank || 'B',
        timeFormatted: timeFormatted || '05:00',
        timeSeconds: timeSeconds || 300,
        threatsBlocked: threatsBlocked || 0,
        difficulty: difficulty || 'normal',
      });

      // Notify all connected clients of leaderboard update
      io.emit('soc:leaderboard_updated', db.getLeaderboard(20));
      io.emit('soc:event_log', {
        type: 'LEADERBOARD_ENTRY',
        text: `🏆 [${entry.nickname}] recorded score ${entry.score.toLocaleString()} (Rank ${entry.rank})!`,
        timestamp: Date.now(),
      });

      res.json({ success: true, entry });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.delete('/leaderboard/:id', (req, res) => {
    const pin = req.headers['x-admin-pin'];
    if (pin !== adminPin) {
      res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin PIN' });
      return;
    }
    const deleted = db.deleteLeaderboardEntry(req.params.id);
    if (deleted) {
      io.emit('soc:leaderboard_updated', db.getLeaderboard(20));
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Entry not found' });
    }
  });

  router.post('/admin/reset-leaderboard', (req, res) => {
    const pin = req.headers['x-admin-pin'];
    if (pin !== adminPin) {
      res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin PIN' });
      return;
    }
    db.resetLeaderboard();
    io.emit('soc:leaderboard_updated', []);
    res.json({ success: true, message: 'Leaderboard reset successfully' });
  });

  router.get('/admin/settings', (req, res) => {
    res.json({ success: true, settings: db.getSettings() });
  });

  router.post('/admin/settings', (req, res) => {
    const pin = req.headers['x-admin-pin'];
    if (pin !== adminPin) {
      res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin PIN' });
      return;
    }
    const updated = db.updateSettings(req.body);
    io.emit('admin:settings_updated', updated);
    res.json({ success: true, settings: updated });
  });

  router.get('/admin/stats', (req, res) => {
    const stats = db.getStats();
    res.json({ success: true, stats, activePlayersCount: activePlayers.size });
  });

  router.get('/stats', (req, res) => {
    const stats = db.getStats();
    res.json({ success: true, stats, activePlayersCount: activePlayers.size });
  });

  router.post('/game/start', (req, res) => {
    const { difficulty } = req.body;
    db.recordGameStart(difficulty || 'normal');
    res.json({ success: true });
  });

  router.post('/game/mission-outcome', (req, res) => {
    const { missionIndex, isCorrect } = req.body;
    if (typeof missionIndex === 'number' && typeof isCorrect === 'boolean') {
      db.recordMissionOutcome(missionIndex, isCorrect);
    }
    res.json({ success: true });
  });

  router.get('/settings', (req, res) => {
    res.json({ success: true, settings: db.getSettings() });
  });

  router.post('/settings', (req, res) => {
    const pin = req.headers['x-admin-pin'];
    if (pin !== adminPin) {
      res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin PIN' });
      return;
    }
    const updated = db.updateSettings(req.body);
    io.emit('admin:settings_updated', updated);
    res.json({ success: true, settings: updated });
  });

  return router;
}
