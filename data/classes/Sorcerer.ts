
import { ClassDetail, ClassType } from '../../types';

export const SorcererData: ClassDetail = {
  type: ClassType.SORCERER,
  name: "Sorcerer",
  icon: "🔥",
  color: "text-sky-400",
  borderColor: "border-sky-400",
  hex: "#38bdf8",
  gradient: "from-sky-950/80 to-black",
  tagline: "Weaver of the Arcane",
  lore: "Scholars of the volatile Aether, Sorcerers manipulate the fundamental energies of the cosmos.",
  bonuses: { strength: 8, fortitude: 12, intelligence: 18, vitality: 10, willpower: 14 },
  primaryAttribute: "Intelligence",
  complexity: "High",
  skills: [
    // BASIC
    { id: 'arc_lash', name: "Arc Lash", type: "Basic", desc: "Swipe arc lightning that stuns enemies.", icon: "⚡", unlockLevel: 1, maxRank: 5, damageType: "Lightning", manaCost: 0, cooldown: 0 },
    { id: 'fire_bolt', name: "Fire Bolt", type: "Basic", desc: "Hurl a flaming bolt, dealing damage and burning.", icon: "🔥", unlockLevel: 1, maxRank: 5, damageType: "Fire", manaCost: 0, cooldown: 0 },
    { id: 'frost_bolt', name: "Frost Bolt", type: "Basic", desc: "Throw a bolt of frost, chilling enemies.", icon: "❄️", unlockLevel: 2, maxRank: 5, damageType: "Cold", manaCost: 0, cooldown: 0 },
    { id: 'spark', name: "Spark", type: "Basic", desc: "Launch a bolt that shocks an enemy.", icon: "✨", unlockLevel: 2, maxRank: 5, damageType: "Lightning", manaCost: 0, cooldown: 0 },

    // CORE
    { id: 'chain_lightning', name: "Chain Lightning", type: "Core", desc: "Unleash a bolt that chains between enemies.", icon: "🌩️", unlockLevel: 5, maxRank: 5, damageType: "Lightning", manaCost: 35, cooldown: 0 },
    { id: 'fireball', name: "Fireball", type: "Core", desc: "Hurl an exploding ball of fire.", icon: "☄️", unlockLevel: 5, maxRank: 5, damageType: "Fire", manaCost: 40, cooldown: 0 },
    { id: 'ice_shards', name: "Ice Shards", type: "Core", desc: "Launch shards that deal more damage to frozen enemies.", icon: "🧊", unlockLevel: 6, maxRank: 5, damageType: "Cold", manaCost: 30, cooldown: 0 },
    { id: 'incinerate', name: "Incinerate", type: "Core", desc: "Channel a beam of fire, burning enemies.", icon: "🌋", unlockLevel: 6, maxRank: 5, damageType: "Fire", manaCost: 20, cooldown: 0 },
    { id: 'frozen_orb', name: "Frozen Orb", type: "Core", desc: "Unleash an orb that chills and expels piercing shards.", icon: "🔮", unlockLevel: 7, maxRank: 5, damageType: "Cold", manaCost: 40, cooldown: 0 },

    // DEFENSIVE
    { id: 'teleport', name: "Teleport", type: "Defensive", desc: "Transform into lightning and reappear at target location.", icon: "⚡", unlockLevel: 10, maxRank: 5, damageType: "Lightning", manaCost: 0, cooldown: 11 },
    { id: 'ice_armor', name: "Ice Armor", type: "Defensive", desc: "A barrier of ice forms around you.", icon: "🛡️", unlockLevel: 11, maxRank: 5, damageType: "Cold", manaCost: 0, cooldown: 20 },
    { id: 'frost_nova', name: "Frost Nova", type: "Defensive", desc: "Unleash a torrent of frost, freezing enemies nearby.", icon: "❄️", unlockLevel: 12, maxRank: 5, damageType: "Cold", manaCost: 0, cooldown: 24 },
    { id: 'flame_shield', name: "Flame Shield", type: "Defensive", desc: "Engulf yourself in flames, burning nearby enemies.", icon: "🔥", unlockLevel: 12, maxRank: 5, damageType: "Fire", manaCost: 0, cooldown: 20 },

    // CONJURATION
    { id: 'hydra', name: "Hydra", type: "Conjuration", desc: "Summon a 3-headed hydra that spits fire.", icon: "🐍", unlockLevel: 17, maxRank: 5, damageType: "Fire", manaCost: 20, cooldown: 20 },
    { id: 'ice_blades', name: "Ice Blades", type: "Conjuration", desc: "Conjure ice blades that slash enemies.", icon: "⚔️", unlockLevel: 18, maxRank: 5, damageType: "Cold", manaCost: 0, cooldown: 16 },
    { id: 'lightning_spear', name: "Lightning Spear", type: "Conjuration", desc: "Conjure a crackling spear that seeks enemies.", icon: "🔱", unlockLevel: 18, maxRank: 5, damageType: "Lightning", manaCost: 0, cooldown: 20 },

    // MASTERY
    { id: 'blizzard', name: "Blizzard", type: "Mastery", desc: "Summon a frigid blizzard that deals damage over time.", icon: "🌨️", unlockLevel: 25, maxRank: 5, damageType: "Cold", manaCost: 40, cooldown: 0 },
    { id: 'meteor', name: "Meteor", type: "Mastery", desc: "Summon a meteor to strike the target location.", icon: "☄️", unlockLevel: 25, maxRank: 5, damageType: "Fire", manaCost: 40, cooldown: 0 },
    { id: 'firewall', name: "Firewall", type: "Mastery", desc: "Create a wall of flames that burns enemies.", icon: "🔥", unlockLevel: 26, maxRank: 5, damageType: "Fire", manaCost: 30, cooldown: 0 },
    { id: 'ball_lightning', name: "Ball Lightning", type: "Mastery", desc: "Discharge a ball of lightning that zaps enemies.", icon: "⚡", unlockLevel: 26, maxRank: 5, damageType: "Lightning", manaCost: 50, cooldown: 0 },

    // ULTIMATE
    { id: 'inferno', name: "Inferno", type: "Ultimate", desc: "Summon a fiery serpent to burn enemies in an area.", icon: "🐉", unlockLevel: 35, maxRank: 1, damageType: "Fire", manaCost: 0, cooldown: 45 },
    { id: 'deep_freeze', name: "Deep Freeze", type: "Ultimate", desc: "Encalsce yourself in ice, becoming immune and chilling enemies.", icon: "🧊", unlockLevel: 35, maxRank: 1, damageType: "Cold", manaCost: 0, cooldown: 60 },
    { id: 'unstable_currents', name: "Unstable Currents", type: "Ultimate", desc: "Lightning surges within you. Casting shock skills triggers random others.", icon: "🌩️", unlockLevel: 35, maxRank: 1, damageType: "Lightning", manaCost: 0, cooldown: 70 }
  ]
};