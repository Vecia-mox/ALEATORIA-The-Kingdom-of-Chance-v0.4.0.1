
import * as THREE from 'three';

export class CameraShaker {
    private static trauma: number = 0;
    private static decay: number = 2.0; // Fast recovery
    private static maxOffset: number = 1.0;
    private static offset: THREE.Vector3 = new THREE.Vector3();
    private static seed: number = 0;

    public static addShake(amount: number) {
        this.trauma = Math.min(1.0, this.trauma + amount);
    }

    public static update(dt: number): THREE.Vector3 {
        if (this.trauma > 0) {
            this.trauma = Math.max(0, this.trauma - this.decay * dt);
            
            // Shake = Trauma^2 (Juiciness factor)
            const shake = this.trauma * this.trauma;
            
            this.seed += dt * 10;
            
            this.offset.set(
                (Math.sin(this.seed) * 2 - 1) * this.maxOffset * shake,
                (Math.cos(this.seed * 1.1) * 2 - 1) * this.maxOffset * shake,
                (Math.sin(this.seed * 1.3) * 2 - 1) * this.maxOffset * shake
            );
        } else {
            this.offset.set(0, 0, 0);
        }
        return this.offset;
    }
}
