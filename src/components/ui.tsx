import type { ReactNode } from 'react';
import type { Hero, HeroId } from '../data/content';
import { HEROES } from '../data/content';
import { cn } from '../utils/cn';

export function Icon({ name, className = 'h-5 w-5', strokeWidth = 1.7 }: { name: string; className?: string; strokeWidth?: number }) {
  const paths: Record<string, ReactNode> = {
    compass: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
        <path d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21" />
      </>
    ),
    play: <path d="M8 5.5v13l11-6.5-11-6.5Z" />,
    continue: (
      <>
        <path d="M4 12a8 8 0 1 0 2.7-6" />
        <path d="M4 4v5h5" />
        <path d="M10 9.5v5l4-2.5-4-2.5Z" />
      </>
    ),
    gallery: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 16l5-5 4 4 3-3 6 6" />
        <circle cx="9" cy="9" r="1.4" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.9.4-1.4 1-1.4 2.2M12 17h.01" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
      </>
    ),
    music: (
      <>
        <path d="M9 18V6l10-2v12" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="16" cy="16" r="3" />
      </>
    ),
    muted: (
      <>
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        <path d="m16 9 5 6M21 9l-5 6" />
      </>
    ),
    pause: (
      <>
        <path d="M9 5v14M15 5v14" />
      </>
    ),
    map: (
      <>
        <path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
        <path d="M9 4v14M15 6v14" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    chevron: <path d="m9 6 6 6-6 6" />,
    check: <path d="m5 12.5 4.5 4.5L19 7" />,
    lock: (
      <>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z" />
        <path d="M4 19.5A3.5 3.5 0 0 1 7.5 16H20" />
      </>
    ),
    flag: (
      <>
        <path d="M5 21V4" />
        <path d="M5 4h11l-1.5 4L16 12H5" />
      </>
    ),
    star: <path d="m12 3 2.7 5.8 6.3.8-4.6 4.4 1.2 6.2-5.6-3-5.6 3L7.6 14 3 9.6l6.3-.8L12 3Z" />,
    archive: (
      <>
        <rect x="3" y="4" width="18" height="5" rx="1" />
        <path d="M5 9v11h14V9M9 13h6" />
      </>
    ),
    chat: (
      <>
        <path d="M21 12a8 8 0 0 1-8 8H7l-4 2 1.2-4A8 8 0 1 1 21 12Z" />
        <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" />
      </>
    ),
    spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />,
    save: (
      <>
        <path d="M5 3h11l4 4v14H5V3Z" />
        <path d="M8 3v6h7V3M8 21v-7h8v7" />
      </>
    ),
    jump: <path d="M12 20V5m-6 6 6-6 6 6" />,
    run: (
      <>
        <circle cx="15" cy="5" r="2" />
        <path d="m9 21 3-6-3-3 3-5 4 3 3 1M6 13l3-3M13 15l3 6" />
      </>
    ),
    interact: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v10M7 12h10" />
      </>
    ),
    camera: (
      <>
        <path d="M4 8h3l1.5-2h7L17 8h3v11H4V8Z" />
        <circle cx="12" cy="13" r="3.2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.6" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      </>
    ),
    heart: <path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9Z" />,
    scroll: (
      <>
        <path d="M6 4h11a2 2 0 0 1 2 2v13a2 2 0 0 0 2-2V6" />
        <path d="M6 4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h11" />
        <path d="M8 8h7M8 12h7M8 16h4" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s7-6.5 7-12A7 7 0 0 0 5 9c0 5.5 7 12 7 12Z" />
        <circle cx="12" cy="9" r="2.4" />
      </>
    ),
    back: <path d="M19 12H5m6-6-6 6 6 6" />,
    volume: (
      <>
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a9 9 0 0 1 0 12" />
      </>
    ),
    expand: <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5" />,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name] ?? paths.compass}
    </svg>
  );
}

export function CompassMark({ className = 'h-11 w-11' }: { className?: string }) {
  return (
    <div className={cn('relative flex items-center justify-center rounded-full border border-brass/45 bg-[#0c2827] text-brass shadow-[0_0_26px_-6px_rgba(217,172,92,.55)]', className)}>
      <svg viewBox="0 0 48 48" className="h-[78%] w-[78%]" fill="none">
        <circle cx="24" cy="24" r="19" stroke="currentColor" strokeOpacity=".45" strokeWidth="1.2" />
        <circle cx="24" cy="24" r="15" stroke="currentColor" strokeOpacity=".28" strokeWidth=".8" strokeDasharray="1.5 3.2" />
        <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M24 4.5v4M24 39.5v4M4.5 24h4M39.5 24h4" />
        </g>
        <g className="animate-compass">
          <path d="M24 12.5 28 24l-4 11.5L20 24l4-11.5Z" fill="currentColor" fillOpacity=".18" stroke="currentColor" strokeWidth="1.2" />
          <path d="M24 12.5 28 24h-8l4-11.5Z" fill="currentColor" />
        </g>
        <circle cx="24" cy="24" r="2.1" fill="currentColor" />
      </svg>
    </div>
  );
}

