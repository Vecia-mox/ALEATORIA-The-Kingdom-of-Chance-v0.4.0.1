
/**
 * TITAN ENGINE: AI DIRECTOR
 * Monitors player stress and orchestrates game pacing (Build-up -> Peak -> Relax).
 */

export enum PacingState {
  BUILD_UP, // Spawn weak enemies, increase frequency
  PEAK,     // Spawn Horde/Elite, high intensity
  RELAX,    // Stop spawning, allow looting/healing
  FADE      // Despawn distant enemies to free resources
}

interface PlayerMetrics {
  id: string;
  hp: number;
  maxHp: number;
  damageTakenLast10s: number;
  shotsFired: number;
  stressLevel: number; // 0.0 to 1.0
}

export class GameDirector {
  private static instance: GameDirector;
  
  // State
  private currentState: PacingState = PacingState.BUILD_UP;
  private stateTimer: number = 0;
  private intensityScore: number = 0;
  
  // Config
  private readonly RELAX_DURATION = 30000; // 30s
  private readonly PEAK_DURATION = 45000; // 45s
  private readonly STRESS_THRESHOLD = 0.8; // Triggers instant Relax if crossed

  private players: Map<string, PlayerMetrics> = new Map();

  private constructor() {}

  public static getInstance(): GameDirector {
    if (!GameDirector.instance) GameDirector.instance = new GameDirector();
    return GameDirector.instance;
  }

  public update(dt: number) {
    this.stateTimer += dt * 1000;
    this.calculateGlobalStress();
    this.updateStateMachine();
  }

  public registerPlayer(id: string, maxHp: number) {
    this.players.set(id, { id, hp: maxHp, maxHp, damageTakenLast10s: 0, shotsFired: 0, stressLevel: 0 });
  }

  public onPlayerDamage(id: string, amount: number) {
    const p = this.players.get(id);
    if (p) {
        p.hp -= amount;
        p.damageTakenLast10s += amount;
    }
  }

  private calculateGlobalStress() {
    let totalStress = 0;
    let count = 0;

    this.players.forEach(p => {
      // Stress Formula: (Missing Health %) + (Recent Damage Taken)
      const healthStress = 1.0 - (p.hp / p.maxHp);
      const panicStress = Math.min(1.0, p.damageTakenLast10s / (p.maxHp * 0.3)); // 30% HP lost in 10s = Max Panic
      
      p.stressLevel = (healthStress * 0.6) + (panicStress * 0.4);
      totalStress += p.stressLevel;
      count++;

      // Decay tracking vars
      p.damageTakenLast10s = Math.max(0, p.damageTakenLast10s - 1); 
    });

    this.intensityScore = count > 0 ? totalStress / count : 0;
  }

  private updateStateMachine() {
    // 1. Safety Valve: If stress is too high, force RELAX
    if (this.intensityScore > this.STRESS_THRESHOLD && this.currentState !== PacingState.RELAX) {
        console.log(`[Director] Panic Threshold reached (${this.intensityScore.toFixed(2)}). Forcing RELAX.`);
        this.transitionTo(PacingState.RELAX);
        return;
    }

    // 2. Normal Cycle
    switch (this.currentState) {
      case PacingState.BUILD_UP:
        // Slowly increase spawn rate
        if (this.intensityScore > 0.5) { // Players are engaged
            this.transitionTo(PacingState.PEAK);
        }
        break;

      case PacingState.PEAK:
        // Max spawns allowed
        if (this.stateTimer > this.PEAK_DURATION) {
            this.transitionTo(PacingState.RELAX);
        }
        break;

      case PacingState.RELAX:
        // Min spawns, drop potions
        if (this.stateTimer > this.RELAX_DURATION) {
            this.transitionTo(PacingState.BUILD_UP);
        }
        break;
    }
  }

  private transitionTo(newState: PacingState) {
    this.currentState = newState;
    this.stateTimer = 0;
    console.log(`[Director] State changed to: ${PacingState[newState]}`);
    
    // Trigger State Effects
    if (newState === PacingState.PEAK) {
        // SpawnController.spawnHorde();
        // MusicDirector.setLayer('Action');
    } else if (newState === PacingState.RELAX) {
        // SpawnController.stopSpawning();
        // MusicDirector.setLayer('Ambient');
    }
  }

  public getSpawnRateModifier(): number {
    switch (this.currentState) {
        case PacingState.BUILD_UP: return 1.0 + (this.stateTimer / 60000); // Ramp up
        case PacingState.PEAK: return 2.5; // Chaos
        case PacingState.RELAX: return 0.1; // Trickle
        default: return 1.0;
    }
  }

  public getLootModifier(playerId: string): { potionChance: number } {
      const p = this.players.get(playerId);
      if (!p) return { potionChance: 0.05 };

      // Mercy Drop: If low HP, boost potion chance
      if (p.hp < p.maxHp * 0.2) {
          return { potionChance: 0.25 }; // 5x chance
      }
      return { potionChance: 0.05 };
  }
}
