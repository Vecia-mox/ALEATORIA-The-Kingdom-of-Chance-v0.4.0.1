
/**
 * TITAN ENGINE: ABILITY MANAGER
 * Data-driven skill system using composable logic modules.
 */

export interface AbilityContext {
  casterId: string;
  targetPos: Float32Array; // [x,y,z]
  targetId?: string;
  level: number;
}

export abstract class AbilityModule {
  abstract execute(ctx: AbilityContext): Promise<void>;
}

// --- MODULES ---

export class SpawnProjectileModule extends AbilityModule {
  constructor(
    public prefabId: string,
    public speed: number,
    public range: number,
    public onHitEffects: AbilityModule[]
  ) { super(); }

  async execute(ctx: AbilityContext) {
    // Logic: Instantiate projectile at caster pos, moving toward targetPos
    // On collision: Trigger this.onHitEffects
    console.log(`[Ability] Spawning Projectile ${this.prefabId} at speed ${this.speed}`);
  }
}

export class AreaDamageModule extends AbilityModule {
  constructor(
    public radius: number,
    public damageBase: number,
    public damageScaling: number
  ) { super(); }

  async execute(ctx: AbilityContext) {
    const dmg = this.damageBase + (this.damageScaling * ctx.level);
    // Logic: Physics.overlapSphere(ctx.targetPos, radius) -> deal dmg
    console.log(`[Ability] AoE Damage ${dmg} in radius ${this.radius}`);
  }
}

export class ApplyBuffModule extends AbilityModule {
  constructor(
    public buffId: string,
    public duration: number,
    public stats: Record<string, number>
  ) { super(); }

  async execute(ctx: AbilityContext) {
    // Logic: Add buff to ctx.targetId or ctx.casterId
    console.log(`[Ability] Applied Buff ${this.buffId} for ${this.duration}s`);
  }
}

export class TeleportModule extends AbilityModule {
  async execute(ctx: AbilityContext) {
    // Logic: Set caster position to ctx.targetPos (navmesh clamped)
    console.log(`[Ability] Teleported to ${ctx.targetPos}`);
  }
}

// --- DEFINITION ---

export interface AbilityDefinition {
  id: string;
  name: string;
  cooldown: number;
  castTime: number;
  cost: number;
  modules: AbilityModule[];
}

// --- MANAGER ---

export class AbilityManager {
  private abilities: Map<string, AbilityDefinition> = new Map();
  private cooldowns: Map<string, number> = new Map();

  public registerAbility(def: AbilityDefinition) {
    this.abilities.set(def.id, def);
  }

  public canCast(abilityId: string, currentMana: number): boolean {
    const def = this.abilities.get(abilityId);
    if (!def) return false;
    if (currentMana < def.cost) return false;
    
    const readyTime = this.cooldowns.get(abilityId) || 0;
    return Date.now() >= readyTime;
  }

  public async cast(abilityId: string, ctx: AbilityContext) {
    const def = this.abilities.get(abilityId);
    if (!def) return;

    // 1. Consume Resource
    // ResourceManager.consume(ctx.casterId, def.cost);

    // 2. Set Cooldown
    this.cooldowns.set(abilityId, Date.now() + def.cooldown * 1000);

    // 3. Cast Time (Channeling)
    if (def.castTime > 0) {
      // await Character.playCastAnim(def.castTime);
    }

    // 4. Execute Pipeline
    for (const module of def.modules) {
      await module.execute(ctx);
    }
  }
}