export function PrimaryButton({ children, onClick, className, icon = 'arrow', disabled }: { children: ReactNode; onClick?: () => void; className?: string; icon?: string | null; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={cn('btn-primary group flex min-h-13 items-center justify-center gap-3 rounded-2xl px-7 py-3.5 text-[15px] font-bold tracking-wide text-[#fff7e9] disabled:cursor-not-allowed disabled:opacity-45', className)}>
      <span className="relative z-10">{children}</span>
      {icon && <Icon name={icon} className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-1" />}
    </button>
  );
}

export function GhostButton({ children, onClick, className, icon, active }: { children: ReactNode; onClick?: () => void; className?: string; icon?: string; active?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={cn('btn-ghost flex min-h-11 items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-parchment/90', active && 'border-brass/70 bg-brass/10 text-brass-light', className)}>
      {icon && <Icon name={icon} className="h-4.5 w-4.5 text-brass" />}
      {children}
    </button>
  );
}

export function IconButton({ icon, label, onClick, className, badge }: { icon: string; label: string; onClick: () => void; className?: string; badge?: number }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cn('relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-[#07201f]/75 text-parchment backdrop-blur-md transition hover:border-brass/60 hover:bg-[#123a35] active:scale-95', className)}>
      <Icon name={icon} className="h-5 w-5" />
      {badge != null && badge > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-crimson px-1 text-[10px] font-bold text-white">{badge}</span>
      )}
    </button>
  );
}

