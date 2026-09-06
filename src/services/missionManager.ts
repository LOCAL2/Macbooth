import { MissionData, MissionChoice, Difficulty } from '../types/game.js';
import {
  ALL_MISSIONS_POOL,
  MISSIONS_DATA,
  NIGHTMARE_MISSIONS_DATA,
} from '../data/missionsData.js';

const RECENT_MISSIONS_STORAGE_KEY = 'macdefender_recent_mission_ids';
const MAX_RECENT_TRACKED = 18;

// Fisher-Yates shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Retrieve recently played mission IDs from sessionStorage
function getRecentlyPlayedIds(): Set<number> {
  try {
    const stored = sessionStorage.getItem(RECENT_MISSIONS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch {
    // Ignore storage parse errors
  }
  return new Set();
}

// Persist played mission IDs to sessionStorage
function recordPlayedMissionIds(newIds: number[]): void {
  try {
    const existing = Array.from(getRecentlyPlayedIds());
    const combined = [...existing, ...newIds];
    // Keep only the most recent N items
    const trimmed = combined.slice(-MAX_RECENT_TRACKED);
    sessionStorage.setItem(RECENT_MISSIONS_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage write errors
  }
}

/**
 * Shuffles choices within a mission and re-indexes them to 'A', 'B', 'C', 'D'
 * If passwordOptions exists, it re-maps them to synchronize with choice IDs.
 */
function randomizeMissionChoices(mission: MissionData): MissionData {
  const cloned = JSON.parse(JSON.stringify(mission)) as MissionData;
  const choiceLetters = ['A', 'B', 'C', 'D'];

  // Keep original choice to passwordOption mapping if passwordOptions exist
  const oldPasswordMap = new Map<string, any>();
  if (cloned.scenarioDetails?.passwordOptions && Array.isArray(cloned.scenarioDetails.passwordOptions)) {
    cloned.scenarioDetails.passwordOptions.forEach((opt: any) => {
      oldPasswordMap.set(opt.id, opt);
    });
  }

  // Shuffle the choices
  const shuffledChoices = shuffleArray(cloned.choices);

  // Re-map choice IDs and labels
  const newChoices: MissionChoice[] = shuffledChoices.map((choice, index) => {
    const newId = choiceLetters[index] || String.fromCharCode(65 + index);
    // Strip previous letter prefix like 'A. ', 'B. ', etc.
    const cleanLabel = choice.label.replace(/^[A-D]\.\s*/i, '').trim();
    return {
      ...choice,
      id: newId,
      label: `${newId}. ${cleanLabel}`,
    };
  });

  // Re-map passwordOptions to match new choice IDs if applicable
  if (cloned.scenarioDetails?.passwordOptions && oldPasswordMap.size > 0) {
    const newPasswordOptions = newChoices.map((choice, index) => {
      // Find original option corresponding to this choice
      const originalChoice = shuffledChoices[index];
      const matchedOpt = oldPasswordMap.get(originalChoice.id) || cloned.scenarioDetails.passwordOptions[index];
      return {
        ...matchedOpt,
        id: choice.id,
      };
    });
    cloned.scenarioDetails.passwordOptions = newPasswordOptions;
  }

  cloned.choices = newChoices;
  return cloned;
}

/**
 * Generates an unpredictable, non-repeating, balanced mission set for a game session.
 * - Filters by difficulty (Normal/Easy vs Nightmare).
 * - Excludes recently played questions from session history to avoid duplicates.
 * - Randomizes the order of the first 5 stages.
 * - Keeps the Final Boss stage as the grand finale (Stage 6).
 * - Shuffles choices (A, B, C, D) inside every question.
 */
export function generateRandomMissionSet(difficulty: Difficulty): MissionData[] {
  const recentIds = getRecentlyPlayedIds();
  const scenarioTypes: Array<MissionData['scenarioType']> = [
    'phishing',
    'password',
    'privacy',
    'download',
    'social_engineering',
  ];

  // 1. Determine base pool
  const pool = ALL_MISSIONS_POOL || (difficulty === 'nightmare' ? NIGHTMARE_MISSIONS_DATA : MISSIONS_DATA);
  const isNightmare = difficulty === 'nightmare';

  const selectedMissions: MissionData[] = [];
  const newlySelectedIds: number[] = [];

  // 2. Select 1 question for each standard scenario type
  for (const st of scenarioTypes) {
    // Candidates for this scenario type matching difficulty preference
    let candidates = pool.filter((m) => {
      if (m.scenarioType !== st) return false;
      if (isNightmare) {
        return m.code.includes('N') || m.code.includes('HARD') || m.id >= 400;
      }
      return !m.code.includes('N') || m.id < 400;
    });

    // Fallback if no specific difficulty candidate found
    if (candidates.length === 0) {
      candidates = pool.filter((m) => m.scenarioType === st);
    }

    // Filter out recently played questions
    let freshCandidates = candidates.filter((m) => !recentIds.has(m.id));
    if (freshCandidates.length === 0) {
      // If all candidates in this category were recently played, reset filter
      freshCandidates = candidates;
    }

    // Pick a random candidate
    const picked = freshCandidates[Math.floor(Math.random() * freshCandidates.length)] || candidates[0];
    selectedMissions.push(picked);
    newlySelectedIds.push(picked.id);
  }

  // 3. Shuffle the order of the 5 preliminary stages so the player cannot predict the sequence
  const shuffledStages = shuffleArray(selectedMissions);

  // 4. Select the Final Boss scenario (always Stage 6)
  let bossCandidates = pool.filter((m) => {
    if (m.scenarioType !== 'final_boss') return false;
    if (isNightmare) {
      return m.code.includes('N') || m.id >= 400;
    }
    return !m.code.includes('N') || m.id < 400;
  });

  if (bossCandidates.length === 0) {
    bossCandidates = pool.filter((m) => m.scenarioType === 'final_boss');
  }

  let freshBossCandidates = bossCandidates.filter((m) => !recentIds.has(m.id));
  if (freshBossCandidates.length === 0) {
    freshBossCandidates = bossCandidates;
  }

  const finalBoss = freshBossCandidates[Math.floor(Math.random() * freshBossCandidates.length)] || bossCandidates[0];
  newlySelectedIds.push(finalBoss.id);

  // Combine into full 6-mission array
  const fullSet = [...shuffledStages, finalBoss];

  // 5. Randomize choices and format titles cleanly (MISSION 01 to MISSION 06)
  const finalMissions: MissionData[] = fullSet.map((m, idx) => {
    const withShuffledChoices = randomizeMissionChoices(m);
    const missionNumberStr = String(idx + 1).padStart(2, '0');
    
    // Clean title prefix (e.g., 'MISSION 01 — ' ...)
    const cleanTitleSuffix = withShuffledChoices.title.replace(/^MISSION\s*\d+(\s*\(NIGHTMARE\))?\s*[—–-]\s*/i, '');
    const titlePrefix = isNightmare ? `MISSION ${missionNumberStr} (NIGHTMARE)` : `MISSION ${missionNumberStr}`;
    
    return {
      ...withShuffledChoices,
      title: `${titlePrefix} — ${cleanTitleSuffix}`,
    };
  });

  // Record selected IDs into session storage
  recordPlayedMissionIds(newlySelectedIds);

  return finalMissions;
}
