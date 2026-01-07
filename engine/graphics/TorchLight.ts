
import * as THREE from 'three';

export class TorchLight {
    private light: THREE.PointLight;
    
    constructor(parent: THREE.Object3D) {
        // Warm Orange Fire Color
        this.light = new THREE.PointLight(0xffaa00, 1.5, 12);
        this.light.position.set(0, 1.0, 0.5); // Slightly forward and up (held in hand approx)
        
        // Shadows add depth to the dungeon walls
        this.light.castShadow = true;
        this.light.shadow.bias = -0.001; // Reduce shadow acne
        this.light.shadow.mapSize.width = 1024;
        this.light.shadow.mapSize.height = 1024;
        this.light.shadow.radius = 2; // Soft shadows (PCF)
        
        parent.add(this.light);
    }

    public update(time: number) {
        // Flicker Logic: Base + Sine Wave + Random Noise
        // This creates a "breathing" fire effect with random sparks
        const sine = Math.sin(time * 10) * 0.1;
        const noise = (Math.random() - 0.5) * 0.1;
        
        this.light.intensity = 1.5 + sine + noise;
        
        // Slight position jitter for dancing shadows
        this.light.position.x = (Math.random() - 0.5) * 0.05;
        this.light.position.z = 0.5 + (Math.random() - 0.5) * 0.05;
    }
}
