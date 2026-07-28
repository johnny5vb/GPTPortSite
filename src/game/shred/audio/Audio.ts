/**
 * Audio — entirely synthesised at runtime. No files, no loading, no licensing.
 *
 * Three layers:
 *   1. A continuous "ride bed": wind, edge scrape and powder rush, all driven
 *      by live physics values. Speed you can hear before you can see it.
 *   2. One-shots: pop, landing, crash, trick chimes, crowd.
 *   3. A generative soundtrack — a step sequencer with a handful of synth
 *      voices, a shared reverb, and a filter that opens up as you go faster and
 *      as the combo meter climbs.
 *
 * Everything hangs off a master limiter so nothing ever clips, and a global
 * low-pass drops in during slow motion.
 */

import { clamp01, lerp } from "../core/math";
import { makeRng } from "../core/rng";

export interface TrackDef {
  id: string;
  name: string;
  bpm: number;
  /** Semitone offsets from the root. */
  scale: number[];
  root: number;
  /** Chord roots per bar, as scale degrees. */
  progression: number[];
  mood: "drive" | "chill" | "dream" | "punk" | "retro";
  unlockScore: number;
}

export const TRACKS: TrackDef[] = [
  {
    id: "neon-descent",
    name: "Neon Descent",
    bpm: 142,
    scale: [0, 2, 3, 5, 7, 8, 10],
    root: 45,
    progression: [0, 5, 3, 4],
    mood: "drive",
    unlockScore: 0,
  },
  {
    id: "powder-days",
    name: "Powder Days",
    bpm: 104,
    scale: [0, 2, 4, 5, 7, 9, 11],
    root: 48,
    progression: [0, 4, 5, 3],
    mood: "chill",
    unlockScore: 0,
  },
  {
    id: "static-bloom",
    name: "Static Bloom",
    bpm: 122,
    scale: [0, 2, 3, 5, 7, 9, 10],
    root: 43,
    progression: [0, 3, 6, 4],
    mood: "dream",
    unlockScore: 60000,
  },
  {
    id: "gravel-glass",
    name: "Gravel & Glass",
    bpm: 168,
    scale: [0, 1, 3, 5, 7, 8, 10],
    root: 40,
    progression: [0, 0, 5, 6],
    mood: "punk",
    unlockScore: 180000,
  },
  {
    id: "mix-1999",
    name: "1999 Mix",
    bpm: 132,
    scale: [0, 2, 4, 7, 9],
    root: 50,
    progression: [0, 3, 4, 2],
    mood: "retro",
    unlockScore: 320000,
  },
];

