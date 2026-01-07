
import { AssetLoader } from '../assets/AssetLoader';
import { Renderer3D, Renderable } from '../graphics/Renderer3D';

/**
 * TITAN ENGINE: PLAYER AVATAR
 * Manages the 3D Mesh and Transform of the player character.
 */
export class PlayerAvatar {
  private meshId: string = 'mesh_barbarian_t1';
  private materialId: string = 'mat_hero_pbr';
  
  private position: Float32Array = new Float32Array([0, 0, 0]);
  private rotationY: number = 0;
  private scale: Float32Array = new Float32Array([1, 1, 1]);
  
  private modelMatrix: Float32Array = new Float32Array(16);
  private isLoaded: boolean = false;
  
  // Animation Stub
  private currentAnim: string = 'Idle';

  constructor(private renderer: Renderer3D) {}

  public async load() {
    // Load GLB Asset
    console.log("[PlayerAvatar] Loading Barbarian Mesh...");
    // const meshData = await AssetLoader.getInstance().loadModelLOD('barbarian', 0);
    // this.renderer.uploadMesh(this.meshId, meshData);
    this.isLoaded = true;
  }

  public updateTransform(x: number, y: number, z: number, rotY: number) {
    this.position[0] = x;
    this.position[1] = y;
    this.position[2] = z;
    // this.rotationY = rotY; // Bridge updates this separately usually, but sync can override
    this.recalcMatrix();
  }

  public setTargetRotation(angle: number) {
    // Smooth interpolation could go here
    this.rotationY = angle;
    this.recalcMatrix();
  }

  public playAnimation(animName: string) {
    if (this.currentAnim === animName) return;
    this.currentAnim = animName;
    console.log(`[PlayerAvatar] Playing Anim: ${animName}`);
    // Hook into AnimController here
  }

  public getBonePosition(boneName: string): Float32Array {
    // Mock bone position (Right Hand)
    // Offset relative to player pos and rotation
    const handOffset = 0.8;
    return new Float32Array([
        this.position[0] + Math.sin(this.rotationY + 0.5) * handOffset,
        this.position[1] + 1.2,
        this.position[2] + Math.cos(this.rotationY + 0.5) * handOffset
    ]);
  }

  private recalcMatrix() {
    // Compose Model Matrix (Translation * RotationY)
    const c = Math.cos(this.rotationY);
    const s = Math.sin(this.rotationY);

    this.modelMatrix.fill(0);
    
    // Rotation Y
    this.modelMatrix[0] = c;
    this.modelMatrix[2] = -s;
    this.modelMatrix[5] = 1;
    this.modelMatrix[8] = s;
    this.modelMatrix[10] = c;
    this.modelMatrix[15] = 1;
    
    // Translation
    this.modelMatrix[12] = this.position[0];
    this.modelMatrix[13] = this.position[1];
    this.modelMatrix[14] = this.position[2];
  }

  public getRenderable(): Renderable {
    return {
      meshId: this.meshId,
      materialId: this.materialId,
      transform: this.modelMatrix,
      visible: this.isLoaded
    };
  }
}
