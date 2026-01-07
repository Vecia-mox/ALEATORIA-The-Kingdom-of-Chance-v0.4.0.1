
/**
 * TITAN ENGINE: QUEST & NARRATIVE SYSTEM
 * Handles branching dialogues and quest logic graphs.
 */

export type QuestStatus = 'LOCKED' | 'ACTIVE' | 'COMPLETED' | 'FAILED';

export interface QuestState {
  id: string;
  status: QuestStatus;
  objectives: Record<string, boolean | number>; // objId -> isComplete or count
}

export interface DialogueOption {
  text: string;
  nextNodeId?: string; // Null ends dialogue
  condition?: string; // Function name to check (e.g. "HasGold")
  action?: string; // Function to trigger (e.g. "GiveQuest")
}

export interface DialogueNode {
  id: string;
  npcText: string;
  options: DialogueOption[];
}

export class QuestSystem {
  private static instance: QuestSystem;
  
  // Database
  private quests: Map<string, any> = new Map(); // Quest Definitions
  private dialogues: Map<string, DialogueNode> = new Map();
  
  // Runtime State
  private questStates: Map<string, QuestState> = new Map();
  private globalFlags: Map<string, any> = new Map(); // "KingInsulted": true

  private constructor() {}

  public static getInstance(): QuestSystem {
    if (!QuestSystem.instance) QuestSystem.instance = new QuestSystem();
    return QuestSystem.instance;
  }

  // --- QUEST MANAGEMENT ---

  public startQuest(questId: string) {
    if (this.questStates.has(questId)) return;
    
    this.questStates.set(questId, {
      id: questId,
      status: 'ACTIVE',
      objectives: {}
    });
    console.log(`[Narrative] Quest Started: ${questId}`);
  }

  public updateObjective(questId: string, objectiveId: string, amount: number = 1) {
    const state = this.questStates.get(questId);
    if (!state || state.status !== 'ACTIVE') return;

    // Simplified logic: Assume numeric objectives are counts, booleans are flags
    const current = state.objectives[objectiveId] || 0;
    if (typeof current === 'number') {
      state.objectives[objectiveId] = current + amount;
    } else {
      state.objectives[objectiveId] = true;
    }
    
    this.checkCompletion(questId);
  }

  private checkCompletion(questId: string) {
    // Check against Quest Definition conditions
    // If all met -> state.status = 'COMPLETED', grant rewards
  }

  // --- DIALOGUE SYSTEM ---

  public getDialogue(nodeId: string): DialogueNode | null {
    return this.dialogues.get(nodeId) || null;
  }

  public registerDialogue(node: DialogueNode) {
    this.dialogues.set(node.id, node);
  }

  public evaluateCondition(conditionStr: string): boolean {
    // Mock condition parser
    if (conditionStr.startsWith("HasItem")) {
      // return Inventory.has(...)
      return true; 
    }
    if (this.globalFlags.has(conditionStr)) {
      return this.globalFlags.get(conditionStr);
    }
    return true;
  }

  // --- PERSISTENCE ---

  public serialize(): string {
    return JSON.stringify({
      quests: Array.from(this.questStates.entries()),
      flags: Array.from(this.globalFlags.entries())
    });
  }

  public deserialize(json: string) {
    const data = JSON.parse(json);
    this.questStates = new Map(data.quests);
    this.globalFlags = new Map(data.flags);
  }
}
