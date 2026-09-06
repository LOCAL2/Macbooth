import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string;

  constructor() {
    // Same origin port 5173 (unified backend and frontend)
    this.serverUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  }

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('🟢 [SOC Network] Connected to Mac Defender Central Server:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('🔴 [SOC Network] Disconnected from Central Server');
      });
    }
    return this.socket;
  }

  public getSocket(): Socket | null {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  public registerPlayer(player: { id: string; nickname: string; difficulty: string }) {
    const s = this.getSocket();
    s?.emit('player:register', player);
  }

  public updatePlayerState(state: {
    id: string;
    nickname: string;
    score: number;
    threatLevel: number;
    currentMission: number;
    missionTitle: string;
    status: string;
    difficulty: string;
    timeRemaining: number;
    threatsBlocked: number;
    combo: number;
  }) {
    const s = this.getSocket();
    s?.emit('player:update_state', state);
  }

  public finishGame(result: { id: string; status: 'completed' | 'compromised'; score: number; rank: string }) {
    const s = this.getSocket();
    s?.emit('player:finish_game', result);
  }

  public triggerMCAction(action: { type: string; targetPlayerId?: string; message?: string }, pin: string) {
    const s = this.getSocket();
    s?.emit('admin:trigger_action', { ...action, pin });
  }
}

export const socketService = new SocketService();
