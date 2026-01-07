
import { ClassType, ClassDetail } from '../types';
import { BarbarianData } from './classes/Barbarian';
import { SorcererData } from './classes/Sorcerer';
import { NecromancerData } from './classes/Necromancer';
import { DruidData } from './classes/Druid';
import { RogueData } from './classes/Rogue';
import { PaladinData } from './classes/Paladin';
import { AssassinData } from './classes/Assassin';

// Updated Bonuses for Immortal System
// Str, Int, Fort, Vit, Will
BarbarianData.bonuses = { strength: 16, intelligence: 8, fortitude: 12, vitality: 15, willpower: 10 };
SorcererData.bonuses = { strength: 8, intelligence: 18, fortitude: 10, vitality: 12, willpower: 14 };
NecromancerData.bonuses = { strength: 10, intelligence: 16, fortitude: 10, vitality: 12, willpower: 14 };
DruidData.bonuses = { strength: 10, intelligence: 14, fortitude: 12, vitality: 14, willpower: 16 };
RogueData.bonuses = { strength: 16, intelligence: 10, fortitude: 12, vitality: 12, willpower: 10 }; // DH style
PaladinData.bonuses = { strength: 14, intelligence: 10, fortitude: 16, vitality: 14, willpower: 12 }; // Crusader
AssassinData.bonuses = { strength: 14, intelligence: 12, fortitude: 14, vitality: 12, willpower: 14 }; // Monk style

export type { ClassDetail, ClassSkill } from '../types';

export const CLASS_REGISTRY: Record<ClassType, ClassDetail> = {
  [ClassType.BARBARIAN]: BarbarianData,
  [ClassType.SORCERER]: SorcererData,
  [ClassType.NECROMANCER]: NecromancerData,
  [ClassType.DRUID]: DruidData,
  [ClassType.ROGUE]: RogueData,
  [ClassType.PALADIN]: PaladinData,
  [ClassType.ASSASSIN]: AssassinData,
};
