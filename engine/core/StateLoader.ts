
import * as THREE from 'three';
import { SaveData } from './SaveManager';
import { InventoryManager } from '../items/InventoryManager';
import { EconomyManager } from '../economy/EconomyManager';

export class StateLoader {
    
    public static restore(
        data: SaveData, 
        player: THREE.Object3D, 
        inventoryMgr: InventoryManager,
        economyMgr: EconomyManager
    ) {
        if (!data) return;

        console.log("[StateLoader] Restoring World State...");

        // 1. Restore Player
        if (data.position) {
            player.position.set(data.position.x, data.position.y, data.position.z);
        } else {
            // Default position if not in save
            player.position.set(0, 1, 0);
        }

        if (!player.userData.velocity) player.userData.velocity = new THREE.Vector3();
        player.userData.velocity.set(0, 0, 0);

        // 2. Restore Inventory
        inventoryMgr.items = new Array(inventoryMgr.capacity).fill(null);
        if (Array.isArray(data.inventory)) {
            data.inventory.forEach((item, i) => {
                if (i < inventoryMgr.capacity) inventoryMgr.items[i] = item;
            });
        }
        
        inventoryMgr.equippedWeapon = data.equippedWeapon;
        inventoryMgr.equippedArmor = data.equippedArmor;
        
        // 3. Restore Economy
        economyMgr.gold = data.gold || 0;
        
        console.log("[StateLoader] State Applied.");
    }
}
