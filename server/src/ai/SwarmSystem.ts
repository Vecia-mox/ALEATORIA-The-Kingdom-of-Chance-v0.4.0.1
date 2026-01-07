
/**
 * TITAN ENGINE: SWARM SYSTEM
 * Optimization for "Horde" gameplay.
 * Instead of 100 pathfinders, we use 10 Squad Leaders.
 */

import { Mob, Position } from '../../types';

interface Squad {
  id: string;
  leaderId: string;
  members: string[]; // Mob IDs
  targetPos: Position; // Where the squad wants to go
}

export class SwarmSystem {
  private squads: Map<string, Squad> = new Map();
  private mobs: Map<string, Mob> = new Map(); // Ref to actual mob data

  // Config
  private readonly SEPARATION_DIST = 30;
  private readonly COHESION_STRENGTH = 0.05;
  private readonly SQUAD_SIZE = 10;

  constructor(mobList: Mob[]) {
    // Initialize refs
    mobList.forEach(m => this.mobs.set(m.id, m));
  }

  public registerMob(mob: Mob) {
    this.mobs.set(mob.id, mob);
    
    // Try to add to existing squad
    for (const squad of this. squads.values()) {
      if (squad.members.length < this.SQUAD_SIZE) {
        squad.members.push(mob.id);
        return;
      }
    }

    // Create new squad
    const squadId = `squad_${Date.now()}_${Math.random()}`;
    this.squads.set(squadId, {
      id: squadId,
      leaderId: mob.id, // Promoted to leader
      members: [mob.id],
      targetPos: { ...mob.pos }
    });
  }

  public update(dt: number, playerPos: Position) {
    this.squads.forEach(squad => {
      const leader = this.mobs.get(squad.leaderId);
      if (!leader) {
        // Elect new leader
        if (squad.members.length > 0) {
            squad.leaderId = squad.members[0];
        } else {
            this.squads.delete(squad.id);
        }
        return;
      }

      // 1. LEADER LOGIC (A* Pathfinding / Direct)
      // Leader pathfinds to player
      const dx = playerPos.x - leader.pos.x;
      const dy = playerPos.y - leader.pos.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist > 50) { // Move if not in attack range
        leader.pos.x += (dx / dist) * leader.stats.movementSpeed * dt;
        leader.pos.y += (dy / dist) * leader.stats.movementSpeed * dt;
      }

      // 2. FOLLOWER LOGIC (Boids / Steering)
      squad.members.forEach((memId, index) => {
        if (memId === squad.leaderId) return; // Skip leader

        const mob = this.mobs.get(memId);
        if (!mob) return; // Dead

        // Target: Leader's position + Surround Offset
        // Calculate surround circle position based on index
        const angle = (index / squad.members.length) * Math.PI * 2;
        const targetX = leader.pos.x + Math.cos(angle) * 60; // 60px radius
        const targetY = leader.pos.y + Math.sin(angle) * 60;

        // Steering
        const mdx = targetX - mob.pos.x;
        const mdy = targetY - mob.pos.y;
        
        // Move towards slot
        mob.pos.x += mdx * 2.0 * dt; 
        mob.pos.y += mdy * 2.0 * dt;

        // Separation (Cheap Check)
        // Only check against previous member to avoid N^2
        if (index > 0) {
            const prevMob = this.mobs.get(squad.members[index-1]);
            if (prevMob) {
                const pdx = mob.pos.x - prevMob.pos.x;
                const pdy = mob.pos.y - prevMob.pos.y;
                const pdist = Math.sqrt(pdx*pdx + pdy*pdy);
                if (pdist < this.SEPARATION_DIST) {
                    mob.pos.x += (pdx/pdist) * 50 * dt; // Push away
                    mob.pos.y += (pdy/pdist) * 50 * dt;
                }
            }
        }
      });
    });
  }
}
