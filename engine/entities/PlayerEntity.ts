
import * as THREE from 'three';
import { Item } from '../items/ItemFactory';
import { HeroModel } from '../graphics/HeroModel';
import { AnimationSystem } from '../graphics/AnimationSystem';
import { InventoryManager } from '../items/InventoryManager';
import { ParticleSystem } from '../vfx/ParticleSystem';

export class PlayerEntity {
    public mesh: THREE.Group;
    public heroModel: HeroModel;
    
    public get bodyMesh(): THREE.Object3D { return this.heroModel.torso; }

    private attackTimer: number = 0;
    
    // Footsteps
    private distanceTraveled: number = 0;
    private readonly STEP_DISTANCE = 1.5;

    // TURBO PHYSICS CONSTANTS
    private readonly ACCELERATION = 80.0;
    private readonly FRICTION = 10.0;
    private readonly MAX_SPEED = 12.0;
    
    private velocity = new THREE.Vector3(0, 0, 0);

    // Combat Stats
    public stats = {
        damage: 5,  // Base
        defense: 0, // Base
        maxHp: 100
    };

    constructor(scene: THREE.Scene, position: THREE.Vector3) {
        this.heroModel = new HeroModel();
        this.mesh = this.heroModel.mesh;
        
        // Init Static Particle System Scene Ref if needed
        // Assuming GameLoop calls ParticleSystem.init(scene), but we can safe guard
        ParticleSystem.init(scene);

        // Init physics pos
        this.mesh.userData = {
            velocity: this.velocity, 
            hp: 100,
            maxHp: 100,
            level: 1,
            xp: 0
        };
        
        // Initial Placement
        this.mesh.position.copy(position);
        
        scene.add(this.mesh);
        this.heroModel.equip('Iron Sword');
    }

    public get position() { return this.mesh.position; }
    public get rotation() { return this.mesh.rotation; }
    public get userData() { return this.mesh.userData; }
    public get uuid() { return this.mesh.uuid; }

    public move(input: {x: number, y: number}, dt: number) {
        const oldPos = this.mesh.position.clone();

        // 1. Acceleration
        if (input.x !== 0 || input.y !== 0) {
            this.velocity.x += input.x * this.ACCELERATION * dt;
            this.velocity.z += input.y * this.ACCELERATION * dt;
            
            // Snap rotation for responsiveness
            this.mesh.rotation.y = Math.atan2(input.x, input.y);
        }

        // 2. Friction
        this.velocity.x -= this.velocity.x * this.FRICTION * dt;
        this.velocity.z -= this.velocity.z * this.FRICTION * dt;

        // 3. Clamp Speed
        if (this.velocity.length() > this.MAX_SPEED) {
            this.velocity.setLength(this.MAX_SPEED);
        }
        
        // 4. Apply Position
        this.mesh.position.x += this.velocity.x * dt;
        this.mesh.position.z += this.velocity.z * dt;

        // 5. Footstep Logic
        const dist = this.mesh.position.distanceTo(oldPos);
        this.distanceTraveled += dist;
        if (this.distanceTraveled > this.STEP_DISTANCE) {
            this.distanceTraveled = 0;
            ParticleSystem.spawnFootstep(this.mesh.position);
        }
    }

    public update(dt: number, time: number) {
        const speed = new THREE.Vector2(this.velocity.x, this.velocity.z).length();
        
        // 1. Base Animation (Walk/Idle)
        AnimationSystem.update(this.heroModel, speed, false, time);
        
        // 2. HeroModel Override (Swing arm if attacking)
        // This must run AFTER AnimationSystem to override arm rotation
        this.heroModel.update(dt, time);
        
        if (this.attackTimer > 0) this.attackTimer -= dt;
    }

    public triggerAttackAnim() {
        this.attackTimer = 0.3;
        // Trigger the procedural animation in HeroModel
        this.heroModel.triggerAttack();
    }

    public equipWeapon(item: Item | null) {
        if (item) {
            this.heroModel.equip(item.name);
        } else {
            this.heroModel.equip('');
        }
    }

    public updateArmorVisuals(item: Item | null) {
        if (!item) {
            this.heroModel.setArmorColor(0x3b82f6);
            return;
        }
        const name = item.name.toLowerCase();
        let color = 0x3b82f6;
        if (name.includes('plate') || name.includes('gold')) color = 0xffd700;
        else if (name.includes('mail') || name.includes('iron')) color = 0xcccccc;
        else if (name.includes('leather') || name.includes('tunic')) color = 0x8b4513;
        
        this.heroModel.setArmorColor(color);
    }

    public updateStats(inventory: InventoryManager) {
        this.stats.damage = 5; 
        this.stats.defense = 0;

        if (inventory.equippedWeapon) {
            this.stats.damage += inventory.equippedWeapon.value;
        }
        if (inventory.equippedArmor) {
            this.stats.defense += inventory.equippedArmor.value;
        }
    }
}
