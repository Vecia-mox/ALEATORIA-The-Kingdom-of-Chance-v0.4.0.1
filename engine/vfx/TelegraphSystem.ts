
import * as THREE from 'three';

interface Telegraph {
    mesh: THREE.Mesh;
    duration: number;
    timer: number;
    onComplete: () => void;
}

export class TelegraphSystem {
    private static scene: THREE.Scene;
    private static telegraphs: Telegraph[] = [];

    public static init(scene: THREE.Scene) {
        this.scene = scene;
    }

    public static spawn(pos: THREE.Vector3, radius: number, duration: number, onComplete: () => void) {
        if (!this.scene) return;

        // Create Red Ring/Disc
        const geometry = new THREE.RingGeometry(0.1, radius, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xff0000, 
            transparent: true, 
            opacity: 0.0, 
            side: THREE.DoubleSide,
            depthWrite: false // Don't occlude other transparent objects
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.copy(pos);
        mesh.position.y = 0.05; // Slightly above ground to prevent z-fighting

        this.scene.add(mesh);

        this.telegraphs.push({
            mesh,
            duration,
            timer: 0,
            onComplete
        });
    }

    public static update(dt: number) {
        for (let i = this.telegraphs.length - 1; i >= 0; i--) {
            const t = this.telegraphs[i];
            t.timer += dt;

            // Animate Opacity (0 -> 0.6)
            const progress = t.timer / t.duration;
            const mat = t.mesh.material as THREE.MeshBasicMaterial;
            mat.opacity = progress * 0.6;

            // Pulse Scale
            const scale = 1.0 + Math.sin(progress * Math.PI * 10) * 0.02;
            t.mesh.scale.set(scale, scale, scale);

            if (t.timer >= t.duration) {
                // Complete
                t.onComplete();
                this.scene.remove(t.mesh);
                t.mesh.geometry.dispose();
                (t.mesh.material as THREE.Material).dispose();
                this.telegraphs.splice(i, 1);
            }
        }
    }
}
