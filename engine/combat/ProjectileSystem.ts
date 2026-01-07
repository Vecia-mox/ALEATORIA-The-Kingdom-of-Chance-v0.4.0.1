
import * as THREE from 'three';
import { DamageNumbers } from '../ui/DamageNumbers';
import { ParticleSystem } from '../vfx/ParticleSystem';
import { LevelingManager } from '../core/LevelingManager';
import { EnemyProjectile } from './EnemyProjectile';
import { LootSystem } from '../items/LootSystem'; 
import { SkillFactory } from '../vfx/SkillFactory';

// Internal Player Projectile Class
class PlayerProjectile {
    public mesh: THREE.Group;
    public velocity: THREE.Vector3;
    public isDead: boolean = false;
    private life: number = 3.0;
    private sceneRef: THREE.Scene;

    constructor(scene: THREE.Scene, pos: THREE.Vector3, velocity: THREE.Vector3) {
        this.sceneRef = scene;
        this.velocity = velocity;
        
        // Use SkillFactory for visuals
        this.mesh = SkillFactory.createBlastProjectile();
        this.mesh.position.copy(pos);
    }

    update(dt: number) {
        this.life -= dt;
        if (this.life <= 0) {
            this.isDead = true;
            return;
        }
        
        // Spawn Trail (Simple Squares)
        this.spawnTrail();

        this.mesh.position.add(this.velocity.clone().multiplyScalar(dt));
    }

    private spawnTrail() {
        const trailGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const trailMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 });
        const trail = new THREE.Mesh(trailGeo, trailMat);
        
        trail.position.copy(this.mesh.position);
        // Jitter
        trail.position.x += (Math.random() - 0.5) * 0.2;
        trail.position.y += (Math.random() - 0.5) * 0.2;
        trail.position.z += (Math.random() - 0.5) * 0.2;
        
        this.sceneRef.add(trail);

        // Animate removal
        const fade = () => {
            if (!trail.parent) return;
            trail.scale.multiplyScalar(0.9);
            trailMat.opacity -= 0.1;
            if (trailMat.opacity <= 0) {
                this.sceneRef.remove(trail);
                trailGeo.dispose();
                trailMat.dispose();
            } else {
                requestAnimationFrame(fade);
            }
        };
        fade();
    }
}

export class ProjectileSystem {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private lootSystem: LootSystem | null = null;
    
    private playerProjectiles: PlayerProjectile[] = [];
    private enemyProjectiles: EnemyProjectile[] = [];

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;
    }

    public setLootSystem(ls: LootSystem) {
        this.lootSystem = ls;
    }

    public spawn(pos: THREE.Vector3, velocity: THREE.Vector3) {
        const proj = new PlayerProjectile(this.scene, pos, velocity);
        this.scene.add(proj.mesh);
        this.playerProjectiles.push(proj);
    }

    public spawnEnemyProjectile(pos: THREE.Vector3, velocity: THREE.Vector3) {
        const proj = new EnemyProjectile(pos, velocity);
        this.scene.add(proj.mesh);
        this.enemyProjectiles.push(proj);
    }

    public update(dt: number, enemies: THREE.Group[], player: THREE.Mesh) {
        // 1. Update Player Projectiles (Hit Enemies)
        for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
            const p = this.playerProjectiles[i];
            p.update(dt);

            if (p.isDead) {
                this.removePlayerProj(i);
                continue;
            }

            for (const enemy of enemies) {
                if (enemy.userData.isDead) continue;
                if (p.mesh.position.distanceTo(enemy.position) < 1.5) {
                    this.onPlayerHitEnemy(enemy, p.mesh.position, player);
                    p.isDead = true;
                    this.removePlayerProj(i);
                    break;
                }
            }
        }

        // 2. Update Enemy Projectiles (Hit Player)
        for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
            const p = this.enemyProjectiles[i];
            p.update(dt, player);

            if (p.isDead) {
                this.removeEnemyProj(i);
                continue;
            }
        }
    }

    private removePlayerProj(index: number) {
        const p = this.playerProjectiles[index];
        this.scene.remove(p.mesh);
        this.playerProjectiles.splice(index, 1);
    }

    private removeEnemyProj(index: number) {
        const p = this.enemyProjectiles[index];
        this.scene.remove(p.mesh);
        this.enemyProjectiles.splice(index, 1);
    }

    private onPlayerHitEnemy(enemy: THREE.Group, impactPos: THREE.Vector3, player: THREE.Mesh) {
        const damage = 50;
        enemy.userData.hp -= damage;
        DamageNumbers.spawn(enemy.position, damage, this.camera, true);
        ParticleSystem.spawn('EXPLOSION', impactPos);

        if (enemy.userData.hp <= 0 && !enemy.userData.isDead) {
            enemy.userData.isDead = true;
            LevelingManager.gainXP(player, 20, this.camera);
            
            if (this.lootSystem) {
                this.lootSystem.spawnLoot(enemy.userData.type || 'ZOMBIE', enemy.position);
            }

            const animateDeath = () => {
                enemy.rotation.x -= 0.1;
                enemy.position.y -= 0.05;
                if (enemy.position.y > -2) requestAnimationFrame(animateDeath);
                else this.scene.remove(enemy);
            };
            animateDeath();
        } else {
            // Flash red on hit
            enemy.children.forEach((m: any) => {
                if (m.material && m.material.emissive) {
                    const old = m.material.emissive.getHex();
                    m.material.emissive.setHex(0xff0000);
                    m.material.emissiveIntensity = 1.0;
                    setTimeout(() => { 
                        if (m.material) {
                            m.material.emissive.setHex(old);
                            m.material.emissiveIntensity = m.userData.baseEmissive || 0;
                        }
                    }, 100);
                }
            });
        }
    }
}
