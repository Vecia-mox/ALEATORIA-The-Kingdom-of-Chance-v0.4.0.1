
/**
 * TITAN ENGINE: NEURAL NPC
 * Generative AI Bridge for dynamic conversations and behavioral triggers.
 */

export interface NPCProfile {
  name: string;
  role: string;
  personality: string;
  traits: string[];
  knowledge: string[]; // Facts they know
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class NeuralNPC {
  private profile: NPCProfile;
  private history: ChatMessage[] = [];
  private contextWindowSize = 6; // Keep last 6 messages
  
  // Game State hook to inject world info
  private getGameState: () => string;
  private onActionTrigger: (action: string, param: string) => void;

  constructor(
    profile: NPCProfile, 
    gameStateProvider: () => string,
    actionCallback: (action: string, param: string) => void
  ) {
    this.profile = profile;
    this.getGameState = gameStateProvider;
    this.onActionTrigger = actionCallback;
    
    this.initializeHistory();
  }

  private initializeHistory() {
    const systemPrompt = `
      You are ${this.profile.name}, a ${this.profile.role} in the world of Aleatoria.
      Personality: ${this.profile.personality}.
      Traits: ${this.profile.traits.join(', ')}.
      Knowledge: ${this.profile.knowledge.join('; ')}.
      
      INSTRUCTIONS:
      1. Stay in character at all times. Do not mention you are an AI.
      2. Keep responses concise (under 2 sentences) unless asked for a story.
      3. Use Old English / Fantasy dialect if appropriate.
      4. If you want to perform a game action, include it in tags at the end.
         Available Actions: [GIVE_ITEM: <ItemName>], [START_QUEST: <QuestId>], [ATTACK_PLAYER], [OPEN_SHOP].
    `;
    
    this.history.push({ role: 'system', content: systemPrompt });
  }

  public async interact(playerInput: string): Promise<string> {
    // 1. Add User Input
    this.history.push({ role: 'user', content: playerInput });

    // 2. Inject Transient Context (Current World State)
    // We add this as a system note right before the generation to keep it fresh
    const worldContext = `[Current Context: ${this.getGameState()}]`;
    const messagesToSend = [
      this.history[0], // System Prompt
      ...this.history.slice(-this.contextWindowSize), // Recent History
      { role: 'system', content: worldContext } // Immediate Context
    ];

    // 3. Call LLM API (Mock)
    const responseText = await this.mockLLMCall(messagesToSend);

    // 4. Process Response
    const { cleanText, actions } = this.parseResponse(responseText);
    
    // 5. Execute Actions
    actions.forEach(act => this.onActionTrigger(act.type, act.param));

    // 6. Update History
    this.history.push({ role: 'assistant', content: responseText });

    return cleanText;
  }

  private parseResponse(text: string): { cleanText: string, actions: {type: string, param: string}[] } {
    const actionRegex = /\[([A-Z_]+):\s*([^\]]+)\]/g;
    const actions: {type: string, param: string}[] = [];
    let match;
    
    // Extract actions
    while ((match = actionRegex.exec(text)) !== null) {
      actions.push({ type: match[1], param: match[2].trim() });
    }

    // Remove tags from spoken text
    const cleanText = text.replace(actionRegex, '').trim();
    
    return { cleanText, actions };
  }

  private async mockLLMCall(messages: any[]): Promise<string> {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));
    
    // Simple heuristic response for demo
    const lastUserMsg = messages[messages.length - 2].content.toLowerCase();
    
    if (lastUserMsg.includes('sword')) {
      return "Ah, seeking steel are we? Take this blade, it served me well. [GIVE_ITEM: Iron Sword]";
    } else if (lastUserMsg.includes('quest')) {
      return "The rats in the cellar are gnawing at my patience. Slay them! [START_QUEST: Rats_Cellar]";
    } else {
      return "Hrmph. The winds are changing today. Watch your step, traveler.";
    }
  }
}
