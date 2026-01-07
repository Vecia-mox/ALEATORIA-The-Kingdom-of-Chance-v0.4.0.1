
import { CombatBalance } from '../data/CombatBalance';
import { Stats } from '../types';

export interface DamageResult {
  finalDamage: number;
  isCrit: boolean;
  isBlocked: boolean; 
  rawDamage: number;
  mitigation: number;
  crPenalty: number; // Factor applied (e.g. 0.5 for 50% penalty)
}

export class DamageCalculator {
  
  /**
   * Calculates the outcome of an attack including CR gating, crit, and armor.
   */
  static calculate(
    attackerStats: Stats, 
    defenderStats: Stats, 
    attackerLevel: number,
    skillMultiplier: number = 1.0
  ): DamageResult {
    
    // 1. COMBAT RATING CHECK (The Gear Wall)
    const crDiff = attackerStats.combatRating - defenderStats.combatRating;
    let crMultiplier = 1.0;

    // If Attacker is weaker than Defender by threshold
    if (crDiff < -CombatBalance.CR_PENALTY_THRESHOLD) {
        crMultiplier = CombatBalance.LOW_CR_DMG_MULTIPLIER;
    }

    // 2. Base Damage Calculation
    // Base = Attacker Damage * Skill %
    let rawDamage = attackerStats.damage * skillMultiplier;

    // 3. Critical Hit Roll
    const isCrit = Math.random() < attackerStats.critChance;
    if (isCrit) {
      // Default crit damage is +50% (1.5x) if not specified in stats
      // Future: Add critDamage to stats
      rawDamage *= 1.5; 
    }

    // 4. Armor Mitigation
    // Reduction = DefenderArmor / (DefenderArmor + 50 * AttackerLevel)
    const reduction = CombatBalance.calculateDamageReduction(defenderStats.armor, attackerLevel);
    let mitigatedDamage = rawDamage * (1 - reduction);

    // 5. Final Application (CR Penalty)
    let finalDamage = Math.floor(mitigatedDamage * crMultiplier);

    // Ensure at least 1 damage if hit
    finalDamage = Math.max(1, finalDamage);

    return {
      finalDamage,
      isCrit,
      isBlocked: false,
      rawDamage: Math.floor(rawDamage),
      mitigation: reduction,
      crPenalty: crMultiplier
    };
  }
}
