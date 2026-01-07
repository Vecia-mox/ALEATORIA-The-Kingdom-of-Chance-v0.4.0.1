
import { VFXSystem } from '../vfx/VFXSystem';
import { CameraShake } from '../camera/CameraShake';

/**
 * TITAN ENGINE: SKILL FX
 * Defines the visual choreography for skills.
 */

export class SkillFX {
  
  public static playWhirlwind(casterId: string, position: Float32Array) {
    // 1. Dust Cloud at feet
    VFXSystem.getInstance().spawn('FX_TORNADO_BASE', position, new Float32Array([0,1,0]));
    
    // 2. Weapon Trail (Circular) is handled by AnimEvent 'Swing_Start' looping
    
    // 3. Distortion Shockwave (if supported)
    // PostProcess.addDistortion(position, 2.0);
  }

  public static playLeapImpact(position: Float32Array, radius: number) {
    // 1. Cracked Earth Decal
    // DecalSystem.addDecal(position.x, position.z, 'cracked_earth');

    // 2. Radial Dust Explosion
    // We spawn multiple emitters in a ring
    const count = 8;
    for(let i=0; i<count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const dir = new Float32Array([Math.cos(angle), 0.5, Math.sin(angle)]);
        VFXSystem.getInstance().spawn('FX_DUST_BLAST', position, dir);
    }

    // 3. Screen Shake
    // CameraShake.addTrauma(0.5);
  }

  public static playFireball(start: Float32Array, end: Float32Array) {
    // 1. Muzzle Flash
    VFXSystem.getInstance().spawn('FX_FIRE_MUZZLE', start, new Float32Array([0,1,0]));

    // 2. Projectile (Handled by ProjectileSystem visual, but we can spawn trail here)
    // FX_FIRE_TRAIL attached to projectile entity
  }
}
