export type SecurityRank = 'S' | 'A' | 'B' | 'C' | 'D';
export type Difficulty = 'easy' | 'normal' | 'nightmare';
export type GameStatus = 'idle' | 'active' | 'completed' | 'compromised';

export interface PlayerSession {
  id: string;
  socketId?: string;
  nickname: string;
  score: number;
  threatLevel: number; // 0 to 100
  currentMission: number; // 0 to 6
  missionTitle: string;
  status: GameStatus;
  difficulty: Difficulty;
  timeRemaining: number; // seconds
  threatsBlocked: number;
  combo: number;
  rank?: SecurityRank;
  lastActive: number;
  deviceIp?: string;
}

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  score: number;
  rank: SecurityRank;
  timeFormatted: string;
  timeSeconds: number;
  threatsBlocked: number;
  difficulty: Difficulty;
  completedAt: string;
}

export interface BoothStats {
  playersToday: number;
  completed: number;
  averageScore: number;
  averageTime: string;
  topPlayer: string;
  topScore: number;
  difficultyDistribution: {
    easy: number;
    normal: number;
    nightmare: number;
  };
}

export interface AdminSettings {
  timeEasy: number;
  timeNormal: number;
  timeNightmare: number;
  soundDefault: boolean;
  demoMode: boolean;
  scoreMultiplier: number;
}

export interface RemoteMCAction {
  type: 'TRIGGER_ATTACK' | 'TRIGGER_PHISHING' | 'TRIGGER_CRITICAL' | 'TRIGGER_GLITCH' | 'FORCE_GAME_OVER' | 'FORCE_COMPLETE' | 'BROADCAST_ALERT';
  targetPlayerId?: string; // 'all' or specific player id
  message?: string;
}
