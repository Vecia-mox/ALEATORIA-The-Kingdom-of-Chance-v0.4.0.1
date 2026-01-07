
import * as THREE from 'three';

export type AnimState = 'IDLE' | 'WALK' | 'ATTACK' | 'HIT';

export class ProcAnimator {
    
    /**
     * Applies procedural transforms to a mesh based on state and time.
     * @param mesh The target mesh (Player or Enemy group)
     * @param state Current behavior state
     * @param time Global time (performance.now() / 1000)
     * @param speed Movement speed factor
     */
    public static animate(mesh: THREE.Object3D, state: AnimState, time: number, speed: number = 1.0) {
        if (!mesh) return;

        // Reset base transforms slightly to avoid drift, but keep position/rotation
        // We modify local scale and y-offset of children usually, but for simple capsules:
        
        switch (state) {
            case 'IDLE':
                // Breathing: Slow scale Y
                const breath = Math.sin(time * 2.0) * 0.03;
                mesh.scale.set(1.0 - breath, 1.0 + breath, 1.0 - breath);
                break;

            case 'WALK':
                // Hopping: Abs Sin wave on Y position
                const hop = Math.abs(Math.sin(time * 12.0 * speed)) * 0.2;
                // Squash/Stretch based on hop
                const squash = Math.cos(time * 12.0 * speed) * 0.1;
                
                mesh.position.y = Math.max(0, mesh.position.y) + hop * 0.1; // Add micro hop to current Y
                mesh.scale.set(1.0 + squash, 1.0 - squash, 1.0 + squash);
                
                // Tilt forward slightly
                mesh.rotation.x = 0.1; 
                break;

            case 'ATTACK':
                // Handled often by Tweens, but we can add vibration here
                mesh.rotation.z = (Math.random() - 0.5) * 0.2;
                mesh.scale.set(1.1, 0.9, 1.1); // Flattened aggressive stance
                break;
                
            case 'HIT':
                // Shaking
                mesh.position.x += (Math.random() - 0.5) * 0.1;
                mesh.position.z += (Math.random() - 0.5) * 0.1;
                break;
        }
    }

    /**
     * Helper to flash a mesh white.
     */
    public static flashColor(mesh: THREE.Mesh, duration: number = 100) {
        if (!mesh.material) return;
        
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const oldColor = mat.emissive.getHex();
        
        mat.emissive.setHex(0xffffff);
        mat.emissiveIntensity = 1.0;

        setTimeout(() => {
            mat.emissive.setHex(oldColor);
            mat.emissiveIntensity = 0.0;
        }, duration);
    }
}
