import { useEffect, useRef, useState } from 'react';
import { AdventureWorld } from '../game/world';
import { PATHS, type PathId } from '../data/content';
import { CameraControls, OrbitGlyph } from './CameraControls';
import { Icon, Modal, SectionLabel } from './ui';

/** A camera-only visit to the real game world. It never reads or writes mission events. */
export function CameraPreview({ pathId, onClose }: { pathId: PathId; onClose: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  const [world, setWorld] = useState<AdventureWorld | null>(null);
  const [failed, setFailed] = useState(false);
  close.current = onClose;
  const path = PATHS[pathId];

  useEffect(() => {
    let instance: AdventureWorld | undefined;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    section.current?.focus();
    const frame = requestAnimationFrame(() => {
      if (!host.current) return;
      try {
        instance = new AdventureWorld(host.current, {
          pathId, featuredHero: PATHS[pathId].featuredHero, chapter: 1,
          foundIds: [], paused: false, preview: true,
        }, { onNear() {}, onPosition() {}, onInteract() {} });
        setWorld(instance);
      } catch { setFailed(true); }
    });
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close.current(); }
      if (e.key !== 'Tab') return;
      const dialog = section.current?.closest('[role="dialog"]');
      const targets = dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]');
      if (!targets?.length) return;
      const first = targets[0], last = targets[targets.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === section.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', key);
    return () => {
      cancelAnimationFrame(frame);
      instance?.dispose();
      window.removeEventListener('keydown', key);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [pathId]);

  return <Modal open onClose={onClose} size="lg" className="camera-preview-modal">
    <div ref={section} tabIndex={-1} className="outline-none">
      <div className="flex items-center gap-3.5 px-5 py-4 pr-14 sm:px-6 sm:pr-16">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brass/30 bg-brass/10 text-brass-light"><OrbitGlyph className="h-7 w-7" /></span>
        <div><SectionLabel>Pratinjau dunia</SectionLabel><h2 className="display mt-0.5 text-[25px] leading-tight font-semibold text-parchment">Kamera 360°</h2></div>
      </div>
      <div className="orbit-viewport">
        <div ref={host} className="game-canvas absolute inset-0" />
        {world && <>
          <div className="pointer-events-none absolute inset-3 rounded-sm border border-white/15" />
          <span className="orbit-location"><Icon name="pin" className="h-3.5 w-3.5" />{path.chapters[0].location}</span>
          <span className="orbit-gesture-hint"><OrbitGlyph className="h-4 w-4" />Seret untuk melihat sekeliling</span>
        </>}
        {!world && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0a2422] px-6 text-center" role="status">
          <OrbitGlyph className="h-9 w-9 text-brass" />
          <p className="display text-lg text-parchment">{failed ? 'Pratinjau membutuhkan WebGL' : 'Membuka dunia 3D…'}</p>
          {failed && <p className="max-w-sm text-xs leading-relaxed text-parchment/65">Aktifkan akselerasi grafis pada browser, lalu buka kembali pratinjau. Progres permainanmu tidak berubah.</p>}
        </div>}
      </div>
      {world && <CameraControls inline orbit={world.orbit} />}
      <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-3 sm:px-6">
        <p className="text-[10px] leading-relaxed text-parchment/55"><span className="hidden sm:inline"><kbd>J</kbd> / <kbd>L</kbd> putar · <kbd>C</kbd> pusatkan · Roda mouse untuk zoom</span><span className="sm:hidden">Usap untuk memutar · Cubit untuk zoom</span></p>
        <button type="button" onClick={onClose} className="min-h-10 shrink-0 rounded-lg border border-brass/30 bg-brass/10 px-4 text-xs font-semibold text-brass-light hover:bg-brass/20">Selesai</button>
      </div>
    </div>
  </Modal>;
}
