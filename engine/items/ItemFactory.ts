
export type ItemType = 'WEAPON' | 'ARMOR' | 'POTION';
export type ItemRarity = 'COMMON' | 'RARE' | 'LEGENDARY';

export interface Item {
    id: string;
    name: string;
    type: ItemType;
    rarity: ItemRarity;
    value: number; // Damage for Weapon, Armor for Armor, Heal for Potion
    icon: string;
    color: string; // Hex color for UI
}

export class ItemFactory {
    
    private static PREFIXES = ['Rusty', 'Iron', 'Steel', 'Mithril', 'Titan', 'Ethereal', 'Void'];
    private static WEAPON_NAMES = ['Axe', 'Sword', 'Dagger', 'Mace', 'Blade'];
    private static ARMOR_NAMES = ['Plate', 'Tunic', 'Robes', 'Mail', 'Cuirass'];

    public static createPotion(): Item {
        return {
            id: Math.random().toString(36).substr(2, 9),
            name: "Health Potion",
            type: 'POTION',
            rarity: 'COMMON',
            value: 50,
            icon: "🍷",
            color: "#ffffff"
        };
    }

    public static generateLoot(level: number): Item {
        const typeRoll = Math.random();
        const type: ItemType = typeRoll > 0.5 ? 'WEAPON' : 'ARMOR';
        
        // Rarity
        const rarityRoll = Math.random();
        let rarity: ItemRarity = 'COMMON';
        let multiplier = 1.0;
        let color = '#a3a3a3'; // Grey

        if (rarityRoll > 0.95) {
            rarity = 'LEGENDARY';
            multiplier = 2.5;
            color = '#fbbf24'; // Gold
        } else if (rarityRoll > 0.7) {
            rarity = 'RARE';
            multiplier = 1.5;
            color = '#fbbf24'; // Yellow-ish (using gold for consistency with Diablo style requests)
        }

        // Stats
        const baseValue = level * 5 + Math.floor(Math.random() * 5);
        const value = Math.floor(baseValue * multiplier);

        // Name Generation
        const prefix = this.PREFIXES[Math.min(Math.floor(level / 2), this.PREFIXES.length - 1)] || 'Unknown';
        const baseName = type === 'WEAPON' 
            ? this.WEAPON_NAMES[Math.floor(Math.random() * this.WEAPON_NAMES.length)]
            : this.ARMOR_NAMES[Math.floor(Math.random() * this.ARMOR_NAMES.length)];
        
        const name = `${rarity === 'LEGENDARY' ? 'Ancient ' : ''}${prefix} ${baseName}`;
        const icon = type === 'WEAPON' ? "⚔️" : "🛡️";

        return {
            id: Math.random().toString(36).substr(2, 9),
            name,
            type,
            rarity,
            value,
            icon,
            color
        };
    }
}
