
import { AudioManager } from './AudioManager';

/**
 * TITAN ENGINE: MUSIC DIRECTOR
 * Adaptive audio mixer that cross-fades layers based on game tension.
 * Layers are synchronized (started together) and volume-automated.
 */
export class MusicDirector {
  private manager: AudioManager;
  
  // Track Layers
  private layers: Map<string, { source: AudioBufferSourceNode | null, gain: GainNode, bufferId: string }> = new Map();
  private isPlaying: boolean = false;
  
  // State
  private currentTension: number = 0; // 0 to 100
  private targetTension: number = 0;
  
  // Config
  private readonly FADE_TIME_CONSTANT = 0.5; 

  constructor() {
    this.manager = AudioManager.getInstance();
  }

  public registerLayer(name: string, bufferId: string) {
    const ctx = this.manager.ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0; // Start silent
    gain.connect(this.manager.musicNode);

    this.layers.set(name, {
      source: null,
      gain: gain,
      bufferId: bufferId
    });
  }

  public play() {
    if (this.isPlaying) return;
    const ctx = this.manager.ctx;
    const startTime = ctx.currentTime + 0.1; // Schedule slightly in future for sync

    this.layers.forEach((layer) => {
      const buffer = this.manager.getBuffer(layer.bufferId);
      if (!buffer) return;

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      src.connect(layer.gain);
      src.start(startTime);
      layer.source = src;
    });

    this.isPlaying = true;
  }

  public stop() {
    this.layers.forEach((layer) => {
      if (layer.source) {
        try { layer.source.stop(); } catch(e) {}
        layer.source.disconnect();
        layer.source = null;
      }
    });
    this.isPlaying = false;
  }

  /**
   * Updates the desired tension level.
   * @param enemyCount Number of active aggro enemies
   * @param playerHpPct Player Health (0.0 to 1.0)
   */
  public updateTension(enemyCount: number, playerHpPct: number) {
    // Formula: Enemies add 10 each. Low HP adds up to 50.
    let tension = (enemyCount * 10) + ((1.0 - playerHpPct) * 50);
    this.targetTension = Math.max(0, Math.min(100, tension));
  }

  public update(dt: number) {
    if (!this.isPlaying) return;

    // Smoothly interpolate tension
    const diff = this.targetTension - this.currentTension;
    if (Math.abs(diff) > 0.1) {
        const change = Math.sign(diff) * Math.min(Math.abs(diff), 20 * dt); // Max 20 tension change per sec
        this.currentTension += change;
    }

    // Map Tension to Layer Volumes
    // 0-30: Base (Ambient)
    // 30-100: Action (Drums) fades in
    
    const t = this.currentTension;
    const ctx = this.manager.ctx;
    
    // Base Layer: Always 1.0
    this.setVolume('AMBIENT', 1.0, ctx.currentTime);

    // Action Layer: Starts fading in at 30, max at 80
    // Normalized 0-1
    const actionVol = Math.max(0, Math.min(1, (t - 30) / 50));
    this.setVolume('ACTION', actionVol, ctx.currentTime);
  }

  private setVolume(name: string, targetVol: number, time: number) {
    const layer = this.layers.get(name);
    if (layer) {
      // Use setTargetAtTime for smooth exponential ramp preventing pops
      layer.gain.gain.setTargetAtTime(targetVol, time, this.FADE_TIME_CONSTANT);
    }
  }
}
