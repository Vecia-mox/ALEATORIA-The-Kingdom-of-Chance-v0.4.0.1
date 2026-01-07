
import { ClassDetail, ClassType } from '../../types';

export const RogueData: ClassDetail = {
  type: ClassType.ROGUE,
  name: "Rogue",
  icon: "🗡️",
  color: "text-amber-200",
  borderColor: "border-amber-200",
  hex: "#fde68a",
  gradient: "from-stone-900/90 to-black",
  tagline: "Shadow in the Light",
  lore: "Rogues are masters of stealth, sabotage, and precision.",
  bonuses: { strength: 10, fortitude: 18, intelligence: 10, vitality: 12, willpower: 10 },
  primaryAttribute: "Dexterity",
  complexity: "High",
  skills: [
    // BASIC
    { id: 'puncture', name: "Puncture", type: "Basic", desc: "Throw blades short distance.", icon: "🔪", unlockLevel: 1, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },
    { id: 'heartseeker', name: "Heartseeker", type: "Basic", desc: "Fire an arrow that seeks enemies.", icon: "🏹", unlockLevel: 1, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },
    { id: 'forceful_arrow', name: "Forceful Arrow", type: "Basic", desc: "Fire a powerful arrow.", icon: "🎯", unlockLevel: 2, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },
    { id: 'invigorating_strike', name: "Invigorating Strike", type: "Basic", desc: "Melee attack that increases regen.", icon: "⚔️", unlockLevel: 2, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },
    { id: 'blade_shift', name: "Blade Shift", type: "Basic", desc: "Stab enemy and move through them.", icon: "👻", unlockLevel: 2, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },

    // CORE
    { id: 'twisting_blades', name: "Twisting Blades", type: "Core", desc: "Impale foe, blades return to you dealing damage.", icon: "🗡️", unlockLevel: 5, maxRank: 5, damageType: "Physical", manaCost: 30, cooldown: 0 },
    { id: 'flurry', name: "Flurry", type: "Core", desc: "Unleash a flurry of stabs and slashes.", icon: "🤺", unlockLevel: 5, maxRank: 5, damageType: "Physical", manaCost: 25, cooldown: 0 },
    { id: 'penetrating_shot', name: "Penetrating Shot", type: "Core", desc: "Fire an arrow that pierces all enemies.", icon: "⏩", unlockLevel: 6, maxRank: 5, damageType: "Physical", manaCost: 35, cooldown: 0 },
    { id: 'rapid_fire', name: "Rapid Fire", type: "Core", desc: "Rapidly fire 5 arrows.", icon: "🏹", unlockLevel: 6, maxRank: 5, damageType: "Physical", manaCost: 25, cooldown: 0 },
    { id: 'barrage', name: "Barrage", type: "Core", desc: "Unleash a barrage of arrows that spread out.", icon: "📶", unlockLevel: 7, maxRank: 5, damageType: "Physical", manaCost: 30, cooldown: 0 },

    // AGILITY
    { id: 'dash', name: "Dash", type: "Agility", desc: "Dash forward and slash enemies.", icon: "💨", unlockLevel: 10, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 10 },
    { id: 'shadow_step', name: "Shadow Step", type: "Agility", desc: "Become Unstoppable and backstab enemy.", icon: "👤", unlockLevel: 11, maxRank: 5, damageType: "Shadow", manaCost: 0, cooldown: 9 },
    { id: 'caltrops', name: "Caltrops", type: "Agility", desc: "Leap back and throw caltrops.", icon: "📍", unlockLevel: 12, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 12 },

    // SUBTERFUGE
    { id: 'dark_shroud', name: "Dark Shroud", type: "Subterfuge", desc: "Surround yourself in shadows reducing damage.", icon: "🌑", unlockLevel: 17, maxRank: 5, damageType: "Shadow", manaCost: 0, cooldown: 20 },
    { id: 'smoke_grenade', name: "Smoke Grenade", type: "Subterfuge", desc: "Throw a grenade that Dazes enemies.", icon: "💣", unlockLevel: 17, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 15 },
    { id: 'poison_trap', name: "Poison Trap", type: "Subterfuge", desc: "Place a trap that poisons enemies.", icon: "🧪", unlockLevel: 18, maxRank: 5, damageType: "Poison", manaCost: 0, cooldown: 10 },
    { id: 'concealment', name: "Concealment", type: "Subterfuge", desc: "Vanish from sight.", icon: "👻", unlockLevel: 18, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 20 },

    // IMBUMENT
    { id: 'poison_imbue', name: "Poison Imbuement", type: "Imbuement", desc: "Imbue weapons with poison.", icon: "🦠", unlockLevel: 25, maxRank: 5, damageType: "Poison", manaCost: 0, cooldown: 9 },
    { id: 'shadow_imbue', name: "Shadow Imbuement", type: "Imbuement", desc: "Imbue weapons with shadow.", icon: "🌑", unlockLevel: 25, maxRank: 5, damageType: "Shadow", manaCost: 0, cooldown: 9 },
    { id: 'cold_imbue', name: "Cold Imbuement", type: "Imbuement", desc: "Imbue weapons with cold.", icon: "❄️", unlockLevel: 26, maxRank: 5, damageType: "Cold", manaCost: 0, cooldown: 9 },

    // ULTIMATE
    { id: 'death_trap', name: "Death Trap", type: "Ultimate", desc: "Place a trap that pulls enemies in and explodes.", icon: "🕳️", unlockLevel: 35, maxRank: 1, damageType: "Shadow", manaCost: 0, cooldown: 45 },
    { id: 'shadow_clone', name: "Shadow Clone", type: "Ultimate", desc: "Create a shadow that mimics your actions.", icon: "👥", unlockLevel: 35, maxRank: 1, damageType: "Physical", manaCost: 0, cooldown: 60 },
    { id: 'rain_arrows', name: "Rain of Arrows", type: "Ultimate", desc: "Arrows rain down over a large area.", icon: "🌧️", unlockLevel: 35, maxRank: 1, damageType: "Physical", manaCost: 0, cooldown: 55 }
  ]
};