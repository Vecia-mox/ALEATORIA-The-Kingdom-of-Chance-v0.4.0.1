
import { CameraRig } from '../camera/CameraRig';
import { CameraFollow } from '../camera/CameraFollow';

/**
 * TITAN ENGINE: CAMERA BOOTSTRAP
 * Hard resets the camera to a safe "God View" position.
 * Prevents the camera from spawning at (0,0,0) or inside geometry.
 */
export class CameraBootstrap {
  
  public static reset(camera: CameraRig, follow?: CameraFollow) {
    console.log("[CameraBootstrap] Forcing Camera Reset...");

    // 1. Force Position (High and Back)
    // Isometric-ish angle: Up 20, Back 20
    const startPos = { x: 0, y: 20, z: 20 };
    camera.setPosition(startPos.x, startPos.y, startPos.z);

    // 2. Force Target (Center of World)
    camera.setTarget(0, 0, 0);

    // 3. Force Update Matrices immediately
    camera.update();

    // 4. Reset Follow Logic (Stop drifting)
    if (follow) {
        follow.teleport(startPos.x, startPos.y, startPos.z);
    }

    console.log("[CameraBootstrap] Camera set to:", camera.position);
  }
}
