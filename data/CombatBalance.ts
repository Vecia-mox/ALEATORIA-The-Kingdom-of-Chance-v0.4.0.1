
export const CombatBalance = {
    // A. ATTRIBUTE WEIGHTS
    HP_PER_VITALITY: 3,         // 1 Vit = 3 Max HP
    DMG_PER_PRIMARY: 0.5,       // 1 Primary Stat = 0.5 Damage
    ARMOR_PER_FORTITUDE: 0.1,   // 10 Fortitude = 1 Armor
    CR_PER_ATTRIBUTE: 1,        // 1 Attribute Point = 1 Combat Rating (CR)

    // B. COMBAT RATING (The "Gear Wall")
    // If Player CR is lower than Mob CR, apply heavy penalties.
    CR_PENALTY_THRESHOLD: 10,       // Gap required to trigger penalty
    LOW_CR_DMG_MULTIPLIER: 0.50,    // Player deals 50% damage
    LOW_CR_TAKEN_MULTIPLIER: 1.50,  // Player takes 150% damage

    // C. SCALING
    LEVEL_SCALING: 1.05,            // Mobs get 5% stronger per level
    BASE_CR_PER_LEVEL: 20,          // Level 10 Mob has 200 CR
    BASE_PLAYER_HP: 100,            // Base HP for players
    BASE_MOB_HP: 100,
    BASE_MOB_DMG: 10,

    /**
     * Scales a base value by level using exponential growth.
     */
    scale: (base: number, level: number): number => {
        return Math.floor(base * Math.pow(CombatBalance.LEVEL_SCALING, level - 1));
    },

    /**
     * Calculates damage reduction from Armor based on attacker level.
     * Formula: DR = Armor / (Armor + 50 * AttackerLevel)
     */
    calculateDamageReduction: (armor: number, attackerLevel: number): number => {
        const denom = armor + (50 * attackerLevel);
        if (denom === 0) return 0;
        return armor / denom;
    }
};
