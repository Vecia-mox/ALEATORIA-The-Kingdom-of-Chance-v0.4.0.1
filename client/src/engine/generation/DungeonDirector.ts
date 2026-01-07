
import * as THREE from 'three';
import { DungeonArchitect, Room } from './DungeonArchitect';
import { EnemyFactory, EnemyType } from '../entities/EnemyFactory';
import { DifficultyManager } from '../core/DifficultyManager';
import { HUDController } from '../../ui/controllers/HUDController';
import { BossHUD } from '../../ui/controllers/BossHUD';
import { GameDirector } from '../core/GameDirector';
import { PortalEntity } from '../entities/PortalEntity';
import { MerchantEntity } from '../entities/MerchantEntity';
import { InteractionSystem } from '../systems/InteractionSystem';
import { PlayerEntity } from '../entities/PlayerEntity';

export class DungeonDirector {
    public static enemies: THREE.Group[] = [];
    public static boss: THREE.Group | null = null;
    public static portal: PortalEntity | null = null;
    public static merchant: MerchantEntity | null = null;
    
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
        this.clearLevel(scene);

        // 2. Generate Map
        const { rooms } = DungeonArchitect.generate(scene);
        const startRoom = rooms[0];
        const endRoom = rooms[rooms.length - 1]; 
        const startPos = new THREE.Vector3(startRoom.x, 1.0, startRoom.y);

        this.bossRoom = endRoom; // Store for locking

        // --- SPAWN MERCHANT (Safe Zone near Start) ---
        // Spawn randomly around start, ensuring it's not on top of player
        const merchantPos = startPos.clone().add(new THREE.Vector3(3, 0, 3));
        this.merchant = new MerchantEntity(scene, merchantPos.x, merchantPos.z);
        InteractionSystem.register(this.merchant.mesh);

        // 3. Determine Floor Type
        const floor = DifficultyManager.getInstance().currentFloor;
        const isBossFloor = (floor % 5 === 0);

        if (isBossFloor) {
            // Boss Logic
            this.boss = EnemyFactory.createBoss(scene, endRoom.x, endRoom.y);
            this.enemies.push(this.boss);
            BossHUD.show();
            
            // Portal spawns AFTER boss death usually, but for now we spawn it behind
            // Or better: Spawn it but inactive? 
            // For simplicity, spawn it now.
            this.portal = new PortalEntity(scene, endRoom.x, endRoom.y - 8);

        } else {
            // Spawn Regular Mobs
            for (let i = 1; i < rooms.length; i++) {
                const room = rooms[i];
                // Don't spawn in end room if it's reserved (though in normal floors end room is just exit)
                if (room === endRoom) {
                     // Maybe spawn a mini-boss or guard?
                     const guard = EnemyFactory.createEnemy(scene, room.x, room.y, 'TANK');
                     this.enemies.push(guard);
                }

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
            this.portal = new PortalEntity(scene, endRoom.x, endRoom.y);
        }

        HUDController.updateFloor(floor);
        HUDController.showBanner(`FLOOR ${floor}`, "#fbbf24");

        return { enemies: this.enemies, boss: this.boss, startPos };
    }

    private static clearLevel(scene: THREE.Scene) {
        this.enemies.forEach(e => scene.remove(e));
        this.enemies = [];
        
        if (this.boss) {
            scene.remove(this.boss);
            this.boss = null;
        }

        if (this.portal) {
            this.portal.destroy(scene);
            this.portal = null;
        }

        if (this.merchant) {
            // Merchant cleanup? Usually keeping them is fine but if we regen map we must remove.
            // Actually MerchantEntity constructor adds to scene.
            scene.remove(this.merchant.mesh);
            this.merchant = null;
        }
        
        this.unlockArena(scene);
        
        // Note: Walls/Floors are in DungeonArchitect.walls which might need clearing if DungeonArchitect doesn't do it.
        // DungeonArchitect.generate() clears its internal arrays but we need to remove the Group from scene.
        // Assuming DungeonArchitect.generate handles the scene add/remove or we do it here.
        // Looking at DungeonArchitect.generate code: it adds new groups.
        // We should remove old groups.
        if (DungeonArchitect.walls) scene.remove(DungeonArchitect.walls);
        if (DungeonArchitect.props) scene.remove(DungeonArchitect.props);
        
        InteractionSystem.clear();
    }

    public static lockArena(scene: THREE.Scene) {
        if (!this.bossRoom || this.arenaWalls.length > 0) return;

        console.log("🔒 LOCKING ARENA");
        HUDController.showBanner("THE GATES SEAL SHUT!", "#ef4444");

        const room = this.bossRoom;
        const TILE = 4;
        
        const geo = new THREE.BoxGeometry(room.w * TILE, 5, 1);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 });
        
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

    public static nextFloor(scene: THREE.Scene, player: PlayerEntity) {
        if (!this.portal || !this.portal.active) return;
        
        console.log("🌀 Entering Portal...");
        
        // 1. Fade Out
        HUDController.fadeScreen(true, () => {
             // 2. Logic
             DifficultyManager.getInstance().nextFloor();
             
             // 3. Regen
             const result = this.generateLevel(scene);
             
             // 4. Reset Player
             player.mesh.position.copy(result.startPos);
             // player.heal(999); // Optional heal on floor transition?

             // 5. Fade In
             setTimeout(() => {
                 HUDController.fadeScreen(false);
             }, 500);
        });
    }

    public static update(dt: number, time: number) {
        if (this.portal) {
            this.portal.update(dt, time);
        }
    }
}
