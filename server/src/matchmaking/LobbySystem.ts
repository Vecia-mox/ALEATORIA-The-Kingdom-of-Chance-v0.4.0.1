
/**
 * TITAN ENGINE: LOBBY SYSTEM
 * Role-based queueing for dungeons and PvP.
 */

export type Role = 'TANK' | 'HEALER' | 'DPS';
export type GameMode = 'DUNGEON' | 'ARENA';

interface QueueEntry {
  playerId: string;
  mmr: number;
  role: Role;
  timestamp: number;
}

export class LobbySystem {
  // Buckets: Mode -> Role -> List
  private queues: Map<GameMode, Map<Role, QueueEntry[]>> = new Map();
  private MATCH_INTERVAL = 5000; // Check every 5s

  constructor() {
    this.initializeQueue('DUNGEON');
    this.initializeQueue('ARENA');
    
    // Start Match Loop
    setInterval(() => this.processQueues(), this.MATCH_INTERVAL);
  }

  private initializeQueue(mode: GameMode) {
    const roleMap = new Map<Role, QueueEntry[]>();
    roleMap.set('TANK', []);
    roleMap.set('HEALER', []);
    roleMap.set('DPS', []);
    this.queues.set(mode, roleMap);
  }

  public joinQueue(playerId: string, mmr: number, role: Role, mode: GameMode) {
    const queue = this.queues.get(mode)?.get(role);
    if (queue) {
      // Avoid dupes
      if (!queue.find(p => p.playerId === playerId)) {
        queue.push({ playerId, mmr, role, timestamp: Date.now() });
        console.log(`[MM] ${playerId} joined ${mode} as ${role}`);
      }
    }
  }

  public leaveQueue(playerId: string) {
    this.queues.forEach(roleMap => {
      roleMap.forEach((list, role) => {
        const idx = list.findIndex(p => p.playerId === playerId);
        if (idx !== -1) list.splice(idx, 1);
      });
    });
  }

  private processQueues() {
    // Dungeon Logic: 1 Tank, 1 Healer, 3 DPS
    const dungeonQ = this.queues.get('DUNGEON')!;
    const tanks = dungeonQ.get('TANK')!;
    const healers = dungeonQ.get('HEALER')!;
    const dps = dungeonQ.get('DPS')!;

    while (tanks.length >= 1 && healers.length >= 1 && dps.length >= 3) {
      // Pop players
      const group = [
        tanks.shift()!,
        healers.shift()!,
        dps.shift()!,
        dps.shift()!,
        dps.shift()!
      ];

      // Verify MMR Spread (Optional, for now just match)
      // Check if avg MMR is within range...

      this.createMatch(group, 'DUNGEON');
    }
  }

  private createMatch(players: QueueEntry[], mode: GameMode) {
    const matchId = `match_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    console.log(`[MM] Match Found (${mode}): ${matchId}`);
    
    // 1. Spin up Instance (Docker/Kubernetes API call here)
    // 2. Notify Players with Connection Info
    players.forEach(p => {
      // Socket.send(p.playerId, { type: 'MATCH_READY', matchId, port: 9000 });
    });
  }
}
