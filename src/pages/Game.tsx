import React, { useState, useEffect, useRef } from 'react';
import { GameHUD } from '../components/hud/GameHUD.js';
import { PhishingMission } from '../components/missions/PhishingMission.js';
import { PasswordMission } from '../components/missions/PasswordMission.js';
import { PrivacyMission } from '../components/missions/PrivacyMission.js';
import { DownloadMission } from '../components/missions/DownloadMission.js';
import { SocialEngMission } from '../components/missions/SocialEngMission.js';
import { FinalBossMission } from '../components/missions/FinalBossMission.js';
import { RandomAlertModal } from '../components/modals/RandomAlertModal.js';
import { CyberChaosOverlay } from '../components/effects/CyberChaosOverlay.js';
import { RANDOM_ALERTS, CHAOS_TROLL_EVENTS } from '../data/missionsData.js';
import { generateRandomMissionSet } from '../services/missionManager.js';
import { Difficulty, GameState, MissionChoice, MissionResult, MissionData, RandomAlert, ChaosTrollEvent } from '../types/game.js';
import { soundEngine } from '../services/soundEngine.js';
import { socketService } from '../services/socketService.js';

interface GameProps {
  nickname: string;
  difficulty: Difficulty;
  onFinish: (finalState: GameState) => void;
  onQuit: () => void;
  onErrorShake: () => void;
}

