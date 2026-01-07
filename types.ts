
export enum Alignment {
  NEUTRAL = 'NEUTRAL',
  LAWFUL = 'LAWFUL',
  CRIMINAL = 'CRIMINAL',
}

export enum TimeState {
  DAY = 'DAY',
  NIGHT = 'NIGHT',
}

export enum WeatherType {
  CLEAR = 'CLEAR',
  RAIN = 'RAIN',
  ASH = 'ASH',
}

export enum ClassType {
  BARBARIAN = 'BARBARIAN',
  SORCERER = 'SORCERER',
  NECROMANCER = 'NECROMANCER',
  DRUID = 'DRUID',
  ROGUE = 'ROGUE',
  PALADIN = 'PALADIN',
  ASSASSIN = 'ASSASSIN',
}

export enum ShrineType {
  BLAST = 'BLAST',         // Periodic AoE damage
  GREED = 'GREED',         // Gold on hit
  PROTECTION = 'PROTECTION', // Invulnerability
  SPEED = 'SPEED',         // 50% Move Speed
}

export interface Shrine {
  id: string;
  type: ShrineType;
  pos: Position;
  isUsed: boolean;
}

export interface Stats {
  strength: number;     // Physical Dmg + Armor
  intelligence: number; // Magic Dmg + Resist
  fortitude: number;    // Armor + Armor Pen
  vitality: number;     // Life
  willpower: number;    // Potency + Resist
  
  // Computed
  combatRating: number;
  damage: number;
  hp: number;
  armor: number;
  
  // Secondary / Legacy derived
  ac: number;           // Mapped to Armor
  attack: number;       // Mapped to Damage
  critChance: number;   
}

export interface ItemAffix {
  label: string; 
  type: 'STAT' | 'DMG' | 'DEF' | 'MISC';
  value: number;
  statKey?: keyof Stats; 
}

export interface Item {
  id: string;
  name: string;
  type: 'WEAPON' | 'ARMOR' | 'JEWELRY' | 'CONSUMABLE' | 'MISC' | 'POTION_ORB' | 'GEM';
  slot?: 'HEAD' | 'CHEST' | 'HANDS' | 'LEGS' | 'FEET' | 'RING_1' | 'RING_2' | 'AMULET' | 'MAIN_HAND' | 'OFF_HAND';
  icon: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY' | 'UNIQUE';
  description: string;
  itemPower: number;
  requiredLevel: number;
  affixes: ItemAffix[];
  setName?: string; // For Set Bonuses
  sellValue?: number;
  sockets: number;
  gems: Item[]; // Gems currently socketed
}

export interface Equipment {
  HEAD?: Item;
  CHEST?: Item;
  HANDS?: Item;
  LEGS?: Item;
  FEET?: Item;
  AMULET?: Item;
  RING_1?: Item;
  RING_2?: Item;
  MAIN_HAND?: Item;
  OFF_HAND?: Item;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  classType: ClassType;
  level: number;
  exp: number;
  maxExp: number;
  unspentPoints: number;
  skillPoints: number; 
  skillRanks: Record<string, number>; 
  skillLoadout: Record<number, string>; // Slot Index (1-4) -> Skill ID
  baseStats: Stats; // Naked stats
  stats: Stats;     // Effective stats (Base + Gear)
  alignment: Alignment;
  pos: Position;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  potionCharges: number;
  maxPotionCharges: number;
  potionRefillTimestamp?: number; // Timestamp when potions will refill
  activeBuffs: Record<string, number>; 
  isFrozen: boolean;
  frozenDuration: number;
  karma: number;
  gold: number;
  inventory: Item[];
  equipment: Equipment;
}

export interface Player extends Character {
  lastAttackTimestamp: number;
}

export type MobTier = 'NORMAL' | 'ELITE' | 'BOSS';

export interface Mob {
  id: string;
  definitionId: string; // 'goblin', 'orc'
  type: string; // Display name
  level: number;
  tier: MobTier;
  tags: string[];
  hp: number;
  maxHp: number;
  pos: Position;
  stats: Stats;
  expValue: number;
  
  // Combat State
  isElite: boolean; // Deprecated in favor of tier, kept for compat
  modifiers: string[]; 
  abilityCooldowns?: Record<string, number>;
  
  // Attack Sync
  isAttacking: boolean;
  attackStartTime: number; // Timestamp when animation started
  damageDealt: boolean;    // Has the damage frame passed for this attack?
  lastAttackTime?: number; // Timestamp of the last attack initiation
}

export interface Prop {
  id: string;
  type: string; // 'tree', 'rock', 'wall', 'shrub'
  x: number;
  y: number;
  width: number;
  height: number;
  isSolid: boolean;
  variation: number; // 0-3 for visual variety
}

export interface Chunk {
  id: string; // "x,y"
  x: number;
  y: number;
  width: number; // Tiles across
  height: number; // Tiles down
  data: number[][]; // 2D array of tile IDs
  mobs: Mob[];
  props: Prop[];
  shrines: Shrine[];
  biome: string;
}

export interface TradeOffer {
  items: Item[];
  gold: number;
  isLocked: boolean;
}

export interface TradeSession {
  id: string;
  initiatorId: string;
  partnerId: string;
  partnerName: string;
  initiatorOffer: TradeOffer;
  partnerOffer: TradeOffer;
  status: 'NEGOTIATING' | 'READY' | 'COMPLETED' | 'CANCELLED';
}

export interface WorldState {
  players: Record<string, Player>;
  activeChunks: Record<string, Chunk>; // Keyed by "x,y"
  gameTime: number; // 0 to 2400
  timeState: TimeState;
  weather: WeatherType;
  tickCount: number;
  activeProjectiles?: any[]; // For syncing delayed effects like Frozen circles
}

export interface Position {
  x: number;
  y: number;
}

// --- CLASS DATA INTERFACES ---

export type SkillCategory = 
  'Basic' | 'Core' | 'Defensive' | 'Macabre' | 'Corruption' | 'Summoning' | 
  'Brawling' | 'Weapon Mastery' | 'Wrath' | 'Ultimate' | 'Agility' | 
  'Subterfuge' | 'Imbuement' | 'Trap' | 'Companion' | 'Conjuration' | 'Mastery' | 'Passive';

export interface ClassSkill {
  id: string;
  name: string;
  type: SkillCategory;
  desc: string;
  icon: string;
  unlockLevel: number;
  maxRank: number;
  damageType?: string; 
  manaCost?: number; 
  cooldown?: number; 
}

export interface ClassDetail {
  type: ClassType;
  name: string;
  icon: string;
  color: string;      
  borderColor: string; 
  hex: string;        
  gradient: string;   
  tagline: string;
  lore: string;
  bonuses: Partial<Stats>;
  primaryAttribute: string; // Display string
  complexity: 'Low' | 'Medium' | 'High';
  skills: ClassSkill[];
}
