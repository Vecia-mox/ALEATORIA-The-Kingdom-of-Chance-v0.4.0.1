
import * as THREE from 'three';
import { Item } from '../items/ItemFactory';
import { HeroModel } from '../graphics/HeroModel';
import { AnimationSystem } from '../graphics/AnimationSystem';
import { InventoryManager } from '../items/InventoryManager';
import { ParticleSystem } from '../vfx/ParticleSystem';
import { CollisionSystem } from '../physics/CollisionSystem';
import { MobileBridge } from '../../services/MobileBridge';

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
    
    // Dash State
    private isDashing: boolean = false;
    private dashCooldown: number = 0;
    
    public velocity = new THREE.Vector3(0, 0, 0); // Public for access if needed

    // Combat Stats
    public stats = {
        damage: 5,  // Base
        defense: 0, // Base
        maxHp: 100
    };

    constructor(scene: THREE.Scene, position: THREE.Vector3) {
        this.heroModel = new HeroModel();
        this.mesh = this.heroModel.mesh;
        
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
        // 1. Trigger Dash from Input
        if (MobileBridge.isDodging) {
            this.triggerDash();
            MobileBridge.isDodging = false; // Consume input
        }
        
        // 2. Dash Physics (Override movement)
        if (this.isDashing) {
            // Dash handles its own velocity
            this.applyVelocity(dt);
            return;
        }

        const oldPos = this.mesh.position.clone();

        // 3. Acceleration
        if (input.x !== 0 || input.y !== 0) {
            this.velocity.x += input.x * this.ACCELERATION * dt;
            this.velocity.z += input.y * this.ACCELERATION * dt;
            
            // Snap rotation for responsiveness
            this.mesh.rotation.y = Math.atan2(input.x, input.y);
        }

        // 4. Friction
        this.velocity.x -= this.velocity.x * this.FRICTION * dt;
        this.velocity.z -= this.velocity.z * this.FRICTION * dt;

        // 5. Clamp Speed
        if (this.velocity.length() > this.MAX_SPEED) {
            this.velocity.setLength(this.MAX_SPEED);
        }
        
        this.applyVelocity(dt);

        // 6. Footstep Logic
        const dist = this.mesh.position.distanceTo(oldPos);
        this.distanceTraveled += dist;
        if (this.distanceTraveled > this.STEP_DISTANCE) {
            this.distanceTraveled = 0;
            ParticleSystem.spawnFootstep(this.mesh.position);
        }
    }
    
    private applyVelocity(dt: number) {
        // Apply Position with Wall Sliding
        const dx = this.velocity.x * dt;
        const dz = this.velocity.z * dt;

        const nextX = this.mesh.position.x + dx;
        const nextZ = this.mesh.position.z + dz;

        // Check X axis
        if (CollisionSystem.canMove(nextX, this.mesh.position.z)) {
            this.mesh.position.x = nextX;
        } else {
            this.velocity.x = 0; // Hit wall, kill momentum
        }

        // Check Z axis
        if (CollisionSystem.canMove(this.mesh.position.x, nextZ)) {
            this.mesh.position.z = nextZ;
        } else {
            this.velocity.z = 0; // Hit wall
        }
    }

    public triggerDash() {
        if (this.isDashing || this.dashCooldown > 0) return;
        
        this.isDashing = true;
        this.dashCooldown = 1.0; // 1s Cooldown
        
        // Calculate Forward Vector
        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);
        
        // Add Huge Impulse
        this.velocity.add(forward.multiplyScalar(25.0)); // Burst speed
        
        // Visuals
        ParticleSystem.spawnDust(this.mesh.position);
        
        // End Dash
        setTimeout(() => {
            this.isDashing = false;
        }, 200); // 200ms duration
    }

    public update(dt: number, time: number) {
        const speed = new THREE.Vector2(this.velocity.x, this.velocity.z).length();
        
        // Cooldowns
        if (this.dashCooldown > 0) this.dashCooldown -= dt;
        
        // 1. Base Animation (Walk/Idle)
        // If dashing, force run animation or specialized dash pose if available
        AnimationSystem.update(this.heroModel, speed, false, time);
        
        // 2. HeroModel Override (Swing arm if attacking)
        this.heroModel.update(dt, time);
        
        if (this.attackTimer > 0) this.attackTimer -= dt;
    }

    public triggerAttackAnim() {
        this.attackTimer = 0.3;
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
