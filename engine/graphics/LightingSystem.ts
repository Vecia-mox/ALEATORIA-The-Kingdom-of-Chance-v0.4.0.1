
import * as THREE from 'three';

export class LightingSystem {
    public static init(scene: THREE.Scene) {
        // 1. HEMISPHERE LIGHT (The "Global Fill")
        // Sky Color: Deep Blue (0x222255) - Simulates ambient magic.
        // Ground Color: Dark Grey (0x111111) - Simulates bounce light.
        // Intensity: 1.5 (High visibility base)
        const hemi = new THREE.HemisphereLight(0x222255, 0x111111, 1.5);
        scene.add(hemi);

        // 2. AMBIENT LIGHT (The "Base" Brightness)
        // Raises the black level so shadows are dark grey, not void black.
        const ambient = new THREE.AmbientLight(0x404040, 1.0); 
        scene.add(ambient);

        // Note: Fog is now handled in GameLoop.ts to coordinate with clear color
    }

    public static createTorch(): THREE.PointLight {
        // 1. High-Intensity Fire (Orange/Gold)
        // Range increased for better gameplay visibility
        const light = new THREE.PointLight(0xFFAA00, 5.0, 80); 
        
        // 2. High Quality Shadows
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.bias = -0.0005; 
        light.shadow.radius = 2; // Soft edges
        light.decay = 2;

        return light;
    }
}
