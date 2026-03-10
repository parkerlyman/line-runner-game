import { BASE_BPM, MAX_BPM, MASTER_VOLUME } from './constants.js';

export class AudioManager {
  constructor() {
    this._ctx = null;
    this._masterGain = null;
    this._enabled = true;
    this._beatInterval = null;
    this._bpm = BASE_BPM;
    this._nextBeatTime = 0;
    this._beatIndex = 0;
  }

  // Must be called from a user gesture (click/keydown)
  init() {
    if (this._ctx) return;
    this._ctx = new AudioContext();
    this._masterGain = this._ctx.createGain();
    this._masterGain.connect(this._ctx.destination);
    this._masterGain.gain.value = this._enabled ? MASTER_VOLUME : 0;
  }

  get enabled() { return this._enabled; }

  setEnabled(on) {
    this._enabled = on;
    if (this._masterGain) {
      this._masterGain.gain.value = on ? MASTER_VOLUME : 0;
    }
  }

  // --- Sound Effects ---
  playJump() {
    this._playTone(440, 0.08, 'square', 0.15, 600);
  }

  playDoubleJump() {
    this._playTone(550, 0.06, 'square', 0.12, 750);
  }

  playLand() {
    this._playNoise(0.04, 0.08);
  }

  playDeath() {
    this._playTone(300, 0.35, 'sawtooth', 0.2, 60);
  }

  playCoin() {
    this._playTone(880, 0.07, 'sine', 0.12);
    setTimeout(() => this._playTone(1100, 0.09, 'sine', 0.1), 60);
  }

  playMilestone() {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => this._playTone(freq, 0.12, 'sine', 0.13), i * 70);
    });
  }

  playCombo() {
    this._playTone(660, 0.05, 'sine', 0.08, 880);
  }

  // --- Procedural Beat ---
  startBeat() {
    if (!this._ctx) return;
    this._bpm = BASE_BPM;
    this._nextBeatTime = this._ctx.currentTime + 0.1;
    this._beatIndex = 0;
    this._scheduleBeat();
  }

  updateBeatSpeed(gameSpeed) {
    // Map game speed 5-15 to BPM 120-200
    this._bpm = Math.min(BASE_BPM + (gameSpeed - 5) * 8, MAX_BPM);
  }

  stopBeat() {
    if (this._beatInterval) {
      clearInterval(this._beatInterval);
      this._beatInterval = null;
    }
  }

  _scheduleBeat() {
    this.stopBeat();
    this._beatInterval = setInterval(() => {
      if (!this._ctx || !this._enabled) return;
      const lookAhead = 0.1;
      while (this._nextBeatTime < this._ctx.currentTime + lookAhead) {
        this._playBeatNote(this._nextBeatTime, this._beatIndex);
        const beatDuration = 60 / this._bpm;
        this._nextBeatTime += beatDuration / 2; // 8th notes
        this._beatIndex = (this._beatIndex + 1) % 8;
      }
    }, 50);
  }

  _playBeatNote(time, index) {
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.connect(gain);
    gain.connect(this._masterGain);

    if (index === 0 || index === 4) {
      // Kick
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.08);
      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      osc.start(time);
      osc.stop(time + 0.1);
    } else if (index === 2 || index === 6) {
      // Snare
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, time);
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
      osc.start(time);
      osc.stop(time + 0.06);
    } else {
      // Hihat
      osc.type = 'square';
      osc.frequency.setValueAtTime(900, time);
      gain.gain.setValueAtTime(0.03, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);
      osc.start(time);
      osc.stop(time + 0.025);
    }
  }

  _playTone(freq, duration, type = 'sine', volume = 0.15, endFreq = null) {
    if (!this._ctx || !this._enabled) return;
    const osc = this._ctx.createOscillator();
    const gain = this._ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this._ctx.currentTime);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, this._ctx.currentTime + duration);
    }
    gain.gain.setValueAtTime(volume, this._ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this._masterGain);
    osc.start();
    osc.stop(this._ctx.currentTime + duration + 0.01);
  }

  _playNoise(duration, volume) {
    if (!this._ctx || !this._enabled) return;
    const bufferSize = Math.floor(this._ctx.sampleRate * duration);
    const buffer = this._ctx.createBuffer(1, bufferSize, this._ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const source = this._ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this._ctx.createGain();
    gain.gain.setValueAtTime(volume, this._ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this._ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(this._masterGain);
    source.start();
  }

  destroy() {
    this.stopBeat();
    if (this._ctx) {
      this._ctx.close();
      this._ctx = null;
    }
  }
}
