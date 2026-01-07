
import * as THREE from 'three';

export class WeaponFactory {
    public static createMesh(itemName: string): THREE.Group {
        const group = new THREE.Group();
        const name = itemName.toLowerCase();

        const materialSteel = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.3, metalness: 0.8 });
        const materialWood = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 });
        const materialGold = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 1.0 });
        const materialGlow = new THREE.MeshBasicMaterial({ color: 0x00ffff });

        if (name.includes('sword') || name.includes('blade')) {
            // Blade
            const bladeGeo = new THREE.BoxGeometry(0.1, 1.2, 0.05);
            const blade = new THREE.Mesh(bladeGeo, materialSteel);
            blade.position.y = 0.6;
            group.add(blade);

            // Guard
            const guardGeo = new THREE.BoxGeometry(0.4, 0.05, 0.1);
            const guard = new THREE.Mesh(guardGeo, materialGold);
            guard.position.y = 0.1;
            group.add(guard);

            // Handle
            const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3);
            const handle = new THREE.Mesh(handleGeo, materialWood);
            handle.position.y = -0.15;
            group.add(handle);
        } 
        else if (name.includes('axe')) {
            // Handle
            const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0);
            const handle = new THREE.Mesh(handleGeo, materialWood);
            handle.position.y = 0.4;
            group.add(handle);

            // Blade
            const bladeGeo = new THREE.BoxGeometry(0.5, 0.3, 0.05);
            const blade = new THREE.Mesh(bladeGeo, materialSteel);
            blade.position.y = 0.8;
            blade.position.x = 0.15;
            group.add(blade);
        }
        else if (name.includes('wand') || name.includes('staff')) {
            const height = name.includes('staff') ? 1.8 : 0.8;
            
            // Stick
            const stickGeo = new THREE.CylinderGeometry(0.03, 0.02, height);
            const stick = new THREE.Mesh(stickGeo, materialWood);
            stick.position.y = height / 2 - 0.2;
            group.add(stick);

            // Gem
            const gemGeo = new THREE.OctahedronGeometry(0.08);
            const gem = new THREE.Mesh(gemGeo, materialGlow);
            gem.position.y = height - 0.2;
            group.add(gem);
            
            // Light
            const light = new THREE.PointLight(0x00ffff, 1, 2);
            light.position.y = height - 0.2;
            group.add(light);
        }
        else {
            // Default Dagger/Stick
            const bladeGeo = new THREE.ConeGeometry(0.05, 0.5, 4);
            const blade = new THREE.Mesh(bladeGeo, materialSteel);
            blade.position.y = 0.25;
            group.add(blade);
            
            const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.2);
            const handle = new THREE.Mesh(handleGeo, materialWood);
            handle.position.y = -0.1;
            group.add(handle);
        }

        // Orient weapon to point forward/up
        group.rotation.x = Math.PI / 2; 

        return group;
    }
}
