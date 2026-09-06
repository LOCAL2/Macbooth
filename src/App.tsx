import React, { useState, useEffect } from 'react';
import { Home } from './pages/Home.js';
import { Game } from './pages/Game.js';
import { Results } from './pages/Results.js';
import { Leaderboard } from './pages/Leaderboard.js';
import { BigScreen } from './pages/BigScreen.js';
import { Admin } from './pages/Admin.js';
import { CyberEffects } from './components/effects/CyberEffects.js';
import { Difficulty, GameState } from './types/game.js';
import { socketService } from './services/socketService.js';

export function App() {
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('bigscreen')) return 'bigscreen';
    if (path.includes('leaderboard')) return 'leaderboard';
    if (path.includes('admin')) return 'admin';
    return 'home';
  });

  const [playerNickname, setPlayerNickname] = useState(() => {
    return localStorage.getItem('macdefender_nickname') || 'CYBERFOX';
  });
  const [playerDifficulty, setPlayerDifficulty] = useState<Difficulty>('normal');
  const [finalGameState, setFinalGameState] = useState<GameState | null>(null);
  const [currentThreatLevel, setCurrentThreatLevel] = useState(25);
  const [isErrorShaking, setIsErrorShaking] = useState(false);

  // Initialize socket connection on startup
  useEffect(() => {
    socketService.connect();

    // Listen to URL popstate for browser back/forward buttons
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('bigscreen')) setCurrentPage('bigscreen');
      else if (path.includes('leaderboard')) setCurrentPage('leaderboard');
      else if (path.includes('admin')) setCurrentPage('admin');
      else setCurrentPage('home');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.history.pushState({}, '', `/${page === 'home' ? '' : page}`);
  };

  const handleStartGame = (nick: string, diff: Difficulty) => {
    setPlayerNickname(nick);
    setPlayerDifficulty(diff);
    setCurrentThreatLevel(25);
    setCurrentPage('game');
  };

  const handleGameFinish = (state: GameState) => {
    setFinalGameState(state);
    setCurrentThreatLevel(state.threatLevel);
    setCurrentPage('results');
  };

  const triggerErrorShake = () => {
    setIsErrorShaking(true);
    setTimeout(() => {
      setIsErrorShaking(false);
    }, 650);
  };

  return (
    <CyberEffects threatLevel={currentThreatLevel} isErrorShaking={isErrorShaking}>
      {currentPage === 'home' && (
        <Home
          initialNickname={playerNickname}
          onStartGame={handleStartGame}
          onNavigate={navigateTo}
        />
      )}

      {currentPage === 'game' && (
        <Game
          nickname={playerNickname}
          difficulty={playerDifficulty}
          onFinish={handleGameFinish}
          onQuit={() => navigateTo('home')}
          onErrorShake={triggerErrorShake}
        />
      )}

      {currentPage === 'results' && finalGameState && (
        <Results
          gameState={finalGameState}
          onPlayAgain={() => handleStartGame(playerNickname, playerDifficulty)}
          onNewPlayer={() => navigateTo('home')}
          onViewLeaderboard={() => navigateTo('leaderboard')}
        />
      )}

      {currentPage === 'leaderboard' && (
        <Leaderboard
          onBack={() => navigateTo('home')}
          onPlayNow={() => navigateTo('home')}
        />
      )}

      {currentPage === 'bigscreen' && (
        <BigScreen
          onBack={() => navigateTo('home')}
        />
      )}

      {currentPage === 'admin' && (
        <Admin
          onBack={() => navigateTo('home')}
        />
      )}
    </CyberEffects>
  );
}

export default App;
