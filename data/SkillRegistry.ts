
import { Stats } from '../types';

type DamageFormula = (stats: Stats) => number;

/**
 * Registry of damage calculation formulas for skills.
 * Scales skill damage based on player attributes.
 */
export const SKILL_SCALING: Record<string, DamageFormula> = {
  // BARBARIAN
  'lunging_strike': (s) => 10 + (s.strength * 0.4),
  'bash': (s) => 12 + (s.strength * 0.45) + (s.fortitude * 0.1),
  'frenzy': (s) => 8 + (s.strength * 0.3),
  'whirlwind': (s) => 15 + (s.strength * 0.4),
  'hammer_ancients': (s) => 30 + (s.strength * 0.8),
  
  // SORCERER
  'arc_lash': (s) => 8 + (s.intelligence * 0.35),
  'fire_bolt': (s) => 10 + (s.intelligence * 0.4),
  'frost_bolt': (s) => 9 + (s.intelligence * 0.35),
  'fireball': (s) => 25 + (s.intelligence * 0.7),
  'ice_shards': (s) => 18 + (s.intelligence * 0.5),
  
  // ROGUE
  'puncture': (s) => 8 + (s.strength * 0.3) + (s.fortitude * 0.1), // DH uses Str/Fort in this model
  'heartseeker': (s) => 10 + (s.strength * 0.35),
  'twisting_blades': (s) => 20 + (s.strength * 0.6),
  'rapid_fire': (s) => 25 + (s.strength * 0.5),

  // PALADIN (Crusader)
  'punish': (s) => 10 + (s.strength * 0.3) + (s.fortitude * 0.2), // Scales with Armor (Fort)
  'smite': (s) => 12 + (s.strength * 0.3) + (s.willpower * 0.2),
  'blessed_hammer': (s) => 18 + (s.strength * 0.5),
  'shield_bash': (s) => 20 + (s.strength * 0.3) + (s.fortitude * 0.3), // Shield Bash

  // NECROMANCER
  'decompose': (s) => 8 + (s.intelligence * 0.3) + (s.willpower * 0.1),
  'bone_spear': (s) => 22 + (s.intelligence * 0.6),
  
  // DRUID
  'storm_strike': (s) => 10 + (s.intelligence * 0.3) + (s.willpower * 0.2),
  'claw': (s) => 10 + (s.strength * 0.4), // Shapeshift uses Str
  'pulverize': (s) => 30 + (s.strength * 0.6) + (s.fortitude * 0.2), // Bear is tanky
};

export const getSkillDamage = (skillId: string, stats: Stats): number => {
    const formula = SKILL_SCALING[skillId];
    if (formula) {
        return Math.floor(formula(stats));
    }
    // Default fallback: 20% of Primary Stat + 5 base
    // Use highest stat as proxy for primary if unknown
    const maxStat = Math.max(stats.strength, stats.intelligence, stats.fortitude, stats.willpower, stats.vitality);
    return Math.floor(5 + (maxStat * 0.2));
};
