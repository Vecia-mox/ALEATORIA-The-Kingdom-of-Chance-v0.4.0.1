
/**
 * TITAN ENGINE: BOSS BRAIN
 * Hierarchical State Machine for Raid Bosses.
 * Handles Phase Transitions, Enrage Mechanics, and Move Selection.
 */

import { Mob, Position } from '../../types';

export enum BossPhase {
  PHASE_1_NORMAL = 0,
  TRANSITION = 1,
  PHASE_2_ENRAGE = 2,
  PHASE_3_DESPERATION = 3
}

export interface BossMove {
  id: string;
  name: string;
  minRange: number;
  maxRange: number;
  cooldown: number;
  castTime: number;
  phaseReq: BossPhase;
  weight: number; // For weighted random selection
}

export class BossBrain {
  public mobId: string;
  public phase: BossPhase = BossPhase.PHASE_1_NORMAL;
  public isInvulnerable: boolean = false;
  
  private hpThresholds = {
    phase2: 0.50, // 50%
    phase3: 0.25  // 25%
  };
  
  private cooldowns: Map<string, number> = new Map();
  private currentAction: string | null = null;
  private actionTimer: number = 0;
  private moveSet: BossMove[] = [];

  constructor(mobId: string, moves: BossMove[]) {
    this.mobId = mobId;
    this.moveSet = moves;
  }

  public update(dt: number, mob: Mob, targetDist: number): string | null {
    // 1. Handle Action in Progress
    if (this.currentAction) {
      this.actionTimer -= dt;
      if (this.actionTimer <= 0) {
        this.currentAction = null; // Action complete
        // Return 'IDLE' or similar to reset animation?
      }
      return null; // Busy
    }

    // 2. Check Phase Transitions
    const hpPercent = mob.hp / mob.maxHp;
    
    if (this.phase === BossPhase.PHASE_1_NORMAL && hpPercent <= this.hpThresholds.phase2) {
      return this.triggerTransition(BossPhase.PHASE_2_ENRAGE);
    }
    
    if (this.phase === BossPhase.PHASE_2_ENRAGE && hpPercent <= this.hpThresholds.phase3) {
      return this.triggerTransition(BossPhase.PHASE_3_DESPERATION);
    }

    if (this.phase === BossPhase.TRANSITION) {
      // Transition logic handled by timer in triggerTransition
      return null;
    }

    // 3. Select Move
    return this.selectMove(targetDist);
  }

  private triggerTransition(nextPhase: BossPhase): string {
    console.log(`[Boss] ${this.mobId} Transitioning to ${BossPhase[nextPhase]}`);
    this.phase = BossPhase.TRANSITION;
    this.isInvulnerable = true;
    this.currentAction = 'TRANSITION_ROAR';
    this.actionTimer = 3.0; // 3s Cinematic Roar

    // Delayed callback to finish transition
    setTimeout(() => {
      this.phase = nextPhase;
      this.isInvulnerable = false;
      console.log(`[Boss] ${this.mobId} Entered ${BossPhase[nextPhase]}`);
    }, 3000);

    return 'TRANSITION_ROAR';
  }

  private selectMove(dist: number): string | null {
    const now = Date.now();
    
    // Filter available moves
    const available = this.moveSet.filter(m => 
      m.phaseReq <= this.phase &&
      dist >= m.minRange &&
      dist <= m.maxRange &&
      (this.cooldowns.get(m.id) || 0) <= now
    );

    if (available.length === 0) return null;

    // Weighted Random
    const totalWeight = available.reduce((sum, m) => sum + m.weight, 0);
    let roll = Math.random() * totalWeight;
    let selected: BossMove | null = null;

    for (const move of available) {
      roll -= move.weight;
      if (roll <= 0) {
        selected = move;
        break;
      }
    }

    if (selected) {
      // Apply Cooldown (reduced by phase in Desperation)
      let cd = selected.cooldown;
      if (this.phase === BossPhase.PHASE_3_DESPERATION) cd *= 0.5; // 50% CDR
      
      this.cooldowns.set(selected.id, now + cd);
      this.currentAction = selected.id;
      this.actionTimer = selected.castTime;
      return selected.id;
    }

    return null;
  }
}
