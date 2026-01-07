
/**
 * TITAN ENGINE: GEM PROC SYSTEM
 * Handles complex combat triggers from Legendary Gems.
 */

import { Scene } from 'phaser';
import { CombatManager } from './CombatManager';

export type CombatEventType = 'ON_HIT' | 'ON_CRIT' | 'ON_KILL' | 'ON_TAKE_DAMAGE' | 'ON_CAST';

export interface GemDefinition {
  id: string;
  name: string;
  trigger: CombatEventType;
  cooldown: number; // ms
  chance: number; // 0-1
  execute: (context: ProcContext) => void;
}

export interface ProcContext {
  scene: Scene;
  combatManager: CombatManager;
  source: any; // Sprite/Entity
  target: any; // Sprite/Entity
  damage: number;
  gemRank: number;
}

export class GemProcSystem {
  private static instance: GemProcSystem;
  private gems: Map<string, GemDefinition> = new Map();
  
  // State: EntityID -> GemID -> LastProcTime
  private cooldowns: Map<string, Map<string, number>> = new Map();

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): GemProcSystem {
    if (!GemProcSystem.instance) GemProcSystem.instance = new GemProcSystem();
    return GemProcSystem.instance;
  }

  public registerGem(def: GemDefinition) {
    this.gems.set(def.id, def);
  }

  private registerDefaults() {
    // 1. LIGHTNING CORE
    this.registerGem({
      id: 'gem_lightning_core',
      name: 'Lightning Core',
      trigger: 'ON_HIT',
      cooldown: 3000,
      chance: 0.2, // 20%
      execute: (ctx) => {
        // Chain Lightning Logic
        console.log("⚡ Lightning Core Proc!");
        
        // Find nearby enemies
        const enemies = ctx.scene.physics.overlapCirc(ctx.target.x, ctx.target.y, 200, true, true);
        
        // Visual
        const graphics = ctx.scene.add.graphics();
        graphics.lineStyle(2, 0x00ffff, 1);
        
        let prevTarget = ctx.target;
        let chainCount = 0;
        
        enemies.forEach((enemyBody: any) => {
          if (chainCount >= 3) return;
          const enemy = enemyBody.gameObject;
          if (enemy === ctx.target || enemy === ctx.source) return;

          // Draw Bolt
          graphics.lineBetween(prevTarget.x, prevTarget.y, enemy.x, enemy.y);
          
          // Deal Damage
          const dmg = ctx.damage * (0.5 + (ctx.gemRank * 0.1));
          ctx.combatManager.onHit(enemy, dmg, false, false);
          
          prevTarget = enemy;
          chainCount++;
        });

        ctx.scene.tweens.add({
          targets: graphics,
          alpha: 0,
          duration: 200,
          onComplete: () => graphics.destroy()
        });
      }
    });

    // 2. BERSERKER'S EYE
    this.registerGem({
      id: 'gem_berserker',
      name: "Berserker's Eye",
      trigger: 'ON_CAST',
      cooldown: 5000,
      chance: 1.0,
      execute: (ctx) => {
        // Apply temporary buff
        console.log("😡 Berserker Rage!");
        const buffDmg = 0.10 + (ctx.gemRank * 0.01);
        
        ctx.source.setData('damage_multiplier', (ctx.source.getData('damage_multiplier') || 1) + buffDmg);
        ctx.source.setTint(0xff0000); // Visual cue

        ctx.scene.time.delayedCall(3000, () => {
           ctx.source.setData('damage_multiplier', (ctx.source.getData('damage_multiplier') || 1) - buffDmg);
           ctx.source.clearTint();
        });
      }
    });
  }

  /**
   * Main entry point for combat logic to trigger gems.
   */
  public handleEvent(type: CombatEventType, equippedGems: {id: string, rank: number}[], ctx: Omit<ProcContext, 'gemRank'>) {
    const now = Date.now();
    const entityId = ctx.source.getData('mobId') || 'player';

    if (!this.cooldowns.has(entityId)) {
      this.cooldowns.set(entityId, new Map());
    }
    const entityCooldowns = this.cooldowns.get(entityId)!;

    for (const gemRef of equippedGems) {
      const def = this.gems.get(gemRef.id);
      if (!def || def.trigger !== type) continue;

      // Check Cooldown
      const lastProc = entityCooldowns.get(def.id) || 0;
      if (now - lastProc < def.cooldown) continue;

      // Check Chance
      if (Math.random() > def.chance) continue;

      // Execute
      entityCooldowns.set(def.id, now);
      def.execute({ ...ctx, gemRank: gemRef.rank });
    }
  }
}
