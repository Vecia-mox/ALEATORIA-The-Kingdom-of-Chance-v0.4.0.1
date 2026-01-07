
/**
 * TITAN ENGINE: RIFT MODIFIERS
 * The "Crest" system. Applies random mutators to the game state.
 */

import { Player, Mob } from '../../types';

export type ModifierType = 'POSITIVE' | 'NEGATIVE' | 'CHAOS';

export interface ModifierDef {
  id: string;
  type: ModifierType;
  name: string;
  description: string;
  onTick?: (state: any, dt: number) => void;
  onHit?: (attacker: any, victim: any, dmg: number) => number; // Return modified damage
  onDeath?: (victim: any) => void;
}

export class RiftModifierSystem {
  private activeModifiers: Map<string, ModifierDef> = new Map();

  constructor() {
    this.registerDefaults();
  }

  public activateModifier(id: string) {
    const def = MODIFIER_REGISTRY[id];
    if (def) {
      this.activeModifiers.set(id, def);
      console.log(`[Rift] Modifier Active: ${def.name}`);
    }
  }

  public clearModifiers() {
    this.activeModifiers.clear();
  }

  // --- HOOKS ---

  public processTick(state: any, dt: number) {
    this.activeModifiers.forEach(mod => {
      if (mod.onTick) mod.onTick(state, dt);
    });
  }

  public processHit(attacker: any, victim: any, damage: number): number {
    let finalDamage = damage;
    this.activeModifiers.forEach(mod => {
      if (mod.onHit) finalDamage = mod.onHit(attacker, victim, finalDamage);
    });
    return finalDamage;
  }

  public processDeath(victim: any) {
    this.activeModifiers.forEach(mod => {
      if (mod.onDeath) mod.onDeath(victim);
    });
  }

  private registerDefaults() {
    // No-op here, using static registry below for cleaner look
  }
}

// --- REGISTRY ---

const MODIFIER_REGISTRY: Record<string, ModifierDef> = {
  // NEGATIVE
  'lava_floor': {
    id: 'lava_floor',
    type: 'NEGATIVE',
    name: 'Molten Ground',
    description: 'Periodically spawns lava pools under players.',
    onTick: (state, dt) => {
      // Logic: 5% chance per second to spawn lava at player pos
      if (Math.random() < 0.05 * dt) {
        // SpawnHazard(player.pos, 'LAVA_POOL');
      }
    }
  },
  'monster_regen': {
    id: 'monster_regen',
    type: 'NEGATIVE',
    name: 'Troll Blood',
    description: 'Monsters regenerate 5% HP per second.',
    onTick: (state, dt) => {
      // Loop mobs and heal
      // mobs.forEach(m => m.hp = Math.min(m.maxHp, m.hp + (m.maxHp * 0.05 * dt)));
    }
  },

  // POSITIVE
  'explosive_palms': {
    id: 'explosive_palms',
    type: 'POSITIVE',
    name: 'Explosive Palms',
    description: 'Enemies explode on death.',
    onDeath: (victim) => {
      // SpawnExplosion(victim.pos, damage=200, radius=50);
    }
  },
  'speed_pylon': {
    id: 'speed_pylon',
    type: 'POSITIVE',
    name: 'Frenzy',
    description: '+50% Attack and Move Speed.',
    onHit: (attacker, victim, dmg) => {
      return dmg; // Logic handled in StatSystem usually, but could be dynamic here
    }
  }
};
