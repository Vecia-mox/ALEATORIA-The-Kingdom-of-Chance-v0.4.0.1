
/**
 * TITAN ENGINE: PARTY SYSTEM
 * Groups, Instance Locking, and Loot Logic.
 */

import { Item } from '../../types';

export type LootMode = 'FREE_FOR_ALL' | 'ROUND_ROBIN' | 'LEADER_ONLY';

export interface PartyMember {
  id: string; // UserId
  isConnected: boolean;
  hp: number;
  maxHp: number;
}

export interface Party {
  id: string;
  leaderId: string;
  members: PartyMember[];
  lootMode: LootMode;
  lootIndex: number; // For Round Robin
  instanceId?: string; // If in dungeon
}

export class PartySystem {
  private static instance: PartySystem;
  private parties: Map<string, Party> = new Map();
  private playerPartyMap: Map<string, string> = new Map(); // userId -> partyId

  private constructor() {}

  public static getInstance(): PartySystem {
    if (!PartySystem.instance) PartySystem.instance = new PartySystem();
    return PartySystem.instance;
  }

  public createParty(leaderId: string): Party {
    if (this.playerPartyMap.has(leaderId)) {
      throw new Error("Already in a party");
    }

    const id = `party_${Date.now()}`;
    const party: Party = {
      id,
      leaderId,
      members: [{ id: leaderId, isConnected: true, hp: 100, maxHp: 100 }],
      lootMode: 'ROUND_ROBIN',
      lootIndex: 0
    };

    this.parties.set(id, party);
    this.playerPartyMap.set(leaderId, id);
    return party;
  }

  public joinParty(partyId: string, playerId: string) {
    const party = this.parties.get(partyId);
    if (!party) return;
    if (this.playerPartyMap.has(playerId)) return;
    if (party.members.length >= 4) return; // Full

    party.members.push({ id: playerId, isConnected: true, hp: 100, maxHp: 100 });
    this.playerPartyMap.set(playerId, partyId);
    
    this.broadcastUpdate(partyId);
  }

  public leaveParty(playerId: string) {
    const partyId = this.playerPartyMap.get(playerId);
    if (!partyId) return;

    const party = this.parties.get(partyId);
    if (!party) return;

    // Remove member
    party.members = party.members.filter(m => m.id !== playerId);
    this.playerPartyMap.delete(playerId);

    if (party.members.length === 0) {
      this.parties.delete(partyId);
    } else {
      // Reassign leader if leader left
      if (party.leaderId === playerId) {
        party.leaderId = party.members[0].id;
      }
      this.broadcastUpdate(partyId);
    }
  }

  /**
   * Determines who gets the loot when an item drops.
   * Returns the userId of the owner, or null if free-for-all (anyone can pick up).
   */
  public distributeLoot(killerId: string, item: Item): string | null {
    const partyId = this.playerPartyMap.get(killerId);
    
    // Solo player
    if (!partyId) return killerId;

    const party = this.parties.get(partyId);
    if (!party) return killerId;

    // Loot Logic
    switch (party.lootMode) {
      case 'FREE_FOR_ALL':
        return null; // No owner, first to click

      case 'LEADER_ONLY':
        return party.leaderId;

      case 'ROUND_ROBIN':
        if (item.rarity === 'COMMON') return null; // Trash is FFA
        
        // Find next eligible member
        let attempts = 0;
        let candidateId = '';
        
        while (attempts < party.members.length) {
          const idx = party.lootIndex % party.members.length;
          const member = party.members[idx];
          
          party.lootIndex++; // Advance index for next drop
          
          // Check if member is close enough / connected (simplified: just check connected)
          if (member.isConnected) {
            candidateId = member.id;
            break;
          }
          attempts++;
        }
        
        return candidateId || killerId;
    }
  }

  public updateMemberStatus(playerId: string, hp: number, maxHp: number) {
    const partyId = this.playerPartyMap.get(playerId);
    if (!partyId) return;
    
    const party = this.parties.get(partyId);
    if (party) {
      const member = party.members.find(m => m.id === playerId);
      if (member) {
        member.hp = hp;
        member.maxHp = maxHp;
        // Optimization: Don't broadcast every single HP change immediately, throttle it
        // this.broadcastUpdate(partyId); 
      }
    }
  }

  private broadcastUpdate(partyId: string) {
    // Send updated Party State to all members sockets
    // SocketManager.broadcastToRoom(partyId, 'PARTY_UPDATE', this.parties.get(partyId));
  }
}