const noteHz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export class AudioEngine {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private limiter!: DynamicsCompressorNode;
  private lowpass!: BiquadFilterNode;
  private musicBus!: GainNode;
  private sfxBus!: GainNode;
  private rideBus!: GainNode;
  private reverb!: ConvolverNode;
  private reverbSend!: GainNode;

  private noiseBuffer!: AudioBuffer;

  // Ride bed nodes.
  private windSrc?: AudioBufferSourceNode;
  private windFilter?: BiquadFilterNode;
  private windGain?: GainNode;
  private scrapeSrc?: AudioBufferSourceNode;
  private scrapeFilter?: BiquadFilterNode;
  private scrapeGain?: GainNode;
  private powderSrc?: AudioBufferSourceNode;
  private powderFilter?: BiquadFilterNode;
  private powderGain?: GainNode;

  // Music scheduler.
  private track: TrackDef = TRACKS[0];
  private step = 0;
  private nextNoteTime = 0;
  private schedulerTimer: number | null = null;
  private musicFilter!: BiquadFilterNode;
  private intensity = 0;
  private targetIntensity = 0;
  private rng = makeRng(1);

  started = false;
  musicVolume = 0.55;
  sfxVolume = 0.85;
  muted = false;

  // Live inputs from the game.
  speed01 = 0;
  slip01 = 0;
  surface: "powder" | "ice" | "groom" | "rock" = "groom";
  airborne = false;
  slowmo = 0;

  /** Must be called from a user gesture. */
  async start() {
    if (this.started) return;
    type Win = Window & { webkitAudioContext?: typeof AudioContext };
    const Ctor = window.AudioContext ?? (window as Win).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    this.ctx = ctx;
    if (ctx.state === "suspended") await ctx.resume();

    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -8;
    this.limiter.knee.value = 12;
    this.limiter.ratio.value = 8;
    this.limiter.attack.value = 0.004;
    this.limiter.release.value = 0.18;

    this.lowpass = ctx.createBiquadFilter();
    this.lowpass.type = "lowpass";
    this.lowpass.frequency.value = 20000;

    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.9;

    this.limiter.connect(this.lowpass);
    this.lowpass.connect(this.master);
    this.master.connect(ctx.destination);

    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = this.musicVolume;
    this.sfxBus = ctx.createGain();
    this.sfxBus.gain.value = this.sfxVolume;
    this.rideBus = ctx.createGain();
    this.rideBus.gain.value = 0.9;

    this.musicFilter = ctx.createBiquadFilter();
    this.musicFilter.type = "lowpass";
    this.musicFilter.frequency.value = 1400;
    this.musicFilter.Q.value = 0.9;
    this.musicBus.connect(this.musicFilter);
    this.musicFilter.connect(this.limiter);
    this.sfxBus.connect(this.limiter);
    this.rideBus.connect(this.limiter);

    // Reverb from a synthesised impulse response.
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this.makeImpulse(2.4, 2.6);
    this.reverbSend = ctx.createGain();
    this.reverbSend.gain.value = 0.28;
    this.reverbSend.connect(this.reverb);
    this.reverb.connect(this.limiter);

    this.noiseBuffer = this.makeNoise(4);
    this.buildRideBed();

    this.nextNoteTime = ctx.currentTime + 0.1;
    this.startScheduler();
    this.started = true;
  }

  private makeNoise(seconds: number) {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      // A touch of brown noise makes the wind feel like air, not hiss.
      last = (last + 0.02 * white) / 1.02;
      d[i] = white * 0.7 + last * 3.2;
    }
    return buf;
  }

  private makeImpulse(seconds: number, decay: number) {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  private loopNoise(filterType: BiquadFilterType, freq: number, q: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = freq;
    filter.Q.value = q;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.rideBus);
    src.start();
    return { src, filter, gain };
  }

  private buildRideBed() {
    const wind = this.loopNoise("bandpass", 480, 0.7);
    this.windSrc = wind.src;
    this.windFilter = wind.filter;
    this.windGain = wind.gain;

    const scrape = this.loopNoise("bandpass", 2600, 3.2);
    this.scrapeSrc = scrape.src;
    this.scrapeFilter = scrape.filter;
    this.scrapeGain = scrape.gain;

    const powder = this.loopNoise("lowpass", 900, 0.8);
    this.powderSrc = powder.src;
    this.powderFilter = powder.filter;
    this.powderGain = powder.gain;
  }

  // ────────────────────────────────────────────────────────────── ride bed ──

  update(dt: number) {
    if (!this.ctx || !this.started) return;
    const t = this.ctx.currentTime;
    const smooth = 0.08;

    // Wind rises with speed and thins out in the air.
    const windTarget = this.airborne
      ? 0.075 + this.speed01 * 0.3
      : 0.045 + this.speed01 * 0.26;
    this.windGain!.gain.setTargetAtTime(windTarget, t, smooth);
    this.windFilter!.frequency.setTargetAtTime(
      lerp(320, 1500, this.speed01),
      t,
      smooth,
    );

    // Edge noise: bright and hard on ice, muted and soft in powder.
    const onGround = this.airborne ? 0 : 1;
    let scrapeGain = 0;
    let scrapeFreq = 2400;
    let scrapeQ = 3;
    let powderGain = 0;

    switch (this.surface) {
      case "ice":
        scrapeGain = onGround * (0.05 + this.slip01 * 0.4) * (0.35 + this.speed01);
        scrapeFreq = lerp(2600, 5200, this.slip01);
        scrapeQ = 6;
        break;
      case "rock":
        scrapeGain = onGround * (0.06 + this.slip01 * 0.3) * (0.4 + this.speed01);
        scrapeFreq = 1500;
        scrapeQ = 2;
        break;
      case "groom":
        scrapeGain = onGround * (0.03 + this.slip01 * 0.26) * (0.3 + this.speed01);
        scrapeFreq = lerp(1500, 3200, this.slip01);
        scrapeQ = 2.4;
        break;
      case "powder":
        scrapeGain = onGround * 0.02 * this.speed01;
        powderGain = onGround * (0.09 + this.slip01 * 0.22) * (0.35 + this.speed01);
        break;
    }

    this.scrapeGain!.gain.setTargetAtTime(scrapeGain, t, smooth);
    this.scrapeFilter!.frequency.setTargetAtTime(scrapeFreq, t, smooth);
    this.scrapeFilter!.Q.setTargetAtTime(scrapeQ, t, smooth);
    this.powderGain!.gain.setTargetAtTime(powderGain, t, smooth);
    this.powderFilter!.frequency.setTargetAtTime(
      lerp(500, 1400, this.speed01),
      t,
      smooth,
    );

    // Big air ducks everything and drops a filter over the mix.
    const duck = lerp(20000, 900, this.slowmo);
    this.lowpass.frequency.setTargetAtTime(duck, t, 0.12);

    // The soundtrack opens up as you ride better.
    this.intensity += (this.targetIntensity - this.intensity) * Math.min(1, dt * 2.2);
    this.musicFilter.frequency.setTargetAtTime(
      lerp(700, 8200, clamp01(this.speed01 * 0.6 + this.intensity * 0.65)),
      t,
      0.25,
    );
  }

  setComboIntensity(v: number) {
    this.targetIntensity = clamp01(v);
  }

  // ───────────────────────────────────────────────────────────── one-shots ──

  private env(
    node: AudioNode,
    when: number,
    attack: number,
    decay: number,
    peak: number,
    bus: AudioNode,
    sendVerb = 0,
  ) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), when + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, when + attack + decay);
    node.connect(g);
    g.connect(bus);
    if (sendVerb > 0) {
      const s = ctx.createGain();
      s.gain.value = sendVerb;
      g.connect(s);
      s.connect(this.reverbSend);
    }
    return g;
  }

  private noiseBurst(
    when: number,
    dur: number,
    freq: number,
    q: number,
    peak: number,
    type: BiquadFilterType = "bandpass",
    verb = 0,
  ) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, when);
    f.Q.value = q;
    src.connect(f);
    this.env(f, when, 0.006, dur, peak, this.sfxBus, verb);
    src.start(when);
    src.stop(when + dur + 0.08);
    return f;
  }

  private tone(
    when: number,
    freq: number,
    endFreq: number,
    dur: number,
    peak: number,
    type: OscillatorType = "sine",
    verb = 0,
    bus?: AudioNode,
  ) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, when);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), when + dur);
    this.env(o, when, 0.004, dur, peak, bus ?? this.sfxBus, verb);
    o.start(when);
    o.stop(when + dur + 0.06);
    return o;
  }

  pop(power: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone(t, 220 * (0.8 + power * 0.6), 90, 0.09, 0.28, "triangle");
    this.noiseBurst(t, 0.07, 1800, 1.4, 0.16, "bandpass");
  }

  land(quality: "perfect" | "good" | "sketchy" | "crash", impact: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const i = clamp01(impact / 22);
    // The thump: a fast pitch drop plus a filtered snow burst.
    this.tone(t, 150 + i * 90, 42, 0.22 + i * 0.2, 0.34 + i * 0.3, "sine", 0.08);
    this.noiseBurst(t, 0.24 + i * 0.2, 700 - i * 260, 0.9, 0.22 + i * 0.22, "lowpass", 0.12);

    if (quality === "perfect") {
      // A clean bell to confirm it. This is the sound players chase.
      const base = 880;
      [1, 1.5, 2.25].forEach((m, k) => {
        this.tone(t + k * 0.012, base * m, base * m, 0.42, 0.1 - k * 0.02, "sine", 0.4);
      });
    } else if (quality === "sketchy") {
      this.noiseBurst(t, 0.3, 2200, 2.4, 0.13, "bandpass");
    }
  }

  crash() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.noiseBurst(t, 0.5, 420, 0.7, 0.4, "lowpass", 0.25);
    this.tone(t, 120, 38, 0.5, 0.3, "sawtooth");
    // Comedy tumble: a few descending thuds.
    for (let i = 1; i <= 4; i++) {
      this.tone(t + i * 0.11, 200 - i * 26, 60, 0.12, 0.16, "sine");
      this.noiseBurst(t + i * 0.11, 0.1, 900, 1.2, 0.1, "lowpass");
    }
  }

  trick(level: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const scale = [0, 3, 5, 7, 10, 12, 15, 19];
    const n = scale[Math.min(scale.length - 1, level)] + 69;
    const f = noteHz(n);
    this.tone(t, f, f, 0.3, 0.12, "triangle", 0.45);
    this.tone(t + 0.02, f * 2, f * 2, 0.22, 0.06, "sine", 0.5);
  }

  cheer(size: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const dur = 1.1 + size * 1.2;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(700, t);
    bp.frequency.linearRampToValueAtTime(1500, t + dur * 0.35);
    bp.frequency.linearRampToValueAtTime(600, t + dur);
    bp.Q.value = 1.1;
    src.connect(bp);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.1 + size * 0.16, t + 0.22);
    g.gain.setTargetAtTime(0.0001, t + dur * 0.5, 0.35);
    bp.connect(g);
    g.connect(this.sfxBus);
    const s = ctx.createGain();
    s.gain.value = 0.4;
    g.connect(s);
    s.connect(this.reverbSend);
    src.start(t);
    src.stop(t + dur + 0.4);

    // A couple of whoops on top.
    for (let i = 0; i < 3 + Math.floor(size * 3); i++) {
      const w = t + Math.random() * dur * 0.6;
      const f = 400 + Math.random() * 500;
      this.tone(w, f, f * 1.7, 0.18, 0.05, "sine", 0.5);
    }
  }

  ui(kind: "move" | "select" | "back" | "unlock") {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    switch (kind) {
      case "move":
        this.tone(t, 620, 620, 0.05, 0.05, "square");
        break;
      case "select":
        this.tone(t, 520, 780, 0.1, 0.09, "triangle", 0.2);
        break;
      case "back":
        this.tone(t, 420, 260, 0.1, 0.07, "triangle");
        break;
      case "unlock":
        [0, 4, 7, 12].forEach((s, i) =>
          this.tone(t + i * 0.07, noteHz(69 + s), noteHz(69 + s), 0.35, 0.09, "triangle", 0.5),
        );
        break;
    }
  }

  shutter() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.noiseBurst(t, 0.05, 3000, 3, 0.2);
    this.noiseBurst(t + 0.07, 0.06, 1600, 2, 0.16);
  }

  // ─────────────────────────────────────────────────────────────── music ────

  setTrack(id: string) {
    const t = TRACKS.find((x) => x.id === id);
    if (t) {
      this.track = t;
      this.step = 0;
      this.rng = makeRng(t.bpm * 7919);
    }
  }

  get currentTrack() {
    return this.track;
  }

  private startScheduler() {
    const tick = () => {
      if (!this.ctx) return;
      const ahead = 0.12;
      const spb = 60 / this.track.bpm;
      const stepDur = spb / 4; // 16ths
      while (this.nextNoteTime < this.ctx.currentTime + ahead) {
        this.scheduleStep(this.step, this.nextNoteTime, stepDur);
        this.nextNoteTime += stepDur;
        this.step = (this.step + 1) % 64;
      }
      this.schedulerTimer = window.setTimeout(tick, 25);
    };
    tick();
  }

  private scheduleStep(step: number, when: number, stepDur: number) {
    const tr = this.track;
    const bar = Math.floor(step / 16) % tr.progression.length;
    const beat = step % 16;
    const deg = tr.progression[bar];
    const chordRoot = tr.root + tr.scale[deg % tr.scale.length] + (deg >= tr.scale.length ? 12 : 0);
    const energy = 0.4 + this.intensity * 0.6;

    const drums = tr.mood !== "dream" || this.intensity > 0.15;

    // ── kick ──────────────────────────────────────────────────────────────
    const kickPattern =
      tr.mood === "punk"
        ? [0, 4, 6, 8, 12, 14]
        : tr.mood === "chill"
          ? [0, 8]
          : [0, 6, 8, 14];
    if (drums && kickPattern.includes(beat)) {
      this.tone(when, 130, 42, 0.16, 0.5 * energy, "sine", 0, this.musicBus);
    }

    // ── snare / clap ──────────────────────────────────────────────────────
    if (drums && (beat === 4 || beat === 12)) {
      const f = this.ctx!.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = tr.mood === "punk" ? 2100 : 1500;
      f.Q.value = 1.1;
      const src = this.ctx!.createBufferSource();
      src.buffer = this.noiseBuffer;
      src.loop = true;
      src.connect(f);
      this.env(f, when, 0.004, tr.mood === "chill" ? 0.14 : 0.1, 0.22 * energy, this.musicBus, 0.25);
      src.start(when);
      src.stop(when + 0.3);
    }

    // ── hats ──────────────────────────────────────────────────────────────
    if (drums && beat % 2 === (tr.mood === "retro" ? 0 : 1)) {
      const src = this.ctx!.createBufferSource();
      src.buffer = this.noiseBuffer;
      src.loop = true;
      const f = this.ctx!.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = 7000;
      src.connect(f);
      this.env(f, when, 0.002, beat % 4 === 0 ? 0.06 : 0.03, 0.055 * energy, this.musicBus);
      src.start(when);
      src.stop(when + 0.12);
    }

    // ── bass ──────────────────────────────────────────────────────────────
    if (beat % 2 === 0) {
      const oct = beat % 8 === 0 ? 0 : this.rng() < 0.25 ? 12 : 0;
      const o = this.ctx!.createOscillator();
      o.type = tr.mood === "retro" ? "square" : "sawtooth";
      o.frequency.value = noteHz(chordRoot - 12 + oct);
      const f = this.ctx!.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.setValueAtTime(220 + energy * 700, when);
      f.Q.value = 4;
      o.connect(f);
      this.env(f, when, 0.008, stepDur * 1.7, 0.26 * energy, this.musicBus);
      o.start(when);
      o.stop(when + stepDur * 2.2);
    }

    // ── pad, once a bar ───────────────────────────────────────────────────
    if (beat === 0) {
      for (const off of [0, 3, 7, 10]) {
        const o = this.ctx!.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = noteHz(chordRoot + off);
        o.detune.value = (this.rng() - 0.5) * 14;
        const f = this.ctx!.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = 900 + energy * 1800;
        o.connect(f);
        this.env(f, when, 0.35, stepDur * 14, 0.055 * (0.6 + energy), this.musicBus, 0.5);
        o.start(when);
        o.stop(when + stepDur * 18);
      }
    }

    // ── arp / lead — this is the layer the combo meter unlocks ─────────────
    if (this.intensity > 0.18 && beat % (tr.mood === "chill" ? 4 : 2) === 0) {
      const idx = Math.floor(this.rng() * tr.scale.length);
      const oct = this.rng() < 0.3 ? 12 : 0;
      const note = tr.root + tr.scale[idx] + 12 + oct;
      const o = this.ctx!.createOscillator();
      o.type = tr.mood === "retro" ? "square" : "triangle";
      o.frequency.value = noteHz(note);
      this.env(
        o,
        when,
        0.01,
        stepDur * 2.4,
        0.075 * this.intensity,
        this.musicBus,
        0.6,
      );
      o.start(when);
      o.stop(when + stepDur * 3);
    }
  }

  // ────────────────────────────────────────────────────────────── control ────

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.9;
  }

  setMusicVolume(v: number) {
    this.musicVolume = v;
    if (this.musicBus) this.musicBus.gain.value = v;
  }

  setSfxVolume(v: number) {
    this.sfxVolume = v;
    if (this.sfxBus) this.sfxBus.gain.value = v;
    if (this.rideBus) this.rideBus.gain.value = v;
  }

  suspend() {
    this.ctx?.suspend();
  }

  resume() {
    this.ctx?.resume();
  }

  dispose() {
    if (this.schedulerTimer !== null) window.clearTimeout(this.schedulerTimer);
    this.windSrc?.stop();
    this.scrapeSrc?.stop();
    this.powderSrc?.stop();
    this.ctx?.close();
    this.ctx = null;
    this.started = false;
  }
}
