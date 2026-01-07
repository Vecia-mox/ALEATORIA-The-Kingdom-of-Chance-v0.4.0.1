
import { ClassDetail, ClassType } from '../../types';

export const BarbarianData: ClassDetail = {
  type: ClassType.BARBARIAN,
  name: "Barbarian",
  icon: "⚔️",
  color: "text-rose-500",
  borderColor: "border-rose-500",
  hex: "#f43f5e",
  gradient: "from-rose-950/80 to-black",
  tagline: "The Unstoppable Force",
  lore: "Forged in the frozen crucibles of the Northern Rift, Barbarians do not study warfare—they embody it.",
  bonuses: { strength: 16, fortitude: 12, intelligence: 8, vitality: 15, willpower: 10 },
  primaryAttribute: "Strength",
  complexity: "Low",
  skills: [
    // BASIC
    { id: 'lunging_strike', name: "Lunging Strike", type: "Basic", desc: "Dash and strike an enemy.", icon: "🗡️", unlockLevel: 1, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },
    { id: 'bash', name: "Bash", type: "Basic", desc: "Bash the enemy with your weapon. Has a chance to stun.", icon: "🔨", unlockLevel: 1, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },
    { id: 'frenzy', name: "Frenzy", type: "Basic", desc: "Unleash a rapid flurry of blows. Increases attack speed.", icon: "💨", unlockLevel: 2, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },
    { id: 'flay', name: "Flay", type: "Basic", desc: "Flay the enemy, dealing damage and inflicting Bleeding.", icon: "🩸", unlockLevel: 2, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },

    // CORE
    { id: 'whirlwind', name: "Whirlwind", type: "Core", desc: "Rapidly attack nearby enemies while moving.", icon: "🌪️", unlockLevel: 5, maxRank: 5, damageType: "Physical", manaCost: 25, cooldown: 0 },
    { id: 'hammer_ancients', name: "Hammer of the Ancients", type: "Core", desc: "Slam your hammer down with the fury of the Ancients.", icon: "⚒️", unlockLevel: 5, maxRank: 5, damageType: "Physical", manaCost: 35, cooldown: 0 },
    { id: 'upheaval', name: "Upheaval", type: "Core", desc: "Tear into the ground and fling debris at enemies.", icon: "⛰️", unlockLevel: 6, maxRank: 5, damageType: "Physical", manaCost: 40, cooldown: 0 },
    { id: 'double_swing', name: "Double Swing", type: "Core", desc: "Sweep your weapons from opposite directions.", icon: "⚔️", unlockLevel: 6, maxRank: 5, damageType: "Physical", manaCost: 25, cooldown: 0 },

    // DEFENSIVE
    { id: 'rallying_cry', name: "Rallying Cry", type: "Defensive", desc: "Bellow a rallying cry, increasing Movement Speed and Resource Generation.", icon: "📢", unlockLevel: 10, maxRank: 5, damageType: "None", manaCost: 0, cooldown: 25 },
    { id: 'iron_skin', name: "Iron Skin", type: "Defensive", desc: "Steel yourself, gaining a Barrier that absorbs damage.", icon: "🛡️", unlockLevel: 11, maxRank: 5, damageType: "None", manaCost: 0, cooldown: 14 },
    { id: 'challenging_shout', name: "Challenging Shout", type: "Defensive", desc: "Taunt nearby enemies and gain Damage Reduction.", icon: "😡", unlockLevel: 12, maxRank: 5, damageType: "None", manaCost: 0, cooldown: 25 },

    // BRAWLING
    { id: 'war_cry', name: "War Cry", type: "Brawling", desc: "Bellow a mighty war cry, increasing damage dealt.", icon: "🗣️", unlockLevel: 16, maxRank: 5, damageType: "None", manaCost: 0, cooldown: 25 },
    { id: 'kick', name: "Kick", type: "Brawling", desc: "Kick an enemy, dealing damage and knocking them back.", icon: "🦵", unlockLevel: 17, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 10 },
    { id: 'leap', name: "Leap", type: "Brawling", desc: "Leap forward and slam down, dealing damage on impact.", icon: "🦅", unlockLevel: 17, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 17 },
    { id: 'charge', name: "Charge", type: "Brawling", desc: "Become Unstoppable and rush forward, pushing enemies.", icon: "🐂", unlockLevel: 18, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 17 },

    // WEAPON MASTERY
    { id: 'rupture', name: "Rupture", type: "Weapon Mastery", desc: "Skewer enemies, dealing damage and ripping out weapon to cause bleeding.", icon: "🗡️", unlockLevel: 24, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 10 },
    { id: 'death_blow', name: "Death Blow", type: "Weapon Mastery", desc: "Attempt a killing strike. If it kills, cooldown is reset.", icon: "💀", unlockLevel: 25, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 15 },
    { id: 'steel_grasp', name: "Steel Grasp", type: "Weapon Mastery", desc: "Throw out chains and pull enemies to you.", icon: "⛓️", unlockLevel: 26, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 11 },

    // ULTIMATE
    { id: 'wrath_berserker', name: "Wrath of the Berserker", type: "Ultimate", desc: "Explode into rage, knocking back enemies and becoming Unstoppable.", icon: "👹", unlockLevel: 35, maxRank: 1, damageType: "None", manaCost: 0, cooldown: 60 },
    { id: 'call_ancients', name: "Call of the Ancients", type: "Ultimate", desc: "Call upon the Ancients to aid you in battle.", icon: "👻", unlockLevel: 35, maxRank: 1, damageType: "Physical", manaCost: 0, cooldown: 50 },
    { id: 'iron_maelstrom', name: "Iron Maelstrom", type: "Ultimate", desc: "Strike thrice to attach chains and swing massive weapons.", icon: "⚙️", unlockLevel: 35, maxRank: 1, damageType: "Physical", manaCost: 0, cooldown: 45 }
  ]
};