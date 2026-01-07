
import * as THREE from 'three';

export class LootBeam {
    public mesh: THREE.Mesh;
    private time: number = 0;
    private material: THREE.MeshBasicMaterial;

    constructor(rarity: 'RARE' | 'LEGENDARY') {
        const color = rarity === 'LEGENDARY' ? 0xffaa00 : 0x4ade80; // Orange or Green
        const height = 10;
        
        // Geometry: Thin cylinder
        const geometry = new THREE.CylinderGeometry(0.1, 0.1, height, 8, 1, true);
        geometry.translate(0, height / 2, 0); // Pivot at bottom

        // Material: Additive transparency
        this.material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(geometry, this.material);
    }

    public update(dt: number) {
        this.time += dt;
        // Pulse opacity
        const pulse = 0.3 + Math.sin(this.time * 3.0) * 0.2;
        this.material.opacity = pulse;
        
        // Slow rotation
        this.mesh.rotation.y += dt * 0.5;
    }

    public dispose() {
        this.mesh.geometry.dispose();
        this.material.dispose();
    }
}
