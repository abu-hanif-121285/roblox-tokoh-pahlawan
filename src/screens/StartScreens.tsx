import { useEffect, useMemo, useState } from 'react';
import { CameraPreview } from '../components/CameraPreview';
import { OrbitGlyph } from '../components/CameraControls';
import { HEROES, INTRO_DIALOGUE, PATH_LIST, PATHS, type PathData, type PathId } from '../data/content';
import type { Progress } from '../lib/save';
import { audio } from '../lib/audio';
import { cn } from '../utils/cn';
import { CompassMark, GhostButton, GoldDivider, HanifAvatar, HeroPortrait, Icon, IconButton, Modal, PrimaryButton, SectionLabel } from '../components/ui';

const CHAPTER_NAMES = ['Gerbang Sejarah', 'Bertemu Sang Pahlawan', 'Ujian Pengorbanan', 'Arsip Pahlawan Nasional', 'Warisan Perjuangan'];

export function MenuScreen({ progress, onStart, onContinue, onGallery, onGuide, onSettings, onToggleSound, muted }: {
  progress: Progress;
  onStart: () => void;
  onContinue: () => void;
  onGallery: () => void;
  onGuide: () => void;
  onSettings: () => void;
  onToggleSound: () => void;
  muted: boolean;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const save = Boolean(progress.pathId) && progress.updatedAt > 0;
  const path = progress.pathId ? PATHS[progress.pathId] : null;

  return (
    <div className="noise relative min-h-screen overflow-x-hidden bg-[#071a1a]">
      <img src="/images/museum-hero.jpg" alt="Museum sejarah dengan kompas tua yang bercahaya" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-95" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#041414] via-[#041414]/92 to-[#041414]/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#041414] via-transparent to-[#041414]/65" />
      <div className="absolute -left-32 top-1/3 h-[420px] w-[420px] rounded-full bg-brass/10 blur-[120px]" />
      <div className="absolute -right-20 top-0 h-[520px] w-[520px] rounded-full bg-[#1c7466]/20 blur-[100px]" />

      {previewOpen && <CameraPreview pathId={progress.pathId ?? 'pejuang'} onClose={() => setPreviewOpen(false)} />}

      <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <div className="flex items-center gap-3">
          <CompassMark className="h-10 w-10 sm:h-11 sm:w-11" />
          <div className="leading-none">
            <p className="display text-[15px] font-semibold tracking-wide text-parchment sm:text-lg">JEJAK <span className="text-brass">SANG PAHLAWAN</span></p>
            <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.24em] text-parchment/45 sm:text-[9px]">Petualangan Sejarah Nusantara</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-brass/25 bg-black/25 px-3 py-1.5 md:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-parchment/65">Edisi Sejarah Nusantara</span>
          </div>
          <IconButton icon={muted ? 'muted' : 'music'} label={muted ? 'Nyalakan suara' : 'Matikan suara'} onClick={onToggleSound} />
          <IconButton icon="settings" label="Pengaturan" onClick={onSettings} className="hidden sm:flex" />
          <IconButton icon="help" label="Petunjuk" onClick={onGuide} />
        </div>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-142px)] w-full max-w-7xl grid-cols-1 items-center gap-8 px-5 pb-6 pt-3 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-12 lg:px-10">
        <section className="max-w-xl animate-rise">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-brass/35 bg-brass/10 px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.2em] text-brass-light">Sejarah Interaktif 3D</span>
            <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-parchment/65">Kelas 6 SD</span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-parchment/65">
              <span className="inline-block h-2 w-3 overflow-hidden rounded-[1px]"><span className="block h-1/2 bg-[#c5352b]" /><span className="block h-1/2 bg-white" /></span>
              Indonesia
            </span>
          </div>

          <h1 className="display mt-4 text-[52px] font-semibold leading-[0.86] tracking-[-0.03em] text-parchment sm:text-[72px] lg:text-[84px]">
            <span className="block gold-text">JEJAK</span>
            <span className="block">SANG</span>
            <span className="block gold-text">PAHLAWAN</span>
          </h1>
          <p className="mt-4 max-w-md border-l-2 border-crimson/80 pl-4 text-[13px] font-semibold leading-relaxed text-parchment/85 sm:text-[15px]">
            Berbeda Jalan Perjuangan, Satu Tujuan: <span className="text-brass-light">Indonesia Merdeka!</span>
          </p>
          <p className="mt-3.5 max-w-md text-[13px] leading-relaxed text-parchment/58 sm:text-sm">
            Jelajahi dunia 3D, bertemu para pahlawan, dan ambil keputusan yang membentuk jalan ceritamu. Bersama <span className="font-semibold text-parchment">HANIF</span>, temukan makna pengorbanan dan persatuan bangsa.
          </p>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-[1.35fr_1fr]">
            <PrimaryButton onClick={() => { audio.sfx('click'); onStart(); }} icon="play" className="w-full !rounded-2xl !py-4">
              MULAI PETUALANGAN
            </PrimaryButton>
            <GhostButton onClick={() => { audio.sfx('click'); save ? onContinue() : onStart(); }} icon="continue" className={cn('w-full !rounded-2xl !py-4', !save && 'opacity-70')}>
              <span className="flex flex-col items-start leading-tight">
                <span>LANJUTKAN</span>
                <span className="text-[9.5px] font-medium text-parchment/50">{save ? `${path?.title} · Babak ${progress.chapter}` : 'Belum ada progres'}</span>
              </span>
            </GhostButton>
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-2.5">
            {[
              { icon: 'gallery', label: 'Galeri', sub: 'Pahlawan', action: onGallery },
              { icon: 'book', label: 'Petunjuk', sub: 'Cara main', action: onGuide },
              { icon: 'settings', label: 'Pengaturan', sub: 'Suara & audio', action: onSettings },
            ].map((item) => (
              <button key={item.label} type="button" onClick={() => { audio.sfx('click'); item.action(); }} className="group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2.5 text-left transition hover:border-brass/40 hover:bg-white/[0.07]">
                <Icon name={item.icon} className="h-4 w-4 shrink-0 text-brass/90" />
                <span className="min-w-0 leading-tight">
                  <span className="block truncate text-[11.5px] font-semibold text-parchment/90">{item.label}</span>
                  <span className="block truncate text-[9px] text-parchment/40">{item.sub}</span>
                </span>
              </button>
            ))}
          </div>

          <button type="button" onClick={() => { audio.sfx('open'); setPreviewOpen(true); }} className="mt-3 flex min-h-12 w-full items-center gap-3 rounded-xl border border-brass/25 bg-brass/[0.06] px-3.5 text-left sm:hidden">
            <OrbitGlyph className="h-6 w-6 text-brass" /><span className="flex-1 text-[12px] font-semibold text-parchment">Coba kamera 360°</span><span className="text-[9px] text-brass/80">Pratinjau dunia</span><Icon name="chevron" className="h-3.5 w-3.5 text-brass" />
          </button>

          <div className="mt-5 flex items-center gap-4 sm:gap-6">
            {[
              { value: '3', label: 'Jalur Cerita' },
              { value: '5', label: 'Babak Misi' },
              { value: '9', label: 'Pahlawan' },
              { value: '20–30', label: 'Menit' },
            ].map((s) => (
              <div key={s.label}>
                <p className="display text-[17px] font-semibold text-brass-light">{s.value}</p>
                <p className="text-[8.5px] uppercase tracking-[0.12em] text-parchment/38">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="relative mx-auto hidden w-full max-w-[390px] sm:block lg:max-w-none">
          <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-br from-brass/20 via-transparent to-[#14554e]/30 blur-2xl" />
          <div className="relative overflow-hidden rounded-[30px] border border-brass/35 bg-[#0b2523] shadow-[0_35px_90px_-25px_rgba(0,0,0,.9)]">
            <div className="relative h-[400px] overflow-hidden lg:h-[480px]">
              <img src="/images/hanif.jpg" alt="HANIF, pemandu petualangan sejarah" className="h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b2523] via-transparent to-[#041414]/35" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                <span className="flex items-center gap-2 rounded-full border border-brass/40 bg-black/35 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-brass-light backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-brass" /> Pemandu Petualangan
                </span>
                <button type="button" onClick={onGuide} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-parchment/80 backdrop-blur-md" aria-label="Tentang HANIF">
                  <Icon name="user" className="h-4 w-4" />
                </button>
              </div>
              <div className="absolute -right-4 top-24 h-24 w-24 opacity-90"><div className="animate-floaty"><CompassMark className="h-24 w-24" /></div></div>
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-brass/80">Sahabat Perjalananmu</p>
                <p className="display mt-1 text-4xl font-semibold text-parchment">HANIF</p>
                <p className="mt-1.5 max-w-[280px] text-[11.5px] leading-relaxed text-parchment/65">“Setiap pilihan akan membawa kita pada pengalaman yang berbeda.”</p>
              </div>
            </div>
            <div className="relative px-5 pb-5 pt-0">
              <button type="button" onClick={() => { audio.sfx('open'); setPreviewOpen(true); }} className="group mb-4 flex min-h-14 w-full items-center gap-3 rounded-xl border border-brass/35 bg-brass/[0.075] px-3.5 py-2.5 text-left transition hover:border-brass/70 hover:bg-brass/15" aria-label="Coba kamera 360 derajat di dunia 3D">
                <OrbitGlyph className="h-7 w-7 shrink-0 text-brass" />
                <span className="min-w-0 flex-1"><span className="block text-[8px] font-bold uppercase tracking-[0.18em] text-brass/80">Pratinjau dunia</span><span className="mt-0.5 block text-[13px] font-semibold text-parchment">Coba kamera 360°</span></span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-brass/35 text-brass-light transition group-hover:translate-x-0.5"><Icon name="arrow" className="h-3.5 w-3.5" /></span>
              </button>
              {save ? (
                <button type="button" onClick={onContinue} className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3 text-left transition hover:border-brass/45">
                  <HeroPortrait hero={progress.heroesMet[0] ?? path?.featuredHero ?? 'diponegoro'} mode="thumb" className="h-12 w-12 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brass/80">Lanjutkan perjalanan</p>
                    <p className="mt-0.5 truncate text-xs font-semibold text-parchment">{path?.title} · Babak {progress.chapter}</p>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-brass" style={{ width: `${(progress.chapter / 5) * 100}%` }} /></div>
                  </div>
                  <Icon name="chevron" className="h-4 w-4 shrink-0 text-brass transition group-hover:translate-x-1" />
                </button>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10.5px] leading-snug text-parchment/55"><span className="font-semibold text-parchment/85">Tujuan pembelajaran:</span> memahami jalan perjuangan dan jasa para pahlawan.</p>
                  <Icon name="scroll" className="h-5 w-5 shrink-0 text-brass/70" />
                </div>
              )}
            </div>
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-brass/30 bg-[#0a2321] px-4 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-parchment/50 whitespace-nowrap">Kurikulum Merdeka · IPAS</div>
        </aside>
      </main>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 pb-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <p className="text-[10px] text-parchment/35">© 2026 Jejak Sang Pahlawan. Media pembelajaran sejarah Indonesia.</p>
        <p className="text-[10px] font-semibold tracking-wide text-parchment/55">Created by <span className="text-brass">Wiyanto Abu Hanif</span></p>
      </div>
    </div>
  );
}

export function IntroScreen({ onFinish, onBack }: { onFinish: () => void; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const line = INTRO_DIALOGUE[Math.min(step, INTRO_DIALOGUE.length - 1)];
  const isLast = step >= INTRO_DIALOGUE.length - 1;

  useEffect(() => {
    if (step >= 1) setRevealed(true);
  }, [step]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (isLast) onFinish();
        else setStep((s) => Math.min(INTRO_DIALOGUE.length - 1, s + 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLast, onFinish]);

  const next = () => {
    audio.sfx('click');
    if (isLast) onFinish();
    else setStep((s) => Math.min(INTRO_DIALOGUE.length - 1, s + 1));
  };

  return (
    <div className="noise relative flex min-h-screen flex-col overflow-hidden bg-[#041414]">
      <img src="/images/museum-hero.jpg" alt="Museum sejarah di malam hari" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#041414] via-[#041414]/62 to-[#041414]/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_38%,rgba(217,172,92,.2),transparent_42%)]" />

      <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-[11px] font-semibold text-parchment/60 transition hover:text-brass">
          <Icon name="back" className="h-4 w-4" /> Menu utama
        </button>
        <div className="flex items-center gap-2">
          <CompassMark className="h-8 w-8" />
          <span className="display text-sm font-semibold tracking-wide text-parchment">JEJAK SANG PAHLAWAN</span>
        </div>
        <span className="rounded-full border border-brass/25 bg-black/25 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-parchment/55">Prolog</span>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-6 px-5 pb-5 pt-2 lg:grid-cols-[1.05fr_.95fr] lg:gap-10 lg:px-8">
        <div className={cn('relative transition-all duration-700', revealed ? 'opacity-100' : 'opacity-0 translate-y-4 lg:translate-x-6 lg:translate-y-0')}>
          <div className="relative mx-auto max-w-[330px] sm:max-w-[390px]">
            <div className="absolute -inset-8 rounded-full bg-brass/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-brass/40 bg-[#0a2422] shadow-[0_30px_80px_-20px_rgba(0,0,0,.95)]">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a2422] via-transparent to-transparent z-10" />
              <img src="/images/hanif.jpg" alt="HANIF muncul dari kompas tua" className="h-[360px] w-full object-cover object-top sm:h-[440px]" />
              <div className="absolute inset-x-0 top-0 z-20 flex justify-between p-4">
                <span className="rounded-full border border-brass/40 bg-black/40 px-3 py-1 text-[8.5px] font-bold uppercase tracking-[0.2em] text-brass-light backdrop-blur">Muncul dari kompas</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-brass/40 bg-black/40 text-brass"><Icon name="spark" className="h-3.5 w-3.5" /></span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.26em] text-brass/90">Pemandu Sejarah</p>
                <p className="display mt-0.5 text-3xl font-semibold text-parchment">HANIF</p>
                <p className="mt-1 text-[11px] text-parchment/55">Penjelajah muda · Sahabat perjalananmu</p>
              </div>
            </div>
            <div className="absolute -right-5 -bottom-5 h-20 w-20 animate-floaty"><CompassMark className="h-full w-full" /></div>
          </div>
        </div>

        <div className="max-w-xl">
          <SectionLabel>Prolog · Museum Sejarah</SectionLabel>
          <h1 className="display mt-2 text-[30px] font-semibold leading-tight text-parchment sm:text-[38px]">Sebuah kompas tua<br /><span className="gold-text">memilihmu.</span></h1>
          <p className="mt-2.5 max-w-md text-[12.5px] leading-relaxed text-parchment/55">
            Di sudut museum yang sunyi, kompas kuningan itu berdenyut hangat. Saat jarimu menyentuhnya, cahaya keemasan memenuhi ruangan — dan seorang pemandu muncul.
          </p>

          <div className="mt-4 overflow-hidden rounded-2xl border border-brass/30 bg-[#071e1d]/85 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
              <div className="flex items-center gap-2.5">
                {line.speaker === 'hanif' ? <HanifAvatar size="h-8 w-8" /> : <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-parchment"><Icon name="user" className="h-4 w-4" /></div>}
                <div>
                  <p className="text-xs font-bold text-parchment">{line.speaker === 'hanif' ? 'HANIF' : 'PENJELAJAH'}</p>
                  <p className="text-[8.5px] uppercase tracking-[0.15em] text-brass/70">{line.speaker === 'hanif' ? 'Pemandu petualangan' : 'Kamu'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {INTRO_DIALOGUE.map((_, i) => (
                  <button key={i} type="button" aria-label={`Dialog ${i + 1}`} onClick={() => setStep(i)} className={cn('h-1.5 rounded-full transition-all', i === step ? 'w-5 bg-brass' : i < step ? 'w-1.5 bg-brass/50' : 'w-1.5 bg-white/15')} />
                ))}
              </div>
            </div>
            <div className="px-4 py-4 sm:px-5">
              <p key={step} className="min-h-[54px] animate-fade text-[14px] leading-relaxed text-parchment/92 sm:text-[15.5px]">“{line.text}”</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[9px] leading-snug text-parchment/35">Dialog merupakan dramatisasi edukatif, bukan kutipan sejarah.</p>
                {isLast ? (
                  <PrimaryButton onClick={() => { audio.sfx('complete'); onFinish(); }} icon="play" className="shrink-0 !min-h-11 !rounded-xl !px-4 !py-2.5 !text-xs sm:!px-5">MULAI PETUALANGAN</PrimaryButton>
                ) : (
                  <button type="button" onClick={next} className="flex shrink-0 items-center gap-2 rounded-xl border border-brass/45 bg-brass/12 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brass-light transition hover:bg-brass/20">
                    Lanjut <Icon name="chevron" className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="flex items-center gap-1.5 text-[10px] text-parchment/35"><Icon name="scroll" className="h-3.5 w-3.5 text-brass/60" /> 20–30 menit · 3 jalur petualangan</p>
            <button type="button" onClick={() => { audio.sfx('click'); onFinish(); }} className="text-[10px] font-semibold text-parchment/40 underline decoration-parchment/20 underline-offset-4 transition hover:text-brass">Lewati cerita</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export function PathSelectScreen({ onSelect, onBack, current }: { onSelect: (id: PathId) => void; onBack: () => void; current: Progress }) {
  const [selected, setSelected] = useState<PathData | null>(null);
  const resumePath = current.pathId;
  const ordered = useMemo(() => PATH_LIST, []);

  return (
    <div className="noise relative min-h-screen overflow-x-hidden bg-[#061817]">
      <div className="absolute inset-0 batik opacity-40" />
      <div className="absolute -left-24 top-10 h-[380px] w-[380px] rounded-full bg-brass/10 blur-[110px]" />
      <div className="absolute -right-20 bottom-0 h-[360px] w-[360px] rounded-full bg-crimson/15 blur-[110px]" />

      <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-[11px] font-semibold text-parchment/60 transition hover:text-brass"><Icon name="back" className="h-4 w-4" /> Kembali</button>
        <div className="flex items-center gap-2.5"><CompassMark className="h-8 w-8" /><span className="display hidden text-sm font-semibold tracking-wide text-parchment sm:block">JEJAK SANG PAHLAWAN</span></div>
        <span className="rounded-full border border-brass/25 bg-black/25 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-parchment/55">Babak 01 · Pilih Jalur</span>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-10 pt-2 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel className="justify-center">Tiga Jalan · Satu Tujuan</SectionLabel>
          <h1 className="display mt-2 text-[32px] font-semibold leading-[1.03] text-parchment sm:text-[46px]">Jalan perjuangan mana yang<br /><span className="gold-text">akan kamu jelajahi?</span></h1>
          <p className="mx-auto mt-3 max-w-lg text-[12px] leading-relaxed text-parchment/55 sm:text-[13px]">Setiap jalan memiliki dunia, tokoh, tantangan, dan ending yang berbeda. Pilih satu dengan hati — kamu selalu dapat kembali dan mencoba jalan lainnya.</p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {ordered.map((path, idx) => {
            const isCurrent = resumePath === path.id;
            return (
              <div key={path.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#0a2322] shadow-[0_25px_60px_-30px_rgba(0,0,0,.9)] transition duration-300 hover:-translate-y-1.5 hover:border-brass/55" style={{ animationDelay: `${idx * 90}ms` }}>
                <div className="relative h-[186px] overflow-hidden">
                  <img src={path.image} alt={`Ilustrasi dunia jalur ${path.title}`} className="hero-card-img h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a2322] via-[#0a2322]/25 to-transparent" />
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className="rounded-lg border border-brass/40 bg-black/45 px-2.5 py-1 text-[11px] font-bold text-brass-light backdrop-blur">{path.no}</span>
                    {isCurrent && <span className="rounded-full border border-emerald-300/40 bg-emerald-900/50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-200">Sedang berjalan</span>}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: path.accentSoft }}>{path.theme}</p>
                    <h2 className="display mt-0.5 text-[27px] font-semibold leading-none text-parchment">{path.title}</h2>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-[11.5px] leading-relaxed text-parchment/55">{path.description}</p>
                  <div className="mt-3">
                    <p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-parchment/35">Tokoh yang akan kamu temui</p>
                    <div className="mt-2 flex -space-x-2">
                      {path.heroIds.map((id) => (
                        <div key={id} className="h-9 w-9 overflow-hidden rounded-full border-2 border-[#0a2322]" title={HEROES[id].name}>
                          <HeroPortrait hero={id} mode="thumb" className="h-full w-full" />
                        </div>
                      ))}
                      <div className="flex h-9 items-center rounded-full border-2 border-[#0a2322] bg-white/10 px-2 text-[8.5px] font-semibold text-parchment/60">{path.heroIds.length} tokoh</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[9px] font-medium text-parchment/40">
                    <Icon name="map" className="h-3.5 w-3.5 text-brass/70" /> 5 babak · ±20 menit · 1 ending
                  </div>
                  <button type="button" onClick={() => { audio.sfx('open'); setSelected(path); }} className="mt-3.5 flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition" style={{ borderColor: `${path.accent}80`, background: `${path.accent}1f`, color: path.accentSoft }}>
                    Pilih Jalur Ini
                    <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col items-start justify-between gap-3 rounded-2xl border border-brass/20 bg-brass/[0.05] px-4 py-3.5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <Icon name="compass" className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
            <p className="max-w-2xl text-[10.5px] leading-relaxed text-parchment/55"><span className="font-semibold text-parchment/85">Catatan sejarah:</span> tiga jalur ini adalah cara mengeksplorasi beragam bentuk perjuangan, bukan pengelompokan mutlak. Banyak tokoh berjuang melalui lebih dari satu jalan.</p>
          </div>
          <span className="flex shrink-0 items-center gap-2 text-[10px] font-semibold text-brass-light"><Icon name="flag" className="h-4 w-4" /> Indonesia Merdeka!</span>
        </div>
      </main>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} size="md">
        {selected && (
          <div>
            <div className="relative h-40 overflow-hidden sm:h-48">
              <img src={selected.image} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b2523] via-[#0b2523]/20 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brass-light">{selected.theme} · Jalur {selected.no}</p>
                <h2 className="display text-3xl font-semibold text-parchment">{selected.title}</h2>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start gap-3 rounded-xl border border-brass/20 bg-brass/[0.06] p-3">
                <HanifAvatar size="h-10 w-10" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brass">HANIF</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-parchment/75">
                    {selected.id === 'pejuang' && '“Kita akan menelusuri keberanian dan pengorbanan para pejuang. Siapkan hatimu, ya!”'}
                    {selected.id === 'pemikir' && '“Perjuangan tidak selalu lewat medan perang. Kali ini kita belajar dari pena dan gagasan!”'}
                    {selected.id === 'pemersatu' && '“Kita akan belajar menyatukan perbedaan. Perbedaan bukan alasan untuk terpecah!”'}
                  </p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-[8.5px] uppercase tracking-[0.14em] text-parchment/35">Tokoh utama</p>
                  <p className="mt-1 text-xs font-semibold text-parchment/90">{PATHS[selected.id].chapters[1] ? '1 tokoh kunci' : ''}</p>
                  <p className="mt-0.5 text-[10px] text-parchment/50">+ {selected.heroIds.length - 1} pahlawan di galeri</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-[8.5px] uppercase tracking-[0.14em] text-parchment/35">Ending</p>
                  <p className="mt-1 text-xs font-semibold text-parchment/90">{selected.ending.title}</p>
                  <p className="mt-0.5 text-[10px] text-parchment/50">Khusus jalur ini</p>
                </div>
              </div>
              <GoldDivider className="my-4" />
              <div className="flex flex-col gap-2 sm:flex-row">
                <GhostButton onClick={() => setSelected(null)} className="sm:w-32">Batal</GhostButton>
                <PrimaryButton onClick={() => { audio.sfx('complete'); onSelect(selected.id); }} className="flex-1" icon="play">Mulai Jalur {selected.title}</PrimaryButton>
              </div>
              <p className="mt-2.5 text-center text-[9px] text-parchment/30">Cerita, dialog, dan tantangan dirancang untuk pembelajaran sejarah siswa kelas 6 SD.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export { CHAPTER_NAMES };
