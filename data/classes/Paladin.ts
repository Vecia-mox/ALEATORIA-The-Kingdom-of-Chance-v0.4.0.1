
import { ClassDetail, ClassType } from '../../types';

export const PaladinData: ClassDetail = {
  type: ClassType.PALADIN,
  name: "Paladin",
  icon: "🛡️",
  color: "text-amber-500",
  borderColor: "border-amber-500",
  hex: "#f59e0b",
  gradient: "from-amber-950/80 to-black",
  tagline: "Crusader of Light",
  lore: "Clad in heavy plate and unwavering faith, Paladins stand as the bulwark against darkness.",
  bonuses: { strength: 14, fortitude: 10, intelligence: 12, vitality: 16, willpower: 14 },
  primaryAttribute: "Strength",
  complexity: "Low",
  skills: [
    // BASIC
    { id: 'punish', name: "Punish", type: "Basic", desc: "Strike enemy and increase block chance.", icon: "🛡️", unlockLevel: 1, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },
    { id: 'smite', name: "Smite", type: "Basic", desc: "Smite an enemy with holy fire.", icon: "🔥", unlockLevel: 1, maxRank: 5, damageType: "Holy", manaCost: 0, cooldown: 0 },
    { id: 'slash', name: "Slash", type: "Basic", desc: "Cleave the air in front of you.", icon: "⚔️", unlockLevel: 2, maxRank: 5, damageType: "Fire", manaCost: 0, cooldown: 0 },

    // CORE
    { id: 'blessed_hammer', name: "Blessed Hammer", type: "Core", desc: "Summon a magic hammer that spirals outward.", icon: "🔨", unlockLevel: 5, maxRank: 5, damageType: "Holy", manaCost: 20, cooldown: 0 },
    { id: 'sweep_attack', name: "Sweep Attack", type: "Core", desc: "Sweep a mystical flail through enemies.", icon: "⛓️", unlockLevel: 5, maxRank: 5, damageType: "Physical", manaCost: 25, cooldown: 0 },
    { id: 'shield_bash', name: "Shield Bash", type: "Core", desc: "Bash enemies, damage based on shield block.", icon: "🛡️", unlockLevel: 6, maxRank: 5, damageType: "Physical", manaCost: 30, cooldown: 0 },
    { id: 'fist_heavens', name: "Fist of the Heavens", type: "Core", desc: "Lightning strikes target.", icon: "⚡", unlockLevel: 7, maxRank: 5, damageType: "Lightning", manaCost: 35, cooldown: 0 },

    // DEFENSIVE
    { id: 'consecration', name: "Consecration", type: "Defensive", desc: "Create holy ground that heals allies.", icon: "🌅", unlockLevel: 10, maxRank: 5, damageType: "Holy", manaCost: 0, cooldown: 20 },
    { id: 'iron_skin_paladin', name: "Iron Skin", type: "Defensive", desc: "Skin becomes hard as iron.", icon: "🦾", unlockLevel: 11, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 25 },
    { id: 'glare', name: "Shield Glare", type: "Defensive", desc: "Blind enemies in front of you.", icon: "🔆", unlockLevel: 12, maxRank: 5, damageType: "Holy", manaCost: 0, cooldown: 12 },

    // UTILITY
    { id: 'steed_charge', name: "Steed Charge", type: "Brawling", desc: "Mount a celestial steed and charge.", icon: "🐎", unlockLevel: 17, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 20 },
    { id: 'condemn', name: "Condemn", type: "Brawling", desc: "Build up massive explosion.", icon: "💣", unlockLevel: 18, maxRank: 5, damageType: "Holy", manaCost: 0, cooldown: 15 },
    { id: 'judgment', name: "Judgment", type: "Brawling", desc: "Immobilize enemies in an area.", icon: "⚖️", unlockLevel: 18, maxRank: 5, damageType: "Holy", manaCost: 0, cooldown: 20 },

    // ULTIMATE
    { id: 'falling_sword', name: "Falling Sword", type: "Ultimate", desc: "Crash down from heavens dealing massive holy damage.", icon: "⚔️", unlockLevel: 35, maxRank: 1, damageType: "Holy", manaCost: 0, cooldown: 60 },
    { id: 'akarat', name: "Akarat's Champion", type: "Ultimate", desc: "Transform into avatar of Order.", icon: "🤴", unlockLevel: 35, maxRank: 1, damageType: "Holy", manaCost: 0, cooldown: 90 },
    { id: 'heavens_fury', name: "Heaven's Fury", type: "Ultimate", desc: "Beam of holy light burns enemies.", icon: "🔦", unlockLevel: 35, maxRank: 1, damageType: "Holy", manaCost: 0, cooldown: 20 }
  ]
};