
/**
 * TITAN ENGINE: DESTRUCTION MANAGER
 * Handles object fracturing, mesh swapping, and debris simulation.
 */

import { PhysicsWorld } from './PhysicsWorld';

export interface DestructibleObject {
  id: string;
  originalMeshId: string;
  fracturedMeshId: string; // The ID of the pre-fractured mesh collection
  health: number;
  position: Float32Array;
  rotation: Float32Array;
  shards: ShardDefinition[];
  isBroken: boolean;
}

export interface ShardDefinition {
  id: string;
  offset: Float32Array; // Local position relative to parent
  meshId: string;
  mass: number;
}

export class DestructionManager {
  private physics: PhysicsWorld;
  private scene: any; // Reference to Scene Graph
  private debrisList: { id: string, timer: number }[] = [];

  constructor(scene: any, physics: PhysicsWorld) {
    this.scene = scene;
    this.physics = physics;
  }

  public registerDestructible(obj: DestructibleObject) {
    // Store metadata
  }

  /**
   * Triggers the destruction of an object.
   */
  public fracture(obj: DestructibleObject, impactPoint: Float32Array, impactForce: number) {
    if (obj.isBroken) return;
    obj.isBroken = true;

    // 1. Hide/Remove Original Mesh
    this.scene.setVisible(obj.originalMeshId, false);
    this.physics.removeBody(obj.id); // Remove static collider

    // 2. Spawn Shards
    for (const shard of obj.shards) {
      const worldPos = [
        obj.position[0] + shard.offset[0],
        obj.position[1] + shard.offset[1],
        obj.position[2] + shard.offset[2]
      ];

      // Add visual mesh
      this.scene.addMeshInstance(shard.meshId, worldPos, obj.rotation);

      // Add Physics Body (Dynamic)
      this.physics.addBody({
        id: shard.id,
        type: 'BOX', // Simplified hulls
        size: [0.2, 0.2, 0.2], // Ideally shard.bounds
        mass: shard.mass,
        position: worldPos as [number, number, number]
      }, () => {}); // Sync callback handled by generic system

      // 3. Apply Explosive Force
      // Calculate vector from impact point to shard
      const dx = worldPos[0] - impactPoint[0];
      const dy = worldPos[1] - impactPoint[1];
      const dz = worldPos[2] - impactPoint[2];
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      
      const force = (impactForce / (dist + 0.1)) * 0.5; // Inverse square falloff
      
      this.physics.applyImpulse(shard.id, [
        dx * force,
        dy * force + (force * 0.5), // Add slight up-force
        dz * force
      ]);

      // Register for cleanup
      this.debrisList.push({ id: shard.id, timer: 5.0 }); // 5 seconds life
    }

    // Play Sound / VFX
    // AudioSystem.play3D('crumble', obj.position...);
  }

  public update(dt: number) {
    // Cleanup old debris to save CPU/GPU
    for (let i = this.debrisList.length - 1; i >= 0; i--) {
      const debris = this.debrisList[i];
      debris.timer -= dt;
      if (debris.timer <= 0) {
        // Fade out visual (handled by renderer usually) or pop
        this.scene.removeMeshInstance(debris.id);
        this.physics.removeBody(debris.id);
        this.debrisList.splice(i, 1);
      }
    }
  }
}
