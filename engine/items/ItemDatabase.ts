
export interface ItemDefinition {
    name: string;
    type: 'weapon' | 'armor' | 'consumable';
    damage?: number;
    defense?: number;
    heal?: number;
    price: number;
    icon: string;
    description: string;
}

export const ItemDB: Record<string, ItemDefinition> = {
    'iron_sword': { 
        name: "Iron Sword", type: 'weapon', damage: 10, price: 200, icon: '⚔️', 
        description: "A reliable blade for any adventurer." 
    },
    'steel_armor': { 
        name: "Steel Mail", type: 'armor', defense: 5, price: 300, icon: '🛡️', 
        description: "Standard issue protection." 
    },
    'potion': { 
        name: "Health Potion", type: 'consumable', heal: 50, price: 50, icon: '🍷', 
        description: "Restores 50 Health points." 
    },
    'rusty_axe': { 
        name: "Rusty Axe", type: 'weapon', damage: 5, price: 50, icon: '🪓', 
        description: "Old and brittle, but sharp enough." 
    },
    'tunic': { 
        name: "Tunic", type: 'armor', defense: 2, price: 20, icon: '👕', 
        description: "Basic cloth clothing." 
    }
};
