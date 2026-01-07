
import { Light } from './Renderer3D';

/**
 * TITAN ENGINE: LIGHTING RIG
 * Configures the "Gothic" atmosphere using a cinematic 3-point setup.
 */
export class LightingRig {
  
  /**
   * Calculates the light set for the current frame.
   * Includes static environment lights and dynamic player lights.
   */
  public getFrameLights(playerPos: {x: number, y: number, z: number}): Light[] {
    const lights: Light[] = [];

    // 1. KEY LIGHT (The Moon)
    // Blueish-Grey, casting shadows from Top-Left
    lights.push({
      type: 'DIRECTIONAL',
      position: new Float32Array([-0.5, -1.0, -0.5]), // Direction vector
      color: new Float32Array([0.4, 0.5, 0.7]), // Blueish Grey
      intensity: 0.5,
      radius: 0 // Infinite
    });

    // 2. FILL LIGHT (The Torch)
    // Orange, Attached to Player Belt, illuminates the floor
    lights.push({
      type: 'POINT',
      position: new Float32Array([playerPos.x, playerPos.y + 1.5, playerPos.z]),
      color: new Float32Array([1.0, 0.5, 0.0]), // Fire Orange
      intensity: 2.0,
      radius: 12.0 // Falloff distance
    });

    // 3. RIM LIGHT (The Outline)
    // Spot light aiming at player's back to pop them from background
    // Positioned behind and above camera target
    lights.push({
      type: 'SPOT',
      position: new Float32Array([playerPos.x, playerPos.y + 5.0, playerPos.z - 4.0]),
      color: new Float32Array([1.0, 1.0, 1.0]), // White
      intensity: 1.0,
      radius: 20.0
    });

    return lights;
  }
}