export function Modal({ open, onClose, children, className, size = 'md', dismissable = true }: { open: boolean; onClose?: () => void; children: ReactNode; className?: string; size?: 'sm' | 'md' | 'lg' | 'xl'; dismissable?: boolean }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-6xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      <button type="button" aria-label="Tutup" className="absolute inset-0 cursor-default bg-[#041414]/80 backdrop-blur-md" onClick={() => dismissable && onClose?.()} />
      <div className={cn('glass noise scroll-thin relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-[26px] border border-brass/25 shadow-[0_30px_90px_-20px_rgba(0,0,0,.9)] animate-rise', sizes[size], className)}>
        {dismissable && onClose && (
          <button type="button" onClick={onClose} className="absolute right-3.5 top-3.5 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/25 text-parchment/80 transition hover:border-brass/50 hover:text-brass">
            <Icon name="close" className="h-4.5 w-4.5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export function HanifAvatar({ size = 'h-14 w-14', ring = true }: { size?: string; ring?: boolean }) {
  return (
    <div className={cn('relative shrink-0 overflow-hidden rounded-full bg-pine', size, ring && 'ring-2 ring-brass/70 ring-offset-2 ring-offset-[#0d2b29]')}>
      <img src="/images/hanif.jpg" alt="HANIF, pemandu petualangan" className="h-full w-full object-cover object-[50%_18%]" />
    </div>
  );
}

const PORTRAIT_BG: Record<string, [string, string]> = {
  pejuang: ['#6d2b24', '#241310'],
  pemikir: ['#6f5a2c', '#211b10'],
  pemersatu: ['#2c4a4a', '#101f22'],
};

export function HeroPortrait({ hero, mode = 'card', className, locked = false }: { hero: Hero | HeroId; mode?: 'card' | 'dialog' | 'thumb'; className?: string; locked?: boolean }) {
  const data = typeof hero === 'string' ? HEROES[hero] : hero;
  const accentPath = data.pathIds[0] ?? 'pejuang';
  const [a, b] = PORTRAIT_BG[accentPath];
  const female = data.gender === 'female';
  return (
    <div className={cn('relative overflow-hidden bg-[#102321]', className)}>
      <svg viewBox="0 0 300 360" className="h-full w-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Ilustrasi representatif ${data.name}, bukan foto asli`}>
        <defs>
          <radialGradient id={`bg-${data.id}`} cx="50%" cy="30%" r="80%">
            <stop offset="0%" stopColor={a} />
            <stop offset="100%" stopColor={b} />
          </radialGradient>
          <linearGradient id={`cloth-${data.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={data.colors.robe} />
            <stop offset="100%" stopColor={data.colors.accent} />
          </linearGradient>
          <pattern id={`batikp-${data.id}`} width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="8" cy="8" r="1.4" fill={data.colors.accent} opacity=".55" />
            <path d="M0 16 16 0" stroke={data.colors.accent} strokeOpacity=".22" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="300" height="360" fill={`url(#bg-${data.id})`} />
        <circle cx="150" cy="132" r="108" fill="#000" opacity=".12" />
        <circle cx="150" cy="132" r="92" fill="none" stroke="#f1d392" strokeOpacity=".22" strokeWidth="1" strokeDasharray="2 7" />
        <path d="M40 360c0-62 44-104 110-104s110 42 110 104Z" fill={`url(#cloth-${data.id})`} />
        <path d="M40 360c0-62 44-104 110-104s110 42 110 104Z" fill={`url(#batikp-${data.id})`} opacity=".6" />
        <path d="M120 262h60v34h-60Z" fill={data.colors.skin} />
        <path d="M150 258c-28 0-48-22-48-56v-20c0-36 22-62 48-62s48 26 48 62v20c0 34-20 56-48 56Z" fill={data.colors.skin} />
        {female ? (
          <>
            <path d="M150 106c-32 0-52 22-52 56 0 12 2 22 5 30-9-14-13-32-13-50 0-34 26-56 60-56s60 22 60 56c0 18-4 36-13 50 3-8 5-18 5-30 0-34-20-56-52-56Z" fill={data.colors.head} />
            <path d="M100 150c-8 34 2 70 22 92l-30 24c-8-40-8-84 8-116Z" fill={data.colors.head} />
            <path d="M200 150c8 34-2 70-22 92l30 24c8-40 8-84-8-116Z" fill={data.colors.head} />
            <path d="M106 128c6-28 24-42 44-42s38 14 44 42c-10-12-26-18-44-18s-34 6-44 18Z" fill={data.colors.head} />
          </>
        ) : (
          <>
            <path d="M108 128c2-34 20-52 42-52s40 18 42 52c-8-16-24-24-42-24s-34 8-42 24Z" fill={data.colors.head} />
            {data.id === 'kihajar' || data.id === 'diponegoro' || data.id === 'tjokro' || data.id === 'soekarno' ? (
              <path d="M108 112h84v-14c0-8-6-12-14-12h-56c-8 0-14 4-14 12v14Z" fill="#141b1c" />
            ) : null}
          </>
        )}
        <ellipse cx="132" cy="178" rx="4.6" ry="5.4" fill="#201a15" />
        <ellipse cx="168" cy="178" rx="4.6" ry="5.4" fill="#201a15" />
        <path d="M126 162c5-4 12-4 17-1M157 161c5-3 12-3 17 1" stroke="#2a2018" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity=".75" />
        <path d="M139 208c7 6 15 6 22 0" stroke="#7d3b31" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <path d="M148 186v10h6" stroke="#8f6044" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M110 300c24-12 56-12 80 0v60H110Z" fill={data.colors.accent} opacity=".6" />
        <circle cx="150" cy="300" r="8" fill="#e8c888" />
        <circle cx="150" cy="300" r="3" fill={a} />
      </svg>
      {mode !== 'thumb' && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#061817] via-[#061817]/72 to-transparent px-3 pb-2.5 pt-14">
          <p className="display text-base leading-tight text-parchment">{data.name}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-brass/85">{data.origin} · {data.years}</p>
        </div>
      )}
      <span className="absolute left-2.5 top-2.5 rounded-md border border-white/15 bg-black/35 px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.12em] text-parchment/70">Ilustrasi</span>
      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#061817]/82 backdrop-blur-[3px]">
          <Icon name="lock" className="h-6 w-6 text-brass/80" />
          <p className="px-4 text-center text-[11px] font-medium text-parchment/65">Temui tokoh ini dalam petualangan</p>
        </div>
      )}
    </div>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('flex items-center gap-2.5 text-[10.5px] font-bold uppercase tracking-[0.24em] text-brass/90', className)}>
      <span className="h-px w-6 bg-brass/60" />
      {children}
    </p>
  );
}

export function StatPill({ icon, value, label, className }: { icon: string; value: ReactNode; label: string; className?: string }) {
  return (
    <div className={cn('hud-chip flex items-center gap-2 rounded-xl px-2.5 py-1.5', className)}>
      <Icon name={icon} className="h-4 w-4 text-brass" />
      <div className="leading-none">
        <p className="text-[13px] font-bold text-parchment">{value}</p>
        <p className="mt-1 text-[8.5px] uppercase tracking-[0.13em] text-parchment/50">{label}</p>
      </div>
    </div>
  );
}

export function GoldDivider({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-gradient-to-r from-transparent via-brass/40 to-transparent', className)} />;
}
