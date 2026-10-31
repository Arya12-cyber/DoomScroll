// 100% Native Web Audio API Procedural Vedic Sound Synthesizer
// Zero External Asset Dependencies - Handcrafted Acoustic Physical Modeling

class VedicSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.6;
  private isInitialized: boolean = false;
  private noiseBuffer: AudioBuffer | null = null;

  // Tanpura Generative Drone Engine State
  private tanpuraActive: boolean = false;
  private tanpuraTimer: any = null;
  private tanpuraGain: GainNode | null = null;
  private tanpuraStep: number = 0;

  constructor() {
    // Lazy initialized on first user gesture
  }

  public init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Dedicated Tanpura Sub-mix
      this.tanpuraGain = this.ctx.createGain();
      this.tanpuraGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.tanpuraGain.connect(this.masterGain);

      // Create white noise buffer for breath, arrow whoosh, and fire embers
      const bufferSize = this.ctx.sampleRate * 2;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API unavailable:', e);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  // =========================================================================
  // 1. TEMPLE BELL (घण्टा - Ghanta)
  // Acoustic partial synthesis with brass strike & lingering acoustic resonance
  // =========================================================================
  public playTempleBell(pitchMult = 1.0, decaySeconds = 3.5) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const baseFreq = 1174.66 * pitchMult; // D6 temple pitch

    // Non-harmonic bell partial ratios
    const partials = [
      { ratio: 1.0, gain: 0.85, decay: decaySeconds },
      { ratio: 1.52, gain: 0.55, decay: decaySeconds * 0.8 },
      { ratio: 2.14, gain: 0.40, decay: decaySeconds * 0.65 },
      { ratio: 2.78, gain: 0.25, decay: decaySeconds * 0.5 },
      { ratio: 3.42, gain: 0.15, decay: decaySeconds * 0.4 },
    ];

    partials.forEach((p) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * p.ratio, now);

      // Subtle frequency wobble for brass rim resonance
      osc.frequency.linearRampToValueAtTime(baseFreq * p.ratio * 0.998, now + p.decay);

      gain.gain.setValueAtTime(p.gain * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + p.decay + 0.1);
    });

    // Metallic striker clapper click
    this.playClapperStrike(now);
  }

  private playClapperStrike(time: number) {
    if (!this.ctx || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, time);
    filter.Q.setValueAtTime(8, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  // =========================================================================
  // 2. GENERATIVE MICROTONAL TANPURA (तम्पूरा)
  // Continuous meditative acoustic string drone in Raag Bhairav tuning
  // =========================================================================
  public toggleTanpura(): boolean {
    if (this.tanpuraActive) {
      this.stopTanpura();
      return false;
    } else {
      this.startTanpura();
      return true;
    }
  }

  public isTanpuraDroneActive(): boolean {
    return this.tanpuraActive;
  }

  public startTanpura() {
    this.init();
    if (!this.ctx || this.tanpuraActive) return;

    this.tanpuraActive = true;
    this.tanpuraStep = 0;

    // 4 Traditional strings: Pa (5th), Sa (root high), Sa (root detuned), Kharaj Sa (low root)
    const baseSa = 130.81; // C3
    const strings = [
      baseSa * 1.5,     // Pa (G3) ~196.2 Hz
      baseSa * 2.0,     // Middle Sa (C4) ~261.6 Hz
      baseSa * 2.003,   // Middle Sa slightly detuned for organic acoustic beating
      baseSa * 1.0,     // Kharaj Sa (C3) ~130.8 Hz
    ];

    const pluckIntervalMs = 1350;

    const pluckNext = () => {
      if (!this.tanpuraActive || !this.ctx) return;
      const freq = strings[this.tanpuraStep % strings.length];
      this.pluckTanpuraString(freq);
      this.tanpuraStep = (this.tanpuraStep + 1) % strings.length;
      this.tanpuraTimer = setTimeout(pluckNext, pluckIntervalMs);
    };

    pluckNext();
  }

  public stopTanpura() {
    this.tanpuraActive = false;
    if (this.tanpuraTimer) {
      clearTimeout(this.tanpuraTimer);
      this.tanpuraTimer = null;
    }
  }

  private pluckTanpuraString(freq: number) {
    if (!this.ctx || !this.tanpuraGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const duration = 4.2;

    // Dual oscillator for rich "Jawari" thread buzz
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.002, now);

    // Warm wooden resonator filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3.5, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.2, now + duration);

    // String envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.tanpuraGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.1);
    osc2.stop(now + duration + 0.1);
  }

  // =========================================================================
  // 3. MRIDANGAM / PAKHAWAJ PERCUSSION (मृदङ्गम्)
  // Physical membrane models with pitch-bend and wooden body
  // =========================================================================
  public playMridangam(type: 'bass' | 'chaapu' | 'dheem' | 'ta' = 'chaapu') {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    if (type === 'bass') {
      // Thoppi: Deep resonant pitch-drop with cream damping
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(125, now);
      osc.frequency.exponentialRampToValueAtTime(62, now + 0.28);

      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.38);
    } else if (type === 'chaapu') {
      // Valanthalai: High ringing metallic rim stroke
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1046.5, now); // Octave overtone

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } else if (type === 'dheem') {
      // Resonant harmonic stroke
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(261.63, now);

      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      // Ta: Sharp dry slap
      this.playClapperStrike(now);
    }
  }

  // =========================================================================
  // 4. DAMARU RAPID OSCILLATION (डमरू)
  // Sacred two-headed drum tap on combo hits
  // =========================================================================
  public playDamaruStrike() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    [0, 0.06].forEach((offset) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now + offset);
      osc.frequency.exponentialRampToValueAtTime(140, now + offset + 0.05);

      gain.gain.setValueAtTime(0.35, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + offset);
      osc.stop(now + offset + 0.08);
    });
  }

  // =========================================================================
  // 5. BAMBOO FLUTE (बाँसुरी - Bansuri)
  // Breathy pure tone with meend glide and warm vibrato
  // =========================================================================
  public playBansuriNote(freq = 523.25, duration = 0.8) {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const vibrato = this.ctx.createOscillator();
    const vibratoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    // 5Hz subtle finger vibrato
    vibrato.frequency.setValueAtTime(5.2, now);
    vibratoGain.gain.setValueAtTime(6.0, now);
    vibrato.connect(osc.frequency);

    osc.type = 'sine';
    // Gentle portamento glide into note
    osc.frequency.setValueAtTime(freq * 0.96, now);
    osc.frequency.exponentialRampToValueAtTime(freq, now + 0.12);

    // Bamboo breath envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    vibrato.start(now);
    osc.start(now);
    vibrato.stop(now + duration + 0.1);
    osc.stop(now + duration + 0.1);

    // Subtle breath air sound layer
    if (this.noiseBuffer) {
      const breath = this.ctx.createBufferSource();
      breath.buffer = this.noiseBuffer;
      const bFilter = this.ctx.createBiquadFilter();
      bFilter.type = 'bandpass';
      bFilter.frequency.setValueAtTime(freq * 2.2, now);
      bFilter.Q.setValueAtTime(4, now);

      const bGain = this.ctx.createGain();
      bGain.gain.setValueAtTime(0.04, now);
      bGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.8);

      breath.connect(bFilter);
      bFilter.connect(bGain);
      bGain.connect(this.masterGain);

      breath.start(now);
      breath.stop(now + duration);
    }
  }

  // Raag Fanfare on Stage Clear (Sa - Ga - Pa - HighSa)
  public playBansuriFanfare() {
    const notes = [
      { f: 523.25, d: 0.35, t: 0.0 },   // Sa (C5)
      { f: 659.25, d: 0.35, t: 0.28 },  // Ga (E5)
      { f: 783.99, d: 0.40, t: 0.56 },  // Pa (G5)
      { f: 1046.5, d: 0.95, t: 0.88 },  // High Sa (C6)
    ];

    notes.forEach((n) => {
      setTimeout(() => {
        this.playBansuriNote(n.f, n.d);
      }, n.t * 1000);
    });
  }

  // =========================================================================
  // 6. AGNEYASTRA FIRE ARROW & SACRED BOWSTRING (आग्नेयास्त्र)
  // Twang of golden Dhanush followed by rushing ember whoosh
  // =========================================================================
  public playAgneyastraArrow() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    // Bowstring snap
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);

    // Fire arrow whoosh
    if (this.noiseBuffer) {
      const fire = this.ctx.createBufferSource();
      fire.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.linearRampToValueAtTime(1800, now + 0.15);
      filter.frequency.exponentialRampToValueAtTime(300, now + 0.35);

      const fireGain = this.ctx.createGain();
      fireGain.gain.setValueAtTime(0.25, now);
      fireGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      fire.connect(filter);
      filter.connect(fireGain);
      fireGain.connect(this.masterGain);

      fire.start(now);
      fire.stop(now + 0.4);
    }
  }

  // =========================================================================
  // 7. SHANKHA CALL (शङ्ख - Sacred Conch Shell)
  // Deep multi-harmonic horn fanfare sounded when Kumbhakarna / Vritra awakens!
  // =========================================================================
  public playShankhaBlast() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const duration = 2.4;

    const harmonics = [1.0, 2.0, 3.0, 4.0];
    const baseFreq = 220; // A3

    harmonics.forEach((h, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      // Lip-pressure swell and scoop
      osc.frequency.setValueAtTime(baseFreq * h * 0.92, now);
      osc.frequency.linearRampToValueAtTime(baseFreq * h, now + 0.4);
      osc.frequency.linearRampToValueAtTime(baseFreq * h * 1.03, now + 1.6);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * h * 0.95, now + duration);

      const amp = 0.28 / (idx + 1);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(amp, now + 0.35);
      gain.gain.linearRampToValueAtTime(amp * 0.9, now + 1.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    });
  }

  // =========================================================================
  // 8. SACRED ASTRA SLASH & BRAHMASTRA PURGE (ब्रह्मास्त्र)
  // =========================================================================
  public playAstraSlash() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.16);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playBrahmastraPurge() {
    this.playTempleBell(0.8, 4.5);
    this.playMridangam('bass');
    this.playMridangam('chaapu');
  }

  public playPunyaChime() {
    this.playTempleBell(1.5, 1.8);
  }

  public playPortalSuction() {
    this.init();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.35);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }
}

export const vedicSound = new VedicSoundEngine();
