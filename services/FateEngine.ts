
import { Stats } from '../types';
import { Combat } from './Combat';

export interface CombatResult {
  hit: boolean;
  roll: number;
  damage: number;
  isCritical: boolean;
  isWeakness: boolean;
}

/**
 * The Fate Engine implements D&D style dice math.
 * Orchestrates high-level combat resolution using Combat utilities.
 */
export class FateEngine {
  static calculateDamage(
    attackerStats: Stats, 
    defenderStats: Stats, 
    appliedOil: string | null = null,
    targetTags: string[] = []
  ): CombatResult {
    const roll = Combat.rollD20();
    const strMod = Math.floor((attackerStats.strength - 10) / 2);
    const attackRoll = roll + strMod;
    
    const isCritical = roll === 20;
    const hit = isCritical || attackRoll >= defenderStats.ac;
    
    let damage = 0;
    let isWeakness = false;

    if (hit) {
      // Calculate situational multiplier from Alchemy Oils
      const oilMultiplier = Combat.getOilMultiplier(appliedOil, targetTags);
      isWeakness = oilMultiplier > 1.0;
      
      // Base damage: 1d8 + STR modifier
      const baseDmg = Math.floor(Math.random() * 8) + 1 + strMod;
      
      // Apply critical and oil modifiers
      damage = Math.floor(baseDmg * oilMultiplier * (isCritical ? 2 : 1));
    }

    return { hit, roll: attackRoll, damage, isCritical, isWeakness };
  }
}