
import * as THREE from 'three';
import { BossSkills } from '../combat/BossSkills';
import { BossEntity } from '../entities/BossEntity';
import { BossHUD } from '../../ui/controllers/BossHUD';
import { DungeonDirector } from '../generation/DungeonDirector';

type BossState = 'CHASE' | 'PREPARE' | 'COOLDOWN' | 'SUMMONING';

export class BossAI {
    private static state: BossState = 'CHASE';
    private static timer: number = 0;
    private static hasAggroed: boolean = false;
    
    // Config
    private static readonly ATTACK_RANGE = 12.0;
    private static readonly ATTACK_COOLDOWN = 2.0;
    private static readonly SUMMON_COOLDOWN = 15.0;
    private static lastSummonTime: number = 0;

    public static reset() {
        this.state = 'CHASE';
        this.timer = 0;
        this.hasAggroed = false;
        this.lastSummonTime = 0;
    }

    public static update(boss: THREE.Group, player: THREE.Mesh, dt: number, scene: THREE.Scene) {
        if (boss.userData.isDead) {
            // Ensure Arena unlocks if boss dies
            if (this.hasAggroed) {
                DungeonDirector.unlockArena(scene);
                this.hasAggroed = false;
            }
            return;
        }

        const dist = boss.position.distanceTo(player.position);
        
        // 1. Aggro & Lock Logic
        if (!this.hasAggroed && dist < 25.0) {
            this.hasAggroed = true;
            BossHUD.show();
            DungeonDirector.lockArena(scene);
        }

        if (!this.hasAggroed) return;

        // Sync HUD
        BossHUD.update(boss.userData.hp, boss.userData.maxHp);

        // 2. Phase Check
        if (boss.userData.hp < boss.userData.maxHp * 0.5 && !boss.userData.isPhase2) {
            BossEntity.enterPhase2(boss);
        }

        // 3. State Machine
        const now = Date.now() / 1000;

        switch (this.state) {
            case 'CHASE':
                // Phase 2 Summon Check
                if (boss.userData.isPhase2 && (now - this.lastSummonTime > this.SUMMON_COOLDOWN)) {
                    this.state = 'SUMMONING';
                    this.timer = 0;
                    return;
                }

                if (dist > this.ATTACK_RANGE) {
                    // Move
                    const dir = new THREE.Vector3().subVectors(player.position, boss.position).normalize();
                    dir.y = 0;
                    boss.position.add(dir.multiplyScalar(boss.userData.speed * dt));
                    boss.lookAt(player.position.x, boss.position.y, player.position.z);
                } else {
                    // Attack
                    this.state = 'PREPARE';
                    this.timer = 0;
                    BossSkills.groundSlam(boss, player, scene, () => {
                        this.state = 'COOLDOWN';
                        this.timer = 0;
                    });
                }
                break;

            case 'PREPARE':
                // Stuck here until callback from groundSlam fires
                // Can rotate to face player while winding up
                boss.lookAt(player.position.x, boss.position.y, player.position.z);
                break;

            case 'SUMMONING':
                // Brief pause before summon
                this.timer += dt;
                if (this.timer > 1.0) {
                    BossSkills.summonMinions(boss, scene);
                    this.lastSummonTime = now;
                    this.state = 'COOLDOWN';
                    this.timer = 0;
                }
                break;

            case 'COOLDOWN':
                this.timer += dt;
                // Faster cooldown in Phase 2
                const cd = boss.userData.isPhase2 ? this.ATTACK_COOLDOWN * 0.6 : this.ATTACK_COOLDOWN;
                
                if (this.timer > cd) {
                    this.state = 'CHASE';
                }
                break;
        }
    }
}
