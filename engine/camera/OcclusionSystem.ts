
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Renderer3D } from '../graphics/Renderer3D';

/**
 * TITAN ENGINE: OCCLUSION SYSTEM
 * "See-Through Walls" logic. 
 * Raycasts from Camera to Player. Fades out any geometry in the way.
 */
export class OcclusionSystem {
  private physics: PhysicsWorld;
  
  // Track currently faded objects to restore them
  // Map<RenderMeshID, OriginalOpacity>
  private fadedObjects: Map<string, number> = new Map();
  private readonly FADE_OPACITY = 0.25;
  private readonly WALL_MASK = 1 << 1; // Assume bit 2 is walls

  constructor(physics: PhysicsWorld) {
    this.physics = physics;
  }

  public update(cameraPos: Float32Array, playerPos: Float32Array) {
    // 1. Calculate Ray
    const direction = [
      playerPos[0] - cameraPos[0],
      playerPos[1] - cameraPos[1],
      playerPos[2] - cameraPos[2]
    ];
    const distance = Math.sqrt(direction[0]**2 + direction[1]**2 + direction[2]**2);
    
    // Normalize direction
    const invDist = 1.0 / distance;
    direction[0] *= invDist;
    direction[1] *= invDist;
    direction[2] *= invDist;

    // 2. Raycast
    // Note: Ideally raycastAll to catch multiple walls. 
    // Assuming PhysicsWorld.raycast returns the closest hit.
    const hit = this.physics.raycast(
      [cameraPos[0], cameraPos[1], cameraPos[2]], 
      direction, 
      distance - 2.0, // Stop short of player
      this.WALL_MASK
    );

    const hitId = hit.hit ? `wall_${hit.point[0].toFixed(0)}_${hit.point[2].toFixed(0)}` : null; 

    // 3. Process Fades
    const activeFades = new Set<string>();

    if (hit.hit && hitId) {
      activeFades.add(hitId);
      
      // If new hit, fade it out
      if (!this.fadedObjects.has(hitId)) {
        // We assume we can get/set material props on renderer or trigger an event
        // For MVP, we log the intent. In a real engine, we'd access the Material Instance.
        this.fadedObjects.set(hitId, 1.0); 
        // Renderer.setOpacity(hitId, this.FADE_OPACITY);
      }
    }

    // 4. Restore objects no longer hit
    for (const [id, originalOpacity] of this.fadedObjects) {
      if (!activeFades.has(id)) {
        // Restore
        // Renderer.setOpacity(id, originalOpacity);
        this.fadedObjects.delete(id);
      }
    }
  }
}
