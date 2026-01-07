
/**
 * TITAN ENGINE: VFX DIRECTOR
 * Manages particle lifecycle, bloom thresholds, and visual impact.
 */

import { ParticleSystem } from './ParticleSystem';

export class VFXDirector {
  private static instance: VFXDirector;
  private systems: Map<string, ParticleSystem> = new Map();
  
  // "Diablo Glow" config
  private readonly EMISSIVE_BOOST = 2.5; // Multiplier for RGB > 1.0 (HDR)

  private constructor() {}

  public static getInstance(): VFXDirector {
    if (!VFXDirector.instance) VFXDirector.instance = new VFXDirector();
    return VFXDirector.instance;
  }

  public registerSystem(id: string, sys: ParticleSystem) {
    this.systems.set(id, sys);
  }

  /**
   * Spawns a skill effect with cinematic timing.
   * "Impact Frame" -> "Hold" -> "Dissipate"
   */
  public triggerEffect(id: string, position: Float32Array, direction: Float32Array) {
    const sys = this.systems.get(id);
    if (!sys) return;

    // 1. BURST (Impact)
    // Instant spawn of 20-50 particles
    for (let i = 0; i < 30; i++) {
      // High velocity, short life
      const speed = 5 + Math.random() * 5;
      // Emissive Color (HDR)
      const color = [2.0, 0.8, 0.2, 1.0]; // Super bright orange
      
      // sys.emit(...) - pseudocode wrapper around ParticleSystem internal
    }

    // 2. SHOCKWAVE (Heat Distortion)
    // Spawn a single large quad with a refraction shader
    // this.spawnDistortion(position);

    // 3. LIGHT (Mobile Optimization)
    // Register a temporary dynamic light in the MobileRenderer
    // MobileRenderer.addTransientLight(position, [1, 0.5, 0], 5.0, 0.5s);
  }

  public update(dt: number) {
    this.systems.forEach(sys => sys.update(dt));
  }
}
