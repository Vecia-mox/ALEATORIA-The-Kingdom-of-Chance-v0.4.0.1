
import { WeaponTrail } from '../vfx/WeaponTrail';
import { VFXSystem } from '../vfx/VFXSystem';
import { PlayerAvatar } from '../entities/PlayerAvatar';

/**
 * TITAN ENGINE: VISUAL FEEDBACK
 * Connects Gameplay Logic -> Visual Effects.
 */
export class VisualFeedback {
  private trails: Map<string, WeaponTrail> = new Map();
  private avatar: PlayerAvatar;
  private gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext, avatar: PlayerAvatar) {
    this.gl = gl;
    this.avatar = avatar;
  }

  public registerEntity(entityId: string) {
    // Create Trail for entity's weapon
    const trail = new WeaponTrail(this.gl);
    this.trails.set(entityId, trail);
  }

  public onAnimEvent(entityId: string, eventName: string) {
    const trail = this.trails.get(entityId);
    if (!trail) return;

    if (eventName === 'Swing_Start') {
      trail.activate();
    } else if (eventName === 'Swing_End') {
      trail.deactivate();
    } else if (eventName === 'Footstep') {
      // Spawn dust
      const pos = this.avatar.getBonePosition('Foot_R'); // approximate
      VFXSystem.getInstance().spawn('FX_DUST', pos, new Float32Array([0,1,0]));
    }
  }

  public onCombatHit(entityId: string, hitPos: Float32Array, surfaceType: 'FLESH' | 'METAL' | 'STONE') {
    const effect = surfaceType === 'FLESH' ? 'FX_BLOOD' : 'FX_SPARK';
    // Calc direction away from impact? Or normal?
    const normal = new Float32Array([0, 1, 0]); 
    
    VFXSystem.getInstance().spawn(effect, hitPos, normal);
  }

  public update(dt: number) {
    // Update all trails
    this.trails.forEach((trail, id) => {
      // Get Weapon Bones
      // In reality, getBoneMatrix returns Matrix, we need Pos
      // const tip = avatar.getBonePosition(id, 'Weapon_Tip');
      // const base = avatar.getBonePosition(id, 'Weapon_Base');
      
      // Mock positions for now based on avatar transform
      const tip = new Float32Array([0, 2, 0]); 
      const base = new Float32Array([0, 1, 0]);

      trail.update(dt, tip, base);
    });
  }

  public renderTrails(viewProj: Float32Array) {
    this.gl.depthMask(false); // Trails are transparent
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);

    this.trails.forEach(trail => {
      trail.render(viewProj);
    });

    this.gl.depthMask(true);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  }
}
