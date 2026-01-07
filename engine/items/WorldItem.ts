
import * as THREE from 'three';
import { WeaponModels } from '../graphics/WeaponModels';
import { LootVFX } from '../vfx/LootVFX';

export type Rarity = 'COMMON' | 'RARE' | 'LEGENDARY';

export class WorldItem {
    public mesh: THREE.Group;
    public isCollected: boolean = false;
    public type: string; 
    public rarity: Rarity;
    public value: number;
    public data: any;
    
    // Animation State
    private floatOffset: number;
    
    constructor(scene: THREE.Scene, position: THREE.Vector3, type: string, rarity: Rarity, value: number = 1, data: any = null) {
        this.type = type;
        this.rarity = rarity;
        this.value = value;
        this.data = data;
        this.floatOffset = Math.random() * 100;

        this.mesh = new THREE.Group();
        this.mesh.position.copy(position);

        // 1. Create 3D Model based on Type
        let model: THREE.Object3D;
        
        if (type === 'GOLD') {
            model = this.createGoldPile();
        } else if (type === 'POTION') {
            model = this.createPotion();
        } else {
            // Weapon/Armor - Use factory
            // We strip 'Ancient ' prefix for model matching if needed, 
            // but WeaponModels usually handles generic types like 'Sword', 'Axe'
            model = WeaponModels.create(type);
            model.scale.set(0.8, 0.8, 0.8); // Slightly smaller drop
        }
        
        this.mesh.add(model);

        // 2. Rarity Beam
        if (rarity === 'RARE' || rarity === 'LEGENDARY') {
            const vfx = new LootVFX(rarity);
            this.mesh.add(vfx.mesh);
            
            // Add PointLight for legendary glow
            if (rarity === 'LEGENDARY') {
                const light = new THREE.PointLight(0xffaa00, 2.0, 5.0);
                light.position.y = 0.5;
                this.mesh.add(light);
            }
        }

        scene.add(this.mesh);
    }

    private createGoldPile(): THREE.Mesh {
        const geo = new THREE.ConeGeometry(0.2, 0.15, 8);
        const mat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 1.0 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 0.075;
        return mesh;
    }

    private createPotion(): THREE.Group {
        const g = new THREE.Group();
        const geo = new THREE.CapsuleGeometry(0.1, 0.2, 4, 8);
        const mat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.2, emissive: 0x550000 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 0.2;
        g.add(mesh);
        return g;
    }

    public update(dt: number, time: number) {
        if (this.isCollected) return;

        // Bobbing
        this.mesh.position.y = 0.5 + Math.sin(time * 2.0 + this.floatOffset) * 0.2;
        
        // Spinning
        this.mesh.rotation.y += 2.0 * dt;
    }
}