export const Game: React.FC<GameProps> = ({ nickname, difficulty, onFinish, onQuit, onErrorShake }) => {
  const [playerId] = useState(() => 'player-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6));

  // Determine initial timer based on difficulty (Nightmare: 180s = 3 minutes)
  const getInitialTime = () => {
    if (difficulty === 'easy') return 420;
    if (difficulty === 'nightmare') return 180;
    return 300;
  };

  const [gameState, setGameState] = useState<GameState>({
    playerId,
    nickname,
    difficulty,
    score: 1000,
    threatLevel: difficulty === 'nightmare' ? 35 : 25, // Nightmare starts at 35% Threat!
    currentMissionIndex: 0,
    timeRemaining: getInitialTime(),
    isGameActive: true,
    isGameOver: false,
    isVictory: false,
    combo: 1,
    threatsBlocked: 0,
    results: [],
    soundEnabled: soundEngine.isEnabled(),
    hintsUsed: 0,
  });

  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<MissionChoice | null>(null);
  const [currentRandomAlert, setCurrentRandomAlert] = useState<RandomAlert | null>(null);
  const [currentChaosEvent, setCurrentChaosEvent] = useState<ChaosTrollEvent | null>(null);
  const [showHintModal, setShowHintModal] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  const missionStartTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastChaosTimeRef = useRef(Date.now());

  // Generate dynamic, non-repeating mission dataset with randomized choices and non-repeating questions
  const [activeMissions] = useState<MissionData[]>(() => generateRandomMissionSet(difficulty));
  const currentMission = activeMissions[gameState.currentMissionIndex] || activeMissions[0];

  // Register with backend Socket.IO for BigScreen SOC sync
  useEffect(() => {
    socketService.registerPlayer({
      id: playerId,
      nickname,
      difficulty,
    });

    const s = socketService.getSocket();

    // Listen for MC remote demo triggers
    const handleRemoteEvent = (action: any) => {
      console.log('🎤 Received MC Remote Event:', action);
      if (action.type === 'TRIGGER_ATTACK') {
        soundEngine.playError();
        onErrorShake();
        setGameState(prev => ({
          ...prev,
          threatLevel: Math.min(100, prev.threatLevel + 25),
        }));
      } else if (action.type === 'TRIGGER_GLITCH') {
        soundEngine.playTerminalBeep();
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 2000);
      } else if (action.type === 'TRIGGER_CRITICAL') {
        soundEngine.startThreatAlarm();
        onErrorShake();
        setGameState(prev => ({
          ...prev,
          threatLevel: 90,
        }));
      } else if (action.type === 'FORCE_GAME_OVER') {
        handleSystemBreach();
      } else if (action.type === 'FORCE_COMPLETE') {
        handleFinalComplete();
      }
    };

    s?.on('admin:remote_event', handleRemoteEvent);
    return () => {
      s?.off('admin:remote_event', handleRemoteEvent);
    };
  }, [playerId, nickname, difficulty]);

  // Main Game Countdown Timer & Chaos/Prank Disruption Engine
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setGameState((prev) => {
        if (!prev.isGameActive || prev.isGameOver) return prev;

        const newTime = prev.timeRemaining - 1;

        if (newTime <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeOut();
          return { ...prev, timeRemaining: 0 };
        }

        const now = Date.now();
        const timeSinceLastChaos = now - lastChaosTimeRef.current;

        // 1. Trigger Hacker Chaos & Trolling Pranks (Much more aggressive in Nightmare)
        if (!currentChaosEvent && !currentRandomAlert && !isAnswered && prev.currentMissionIndex < 5) {
          if (difficulty === 'nightmare' && timeSinceLastChaos > 15000 && Math.random() < 0.2) {
            lastChaosTimeRef.current = now;
            const randomTroll = CHAOS_TROLL_EVENTS[Math.floor(Math.random() * CHAOS_TROLL_EVENTS.length)];
            setCurrentChaosEvent(randomTroll);
            if (randomTroll.type === 'screen_flip') {
              setGlitchActive(true);
              setTimeout(() => setGlitchActive(false), 1800);
            }
          } else if (difficulty === 'normal' && timeSinceLastChaos > 35000 && Math.random() < 0.08) {
            lastChaosTimeRef.current = now;
            const randomTroll = CHAOS_TROLL_EVENTS[Math.floor(Math.random() * CHAOS_TROLL_EVENTS.length)];
            setCurrentChaosEvent(randomTroll);
          }
        }

        // 2. Random Mid-game Security System Alerts
        const alertChance = difficulty === 'nightmare' ? 0.08 : 0.03;
        if (Math.random() < alertChance && !currentRandomAlert && !currentChaosEvent && !isAnswered && prev.currentMissionIndex < 5) {
          const randomPick = RANDOM_ALERTS[Math.floor(Math.random() * RANDOM_ALERTS.length)];
          setCurrentRandomAlert(randomPick);
        }

        return { ...prev, timeRemaining: newTime };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [difficulty, currentRandomAlert, currentChaosEvent, isAnswered]);

  // Sync state to backend for live SOC updates
  useEffect(() => {
    socketService.updatePlayerState({
      id: gameState.playerId,
      nickname: gameState.nickname,
      score: gameState.score,
      threatLevel: gameState.threatLevel,
      currentMission: gameState.currentMissionIndex + 1,
      missionTitle: currentMission.title,
      status: gameState.isGameOver ? (gameState.isVictory ? 'completed' : 'compromised') : 'active',
      difficulty: gameState.difficulty,
      timeRemaining: gameState.timeRemaining,
      threatsBlocked: gameState.threatsBlocked,
      combo: gameState.combo,
    });
  }, [gameState, currentMission]);

  // Handle Answer Selection
  const handleAnswerChoice = (choice: MissionChoice) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedChoice(choice);

    const timeSpent = Math.round((Date.now() - missionStartTimeRef.current) / 1000);
    const isCorrect = choice.isCorrect;

    // Play synthesized sound & trigger screen shake if wrong
    if (isCorrect) {
      soundEngine.playSuccess();
    } else {
      soundEngine.playError();
      onErrorShake(); // Trigger intense screen shake & red damage flash!
    }

    // Record mission metric to backend
    fetch('/api/game/mission-outcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        missionIndex: currentMission.id,
        isCorrect,
      }),
    }).catch(() => {});

    setGameState((prev) => {
      const newThreat = Math.max(5, Math.min(100, prev.threatLevel + choice.threatImpact));
      const scoreModifier = prev.combo >= 2 ? choice.scoreBonus * 1.5 : choice.scoreBonus;
      const newScore = Math.max(0, prev.score + Math.round(scoreModifier));
      const newCombo = isCorrect ? prev.combo + 1 : 1;
      const newThreatsBlocked = isCorrect ? prev.threatsBlocked + 1 : prev.threatsBlocked;

      const newResult: MissionResult = {
        missionId: currentMission.id,
        title: currentMission.title,
        passed: isCorrect,
        scoreDelta: choice.scoreBonus,
        threatDelta: choice.threatImpact,
        userChoiceId: choice.id,
        timeSpentSeconds: timeSpent,
      };

      // If threat reached 100%, trigger breach
      if (newThreat >= 100) {
        setTimeout(() => handleSystemBreach(), 800);
      }

      return {
        ...prev,
        score: newScore,
        threatLevel: newThreat,
        combo: newCombo,
        threatsBlocked: newThreatsBlocked,
        results: [...prev.results, newResult],
      };
    });
  };

  // Next Mission Handler
  const handleNextMission = () => {
    setIsAnswered(false);
    setSelectedChoice(null);
    setCurrentChaosEvent(null);
    missionStartTimeRef.current = Date.now();

    if (gameState.currentMissionIndex < activeMissions.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentMissionIndex: prev.currentMissionIndex + 1,
      }));
    } else {
      handleFinalComplete();
    }
  };

  // Game Over (Threat Level 100%)
  const handleSystemBreach = () => {
    soundEngine.playBreach();
    soundEngine.stopThreatAlarm();
    onErrorShake();
    socketService.finishGame({
      id: playerId,
      status: 'compromised',
      score: gameState.score,
      rank: 'D',
    });
    onFinish({
      ...gameState,
      isGameActive: false,
      isGameOver: true,
      isVictory: false,
      rank: 'D',
    });
  };

  // Game Over (Time Out)
  const handleTimeOut = () => {
    soundEngine.playBreach();
    soundEngine.stopThreatAlarm();
    onErrorShake();
    socketService.finishGame({
      id: playerId,
      status: 'compromised',
      score: gameState.score,
      rank: 'C',
    });
    onFinish({
      ...gameState,
      isGameActive: false,
      isGameOver: true,
      isVictory: false,
      rank: 'C',
    });
  };

  // Final Complete (All Missions + Final Boss Cleared)
  const handleFinalComplete = () => {
    soundEngine.stopThreatAlarm();
    let calculatedRank: 'S' | 'A' | 'B' | 'C' | 'D' = 'B';
    const finalScore = gameState.score;

    if (finalScore >= 12000 && gameState.threatLevel <= 25) {
      calculatedRank = 'S';
    } else if (finalScore >= 9000) {
      calculatedRank = 'A';
    } else if (finalScore >= 6000) {
      calculatedRank = 'B';
    } else if (finalScore >= 3000) {
      calculatedRank = 'C';
    } else {
      calculatedRank = 'D';
    }

    socketService.finishGame({
      id: playerId,
      status: 'completed',
      score: finalScore,
      rank: calculatedRank,
    });

    onFinish({
      ...gameState,
      isGameActive: false,
      isGameOver: true,
      isVictory: true,
      rank: calculatedRank,
    });
  };

  const handleRandomAlertChoice = (isSafe: boolean, impact: number) => {
    setCurrentRandomAlert(null);
    if (!isSafe) {
      onErrorShake();
      soundEngine.playError();
    } else {
      soundEngine.playSuccess();
    }
    setGameState(prev => ({
      ...prev,
      threatLevel: Math.max(5, Math.min(100, prev.threatLevel + impact)),
      score: isSafe ? prev.score + 500 : Math.max(0, prev.score - 500),
    }));
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between pb-8 transition-all duration-300 ${glitchActive ? 'filter invert hue-rotate-180' : ''}`}>
      {/* HUD Bar */}
      <GameHUD
        missionNumber={gameState.currentMissionIndex + 1}
        totalMissions={activeMissions.length}
        missionTitle={currentMission.title}
        timeRemaining={gameState.timeRemaining}
        score={gameState.score}
        threatLevel={gameState.threatLevel}
        combo={gameState.combo}
        soundEnabled={gameState.soundEnabled}
        onToggleSound={() => {
          const next = soundEngine.toggle();
          setGameState(prev => ({ ...prev, soundEnabled: next }));
        }}
        onUseHint={() => setShowHintModal(true)}
        hintAvailable={difficulty === 'easy' || difficulty === 'normal'}
        difficulty={difficulty}
      />

      {/* Main Interactive Mission Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 flex flex-col justify-center">
        {currentMission.scenarioType === 'phishing' && (
          <PhishingMission
            key={currentMission.id}
            mission={currentMission}
            onAnswer={handleAnswerChoice}
            isAnswered={isAnswered}
            selectedChoice={selectedChoice}
            onNextMission={handleNextMission}
          />
        )}

        {currentMission.scenarioType === 'password' && (
          <PasswordMission
            key={currentMission.id}
            mission={currentMission}
            onAnswer={handleAnswerChoice}
            isAnswered={isAnswered}
            selectedChoice={selectedChoice}
            onNextMission={handleNextMission}
          />
        )}

        {currentMission.scenarioType === 'privacy' && (
          <PrivacyMission
            key={currentMission.id}
            mission={currentMission}
            onAnswer={handleAnswerChoice}
            isAnswered={isAnswered}
            selectedChoice={selectedChoice}
            onNextMission={handleNextMission}
          />
        )}

        {currentMission.scenarioType === 'download' && (
          <DownloadMission
            key={currentMission.id}
            mission={currentMission}
            onAnswer={handleAnswerChoice}
            isAnswered={isAnswered}
            selectedChoice={selectedChoice}
            onNextMission={handleNextMission}
          />
        )}

        {currentMission.scenarioType === 'social_engineering' && (
          <SocialEngMission
            key={currentMission.id}
            mission={currentMission}
            onAnswer={handleAnswerChoice}
            isAnswered={isAnswered}
            selectedChoice={selectedChoice}
            onNextMission={handleNextMission}
          />
        )}

        {currentMission.scenarioType === 'final_boss' && (
          <FinalBossMission
            key={currentMission.id}
            mission={currentMission}
            onAnswer={handleAnswerChoice}
            isAnswered={isAnswered}
            selectedChoice={selectedChoice}
            onNextMission={handleNextMission}
            onTimeOut={handleTimeOut}
          />
        )}
      </main>

      {/* Random Mid-Mission Interrupt Alert */}
      <RandomAlertModal
        alert={currentRandomAlert}
        onChoose={handleRandomAlertChoice}
      />

      {/* Simulated Hacker Chaos & Prank Overlay */}
      <CyberChaosOverlay
        event={currentChaosEvent}
        onDismiss={() => setCurrentChaosEvent(null)}
      />

      {/* Hint Modal */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="glass-panel-elevated bg-[#0f1422]/95 border border-apple-teal/30 rounded-3xl p-6 max-w-md w-full text-white font-sans space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-apple-teal flex items-center gap-2">
                💡 คำใบ้จากฝ่ายความปลอดภัย
              </h3>
              <button
                onClick={() => setShowHintModal(false)}
                className="text-apple-gray-400 hover:text-white text-xs cursor-pointer px-2 py-1 bg-white/5 rounded-lg"
              >
                ปิด
              </button>
            </div>
            <p className="text-sm text-apple-gray-200 leading-relaxed font-sans">
              {currentMission.hint}
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowHintModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-apple-teal/20 hover:bg-apple-teal/30 text-apple-teal font-bold text-xs cursor-pointer border border-apple-teal/40 transition"
              >
                เข้าใจแล้ว กลับสู่ภารกิจ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
