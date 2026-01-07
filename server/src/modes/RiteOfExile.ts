
/**
 * TITAN ENGINE: RITE OF EXILE
 * Asymmetric PvP: 1 Immortal (The Titan) vs 30 Shadows.
 */

import { Player, Stats } from '../../types';

export enum RitePhase {
  WAITING,
  COMBAT_PHASE_1, // Normal Titan
  COMBAT_PHASE_2, // Statue Form / Enrage
  VICTORY_IMMORTAL,
  VICTORY_SHADOWS
}

export class RiteOfExile {
  public state: RitePhase = RitePhase.WAITING;
  
  private immortalId: string | null = null;
  private timer: number = 600; // 10 minutes
  private immortalMaxHp: number = 0;

  constructor() {}

  public initialize(immortalPlayer: Player) {
    this.immortalId = immortalPlayer.id;
    this.transformPlayerToTitan(immortalPlayer);
    this.state = RitePhase.COMBAT_PHASE_1;
    console.log(`[Rite] Rite Started. ${immortalPlayer.name} is the Titan.`);
  }

  public update(dt: number, immortal: Player) {
    if (this.state !== RitePhase.COMBAT_PHASE_1 && this.state !== RitePhase.COMBAT_PHASE_2) return;

    this.timer -= dt;
    if (this.timer <= 0) {
      this.state = RitePhase.VICTORY_IMMORTAL;
      return;
    }

    // Phase Transition
    const hpPercent = immortal.hp / immortal.maxHp;
    if (this.state === RitePhase.COMBAT_PHASE_1 && hpPercent <= 0.5) {
      this.triggerPhase2(immortal);
    }

    // Immortal Victory Check
    // If all shadows dead? (Usually they respawn, so it's a time/objective battle)
  }

  private transformPlayerToTitan(player: Player) {
    // 1. Scale Stats
    player.stats.strength *= 10;
    player.maxHp *= 500;
    player.hp = player.maxHp;
    this.immortalMaxHp = player.maxHp;

    // 2. Visual Scale (Handled by client via state sync)
    // In types.ts, we'd ideally have a visualScale property. 
    // For now, we assume activeBuffs or modifiers array signals this.
    player.activeBuffs['TITAN_FORM'] = 1; // Client interprets this as 3.0x scale

    // 3. Skill Swap
    // Replace Loadout with Boss Skills
    player.skillLoadout = {
      1: 'titan_cleave',      // Massive arc
      2: 'titan_stomp',       // AoE Stun
      3: 'titan_charge',      // Dash
      4: 'titan_laser_beam'   // Rotating beam
    };
  }

  private triggerPhase2(player: Player) {
    this.state = RitePhase.COMBAT_PHASE_2;
    console.log("[Rite] PHASE 2: STATUE FORM");

    // Invulnerability + Summons
    player.activeBuffs['STATUE_FORM'] = 1; // Invulnerable
    
    // Summon AI Guardians
    // SpawnManager.spawn('guardian_statue', 4, around(player.pos));
    
    // Players must kill guardians to break the shield
  }

  public onTitanDamage(amount: number) {
    // Damage smoothing or capping could go here
  }
}
