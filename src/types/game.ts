export type Difficulty = 'easy' | 'normal' | 'nightmare';
export type SecurityRank = 'S' | 'A' | 'B' | 'C' | 'D';
export type ThreatStatus = 'SECURE' | 'WARNING' | 'CRITICAL';
export type GameStatus = 'idle' | 'active' | 'completed' | 'compromised';

export interface MissionChoice {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation: string;
  scoreBonus: number;
  threatImpact: number; // e.g., -20 for correct (reduces threat), +25 for wrong (increases threat)
}

export interface MissionData {
  id: number;
  code: string;
  title: string;
  tagline: string;
  description: string;
  scenarioType: 'phishing' | 'password' | 'privacy' | 'download' | 'social_engineering' | 'final_boss';
  scenarioDetails: any;
  question: string;
  choices: MissionChoice[];
  hint: string;
  learningDebrief: string;
}

export interface MissionResult {
  missionId: number;
  title: string;
  passed: boolean;
  scoreDelta: number;
  threatDelta: number;
  userChoiceId: string;
  timeSpentSeconds: number;
}

export interface GameState {
  playerId: string;
  nickname: string;
  difficulty: Difficulty;
  score: number;
  threatLevel: number; // 0 to 100
  currentMissionIndex: number; // 0 to 5 (Missions 1 to 6)
  timeRemaining: number; // seconds
  isGameActive: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  combo: number;
  threatsBlocked: number;
  results: MissionResult[];
  rank?: SecurityRank;
  soundEnabled: boolean;
  hintsUsed: number;
}

export interface PlayerSession {
  id: string;
  socketId?: string;
  nickname: string;
  score: number;
  threatLevel: number;
  currentMission: number;
  missionTitle: string;
  status: GameStatus;
  difficulty: Difficulty;
  timeRemaining: number;
  threatsBlocked: number;
  combo: number;
  rank?: SecurityRank;
  lastActive: number;
  deviceIp?: string;
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

export interface RandomAlert {
  id: string;
  title: string;
  source: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  choices: {
    label: string;
    action: 'dismiss' | 'block' | 'investigate' | 'allow';
    isSafe: boolean;
    threatImpact: number;
  }[];
}

export interface ChaosTrollEvent {
  id: string;
  type: 'kernel_panic' | 'fake_call' | 'fake_delete' | 'ransom_countdown' | 'low_battery' | 'camera_spy' | 'screen_flip';
  title: string;
  message: string;
  durationMs?: number;
  details?: any;
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

export interface SecurityTip {
  id: string;
  category: string;
  icon: string;
  title: string;
  rule: string;
  detail: string;
}
