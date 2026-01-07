
/**
 * TITAN ENGINE: BATTLE PASS SYSTEM
 * Progression logic for Free and Premium reward tracks.
 */

export interface BPReward {
  level: number;
  type: 'ITEM' | 'CURRENCY' | 'SKIN' | 'TITLE';
  value: string | number; // Item ID or Amount
  icon: string;
}

export interface PlayerBPState {
  playerId: string;
  seasonId: number;
  xp: number;
  level: number;
  isPremium: boolean;
  claimedFree: number[]; // Array of claimed Level IDs
  claimedPremium: number[];
}

export class BattlePassSystem {
  private static instance: BattlePassSystem;
  
  // Config
  private readonly XP_PER_LEVEL = 1000;
  private readonly MAX_LEVEL = 100;
  
  // Tracks (Loaded from Config/DB)
  private freeTrack: Map<number, BPReward> = new Map();
  private premiumTrack: Map<number, BPReward> = new Map();

  private constructor() {
    this.initializeRewards();
  }

  public static getInstance(): BattlePassSystem {
    if (!BattlePassSystem.instance) BattlePassSystem.instance = new BattlePassSystem();
    return BattlePassSystem.instance;
  }

  private initializeRewards() {
    // Mock Rewards
    for (let i = 1; i <= 100; i++) {
      this.freeTrack.set(i, { level: i, type: 'CURRENCY', value: 100, icon: 'gold_coin' });
      this.premiumTrack.set(i, { level: i, type: 'ITEM', value: `cosmetic_chest_${i}`, icon: 'chest_rare' });
    }
  }

  /**
   * Adds XP to a player's pass and handles level ups.
   */
  public addXp(state: PlayerBPState, amount: number) {
    if (state.level >= this.MAX_LEVEL) return;

    state.xp += amount;
    
    // Level Up Logic
    // Can level up multiple times if huge XP dump (e.g. Weekly Quest)
    while (state.xp >= this.XP_PER_LEVEL && state.level < this.MAX_LEVEL) {
      state.xp -= this.XP_PER_LEVEL;
      state.level++;
      // Send LevelUp Notification
      // NotificationSystem.send(state.playerId, `Battle Pass Level ${state.level} Reached!`);
    }
  }

  public claimReward(state: PlayerBPState, level: number, track: 'FREE' | 'PREMIUM'): boolean {
    if (level > state.level) return false; // Not unlocked yet

    const claimedList = track === 'FREE' ? state.claimedFree : state.claimedPremium;
    if (claimedList.includes(level)) return false; // Already claimed

    if (track === 'PREMIUM' && !state.isPremium) return false; // Not premium

    // Fetch Reward Definition
    const reward = track === 'FREE' ? this.freeTrack.get(level) : this.premiumTrack.get(level);
    if (!reward) return false;

    // Grant Reward
    this.grantRewardToPlayer(state.playerId, reward);

    // Mark Claimed
    claimedList.push(level);
    return true;
  }

  public upgradeToPremium(state: PlayerBPState) {
    if (state.isPremium) return;
    state.isPremium = true;
    // Logic to retroactively notify available premium rewards could go here
  }

  private grantRewardToPlayer(playerId: string, reward: BPReward) {
    console.log(`[BattlePass] Granting ${reward.type} (${reward.value}) to ${playerId}`);
    // InventoryManager.addItem(...)
    // CurrencyManager.addGold(...)
  }

  public getTrackData() {
    return {
      free: Array.from(this.freeTrack.values()),
      premium: Array.from(this.premiumTrack.values())
    };
  }
}
