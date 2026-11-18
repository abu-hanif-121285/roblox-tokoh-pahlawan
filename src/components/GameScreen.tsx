import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdventureWorld, type InteractInfo } from '../game/world';
import type { ExplorerOrbit } from '../game/orbit';
import { CameraControls } from './CameraControls';
import {
  ARCHIVE_INFO, ARCHIVE_STATEMENTS, HEROES, HERO_RESPONSES, ITEM_OFFSETS, ZONES,
  type Challenge, type HeroId, type PathData, type QuestItem,
} from '../data/content';
import type { Progress, Settings } from '../lib/save';
import { audio } from '../lib/audio';
import { cn } from '../utils/cn';
import { CompassMark, GhostButton, GoldDivider, HanifAvatar, HeroPortrait, Icon, IconButton, Modal, PrimaryButton, SectionLabel } from './ui';
import { SettingsModal, GalleryScreen } from '../screens/MetaScreens';

type ModalKind = 'intro' | 'pause' | 'journal' | 'quiz' | 'archive' | 'hero' | 'item' | 'hanif' | 'chapterDone' | 'final' | 'gallery' | 'settings' | null;

export interface GameEvents {
  onCollect: (itemId: string, points: number, heroId?: HeroId) => void;
  onChoice: (key: string, value: string) => void;
  onAnswer: (correct: boolean, firstTry: boolean) => void;
  onScore: (points: number) => void;
  onCompleteChapter: () => void;
  onFinish: () => void;
  onExit: () => void;
  onOpenGallery: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  onChangeSettings: (s: Settings) => void;
}

function Joystick({ onMove }: { onMove: (x: number, y: number) => void }) {
  const pointer = useRef<number | null>(null);
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const update = (e: React.PointerEvent) => {
    if (!base.current || pointer.current !== e.pointerId) return;
    const rect = base.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const max = rect.width * 0.32;
    const dist = Math.hypot(dx, dy);
    if (dist > max) {
      dx = (dx / dist) * max;
      dy = (dy / dist) * max;
    }
    setKnob({ x: dx, y: dy });
    onMove(dx / max, -dy / max);
  };

  return (
    <div className="select-none">
      <div
        ref={base}
        data-game-control="joystick"
        aria-label="Joystick gerak karakter"
        onPointerDown={(e) => {
          if (pointer.current !== null) return;
          pointer.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          update(e);
        }}
        onPointerMove={update}
        onPointerUp={(e) => {
          if (pointer.current !== e.pointerId) return;
          pointer.current = null;
          setKnob({ x: 0, y: 0 });
          onMove(0, 0);
        }}
        onLostPointerCapture={(e) => {
          if (pointer.current !== e.pointerId) return;
          pointer.current = null;
          setKnob({ x: 0, y: 0 });
          onMove(0, 0);
        }}
        onPointerCancel={(e) => {
          if (pointer.current !== e.pointerId) return;
          pointer.current = null;
          setKnob({ x: 0, y: 0 });
          onMove(0, 0);
        }}
        className="relative flex h-[118px] w-[118px] touch-none items-center justify-center rounded-full border border-white/20 bg-[#08201f]/55 shadow-[inset_0_2px_18px_rgba(0,0,0,.55),0_10px_30px_-10px_rgba(0,0,0,.7)] backdrop-blur-md"
      >
        <div className="absolute inset-3 rounded-full border border-dashed border-white/10" />
        {[['top-1.5 left-1/2 -translate-x-1/2', 'M12 5v14m-5-5 5 5 5-5'], ['bottom-1.5 left-1/2 -translate-x-1/2 rotate-180', 'M12 5v14m-5-5 5 5 5-5'], ['left-1.5 top-1/2 -translate-y-1/2 -rotate-90', 'M12 5v14m-5-5 5 5 5-5'], ['right-1.5 top-1/2 -translate-y-1/2 rotate-90', 'M12 5v14m-5-5 5 5 5-5']].map(([pos, d], i) => (
          <svg key={i} viewBox="0 0 24 24" className={cn('absolute h-3 w-3 text-parchment/30', pos)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
        ))}
        <div className="pointer-events-none absolute h-[54px] w-[54px] rounded-full border border-brass/50 bg-gradient-to-br from-[#e8cf9b] to-[#b58c46] shadow-[0_6px_16px_rgba(0,0,0,.5),inset_0_2px_4px_rgba(255,255,255,.4)] transition-transform duration-75" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}>
          <div className="absolute inset-2.5 rounded-full border border-[#6f5220]/40" />
          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5c4318]" />
        </div>
      </div>
      <p className="mt-1.5 text-center text-[8px] font-semibold uppercase tracking-[0.16em] text-parchment/35">Gerakkan</p>
    </div>
  );
}

function MiniMap({ path, chapter, foundIds, player, orbit }: { path: PathData; chapter: number; foundIds: string[]; player: { x: number; z: number }; orbit?: ExplorerOrbit }) {
  const [heading, setHeading] = useState(0);
  useEffect(() => orbit?.subscribe((view) => setHeading(view.heading)), [orbit]);
  const project = (x: number, z: number) => ({ x: 50 + (x / 34) * 42, y: 50 + (z / 34) * 42 });
  const data = path.chapters[chapter - 1];
  const zone = ZONES[chapter];
  const items = (data?.items ?? []).filter((i) => !foundIds.includes(i.id));
  return (
    <div className="relative overflow-hidden rounded-xl border border-brass/25 bg-[#071d1c]/80 p-1 backdrop-blur-md">
      <svg viewBox="0 0 100 100" className="h-[86px] w-[86px] sm:h-[112px] sm:w-[112px]">
        <defs>
          <radialGradient id="mapbg" cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#163d38" /><stop offset="100%" stopColor="#08201f" /></radialGradient>
        </defs>
        <rect width="100" height="100" rx="7" fill="url(#mapbg)" />
        {Object.values(ZONES).map((z) => {
          const p = project(z.x, z.z);
          return <circle key={z.label} cx={p.x} cy={p.y} r="4.5" fill="#0c2a27" stroke="rgba(217,172,92,.3)" strokeWidth=".6" />;
        })}
        {Object.values(ZONES).filter((z) => z.label !== 'Perkampungan').map((z) => {
          const p = project(z.x, z.z);
          return <line key={z.label} x1="50" y1="50" x2={p.x} y2={p.y} stroke="rgba(217,172,92,.16)" strokeWidth="1.4" strokeDasharray="2 2" />;
        })}
        {items.map((item) => {
          const index = (data?.items ?? []).findIndex((i) => i.id === item.id);
          const off = ITEM_OFFSETS[index] ?? { x: 0, z: 0 };
          const p = project(zone.x + off.x, zone.z + off.z);
          return <circle key={item.id} cx={p.x} cy={p.y} r="2.2" fill="#f1d392"><animate attributeName="opacity" values=".4;1;.4" dur="2s" repeatCount="indefinite" /></circle>;
        })}
        {(() => {
          const p = project(zone.x, zone.z);
          return <circle cx={p.x} cy={p.y} r="7" fill="none" stroke="#f1d392" strokeWidth="1" opacity=".75"><animate attributeName="r" values="4;9;4" dur="2.6s" repeatCount="indefinite" /><animate attributeName="opacity" values=".8;.1;.8" dur="2.6s" repeatCount="indefinite" /></circle>;
        })()}
        {(() => {
          const p = project(player.x, player.z);
          return <g><g transform={`translate(${p.x} ${p.y}) rotate(${heading})`}><path d="M0 0 -6 -9 Q0 -13 6 -9 Z" fill="#f1d392" opacity=".38"/><path d="m0-9 2 4-2-1-2 1Z" fill="#f1d392"/></g><circle cx={p.x} cy={p.y} r="3" fill="#d94636" stroke="#fff" strokeWidth="1" /><circle cx={p.x} cy={p.y} r="6" fill="none" stroke="#d94636" strokeOpacity=".4" strokeWidth=".8" /></g>;
        })()}
      </svg>
      <span className="absolute bottom-1 left-1.5 text-[7px] font-bold uppercase tracking-[0.12em] text-parchment/35">Peta</span>
    </div>
  );
}

