
import * as THREE from 'three';

export class LootVFX {
    public mesh: THREE.Group;
    
    constructor(rarity: 'RARE' | 'LEGENDARY') {
        this.mesh = new THREE.Group();
        
        const color = rarity === 'LEGENDARY' ? 0xffaa00 : 0x4ade80;
        
        // 1. The Beam (Thin Cylinder)
        // 10 units high, 0.05 radius
        const geo = new THREE.CylinderGeometry(0.05, 0.05, 10.0, 8, 1, true);
        geo.translate(0, 5.0, 0); // Pivot at bottom
        
        const mat = new THREE.MeshBasicMaterial({ 
            color: color, 
            transparent: true, 
            opacity: 0.5,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        const beam = new THREE.Mesh(geo, mat);
        this.mesh.add(beam);

        // 2. Ground Ring (Simple marker)
        const ringGeo = new THREE.RingGeometry(0.3, 0.4, 32);
        const ringMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.05;
        this.mesh.add(ring);
    }
}
