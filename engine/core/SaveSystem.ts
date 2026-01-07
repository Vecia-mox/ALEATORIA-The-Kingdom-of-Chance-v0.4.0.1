
/**
 * TITAN ENGINE: SAVE SYSTEM
 * Handles JSON Serialization, Versioning, and Obfuscation.
 */

export interface SaveData {
  version: number;
  timestamp: number;
  levelName: string;
  player: {
    transform: { pos: number[], rot: number[] };
    stats: { hp: number, maxHp: number, xp: number };
    inventory: string[]; // Item IDs
  };
  worldState: Record<string, any>; // Flags, Quest states
}

export class SaveSystem {
  private static CURRENT_VERSION = 1;
  private static STORAGE_KEY = 'TITAN_SAVE_SLOT_1';

  /**
   * Saves the game state to LocalStorage with encoding.
   */
  public static save(data: Omit<SaveData, 'version' | 'timestamp'>) {
    const fullSave: SaveData = {
      version: this.CURRENT_VERSION,
      timestamp: Date.now(),
      ...data
    };

    const json = JSON.stringify(fullSave);
    const encoded = this.encode(json);
    
    try {
      localStorage.setItem(this.STORAGE_KEY, encoded);
      console.log(`[SaveSystem] Game saved. Size: ${encoded.length} bytes.`);
    } catch (e) {
      console.error("[SaveSystem] Failed to write save to disk.", e);
    }
  }

  /**
   * Loads and deserializes game state.
   */
  public static load(): SaveData | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;

    try {
      const json = this.decode(raw);
      const data = JSON.parse(json) as SaveData;

      // Version Migration Logic
      if (data.version < this.CURRENT_VERSION) {
        console.warn(`[SaveSystem] Migrating save from v${data.version} to v${this.CURRENT_VERSION}`);
        // Handle migration here (e.g. adding new fields)
      }

      return data;
    } catch (e) {
      console.error("[SaveSystem] Save file corrupted.", e);
      return null;
    }
  }

  public static exists(): boolean {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }

  // --- OBFUSCATION ---
  // Basic XOR to prevent casual text editing
  private static encode(input: string): string {
    const key = 123; // Simple key
    let output = '';
    for (let i = 0; i < input.length; i++) {
      output += String.fromCharCode(input.charCodeAt(i) ^ key);
    }
    return btoa(output); // To Base64
  }

  private static decode(input: string): string {
    try {
      const raw = atob(input);
      const key = 123;
      let output = '';
      for (let i = 0; i < raw.length; i++) {
        output += String.fromCharCode(raw.charCodeAt(i) ^ key);
      }
      return output;
    } catch (e) {
      throw new Error("Decoding failed");
    }
  }
}
