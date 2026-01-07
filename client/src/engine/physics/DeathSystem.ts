
/**
 * TITAN ENGINE: DEATH SYSTEM
 * Transitions Entities from Animated -> Ragdoll and applies killing blow forces.
 */

import { PhysicsWorld } from './PhysicsWorld';
import { RagdollController } from './RagdollController';

export class DeathSystem {
  private physics: PhysicsWorld;
  private ragdolls: Map<string, RagdollController>;

  constructor(physics: PhysicsWorld, ragdollMap: Map<string, RagdollController>) {
    this.physics = physics;
    this.ragdolls = ragdollMap;
  }

  /**
   * Triggers the death sequence.
   * @param entityId The dying entity
   * @param attackerPos World position of the killer (for direction)
   * @param skillForce Magnitude of the impact (e.g. 500 for Hammer, 50 for Arrow)
   * @param hitBone Name of bone hit (optional, defaults to Chest/Torso)
   */
  public triggerDeath(entityId: string, victimPos: Float32Array, attackerPos: Float32Array, skillForce: number, hitBone: string = 'Spine_02') {
    const ragdoll = this.ragdolls.get(entityId);
    if (!ragdoll) return;

    // 1. Calculate Impact Vector
    const dx = victimPos[0] - attackerPos[0];
    const dy = victimPos[1] - attackerPos[1];
    const dz = victimPos[2] - attackerPos[2];
    
    const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
    const nx = len > 0 ? dx / len : 0;
    const ny = len > 0 ? dy / len : 1; // Default up if on top
    const nz = len > 0 ? dz / len : 0;

    // 2. Add "Lift" to make them fly better (Cinematic feel)
    const liftBias = 0.3; // 30% upward force
    
    // 3. Enable Ragdoll Physics
    // Pass initial velocity if tracked, otherwise 0
    ragdoll.enableRagdoll(new Float32Array([0, 0, 0])); 

    // 4. Apply The "Yeet" Impulse
    // We target a specific physics body in the ragdoll (e.g., Chest)
    const bodyId = `${entityId}_ragdoll_${hitBone}`;
    
    const finalForce = [
      nx * skillForce,
      (ny + liftBias) * skillForce,
      nz * skillForce
    ];

    // Apply Linear Impulse
    this.physics.applyImpulse(bodyId, new Float32Array(finalForce));

    // 5. Apply Torque (Spin) for glancing blows or added chaos
    // A random torque makes ragdolls tumble naturally
    const torque = [
      (Math.random() - 0.5) * skillForce * 0.1,
      (Math.random() - 0.5) * skillForce * 0.5, // Spin around Y mostly
      (Math.random() - 0.5) * skillForce * 0.1
    ];
    // This requires PhysicsWorld to support applyTorque (assumed Phase 20 feature)
    // this.physics.applyTorque(bodyId, new Float32Array(torque));
    
    console.log(`[Death] ${entityId} blasted with force ${skillForce}`);
  }
}
