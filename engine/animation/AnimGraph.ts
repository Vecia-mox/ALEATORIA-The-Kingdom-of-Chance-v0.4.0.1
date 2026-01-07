
/**
 * TITAN ENGINE: ANIM GRAPH
 * Handles animation state blending based on gameplay inputs.
 * Manages Bone Transforms for equipment attachment.
 */

export class AnimGraph {
  // Inputs
  public speed: number = 0; // 0.0 to 1.0 (Joystick Magnitude)
  public isAttacking: boolean = false;
  
  // State
  private currentAnim: string = 'Idle';
  private blendFactor: number = 0; // 0 (Idle) -> 1 (Run)
  private animTime: number = 0;

  constructor() {}

  public update(dt: number) {
    this.animTime += dt;

    if (this.isAttacking) {
      // Attack overrides movement
      this.currentAnim = 'Attack_Melee_01';
      // In a real engine, we'd reset isAttacking on anim complete event
      return; 
    }

    // Blend Logic: Speed -> Animation Weight
    // Smooth dampening for realistic inertia
    const targetBlend = Math.min(1.0, Math.max(0.0, this.speed));
    this.blendFactor += (targetBlend - this.blendFactor) * 10.0 * dt;

    // Thresholds for state switching (simplified for mesh swapping engine)
    if (this.blendFactor < 0.05) {
      this.currentAnim = 'Idle_Breath';
    } else {
      this.currentAnim = 'Run_Forward';
    }
  }

  /**
   * Returns the World Transform for a specific bone.
   * Used to attach weapons (e.g. Sword to RightHand).
   */
  public getBoneMatrix(boneName: string, rootX: number, rootY: number, rootZ: number, rotationY: number): Float32Array {
    const mat = new Float32Array(16);
    
    // Mock Bone Offset Logic
    // In reality, this reads from the GLTF skeleton hierarchy
    let offsetX = 0, offsetY = 0, offsetZ = 0;

    if (boneName === 'RightHand') {
      // Offset relative to character center
      offsetX = 0.5; 
      offsetY = 1.2; 
      offsetZ = 0.3;
      
      // Animate hand based on state
      if (this.currentAnim === 'Attack_Melee_01') {
        const swing = Math.sin(this.animTime * 10);
        offsetX += swing * 0.5;
        offsetZ += Math.cos(this.animTime * 10) * 0.5;
      }
    }

    // Rotate offset by character rotation
    const c = Math.cos(rotationY);
    const s = Math.sin(rotationY);
    const wx = offsetX * c - offsetZ * s;
    const wz = offsetX * s + offsetZ * c;

    // Compose Matrix
    mat.fill(0);
    mat[0] = 1; mat[5] = 1; mat[10] = 1; mat[15] = 1; // Identity Rotation (simplified)
    mat[12] = rootX + wx;
    mat[13] = rootY + offsetY;
    mat[14] = rootZ + wz;

    return mat;
  }

  public triggerAttack() {
    this.isAttacking = true;
    this.animTime = 0; // Reset clip
    setTimeout(() => { this.isAttacking = false; }, 500); // 500ms attack duration
    return 'Cleave_01';
  }
}
