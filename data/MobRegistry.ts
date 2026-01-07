
export type MobTier = 'NORMAL' | 'ELITE' | 'BOSS';

export interface MobDefinition {
  id: string;
  name: string;
  baseHp: number;
  baseAttack: number; // Base damage stat
  speed: number;
  range: number; // Attack range
  attackDelay: number; // Milliseconds to wait before dealing damage (impact frame)
  attackDuration: number; // Total animation cooldown
  color: string; // Hex for fallback/minimap
  scale: number;
  tags: string[];
}

export const MOB_REGISTRY: Record<string, MobDefinition> = {
  'goblin': { 
    id: 'goblin', 
    name: 'Fallen Scavenger', 
    baseHp: 30, 
    baseAttack: 6, 
    speed: 3.5, 
    range: 45, 
    attackDelay: 300, 
    attackDuration: 800, 
    color: '#ef4444', 
    scale: 0.8,
    tags: ['Demon', 'Small']
  },
  'skeleton': { 
    id: 'skeleton', 
    name: 'Risen Soldier', 
    baseHp: 50, 
    baseAttack: 10, 
    speed: 2.0, 
    range: 55, 
    attackDelay: 500, 
    attackDuration: 1200, 
    color: '#e5e5e5', 
    scale: 1.0,
    tags: ['Undead']
  },
  'orc': { 
    id: 'orc', 
    name: 'Bloodclan Mauler', 
    baseHp: 120, 
    baseAttack: 18, 
    speed: 2.2, 
    range: 65, 
    attackDelay: 600, 
    attackDuration: 1500, 
    color: '#166534', 
    scale: 1.3,
    tags: ['Beast']
  },
  'specter': { 
    id: 'specter', 
    name: 'Vengeful Spirit', 
    baseHp: 40, 
    baseAttack: 14, 
    speed: 3.0, 
    range: 200, // Ranged
    attackDelay: 400, 
    attackDuration: 1000, 
    color: '#38bdf8', 
    scale: 1.0,
    tags: ['Undead', 'Ghost']
  }
};

export const TIER_MULTIPLIERS = {
  'NORMAL': { hp: 1, dmg: 1, scale: 1, tint: 0xffffff },
  'ELITE': { hp: 2.5, dmg: 1.5, scale: 1.25, tint: 0xfef08a }, // Yellowish
  'BOSS': { hp: 8.0, dmg: 3.0, scale: 2.0, tint: 0xff4444 },    // Reddish
};
