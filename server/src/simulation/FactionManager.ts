
/**
 * TITAN ENGINE: FACTION MANAGER
 * Simulates off-screen battles and economy based on territory control.
 */

export type FactionId = 'KINGDOM' | 'REBELS' | 'UNDEAD' | 'NEUTRAL';
export type NodeType = 'CASTLE' | 'MINE' | 'VILLAGE' | 'OUTPOST';

export interface TerritoryNode {
  id: string;
  name: string;
  type: NodeType;
  owner: FactionId;
  defense: number; // 0-1000
  resources: number; // Generated per tick
  connectedNodes: string[]; // Graph edges
}

export class FactionManager {
  private nodes: Map<string, TerritoryNode> = new Map();
  private factionResources: Map<FactionId, number> = new Map();
  
  // Economy Modifiers (Global State)
  public vendorDiscount: Record<FactionId, number> = {
      KINGDOM: 1.0,
      REBELS: 1.0,
      UNDEAD: 1.0,
      NEUTRAL: 1.0
  };

  constructor() {
    this.initializeWorld();
    // Run simulation every 10 minutes (600000ms)
    // For demo, we run it faster
    setInterval(() => this.simulateTurn(), 10000);
  }

  private initializeWorld() {
    this.nodes.set('node_castle_1', { id: 'node_castle_1', name: 'High Keep', type: 'CASTLE', owner: 'KINGDOM', defense: 800, resources: 100, connectedNodes: ['node_village_1'] });
    this.nodes.set('node_village_1', { id: 'node_village_1', name: 'Riverwood', type: 'VILLAGE', owner: 'KINGDOM', defense: 200, resources: 50, connectedNodes: ['node_castle_1', 'node_mine_1'] });
    this.nodes.set('node_mine_1', { id: 'node_mine_1', name: 'Iron Pit', type: 'MINE', owner: 'NEUTRAL', defense: 100, resources: 200, connectedNodes: ['node_village_1', 'node_outpost_1'] });
    this.nodes.set('node_outpost_1', { id: 'node_outpost_1', name: 'Dark Camp', type: 'OUTPOST', owner: 'REBELS', defense: 300, resources: 20, connectedNodes: ['node_mine_1'] });
    
    ['KINGDOM', 'REBELS', 'UNDEAD'].forEach(f => this.factionResources.set(f as FactionId, 1000));
  }

  public simulateTurn() {
    console.log('[Faction] Simulating Turn...');

    // 1. Resource Gathering
    this.nodes.forEach(node => {
        if (node.owner !== 'NEUTRAL') {
            const current = this.factionResources.get(node.owner) || 0;
            this.factionResources.set(node.owner, current + node.resources);
        }
    });

    // 2. Decide Actions (AI)
    // Simple logic: If resources > 500, launch raid on weakest neighbor
    ['KINGDOM', 'REBELS'].forEach(faction => {
        const res = this.factionResources.get(faction as FactionId) || 0;
        if (res > 500) {
            this.launchRaid(faction as FactionId);
        }
    });

    // 3. Update Economy
    this.updateEconomy();
  }

  private launchRaid(attacker: FactionId) {
    // Find border node
    let targetNode: TerritoryNode | null = null;
    
    // Iterate all nodes owned by attacker
    for (const myNode of this.nodes.values()) {
        if (myNode.owner === attacker) {
            // Check neighbors
            for (const neighborId of myNode.connectedNodes) {
                const neighbor = this.nodes.get(neighborId);
                if (neighbor && neighbor.owner !== attacker) {
                    targetNode = neighbor;
                    break;
                }
            }
        }
        if (targetNode) break;
    }

    if (!targetNode) return; // No borders found

    // Resolve Battle
    const attackStrength = Math.floor(Math.random() * 500) + 200;
    console.log(`[Faction] ${attacker} attacking ${targetNode.name} (${targetNode.owner}) with ${attackStrength} power.`);

    // Pay cost
    this.factionResources.set(attacker, (this.factionResources.get(attacker) || 0) - 500);

    if (attackStrength > targetNode.defense) {
        // Victory
        console.log(`[Faction] ${attacker} CONQUERED ${targetNode.name}!`);
        targetNode.owner = attacker;
        targetNode.defense = 200; // Reset defense (damaged)
        
        // Broadcast Event to Radiant Quest System
        // RadiantQuestSystem.onTerritoryChange(targetNode);
    } else {
        // Defeat
        console.log(`[Faction] Attack failed. ${targetNode.name} held.`);
        targetNode.defense -= Math.floor(attackStrength * 0.2); // Wear down defenses
    }
  }

  private updateEconomy() {
    // If Kingdom owns Mines, Swords are cheaper
    let kingdomMines = 0;
    this.nodes.forEach(n => {
        if (n.owner === 'KINGDOM' && n.type === 'MINE') kingdomMines++;
    });

    this.vendorDiscount['KINGDOM'] = 1.0 - (kingdomMines * 0.1); // 10% discount per mine
  }

  public getMapState() {
      return Array.from(this.nodes.values());
  }
}
