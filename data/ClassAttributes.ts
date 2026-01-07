
import { ClassType } from '../types';

export type AttributeKey = 'strength' | 'intelligence' | 'fortitude' | 'vitality' | 'willpower';

export const CLASS_PRIMARY_ATTRIBUTE: Record<ClassType, AttributeKey> = {
  [ClassType.BARBARIAN]: 'strength',
  [ClassType.PALADIN]: 'strength', // Crusader equivalent
  [ClassType.ROGUE]: 'strength', // Demon Hunter equivalent
  [ClassType.ASSASSIN]: 'strength', // Monk equivalent
  
  [ClassType.SORCERER]: 'intelligence', // Wizard equivalent
  [ClassType.NECROMANCER]: 'intelligence',
  [ClassType.DRUID]: 'intelligence',
};

export const ATTRIBUTE_DESCRIPTIONS: Record<AttributeKey, { title: string, desc: string }> = {
  strength: {
    title: 'Strength',
    desc: 'Increases Damage for physical classes and Armor for all classes.',
  },
  intelligence: {
    title: 'Intelligence',
    desc: 'Increases Damage for magical classes and Resistance for all classes.',
  },
  fortitude: {
    title: 'Fortitude',
    desc: 'Increases Armor and Armor Penetration.',
  },
  vitality: {
    title: 'Vitality',
    desc: 'Increases Maximum Life.',
  },
  willpower: {
    title: 'Willpower',
    desc: 'Increases Potency and Resistance.',
  }
};
