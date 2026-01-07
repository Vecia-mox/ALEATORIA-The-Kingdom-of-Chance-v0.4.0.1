
import * as THREE from 'three';

export class CameraSafety {
    
    /**
     * Validates and returns a safe position for the camera to look at.
     * Prevents the renderer from receiving NaN/Infinity matrices.
     */
    public static sanitizeTarget(target: THREE.Vector3, fallback: THREE.Vector3): THREE.Vector3 {
        // Check for NaN
        if (isNaN(target.x) || isNaN(target.y) || isNaN(target.z)) {
            console.error("🔥 [CameraSafety] Target is NaN! Switching to fallback.");
            return fallback;
        }

        // Check for Infinity
        if (!isFinite(target.x) || !isFinite(target.y) || !isFinite(target.z)) {
            console.error("🔥 [CameraSafety] Target is Infinite! Switching to fallback.");
            return fallback;
        }

        return target;
    }

    /**
     * Ensures the camera itself isn't in an illegal state.
     */
    public static validateCamera(camera: THREE.Camera) {
        if (isNaN(camera.position.x) || isNaN(camera.position.y) || isNaN(camera.position.z)) {
            console.error("🔥 [CameraSafety] Camera Position Corrupt! Hard Resetting.");
            camera.position.set(0, 20, 20);
            camera.lookAt(0, 0, 0);
        }
    }
}
