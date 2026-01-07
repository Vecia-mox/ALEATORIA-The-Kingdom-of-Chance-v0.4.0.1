
export interface LootEntry {
    type: 'GOLD' | 'ITEM';
    itemId?: string; // For specific items e.g., 'Potion', 'Sword'
    rarity?: 'COMMON' | 'RARE' | 'LEGENDARY'; // For random generation
    chance: number; // 0.0 - 1.0
    min: number;
    max: number;
}

export const LootTables: Record<string, LootEntry[]> = {
    'ZOMBIE': [
        { type: 'GOLD', chance: 0.5, min: 5, max: 15 },
        { type: 'ITEM', itemId: 'Potion', chance: 0.05, min: 1, max: 1 }
    ],
    'TANK': [
        { type: 'GOLD', chance: 1.0, min: 25, max: 60 },
        { type: 'ITEM', rarity: 'RARE', chance: 0.2, min: 1, max: 1 }
    ],
    'ROGUE': [
        { type: 'GOLD', chance: 0.8, min: 10, max: 30 },
        { type: 'ITEM', itemId: 'Dagger', chance: 0.1, min: 1, max: 1 }
    ],
    'BOSS': [
        { type: 'GOLD', chance: 1.0, min: 500, max: 1000 },
        { type: 'ITEM', rarity: 'LEGENDARY', chance: 1.0, min: 1, max: 1 }
    ]
};
