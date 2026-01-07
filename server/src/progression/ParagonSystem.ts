
/**
 * TITAN ENGINE: PARAGON SYSTEM
 * Infinite endgame progression graph unlocking after Level 60.
 */

export interface ParagonNode {
  id: string;
  parentId: string | null;
  tree: 'VANQUISHER' | 'SURVIVOR' | 'GLADIATOR';
  stat: 'DAMAGE' | 'HEALTH' | 'ARMOR_PEN' | 'POTENCY' | 'MOVE_SPEED';
  value: number; // Value per rank
  maxRank: number;
  reqPoints: number; // Points needed in previous node to unlock
  x: number; // Visual X for UI
  y: number; // Visual Y for UI
}

export interface PlayerParagonState {
  points: number; // Unspent points
  nodes: Record<string, number>; // NodeID -> Current Rank
  activeTree: string; // Only active tree passives apply? (Diablo style: Passive stats always apply, specialization skills depend on active tree)
}

export class ParagonSystem {
  private static instance: ParagonSystem;
  private nodes: Map<string, ParagonNode> = new Map();

  private constructor() {
    this.initializeTrees();
  }

  public static getInstance(): ParagonSystem {
    if (!ParagonSystem.instance) ParagonSystem.instance = new ParagonSystem();
    return ParagonSystem.instance;
  }

  private initializeTrees() {
    // 1. VANQUISHER (Offense)
    this.addNode({ id: 'vanq_root', parentId: null, tree: 'VANQUISHER', stat: 'DAMAGE', value: 5, maxRank: 100, reqPoints: 0, x: 0, y: 0 });
    this.addNode({ id: 'vanq_pen', parentId: 'vanq_root', tree: 'VANQUISHER', stat: 'ARMOR_PEN', value: 2, maxRank: 50, reqPoints: 1, x: 50, y: -50 });
    this.addNode({ id: 'vanq_speed', parentId: 'vanq_root', tree: 'VANQUISHER', stat: 'MOVE_SPEED', value: 0.1, maxRank: 20, reqPoints: 1, x: 50, y: 50 });

    // 2. SURVIVOR (Defense)
    this.addNode({ id: 'surv_root', parentId: null, tree: 'SURVIVOR', stat: 'HEALTH', value: 50, maxRank: 100, reqPoints: 0, x: 0, y: 0 });
    this.addNode({ id: 'surv_armor', parentId: 'surv_root', tree: 'SURVIVOR', stat: 'POTENCY', value: 5, maxRank: 50, reqPoints: 1, x: 50, y: 0 });
  }

  private addNode(node: ParagonNode) {
    this.nodes.set(node.id, node);
  }

  public getTree(treeName: string): ParagonNode[] {
    return Array.from(this.nodes.values()).filter(n => n.tree === treeName);
  }

  public investPoint(state: PlayerParagonState, nodeId: string): boolean {
    if (state.points <= 0) return false;

    const node = this.nodes.get(nodeId);
    if (!node) return false;

    // 1. Check Connectivity
    if (node.parentId) {
      const parentRank = state.nodes[node.parentId] || 0;
      if (parentRank < node.reqPoints) return false; // Must invest enough in parent
    }

    // 2. Check Rank Cap
    const currentRank = state.nodes[nodeId] || 0;
    if (currentRank >= node.maxRank) return false;

    // 3. Apply
    state.nodes[nodeId] = currentRank + 1;
    state.points--;
    
    return true;
  }

  public resetTree(state: PlayerParagonState, treeName: string) {
    // Refund points logic
    let refund = 0;
    for (const [id, rank] of Object.entries(state.nodes)) {
      const node = this.nodes.get(id);
      if (node && node.tree === treeName) {
        refund += rank;
        delete state.nodes[id];
      }
    }
    state.points += refund;
  }

  public calculateBonuses(state: PlayerParagonState): Record<string, number> {
    const bonuses: Record<string, number> = {
      DAMAGE: 0, HEALTH: 0, ARMOR_PEN: 0, POTENCY: 0, MOVE_SPEED: 0
    };

    for (const [id, rank] of Object.entries(state.nodes)) {
      const node = this.nodes.get(id);
      if (node) {
        bonuses[node.stat] += node.value * rank;
      }
    }

    return bonuses;
  }
}
