
import * as THREE from 'three';

export class CameraSystem {
    private camera: THREE.Camera;
    private target: THREE.Object3D;
    
    // Smooth Follow
    private currentOffset: THREE.Vector3;
    private targetOffset: THREE.Vector3;
    private basePosition: THREE.Vector3;

    // Shake
    private shakeIntensity: number = 0;

    // Configs
    private static readonly DEFAULT_OFFSET = new THREE.Vector3(0, 20, 20); 

    constructor(camera: THREE.Camera, target: THREE.Object3D) {
        this.camera = camera;
        this.target = target;
        
        this.targetOffset = CameraSystem.DEFAULT_OFFSET.clone();
        this.currentOffset = this.targetOffset.clone();
        this.basePosition = target.position.clone().add(this.currentOffset);
    }

    public triggerShake(amount: number) {
        this.shakeIntensity = Math.min(this.shakeIntensity + amount, 2.0); // Cap at 2.0
    }

    public update(dt: number) {
        if (!this.target) return;

        // 1. Follow Logic
        this.currentOffset.lerp(this.targetOffset, 2.0 * dt);
        const idealPos = this.target.position.clone().add(this.currentOffset);
        this.basePosition.lerp(idealPos, 0.1); 

        // 2. Apply Shake
        const shakeOffset = new THREE.Vector3();
        if (this.shakeIntensity > 0) {
            shakeOffset.x = (Math.random() - 0.5) * this.shakeIntensity;
            shakeOffset.y = (Math.random() - 0.5) * this.shakeIntensity;
            shakeOffset.z = (Math.random() - 0.5) * this.shakeIntensity;
            
            // Decay
            this.shakeIntensity = Math.max(0, this.shakeIntensity - (5.0 * dt));
        }

        // 3. Set Final Position
        this.camera.position.copy(this.basePosition).add(shakeOffset);
        this.camera.lookAt(this.target.position);
    }
}
