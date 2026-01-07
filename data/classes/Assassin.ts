
import { ClassDetail, ClassType } from '../../types';

export const AssassinData: ClassDetail = {
  type: ClassType.ASSASSIN,
  name: "Assassin",
  icon: "👤",
  color: "text-indigo-500",
  borderColor: "border-indigo-500",
  hex: "#6366f1",
  gradient: "from-indigo-950/80 to-black",
  tagline: "Blade of the Void",
  lore: "Trained by a secret order of mage-slayers, Assassins utilize martial arts and mental discipline.",
  bonuses: { strength: 12, fortitude: 16, intelligence: 12, vitality: 10, willpower: 12 },
  primaryAttribute: "Dexterity",
  complexity: "High",
  skills: [
    // BASIC (Martial Arts Generators)
    { id: 'tiger_strike', name: "Tiger Strike", type: "Basic", desc: "Charge up power with successive strikes.", icon: "🐅", unlockLevel: 1, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },
    { id: 'cobra_strike', name: "Cobra Strike", type: "Basic", desc: "Adds poison and lifesteal to charges.", icon: "🐍", unlockLevel: 1, maxRank: 5, damageType: "Poison", manaCost: 0, cooldown: 0 },
    { id: 'fists_fire', name: "Fists of Fire", type: "Basic", desc: "Adds fire damage to charges.", icon: "🔥", unlockLevel: 2, maxRank: 5, damageType: "Fire", manaCost: 0, cooldown: 0 },
    { id: 'claws_thunder', name: "Claws of Thunder", type: "Basic", desc: "Adds lightning to charges.", icon: "⚡", unlockLevel: 2, maxRank: 5, damageType: "Lightning", manaCost: 0, cooldown: 0 },

    // CORE (Finishers)
    { id: 'dragon_talon', name: "Dragon Talon", type: "Core", desc: "Kick enemies away, releasing charges.", icon: "🦶", unlockLevel: 5, maxRank: 5, damageType: "Physical", manaCost: 15, cooldown: 0 },
    { id: 'dragon_tail', name: "Dragon Tail", type: "Core", desc: "Knockback explosion kick.", icon: "💥", unlockLevel: 5, maxRank: 5, damageType: "Fire", manaCost: 20, cooldown: 0 },
    { id: 'phoenix_strike', name: "Phoenix Strike", type: "Core", desc: "Release chaotic elemental damage.", icon: "🐦", unlockLevel: 6, maxRank: 5, damageType: "Fire", manaCost: 25, cooldown: 0 },

    // TRAPS
    { id: 'fire_blast', name: "Fire Blast", type: "Trap", desc: "Throw a small fire bomb.", icon: "💣", unlockLevel: 10, maxRank: 5, damageType: "Fire", manaCost: 10, cooldown: 0 },
    { id: 'shock_web', name: "Shock Web", type: "Trap", desc: "Throw a web of lightning.", icon: "🕸️", unlockLevel: 11, maxRank: 5, damageType: "Lightning", manaCost: 15, cooldown: 0 },
    { id: 'blade_sentinel', name: "Blade Sentinel", type: "Trap", desc: "Throw a spinning blade device.", icon: "⚙️", unlockLevel: 12, maxRank: 5, damageType: "Physical", manaCost: 20, cooldown: 0 },
    { id: 'lightning_sentry', name: "Lightning Sentry", type: "Trap", desc: "Place a trap that shoots lightning.", icon: "🗼", unlockLevel: 17, maxRank: 5, damageType: "Lightning", manaCost: 20, cooldown: 0 },
    { id: 'wake_fire', name: "Wake of Fire", type: "Trap", desc: "Place a trap that shoots fire waves.", icon: "🌊", unlockLevel: 18, maxRank: 5, damageType: "Fire", manaCost: 20, cooldown: 0 },

    // SHADOW
    { id: 'burst_speed', name: "Burst of Speed", type: "Subterfuge", desc: "Increase attack and move speed.", icon: "👟", unlockLevel: 12, maxRank: 5, damageType: "Physical", manaCost: 10, cooldown: 30 },
    { id: 'fade', name: "Fade", type: "Subterfuge", desc: "Raise resistance and reduce curse duration.", icon: "👻", unlockLevel: 18, maxRank: 5, damageType: "Physical", manaCost: 10, cooldown: 30 },
    { id: 'cloak_shadows', name: "Cloak of Shadows", type: "Subterfuge", desc: "Blind enemies and lower defense.", icon: "🌑", unlockLevel: 24, maxRank: 5, damageType: "Physical", manaCost: 15, cooldown: 20 },

    // ULTIMATE
    { id: 'shadow_warrior', name: "Shadow Warrior", type: "Ultimate", desc: "Summon a shadow clone that uses your skills.", icon: "👥", unlockLevel: 35, maxRank: 1, damageType: "Physical", manaCost: 40, cooldown: 60 },
    { id: 'shadow_master', name: "Shadow Master", type: "Ultimate", desc: "Summon a powerful shadow avatar.", icon: "🥷", unlockLevel: 35, maxRank: 1, damageType: "Physical", manaCost: 50, cooldown: 60 },
    { id: 'death_sentry', name: "Death Sentry", type: "Ultimate", desc: "Trap that shoots lightning and explodes corpses.", icon: "💀", unlockLevel: 35, maxRank: 1, damageType: "Lightning", manaCost: 20, cooldown: 0 }
  ]
};