
import * as THREE from 'three';

export class SkillFactory {
    
    /**
     * Creates the "Blast" projectile (Glowing Orb).
     */
    public static createBlastProjectile(): THREE.Group {
        const group = new THREE.Group();

        // Core Sphere (Cyan Neon)
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshBasicMaterial({ color: 0x00FFFF });
        const core = new THREE.Mesh(geometry, material);
        group.add(core);

        // Light Source
        const light = new THREE.PointLight(0x00FFFF, 2.0, 8.0);
        group.add(light);

        // Note: Trail particles are handled by the projectile update loop spawning decals/particles
        
        return group;
    }

    /**
     * Spawns the "Spin" effect (Expanding Red Ring) into the scene.
     */
    public static spawnSpin(scene: THREE.Scene, position: THREE.Vector3) {
        const geometry = new THREE.TorusGeometry(1.5, 0.1, 8, 32);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xFF0000, 
            transparent: true, 
            opacity: 0.8 
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2; // Flat on ground
        mesh.position.copy(position); 
        mesh.position.y = 0.5;
        mesh.scale.set(0.1, 0.1, 0.1);
        
        scene.add(mesh);
        
        const animate = () => {
            if (!mesh.parent) return;
            
            // Expand
            mesh.scale.multiplyScalar(1.2); 
            
            // Fade
            material.opacity -= 0.08;
            
            if (material.opacity <= 0) {
                scene.remove(mesh); 
                geometry.dispose(); 
                material.dispose();
            } else {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }
}
