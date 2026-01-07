
import { InventoryManager } from '../items/InventoryManager';

export class StatsManager {
    
    public static calculateDamage(baseStrength: number, inventory: InventoryManager): number {
        let dmg = baseStrength;
        if (inventory.equippedWeapon) {
            dmg += inventory.equippedWeapon.value;
        }
        return dmg;
    }

    public static calculateDefense(baseDefense: number, inventory: InventoryManager): number {
        let def = baseDefense;
        if (inventory.equippedArmor) {
            def += inventory.equippedArmor.value;
        }
        return def;
    }
}
