
import { Item, ItemAffix, Stats, Equipment, ClassType } from '../types';
import { CLASS_PRIMARY_ATTRIBUTE, AttributeKey } from '../data/ClassAttributes';

/**
 * ItemFactory handles procedural loot generation with Smart Loot logic.
 */
export class ItemFactory {
  
  private static BASE_TYPES: Record<string, { name: string, icon: string, type: string, slots: string[] }> = {
    // WEAPONS
    'Rusty Sword': { name: 'Rusty Sword', icon: '⚔️', type: 'WEAPON', slots: ['MAIN_HAND'] },
    'Iron Axe': { name: 'Iron Axe', icon: '🪓', type: 'WEAPON', slots: ['MAIN_HAND'] },
    'Short Bow': { name: 'Short Bow', icon: '🏹', type: 'WEAPON', slots: ['MAIN_HAND'] },
    'Wand': { name: 'Wand', icon: '🪄', type: 'WEAPON', slots: ['MAIN_HAND'] },
    'Staff': { name: 'Staff', icon: '🪵', type: 'WEAPON', slots: ['MAIN_HAND'] },
    'Dagger': { name: 'Dagger', icon: '🗡️', type: 'WEAPON', slots: ['MAIN_HAND', 'OFF_HAND'] },
    
    // ARMOR
    'Tunic': { name: 'Tunic', icon: '👕', type: 'ARMOR', slots: ['CHEST'] },
    'Plate Mail': { name: 'Plate Mail', icon: '🛡️', type: 'ARMOR', slots: ['CHEST'] },
    'Robes': { name: 'Robes', icon: '👘', type: 'ARMOR', slots: ['CHEST'] },
    'Cap': { name: 'Cap', icon: '🧢', type: 'ARMOR', slots: ['HEAD'] },
    'Helm': { name: 'Helm', icon: '🪖', type: 'ARMOR', slots: ['HEAD'] },
    'Gloves': { name: 'Gloves', icon: '🧤', type: 'ARMOR', slots: ['HANDS'] },
    'Gauntlets': { name: 'Gauntlets', icon: '🤛', type: 'ARMOR', slots: ['HANDS'] },
    'Pants': { name: 'Pants', icon: '👖', type: 'ARMOR', slots: ['LEGS'] },
    'Greaves': { name: 'Greaves', icon: '🦵', type: 'ARMOR', slots: ['LEGS'] },
    'Boots': { name: 'Boots', icon: '👢', type: 'ARMOR', slots: ['FEET'] },
    
    // JEWELRY
    'Ring': { name: 'Ring', icon: '💍', type: 'JEWELRY', slots: ['RING_1', 'RING_2'] },
    'Amulet': { name: 'Amulet', icon: '📿', type: 'JEWELRY', slots: ['AMULET'] },
  };

  private static GEM_TYPES = [
      { name: 'Chipped Ruby', icon: '🔴', type: 'GEM', effects: [{ type: 'STAT', label: '+10 Life', value: 10 }] },
      { name: 'Chipped Emerald', icon: '🟢', type: 'GEM', effects: [{ type: 'STAT', label: '+5 Willpower', value: 5 }] },
      { name: 'Chipped Sapphire', icon: '🔵', type: 'GEM', effects: [{ type: 'STAT', label: '+5 Fortitude', value: 5 }] },
  ];

  private static LEGENDARY_POWERS = [
      "Whirlwind radius increased by 20%.",
      "Magic Missile fires 2 extra projectiles.",
      "Shield Bash deals 150% increased damage to stunned enemies.",
      "Hydra duration increased by 30%.",
      "Gain a barrier when drinking a potion.",
      "Critical hits increase movement speed by 10% for 3s."
  ];

  private static AFFIX_POOLS = {
    PRIMARY: [
      { label: 'Strength', key: 'strength', type: 'STAT' },
      { label: 'Intelligence', key: 'intelligence', type: 'STAT' },
      { label: 'Fortitude', key: 'fortitude', type: 'STAT' },
      { label: 'Vitality', key: 'vitality', type: 'STAT' },
      { label: 'Willpower', key: 'willpower', type: 'STAT' },
    ],
    SECONDARY: [
      { label: 'Crit Chance', key: 'critChance', type: 'STAT', min: 1, max: 5, suffix: '%' },
      { label: 'Movement Speed', key: null, type: 'MISC', min: 2, max: 8, suffix: '%' },
      { label: 'Max Life', key: 'hp', type: 'DEF', min: 10, max: 50 },
      { label: 'Armor', key: 'armor', type: 'DEF', min: 5, max: 20 },
    ]
  };

