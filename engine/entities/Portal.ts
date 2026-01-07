
import * as THREE from 'three';
import { GameDirector } from '../core/GameDirector';
import { HUDController } from '../../ui/controllers/HUDController';

export class Portal {
    public mesh: THREE.Group;
    private ring: THREE.Mesh;
    private particles: THREE.Points;
    private light: THREE.PointLight;
    public isActive: boolean = false;
    private isEntered: boolean = false;

    constructor(scene: THREE.Scene, x: number, z: number) {
        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 1.5, z);

        // 1. The Ring (Torus) - Dark Grey initially
        const geometry = new THREE.TorusGeometry(1.2, 0.2, 16, 32);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x333333, 
            emissive: 0x000000,
            roughness: 0.5,
            metalness: 0.8
        });
        this.ring = new THREE.Mesh(geometry, material);
        this.mesh.add(this.ring);

        // 2. The Void (Black Center)
        const voidGeo = new THREE.CircleGeometry(1.0, 32);
        const voidMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
        const voidMesh = new THREE.Mesh(voidGeo, voidMat);
        this.mesh.add(voidMesh);

        // 3. Floating Particles (Swirl) - Initially hidden/few
        const particleGeo = new THREE.BufferGeometry();
        const count = 100;
        const positions = new Float32Array(count * 3);
        for(let i=0; i<count; i++) {
            positions[i*3] = (Math.random() - 0.5) * 2;
            positions[i*3+1] = (Math.random() - 0.5) * 2;
            positions[i*3+2] = (Math.random() - 0.5) * 0.5;
        }
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({ color: 0x0088ff, size: 0.05, transparent: true, opacity: 0 });
        this.particles = new THREE.Points(particleGeo, particleMat);
        this.mesh.add(this.particles);

        // 4. Light (Off)
        this.light = new THREE.PointLight(0x0088ff, 0, 5);
        this.mesh.add(this.light);

        scene.add(this.mesh);
    }

    public activate() {
        if (this.isActive) return;
        this.isActive = true;

        // Visual Transformation
        (this.ring.material as THREE.MeshStandardMaterial).color.setHex(0x0088ff);
        (this.ring.material as THREE.MeshStandardMaterial).emissive.setHex(0x0044aa);
        (this.ring.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.0;
        
        this.light.intensity = 4.0;
        (this.particles.material as THREE.PointsMaterial).opacity = 0.8;
        (this.particles.material as THREE.PointsMaterial).size = 0.1;

        HUDController.showBanner("THE EXIT IS OPEN!", "#0088ff");
    }

    public update(dt: number, playerPos: THREE.Vector3) {
        // Animation
        this.ring.rotation.z -= (this.isActive ? 2.0 : 0.5) * dt;
        this.particles.rotation.z -= (this.isActive ? 3.0 : 0.5) * dt;
        
        // Bobbing
        this.mesh.position.y = 1.5 + Math.sin(Date.now() * 0.002) * 0.1;

        if (!this.isActive || this.isEntered) return;

        // Check Entry
        const dist = this.mesh.position.distanceTo(playerPos);
        if (dist < 1.5) {
            this.isEntered = true;
            GameDirector.triggerNextLevel();
        }
    }

    public destroy(scene: THREE.Scene) {
        scene.remove(this.mesh);
        this.mesh.traverse((c: any) => {
            if (c.geometry) c.geometry.dispose();
            if (c.material) c.material.dispose();
        });
    }
}
