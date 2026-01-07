
import * as THREE from 'three';
import { MobileBridge } from '../../services/MobileBridge';
import { DamageNumbers } from '../ui/DamageNumbers';
import { SpellLibrary } from './SpellLibrary';
import { ProjectileSystem } from './ProjectileSystem';
import { CombatUI } from '../../ui/controllers/CombatUI';
import { VFXFactory } from '../vfx/VFXFactory';
import { SkillFactory } from '../vfx/SkillFactory';
import { PlayerStats } from '../core/PlayerStats';

export class SkillSystem {
    private scene: THREE.Scene;
    private particleGroup: THREE.Group;
    private projSystem: ProjectileSystem;

    // State
    public isLeaping: boolean = false;
    private leapVelocity: THREE.Vector3 = new THREE.Vector3();
    
    // Config
    private readonly COST_SPIN = 15;
    private readonly COST_LEAP = 10;
    private readonly COST_BLAST = 20;
    private readonly COST_HEAL = 40;

    // Cooldowns
    private cooldowns: Record<string, number> = {
        spin: 0,
        leap: 0,
        blast: 0,
        heal: 0
    };

    constructor(scene: THREE.Scene, projSystem: ProjectileSystem) {
        this.scene = scene;
        this.projSystem = projSystem;
        this.particleGroup = new THREE.Group();
        this.scene.add(this.particleGroup);
        
        // Initialize VFX
        VFXFactory.init(scene);
    }

    public update(player: THREE.Mesh, enemies: THREE.Group[], camera: THREE.Camera, dt: number) {
        const now = Date.now();

        // --- A: WHIRLWIND (SPIN) ---
        if (MobileBridge.skill1) {
            if (now > this.cooldowns.spin && PlayerStats.consumeMana(this.COST_SPIN)) {
                this.triggerSpin(player, enemies, camera);
                this.cooldowns.spin = now + 500; // 0.5s CD
                CombatUI.triggerCooldown('1', 500);
            }
            MobileBridge.skill1 = false; 
        }

        // --- B: LEAP (JUMP) ---
        if (MobileBridge.skill2) {
            if (!this.isLeaping && now > this.cooldowns.leap && PlayerStats.consumeMana(this.COST_LEAP)) {
                this.triggerLeap(player);
                this.cooldowns.leap = now + 2000;
                CombatUI.triggerCooldown('2', 2000);
            }
            MobileBridge.skill2 = false;
        }

        // --- C: FIREBALL (BLAST) ---
        if (MobileBridge.skill3) {
            if (now > this.cooldowns.blast && PlayerStats.consumeMana(this.COST_BLAST)) {
                SpellLibrary.castFireball(player, this.projSystem);
                this.cooldowns.blast = now + 3000; // 3.0s CD
                CombatUI.triggerCooldown('3', 3000);
            }
            MobileBridge.skill3 = false;
        }

        // --- D: HEAL (CROSS) ---
        if (MobileBridge.skill4) {
            if (now > this.cooldowns.heal && PlayerStats.consumeMana(this.COST_HEAL)) {
                this.triggerHeal(player);
                this.cooldowns.heal = now + 5000; // 5.0s CD
                CombatUI.triggerCooldown('4', 5000);
            }
            MobileBridge.skill4 = false;
        }

        // Handle Physics for Skills
        if (this.isLeaping) {
            player.position.add(this.leapVelocity.clone().multiplyScalar(dt));
            this.leapVelocity.y -= 20 * dt; // Gravity

            if (player.position.y <= 0) {
                // Landed
                player.position.y = 0;
                this.isLeaping = false;
                this.leapImpact(player, enemies, camera);
            }
        }
    }

    private triggerSpin(player: THREE.Mesh, enemies: THREE.Group[], camera: THREE.Camera) {
        // Visual
        player.rotation.y += Math.PI * 2; 
        SkillFactory.spawnSpin(this.scene, player.position);

        // Logic: 360 AoE
        enemies.forEach(e => {
            if (e.position.distanceTo(player.position) < 3.0) {
                // Apply Damage
                e.userData.hp -= 15;
                DamageNumbers.spawn(e.position, 15, camera, true);
                // Knockback
                const push = e.position.clone().sub(player.position).normalize().multiplyScalar(2.0);
                e.position.add(push);
            }
        });
    }

    private triggerLeap(player: THREE.Mesh) {
        // Calculate forward vector
        const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.rotation.y);
        this.leapVelocity = forward.multiplyScalar(10); // Forward speed
        this.leapVelocity.y = 10; // Upward jump force
        this.isLeaping = true;
    }

    private leapImpact(player: THREE.Mesh, enemies: THREE.Group[], camera: THREE.Camera) {
        // Visual
        VFXFactory.spawnDust(player.position);

        // Damage Area
        enemies.forEach(e => {
            if (e.position.distanceTo(player.position) < 4.0) {
                e.userData.hp -= 30;
                DamageNumbers.spawn(e.position, 30, camera, true); // Big yellow numbers
            }
        });
    }

    private triggerHeal(player: THREE.Mesh) {
        PlayerStats.heal(30);
        VFXFactory.spawnHeal(player.position);
    }
}