function QuizPanel({ challenge, onSolved, onAttempt, onContinue, solved }: {
  challenge: Challenge;
  onSolved: (firstTry: boolean) => void;
  onAttempt: () => void;
  onContinue: () => void;
  solved: boolean;
}) {
  const [tries, setTries] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const correct = challenge.correctIndex ?? 0;
  const isDone = solved;

  return (
    <div>
      <p className="text-[13px] leading-relaxed text-parchment/85">{challenge.question}</p>
      <div className="mt-3 space-y-2">
        {(challenge.options ?? []).map((opt, i) => {
          const wasTried = tries.includes(i);
          const isCorrect = isDone && i === correct;
          const isWrong = wasTried && !isCorrect;
          return (
            <button
              key={opt}
              type="button"
              disabled={isDone || wasTried}
              onClick={() => {
                if (i === correct) {
                  audio.sfx('correct');
                  onSolved(tries.length === 0);
                } else {
                  audio.sfx('wrong');
                  setTries((prev) => [...prev, i]);
                  onAttempt();
                }
              }}
              className={cn('option flex w-full items-start gap-3 rounded-xl px-3.5 py-3 text-left disabled:cursor-default', isCorrect && 'correct', isWrong && 'wrong')}
            >
              <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold', isCorrect ? 'border-emerald-300/60 bg-emerald-400/20 text-emerald-100' : isWrong ? 'border-red-300/50 bg-red-500/20 text-red-100' : 'border-brass/35 bg-brass/10 text-brass')}>{String.fromCharCode(65 + i)}</span>
              <span className="flex-1 text-[12px] leading-snug text-parchment/85">{opt}</span>
              {isCorrect && <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />}
              {isWrong && <Icon name="close" className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />}
            </button>
          );
        })}
      </div>
      {tries.length > 0 && !isDone && (
        <div className="mt-2.5 rounded-lg border border-amber-300/25 bg-amber-400/10 p-2.5 text-[10.5px] leading-relaxed text-amber-100/85">
          <span className="font-bold">Belum tepat.</span> Tarik napas sebentar, lalu pikirkan kembali. Tidak apa-apa mencoba lagi.
        </div>
      )}
      {isDone && (
        <div className="mt-3 animate-rise rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3">
          <p className="flex items-center gap-2 text-[11px] font-bold text-emerald-200"><Icon name="check" className="h-4 w-4" /> Jawaban tepat!</p>
          <p className="mt-1 text-[11px] leading-relaxed text-parchment/70">{challenge.explanation}</p>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-2">
        <button type="button" onClick={() => setShowHint((s) => !s)} className="flex items-center gap-1.5 text-[10px] font-semibold text-brass/85 transition hover:text-brass-light">
          <Icon name="help" className="h-3.5 w-3.5" /> {showHint ? 'Sembunyikan petunjuk' : 'Petunjuk HANIF'}
        </button>
        {isDone && <PrimaryButton onClick={onContinue} icon="arrow" className="!min-h-10 !rounded-xl !px-4 !py-2 !text-[11px]">Lanjutkan</PrimaryButton>}
      </div>
      {showHint && <p className="mt-2 rounded-lg border border-brass/20 bg-brass/[0.06] p-2.5 text-[10.5px] leading-relaxed text-parchment/65">💡 {challenge.hint}</p>}
    </div>
  );
}

export function GameScreen({ progress, path, settings, events }: { progress: Progress; path: PathData; settings: Settings; events: GameEvents }) {
  const canvasHost = useRef<HTMLDivElement>(null);
  const worldRef = useRef<AdventureWorld | null>(null);
  const [ready, setReady] = useState(false);
  const [worldError, setWorldError] = useState(false);
  const [near, setNear] = useState<InteractInfo | null>(null);
  const [incoming, setIncoming] = useState<InteractInfo | null>(null);
  const [player, setPlayer] = useState({ x: 0, z: 0 });
  const [modal, setModal] = useState<ModalKind>('intro');
  const [activeItem, setActiveItem] = useState<QuestItem | null>(null);
  const [itemStage, setItemStage] = useState<'story' | 'choice' | 'result'>('story');
  const [chosenChoice, setChosenChoice] = useState<number | null>(null);
  const [heroStage, setHeroStage] = useState<'story' | 'quiz'>('story');
  const [quizSolved, setQuizSolved] = useState(false);
  const [archiveResults, setArchiveResults] = useState<Record<string, { correct: boolean; firstTry: boolean }>>({});
  const [archiveTab, setArchiveTab] = useState<'dokumen' | 'panduan'>('dokumen');
  const [toast, setToast] = useState<{ id: number; text: string; tone: 'good' | 'info' } | null>(null);
  const toastTimer = useRef<number | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const chapterIndex = Math.min(path.chapters.length - 1, Math.max(0, progress.chapter - 1));
  const chapter = path.chapters[chapterIndex];
  const foundInChapter = chapter.items.filter((i) => progress.foundItems.includes(i.id));
  const itemsRemaining = chapter.items.length - foundInChapter.length;
  const challengeReady = chapter.items.length === 0 || itemsRemaining === 0;
  const featured = HEROES[path.featuredHero];
  const heroMet = progress.foundItems.includes(`meet-${featured.id}`) || progress.heroesMet.includes(featured.id);

  const showToast = useCallback((text: string, tone: 'good' | 'info' = 'info') => {
    setToast({ id: Date.now(), text, tone });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3600);
  }, []);

  const incomingRef = useRef<(info: InteractInfo) => void>(() => {});

  const openChallenge = useCallback(() => {
    if (chapter.challenge.type === 'archive') {
      setArchiveResults({});
      setArchiveTab('dokumen');
      setModal('archive');
      return;
    }
    if (chapter.challenge.type === 'final') {
      setModal('final');
      return;
    }
    if (itemsRemaining > 0) {
      showToast(`Masih ada ${itemsRemaining} jejak yang belum ditemukan. Cari benda bercahaya di ${chapter.location}.`, 'info');
      setModal('hanif');
      return;
    }
    if (chapter.n === 2) {
      if (heroMet) {
        setHeroStage('story');
        setModal('hero');
      } else {
        setModal('hero');
      }
      return;
    }
    setQuizSolved(false);
    setModal('quiz');
  }, [chapter, heroMet, itemsRemaining, showToast]);

  const completeItem = useCallback((item: QuestItem, points: number, heroId?: HeroId) => {
    if (!progress.foundItems.includes(item.id)) {
      events.onCollect(item.id, points, heroId);
      audio.sfx('collect');
    }
    worldRef.current?.removeItem(item.id);
  }, [events, progress.foundItems]);

  const handleInteract = useCallback((info: InteractInfo) => {
    if (info.kind === 'hanif') {
      setModal('hanif');
      audio.sfx('open');
      return;
    }
    if (info.kind === 'flag') {
      setModal('final');
      audio.sfx('open');
      return;
    }
    if (info.kind === 'archive') {
      setArchiveResults({});
      setArchiveTab('dokumen');
      setModal('archive');
      audio.sfx('open');
      return;
    }
    if (info.kind === 'hero') {
      setHeroStage('story');
      setModal('hero');
      audio.sfx('open');
      return;
    }
    if (info.kind === 'item' && info.itemId) {
      const item = chapter.items.find((i) => i.id === info.itemId);
      if (!item) return;
      setActiveItem(item);
      setItemStage(item.choices ? 'choice' : 'story');
      setChosenChoice(null);
      setModal('item');
      audio.sfx('open');
    }
  }, [chapter.items]);

  incomingRef.current = handleInteract;

  useEffect(() => {
    const host = canvasHost.current;
    if (!host) return;
    let world: AdventureWorld | null = null;
    try {
      world = new AdventureWorld(host, {
        pathId: path.id,
        chapter: progress.chapter,
        featuredHero: path.featuredHero,
        foundIds: progress.foundItems,
        paused: true,
      }, {
        onNear: setNear,
        onInteract: (info) => setIncoming(info),
        onPosition: setPlayer,
      });
      worldRef.current = world;
    } catch {
      setWorldError(true);
    }
    setReady(true);
    return () => {
      world?.dispose();
      worldRef.current = null;
    };
    // The world is rebuilt only when the route changes; chapters update in place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path.id]);

  useEffect(() => {
    worldRef.current?.updateOptions({ chapter: progress.chapter, foundIds: progress.foundItems });
    setModal('intro');
    setArchiveResults({});
    setQuizSolved(false);
    setHeroStage('story');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.chapter]);

  useEffect(() => {
    if (incoming) {
      incomingRef.current(incoming);
      setIncoming(null);
    }
  }, [incoming]);

  useEffect(() => {
    worldRef.current?.setPaused(modal !== null || showGallery || showSettings);
  }, [modal, showGallery, showSettings]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showGallery) return;
        setModal((m) => (m === 'intro' || m === 'chapterDone' ? m : m === null ? 'pause' : null));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showGallery]);

  useEffect(() => {
    if (!toast) return;
    return () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); };
  }, [toast]);

  const readyNotice = useMemo(() => {
    if (chapter.n === 2) return 'Temui tokoh di pendopo untuk membuka kisahnya.';
    if (chapter.n === 4) return 'Masuki Rumah Arsip untuk memeriksa dokumen.';
    if (chapter.n === 5) return 'Naiki bukit dan temui HANIF di dekat bendera.';
    return itemsRemaining > 0 ? `${itemsRemaining} jejak lagi untuk membuka tantangan HANIF.` : 'Semua jejak ditemukan. Tantangan HANIF siap!';
  }, [chapter.n, itemsRemaining]);

  const archiveSolved = ARCHIVE_STATEMENTS.every((s) => archiveResults[s.id]?.correct);

  const finishChapter = () => {
    audio.sfx('complete');
    setModal(null);
    events.onCompleteChapter();
  };

  const handleQuizSolved = (firstTry: boolean) => {
    const targetHero = chapter.n === 2 ? featured.id : undefined;
    if (targetHero) events.onCollect(`meet-${targetHero}`, heroMet ? 0 : 10, targetHero);
    events.onAnswer(true, firstTry);
    events.onScore(firstTry ? 20 : 10);
    setQuizSolved(true);
    setHeroStage('quiz');
    showToast(firstTry ? 'Jawaban tepat! +20 skor pengetahuan' : 'Jawaban tepat! +10 skor pengetahuan', 'good');
  };

  const handleQuizAttempt = () => {
    events.onAnswer(false, false);
  };

  const openGalleryOverlay = () => {
    audio.sfx('click');
    setShowGallery(true);
  };

  const closeEverything = () => {
    setShowGallery(false);
    setShowSettings(false);
    setModal(null);
  };

  return (
    <div className="relative h-[100dvh] w-full select-none overflow-hidden bg-[#081a19] text-parchment">
      <div ref={canvasHost} className="game-canvas absolute inset-0" />
      {!ready && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#061817]">
          <CompassMark className="h-16 w-16 animate-pulse" />
          <p className="display text-xl text-parchment">Menyiapkan dunia petualangan…</p>
          <p className="text-[11px] text-parchment/40">Menyusun jejak sejarah untukmu, {chapter.location}.</p>
        </div>
      )}
      {worldError && (
        <div className="absolute inset-0 z-[55] flex items-center justify-center bg-[#051615]/96 p-5">
          <div className="glass w-full max-w-md overflow-hidden rounded-2xl border border-brass/30">
            <div className="relative h-32"><img src={path.image} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#0a2422] to-transparent" /></div>
            <div className="p-5 text-center">
              <Icon name="compass" className="mx-auto h-8 w-8 text-brass" />
              <h2 className="display mt-2 text-xl font-semibold text-parchment">Dunia 3D belum dapat dibuka</h2>
              <p className="mt-1.5 text-[11px] leading-relaxed text-parchment/55">Perangkat atau browser ini belum mendukung WebGL. Coba gunakan Chrome, Edge, atau Safari terbaru dengan akselerasi grafis aktif. Progres belajarmu tetap tersimpan.</p>
              <PrimaryButton onClick={() => { audio.sfx('click'); events.onExit(); }} icon="back" className="mt-3.5 w-full">Kembali ke Menu</PrimaryButton>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-40 bg-gradient-to-b from-[#041414]/85 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-56 bg-gradient-to-t from-[#041414]/85 to-transparent" />

      <header className="game-hud absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-2 p-2.5 sm:p-4">
        <div className="flex items-start gap-2">
          <IconButton icon="pause" label="Jeda permainan" onClick={() => { audio.sfx('click'); setModal('pause'); }} />
          <div className="hud-chip flex min-w-0 max-w-[152px] items-center gap-2 rounded-xl px-2.5 py-1.5 sm:max-w-none">
            <CompassMark className="hidden h-7 w-7 sm:flex" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[10.5px] font-bold text-parchment">Babak {chapter.n} · {chapter.title}</p>
              <p className="truncate text-[8px] uppercase tracking-[0.12em] text-brass/75"><span className="sm:hidden">{path.title}</span><span className="hidden sm:inline">{path.title} · {chapter.location}</span></p>
            </div>
          </div>
          <div className="hidden items-center gap-1 lg:flex">
            {path.chapters.map((c) => (
              <span key={c.n} className={cn('h-1.5 rounded-full transition-all', c.n < progress.chapter ? 'w-2 bg-emerald-400/70' : c.n === progress.chapter ? 'w-5 bg-brass' : 'w-2 bg-white/15')} title={c.title} />
            ))}
          </div>
        </div>
        <div className="flex items-start gap-1.5">
          <div className="hud-chip flex items-center gap-1.5 rounded-xl px-2.5 py-1.5">
            <Icon name="star" className="h-4 w-4 text-brass" />
            <div className="leading-none"><p className="text-xs font-bold text-parchment">{progress.score}</p><p className="mt-0.5 text-[7px] uppercase tracking-[0.1em] text-parchment/45">Skor</p></div>
          </div>
          <div className="hud-chip hidden items-center gap-1.5 rounded-xl px-2.5 py-1.5 sm:flex">
            <Icon name="scroll" className="h-4 w-4 text-brass" />
            <div className="leading-none"><p className="text-xs font-bold text-parchment">{progress.foundItems.length}</p><p className="mt-0.5 text-[7px] uppercase tracking-[0.1em] text-parchment/45">Jejak</p></div>
          </div>
          <IconButton icon="book" label="Jurnal perjalanan" onClick={() => { audio.sfx('open'); setModal('journal'); }} />
          <IconButton icon={settings.muted ? 'muted' : 'music'} label="Suara" onClick={events.onToggleSound} />
          <IconButton icon="settings" label="Pengaturan" onClick={() => { setShowSettings(true); }} className="hidden sm:flex" />
        </div>
      </header>

      <div className="game-hud absolute inset-x-0 top-[58px] z-20 flex items-start justify-between gap-2 px-2.5 sm:top-[74px] sm:px-4">
        <div className="hud-chip min-w-0 max-w-[245px] flex-1 rounded-xl p-2.5 sm:max-w-xs sm:p-3">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brass/15 text-brass"><Icon name="flag" className="h-3 w-3" /></span>
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-brass/85">Misi babak {chapter.n}</p>
            <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] font-semibold text-parchment/60">{chapter.items.length ? `${foundInChapter.length}/${chapter.items.length}` : chapter.n === 2 ? 'Tokoh' : chapter.n === 4 ? 'Arsip' : 'Bendera'}</span>
          </div>
          <p className="mt-1 line-clamp-2 text-[10.5px] font-semibold leading-snug text-parchment/90">{chapter.n === 2 ? `Temui ${featured.name}` : chapter.objective}</p>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-brass/70 to-brass-light transition-all duration-500" style={{ width: `${chapter.items.length ? (foundInChapter.length / chapter.items.length) * 100 : 0}%` }} />
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <button type="button" onClick={() => openChallenge()} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-brass/35 bg-brass/12 px-2 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-brass-light transition hover:bg-brass/20">
              <Icon name={challengeReady && chapter.items.length > 0 ? 'spark' : 'chat'} className="h-3 w-3" />
              {chapter.n === 2 ? 'Kisah Tokoh' : chapter.n === 4 ? 'Arsip' : chapter.n === 5 ? 'Akhiri' : challengeReady ? 'Tantangan' : 'Tanya HANIF'}
            </button>
            <button type="button" onClick={() => setModal('journal')} className="flex h-[27px] w-[27px] items-center justify-center rounded-lg border border-white/15 bg-white/5 text-parchment/65" aria-label="Buka jurnal"><Icon name="book" className="h-3.5 w-3.5" /></button>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <MiniMap path={path} chapter={chapter.n} foundIds={progress.foundItems} player={player} orbit={worldRef.current?.orbit} />
          {modal === null && !showGallery && !showSettings && <CameraControls orbit={worldRef.current?.orbit} />}
        </div>
      </div>

      {toast && (
        <div className="pointer-events-none absolute left-1/2 top-[142px] z-30 w-[min(340px,calc(100%-24px))] -translate-x-1/2 animate-rise sm:top-[170px]">
          <div className={cn('flex items-center gap-2 rounded-xl border px-3 py-2 shadow-xl backdrop-blur-md', toast.tone === 'good' ? 'border-emerald-300/35 bg-emerald-900/70' : 'border-brass/30 bg-[#0a2624]/90')}>
            <Icon name={toast.tone === 'good' ? 'check' : 'spark'} className={cn('h-4 w-4 shrink-0', toast.tone === 'good' ? 'text-emerald-300' : 'text-brass')} />
            <p className="text-[10.5px] font-medium leading-snug text-parchment/90">{toast.text}</p>
          </div>
        </div>
      )}

      <div className="game-hud absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-2 p-3 pb-[max(14px,env(safe-area-inset-bottom))] sm:p-6">
        <Joystick onMove={(x, y) => worldRef.current?.setMove(x, y)} />
        <div className="flex flex-col items-end gap-2">
          {near && (
            <button type="button" onClick={() => { audio.sfx('open'); worldRef.current?.interact(); }} className="mb-0.5 flex max-w-[210px] items-center gap-2 rounded-xl border border-brass/50 bg-[#0a2724]/92 px-3 py-2 shadow-xl backdrop-blur-md transition hover:border-brass hover:bg-[#123a35]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brass/20 text-[10px] font-bold text-brass-light desktop-only">E</span>
              <span className="min-w-0 text-left"><span className="block text-[7px] font-bold uppercase tracking-[0.14em] text-brass/70">Dekat</span><span className="block truncate text-[10.5px] font-semibold text-parchment">{near.label}</span></span>
              <Icon name="chevron" className="h-3.5 w-3.5 shrink-0 text-brass" />
            </button>
          )}
          <div className="flex items-end gap-2">
            <div className="flex flex-col gap-2">
              <button type="button" onPointerDown={() => worldRef.current?.setRunning(true)} onPointerUp={() => worldRef.current?.setRunning(false)} onPointerLeave={() => worldRef.current?.setRunning(false)} className="flex h-[58px] w-[58px] flex-col items-center justify-center gap-0.5 rounded-full border border-white/20 bg-[#08201f]/72 text-parchment/80 backdrop-blur-md active:scale-95 active:border-brass/60">
                <Icon name="run" className="h-5 w-5" /><span className="text-[7px] font-bold uppercase tracking-[0.1em]">Lari</span>
              </button>
              <button type="button" onClick={() => worldRef.current?.jump()} className="flex h-[58px] w-[58px] flex-col items-center justify-center gap-0.5 rounded-full border border-white/20 bg-[#08201f]/72 text-parchment/80 backdrop-blur-md active:scale-95 active:border-brass/60">
                <Icon name="jump" className="h-5 w-5" /><span className="text-[7px] font-bold uppercase tracking-[0.1em]">Lompat</span>
              </button>
            </div>
            <button type="button" onClick={() => { audio.sfx('click'); worldRef.current?.interact(); }} disabled={!near} className={cn('interact-btn flex h-[84px] w-[84px] flex-col items-center justify-center gap-0.5 rounded-full transition disabled:opacity-55', near && 'animate-[pulse-ring_2.5s_ease-out_infinite]')}>
              <Icon name="interact" className="h-6 w-6" strokeWidth={2} />
              <span className="text-[8px] font-extrabold uppercase tracking-[0.1em]">Interaksi</span>
            </button>
          </div>
          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[8px] text-parchment/35 backdrop-blur-md sm:flex">
            <Icon name="camera" className="h-3 w-3" /> Kamera 360° · Seret atau J / L untuk memutar · C untuk pusatkan
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-[150px] left-1/2 z-20 hidden -translate-x-1/2 sm:block">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#061c1b]/65 px-3 py-1.5 backdrop-blur-md">
          <HanifAvatar size="h-5 w-5" ring={false} />
          <p className="text-[9px] text-parchment/55">{readyNotice}</p>
        </div>
      </div>

      <Modal open={modal === 'intro'} onClose={() => setModal(null)} size="xl" dismissable={false}>
        <div className="grid max-h-[90vh] grid-cols-1 overflow-y-auto scroll-thin sm:grid-cols-[0.82fr_1.18fr]">
          <div className="relative h-36 overflow-hidden sm:h-auto sm:min-h-[420px]">
            <img src={path.image} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a2422] via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-[#0a2422]/90" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-3 left-4">
              <p className="display text-6xl font-semibold leading-none text-parchment/85">{String(chapter.n).padStart(2, '0')}</p>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-brass">{path.title}</p>
            </div>
            <div className="absolute left-4 top-4 flex gap-1">
              {path.chapters.map((c) => <span key={c.n} className={cn('h-1 w-5 rounded-full', c.n <= chapter.n ? 'bg-brass' : 'bg-white/20')} />)}
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <SectionLabel>{chapter.kicker} · {chapter.location}</SectionLabel>
            <h2 className="display mt-1.5 text-[28px] font-semibold leading-tight text-parchment sm:text-[34px]">{chapter.title}</h2>
            <p className="mt-2 text-[11.5px] leading-relaxed text-parchment/55">{chapter.synopsis}</p>
            <div className="mt-3.5 flex items-start gap-3 rounded-xl border border-brass/25 bg-brass/[0.06] p-3">
              <HanifAvatar size="h-11 w-11" />
              <div>
                <p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-brass">HANIF</p>
                {chapter.hanifIntro.map((line, i) => <p key={i} className="mt-1 text-[11px] leading-relaxed text-parchment/75">“{line}”</p>)}
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.15em] text-brass"><Icon name={chapter.n === 2 ? 'gallery' : chapter.n === 4 ? 'archive' : chapter.n === 5 ? 'flag' : 'scroll'} className="h-3.5 w-3.5" /> Tujuan misi</p>
              <p className="mt-1 text-[11.5px] font-medium leading-snug text-parchment/85">{chapter.objective}</p>
              <p className="mt-1.5 text-[9.5px] leading-relaxed text-parchment/40">💡 {chapter.hanifTip}</p>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-[9px] text-parchment/30">Joystick / WASD untuk bergerak. Usap atau seret dunia untuk memutar kamera 360°.</p>
              <PrimaryButton onClick={() => { audio.sfx('click'); setModal(null); }} icon="play" className="!min-h-11 !rounded-xl !px-5 !py-2.5 !text-xs">Mulai Babak</PrimaryButton>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={modal === 'chapterDone'} onClose={() => setModal('chapterDone')} size="sm" dismissable={false}>
        <div className="relative overflow-hidden p-6 text-center">
          <div className="absolute inset-x-0 -top-16 h-40 bg-[radial-gradient(circle,rgba(217,172,92,.28),transparent_65%)]" />
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-brass/50 bg-brass/15 text-brass-light shadow-[0_0_40px_-8px_rgba(217,172,92,.6)]">
            <Icon name="check" className="h-8 w-8" strokeWidth={2.2} />
          </div>
          <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.22em] text-brass">Babak {chapter.n} selesai</p>
          <h2 className="display mt-1 text-[28px] font-semibold leading-tight text-parchment">{chapter.title}</h2>
          <p className="mx-auto mt-2 max-w-sm text-[11.5px] leading-relaxed text-parchment/55">Kerja bagus, Penjelajah! Kamu telah menyelesaikan tantangan babak ini. Pemahamanmu tentang sejarah bangsa semakin kuat.</p>
          <div className="mt-3.5 grid grid-cols-3 gap-2">
            {[
              { icon: 'star', label: 'Skor', value: progress.score },
              { icon: 'scroll', label: 'Jejak', value: progress.foundItems.length },
              { icon: 'gallery', label: 'Tokoh', value: progress.heroesMet.length },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
                <Icon name={s.icon} className="mx-auto h-4 w-4 text-brass" />
                <p className="display mt-1 text-lg font-semibold leading-none text-parchment">{s.value}</p>
                <p className="mt-1 text-[7.5px] uppercase tracking-[0.12em] text-parchment/40">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-brass/20 bg-brass/[0.05] p-2.5 text-left">
            <HanifAvatar size="h-8 w-8" />
            <p className="text-[10px] leading-relaxed text-parchment/65">“{chapter.n < 5 ? 'Satu langkah lagi menuju warisan perjuangan. Ayo lanjutkan!' : 'Perjalanan ini akan menjadi kenangan berharga.'}”</p>
          </div>
          <PrimaryButton onClick={finishChapter} icon="arrow" className="mt-4 w-full">{chapter.n < 5 ? `Lanjut ke Babak ${chapter.n + 1}` : 'Tutup Perjalanan'}</PrimaryButton>
        </div>
      </Modal>

      <Modal open={modal === 'item' && Boolean(activeItem)} onClose={() => setModal(null)} size="md">
        {activeItem && (
          <div className="max-h-[88vh] overflow-y-auto scroll-thin">
            {activeItem.heroId ? (
              <div className="relative h-36 overflow-hidden">
                <div className="absolute inset-0"><HeroPortrait hero={activeItem.heroId} className="h-full w-full" /></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a2422] via-[#0a2422]/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-brass-light">Jejak ditemukan · Kartu galeri terbuka</p>
                  <p className="display text-2xl font-semibold text-parchment">{HEROES[activeItem.heroId].name}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-brass/30 bg-brass/10 text-2xl text-brass">{activeItem.icon}</span>
                <div><p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-brass">Jejak {activeItem.kind === 'relic' ? 'sejarah' : 'simulasi'} · Babak {chapter.n}</p><h2 className="display text-xl font-semibold text-parchment">{activeItem.name}</h2></div>
              </div>
            )}
            <div className="p-5">
              <p className="text-[12px] leading-relaxed text-parchment/72">{activeItem.story}</p>
              {activeItem.heroId && (
                <div className="mt-3 flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brass/15 text-[11px] font-bold text-brass">H</div>
                  <p className="text-[10.5px] leading-relaxed text-parchment/55"><span className="font-semibold text-parchment/80">HANIF:</span> “Kisah {HEROES[activeItem.heroId].name} sekarang tersimpan di Galeri Pahlawanmu. Kamu bisa membacanya kembali kapan saja.”</p>
                </div>
              )}
              {activeItem.choices && itemStage === 'choice' && (
                <div className="mt-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brass">Apa yang kamu lakukan?</p>
                  <div className="mt-2 space-y-2">
                    {activeItem.choices.map((choice) => (
                      <button key={choice.id} type="button" onClick={() => {
                        audio.sfx(choice.score >= 5 ? 'correct' : 'click');
                        setChosenChoice(activeItem.choices!.findIndex((c) => c.id === choice.id));
                        setItemStage('result');
                        events.onChoice(`${chapter.n}-${activeItem.id}`, choice.label);
                        events.onScore(choice.score);
                        completeItem(activeItem, 0);
                      }} className="option flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left">
                        <span className="text-[11.5px] leading-snug text-parchment/85">{choice.label}</span>
                        <Icon name="chevron" className="h-4 w-4 shrink-0 text-brass/75" />
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[9px] leading-relaxed text-parchment/30">Pilihanmu dicatat di Jurnal Perjalanan. Tidak ada jawaban yang membuatmu gagal.</p>
                </div>
              )}
              {activeItem.choices && chosenChoice !== null && itemStage === 'result' && (() => {
                const choice = activeItem.choices![chosenChoice];
                return (
                  <div className="mt-3 animate-rise">
                    <div className={cn('rounded-xl border p-3', choice.score >= 5 ? 'border-emerald-300/30 bg-emerald-500/10' : 'border-amber-300/30 bg-amber-400/10')}>
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-parchment/85"><Icon name={choice.score >= 5 ? 'heart' : 'spark'} className="h-3.5 w-3.5 text-brass" /> Konsekuensi pilihan</p>
                      <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-parchment/90">{choice.feedback}</p>
                      <p className="mt-1.5 text-[10.5px] leading-relaxed text-parchment/55">{choice.consequence}</p>
                      <p className="mt-1.5 text-[9px] font-semibold text-brass/80">+{choice.score} skor pengalaman</p>
                    </div>
                    <HanifAvatar size="h-5 w-5" ring={false} />
                    <p className="mt-2 hidden text-[10px] text-parchment/50">Setiap pilihan membentuk pengalamanmu, bukan mengubah fakta sejarah.</p>
                    <PrimaryButton onClick={() => { setModal(null); setActiveItem(null); }} icon="arrow" className="mt-3 w-full">Lanjutkan Perjalanan</PrimaryButton>
                  </div>
                );
              })()}
              {!activeItem.choices && (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <GhostButton onClick={() => setModal(null)} className="sm:w-28">Tutup</GhostButton>
                  <PrimaryButton onClick={() => { completeItem(activeItem, 10, activeItem.heroId); setModal(null); showToast(`${activeItem.name} tersimpan sebagai jejak sejarah. +10 skor`, 'good'); }} icon="book" className="flex-1">Simpan Jejak Sejarah</PrimaryButton>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={modal === 'hero'} onClose={() => setModal(null)} size="lg">
        <div className="max-h-[90vh] overflow-y-auto scroll-thin">
          <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]">
            <div className="relative h-[210px] sm:h-auto"><HeroPortrait hero={featured} className="h-full w-full" /></div>
            <div className="p-5 sm:p-6">
              <div className="pr-8">
                <p className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-brass">Sang pahlawan · {featured.origin}</p>
                <h2 className="display mt-1 text-[26px] font-semibold leading-tight text-parchment">{featured.name}</h2>
                <p className="text-[10px] text-parchment/45">{featured.fullName} · {featured.years}</p>
              </div>
              <p className="mt-2.5 text-[11.5px] leading-relaxed text-parchment/70">{featured.struggle}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5"><p className="text-[8px] font-bold uppercase tracking-[0.14em] text-brass/75">Bentuk perjuangan</p><p className="mt-1 text-[10.5px] leading-snug text-parchment/70">{featured.form}</p></div>
                <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2.5"><p className="text-[8px] font-bold uppercase tracking-[0.14em] text-brass/75">Pengorbanan</p><p className="mt-1 text-[10.5px] leading-snug text-parchment/70">{featured.sacrifice}</p></div>
              </div>
              {heroStage === 'story' ? (
                <>
                  <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-brass/25 bg-brass/[0.06] p-3">
                    <HanifAvatar size="h-9 w-9" />
                    <div><p className="text-[8px] font-bold uppercase tracking-[0.14em] text-brass">HANIF</p><p className="mt-0.5 text-[10.5px] leading-relaxed text-parchment/70">“{featured.name} berjuang dengan caranya sendiri. {featured.service}”</p></div>
                  </div>
                  <p className="mt-2 text-[8.5px] leading-relaxed text-parchment/30">Dialog tokoh adalah dramatisasi edukatif, bukan kutipan asli. Biografi disusun dari sumber sejarah umum.</p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <GhostButton onClick={() => setModal(null)} className="sm:w-28">Tutup</GhostButton>
                    <PrimaryButton onClick={() => { setQuizSolved(false); setHeroStage('quiz'); }} icon="chat" className="flex-1">{heroMet && !progress.foundItems.includes(`meet-${featured.id}`) ? 'Lanjutkan Percakapan' : 'Jawab Pertanyaan'}</PrimaryButton>
                  </div>
                </>
              ) : quizSolved ? (
                <div className="mt-4">
                  <div className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3">
                    <p className="flex items-center gap-2 text-[11px] font-bold text-emerald-100"><Icon name="check" className="h-4 w-4" /> Pemahamanmu tentang {featured.name} telah tercatat.</p>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-parchment/80"><span className="font-semibold text-parchment">{featured.name}:</span> “{HERO_RESPONSES[featured.id].correct}”</p>
                  </div>
                  <div className="mt-2 flex items-start gap-2 rounded-lg border border-brass/20 bg-brass/[0.06] p-2.5">
                    <HanifAvatar size="h-7 w-7" />
                    <p className="text-[10.5px] leading-relaxed text-parchment/70"><span className="font-semibold text-parchment/90">HANIF:</span> “{HERO_RESPONSES[featured.id].hanif}”</p>
                  </div>
                  <p className="mt-2 text-[8.5px] leading-relaxed text-parchment/30">Dialog tokoh merupakan dramatisasi edukatif untuk pembelajaran, bukan kutipan asli.</p>
                  <PrimaryButton onClick={() => setModal('chapterDone')} icon="arrow" className="mt-3 w-full">Lanjut ke Penutup Babak</PrimaryButton>
                </div>
              ) : (
                <div className="mt-4">
                  <div className="mb-2.5 flex items-start gap-2.5 rounded-lg border border-white/10 bg-white/[0.035] p-2.5">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-brass/30 bg-brass/10 text-[10px] font-bold text-brass">{featured.name.charAt(0)}</div>
                    <p className="text-[10.5px] leading-relaxed text-parchment/65"><span className="font-semibold text-parchment/90">{featured.name}:</span> “Anak muda, menurutmu bagaimana caraku berjuang untuk bangsa ini?”</p>
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brass">Pertanyaan dari kisah sang pahlawan</p>
                  <div className="mt-2">
                    <QuizPanel challenge={chapter.challenge} onSolved={handleQuizSolved} onAttempt={handleQuizAttempt} onContinue={() => setModal('chapterDone')} solved={quizSolved} />
                  </div>
                  <p className="mt-2 text-[9px] leading-relaxed text-parchment/30">Petunjuk pahlawan: {HERO_RESPONSES[featured.id].hint}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={modal === 'quiz'} onClose={() => setModal(null)} size="md">
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 pr-8">
            <div className="flex items-center gap-2.5"><HanifAvatar size="h-10 w-10" /><div><p className="text-[10px] font-bold text-parchment">Tantangan HANIF</p><p className="text-[8px] uppercase tracking-[0.14em] text-brass/70">Babak {chapter.n} · Pengetahuan</p></div></div>
            <span className="rounded-full border border-brass/25 bg-brass/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-brass">+20 skor</span>
          </div>
          <GoldDivider className="my-3.5" />
          <h2 className="display text-xl font-semibold text-parchment">{chapter.challenge.title}</h2>
          <p className="mt-0.5 text-[10.5px] leading-relaxed text-parchment/45">{chapter.challenge.prompt}</p>
          <div className="mt-3"><QuizPanel challenge={chapter.challenge} onSolved={handleQuizSolved} onAttempt={handleQuizAttempt} onContinue={() => setModal('chapterDone')} solved={quizSolved} /></div>
        </div>
      </Modal>

      <Modal open={modal === 'archive'} onClose={() => setModal(null)} size="xl">
        <div className="max-h-[92vh] overflow-y-auto scroll-thin">
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-brass/30 bg-brass/10 text-brass"><Icon name="archive" className="h-5 w-5" /></div>
            <div className="min-w-0 pr-8"><p className="text-[8.5px] font-bold uppercase tracking-[0.18em] text-brass">Rumah Arsip · Babak IV</p><h2 className="display truncate text-xl font-semibold text-parchment">{chapter.challenge.title}</h2></div>
          </div>
          <div className="grid gap-0 md:grid-cols-[1fr_320px]">
            <div className="p-5">
              <div className="flex items-center gap-2 rounded-xl border border-brass/25 bg-brass/[0.06] p-3">
                <HanifAvatar size="h-9 w-9" />
                <p className="text-[10.5px] leading-relaxed text-parchment/70"><span className="font-bold text-brass">HANIF:</span> “Bacalah setiap dokumen, lalu tentukan sesuai atau bukan. Tekan tombol Petunjuk jika kamu perlu bantuan.”</p>
              </div>
              <div className="mt-3 space-y-2">
                {ARCHIVE_STATEMENTS.map((s, idx) => {
                  const res = archiveResults[s.id];
                  return (
                    <div key={s.id} className={cn('rounded-xl border p-3 transition', res?.correct ? 'border-emerald-300/35 bg-emerald-500/10' : 'border-white/10 bg-white/[0.035]')}>
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-brass/25 bg-brass/10 text-[9px] font-bold text-brass">{idx + 1}</span>
                        <p className="flex-1 text-[11px] leading-snug text-parchment/82">{s.text}</p>
                        {res?.correct && <Icon name="check" className="h-4 w-4 shrink-0 text-emerald-300" />}
                      </div>
                      {res?.correct ? (
                        <p className="mt-1.5 pl-7 text-[9.5px] leading-relaxed text-emerald-100/65">{s.reason}</p>
                      ) : (
                        <div className="mt-2 flex gap-2 pl-7">
                          <button type="button" onClick={() => {
                            if (s.valid) {
                              const firstTry = !archiveResults[s.id];
                              setArchiveResults((prev) => ({ ...prev, [s.id]: { correct: true, firstTry } }));
                              events.onAnswer(true, firstTry);
                              events.onScore(10);
                              audio.sfx('correct');
                              const allDone = ARCHIVE_STATEMENTS.every((x) => x.id === s.id || archiveResults[x.id]?.correct);
                              if (allDone) showToast('Semua dokumen berhasil dipilah! +10 per dokumen', 'good');
                            } else {
                              audio.sfx('wrong');
                              events.onAnswer(false, false);
                              showToast('Dokumen ini tidak sesuai kriteria. Baca alasan di panduan.', 'info');
                            }
                          }} className="flex-1 rounded-lg border border-emerald-300/30 bg-emerald-500/10 px-2 py-1.5 text-[9.5px] font-bold text-emerald-100 transition hover:bg-emerald-500/20">Sesuai</button>
                          <button type="button" onClick={() => {
                            if (!s.valid) {
                              const firstTry = !archiveResults[s.id];
                              setArchiveResults((prev) => ({ ...prev, [s.id]: { correct: true, firstTry } }));
                              events.onAnswer(true, firstTry);
                              events.onScore(10);
                              audio.sfx('correct');
                            } else {
                              audio.sfx('wrong');
                              events.onAnswer(false, false);
                              showToast('Dokumen ini justru termasuk kriteria. Coba periksa panduan.', 'info');
                            }
                          }} className="flex-1 rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 text-[9.5px] font-bold text-parchment/60 transition hover:border-red-300/40 hover:text-red-200">Bukan</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {archiveSolved && (
                <div className="mt-3 animate-rise rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3">
                  <p className="flex items-center gap-2 text-[11px] font-bold text-emerald-200"><Icon name="check" className="h-4 w-4" /> Arsip berhasil dipilah!</p>
                  <p className="mt-1 text-[10px] leading-relaxed text-parchment/60">Kamu telah memahami pengertian dan kriteria Pahlawan Nasional berdasarkan UU No. 20 Tahun 2009.</p>
                  <PrimaryButton onClick={() => setModal('chapterDone')} icon="arrow" className="mt-2.5 w-full !min-h-10 !text-[11px]">Selesaikan Babak IV</PrimaryButton>
                </div>
              )}
            </div>
            <div className="border-t border-white/10 bg-[#071f1e]/60 p-4 md:border-l md:border-t-0">
              <div className="flex gap-1">
                {[{ id: 'dokumen' as const, label: 'Dokumen' }, { id: 'panduan' as const, label: 'Panduan' }].map((t) => (
                  <button key={t.id} type="button" onClick={() => setArchiveTab(t.id)} className={cn('rounded-lg border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em]', archiveTab === t.id ? 'border-brass/50 bg-brass/15 text-brass-light' : 'border-white/10 text-parchment/45')}>{t.label}</button>
                ))}
              </div>
              {archiveTab === 'dokumen' ? (
                <div className="mt-3">
                  <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-brass"><Icon name="help" className="h-3.5 w-3.5" /> Petunjuk HANIF</p>
                  <p className="mt-1.5 text-[10.5px] leading-relaxed text-parchment/55">{chapter.challenge.hint}</p>
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2">
                    <p className="text-[9px] text-parchment/45">Dokumen benar</p>
                    <p className="text-xs font-bold text-brass">{ARCHIVE_STATEMENTS.filter((s) => archiveResults[s.id]?.correct).length}/{ARCHIVE_STATEMENTS.length}</p>
                  </div>
                  <p className="mt-2.5 rounded-lg border border-brass/20 bg-brass/[0.06] p-2 text-[9px] leading-relaxed text-parchment/50">Setiap dokumen benar bernilai +10 skor pengetahuan. Kesalahan tidak mengakhiri permainan.</p>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-brass">{ARCHIVE_INFO.title}</p>
                  <p className="mt-1.5 text-[9.5px] leading-relaxed text-parchment/55">{ARCHIVE_INFO.definition}</p>
                  <div className="mt-3">
                    <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-parchment/40">Syarat umum</p>
                    <ul className="mt-1 space-y-1">
                      {ARCHIVE_INFO.general.map((g) => <li key={g} className="flex gap-1.5 text-[9px] leading-snug text-parchment/55"><span className="text-brass">•</span>{g}</li>)}
                    </ul>
                  </div>
                  <div className="mt-2.5">
                    <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-parchment/40">Syarat khusus</p>
                    <ul className="mt-1 space-y-1">
                      {ARCHIVE_INFO.special.map((g) => <li key={g} className="flex gap-1.5 text-[9px] leading-snug text-parchment/55"><span className="text-brass">•</span>{g}</li>)}
                    </ul>
                  </div>
                  <p className="mt-2.5 rounded-lg border border-brass/20 bg-brass/[0.06] p-2 text-[8.5px] leading-relaxed text-parchment/45">{ARCHIVE_INFO.source} {ARCHIVE_INFO.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={modal === 'hanif'} onClose={() => setModal(null)} size="md">
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 pr-8">
            <div className="flex items-center gap-2.5"><HanifAvatar size="h-11 w-11" /><div><p className="text-[10px] font-bold text-parchment">HANIF</p><p className="text-[8px] uppercase tracking-[0.14em] text-brass/70">Pemandu perjalananmu</p></div></div>
            <span className="rounded-full border border-brass/25 bg-brass/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-brass">Babak {chapter.n}</span>
          </div>
          <GoldDivider className="my-3.5" />
          <div className="rounded-xl border border-brass/20 bg-brass/[0.05] p-3.5">
            <p className="text-[12px] leading-relaxed text-parchment/80">
              {chapter.n === 5
                ? '“Kita sudah sampai di akhir perjalanan. Sebelum melihat ending, lihatlah bendera di puncak bukit. Perjuangan hari ini adalah melanjutkan kebaikan mereka.”'
                : chapter.n === 4
                  ? '“Rumah Arsip berada tak jauh dari sini. Dekati meja arsip bercahaya, lalu tekan tombol Interaksi untuk memeriksa dokumen.”'
                  : chapter.n === 2
                    ? `“${featured.name} menunggumu di pendopo. Dekati lingkaran cahaya di sekitar beliau, lalu tekan Interaksi untuk mendengarkan kisahnya.”`
                    : challengeReady
                      ? '“Semua jejak sudah kamu temukan. Ilmu yang kamu dapat siap diuji. Mau mencoba tantangannya sekarang?”'
                      : `“Kamu sudah menemukan ${foundInChapter.length} dari ${chapter.items.length} jejak. ${readyNotice} Ingat, benda bercahaya emas ada di sekitar ${chapter.location.toLowerCase()}.”`}
            </p>
          </div>
          <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.035] p-2.5">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-brass/75">Tujuan misi</p>
            <p className="mt-0.5 text-[10.5px] leading-relaxed text-parchment/65">{chapter.objective}</p>
          </div>
          <div className="mt-3.5 flex flex-col gap-2 sm:flex-row">
            <GhostButton onClick={() => setModal(null)} className="sm:w-28">Tutup</GhostButton>
            {(chapter.n === 1 || chapter.n === 3) && challengeReady && (
              <PrimaryButton onClick={() => { setQuizSolved(false); setModal('quiz'); }} icon="spark" className="flex-1">Mulai Tantangan</PrimaryButton>
            )}
            {chapter.n === 4 && <PrimaryButton onClick={() => setModal(null)} icon="map" className="flex-1">Cari Rumah Arsip</PrimaryButton>}
            {chapter.n === 2 && <PrimaryButton onClick={() => setModal(null)} icon="gallery" className="flex-1">Temui {featured.name.split(' ').slice(-1)[0]}</PrimaryButton>}
            {chapter.n === 5 && <PrimaryButton onClick={() => setModal('final')} icon="flag" className="flex-1">Menuju Bendera</PrimaryButton>}
          </div>
        </div>
      </Modal>

      <Modal open={modal === 'final'} onClose={() => setModal(null)} size="md" dismissable={false}>
        <div className="relative">
          <div className="relative h-32 overflow-hidden">
            <img src="images/ending-sunrise.jpg" alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a2422] via-[#0a2422]/30 to-transparent" />
            <div className="absolute bottom-3 left-5"><p className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-brass-light">Ending · {path.title}</p><p className="display text-2xl font-semibold text-parchment">{path.ending.title}</p></div>
          </div>
          <div className="p-5">
            <p className="text-[11.5px] leading-relaxed text-parchment/60">Bendera berkibar di puncak bukit. HANIF berdiri di sampingmu, memandang matahari terbit.</p>
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-brass/25 bg-brass/[0.06] p-3">
              <HanifAvatar size="h-12 w-12" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brass">HANIF</p>
                <p className="mt-1 text-[12px] leading-relaxed text-parchment/85">“{path.ending.hanif}”</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.035] p-2.5">
              <Icon name="flag" className="mt-0.5 h-4 w-4 shrink-0 text-crimson-light" />
              <p className="text-[10px] leading-relaxed text-parchment/55">{path.ending.narration} <span className="font-semibold text-parchment/80">{path.ending.moral}</span></p>
            </div>
            <div className="mt-3.5 flex flex-col gap-2 sm:flex-row">
              <GhostButton onClick={() => setModal(null)} className="sm:w-28">Kembali</GhostButton>
              <PrimaryButton onClick={() => { audio.sfx('complete'); events.onFinish(); }} icon="flag" className="flex-1">Saksikan Ending</PrimaryButton>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={modal === 'journal'} onClose={() => setModal(null)} size="lg">
        <div className="max-h-[90vh] overflow-y-auto scroll-thin p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2 pr-8">
            <div><SectionLabel>Jurnal Perjalanan</SectionLabel><h2 className="display mt-1 text-2xl font-semibold text-parchment">{path.title}</h2></div>
            <span className="rounded-full border border-brass/25 bg-brass/10 px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.12em] text-brass">Babak {chapter.n} / 5</span>
          </div>
          <GoldDivider className="my-3.5" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3.5">
              <p className="text-[8.5px] font-bold uppercase tracking-[0.15em] text-brass">Misi saat ini</p>
              <p className="mt-1 text-[11.5px] font-semibold text-parchment/88">{chapter.objective}</p>
              <div className="mt-2.5 space-y-1.5">
                {chapter.items.length === 0 && <p className="flex items-center gap-1.5 text-[10px] text-parchment/55"><Icon name="pin" className="h-3.5 w-3.5 text-brass" /> {readyNotice}</p>}
                {chapter.items.map((item) => {
                  const done = progress.foundItems.includes(item.id);
                  return <p key={item.id} className={cn('flex items-center gap-1.5 text-[10px]', done ? 'text-emerald-200/80' : 'text-parchment/55')}><Icon name={done ? 'check' : 'scroll'} className="h-3.5 w-3.5 shrink-0 text-brass/80" /> {item.name}</p>;
                })}
              </div>
              {(chapter.n === 1 || chapter.n === 3) && challengeReady && !quizSolved && <PrimaryButton onClick={() => { setModal('quiz'); setQuizSolved(false); }} icon="spark" className="mt-3 w-full !min-h-9 !text-[10px]">Mulai tantangan HANIF</PrimaryButton>}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3.5">
              <p className="text-[8.5px] font-bold uppercase tracking-[0.15em] text-brass">Pilihan perjalananmu</p>
              {Object.keys(progress.choices).length === 0 ? <p className="mt-1.5 text-[10px] leading-relaxed text-parchment/40">Belum ada pilihan yang dicatat. Keputusanmu di Babak III akan muncul di sini.</p> : (
                <div className="scroll-thin mt-1.5 max-h-[130px] space-y-1.5 overflow-y-auto pr-1">
                  {Object.entries(progress.choices).map(([key, value]) => (
                    <p key={key} className="flex items-start gap-1.5 text-[9.5px] leading-relaxed text-parchment/60"><Icon name="chevron" className="mt-0.5 h-3 w-3 shrink-0 text-brass/70" /> {value}</p>
                  ))}
                </div>
              )}
              <GoldDivider className="my-2.5" />
              <div className="flex items-center justify-between">
                <p className="text-[8.5px] font-bold uppercase tracking-[0.15em] text-brass">Pahlawan ditemui</p>
                <button type="button" onClick={() => setModal(null)} className="text-[9px] text-parchment/40">Tutup</button>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {progress.heroesMet.length === 0 ? <p className="text-[10px] text-parchment/40">{heroMet ? featured.name : 'Belum ada. Temui tokoh sejarah!'}</p> : progress.heroesMet.map((id) => (
                  <div key={id} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] py-0.5 pl-0.5 pr-2"><HeroPortrait hero={id} mode="thumb" className="h-5 w-5 rounded-full" /><span className="text-[8.5px] text-parchment/60">{HEROES[id].name.split(' ').slice(-1)[0]}</span></div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-center"><p className="text-[8px] uppercase tracking-[0.1em] text-parchment/35">Skor</p><p className="display text-lg text-brass-light">{progress.score}</p></div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-center"><p className="text-[8px] uppercase tracking-[0.1em] text-parchment/35">Misi</p><p className="display text-lg text-brass-light">{progress.missionsDone}/5</p></div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-center"><p className="text-[8px] uppercase tracking-[0.1em] text-parchment/35">Benar</p><p className="display text-lg text-brass-light">{progress.correct}/{progress.answered}</p></div>
          </div>
          <div className="mt-3 rounded-xl border border-brass/20 bg-brass/[0.05] p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-brass">Catatan HANIF</p>
            <p className="mt-1 text-[10px] leading-relaxed text-parchment/55">Perjuangan bangsa Indonesia dilakukan melalui banyak cara. Keberanian, pendidikan, dan persatuan adalah tiga di antaranya. Setiap pilihan yang kamu ambil menambah pengalaman belajar — bukan mengubah fakta sejarah.</p>
          </div>
        </div>
      </Modal>

      <Modal open={modal === 'pause'} onClose={() => setModal(null)} size="sm">
        <div className="p-5">
          <div className="flex flex-col items-center text-center">
            <CompassMark className="h-12 w-12" />
            <p className="mt-2 text-[8.5px] font-bold uppercase tracking-[0.2em] text-brass">Jeda Permainan</p>
            <h2 className="display mt-1 text-2xl font-semibold text-parchment">{path.title}</h2>
            <p className="text-[10px] text-parchment/45">Babak {chapter.n} · {chapter.title} · Skor {progress.score}</p>
          </div>
          <div className="mt-4 space-y-2">
            <PrimaryButton onClick={() => setModal(null)} icon="play" className="w-full">Lanjutkan Petualangan</PrimaryButton>
            <GhostButton onClick={() => setModal('journal')} icon="book" className="w-full !justify-start">Jurnal Perjalanan</GhostButton>
            <GhostButton onClick={() => { setModal(null); openGalleryOverlay(); }} icon="gallery" className="w-full !justify-start">Galeri Pahlawan</GhostButton>
            <GhostButton onClick={() => setShowSettings(true)} icon="settings" className="w-full !justify-start">Pengaturan suara</GhostButton>
            <button type="button" onClick={() => { audio.sfx('click'); events.onExit(); }} className="flex w-full items-center gap-2 rounded-xl border border-white/12 px-4 py-2.5 text-xs font-semibold text-parchment/60 transition hover:border-red-300/35 hover:text-red-200"><Icon name="back" className="h-4 w-4" /> Simpan & kembali ke menu</button>
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[8.5px] text-parchment/30"><Icon name="save" className="h-3 w-3" /> Progres tersimpan otomatis</p>
        </div>
      </Modal>

      {showGallery && (
        <div className="absolute inset-0 z-[60] overflow-y-auto bg-[#061817]">
          <GalleryScreen progress={progress} onBack={closeEverything} />
        </div>
      )}
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} settings={settings} onChange={events.onChangeSettings} />
    </div>
  );
}

export { GalleryScreen };
export default GameScreen;
