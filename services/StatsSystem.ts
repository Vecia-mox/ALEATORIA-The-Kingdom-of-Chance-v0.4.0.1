
import { Stats, Character, Equipment, Item, ClassType } from '../types';
import { CombatBalance } from '../data/CombatBalance';
import { CLASS_PRIMARY_ATTRIBUTE, AttributeKey } from '../data/ClassAttributes';

/**
 * StatsSystem implements the core RPG attribute logic modeled after Diablo Immortal.
 */
export class StatsSystem {
  
  private static BASE_CRIT = 0.05; // 5% base crit

  /**
   * Recalculates a character's effective stats based on base attributes, 
   * equipment, and level scaling using DI formulas.
   */
  static recalculate(char: Character): Stats {
    // 1. Initialize with Base Stats
    const effectiveStats: Stats = { 
      strength: char.baseStats.strength || 0,
      intelligence: char.baseStats.intelligence || 0,
      fortitude: char.baseStats.fortitude || 0,
      vitality: char.baseStats.vitality || 0,
      willpower: char.baseStats.willpower || 0,
      
      combatRating: 0,
      damage: 0,
      hp: 0,
      armor: 0,
      ac: 0,
      attack: 0,
      critChance: this.BASE_CRIT
    };

    // 2. Aggregate Attributes from Equipment
    let weaponDamage = 0;

    Object.values(char.equipment).forEach((item) => {
      if (!item) return;
      
      if (item.type === 'WEAPON') {
        weaponDamage += item.itemPower;
      }

      // Affixes
      item.affixes.forEach(affix => {
        if (affix.type === 'STAT' && affix.statKey) {
          effectiveStats[affix.statKey] += affix.value;
        } else if (affix.type === 'DEF' && affix.label.includes('Life')) {
          effectiveStats.hp += affix.value; // Flat HP bonuses
        } else if (affix.type === 'DEF' && affix.label.includes('Armor')) {
          effectiveStats.armor += affix.value; // Flat Armor bonuses
        } else if (affix.type === 'STAT' && affix.label.includes('Crit')) {
            // e.g., +5% Crit Chance -> stored as 5 in value, need to add 0.05
            // But usually stored as integer in value. 
            // Assuming affix value 1 = 1%
            if (affix.label.includes('Chance')) effectiveStats.critChance += (affix.value / 100);
        }
      });

      // Gems
      if (item.gems && item.gems.length > 0) {
          item.gems.forEach(gem => {
              if (gem.name.includes('Ruby')) effectiveStats.hp += 10;
              if (gem.name.includes('Sapphire')) effectiveStats.fortitude += 5;
              if (gem.name.includes('Emerald')) effectiveStats.willpower += 5;
          });
      }
    });

    // 3. Calculate Combat Rating (CR)
    // CR = Sum of all 5 Primary Attributes * Weight
    effectiveStats.combatRating = 
        (effectiveStats.strength + 
        effectiveStats.intelligence + 
        effectiveStats.fortitude + 
        effectiveStats.vitality + 
        effectiveStats.willpower) * CombatBalance.CR_PER_ATTRIBUTE;

    // 4. Calculate Derived Combat Stats based on DI Formulas

    // --- DAMAGE ---
    // Formula: WeaponDamage + (Primary_Attribute * 0.5)
    const primaryKey = CLASS_PRIMARY_ATTRIBUTE[char.classType];
    const primaryValue = effectiveStats[primaryKey];
    effectiveStats.damage = Math.floor(weaponDamage + (primaryValue * CombatBalance.DMG_PER_PRIMARY));

    // --- MAX HP ---
    // Formula: Base_HP + (Vitality * 3)
    const baseHp = CombatBalance.BASE_PLAYER_HP + (char.level * 10);
    effectiveStats.hp += Math.floor(baseHp + (effectiveStats.vitality * CombatBalance.HP_PER_VITALITY));

    // --- ARMOR ---
    // Formula: BaseArmor + (Fortitude * 0.1)
    // Base armor comes from gear mostly, but here we add the attribute contribution
    effectiveStats.armor += Math.floor(effectiveStats.fortitude * CombatBalance.ARMOR_PER_FORTITUDE);

    // 5. Map to Legacy Fields for Compatibility
    effectiveStats.ac = effectiveStats.armor;
    effectiveStats.attack = effectiveStats.damage;
    
    return effectiveStats;
  }

  /**
   * Calculates Max HP based on Level and Vitality (Legacy wrapper).
   */
  static calculateMaxHp(level: number, vit: number, classType: string): number {
    const base = CombatBalance.BASE_PLAYER_HP + (level * 10);
    return Math.floor(base + (vit * CombatBalance.HP_PER_VITALITY));
  }

  /**
   * Calculates Max Mana/Resource based on Willpower/Int.
   */
  static calculateMaxMp(level: number, int: number, wil: number): number {
    const baseMp = 50;
    const scaling = (int * 0.5) + (wil * 0.5) + (level * 2);
    return Math.floor(baseMp + scaling);
  }

  /**
   * Legacy Helper for UI - now just returns computed stat
   */
  static getAttackPower(char: Character): number {
    return char.stats.damage;
  }
}
