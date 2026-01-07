
import * as THREE from 'three';
import { BuffManager, BuffType } from '../combat/BuffManager';
import { GlowMaterial } from '../graphics/GlowMaterial';

export class Shrine {
    public mesh: THREE.Group;
    public isConsumed: boolean = false;
    private type: BuffType;
    private crystal: THREE.Mesh;
    private floatOffset: number = 0;

    constructor(scene: THREE.Scene, x: number, z: number, type: BuffType) {
        this.type = type;
        this.mesh = new THREE.Group();
        this.mesh.position.set(x, 0, z);
        this.floatOffset = Math.random() * 100;

        // Colors
        let color = 0xffffff;
        if (type === 'FRENZY') color = 0xff0000;
        if (type === 'SWIFTNESS') color = 0x0000ff;
        if (type === 'VITALITY') color = 0x00ff00;

        // Base (Stone Pedestal)
        const baseGeo = new THREE.CylinderGeometry(0.5, 0.7, 0.8, 6);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x44403c });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.4;
        base.receiveShadow = true;
        this.mesh.add(base);

        // Crystal (Floating Diamond)
        const gemGeo = new THREE.OctahedronGeometry(0.4);
        const gemMat = new THREE.MeshStandardMaterial({ 
            color: color, 
            emissive: color,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.9
        });
        this.crystal = new THREE.Mesh(gemGeo, gemMat);
        this.crystal.position.y = 1.5;
        this.mesh.add(this.crystal);

        // Light
        const light = new THREE.PointLight(color, 2.0, 8);
        light.position.y = 2.0;
        this.mesh.add(light);

        // Label (Simple text sprite could go here, or just rely on color)

        scene.add(this.mesh);
    }

    public update(dt: number, playerPos: THREE.Vector3) {
        if (this.isConsumed) return;

        // Animation
        const time = Date.now() * 0.001 + this.floatOffset;
        this.crystal.rotation.y += 1.0 * dt;
        this.crystal.position.y = 1.5 + Math.sin(time * 2.0) * 0.1;

        // Interaction Check (Proximity)
        const dist = this.mesh.position.distanceTo(playerPos);
        if (dist < 1.5) {
            this.activate(playerPos);
        }
    }

    private activate(playerPos: THREE.Vector3) {
        this.isConsumed = true;
        
        // Apply Buff (30 seconds)
        BuffManager.activate(this.type, 30000, playerPos);

        // Disable Visuals (Keep mesh for now or remove? Let's dim it)
        this.crystal.visible = false;
        // Optionally play a particle burst here via ParticleSystem
    }
}
