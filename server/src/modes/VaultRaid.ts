
/**
 * TITAN ENGINE: VAULT RAID
 * Stealth-action PvEvP mode. Shadows steal, Immortals defend.
 */

import { ServerSimulator } from '../services/ServerSimulator';
import { Mob, Player } from '../../types';

export enum VaultState {
  STEALTH,
  ALARM_SOUNDED,
  DEFENDERS_ENTERED,
  COMPLETED,
  FAILED
}

export class VaultRaid {
  private server: ServerSimulator;
  public state: VaultState = VaultState.STEALTH;
  
  // Essentia (Currency stolen)
  public essentiaStolen: number = 0;
  private readonly MAX_ESSENTIA = 1000;
  
  // Alarm Logic
  private wardens: Mob[] = [];
  private alarmTimer: number = 0;
  private readonly WARDEN_ALERT_DELAY = 3000; // 3s from spot to alarm

  // Defenders
  private defenders: string[] = []; // Player IDs of Immortals
  private maxDefenders = 4;

  constructor(server: ServerSimulator) {
    this.server = server;
  }

  public registerWarden(mob: Mob) {
    this.wardens.push(mob);
  }

  public update(dt: number, shadowPlayers: Player[]) {
    if (this.state === VaultState.COMPLETED || this.state === VaultState.FAILED) return;

    // 1. Stealth Logic
    if (this.state === VaultState.STEALTH) {
      this.checkWardens(shadowPlayers, dt);
    }

    // 2. Alarm Logic
    if (this.state === VaultState.ALARM_SOUNDED) {
      // Queue Defenders? Handled by matchmaker mostly.
      // Here we just wait for them to join via `addDefender`
    }
  }

  private checkWardens(shadows: Player[], dt: number) {
    let spotted = false;

    for (const warden of this.wardens) {
      if (warden.hp <= 0) continue; // Dead wardens tell no tales

      for (const player of shadows) {
        const dist = Math.sqrt(Math.pow(player.pos.x - warden.pos.x, 2) + Math.pow(player.pos.y - warden.pos.y, 2));
        
        // Simple Vision Check (Distance + FoV usually, strictly distance here for MVP)
        if (dist < 200) { 
          // Warden sees player
          spotted = true;
          // Visual warning on client (Exclamation Mark)
          // this.server.broadcastToPlayer(player.id, 'WARDEN_ALERT', { wardenId: warden.id });
        }
      }
    }

    if (spotted) {
      this.alarmTimer += dt * 1000;
      if (this.alarmTimer > this.WARDEN_ALERT_DELAY) {
        this.triggerAlarm();
      }
    } else {
      this.alarmTimer = Math.max(0, this.alarmTimer - dt * 1000); // Decay alert
    }
  }

  private triggerAlarm() {
    this.state = VaultState.ALARM_SOUNDED;
    console.log("[Vault] ALARM SOUNDED! Immortals notified.");
    
    // Broadcast Global Notification to Immortals
    // this.server.broadcastToFaction('IMMORTAL', 'VAULT_BREACH', { instanceId: this.id });
    
    // Spawn Elite Guards
    // this.spawnGuards();
  }

  public addDefender(playerId: string): boolean {
    if (this.state === VaultState.STEALTH) return false; // Too early
    if (this.defenders.length >= this.maxDefenders) return false;

    this.defenders.push(playerId);
    this.state = VaultState.DEFENDERS_ENTERED;
    console.log(`[Vault] Immortal ${playerId} entered the vault!`);
    return true;
  }

  public onShadowDeath(playerId: string) {
    // Drop Essentia
    const dropAmount = Math.floor(this.essentiaStolen * 0.1);
    this.essentiaStolen -= dropAmount;
    // Spawn Essentia Pickup
  }

  public collectEssentia(amount: number) {
    this.essentiaStolen = Math.min(this.MAX_ESSENTIA, this.essentiaStolen + amount);
    if (this.essentiaStolen >= this.MAX_ESSENTIA) {
      // Escape Portal Opens
    }
  }
}
