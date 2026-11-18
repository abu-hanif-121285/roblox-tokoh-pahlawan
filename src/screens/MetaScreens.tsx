import { useMemo, useState } from 'react';
import { ALL_HERO_IDS, GUIDE_STEPS, HEROES, MAX_SCORE, PATHS, PATH_LIST, getRank, type HeroId, type PathId } from '../data/content';
import type { Progress, Settings } from '../lib/save';
import { audio } from '../lib/audio';
import { cn } from '../utils/cn';
import { CompassMark, GhostButton, GoldDivider, HanifAvatar, HeroPortrait, Icon, IconButton, Modal, PrimaryButton, SectionLabel } from '../components/ui';

export function EndingScreen({ progress, onReplay, onChoosePath, onMenu, onGallery }: {
  progress: Progress;
  onReplay: () => void;
  onChoosePath: () => void;
  onMenu: () => void;
  onGallery: () => void;
}) {
  const path = progress.pathId ? PATHS[progress.pathId] : PATHS.pejuang;
  const rank = getRank(progress.score, MAX_SCORE, progress.missionsDone);
  const percent = progress.answered ? Math.round((progress.correct / progress.answered) * 100) : 0;
  const scoreRatio = Math.min(100, Math.round((progress.score / MAX_SCORE) * 100));
  const metHeroes = progress.heroesMet.length ? progress.heroesMet : [path.featuredHero];
  const choices = Object.keys(progress.choices).length;

  return (
    <div className="noise relative min-h-screen overflow-x-hidden bg-[#051615]">
      <div className="relative h-[42vh] min-h-[280px] w-full overflow-hidden sm:h-[48vh]">
        <img src="/images/ending-sunrise.jpg" alt="Matahari terbit di atas bukit Nusantara" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#051615] via-[#051615]/45 to-[#041414]/55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,224,158,.28),transparent_50%)]" />
        <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <div className="flex items-center gap-2.5"><CompassMark className="h-9 w-9" /><span className="display text-sm font-semibold tracking-wide text-parchment/90">JEJAK SANG PAHLAWAN</span></div>
          <button type="button" onClick={onMenu} className="flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3.5 py-2 text-[10px] font-semibold text-parchment/75 backdrop-blur transition hover:border-brass/50 hover:text-brass"><Icon name="back" className="h-3.5 w-3.5" /> Menu utama</button>
        </header>
        <div className="absolute inset-x-0 bottom-6 px-5 text-center sm:bottom-8">
          <p className="mx-auto w-fit rounded-full border border-brass/45 bg-black/35 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.24em] text-brass-light backdrop-blur-md">{path.ending.kicker}</p>
          <h1 className="display mx-auto mt-3 max-w-3xl text-[38px] font-semibold leading-[0.98] text-parchment text-shadow sm:text-[56px]">{path.ending.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-[12px] leading-relaxed text-parchment/70 sm:text-[13px]">{path.ending.narration}</p>
        </div>
      </div>

      <main className="relative z-10 mx-auto -mt-2 grid w-full max-w-6xl gap-4 px-5 pb-10 sm:px-8 lg:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-4">
          <div className="glass animate-rise rounded-2xl border border-brass/25 p-5">
            <div className="flex items-start gap-3.5">
              <HanifAvatar size="h-14 w-14" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-bold text-parchment">HANIF</p>
                  <span className="rounded-full border border-brass/30 bg-brass/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-brass">Sahabat perjalananmu</span>
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-parchment/85">“{path.ending.hanif}”</p>
              </div>
            </div>
            <GoldDivider className="my-4" />
            <div className="flex items-start gap-3 rounded-xl border border-brass/25 bg-brass/[0.07] p-3.5">
              <Icon name="star" className="mt-0.5 h-5 w-5 shrink-0 text-brass" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brass/85">Pesan untuk generasi penerus</p>
                <p className="display mt-1 text-lg font-medium leading-snug text-parchment">{path.ending.moral}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl border border-white/12 p-5">
            <div className="flex items-center justify-between gap-3">
              <SectionLabel>Ringkasan perjalanan</SectionLabel>
              <span className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.14em] text-parchment/50">{path.title}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                { icon: 'flag', value: `${progress.missionsDone}/5`, label: 'Misi selesai' },
                { icon: 'gallery', value: `${metHeroes.length}`, label: 'Tokoh ditemui' },
                { icon: 'scroll', value: `${progress.foundItems.length}`, label: 'Jejak ditemukan' },
                { icon: 'heart', value: `${choices}`, label: 'Pilihan dibuat' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <Icon name={s.icon} className="h-4 w-4 text-brass/85" />
                  <p className="display mt-1.5 text-xl font-semibold leading-none text-parchment">{s.value}</p>
                  <p className="mt-1 text-[8.5px] uppercase tracking-[0.12em] text-parchment/38">{s.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-parchment/50">
              Perjalananmu menempuh {progress.missionsDone} dari 5 babak. Setiap tokoh dan pilihan telah menambah pemahamanmu tentang beragam jalan perjuangan bangsa.
            </p>
            <div className="mt-3.5 flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-parchment/35">Galeri yang terbuka</p>
              <button type="button" onClick={onGallery} className="flex items-center gap-1.5 text-[10px] font-semibold text-brass transition hover:text-brass-light">Buka galeri <Icon name="chevron" className="h-3.5 w-3.5" /></button>
            </div>
            <div className="scroll-thin mt-2 flex gap-2 overflow-x-auto pb-1">
              {metHeroes.map((id) => (
                <div key={id} className="w-[64px] shrink-0">
                  <HeroPortrait hero={id} mode="thumb" className="h-16 w-16 rounded-lg border border-brass/20" />
                  <p className="mt-1 truncate text-center text-[8px] text-parchment/45">{HEROES[id as HeroId]?.name.split(' ')[0]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-[1.3fr_1fr]">
            <PrimaryButton onClick={() => { audio.sfx('click'); onReplay(); }} icon="continue" className="w-full">MAIN ULANG JALUR INI</PrimaryButton>
            <GhostButton onClick={() => { audio.sfx('click'); onChoosePath(); }} icon="compass" className="w-full">PILIH JALUR LAIN</GhostButton>
          </div>
          <div className="flex items-center justify-between px-1 text-[10px]">
            <button type="button" onClick={onMenu} className="flex items-center gap-1.5 text-parchment/40 transition hover:text-brass"><Icon name="back" className="h-3.5 w-3.5" /> Kembali ke menu</button>
            <p className="text-parchment/25">Tiga jalan, satu tujuan: Indonesia Merdeka.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass animate-rise rounded-2xl border border-brass/30 p-5 text-center">
            <SectionLabel className="justify-center">Pencapaian</SectionLabel>
            <div className="relative mx-auto mt-4 flex h-[132px] w-[132px] items-center justify-center rounded-full" style={{ background: `conic-gradient(#d9ac5c ${scoreRatio}%, rgba(255,255,255,.09) ${scoreRatio}% 100%)` }}>
              <div className="flex h-[116px] w-[116px] flex-col items-center justify-center rounded-full bg-[#0a2523]">
                <p className="display text-4xl font-semibold leading-none text-brass-light">{progress.score}</p>
                <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-parchment/40">Skor pengetahuan</p>
                <div className="mt-1 rounded-full bg-white/5 px-2 py-0.5 text-[8px] text-parchment/40">{scoreRatio}% dari {MAX_SCORE}</div>
              </div>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-brass/40 bg-brass/10 px-3.5 py-1.5">
              <Icon name="star" className="h-3.5 w-3.5 text-brass" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-brass-light">{rank.title}</span>
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed text-parchment/55">{rank.description}</p>
            <GoldDivider className="my-4" />
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <p className="display text-xl font-semibold text-parchment">{percent}%</p>
                <p className="mt-0.5 text-[8.5px] uppercase tracking-[0.12em] text-parchment/40">Jawaban benar</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <p className="display text-xl font-semibold text-parchment">{progress.correct}/{progress.answered}</p>
                <p className="mt-0.5 text-[8.5px] uppercase tracking-[0.12em] text-parchment/40">Pertanyaan</p>
              </div>
            </div>
            <p className="mt-2.5 text-[9px] leading-relaxed text-parchment/30">Skor tidak membatasi akses ending. Semua penjelajah dapat menyelesaikan cerita.</p>
          </div>

          <div className="glass rounded-2xl border border-white/12 p-4">
            <div className="flex items-center justify-between">
              <SectionLabel>Lencana ending</SectionLabel>
              <span className="text-[8.5px] uppercase tracking-[0.12em] text-parchment/30">Terbuka</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-brass/40 bg-gradient-to-br from-brass/30 to-brass/5 text-brass"><Icon name="flag" className="h-6 w-6" /></div>
              <div>
                <p className="text-xs font-bold text-parchment">{path.ending.badge}</p>
                <p className="text-[9.5px] text-parchment/45">{path.ending.title}</p>
                <p className="mt-1 text-[8.5px] text-parchment/30">Disimpan otomatis di galeri perjalananmu</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brass/70">Tentang akurasi materi</p>
            <p className="mt-1.5 text-[10px] leading-relaxed text-parchment/40">Dialog dalam permainan adalah dramatisasi edukatif, bukan kutipan langsung tokoh sejarah. Kriteria Pahlawan Nasional disarikan dari UU No. 20 Tahun 2009 tentang Gelar, Tanda Jasa, dan Tanda Kehormatan.</p>
          </div>
          <p className="text-center text-[10px] font-semibold text-parchment/35">Created by <span className="text-brass/80">Wiyanto Abu Hanif</span></p>
        </div>
      </main>
    </div>
  );
}

export function GalleryScreen({ progress, onBack }: { progress: Progress; onBack: () => void }) {
  const [filter, setFilter] = useState<'all' | PathId>('all');
  const [selected, setSelected] = useState<HeroId | null>(null);
  const met = new Set<HeroId>([...progress.heroesMet]);
  if (progress.pathId) met.add(PATHS[progress.pathId].featuredHero);
  const list = useMemo(() => ALL_HERO_IDS.filter((id) => (filter === 'all' ? true : HEROES[id].pathIds.includes(filter))), [filter]);
  const openedCount = ALL_HERO_IDS.filter((id) => met.has(id)).length;

  return (
    <div className="noise relative min-h-screen overflow-x-hidden bg-[#061817]">
      <div className="absolute inset-0 batik opacity-30" />
      <div className="absolute -left-28 top-0 h-[400px] w-[400px] rounded-full bg-brass/10 blur-[120px]" />
      <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <button type="button" onClick={() => { audio.sfx('click'); onBack(); }} className="flex items-center gap-2 text-[11px] font-semibold text-parchment/60 transition hover:text-brass"><Icon name="back" className="h-4 w-4" /> Kembali</button>
        <div className="flex items-center gap-2.5"><CompassMark className="h-8 w-8" /><span className="display hidden text-sm font-semibold tracking-wide text-parchment sm:block">JEJAK SANG PAHLAWAN</span></div>
        <div className="flex items-center gap-2 rounded-full border border-brass/30 bg-brass/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-brass-light"><Icon name="gallery" className="h-3.5 w-3.5" /> {openedCount}/{ALL_HERO_IDS.length} terbuka</div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-12 pt-2 sm:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel>Koleksi Kenangan</SectionLabel>
            <h1 className="display mt-2 text-[32px] font-semibold leading-tight text-parchment sm:text-[42px]">Galeri <span className="gold-text">Pahlawan</span></h1>
            <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-parchment/55">Setiap tokoh yang kamu temui akan tersimpan di sini. Pelajari kembali riwayat, bentuk perjuangan, jasa, dan pengorbanan mereka.</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[{ id: 'all' as const, label: 'Semua' }, ...PATH_LIST.map((p) => ({ id: p.id, label: p.title }))].map((f) => (
              <button key={f.id} type="button" onClick={() => { audio.sfx('click'); setFilter(f.id); }} className={cn('rounded-full border px-3 py-1.5 text-[10px] font-semibold transition', filter === f.id ? 'border-brass/60 bg-brass/15 text-brass-light' : 'border-white/12 bg-white/[0.03] text-parchment/50 hover:border-brass/35')}>{f.label}</button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((id) => {
            const hero = HEROES[id];
            const unlocked = met.has(id);
            return (
              <button key={id} type="button" onClick={() => { if (unlocked) { audio.sfx('open'); setSelected(id); } else audio.sfx('wrong'); }} className={cn('group relative overflow-hidden rounded-2xl border border-white/12 bg-[#0a2422] text-left transition duration-300', unlocked ? 'hover:-translate-y-1 hover:border-brass/55' : 'cursor-default')}>
                <div className="relative h-[190px] overflow-hidden">
                  <HeroPortrait hero={hero} mode="card" locked={!unlocked} className="h-full w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a2422] via-[#0a2422]/20 to-transparent" />
                  <span className="absolute right-2.5 top-2.5 rounded-md border border-brass/30 bg-black/40 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-brass/90">{hero.years}</span>
                </div>
                <div className="relative -mt-8 px-4 pb-3.5">
                  <div className="flex items-center gap-2">
                    <p className="display text-lg font-semibold leading-tight text-parchment">{hero.name}</p>
                    {unlocked && <Icon name="check" className="h-4 w-4 shrink-0 rounded-full bg-brass/20 p-0.5 text-brass" />}
                  </div>
                  <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-brass/70">{hero.origin}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {hero.pathIds.map((p) => (
                      <span key={p} className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[8px] font-medium text-parchment/55">{PATHS[p].title}</span>
                    ))}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between border-t border-white/8 pt-2.5">
                    <p className="truncate pr-2 text-[10px] text-parchment/42">{unlocked ? hero.form : 'Temui dalam petualangan'}</p>
                    {unlocked ? <Icon name="chevron" className="h-4 w-4 shrink-0 text-brass transition group-hover:translate-x-1" /> : <Icon name="lock" className="h-3.5 w-3.5 shrink-0 text-parchment/35" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-5 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-[10px] leading-relaxed text-parchment/40">
          <Icon name="scroll" className="mt-0.5 h-4 w-4 shrink-0 text-brass/60" />
          Ilustrasi pahlawan bersifat representatif dan bukan foto asli. Ringkasan biografi disusun dari sumber sejarah umum. Kriteria gelar Pahlawan Nasional disarikan dari UU No. 20 Tahun 2009 tentang Gelar, Tanda Jasa, dan Tanda Kehormatan.
        </p>
      </main>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} size="lg">
        {selected && (() => {
          const hero = HEROES[selected];
          return (
            <div className="grid max-h-[88vh] grid-cols-1 overflow-y-auto scroll-thin sm:grid-cols-[240px_1fr]">
              <div className="relative sm:min-h-full">
                <HeroPortrait hero={hero} mode="dialog" className="h-[250px] w-full sm:h-full" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a2422] to-transparent px-4 pb-4 pt-10 sm:hidden">
                  <p className="display text-2xl font-semibold text-parchment">{hero.name}</p>
                  <p className="text-[9px] uppercase tracking-[0.14em] text-brass/80">{hero.years} · {hero.origin}</p>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="pr-8">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brass/85">Pahlawan Nasional · {hero.origin}</p>
                  <h2 className="display mt-1 text-[26px] font-semibold leading-tight text-parchment sm:text-[30px]">{hero.name}</h2>
                  <p className="mt-1 text-[10.5px] text-parchment/45">{hero.fullName} · {hero.years}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-brass/30 bg-brass/10 px-2.5 py-1 text-[8.5px] font-semibold text-brass-light">{hero.form}</span>
                  {hero.pathIds.map((p) => <span key={p} className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[8.5px] text-parchment/55">{PATHS[p].title}</span>)}
                </div>
                <GoldDivider className="my-3.5" />
                <div className="space-y-3">
                  {[
                    { label: 'Riwayat perjuangan', value: hero.struggle },
                    { label: 'Jasa bagi Indonesia', value: hero.service },
                    { label: 'Pengorbanan', value: hero.sacrifice },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-brass/70">{item.label}</p>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-parchment/72">{item.value}</p>
                    </div>
                  ))}
                  <div className="rounded-xl border border-brass/25 bg-brass/[0.06] p-3">
                    <p className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.16em] text-brass"><Icon name="spark" className="h-3.5 w-3.5" /> Fakta menarik</p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-parchment/75">{hero.fact}</p>
                  </div>
                </div>
                <p className="mt-3 text-[9px] leading-relaxed text-parchment/30">Ilustrasi representatif, bukan foto asli. Materi bersifat edukatif untuk siswa kelas 6 SD.</p>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

export function GuideModal({ open, onClose, onStart }: { open: boolean; onClose: () => void; onStart?: () => void }) {
  const [tab, setTab] = useState<'main' | 'belajar'>('main');
  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div className="p-5 sm:p-6">
        <div className="pr-10">
          <SectionLabel>Panduan Penjelajah</SectionLabel>
          <h2 className="display mt-1.5 text-[26px] font-semibold leading-tight text-parchment sm:text-[30px]">Cara memainkan <span className="gold-text">Jejak Sang Pahlawan</span></h2>
        </div>
        <div className="mt-4 flex gap-1.5">
          {[{ id: 'main' as const, label: 'Cara bermain' }, { id: 'belajar' as const, label: 'Tujuan belajar' }].map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={cn('rounded-full border px-3.5 py-1.5 text-[10px] font-semibold transition', tab === t.id ? 'border-brass/55 bg-brass/15 text-brass-light' : 'border-white/10 bg-white/[0.03] text-parchment/50')}>{t.label}</button>
          ))}
        </div>
        {tab === 'main' ? (
          <div className="scroll-thin mt-4 max-h-[48vh] overflow-y-auto pr-1">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {GUIDE_STEPS.map((step, i) => (
                <div key={step.title} className="rounded-xl border border-white/10 bg-white/[0.035] p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brass/30 bg-brass/10 text-brass"><Icon name={step.icon} className="h-4 w-4" /></div>
                    <p className="text-xs font-bold text-parchment">{i + 1}. {step.title}</p>
                  </div>
                  <p className="mt-2 text-[10.5px] leading-relaxed text-parchment/55">{step.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-brass/20 bg-brass/[0.05] p-3.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brass">Kontrol permainan</p>
              <div className="mt-2 grid gap-x-6 gap-y-1.5 text-[10.5px] text-parchment/60 sm:grid-cols-2">
                <p><span className="block font-semibold text-parchment/85">Komputer</span>WASD / panah untuk berjalan, Shift untuk lari, Space untuk lompat, dan E untuk interaksi. Seret mouse atau tahan J / L untuk mengorbit 360°. Gunakan roda mouse untuk zoom dan C untuk memusatkan kamera.</p>
                <p><span className="block font-semibold text-parchment/85">HP / tablet</span>Gerakkan joystick dengan satu ibu jari sambil mengusap dunia 3D dengan jari lain untuk memutar kamera. Cubit dengan dua jari untuk zoom. Tombol Kamera 360° di bawah peta menyediakan putaran penuh dan Pusatkan.</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <HanifAvatar size="h-9 w-9" />
              <p className="text-[10.5px] leading-relaxed text-parchment/55"><span className="font-semibold text-parchment/85">TIP HANIF:</span> “Jika bingung, tekan tombol Tanya HANIF. Aku akan menunjukkan tujuan berikutnya. Jangan takut mencoba lagi — setiap penjelajah belajar dari perjalanannya.”</p>
            </div>
          </div>
        ) : (
          <div className="scroll-thin mt-4 max-h-[48vh] overflow-y-auto pr-1">
            <p className="rounded-xl border border-white/10 bg-white/[0.035] p-3.5 text-[11.5px] leading-relaxed text-parchment/65">Setelah menyelesaikan petualangan, siswa diharapkan mampu:</p>
            <div className="mt-2.5 space-y-2">
              {[
                'Memahami sejarah perjuangan bangsa Indonesia melalui pengalaman menjelajah.',
                'Menjelaskan pengertian Pahlawan Nasional dan kriteria pemberian gelarnya.',
                'Mengidentifikasi bentuk perjuangan dan jasa para pahlawan.',
                'Menghargai pengorbanan para pejuang dalam meraih kemerdekaan.',
                'Menyimpulkan bahwa perjuangan dapat ditempuh melalui berbagai jalan: keberanian, pendidikan, dan persatuan.',
              ].map((t, i) => (
                <div key={t} className="flex items-start gap-2.5 rounded-lg border border-white/8 bg-white/[0.025] p-2.5">
                  <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-brass/20 text-[8.5px] font-bold text-brass">{i + 1}</span>
                  <p className="text-[10.5px] leading-relaxed text-parchment/60">{t}</p>
                </div>
              ))}
            </div>
            <div className="mt-2.5 rounded-xl border border-brass/20 bg-brass/[0.05] p-3.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brass">Catatan untuk guru & orang tua</p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-parchment/55">Materi dalam permainan menggunakan bahasa sederhana untuk kelas 6 SD. Dialog tokoh adalah dramatisasi edukatif, bukan kutipan asli. Kriteria Pahlawan Nasional mengacu pada UU No. 20 Tahun 2009. Anda dapat mendampingi diskusi setelah permainan selesai.</p>
            </div>
          </div>
        )}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <GhostButton onClick={onClose} className="sm:w-28">Tutup</GhostButton>
          {onStart && <PrimaryButton onClick={onStart} icon="play" className="sm:w-auto">Mulai petualangan</PrimaryButton>}
        </div>
      </div>
    </Modal>
  );
}

export function SettingsModal({ open, onClose, settings, onChange, onReset }: { open: boolean; onClose: () => void; settings: Settings; onChange: (s: Settings) => void; onReset?: () => void }) {
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="p-5 sm:p-6">
        <div className="pr-10">
          <SectionLabel>Pengaturan</SectionLabel>
          <h2 className="display mt-1.5 text-2xl font-semibold text-parchment">Suara & pengalaman</h2>
        </div>
        <div className="mt-4 space-y-3.5">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] p-3">
            <div className="flex items-center gap-2.5">
              <Icon name={settings.muted ? 'muted' : 'volume'} className="h-4.5 w-4.5 text-brass" />
              <div>
                <p className="text-[11.5px] font-semibold text-parchment/90">Semua suara</p>
                <p className="text-[9px] text-parchment/40">Musik dan efek suara</p>
              </div>
            </div>
            <button type="button" role="switch" aria-checked={!settings.muted} onClick={() => onChange({ ...settings, muted: !settings.muted })} className={cn('relative h-6 w-11 rounded-full border transition', !settings.muted ? 'border-brass/60 bg-brass/40' : 'border-white/15 bg-white/10')}>
              <span className={cn('absolute top-0.5 h-4.5 w-4.5 rounded-full bg-parchment transition-all', !settings.muted ? 'left-[22px]' : 'left-0.5')} />
            </button>
          </div>
          {[
            { key: 'musicVolume' as const, label: 'Musik latar', value: settings.musicVolume, icon: 'music' },
            { key: 'sfxVolume' as const, label: 'Efek suara', value: settings.sfxVolume, icon: 'volume' },
          ].map((s) => (
            <div key={s.key} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-[11.5px] font-semibold text-parchment/90"><Icon name={s.icon} className="h-4 w-4 text-brass" /> {s.label}</p>
                <span className="text-[10px] font-semibold text-brass">{Math.round(s.value * 100)}%</span>
              </div>
              <input type="range" min={0} max={1} step={0.05} value={s.value} onChange={(e) => onChange({ ...settings, [s.key]: Number(e.target.value) })} className="range-track mt-2.5 w-full" aria-label={s.label} />
            </div>
          ))}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <p className="flex items-center gap-2 text-[10px] font-semibold text-parchment/70"><Icon name="save" className="h-3.5 w-3.5 text-brass/80" /> Progres tersimpan otomatis di perangkat ini.</p>
            {onReset && (
              <div className="mt-2">
                {confirmReset ? (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { onReset(); setConfirmReset(false); }} className="flex-1 rounded-lg border border-red-400/40 bg-red-900/30 px-2.5 py-1.5 text-[10px] font-semibold text-red-200">Ya, hapus progres</button>
                    <button type="button" onClick={() => setConfirmReset(false)} className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[10px] text-parchment/60">Batal</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirmReset(true)} className="flex items-center gap-1.5 text-[10px] font-semibold text-red-300/70 transition hover:text-red-300"><Icon name="close" className="h-3 w-3" /> Hapus progres perjalanan</button>
                )}
              </div>
            )}
          </div>
        </div>
        <GoldDivider className="my-4" />
        <div className="flex items-center justify-between">
          <p className="text-[9px] text-parchment/35">Created by Wiyanto Abu Hanif</p>
          <GhostButton onClick={onClose} className="!min-h-9 !px-4 !py-2 text-xs">Selesai</GhostButton>
        </div>
      </div>
    </Modal>
  );
}

export function ToggleSoundButton({ muted, onClick }: { muted: boolean; onClick: () => void }) {
  return <IconButton icon={muted ? 'muted' : 'music'} label={muted ? 'Nyalakan suara' : 'Matikan suara'} onClick={onClick} />;
}
