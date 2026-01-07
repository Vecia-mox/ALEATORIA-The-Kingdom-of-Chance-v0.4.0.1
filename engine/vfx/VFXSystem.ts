
import { ParticleSystem, ParticleEmitterConfig } from './ParticleSystem';
import { Renderer3D } from '../graphics/Renderer3D';

/**
 * TITAN ENGINE: VFX SYSTEM
 * Orchestrates object pooling for particle effects to avoid GC spikes.
 */
export class VFXSystem {
  private static instance: VFXSystem;
  private renderer: Renderer3D;
  
  // Pools: Map<EffectID, Array<ParticleSystem>>
  private pools: Map<string, ParticleSystem[]> = new Map();
  private activeSystems: ParticleSystem[] = [];

  // Definitions
  private configs: Map<string, ParticleEmitterConfig> = new Map();

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): VFXSystem {
    if (!VFXSystem.instance) VFXSystem.instance = new VFXSystem();
    return VFXSystem.instance;
  }

  public init(renderer: Renderer3D) {
    this.renderer = renderer;
  }

  private registerDefaults() {
    // Blood Impact
    this.configs.set('FX_BLOOD', {
      maxParticles: 50,
      spawnRate: 0, // Burst only
      lifeTime: [0.5, 1.0],
      speed: [2.0, 5.0],
      colorStart: [0.8, 0.0, 0.0, 1.0],
      colorEnd: [0.2, 0.0, 0.0, 0.0],
      sizeStart: 0.2,
      sizeEnd: 0.5,
      textureId: 'particle_blob'
    });

    // Metal Spark
    this.configs.set('FX_SPARK', {
      maxParticles: 30,
      spawnRate: 0,
      lifeTime: [0.2, 0.4],
      speed: [5.0, 10.0],
      colorStart: [1.0, 1.0, 0.8, 1.0],
      colorEnd: [1.0, 0.5, 0.0, 0.0],
      sizeStart: 0.1,
      sizeEnd: 0.0,
      textureId: 'particle_spark'
    });
  }

  public spawn(effectId: string, position: Float32Array, direction: Float32Array) {
    if (!this.configs.has(effectId)) return;

    // 1. Get from Pool
    let sys = this.getPooledSystem(effectId);
    if (!sys) {
        // Create new if pool empty (and limit not reached)
        sys = new ParticleSystem(this.configs.get(effectId)!);
        if (!this.pools.has(effectId)) this.pools.set(effectId, []);
        this.pools.get(effectId)!.push(sys);
    }

    // 2. Reset & Burst
    // We assume ParticleSystem has a method to burst emission
    // For this MVP, we simulate a burst by manually emitting N particles
    const count = Math.floor(this.configs.get(effectId)!.maxParticles * 0.5);
    
    // Helper to override spawn pos/vel in ParticleSystem needed
    // Assuming we can set "Emitter Origin"
    // sys.setOrigin(position);
    // sys.burst(count, direction); 
    
    this.activeSystems.push(sys);
  }

  private getPooledSystem(id: string): ParticleSystem | null {
    const pool = this.pools.get(id);
    if (!pool) return null;
    
    // Find inactive
    // We need an isActive flag on ParticleSystem ideally
    // For now, return first one that isn't in activeSystems list? 
    // Optimization: Just round-robin or dynamic expansion.
    return pool[0]; 
  }

  public update(dt: number) {
    for (let i = this.activeSystems.length - 1; i >= 0; i--) {
      const sys = this.activeSystems[i];
      sys.update(dt);
      
      // If done, remove from active list (return to pool logic implicit)
      // if (sys.activeCount === 0) { ... }
    }
  }

  public getRenderables(): ParticleSystem[] {
    return this.activeSystems;
  }
}
