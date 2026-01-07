
/**
 * TITAN ENGINE: RAGDOLL CONTROLLER
 * Manages transition between Animated Skinned Mesh and Physics Ragdoll.
 */

import { PhysicsWorld } from './PhysicsWorld';

export interface RagdollBone {
  boneName: string;
  colliderType: 'CAPSULE' | 'BOX' | 'SPHERE';
  size: number[]; // Dimensions
  mass: number;
  jointLimits?: { min: number, max: number }; // Angular limits
  linkedBodyId?: string; // Assigned at runtime
}

export class RagdollController {
  private physics: PhysicsWorld;
  private bones: RagdollBone[];
  private entityId: string;
  private isRagdolled: boolean = false;
  
  // Store references to the visual bone transforms
  private boneTransforms: Map<string, any> = new Map();

  constructor(entityId: string, bones: RagdollBone[], physics: PhysicsWorld) {
    this.entityId = entityId;
    this.bones = bones;
    this.physics = physics;
  }

  /**
   * Initializes physics bodies but keeps them kinematic (driven by animation).
   */
  public setup() {
    this.bones.forEach(bone => {
      const id = `${this.entityId}_ragdoll_${bone.boneName}`;
      bone.linkedBodyId = id;

      this.physics.addBody({
        id: id,
        type: bone.colliderType,
        size: bone.size,
        mass: bone.mass,
        position: [0, -1000, 0] // Start inactive/far
      }, (pos, rot) => {
        // Sync Physics -> Visual (Only when ragdolled)
        if (this.isRagdolled) {
          this.updateVisualBone(bone.boneName, pos, rot);
        }
      });

      // Initially kinematic or disabled
      this.physics.setBodyType(id, 'KINEMATIC'); 
    });

    // Create Constraints (Joints) between bones
    // This requires a hierarchy (e.g. Hip -> Leg)
    // Simplified: physics.addConstraint(...)
  }

  /**
   * Called every frame when ALIVE. Syncs Visual Bones -> Physics Bodies.
   */
  public updateKinematic(visualBones: Map<string, {pos: Float32Array, rot: Float32Array}>) {
    if (this.isRagdolled) return;

    this.bones.forEach(bone => {
      if (!bone.linkedBodyId) return;
      const transform = visualBones.get(bone.boneName);
      if (transform) {
        this.physics.setBodyTransform(bone.linkedBodyId, transform.pos, transform.rot);
      }
    });
  }

  /**
   * Triggers the Ragdoll state.
   */
  public enableRagdoll(initialVelocity: Float32Array) {
    if (this.isRagdolled) return;
    this.isRagdolled = true;

    console.log(`[Ragdoll] Entity ${this.entityId} went limp.`);

    this.bones.forEach(bone => {
      if (!bone.linkedBodyId) return;
      
      // 1. Switch to Dynamic
      this.physics.setBodyType(bone.linkedBodyId, 'DYNAMIC');
      
      // 2. Inherit Velocity
      this.physics.setLinearVelocity(bone.linkedBodyId, initialVelocity);
      
      // 3. Add random impulse for variety
      // this.physics.applyImpulse(...)
    });
  }

  private updateVisualBone(name: string, pos: number[], rot: number[]) {
    // Hook into the Renderer/Skeleton to update the visual mesh pose
    // skeleton.setBoneTransform(name, pos, rot);
  }
}
