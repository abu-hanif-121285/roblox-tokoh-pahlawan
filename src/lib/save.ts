import type { HeroId, PathId } from '../data/content';

export interface Progress {
  pathId: PathId | null;
  chapter: number;
  score: number;
  answered: number;
  correct: number;
  foundItems: string[];
  heroesMet: HeroId[];
  missionsDone: number;
  choices: Record<string, string>;
  completed: boolean;
  endingId: string | null;
  updatedAt: number;
}

export interface Settings {
  muted: boolean;
  musicVolume: number;
  sfxVolume: number;
}

const SAVE_KEY = 'jejak-pahlawan-progress-v1';
const SETTINGS_KEY = 'jejak-pahlawan-settings-v1';

export const emptyProgress = (): Progress => ({
  pathId: null,
  chapter: 1,
  score: 0,
  answered: 0,
  correct: 0,
  foundItems: [],
  heroesMet: [],
  missionsDone: 0,
  choices: {},
  completed: false,
  endingId: null,
  updatedAt: 0,
});

export const defaultSettings: Settings = { muted: false, musicVolume: 0.55, sfxVolume: 0.7 };

const VALID_PATHS: PathId[] = ['pejuang', 'pemikir', 'pemersatu'];
const VALID_HEROES: HeroId[] = ['diponegoro', 'cutnyak', 'pattimura', 'sudirman', 'kihajar', 'kartini', 'tjokro', 'soekarno', 'hatta'];

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    const pathId = parsed.pathId && VALID_PATHS.includes(parsed.pathId) ? parsed.pathId : null;
    const chapter = Math.min(5, Math.max(1, Number(parsed.chapter) || 1));
    const heroesMet = Array.isArray(parsed.heroesMet) ? parsed.heroesMet.filter((id): id is HeroId => VALID_HEROES.includes(id)) : [];
    const foundItems = Array.isArray(parsed.foundItems) ? parsed.foundItems.filter((id): id is string => typeof id === 'string') : [];
    return {
      ...emptyProgress(),
      ...parsed,
      pathId,
      chapter,
      heroesMet,
      foundItems,
      choices: parsed.choices && typeof parsed.choices === 'object' ? parsed.choices : {},
      score: Math.max(0, Number(parsed.score) || 0),
      answered: Math.max(0, Number(parsed.answered) || 0),
      correct: Math.max(0, Number(parsed.correct) || 0),
      missionsDone: Math.min(5, Math.max(0, Number(parsed.missionsDone) || 0)),
      updatedAt: Number(parsed.updatedAt) || 0,
    };
  } catch {
    return emptyProgress();
  }
}

export function persistProgress(progress: Progress) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...progress, updatedAt: Date.now() }));
  } catch {
    /* storage may be unavailable */
  }
}

export function clearProgress() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      muted: Boolean(parsed.muted),
      musicVolume: Math.min(1, Math.max(0, Number(parsed.musicVolume ?? defaultSettings.musicVolume))),
      sfxVolume: Math.min(1, Math.max(0, Number(parsed.sfxVolume ?? defaultSettings.sfxVolume))),
    };
  } catch {
    return defaultSettings;
  }
}

export function persistSettings(settings: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export function hasPlayableSave(progress: Progress) {
  return Boolean(progress.pathId) && progress.updatedAt > 0;
}
