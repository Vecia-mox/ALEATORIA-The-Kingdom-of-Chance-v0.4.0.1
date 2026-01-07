
/**
 * TITAN ENGINE: GUILD MANAGER
 * Handles persistent organizations, hierarchy, and banking.
 */

import { Item } from '../../types'; // Assuming shared types exist
import { DBManager } from '../database/DBManager';

export type GuildRank = 'LEADER' | 'OFFICER' | 'MEMBER' | 'INITIATE';

export interface GuildMember {
  userId: string;
  rank: GuildRank;
  joinedAt: number;
  contribution: number; // GP (Guild Points)
}

export interface Guild {
  id: string;
  name: string;
  level: number;
  xp: number;
  gold: number;
  members: Map<string, GuildMember>; // userId -> Member
  bank: Item[];
  bankLog: string[]; // Audit trail
  settings: {
    recruitOpen: boolean;
    minLevel: number;
  };
}

export class GuildManager {
  private static instance: GuildManager;
  private guilds: Map<string, Guild> = new Map();
  // Quick lookup: userId -> guildId
  private playerGuildMap: Map<string, string> = new Map();

  private constructor() {}

  public static getInstance(): GuildManager {
    if (!GuildManager.instance) GuildManager.instance = new GuildManager();
    return GuildManager.instance;
  }

  /**
   * Creates a new guild. Cost validation should happen before calling this.
   */
  public createGuild(founderId: string, name: string): Guild | null {
    if (this.playerGuildMap.has(founderId)) return null; // Already in a guild
    if (Array.from(this.guilds.values()).some(g => g.name === name)) return null; // Name taken

    const guildId = `guild_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    
    const newGuild: Guild = {
      id: guildId,
      name,
      level: 1,
      xp: 0,
      gold: 0,
      members: new Map(),
      bank: [],
      bankLog: [],
      settings: { recruitOpen: false, minLevel: 10 }
    };

    const founder: GuildMember = {
      userId: founderId,
      rank: 'LEADER',
      joinedAt: Date.now(),
      contribution: 0
    };

    newGuild.members.set(founderId, founder);
    this.guilds.set(guildId, newGuild);
    this.playerGuildMap.set(founderId, guildId);

    console.log(`[Guild] Created "${name}" by ${founderId}`);
    return newGuild;
  }

  public inviteMember(guildId: string, inviterId: string, targetId: string): boolean {
    const guild = this.guilds.get(guildId);
    if (!guild) return false;

    const inviter = guild.members.get(inviterId);
    if (!inviter || (inviter.rank !== 'LEADER' && inviter.rank !== 'OFFICER')) return false;

    if (this.playerGuildMap.has(targetId)) return false; // Target busy

    // Add member (In real app, this sends an invite request first)
    const newMember: GuildMember = {
      userId: targetId,
      rank: 'INITIATE',
      joinedAt: Date.now(),
      contribution: 0
    };

    guild.members.set(targetId, newMember);
    this.playerGuildMap.set(targetId, guildId);
    return true;
  }

  public setRank(guildId: string, actorId: string, targetId: string, newRank: GuildRank): boolean {
    const guild = this.guilds.get(guildId);
    if (!guild) return false;

    const actor = guild.members.get(actorId);
    const target = guild.members.get(targetId);
    
    if (!actor || !target) return false;
    if (actor.rank !== 'LEADER') return false; // Only leader promotes for now

    target.rank = newRank;
    return true;
  }

  // --- BANKING SYSTEM (ACID-ish via memory locks + DB flush) ---

  public async depositItem(guildId: string, playerId: string, item: Item): Promise<boolean> {
    const guild = this.guilds.get(guildId);
    if (!guild) return false;

    // 1. Verify ownership & Remove from Player (Simulated)
    // const removed = await InventoryManager.removeItem(playerId, item.id);
    // if (!removed) return false;

    // 2. Add to Guild
    guild.bank.push(item);
    
    // 3. Log
    this.logBankAction(guild, playerId, 'DEPOSIT', item.name);
    
    // 4. Async Persist
    // DBManager.getInstance().saveGuild(guild);
    
    return true;
  }

  public async withdrawItem(guildId: string, playerId: string, itemId: string): Promise<Item | null> {
    const guild = this.guilds.get(guildId);
    if (!guild) return null;

    const member = guild.members.get(playerId);
    if (!member) return null;
    
    // Rank check: Initiates cannot withdraw
    if (member.rank === 'INITIATE') return null;

    const idx = guild.bank.findIndex(i => i.id === itemId);
    if (idx === -1) return null;

    const item = guild.bank[idx];
    
    // 1. Remove from Guild
    guild.bank.splice(idx, 1);

    // 2. Add to Player
    // const added = await InventoryManager.addItem(playerId, item);
    // if (!added) {
    //   // Rollback
    //   guild.bank.push(item);
    //   return null;
    // }

    // 3. Log
    this.logBankAction(guild, playerId, 'WITHDRAW', item.name);

    return item;
  }

  private logBankAction(guild: Guild, playerId: string, action: string, itemName: string) {
    const entry = `[${new Date().toISOString()}] ${playerId} ${action} ${itemName}`;
    guild.bankLog.unshift(entry);
    if (guild.bankLog.length > 50) guild.bankLog.pop();
  }

  public getGuildForPlayer(playerId: string): Guild | undefined {
    const guildId = this.playerGuildMap.get(playerId);
    if (guildId) return this.guilds.get(guildId);
    return undefined;
  }
}
