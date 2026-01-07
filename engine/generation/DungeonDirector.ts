
import * as THREE from 'three';
import { DungeonArchitect, Room } from './DungeonArchitect';
import { EnemyFactory, EnemyType } from '../entities/EnemyFactory';
import { DifficultyManager } from '../core/DifficultyManager';
import { HUDController } from '../../ui/controllers/HUDController';
import { BossHUD } from '../../ui/controllers/BossHUD';
import { GameDirector } from '../core/GameDirector';

export class DungeonDirector {
    public static enemies: THREE.Group[] = [];
    public static boss: THREE.Group | null = null;
    
    // Arena Logic
    private static bossRoom: Room | null = null;
    private static arenaWalls: THREE.Group[] = [];

    public static generateLevel(scene: THREE.Scene): { 
        enemies: THREE.Group[], 
        boss: THREE.Group | null, 
        startPos: THREE.Vector3 
    } {
        console.log("🏗️ DungeonDirector: Generating Level...");
        
        // 1. Cleanup
        this.enemies.forEach(e => scene.remove(e));
        if (this.boss) scene.remove(this.boss);
        this.unlockArena(scene); // Ensure walls are gone
        if (GameDirector.portal) GameDirector.portal.destroy(scene);
        
        this.enemies = [];
        this.boss = null;
        this.bossRoom = null;

        // 2. Generate Map
        const { rooms } = DungeonArchitect.generate(scene);
        const startRoom = rooms[0];
        const endRoom = rooms[rooms.length - 1]; 
        const startPos = new THREE.Vector3(startRoom.x, 1.0, startRoom.y);

        this.bossRoom = endRoom; // Store for locking

        // --- SHADOW TEST PILLAR ---
        // Visual confirmation of lighting changes
        const pillarGeo = new THREE.BoxGeometry(1, 4, 1);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });
        const testPillar = new THREE.Mesh(pillarGeo, pillarMat);
        testPillar.position.set(startPos.x + 3, 2, startPos.z + 2);
        testPillar.castShadow = true;
        testPillar.receiveShadow = true;
        scene.add(testPillar);
        // Add to arenaWalls list just so it gets cleaned up on next level gen (lazy cleanup)
        this.arenaWalls.push(testPillar); 

        // 3. Determine Floor Type
        const floor = DifficultyManager.getInstance().currentFloor;
        const isBossFloor = (floor % 5 === 0);

        if (isBossFloor) {
            // Boss Logic
            this.boss = EnemyFactory.createBoss(scene, endRoom.x, endRoom.y);
            this.enemies.push(this.boss);
            BossHUD.show();
            
            // Place Portal behind boss area
            const portalPos = new THREE.Vector3(endRoom.x, 0, endRoom.y - 8);
            GameDirector.onLevelStart(portalPos, scene);

        } else {
            // Spawn Regular Mobs
            for (let i = 1; i < rooms.length; i++) {
                const room = rooms[i];
                const count = 2 + Math.floor(Math.random() * 3);
                
                for(let k=0; k<count; k++) {
                    const ex = room.x + (Math.random() - 0.5) * (room.w * 2); 
                    const ez = room.y + (Math.random() - 0.5) * (room.h * 2);
                    
                    const roll = Math.random();
                    let type: EnemyType = 'ZOMBIE';
                    if (roll > 0.8) type = 'TANK';
                    else if (roll > 0.6) type = 'ROGUE';

                    const enemy = EnemyFactory.createEnemy(scene, ex, ez, type);
                    this.enemies.push(enemy);
                }
            }
            BossHUD.hide();
            
            // SPAWN PORTAL
            const portalPos = new THREE.Vector3(endRoom.x, 0, endRoom.y);
            GameDirector.onLevelStart(portalPos, scene);
        }

        return { enemies: this.enemies, boss: this.boss, startPos };
    }

    public static lockArena(scene: THREE.Scene) {
        if (!this.bossRoom || this.arenaWalls.length > 0) return;

        console.log("🔒 LOCKING ARENA");
        HUDController.showBanner("THE GATES SEAL SHUT!", "#ef4444");

        const room = this.bossRoom;
        const TILE = 4;
        
        const geo = new THREE.BoxGeometry(room.w * TILE, 5, 1);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 });
        
        // 4 Walls
        const offsets = [
            { x: 0, z: -room.h * TILE / 2 },
            { x: 0, z: room.h * TILE / 2 },
            { x: -room.w * TILE / 2, z: 0, rot: Math.PI/2 },
            { x: room.w * TILE / 2, z: 0, rot: Math.PI/2 },
        ];

        offsets.forEach(off => {
            const wall = new THREE.Mesh(geo, mat);
            wall.position.set(room.x + off.x, 2.5, room.y + off.z);
            if (off.rot) wall.rotation.y = off.rot;
            
            scene.add(wall);
            this.arenaWalls.push(wall);
        });
    }

    public static unlockArena(scene: THREE.Scene) {
        if (this.arenaWalls.length === 0) return;
        
        console.log("🔓 UNLOCKING ARENA");
        HUDController.showBanner("THE WAY IS CLEAR", "#fbbf24");
        
        this.arenaWalls.forEach(wall => scene.remove(wall));
        this.arenaWalls = [];
    }
}
