
import { SoundSynth } from './SoundSynth';

export class AudioManager {
    private static instance: AudioManager;
    public ctx: AudioContext;
    public masterGain: GainNode;
    
    public sfxNode: GainNode;
    public musicNode: GainNode;
    private buffers: Map<string, AudioBuffer> = new Map();

    private synth: SoundSynth;
    private isMuted: boolean = false;
    private ambientOsc: OscillatorNode | null = null;
    private initialized: boolean = false;

    private constructor() {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.5; // Default volume
        
        // Initialize Mixer Nodes
        this.sfxNode = this.ctx.createGain();
        this.sfxNode.connect(this.masterGain);

        this.musicNode = this.ctx.createGain();
        this.musicNode.connect(this.masterGain);
        
        this.synth = new SoundSynth(this.ctx, this.sfxNode);

        // Browser Policy: Resume AudioContext on first user interaction
        const initAudio = () => {
            if (this.initialized) return;
            this.ctx.resume().then(() => {
                console.log("🔊 Audio Context Resumed");
                this.initialized = true;
                this.startAmbience();
            });
            window.removeEventListener('click', initAudio);
            window.removeEventListener('keydown', initAudio);
            window.removeEventListener('touchstart', initAudio);
        };

        window.addEventListener('click', initAudio);
        window.addEventListener('keydown', initAudio);
        window.addEventListener('touchstart', initAudio);

        this.generateFallbackBuffers();
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    public getContext(): AudioContext {
        return this.ctx;
    }

    public getBuffer(id: string): AudioBuffer | null {
        if (this.buffers.has(id)) return this.buffers.get(id)!;
        // Fallback to noise if specific buffer missing
        if (this.buffers.has('noise')) return this.buffers.get('noise')!;
        return null;
    }

    private generateFallbackBuffers() {
        // Create a generic noise buffer
        const bufferSize = this.ctx.sampleRate * 0.5; // 0.5s
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() - 0.5) * 0.2;
        }
        this.buffers.set('noise', buffer);
    }

    public play(soundName: string) {
        if (this.isMuted || !this.initialized) return;

        switch (soundName) {
            case 'swoosh': this.synth.playSwoosh(); break;
            case 'hit': this.synth.playHit(); break;
            case 'ding': this.synth.playDing(); break;
            case 'explosion': this.synth.playExplosion(); break;
            case 'fire': this.synth.playFire(); break;
            case 'coin': this.synth.playTone(2000, 'sine', 0.1, 0.1); break; // New Coin Sound
            case 'ui_click': this.synth.playTone(800, 'triangle', 0.05, 0.05); break;
            case 'ui_open': this.synth.playTone(400, 'sine', 0.1, 0.05); break;
        }
    }

    public toggleMute(): boolean {
        this.isMuted = !this.isMuted;
        
        const now = this.ctx.currentTime;
        if (this.isMuted) {
            // Fade out
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
            this.masterGain.gain.linearRampToValueAtTime(0, now + 0.1);
        } else {
            // Fade in
            if (this.ctx.state === 'suspended') this.ctx.resume();
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setValueAtTime(0, now);
            this.masterGain.gain.linearRampToValueAtTime(0.5, now + 0.1);
        }
        return this.isMuted;
    }

    private startAmbience() {
        if (this.isMuted) return;

        // 1. Deep Drone (50Hz)
        this.ambientOsc = this.ctx.createOscillator();
        this.ambientOsc.type = 'sine';
        this.ambientOsc.frequency.value = 50;
        
        const gain = this.ctx.createGain();
        gain.gain.value = 0.03; // Very quiet

        this.ambientOsc.connect(gain);
        gain.connect(this.musicNode);
        this.ambientOsc.start();
        
        // 2. LFO to modulate drone (breathing effect)
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // 10 seconds per cycle
        
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 5; // Modulate by +/- 5Hz
        
        lfo.connect(lfoGain);
        lfoGain.connect(this.ambientOsc.frequency);
        lfo.start();
    }
}
