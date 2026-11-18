type Mode = 'menu' | 'explore' | 'ending' | 'none';
export type Sfx = 'click' | 'collect' | 'correct' | 'wrong' | 'jump' | 'complete' | 'open' | 'step';

const SCALES: Record<string, number[]> = {
  menu: [220, 261.63, 329.63, 392, 329.63, 261.63],
  explore: [196, 246.94, 293.66, 392, 440, 392, 293.66, 246.94],
  ending: [261.63, 329.63, 392, 523.25, 659.25, 523.25, 392, 329.63],
};

class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private timer: number | null = null;
  private step = 0;
  private mode: Mode = 'none';
  private muted = false;
  private musicVolume = 0.55;
  private sfxVolume = 0.7;

  private ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    }
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(ctx.destination);
      this.musicGain = ctx.createGain();
      this.musicGain.gain.value = this.musicVolume * 0.16;
      this.musicGain.connect(this.master);
      this.sfxGain = ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume * 0.45;
      this.sfxGain.connect(this.master);
      return ctx;
    } catch {
      return null;
    }
  }

  unlock() {
    this.ensure();
    if (this.mode !== 'none') this.schedule();
  }

  configure(opts: { muted?: boolean; musicVolume?: number; sfxVolume?: number }) {
    if (typeof opts.muted === 'boolean') this.muted = opts.muted;
    if (typeof opts.musicVolume === 'number') this.musicVolume = opts.musicVolume;
    if (typeof opts.sfxVolume === 'number') this.sfxVolume = opts.sfxVolume;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, 0.08);
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume * 0.16, this.ctx.currentTime, 0.1);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume * 0.45, this.ctx.currentTime, 0.1);
    }
  }

  setMode(mode: Mode) {
    if (this.mode === mode) return;
    this.mode = mode;
    this.step = 0;
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    if (mode !== 'none') {
      this.ensure();
      this.schedule();
    }
  }

  private schedule() {
    if (this.timer) window.clearInterval(this.timer);
    const interval = this.mode === 'menu' ? 620 : this.mode === 'ending' ? 720 : 520;
    this.timer = window.setInterval(() => this.tick(), interval);
  }

  private tick() {
    if (!this.ctx || !this.musicGain || this.mode === 'none' || document.hidden) return;
    const notes = SCALES[this.mode] ?? SCALES.explore;
    const ctx = this.ctx;
    const t = ctx.currentTime + 0.03;
    const freq = notes[this.step % notes.length];
    this.step += 1;
    const osc = ctx.createOscillator();
    const shape = this.mode === 'ending' ? 'sine' : 'triangle';
    osc.type = shape;
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    const base = 0.055 + (this.step % 4 === 0 ? 0.03 : 0);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(base, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + (this.mode === 'menu' ? 1.3 : 1.05));
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1400;
    osc.connect(gain);
    gain.connect(filter);
    filter.connect(this.musicGain);
    osc.start(t);
    osc.stop(t + 1.5);

    if (this.step % 4 === 1) {
      const pad = ctx.createOscillator();
      pad.type = 'sine';
      pad.frequency.value = freq / 2;
      const pg = ctx.createGain();
      pg.gain.setValueAtTime(0.0001, t);
      pg.gain.exponentialRampToValueAtTime(0.045, t + 0.4);
      pg.gain.exponentialRampToValueAtTime(0.0001, t + 2);
      pad.connect(pg);
      pg.connect(this.musicGain);
      pad.start(t);
      pad.stop(t + 2.1);
    }
  }

  sfx(name: Sfx) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx || !this.sfxGain) return;
    const out = this.sfxGain;
    const t = ctx.currentTime;
    const make = (freq: number, dur: number, type: OscillatorType, when = 0, vol = 0.16) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t + when);
      g.gain.setValueAtTime(0.0001, t + when);
      g.gain.exponentialRampToValueAtTime(vol, t + when + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + when + dur);
      osc.connect(g);
      g.connect(out);
      osc.start(t + when);
      osc.stop(t + when + dur + 0.05);
    };
    switch (name) {
      case 'click': make(520, 0.07, 'sine', 0, 0.08); break;
      case 'collect': make(659.25, 0.16, 'sine'); make(987.77, 0.28, 'sine', 0.1, 0.12); break;
      case 'correct': make(523.25, 0.2, 'triangle'); make(659.25, 0.2, 'triangle', 0.12); make(783.99, 0.35, 'triangle', 0.24, 0.14); break;
      case 'wrong': make(196, 0.22, 'sawtooth', 0, 0.07); make(164.81, 0.3, 'sawtooth', 0.12, 0.06); break;
      case 'jump': make(320, 0.12, 'sine', 0, 0.07); make(460, 0.1, 'sine', 0.05, 0.05); break;
      case 'complete': [392, 523.25, 659.25, 783.99].forEach((f, i) => make(f, 0.35, 'triangle', i * 0.1, 0.13)); break;
      case 'open': make(392, 0.12, 'sine', 0, 0.07); make(587.33, 0.18, 'sine', 0.08, 0.06); break;
      case 'step': make(110, 0.05, 'sine', 0, 0.025); break;
    }
  }
}

export const audio = new GameAudio();
