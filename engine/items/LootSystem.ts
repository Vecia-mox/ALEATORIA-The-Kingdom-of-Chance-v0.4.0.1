
import * as THREE from 'three';
import { WorldItem, Rarity } from './WorldItem';
import { DamageNumbers } from '../ui/DamageNumbers';
import { AudioManager } from '../audio/AudioManager';
import { WorldLabels } from '../../ui/vfx/WorldLabels';
import { LootTables } from './LootTable';
import { ItemFactory } from './ItemFactory';
import { InventoryManager } from './InventoryManager';
import { EconomyManager } from '../economy/EconomyManager';

export class LootSystem {
    private scene: THREE.Scene;
    private items: WorldItem[] = [];
    
    private inventoryMgr: InventoryManager | null = null;
    private economyMgr: EconomyManager | null = null;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public init(inventoryMgr: InventoryManager, economyMgr: EconomyManager) {
        this.inventoryMgr = inventoryMgr;
        this.economyMgr = economyMgr;
    }

    public spawnLoot(enemyType: string, position: THREE.Vector3) {
        const table = LootTables[enemyType] || LootTables['ZOMBIE'];
        
        table.forEach(entry => {
            if (Math.random() < entry.chance) {
                const amount = Math.floor(Math.random() * (entry.max - entry.min + 1)) + entry.min;
                
                if (entry.type === 'GOLD') {
                    this.spawnWorldItem(position, 'GOLD', 'COMMON', amount);
                } else if (entry.type === 'ITEM') {
                    const rarity = entry.rarity || 'COMMON';
                    const type = entry.itemId || 'Iron Sword'; // Default
                    this.spawnWorldItem(position, type, rarity, 1);
                }
            }
        });
    }

    public spawnWorldItem(pos: THREE.Vector3, type: string, rarity: Rarity, value: number) {
        // Random spread
        const dropPos = pos.clone();
        dropPos.x += (Math.random() - 0.5) * 1.5;
        dropPos.z += (Math.random() - 0.5) * 1.5;
        
        const item = new WorldItem(this.scene, dropPos, type, rarity, value);
        this.items.push(item);
        
        // Optional: WorldLabels.add(item); 
    }

    public update(playerPos: THREE.Vector3) {
        const dt = 0.016; 
        const time = Date.now() / 1000;
        
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            item.update(dt, time);

            const dist = item.mesh.position.distanceTo(playerPos);
            
            // 1. MAGNETIC PICKUP
            if (dist < 3.0) {
                // Fast swoop to player
                item.mesh.position.lerp(playerPos, 10.0 * dt);
                // Shrink
                item.mesh.scale.subScalar(2.0 * dt);
                if (item.mesh.scale.x < 0.1) item.mesh.scale.setScalar(0.1);
            }

            // 2. COLLECT
            if (dist < 0.5) {
                this.collect(i);
            }
        }
    }

    private collect(index: number) {
        const item = this.items[index];
        item.isCollected = true;
        
        if (item.type === 'GOLD') {
            if (this.economyMgr) this.economyMgr.earn(item.value);
            AudioManager.getInstance().play('coin');
        } else {
            // It's an item
            if (this.inventoryMgr) {
                if (item.type === 'POTION') {
                    this.inventoryMgr.addItem(ItemFactory.createPotion());
                } else {
                    // Re-generate Item Data if not stored on WorldItem
                    // In a real system WorldItem would hold the full Item object.
                    // Here we mock it based on type string.
                    const newItem = ItemFactory.generateLoot(1); 
                    newItem.name = item.type; // "Iron Sword"
                    if (item.rarity === 'LEGENDARY') newItem.rarity = 'LEGENDARY';
                    else if (item.rarity === 'RARE') newItem.rarity = 'RARE';
                    
                    this.inventoryMgr.addItem(newItem);
                }
            }
            AudioManager.getInstance().play('ding');
        }

        // Cleanup
        this.scene.remove(item.mesh);
        this.items.splice(index, 1);
    }
}
