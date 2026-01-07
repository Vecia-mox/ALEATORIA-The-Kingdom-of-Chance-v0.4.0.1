
export class SoundSynth {
    private ctx: AudioContext;
    private master: GainNode;
    private noiseBuffer: AudioBuffer;

    constructor(ctx: AudioContext, master: GainNode) {
        this.ctx = ctx;
        this.master = master;
        this.noiseBuffer = this.createNoiseBuffer();
    }

    private createNoiseBuffer(): AudioBuffer {
        // Create 2 seconds of white noise
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    public playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.master);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    public playSwoosh() {
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;
        
        // Lowpass sweep to simulate air cutting
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.Q.value = 1;
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(2000, this.ctx.currentTime + 0.1);
        filter.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.25);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 0.3);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);

        src.start();
        src.stop(this.ctx.currentTime + 0.3);
    }

    public playHit() {
        // Punchy low saw wave
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.master);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
        
        // Add a bit of noise impact
        this.playExplosion(0.05, 0.1); 
    }

    public playDing() {
        // High pitch sine for loot/level up
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.1); // Sustain
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

        osc.connect(gain);
        gain.connect(this.master);

        osc.start();
        osc.stop(this.ctx.currentTime + 1.5);
    }

    public playExplosion(duration: number = 0.5, volume: number = 0.5) {
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, this.ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);

        src.start();
        src.stop(this.ctx.currentTime + duration);
    }

    public playFire() {
        // Crackle effect
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);

        src.start();
        src.stop(this.ctx.currentTime + 0.2);
    }
}
