// Ambient sound synthesizer via Web Audio API
// Generates soothing pink noise for rain, filtered sine clusters for ethereal pads

class AmbientSoundGenerator {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private oscs: OscillatorNode[] = [];
  public currentTrack: 'none' | 'rain' | 'ethereal' | 'space' = 'none';

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  stop() {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      setTimeout(() => {
        this.oscs.forEach((osc) => {
          try {
            osc.stop();
          } catch (e) {}
        });
        this.oscs = [];
        this.gainNode = null;
        this.noiseNode = null;
      }, 500);
    }
    this.currentTrack = 'none';
  }

  playRain() {
    this.stop();
    this.initContext();
    if (!this.ctx) return;
    this.currentTrack = 'rain';

    // Pink noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter to sound like soft rainfall
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    this.noiseNode = noise;
    this.gainNode = gain;
  }

  playEthereal() {
    this.stop();
    this.initContext();
    if (!this.ctx) return;
    this.currentTrack = 'ethereal';

    const freqs = [146.83, 220.0, 261.63, 329.63]; // D minor 7 chord
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 1.5);
    gain.connect(this.ctx.destination);
    this.gainNode = gain;

    this.oscs = freqs.map((f, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, this.ctx!.currentTime);
      osc.connect(gain);
      osc.start();
      return osc;
    });
  }
}

export const ambientSound = new AmbientSoundGenerator();
