
import { ClassDetail, ClassType } from '../../types';

export const DruidData: ClassDetail = {
  type: ClassType.DRUID,
  name: "Druid",
  icon: "🌿",
  color: "text-emerald-500",
  borderColor: "border-emerald-500",
  hex: "#10b981",
  gradient: "from-emerald-950/80 to-black",
  tagline: "Guardian of the Wilds",
  lore: "Bound by the Old Oaths, Druids are the shapeshifting protectors of the deep woods.",
  bonuses: { strength: 12, fortitude: 10, intelligence: 14, vitality: 14, willpower: 16 },
  primaryAttribute: "Wisdom",
  complexity: "Medium",
  skills: [
    // BASIC
    { id: 'storm_strike', name: "Storm Strike", type: "Basic", desc: "Strike and chain lightning.", icon: "⛈️", unlockLevel: 1, maxRank: 5, damageType: "Lightning", manaCost: 0, cooldown: 0 },
    { id: 'claw', name: "Claw", type: "Basic", desc: "Shapeshift into a Werewolf and claw enemies.", icon: "🐺", unlockLevel: 1, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },
    { id: 'maul', name: "Maul", type: "Basic", desc: "Shapeshift into a Werebear and maul enemies.", icon: "🐻", unlockLevel: 2, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },
    { id: 'earth_spike', name: "Earth Spike", type: "Basic", desc: "Sunder the earth, impaling enemies.", icon: "⛰️", unlockLevel: 2, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },
    { id: 'wind_shear', name: "Wind Shear", type: "Basic", desc: "Conjure a piercing blade of wind.", icon: "🍃", unlockLevel: 2, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },

    // CORE
    { id: 'pulverize', name: "Pulverize", type: "Core", desc: "Slam ground as Werebear for AoE damage.", icon: "🔨", unlockLevel: 5, maxRank: 5, damageType: "Physical", manaCost: 35, cooldown: 0 },
    { id: 'landslide', name: "Landslide", type: "Core", desc: "Crush enemies between pillars of earth.", icon: "🏜️", unlockLevel: 5, maxRank: 5, damageType: "Physical", manaCost: 30, cooldown: 0 },
    { id: 'tornado', name: "Tornado", type: "Core", desc: "Conjure a vortex that wanders outwards.", icon: "🌪️", unlockLevel: 6, maxRank: 5, damageType: "Physical", manaCost: 40, cooldown: 0 },
    { id: 'shred', name: "Shred", type: "Core", desc: "Dash and shred enemies as a Werewolf.", icon: "🐾", unlockLevel: 6, maxRank: 5, damageType: "Physical", manaCost: 35, cooldown: 0 },
    { id: 'lightning_storm', name: "Lightning Storm", type: "Core", desc: "Channel growing lightning strikes.", icon: "⚡", unlockLevel: 7, maxRank: 5, damageType: "Lightning", manaCost: 15, cooldown: 0 },

    // DEFENSIVE
    { id: 'earthen_bulwark', name: "Earthen Bulwark", type: "Defensive", desc: "Rocks surround you, granting a Barrier.", icon: "🪨", unlockLevel: 10, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 16 },
    { id: 'cyclone_armor', name: "Cyclone Armor", type: "Defensive", desc: "Winds protect you from non-physical damage.", icon: "🌀", unlockLevel: 11, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 18 },
    { id: 'debilitating_roar', name: "Debilitating Roar", type: "Defensive", desc: "Roar into a Werebear, reducing enemy damage.", icon: "🗣️", unlockLevel: 12, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 22 },
    { id: 'blood_howl', name: "Blood Howl", type: "Defensive", desc: "Howl as a Werewolf to heal.", icon: "🩸", unlockLevel: 12, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 15 },

    // COMPANION
    { id: 'wolves', name: "Wolves", type: "Companion", desc: "Passive: Wolves aid you. Active: Direct wolves.", icon: "🐺", unlockLevel: 17, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 14 },
    { id: 'vine_creeper', name: "Vine Creeper", type: "Companion", desc: "Passive: Poison creeper. Active: Strangle enemies.", icon: "🌱", unlockLevel: 18, maxRank: 5, damageType: "Poison", manaCost: 0, cooldown: 20 },
    { id: 'ravens', name: "Ravens", type: "Companion", desc: "Passive: Ravens fly above. Active: Swarm area.", icon: "🦅", unlockLevel: 18, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 15 },

    // WRATH
    { id: 'hurricane', name: "Hurricane", type: "Wrath", desc: "Create a hurricane around you.", icon: "🌀", unlockLevel: 25, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 20 },
    { id: 'boulder', name: "Boulder", type: "Wrath", desc: "Unearth a rolling boulder.", icon: "🪨", unlockLevel: 25, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 10 },
    { id: 'rabies', name: "Rabies", type: "Wrath", desc: "Infect enemies with Rabies as a Werewolf.", icon: "🧪", unlockLevel: 26, maxRank: 5, damageType: "Poison", manaCost: 0, cooldown: 12 },
    { id: 'trample', name: "Trample", type: "Wrath", desc: "Rush forward as a Werebear.", icon: "🐘", unlockLevel: 26, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 14 },

    // ULTIMATE
    { id: 'cataclysm', name: "Cataclysm", type: "Ultimate", desc: "A massive storm follows you.", icon: "⛈️", unlockLevel: 35, maxRank: 1, damageType: "Lightning", manaCost: 0, cooldown: 80 },
    { id: 'grizzly_rage', name: "Grizzly Rage", type: "Ultimate", desc: "Transform into a Dire Werebear.", icon: "🐻", unlockLevel: 35, maxRank: 1, damageType: "Physical", manaCost: 0, cooldown: 50 },
    { id: 'petrify', name: "Petrify", type: "Ultimate", desc: "Encase all nearby enemies in stone.", icon: "🗿", unlockLevel: 35, maxRank: 1, damageType: "Physical", manaCost: 0, cooldown: 50 },
    { id: 'lacerate', name: "Lacerate", type: "Ultimate", desc: "Dash rapidly between enemies.", icon: "💨", unlockLevel: 35, maxRank: 1, damageType: "Physical", manaCost: 0, cooldown: 45 }
  ]
};