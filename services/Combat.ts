
/**
 * Combat module for ALEATORIA.
 * Handles core RNG and situational damage modifiers.
 */
export class Combat {
  /**
   * Standard d20 roll for D&D-style Fate mechanics.
   */
  static rollD20(): number {
    return Math.floor(Math.random() * 20) + 1;
  }

  /**
   * Implements the Alchemy system oil mechanic.
   * Damage_Multiplier = (Weapon_Oil === Enemy_Weakness) ? 2.5 : 0.1.
   * If no oil is applied, multiplier remains 1.0.
   * 
   * @param appliedOil - The name of the oil currently applied to the weapon (e.g., "Specter Oil")
   * @param mobTags - The categories the target belongs to (e.g., ["Specter", "Undead"])
   */
  static getOilMultiplier(appliedOil: string | null, mobTags: string[]): number {
    if (!appliedOil) return 1.0;

    // Standardize: "Specter Oil" matches "Specter" tag
    const requiredTag = appliedOil.split(' ')[0]; 
    const isWeakness = mobTags.includes(requiredTag);

    return isWeakness ? 2.5 : 0.1;
  }
}
