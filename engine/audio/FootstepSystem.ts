
import { AudioManager } from './AudioManager';
import { PhysicsWorld } from '../physics/PhysicsWorld';

/**
 * TITAN ENGINE: FOOTSTEP SYSTEM
 * Triggers audio events based on the surface material beneath the character.
 */
export class FootstepSystem {
  private manager: AudioManager;
  private physics: PhysicsWorld;
  
  // Cache sounds to avoid string allocs
  private readonly MATERIALS: Record<string, string[]> = {
    'GRASS': ['step_grass_1', 'step_grass_2'],
    'STONE': ['step_stone_1', 'step_stone_2'],
    'WOOD':  ['step_wood_1', 'step_wood_2'],
    'WATER': ['step_water_1', 'step_water_2']
  };

  constructor(physics: PhysicsWorld) {
    this.manager = AudioManager.getInstance();
    this.physics = physics;
  }

  /**
   * Called by the Animation System on specific frames (e.g. Frame 4 and 12 of Run cycle).
   */
  public triggerStep(position: Float32Array, isRunning: boolean) {
    // 1. Raycast Down to find material
    // Ray start: Hip height (~1.0m up), Dir: Down
    // Mask: Ground Layers only
    const hit = this.physics.raycast(
        [position[0], position[1] + 1.0, position[2]], 
        [0, -1, 0], 
        2.0, 
        1 // Layer mask for static geometry
    );

    let material = 'STONE'; // Default fallback

    if (hit.hit) {
      // In a real engine, we'd query the physics material or texture tag
      // For MVP, we simulate based on Y height or metadata
      // Example: Y < 0.5 is Water, Y > 5.0 is Stone Bridge
      
      const y = hit.point[1];
      if (y < 0.2) material = 'WATER';
      else if (y > 0.2 && y < 1.0) material = 'GRASS';
      else material = 'STONE';
    }

    // 2. Select Sound
    const pool = this.MATERIALS[material] || this.MATERIALS['STONE'];
    const clip = pool[Math.floor(Math.random() * pool.length)];

    // 3. Play (Global for local player, Spatial for others - simpler to just use OneShot for local for now)
    // Variation
    const pitch = 0.9 + Math.random() * 0.2;
    const volume = isRunning ? 0.6 : 0.3;

    // We can manually play via AudioContext to apply pitch since OneShot helper is simple
    this.playPitchVaried(clip, volume, pitch);
  }

  private playPitchVaried(id: string, volume: number, pitch: number) {
    const buffer = this.manager.getBuffer(id);
    if (!buffer) return;

    const ctx = this.manager.ctx;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = pitch;

    const gain = ctx.createGain();
    gain.gain.value = volume;

    // Simple Filter for muffling (e.g. if stone is echoey)
    // const filter = ctx.createBiquadFilter();
    // filter.type = 'lowpass';
    // filter.frequency.value = 3000;

    source.connect(gain);
    gain.connect(this.manager.sfxNode);
    source.start(0);
  }
}
