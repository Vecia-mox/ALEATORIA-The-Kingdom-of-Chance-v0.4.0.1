
import * as THREE from 'three';
import { DifficultyManager } from '../core/DifficultyManager';
import { EnemyEntity } from './EnemyEntity';
import { GlowMaterial } from '../graphics/GlowMaterial';

export type EnemyType = 'ZOMBIE' | 'TANK' | 'ROGUE';

export class EnemyFactory {
    
    private static createMaterial(color: number, intensity: number = 0.5) {
        return new THREE.MeshStandardMaterial({ 
            color: color, 
            roughness: 0.3,
            emissive: color, 
            emissiveIntensity: intensity
        });
    }

    private static matZombie = this.createMaterial(0x44aa44, 0.2); // Green
    private static matTank = this.createMaterial(0x882222, 0.3);   // Dark Red
    private static matRogue = this.createMaterial(0xaaaa22, 0.4);  // Yellow

    private static matBoss = new THREE.MeshStandardMaterial({ 
        color: 0xff0000, 
        roughness: 0.1,
        emissive: 0xff0000, 
        emissiveIntensity: 2.0
    });

    private static matBossCrown = new THREE.MeshStandardMaterial({ 
        color: 0xffd700, 
        emissive: 0xffaa00,
        emissiveIntensity: 1.0
    });

    public static createEnemy(scene: THREE.Scene, x: number, z: number, type: EnemyType = 'ZOMBIE'): EnemyEntity {
        
        let scale = 1.0;
        let mat = this.matZombie;
        let speed = 4.0;
        let hpMult = 1.0;
        let damage = 10;

        if (type === 'TANK') {
            scale = 1.5;
            mat = this.matTank;
            speed = 2.0;
            hpMult = 2.5;
            damage = 20;
        } else if (type === 'ROGUE') {
            scale = 0.8;
            mat = this.matRogue;
            speed = 7.0;
            hpMult = 0.6;
            damage = 15;
        }

        const dm = DifficultyManager.getInstance();
        const config = {
            type,
            hp: dm.getEnemyHP(40 * hpMult),
            maxHp: dm.getEnemyHP(40 * hpMult),
            speed,
            damage
        };

        // Use new Entity Class
        const enemy = new EnemyEntity(x, z, config);

        // Visuals
        const bodyGeo = new THREE.BoxGeometry(0.4 * scale, 0.6 * scale, 0.2 * scale);
        const headGeo = new THREE.BoxGeometry(0.3 * scale, 0.3 * scale, 0.3 * scale);
        const limbGeo = new THREE.BoxGeometry(0.1 * scale, 0.6 * scale, 0.1 * scale);

        const body = new THREE.Mesh(bodyGeo, mat);
        body.position.y = 0.9 * scale;
        body.castShadow = true;
        (enemy as unknown as THREE.Group).add(body);

        const head = new THREE.Mesh(headGeo, mat);
        head.position.y = 1.45 * scale;
        (enemy as unknown as THREE.Group).add(head);

        const lArm = new THREE.Mesh(limbGeo, mat);
        lArm.position.set(-0.35 * scale, 0.9 * scale, 0);
        (enemy as unknown as THREE.Group).add(lArm);

        const rArm = new THREE.Mesh(limbGeo, mat);
        rArm.position.set(0.35 * scale, 0.9 * scale, 0);
        (enemy as unknown as THREE.Group).add(rArm);

        scene.add(enemy);
        return enemy;
    }

    public static createBoss(scene: THREE.Scene, x: number, z: number): EnemyEntity {
        const dm = DifficultyManager.getInstance();
        const config = {
            type: 'BOSS',
            hp: dm.getEnemyHP(500),
            maxHp: dm.getEnemyHP(500),
            speed: 3.5,
            damage: 30
        };

        const boss = new EnemyEntity(x, z, config);
        boss.userData.isBoss = true;

        // Visuals
        const geo = new THREE.BoxGeometry(1.5, 2.5, 1.5);
        const body = new THREE.Mesh(geo, this.matBoss);
        body.position.y = 1.25;
        body.castShadow = true;
        (boss as unknown as THREE.Group).add(body);

        const crownGeo = new THREE.TorusGeometry(0.6, 0.1, 8, 16);
        const crown = new THREE.Mesh(crownGeo, this.matBossCrown);
        crown.rotation.x = Math.PI / 2;
        crown.position.y = 3.0;
        (boss as unknown as THREE.Group).add(crown);

        const light = new THREE.PointLight(0xff0000, 3.0, 15);
        light.position.y = 2.0;
        (boss as unknown as THREE.Group).add(light);

        scene.add(boss);
        return boss;
    }
}
