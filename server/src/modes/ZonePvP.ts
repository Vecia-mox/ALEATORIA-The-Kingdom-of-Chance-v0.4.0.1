
/**
 * TITAN ENGINE: ZONE PVP (ANCIENT ARENA)
 * Handles FFA Combat zones and Chest Interaction mechanics.
 */

import { Player } from '../../types';

export enum ArenaState {
  LOCKED,
  OPEN_COMBAT,
  CHEST_UNLOCKING,
  FINISHED
}

export class ZonePvP {
  public state: ArenaState = ArenaState.LOCKED;
  
  private chestInteractingPlayerId: string | null = null;
  private unlockTimer: number = 0;
  private readonly UNLOCK_DURATION_MS = 10000; // 10s to open
  
  // Bounds of the Arena (e.g., center of map)
  private bounds = { xMin: 2000, xMax: 3000, yMin: 2000, yMax: 3000 };

  constructor() {}

  public startEvent() {
    this.state = ArenaState.OPEN_COMBAT;
    console.log("[Arena] PvP Zone Active. Chest spawned.");
  }

  public update(dt: number) {
    if (this.state === ArenaState.CHEST_UNLOCKING && this.chestInteractingPlayerId) {
      this.unlockTimer -= dt * 1000;
      if (this.unlockTimer <= 0) {
        this.finishEvent(this.chestInteractingPlayerId);
      }
    }
  }

  public tryInteractChest(playerId: string): boolean {
    if (this.state !== ArenaState.OPEN_COMBAT) return false;
    
    // Start unlocking
    this.state = ArenaState.CHEST_UNLOCKING;
    this.chestInteractingPlayerId = playerId;
    this.unlockTimer = this.UNLOCK_DURATION_MS;
    
    console.log(`[Arena] ${playerId} started opening the chest!`);
    return true;
  }

  public onPlayerDamage(victimId: string) {
    // Interrupt interaction if damaged
    if (this.state === ArenaState.CHEST_UNLOCKING && victimId === this.chestInteractingPlayerId) {
      console.log(`[Arena] ${victimId} interrupted!`);
      this.state = ArenaState.OPEN_COMBAT;
      this.chestInteractingPlayerId = null;
      this.unlockTimer = 0;
    }
  }

  public isPlayerFlagged(player: Player): boolean {
    if (this.state === ArenaState.LOCKED || this.state === ArenaState.FINISHED) return false;
    
    // Check bounds
    return (
      player.pos.x >= this.bounds.xMin && 
      player.pos.x <= this.bounds.xMax && 
      player.pos.y >= this.bounds.yMin && 
      player.pos.y <= this.bounds.yMax
    );
  }

  private finishEvent(winnerId: string) {
    this.state = ArenaState.FINISHED;
    console.log(`[Arena] Event Won by ${winnerId}!`);
    // Distribute Loot
    // Apply "Nephalem Glory" buff to winner (Size * 1.5, Dmg * 2)
  }
}
