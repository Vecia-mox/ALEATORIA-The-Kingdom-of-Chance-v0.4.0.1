
import * as THREE from 'three';
import { ParticleSystem } from '../vfx/ParticleSystem';

export class TownPortal {
    public mesh: THREE.Group;
    private ring: THREE.Mesh;
    private particles: THREE.Points;
    private active: boolean = false;

    constructor(scene: THREE.Scene, x: number, z: number) {
        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 1.5, z);

        // 1. The Ring (Torus)
        const geometry = new THREE.TorusGeometry(1.2, 0.2, 16, 32);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x3b82f6, 
            emissive: 0x2563eb,
            emissiveIntensity: 2.0,
            roughness: 0.2,
            metalness: 0.8
        });
        this.ring = new THREE.Mesh(geometry, material);
        this.mesh.add(this.ring);

        // 2. The Void (Black Center)
        const voidGeo = new THREE.CircleGeometry(1.0, 32);
        const voidMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
        const voidMesh = new THREE.Mesh(voidGeo, voidMat);
        this.mesh.add(voidMesh);

        // 3. Floating Particles (Swirl)
        const particleGeo = new THREE.BufferGeometry();
        const count = 50;
        const positions = new Float32Array(count * 3);
        for(let i=0; i<count; i++) {
            positions[i*3] = (Math.random() - 0.5) * 2;
            positions[i*3+1] = (Math.random() - 0.5) * 2;
            positions[i*3+2] = (Math.random() - 0.5) * 0.5;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({ color: 0x60a5fa, size: 0.1 });
        this.particles = new THREE.Points(particleGeo, particleMat);
        this.mesh.add(this.particles);

        // Light
        const light = new THREE.PointLight(0x3b82f6, 2.0, 10);
        this.mesh.add(light);

        scene.add(this.mesh);
        this.active = true;
    }

    public update(dt: number) {
        if (!this.active) return;
        
        // Spin effect
        this.ring.rotation.z -= 1.0 * dt;
        this.particles.rotation.z -= 2.0 * dt;
        
        // Bobbing
        this.mesh.position.y = 1.5 + Math.sin(Date.now() * 0.002) * 0.2;
    }

    public checkEntry(playerPos: THREE.Vector3): boolean {
        if (!this.active) return false;
        // Simple distance check
        const dist = this.mesh.position.distanceTo(playerPos);
        return dist < 1.5;
    }

    public destroy(scene: THREE.Scene) {
        this.active = false;
        scene.remove(this.mesh);
        // Dispose geometry/materials if needed for memory management
    }
}
