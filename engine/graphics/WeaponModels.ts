
import * as THREE from 'three';

export class WeaponModels {
    
    private static matMetal = new THREE.MeshStandardMaterial({ 
        color: 0xcccccc, 
        roughness: 0.2, 
        metalness: 0.8 
    });
    
    private static matWood = new THREE.MeshStandardMaterial({ 
        color: 0x8b4513, 
        roughness: 0.9 
    });
    
    private static matGold = new THREE.MeshStandardMaterial({ 
        color: 0xffd700, 
        roughness: 0.3, 
        metalness: 1.0 
    });

    public static create(type: string): THREE.Group {
        const group = new THREE.Group();
        const t = type.toLowerCase();

        if (t.includes('axe')) {
            this.buildAxe(group);
        } else if (t.includes('staff') || t.includes('wand')) {
            this.buildStaff(group);
        } else {
            this.buildSword(group); // Default
        }

        // Standard orientation correction
        // Point "Up" (Y) aligns with Forward (Z) in hand
        group.rotation.x = Math.PI / 2;
        
        return group;
    }

    private static buildSword(group: THREE.Group) {
        // Blade
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.05), this.matMetal);
        blade.position.y = 0.5;
        blade.castShadow = true;
        group.add(blade);

        // Guard
        const guard = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 0.08), this.matGold);
        guard.position.y = 0.1;
        guard.castShadow = true;
        group.add(guard);

        // Handle
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.2, 0.05), this.matWood);
        handle.position.y = -0.05;
        group.add(handle);
        
        // Pommel
        const pommel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), this.matGold);
        pommel.position.y = -0.2;
        group.add(pommel);
    }

    private static buildAxe(group: THREE.Group) {
        // Handle
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.8, 0.05), this.matWood);
        handle.position.y = 0.3;
        group.add(handle);

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.05), this.matMetal);
        head.position.set(0.15, 0.6, 0);
        head.castShadow = true;
        group.add(head);
    }

    private static buildStaff(group: THREE.Group) {
        // Stick
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 1.5, 8), this.matWood);
        stick.position.y = 0.6;
        group.add(stick);

        // Tip (Gem)
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.08), new THREE.MeshBasicMaterial({ color: 0x00ffff }));
        gem.position.y = 1.4;
        group.add(gem);

        // Light
        const light = new THREE.PointLight(0x00ffff, 1.5, 4);
        light.position.y = 1.4;
        group.add(light);
    }
}
