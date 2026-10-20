// Web Audio API procedural sound effects synthesizer with Mario World Sound Effects

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicInterval: number | null = null;

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isMusicPlaying) {
      this.stopMusic();
    }
  }

  // Classic Mario Coin sound (B5 -> E6)
  public playCoin() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // B5 (987.77 Hz) for 0.08s, then jumps to E6 (1318.51 Hz)
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.075);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.setValueAtTime(0.2, now + 0.075);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.46);
  }

  // Classic Mario Pipe Warp sound
  public playPipe() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const notes = [
      { freq: 392, dur: 0.07 }, // G4
      { freq: 330, dur: 0.07 }, // E4
      { freq: 261, dur: 0.14 }, // C4
    ];

    let t = ctx.currentTime;
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + n.dur);
      t += n.dur;
    });
  }

  // Classic Mario 1-Up Jingle
  public play1Up() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    // E5, G5, E6, C6, D6, G6
    const melody = [659.25, 783.99, 1318.51, 1046.50, 1174.66, 1567.98];
    const now = ctx.currentTime;
    melody.forEach((freq, idx) => {
      const t = now + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.13);
    });
  }

  public playClick() {
    this.playCoin();
  }

  public playStep() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const freq = 110 + Math.random() * 25;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  public playCorrect() {
    this.playCoin();
    setTimeout(() => this.play1Up(), 150);
  }

  public playWrong() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    // Mario bump / wrong sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(130, ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  }

  public playTeleport() {
    this.playPipe();
  }

  public playRobotVoice() {
    this.playCoin();
  }

  public playFanfareVictory() {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    // Mario Stage Clear fanfare chords
    const notes = [
      { t: 0.0, f: [523.25, 659.25, 783.99] }, // C
      { t: 0.18, f: [523.25, 659.25, 783.99] },
      { t: 0.36, f: [523.25, 659.25, 783.99] },
      { t: 0.54, f: [659.25, 783.99, 1046.5] }, // E
      { t: 0.76, f: [783.99, 1046.5, 1318.51] }, // G
      { t: 1.05, f: [1046.5, 1318.51, 1567.98, 2093.0] }, // High C Victory
    ];

    notes.forEach(({ t, f }) => {
      f.forEach((freq) => {
        const start = ctx.currentTime + t;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        const dur = t >= 1.0 ? 1.0 : 0.16;
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur + 0.05);
      });
    });
  }

  public toggleMusic(enable: boolean) {
    if (!enable || this.isMuted) {
      this.stopMusic();
      return;
    }
    this.startMusic();
  }

  private startMusic() {
    if (this.isMusicPlaying) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    this.isMusicPlaying = true;
    // Cheerful Mario-style overworld bouncy motif in C major
    const melody = [
      { note: 659.25, dur: 0.15, pause: 0.18 }, // E5
      { note: 659.25, dur: 0.15, pause: 0.32 }, // E5
      { note: 659.25, dur: 0.15, pause: 0.32 }, // E5
      { note: 523.25, dur: 0.15, pause: 0.18 }, // C5
      { note: 659.25, dur: 0.18, pause: 0.35 }, // E5
      { note: 783.99, dur: 0.25, pause: 0.65 }, // G5
      { note: 392.00, dur: 0.25, pause: 0.65 }, // G4
    ];

    let step = 0;
    const playNext = () => {
      if (!this.isMusicPlaying || this.isMuted) return;
      const cur = melody[step % melody.length];
      step++;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(cur.note, now);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + cur.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + cur.dur);

      this.musicInterval = window.setTimeout(playNext, cur.pause * 1000);
    };

    playNext();
  }

  private stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearTimeout(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const sound = new SoundManager();
