
/**
 * TITAN ENGINE: CHAT SYSTEM
 * Handles channels, commands, and item linking.
 */

export type ChatChannel = 'GLOBAL' | 'PARTY' | 'GUILD' | 'WHISPER' | 'SYSTEM';

export interface ChatMessage {
  id: string;
  channel: ChatChannel;
  sender: string;
  text: string; // Raw text
  timestamp: number;
}

export class ChatSystem {
  private messages: ChatMessage[] = [];
  private listeners: ((msg: ChatMessage) => void)[] = [];
  private commandHandlers: Map<string, (args: string[]) => void> = new Map();

  constructor() {
    this.registerDefaultCommands();
  }

  public subscribe(callback: (msg: ChatMessage) => void) {
    this.listeners.push(callback);
  }

  /**
   * Processes input from the Chat UI input box.
   */
  public sendInput(rawInput: string) {
    if (rawInput.startsWith('/')) {
      this.handleCommand(rawInput);
    } else {
      // Send to server (mock)
      this.receiveMessage({
        id: Date.now().toString(),
        channel: 'GLOBAL',
        sender: 'Me',
        text: rawInput,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Called when server sends a chat packet.
   */
  public receiveMessage(msg: ChatMessage) {
    this.messages.push(msg);
    if (this.messages.length > 100) this.messages.shift();
    this.listeners.forEach(cb => cb(msg));
  }

  /**
   * Formats a raw message into React nodes or HTML string, handling Item Links.
   * Format: "Check out [Thunderfury]!" -> "Check out <ItemLink id='123'>Thunderfury</ItemLink>!"
   */
  public parseRichText(text: string): { type: 'TEXT' | 'LINK', content: string, itemId?: string }[] {
    const parts: { type: 'TEXT' | 'LINK', content: string, itemId?: string }[] = [];
    
    // Regex for [ItemName]
    // In a real system, the server sends {[id:123]ItemName} to avoid ambiguity.
    // For MVP, we assume [Name] looks up ID via Name.
    const regex = /\[(.*?)\]/g;
    
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Text before link
      if (match.index > lastIndex) {
        parts.push({ type: 'TEXT', content: text.substring(lastIndex, match.index) });
      }

      const itemName = match[1];
      // Mock lookup: In reality, we'd have the ID embedded or look it up
      const itemId = itemName.toLowerCase().replace(/\s/g, '_'); 

      parts.push({ type: 'LINK', content: `[${itemName}]`, itemId });
      
      lastIndex = regex.lastIndex;
    }

    // Remaining text
    if (lastIndex < text.length) {
      parts.push({ type: 'TEXT', content: text.substring(lastIndex) });
    }

    return parts;
  }

  private handleCommand(input: string) {
    const parts = input.slice(1).split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (this.commandHandlers.has(cmd)) {
      this.commandHandlers.get(cmd)!(args);
    } else {
      this.receiveMessage({
        id: 'sys', channel: 'SYSTEM', sender: 'System', 
        text: `Unknown command: /${cmd}`, timestamp: Date.now() 
      });
    }
  }

  private registerDefaultCommands() {
    this.commandHandlers.set('invite', (args) => {
      const target = args[0];
      // PartyManager.invite(target);
      this.systemMsg(`Invited ${target} to party.`);
    });

    this.commandHandlers.set('w', (args) => {
      const target = args[0];
      const msg = args.slice(1).join(' ');
      // Network.sendWhisper(target, msg);
      this.receiveMessage({
        id: Date.now().toString(), channel: 'WHISPER', sender: `To ${target}`, text: msg, timestamp: Date.now()
      });
    });
    
    this.commandHandlers.set('guild', (args) => {
        // Guild chat alias
    });
  }

  private systemMsg(text: string) {
    this.receiveMessage({
      id: Date.now().toString(), channel: 'SYSTEM', sender: 'System', text, timestamp: Date.now()
    });
  }
}
