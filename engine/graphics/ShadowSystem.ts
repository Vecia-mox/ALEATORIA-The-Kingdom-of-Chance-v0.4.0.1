
import * as THREE from 'three';

export class ShadowSystem {
    private static scene: THREE.Scene;
    private static shadows: Map<number, THREE.Mesh> = new Map();
    private static texture: THREE.Texture;
    private static geometry: THREE.PlaneGeometry;
    private static material: THREE.MeshBasicMaterial;

    public static init(scene: THREE.Scene) {
        this.scene = scene;
        this.texture = this.createSoftCircleTexture();
        this.geometry = new THREE.PlaneGeometry(1.2, 1.2);
        this.material = new THREE.MeshBasicMaterial({
            map: this.texture,
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
            color: 0x000000,
        });
    }

    public static add(entity: THREE.Object3D) {
        if (!this.scene) return;
        
        const shadow = new THREE.Mesh(this.geometry, this.material);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.02; // Just above ground to avoid z-fighting
        
        this.scene.add(shadow);
        this.shadows.set(entity.id, shadow);
    }

    public static remove(entity: THREE.Object3D) {
        const shadow = this.shadows.get(entity.id);
        if (shadow) {
            this.scene.remove(shadow);
            this.shadows.delete(entity.id);
        }
    }

    public static update(entities: THREE.Object3D[]) {
        entities.forEach(entity => {
            const shadow = this.shadows.get(entity.id);
            if (shadow) {
                if (entity.parent === null) {
                    // Entity removed from scene, clean up shadow
                    this.remove(entity);
                } else {
                    // Follow entity
                    shadow.position.x = entity.position.x;
                    shadow.position.z = entity.position.z;
                    // Optional: Scale shadow based on entity height to fake jumping
                    // shadow.scale.setScalar(1.0 - Math.min(0.5, entity.position.y / 5));
                }
            }
        });
    }

    public static clear() {
        this.shadows.forEach(shadow => this.scene.remove(shadow));
        this.shadows.clear();
    }

    private static createSoftCircleTexture(): THREE.Texture {
        const canvas = document.createElement('canvas');
        canvas.width = 64; 
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
        
        const tex = new THREE.CanvasTexture(canvas);
        return tex;
    }
}
