
/**
 * TITAN ENGINE: AUDIO SYSTEM
 * Wraps Web Audio API for 3D positional sound.
 */

export class AudioSystem {
  private context: AudioContext;
  private masterGain: GainNode;
  private soundCache: Map<string, AudioBuffer> = new Map();
  private enabled: boolean = false;

  constructor() {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.context = new AudioCtx();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    
    // Resume context on first interaction (browser policy)
    const resume = () => {
      if (this.context.state === 'suspended') {
        this.context.resume();
        this.enabled = true;
      }
      window.removeEventListener('click', resume);
      window.removeEventListener('touchstart', resume);
    };
    window.addEventListener('click', resume);
    window.addEventListener('touchstart', resume);
  }

  public async loadSound(id: string, url: string) {
    if (this.soundCache.has(id)) return;
    
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.soundCache.set(id, audioBuffer);
    } catch (e) {
      console.error(`[Audio] Failed to load ${id}:`, e);
    }
  }

  /**
   * Updates the "Ears" of the player (Camera position).
   */
  public updateListener(x: number, y: number, z: number, fwdX: number, fwdY: number, fwdZ: number) {
    if (this.context.listener.positionX) {
      // Modern API
      this.context.listener.positionX.value = x;
      this.context.listener.positionY.value = y;
      this.context.listener.positionZ.value = z;
      this.context.listener.forwardX.value = fwdX;
      this.context.listener.forwardY.value = fwdY;
      this.context.listener.forwardZ.value = fwdZ;
      this.context.listener.upX.value = 0;
      this.context.listener.upY.value = 1;
      this.context.listener.upZ.value = 0;
    } else {
      // Legacy API fallback
      this.context.listener.setPosition(x, y, z);
      this.context.listener.setOrientation(fwdX, fwdY, fwdZ, 0, 1, 0);
    }
  }

  /**
   * Plays a sound at a specific 3D location.
   */
  public play3D(id: string, x: number, y: number, z: number, volume: number = 1.0) {
    const buffer = this.soundCache.get(id);
    if (!buffer) return;

    const source = this.context.createBufferSource();
    source.buffer = buffer;

    const panner = this.context.createPanner();
    panner.panningModel = 'HRTF'; // High quality 3D
    panner.distanceModel = 'exponential';
    panner.refDistance = 5; // Distance where volume starts dropping
    panner.maxDistance = 100;
    panner.rolloffFactor = 1;
    
    panner.positionX.value = x;
    panner.positionY.value = y;
    panner.positionZ.value = z;

    const gain = this.context.createGain();
    gain.gain.value = volume;

    // Graph: Source -> Panner -> Gain -> Master
    source.connect(panner);
    panner.connect(gain);
    gain.connect(this.masterGain);

    source.start(0);
  }

  public playGlobal(id: string, volume: number = 1.0) {
    const buffer = this.soundCache.get(id);
    if (!buffer) return;

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    
    const gain = this.context.createGain();
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(this.masterGain);
    source.start(0);
  }
}
