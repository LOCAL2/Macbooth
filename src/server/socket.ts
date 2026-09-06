import { Server as SocketIOServer, Socket } from 'socket.io';
import { PlayerSession, RemoteMCAction } from './types.js';
import { db } from './db.js';

export const activePlayers = new Map<string, PlayerSession>();

export function setupSocketServer(io: SocketIOServer, adminPin = '1337') {
  io.on('connection', (socket: Socket) => {
    const clientIp = socket.handshake.address;

    // Send current state to newly connected client
    socket.emit('soc:active_players', Array.from(activePlayers.values()));
    socket.emit('soc:leaderboard_updated', db.getLeaderboard(20));

    // Player station registers
    socket.on('player:register', (data: { id: string; nickname: string; difficulty: 'easy' | 'normal' | 'nightmare' }) => {
      const session: PlayerSession = {
        id: data.id,
        socketId: socket.id,
        nickname: data.nickname || 'ANONYMOUS',
        score: 0,
        threatLevel: 0,
        currentMission: 1,
        missionTitle: 'Phishing Awareness',
        status: 'active',
        difficulty: data.difficulty || 'normal',
        timeRemaining: 300,
        threatsBlocked: 0,
        combo: 1,
        lastActive: Date.now(),
        deviceIp: clientIp,
      };
      activePlayers.set(data.id, session);
      io.emit('soc:active_players', Array.from(activePlayers.values()));
      io.emit('soc:event_log', {
        type: 'PLAYER_JOIN',
        text: `💻 [${session.nickname}] joined the defense grid (Mode: ${session.difficulty.toUpperCase()}).`,
        timestamp: Date.now(),
      });
    });

    // Player station updates its live status (during gameplay)
    socket.on('player:update_state', (update: Partial<PlayerSession> & { id: string }) => {
      const existing = activePlayers.get(update.id);
      if (existing) {
        const updatedSession: PlayerSession = {
          ...existing,
          ...update,
          socketId: socket.id,
          lastActive: Date.now(),
        };
        activePlayers.set(update.id, updatedSession);
        io.emit('soc:active_players', Array.from(activePlayers.values()));

        // Broadcast high threat alerts
        if (update.threatLevel && update.threatLevel >= 75 && (existing.threatLevel < 75)) {
          io.emit('soc:event_log', {
            type: 'CRITICAL_THREAT',
            text: `🚨 CRITICAL ALERT: [${updatedSession.nickname}] Threat Level reached ${update.threatLevel}%!`,
            timestamp: Date.now(),
          });
        }
      }
    });

    // Player finishes game (success or fail)
    socket.on('player:finish_game', (data: { id: string; status: 'completed' | 'compromised'; score: number; rank: string }) => {
      const session = activePlayers.get(data.id);
      if (session) {
        session.status = data.status;
        session.score = data.score;
        io.emit('soc:active_players', Array.from(activePlayers.values()));
        io.emit('soc:event_log', {
          type: data.status === 'completed' ? 'MISSION_COMPLETE' : 'SYSTEM_COMPROMISED',
          text: data.status === 'completed'
            ? `🛡️ MISSION CLEARED: [${session.nickname}] saved their Mac! Final Score: ${data.score}`
            : `💀 BREACH: [${session.nickname}] system was overwhelmed by attackers!`,
          timestamp: Date.now(),
        });
      }
    });

    // Admin / MC triggers remote demo action
    socket.on('admin:trigger_action', (action: RemoteMCAction & { pin: string }) => {
      if (action.pin !== adminPin) {
        socket.emit('admin:error', { message: 'Invalid Admin PIN' });
        return;
      }

      // Broadcast action to all players or targeted player
      io.emit('admin:remote_event', action);
      io.emit('soc:event_log', {
        type: 'MC_TRIGGER',
        text: `🎤 [BOOTH MC] Triggered Stage Event: ${action.type}${action.message ? ` - "${action.message}"` : ''}`,
        timestamp: Date.now(),
      });
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      for (const [id, session] of activePlayers.entries()) {
        if (session.socketId === socket.id) {
          activePlayers.delete(id);
          io.emit('soc:active_players', Array.from(activePlayers.values()));
          break;
        }
      }
    });
  });

  // Periodic cleanup of stale sessions (> 10 mins inactive)
  setInterval(() => {
    const now = Date.now();
    let changed = false;
    for (const [id, session] of activePlayers.entries()) {
      if (now - session.lastActive > 10 * 60 * 1000) {
        activePlayers.delete(id);
        changed = true;
      }
    }
    if (changed) {
      io.emit('soc:active_players', Array.from(activePlayers.values()));
    }
  }, 30000);
}
