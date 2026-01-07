
/**
 * TITAN ENGINE: RIFT MANAGER
 * Orchestrates the "Elder Rift" game mode: Timed runs, progress bars, and Boss phases.
 */

import { ServerSimulator } from '../services/ServerSimulator'; // Context
import { Mob } from '../../types';

export enum RiftState {
  INACTIVE,
  ACTIVE,
  GUARDIAN_PHASE,
  COMPLETED,
  FAILED
}

export class RiftManager {
  private static instance: RiftManager;
  private server: ServerSimulator; // Reference to main game loop

  // State
  public state: RiftState = RiftState.INACTIVE;
  public progress: number = 0; // 0 to 100
  public timer: number = 0;
  private readonly TIME_LIMIT_MS = 5 * 60 * 1000; // 5 Minutes
  private riftId: string | null = null;

  // Config
  private guardianSpawned: boolean = false;

  private constructor() {}

  public static getInstance(): RiftManager {
    if (!RiftManager.instance) RiftManager.instance = new RiftManager();
    return RiftManager.instance;
  }

  public initialize(server: ServerSimulator) {
    this.server = server;
  }

  public startRift(difficulty: number, modifiers: string[]) {
    this.state = RiftState.ACTIVE;
    this.progress = 0;
    this.timer = this.TIME_LIMIT_MS;
    this.guardianSpawned = false;
    this.riftId = `rift_${Date.now()}`;

    console.log(`[Rift] Started Elder Rift (Diff: ${difficulty})`);
    
    // Broadcast UI Start
    // this.server.broadcast({ type: 'RIFT_START', timer: this.timer });
  }

  public update(dt: number) {
    if (this.state !== RiftState.ACTIVE && this.state !== RiftState.GUARDIAN_PHASE) return;

    this.timer -= dt * 1000; // dt is seconds usually

    if (this.timer <= 0) {
      this.failRift();
    }
  }

  public onEnemyKill(mob: Mob) {
    if (this.state !== RiftState.ACTIVE) return;

    // Calculate Progress (XP value is a good proxy for difficulty/weight)
    const progressGain = (mob.expValue || 10) / 500; // Arbitrary: 50000 XP total to clear
    this.progress = Math.min(100, this.progress + progressGain);

    // Check Guardian Spawn
    if (this.progress >= 100 && !this.guardianSpawned) {
      this.spawnGuardian(mob.pos);
    }
  }

  private spawnGuardian(location: {x: number, y: number}) {
    this.state = RiftState.GUARDIAN_PHASE;
    this.guardianSpawned = true;

    console.log("[Rift] GUARDIAN SPAWNED!");

    // 1. Despawn all trash mobs to focus on boss
    // this.server.despawnAllMobs(exceptGuardian);

    // 2. Spawn Boss
    // const boss = MobFactory.create('rift_guardian', location);
    // this.server.spawnMob(boss);

    // 3. UI Warning
    // this.server.broadcast({ type: 'RIFT_GUARDIAN_WARNING' });
  }

  public completeRift() {
    if (this.state !== RiftState.GUARDIAN_PHASE) return;
    
    this.state = RiftState.COMPLETED;
    console.log(`[Rift] Completed with ${(this.timer / 1000).toFixed(1)}s remaining!`);
    
    // Spawn Reward Chests
    // LootManager.spawnChest('rift_chest_legendary', playerPos);
  }

  private failRift() {
    this.state = RiftState.FAILED;
    console.log("[Rift] FAILED - Time Expired");
    // Broadcast Failure UI
  }
}
