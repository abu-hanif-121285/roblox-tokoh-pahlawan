import { useCallback, useEffect, useState } from 'react';
import { PATHS, type PathId } from './data/content';
import { audio } from './lib/audio';
import {
  clearProgress, emptyProgress, hasPlayableSave, loadProgress, loadSettings,
  persistProgress, persistSettings, type Progress, type Settings,
} from './lib/save';
import { MenuScreen, IntroScreen, PathSelectScreen } from './screens/StartScreens';
import { EndingScreen, GalleryScreen, GuideModal, SettingsModal } from './screens/MetaScreens';
import { GameScreen, type GameEvents } from './components/GameScreen';

type Screen = 'menu' | 'intro' | 'paths' | 'game' | 'ending' | 'gallery';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [galleryReturn, setGalleryReturn] = useState<Screen>('menu');
  const [guideOpen, setGuideOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    persistProgress(progress);
  }, [progress]);

  useEffect(() => {
    persistSettings(settings);
    audio.configure({ muted: settings.muted, musicVolume: settings.musicVolume, sfxVolume: settings.sfxVolume });
  }, [settings]);

  useEffect(() => {
    const unlock = () => audio.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    const mode = screen === 'game' ? 'explore' : screen === 'ending' ? 'ending' : 'menu';
    audio.setMode(mode);
  }, [screen]);

  const navigate = useCallback((next: Screen) => {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const toggleSound = useCallback(() => {
    setSettings((s) => {
      const next = { ...s, muted: !s.muted };
      audio.configure({ muted: next.muted });
      if (!next.muted) audio.sfx('click');
      return next;
    });
  }, []);

  const beginPath = (id: PathId) => {
    audio.sfx('complete');
    setProgress({ ...emptyProgress(), pathId: id, chapter: 1, updatedAt: Date.now() });
    navigate('game');
  };

  const continueGame = () => {
    audio.sfx('click');
    if (!hasPlayableSave(progress) || !progress.pathId) {
      navigate('intro');
      return;
    }
    navigate(progress.completed ? 'ending' : 'game');
  };

  const startFlow = () => {
    audio.sfx('click');
    navigate('intro');
  };

  const gameEvents: GameEvents = {
    onCollect: (itemId, points, heroId) => {
      setProgress((prev) => ({
        ...prev,
        foundItems: prev.foundItems.includes(itemId) ? prev.foundItems : [...prev.foundItems, itemId],
        heroesMet: heroId && !prev.heroesMet.includes(heroId) ? [...prev.heroesMet, heroId] : prev.heroesMet,
        score: prev.score + points,
        updatedAt: Date.now(),
      }));
    },
    onChoice: (key, value) => {
      setProgress((prev) => ({ ...prev, choices: { ...prev.choices, [key]: value }, updatedAt: Date.now() }));
    },
    onAnswer: (correct) => {
      setProgress((prev) => ({
        ...prev,
        answered: prev.answered + 1,
        correct: prev.correct + (correct ? 1 : 0),
        updatedAt: Date.now(),
      }));
    },
    onScore: (points) => {
      setProgress((prev) => ({ ...prev, score: prev.score + points, updatedAt: Date.now() }));
    },
    onCompleteChapter: () => {
      setProgress((prev) => ({
        ...prev,
        chapter: Math.min(5, prev.chapter + 1),
        missionsDone: Math.min(5, prev.missionsDone + 1),
        score: prev.score + 15,
        updatedAt: Date.now(),
      }));
    },
    onFinish: () => {
      audio.sfx('complete');
      setProgress((prev) => {
        if (prev.completed) return prev;
        return {
          ...prev,
          completed: true,
          endingId: prev.pathId ? PATHS[prev.pathId].ending.id : 'ending-pejuang',
          missionsDone: Math.min(5, prev.missionsDone + 1),
          score: prev.score + 20,
          updatedAt: Date.now(),
        };
      });
      navigate('ending');
    },
    onExit: () => navigate('menu'),
    onOpenGallery: () => {
      setGalleryReturn('game');
      navigate('gallery');
    },
    onOpenSettings: () => setSettingsOpen(true),
    onToggleSound: toggleSound,
    onChangeSettings: setSettings,
  };

  const openGallery = (from: Screen) => {
    audio.sfx('click');
    setGalleryReturn(from);
    navigate('gallery');
  };

  const resetGame = () => {
    clearProgress();
    setProgress(emptyProgress());
    setSettingsOpen(false);
    navigate('menu');
  };

  return (
    <>
      {screen === 'menu' && (
        <MenuScreen
          progress={progress}
          onStart={startFlow}
          onContinue={continueGame}
          onGallery={() => openGallery('menu')}
          onGuide={() => setGuideOpen(true)}
          onSettings={() => setSettingsOpen(true)}
          onToggleSound={toggleSound}
          muted={settings.muted}
        />
      )}
      {screen === 'intro' && <IntroScreen onFinish={() => { audio.sfx('click'); navigate('paths'); }} onBack={() => navigate('menu')} />}
      {screen === 'paths' && <PathSelectScreen onSelect={beginPath} onBack={() => navigate('menu')} current={progress} />}
      {screen === 'game' && progress.pathId && (
        <GameScreen
          key={`${progress.pathId}-game`}
          progress={progress}
          path={PATHS[progress.pathId]}
          settings={settings}
          events={gameEvents}
        />
      )}
      {screen === 'game' && !progress.pathId && (
        <div className="flex min-h-screen items-center justify-center p-6">
          <button type="button" onClick={() => navigate('paths')} className="rounded-xl border border-brass/40 px-5 py-3 text-sm text-parchment">Pilih jalur petualangan terlebih dahulu</button>
        </div>
      )}
      {screen === 'ending' && progress.pathId && (
        <EndingScreen
          progress={progress}
          onReplay={() => { if (progress.pathId) beginPath(progress.pathId); }}
          onChoosePath={() => navigate('paths')}
          onMenu={() => navigate('menu')}
          onGallery={() => openGallery('ending')}
        />
      )}
      {screen === 'gallery' && <GalleryScreen progress={progress} onBack={() => navigate(galleryReturn)} />}

      <GuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        onStart={screen === 'menu' ? () => { setGuideOpen(false); startFlow(); } : undefined}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={setSettings}
        onReset={hasPlayableSave(progress) ? resetGame : undefined}
      />
    </>
  );
}
