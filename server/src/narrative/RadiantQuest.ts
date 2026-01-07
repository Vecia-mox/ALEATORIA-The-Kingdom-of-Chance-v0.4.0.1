
/**
 * TITAN ENGINE: RADIANT QUEST SYSTEM
 * Generates infinite quests based on Faction State and Player History.
 */

import { TerritoryNode, FactionId } from '../simulation/FactionManager';

export interface Quest {
  id: string;
  title: string;
  description: string;
  objective: { type: 'KILL' | 'DEFEND' | 'SCOUT', target: string, count: number };
  reward: { gold: number, xp: number, factionRep: number };
  giverFaction: FactionId;
}

export class RadiantQuestGenerator {
  
  public static generateWarQuest(node: TerritoryNode, playerFaction: FactionId): Quest {
    const isDefense = node.owner === playerFaction;
    
    if (isDefense) {
      return {
        id: `quest_defend_${node.id}_${Date.now()}`,
        title: `Defense of ${node.name}`,
        description: `Our scouts report an imminent attack on ${node.name}. Go there and slay the invaders to hold the line.`,
        objective: { type: 'DEFEND', target: node.id, count: 10 }, // Kill 10 attackers
        reward: { gold: 200, xp: 500, factionRep: 50 },
        giverFaction: playerFaction
      };
    } else {
      return {
        id: `quest_assault_${node.id}_${Date.now()}`,
        title: `Assault on ${node.name}`,
        description: `${node.name} is held by the enemy. We need you to weaken their defenses. Slay the guards.`,
        objective: { type: 'KILL', target: node.id, count: 5 }, // Kill 5 guards
        reward: { gold: 300, xp: 600, factionRep: 75 },
        giverFaction: playerFaction
      };
    }
  }

  public static generateBeastQuest(playerStats: any): Quest {
    // If player has high 'BeastMastery' skill or owns a pet
    // Simple mock check
    return {
        id: `quest_hunt_alpha_${Date.now()}`,
        title: "The Alpha Specimen",
        description: "A genetically superior Wolf has been spotted. We need its DNA for the breeding program.",
        objective: { type: 'KILL', target: 'mob_wolf_alpha', count: 1 },
        reward: { gold: 500, xp: 1000, factionRep: 0 },
        giverFaction: 'NEUTRAL'
    };
  }

  public static generateScoutQuest(node: TerritoryNode, playerFaction: FactionId): Quest {
      return {
        id: `quest_scout_${node.id}`,
        title: `Recon: ${node.name}`,
        description: `We need eyes on ${node.name}. Travel there and report back on enemy troop numbers.`,
        objective: { type: 'SCOUT', target: node.id, count: 1 },
        reward: { gold: 100, xp: 200, factionRep: 25 },
        giverFaction: playerFaction
      };
  }
}
