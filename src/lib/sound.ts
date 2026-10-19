export class Soundscape {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private lastChime = 0;
  enabled = false;

  private noiseBuffer(ctx: AudioContext, seconds = 3) {
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  private start() {
    const ctx = new AudioContext();
    this.ctx = ctx;
    const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination); this.master = master;
    const padFilter = ctx.createBiquadFilter(); padFilter.type = 'lowpass'; padFilter.frequency.value = 260; padFilter.connect(master);
    [55, 82.4, 110.6].forEach((frequency, i) => {
      const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = frequency;
      const gain = ctx.createGain(); gain.gain.value = [.065, .045, .035][i];
      const lfo = ctx.createOscillator(); lfo.frequency.value = .07 + i * .03;
      const lfoGain = ctx.createGain(); lfoGain.gain.value = .018; lfo.connect(lfoGain); lfoGain.connect(gain.gain);
      osc.connect(gain); gain.connect(padFilter); osc.start(); lfo.start();
    });
    const wind = ctx.createBufferSource(); wind.buffer = this.noiseBuffer(ctx); wind.loop = true;
    const windFilter = ctx.createBiquadFilter(); windFilter.type = 'bandpass'; windFilter.frequency.value = 520; windFilter.Q.value = .35;
    const windGain = ctx.createGain(); windGain.gain.value = .035; wind.connect(windFilter); windFilter.connect(windGain); windGain.connect(master); wind.start();
    const engine = ctx.createBufferSource(); engine.buffer = this.noiseBuffer(ctx); engine.loop = true;
    const engineFilter = ctx.createBiquadFilter(); engineFilter.type = 'lowpass'; engineFilter.frequency.value = 140;
    const engineGain = ctx.createGain(); engineGain.gain.value = .075; engine.connect(engineFilter); engineFilter.connect(engineGain); engineGain.connect(master); engine.start();
    const whine = ctx.createOscillator(); whine.type = 'sine'; whine.frequency.value = 2960;
    const whineGain = ctx.createGain(); whineGain.gain.value = .0009; whine.connect(whineGain); whineGain.connect(master); whine.start();
  }

  async toggle() {
    if (!this.ctx) this.start();
    const ctx = this.ctx!, master = this.master!;
    await ctx.resume();
    this.enabled = !this.enabled;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(this.enabled ? .5 : 0, ctx.currentTime, .28);
    return this.enabled;
  }

  whoosh(duration = 2.6) {
    if (!this.enabled || !this.ctx || !this.master) return;
    const ctx = this.ctx, start = ctx.currentTime;
    const source = ctx.createBufferSource(); source.buffer = this.noiseBuffer(ctx, duration + .1);
    const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.Q.value = .55;
    filter.frequency.setValueAtTime(260, start);
    filter.frequency.exponentialRampToValueAtTime(1500, start + duration * .48);
    filter.frequency.exponentialRampToValueAtTime(320, start + duration);
    const gain = ctx.createGain(); gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(.15, start + .22);
    gain.gain.exponentialRampToValueAtTime(.001, start + duration);
    source.connect(filter); filter.connect(gain); gain.connect(this.master);
    source.start(start); source.stop(start + duration + .02); source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  }

  chime() {
    const now = performance.now();
    if (!this.enabled || !this.ctx || !this.master || now - this.lastChime < 140) return;
    this.lastChime = now;
    [784, 1174.66].forEach((frequency, i) => {
      const ctx = this.ctx!, start = ctx.currentTime + i * .045;
      const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = frequency;
      const gain = ctx.createGain(); gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(.06, start + .025);
      gain.gain.exponentialRampToValueAtTime(.0001, start + .28);
      osc.connect(gain); gain.connect(this.master!); osc.start(start); osc.stop(start + .3);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    });
  }

  dispose() { void this.ctx?.close(); }
}
