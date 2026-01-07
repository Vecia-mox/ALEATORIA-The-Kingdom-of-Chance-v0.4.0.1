
import { AudioManager } from './AudioManager';

/**
 * TITAN ENGINE: SOUND EMITTER
 * A 3D audio source attached to an entity.
 * Uses HRTF PannerNode for realistic spatialization.
 */
export class SoundEmitter {
  private panner: PannerNode;
  private gain: GainNode;
  private source: AudioBufferSourceNode | null = null;
  private manager: AudioManager;

  constructor() {
    this.manager = AudioManager.getInstance();
    const ctx = this.manager.ctx;

    // 1. Create Panner (Spatializer)
    this.panner = ctx.createPanner();
    this.panner.panningModel = 'HRTF'; // High quality Head-Related Transfer Function
    this.panner.distanceModel = 'exponential'; // Realistic falloff
    this.panner.refDistance = 2.0; // Distance where volume is 100%
    this.panner.maxDistance = 20.0; // Distance where volume drops to near 0
    this.panner.rolloffFactor = 1.0;
    this.panner.coneInnerAngle = 360; // Omnidirectional by default

    // 2. Create Local Gain (Volume)
    this.gain = ctx.createGain();

    // 3. Connect to SFX Mixer
    this.panner.connect(this.gain);
    this.gain.connect(this.manager.sfxNode);
  }

  /**
   * Updates the position of the sound source. 
   * Call this every frame with the Entity's transform.
   */
  public setPosition(x: number, y: number, z: number) {
    // Web Audio uses AudioParams for automation, but direct setting is fine for frame updates
    if (this.panner.positionX) {
      this.panner.positionX.value = x;
      this.panner.positionY.value = y;
      this.panner.positionZ.value = z;
    } else {
      this.panner.setPosition(x, y, z);
    }
  }

  public play(soundId: string, loop: boolean = false, volume: number = 1.0) {
    // Stop previous if active (monophonic emitter)
    if (this.source) {
      try { this.source.stop(); } catch(e) {}
      this.source.disconnect();
    }

    const buffer = this.manager.getBuffer(soundId);
    if (!buffer) return;

    const ctx = this.manager.ctx;
    this.source = ctx.createBufferSource();
    this.source.buffer = buffer;
    this.source.loop = loop;
    
    // Randomize pitch slightly for realism if not looping music
    if (!loop) {
        this.source.playbackRate.value = 0.95 + Math.random() * 0.1;
    }

    this.gain.gain.value = volume;
    this.source.connect(this.panner);
    this.source.start(0);
  }

  public stop() {
    if (this.source) {
      try { this.source.stop(); } catch(e) {}
      this.source = null;
    }
  }

  public cleanup() {
    this.stop();
    this.panner.disconnect();
    this.gain.disconnect();
  }
}
