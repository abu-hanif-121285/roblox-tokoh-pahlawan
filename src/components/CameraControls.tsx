import { useEffect, useId, useRef, useState } from 'react';
import type { CameraView, ExplorerOrbit } from '../game/orbit';
import { Icon } from './ui';

export function OrbitGlyph({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg viewBox="0 0 28 28" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6.8 17a9.1 9.1 0 1 1 14.8-.4" />
    <path d="M7.5 11.8c-4.2 1-6.2 2.6-6.2 4.3 0 3.1 5.8 5.5 12.9 5.5s12.5-2.7 12.5-5.5c0-1.4-1.5-2.9-4.1-3.9" />
    <path d="m11.4 18.7 3 2.9-3 2.6" /><circle cx="14" cy="11.2" r="1.7" fill="currentColor" stroke="none" />
  </svg>;
}

const DIRECTIONS = ['Utara', 'Timur laut', 'Timur', 'Tenggara', 'Selatan', 'Barat daya', 'Barat', 'Barat laut'];

export function CameraControls({ orbit, inline = false }: { orbit?: ExplorerOrbit; inline?: boolean }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<CameraView>({ heading: 0, touring: false });
  const root = useRef<HTMLDivElement>(null);
  const panelId = useId();
  useEffect(() => orbit?.subscribe(setView), [orbit]);
  useEffect(() => {
    if (!open || inline) return;
    const outside = (e: PointerEvent) => {
      if (e.target instanceof Node && !root.current?.contains(e.target)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); setOpen(false); }
    };
    document.addEventListener('pointerdown', outside, true);
    window.addEventListener('keydown', escape, true);
    return () => {
      document.removeEventListener('pointerdown', outside, true);
      window.removeEventListener('keydown', escape, true);
    };
  }, [open, inline]);

  const direction = DIRECTIONS[Math.round(view.heading / 45) % 8];
  const buttons = <>
    <div className="orbit-buttons" role="group" aria-label="Arah kamera">
      <button type="button" aria-label="Putar kamera 45° ke kiri" title="Putar 45° ke kiri" onClick={() => orbit?.turn(-45)}><Icon name="chevron" className="h-4 w-4 rotate-180" /></button>
      <button type="button" className="orbit-center" onClick={() => orbit?.recenter()} title="Kembali ke belakang karakter (C)"><Icon name="compass" className="h-4 w-4" /> Pusatkan</button>
      <button type="button" aria-label="Putar kamera 45° ke kanan" title="Putar 45° ke kanan" onClick={() => orbit?.turn(45)}><Icon name="chevron" className="h-4 w-4" /></button>
    </div>
    <button type="button" className="orbit-tour" aria-pressed={view.touring} onClick={() => orbit?.toggleTour()}>
      {view.touring ? <Icon name="pause" className="h-4 w-4" /> : <OrbitGlyph className="h-[18px] w-[18px]" />}
      {view.touring ? 'Hentikan putaran' : 'Putar 360°'}
    </button>
  </>;

  return <div ref={root} className={`orbit-controls${inline ? ' orbit-inline' : ''}`} data-game-control="camera">
    {!inline && <button type="button" className="orbit-toggle" disabled={!orbit} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
      <OrbitGlyph className="h-[17px] w-[17px]" /><span>Kamera 360°</span>
    </button>}
    {(inline || open) && <div className="orbit-panel" id={panelId} role="group" aria-label="Kontrol kamera 360 derajat">
      <div className="orbit-readout">
        <span className="orbit-needle" aria-hidden="true"><svg viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="15" stroke="currentColor" strokeOpacity=".4"/><circle cx="18" cy="18" r="11.5" stroke="currentColor" strokeOpacity=".6" strokeDasharray="1 5"/><g transform={`rotate(${view.heading} 18 18)`}><path d="m18 6 3.6 12-3.6-1-3.6 1L18 6Z" fill="currentColor"/><path d="m18 29-3.6-11 3.6 1 3.6-1L18 29Z" fill="currentColor" opacity=".25"/></g></svg></span>
        <div><span className="orbit-eyebrow">Arah pandang</span><span className="orbit-direction">{direction} <span data-camera-heading={view.heading}>{String(view.heading).padStart(3, '0')}°</span></span></div>
      </div>
      <div className="orbit-actions">{buttons}</div>
      {!inline && <p className="orbit-help">Seret untuk memutar. Gunakan roda mouse atau cubit layar untuk zoom.</p>}
    </div>}
  </div>;
}
