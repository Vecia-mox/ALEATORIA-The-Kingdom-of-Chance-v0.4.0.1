
import { ClassDetail, ClassType } from '../../types';

export const NecromancerData: ClassDetail = {
  type: ClassType.NECROMANCER,
  name: "Necromancer",
  icon: "💀",
  color: "text-purple-500",
  borderColor: "border-purple-500",
  hex: "#a855f7",
  gradient: "from-purple-950/80 to-black",
  tagline: "Shepherd of the Dead",
  lore: "Practitioners of the forbidden arts, Necromancers view death not as an end, but as a resource.",
  bonuses: { strength: 10, fortitude: 10, intelligence: 16, vitality: 12, willpower: 14 },
  primaryAttribute: "Intelligence",
  complexity: "Medium",
  skills: [
    // BASIC
    { id: 'decompose', name: "Decompose", type: "Basic", desc: "Tear the flesh from enemies, forming a Corpse.", icon: "🦴", unlockLevel: 1, maxRank: 5, damageType: "Shadow", manaCost: 0, cooldown: 0 },
    { id: 'reap', name: "Reap", type: "Basic", desc: "Sweep a scythe before you.", icon: "🗡️", unlockLevel: 1, maxRank: 5, damageType: "Shadow", manaCost: 0, cooldown: 0 },
    { id: 'hemorrhage', name: "Hemorrhage", type: "Basic", desc: "Burst an enemy's blood.", icon: "🩸", unlockLevel: 2, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },
    { id: 'bone_splinters', name: "Bone Splinters", type: "Basic", desc: "Fire 3 bone splinters.", icon: "🦴", unlockLevel: 2, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },

    // CORE
    { id: 'bone_spear', name: "Bone Spear", type: "Core", desc: "Conjure a bone spear from the ground.", icon: "🦷", unlockLevel: 5, maxRank: 5, damageType: "Physical", manaCost: 25, cooldown: 0 },
    { id: 'blight', name: "Blight", type: "Core", desc: "Unleash concentrated blight that leaves a defiled area.", icon: "🤢", unlockLevel: 5, maxRank: 5, damageType: "Shadow", manaCost: 25, cooldown: 0 },
    { id: 'sever', name: "Sever", type: "Core", desc: "A specter of you charges and attacks with a scythe.", icon: "👻", unlockLevel: 6, maxRank: 5, damageType: "Shadow", manaCost: 20, cooldown: 0 },
    { id: 'blood_surge', name: "Blood Surge", type: "Core", desc: "Draw blood from enemies, then expel an explosion.", icon: "🩸", unlockLevel: 6, maxRank: 5, damageType: "Physical", manaCost: 30, cooldown: 0 },
    { id: 'blood_lance', name: "Blood Lance", type: "Core", desc: "Throw a blood lance that lingers in an enemy.", icon: "🍢", unlockLevel: 7, maxRank: 5, damageType: "Physical", manaCost: 15, cooldown: 0 },

    // MACABRE
    { id: 'corpse_explosion', name: "Corpse Explosion", type: "Macabre", desc: "Detonate a corpse, dealing massive AoE damage.", icon: "💥", unlockLevel: 10, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 0 },
    { id: 'blood_mist', name: "Blood Mist", type: "Macabre", desc: "Disperse into a bloody mist, becoming Immune.", icon: "🌫️", unlockLevel: 11, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 20 },
    { id: 'bone_prison', name: "Bone Prison", type: "Macabre", desc: "Unearth a prison of bone to trap enemies.", icon: "⛓️", unlockLevel: 12, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 20 },

    // CORRUPTION
    { id: 'iron_maiden', name: "Iron Maiden", type: "Corruption", desc: "Curse enemies to take damage when they attack.", icon: "🔗", unlockLevel: 17, maxRank: 5, damageType: "Shadow", manaCost: 10, cooldown: 0 },
    { id: 'decrepify', name: "Decrepify", type: "Corruption", desc: "Curse enemies to slow them and reduce damage dealt.", icon: "📉", unlockLevel: 18, maxRank: 5, damageType: "Shadow", manaCost: 10, cooldown: 0 },

    // SUMMONING
    { id: 'corpse_tendrils', name: "Corpse Tendrils", type: "Summoning", desc: "Veins burst from a corpse, pulling enemies in.", icon: "🦑", unlockLevel: 25, maxRank: 5, damageType: "Physical", manaCost: 0, cooldown: 11 },
    { id: 'bone_spirit', name: "Bone Spirit", type: "Summoning", desc: "Consume all essence to conjure a seeking spirit.", icon: "👻", unlockLevel: 26, maxRank: 5, damageType: "Physical", manaCost: 100, cooldown: 12 },

    // ULTIMATE
    { id: 'army_dead', name: "Army of the Dead", type: "Ultimate", desc: "Call forth deep buried skeletons to explode around you.", icon: "☠️", unlockLevel: 35, maxRank: 1, damageType: "Physical", manaCost: 0, cooldown: 70 },
    { id: 'blood_wave', name: "Blood Wave", type: "Ultimate", desc: "Conjure a tidal wave of blood.", icon: "🌊", unlockLevel: 35, maxRank: 1, damageType: "Physical", manaCost: 0, cooldown: 50 },
    { id: 'bone_storm', name: "Bone Storm", type: "Ultimate", desc: "A swirling storm of bones protects you.", icon: "🌪️", unlockLevel: 35, maxRank: 1, damageType: "Physical", manaCost: 0, cooldown: 60 }
  ]
};