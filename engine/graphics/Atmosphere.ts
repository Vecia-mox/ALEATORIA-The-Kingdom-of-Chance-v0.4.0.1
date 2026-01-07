
import * as THREE from 'three';

export class Atmosphere {
    public static init(scene: THREE.Scene) {
        // Dark Blue/Grey Background for "Dungeon" feel
        const color = 0x050510; 
        
        // Thicker fog to hide the void edges
        scene.fog = new THREE.FogExp2(color, 0.035);
        scene.background = new THREE.Color(color);

        // MOODY LIGHTING: Dim blueish ambient light (Moonlight)
        // Removed the "Emergency White Light" (0xffffff, 2.0)
        const ambient = new THREE.AmbientLight(0x404060, 0.6); 
        scene.add(ambient);

        // Directional Light (Moon) for subtle shadows
        const moon = new THREE.DirectionalLight(0x8888ff, 0.5);
        moon.position.set(-10, 20, -10);
        scene.add(moon);
    }
}