  /**
   * Generates loot with class-biased "Smart Loot" logic.
   */
  static generateLoot(targetLevel: number, playerClass?: ClassType): Item {
    // 0. Roll for Gem (10% chance)
    if (Math.random() < 0.10) {
        return this.generateGem();
    }

    // 1. Determine Power (Scales strictly with Mob Level)
    const basePower = targetLevel * 10;
    const variance = Math.floor(basePower * 0.15);
    const itemPower = Math.max(5, basePower + (Math.random() * variance * 2 - variance));

    // 2. Roll Rarity 
    const levelFactor = Math.min(0.5, targetLevel * 0.01); 
    const roll = Math.random() + (levelFactor * 0.5); 

    let rarity: Item['rarity'] = 'COMMON';
    let affixCount = 0;

    if (roll > 0.96) { rarity = 'LEGENDARY'; affixCount = 4; }
    else if (roll > 0.82) { rarity = 'RARE'; affixCount = 3; }
    else if (roll > 0.60) { rarity = 'UNCOMMON'; affixCount = 1; } // Magic

    // 3. Pick Base
    const keys = Object.keys(this.BASE_TYPES);
    const baseKey = keys[Math.floor(Math.random() * keys.length)];
    const base = this.BASE_TYPES[baseKey];

    // 4. Generate Affixes (Smart Loot)
    const affixes: ItemAffix[] = [];
    const smartStat = playerClass ? CLASS_PRIMARY_ATTRIBUTE[playerClass] : 'strength';

    for (let i = 0; i < affixCount; i++) {
        // 50% chance for Primary Stat, 50% for Secondary
        const isPrimary = Math.random() < 0.5;
        let template;
        
        if (isPrimary) {
            // Smart Loot: 90% chance to pick the class's main stat
            if (Math.random() < 0.9) {
                template = this.AFFIX_POOLS.PRIMARY.find(a => a.key === smartStat);
            } else {
                template = this.AFFIX_POOLS.PRIMARY[Math.floor(Math.random() * this.AFFIX_POOLS.PRIMARY.length)];
            }
        } else {
            template = this.AFFIX_POOLS.SECONDARY[Math.floor(Math.random() * this.AFFIX_POOLS.SECONDARY.length)];
        }

        if (!template) template = this.AFFIX_POOLS.PRIMARY[0];

        const powerScalar = itemPower / 10;
        const min = (template as any).min || 1;
        const max = (template as any).max || 5;
        const rawVal = Math.floor(Math.random() * (max - min + 1)) + min;
        const scaledVal = Math.max(1, Math.floor(rawVal * (0.5 + powerScalar * 0.2)));
        
        // Don't duplicate stats heavily (simple check)
        if (affixes.some(a => a.statKey === template.key)) continue;

        let label = `+${scaledVal} ${template.label}`;
        if ((template as any).suffix) label = `+${scaledVal}${(template as any).suffix} ${template.label}`;

        affixes.push({
            label,
            value: scaledVal,
            type: template.type as any,
            statKey: template.key as any
        });
    }

    // Legendary Power
    if (rarity === 'LEGENDARY') {
        const power = this.LEGENDARY_POWERS[Math.floor(Math.random() * this.LEGENDARY_POWERS.length)];
        affixes.push({
            label: `★ ${power}`,
            value: 0,
            type: 'MISC',
            statKey: undefined
        });
    }

    // 5. Calculate Sell Value
    const sellValue = Math.floor(itemPower * (affixCount + 1) * 2.5);

    // 6. Roll Sockets 
    let sockets = 0;
    const canSocket = ['CHEST', 'LEGS', 'MAIN_HAND', 'HEAD'].includes(base.slots[0] || '');
    if (canSocket && Math.random() < 0.25) {
        sockets = Math.random() < 0.3 ? 2 : 1; 
    }

    return {
        id: `loot-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        name: `${rarity === 'COMMON' ? '' : rarity} ${base.name}`,
        type: base.type as any,
        slot: base.slots[0] as any, 
        icon: base.icon,
        rarity,
        description: `A ${rarity.toLowerCase()} item. Power: ${Math.floor(itemPower)}`,
        itemPower: Math.floor(itemPower),
        requiredLevel: Math.max(1, targetLevel),
        affixes,
        sellValue,
        sockets,
        gems: []
    };
  }

  static generateGem(): Item {
      const gem = this.GEM_TYPES[Math.floor(Math.random() * this.GEM_TYPES.length)];
      return {
          id: `gem-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          name: gem.name,
          type: 'GEM',
          icon: gem.icon,
          rarity: 'UNCOMMON',
          description: "Can be socketed into equipment.",
          itemPower: 1,
          requiredLevel: 1,
          affixes: gem.effects as any,
          sellValue: 20,
          sockets: 0,
          gems: []
      };
  }

  static getStarterGear(classType: ClassType): Equipment {
    const createItem = (baseName: string, slot: string): Item => {
        const base = this.BASE_TYPES[baseName];
        return {
            id: `starter-${slot}-${Date.now()}`,
            name: `Worn ${base.name}`,
            type: base.type as any,
            slot: slot as any,
            icon: base.icon,
            rarity: 'COMMON',
            description: 'Starter equipment.',
            itemPower: 5,
            requiredLevel: 1,
            affixes: [],
            sellValue: 1,
            sockets: 0,
            gems: []
        };
    };

    const gear: Equipment = {};

    switch (classType) {
        case ClassType.BARBARIAN:
            gear.MAIN_HAND = createItem('Iron Axe', 'MAIN_HAND');
            gear.CHEST = createItem('Tunic', 'CHEST');
            break;
        case ClassType.SORCERER:
            gear.MAIN_HAND = createItem('Wand', 'MAIN_HAND');
            gear.CHEST = createItem('Robes', 'CHEST');
            break;
        case ClassType.NECROMANCER:
            gear.MAIN_HAND = createItem('Staff', 'MAIN_HAND');
            gear.CHEST = createItem('Robes', 'CHEST');
            break;
        case ClassType.DRUID:
            gear.MAIN_HAND = createItem('Staff', 'MAIN_HAND');
            gear.CHEST = createItem('Tunic', 'CHEST');
            break;
        case ClassType.ROGUE:
            gear.MAIN_HAND = createItem('Short Bow', 'MAIN_HAND');
            gear.CHEST = createItem('Tunic', 'CHEST');
            break;
        case ClassType.PALADIN:
            gear.MAIN_HAND = createItem('Rusty Sword', 'MAIN_HAND');
            gear.CHEST = createItem('Plate Mail', 'CHEST');
            break;
        case ClassType.ASSASSIN:
            gear.MAIN_HAND = createItem('Dagger', 'MAIN_HAND');
            gear.OFF_HAND = createItem('Dagger', 'OFF_HAND');
            gear.CHEST = createItem('Tunic', 'CHEST');
            break;
    }

    return gear;
  }
}
