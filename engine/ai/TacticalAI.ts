
/**
 * TITAN ENGINE: TACTICAL AI
 * Handles squad-level coordination and environment usage.
 */

export type AIState = 'IDLE' | 'ATTACK' | 'FLANK' | 'SUPPRESS' | 'RETREAT' | 'COVER';
export type SquadRole = 'LEADER' | 'ASSAULT' | 'FLANKER' | 'SNIPER';

export class SquadManager {
  private static instance: SquadManager;
  private squads: Map<string, TacticalAgent[]> = new Map();
  
  // Token system to limit simultaneous attacks
  private attackTokens: number = 2; 

  public static getInstance(): SquadManager {
    if (!SquadManager.instance) SquadManager.instance = new SquadManager();
    return SquadManager.instance;
  }

  public register(squadId: string, agent: TacticalAgent) {
    if (!this.squads.has(squadId)) this.squads.set(squadId, []);
    this.squads.get(squadId)!.push(agent);
    this.assignRoles(squadId);
  }

  public requestAttackToken(): boolean {
    if (this.attackTokens > 0) {
      this.attackTokens--;
      return true;
    }
    return false;
  }

  public returnAttackToken() {
    this.attackTokens++;
  }

  private assignRoles(squadId: string) {
    const members = this.squads.get(squadId)!;
    // Simple logic: 1 Leader, rest split
    members.forEach((agent, i) => {
      if (i === 0) agent.role = 'LEADER';
      else if (i % 3 === 0) agent.role = 'FLANKER';
      else if (i % 3 === 1) agent.role = 'SNIPER';
      else agent.role = 'ASSAULT';
    });
  }
}

export class TacticalAgent {
  public id: string;
  public squadId: string;
  public role: SquadRole = 'ASSAULT';
  public currentState: AIState = 'IDLE';
  
  private targetPos: Float32Array = new Float32Array([0,0,0]);
  private hp: number = 100;

  constructor(id: string, squadId: string) {
    this.id = id;
    this.squadId = squadId;
    SquadManager.getInstance().register(squadId, this);
  }

  public update(dt: number, playerPos: Float32Array) {
    // 1. Sensory Update
    const distToPlayer = this.distance(this.targetPos, playerPos);
    
    // 2. State Machine
    switch (this.currentState) {
      case 'IDLE':
        if (distToPlayer < 20) this.transitionToCombat(playerPos);
        break;
        
      case 'ATTACK':
        // Try to get token to strike
        if (SquadManager.getInstance().requestAttackToken()) {
          // Perform Attack Action
          // On Complete: SquadManager.getInstance().returnAttackToken();
        } else {
          // Fallback to strafing/circling
        }
        break;

      case 'FLANK':
        // Move to side of player
        // Calculate flank position (cross product of forward vector)
        break;

      case 'COVER':
        // Move towards identified cover point
        break;
    }

    // 3. Health Check
    if (this.hp < 30 && this.currentState !== 'RETREAT') {
      this.currentState = 'RETREAT';
    }
  }

  private transitionToCombat(playerPos: Float32Array) {
    if (this.role === 'FLANKER') this.currentState = 'FLANK';
    else if (this.role === 'SNIPER') this.currentState = 'COVER'; // Find cover first
    else this.currentState = 'ATTACK';
  }

  // --- ENVIRONMENT QUERIES ---

  public findCover(threatPos: Float32Array): Float32Array | null {
    // Mock: Query WorldGrid for nodes marked 'cover'
    // Raycast from threatPos to coverNode to ensure LoS is broken
    // return bestNode.position
    return null; 
  }

  public hasLineOfSight(target: Float32Array): boolean {
    // Physics.raycast(this.pos, target)
    return true;
  }

  private distance(a: Float32Array, b: Float32Array): number {
    return Math.sqrt(
      Math.pow(a[0]-b[0], 2) + Math.pow(a[1]-b[1], 2) + Math.pow(a[2]-b[2], 2)
    );
  }
}
