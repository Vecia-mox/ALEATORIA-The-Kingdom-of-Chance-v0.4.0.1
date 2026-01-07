
/**
 * TITAN ENGINE: REMOTE CONFIG
 * Allows instant tuning of game balance variables.
 */

export interface GameConfigData {
  // Combat
  globalDamageMultiplier: number;
  xpRateMultiplier: number;
  dropRateLegendary: number;
  
  // Economy
  goldInflationRate: number;
  storeDiscountPct: number;
  
  // Systems
  chatEnabled: boolean;
  maintenanceMode: boolean;
  
  // Dynamic
  [key: string]: any;
}

export class RemoteConfig {
  private static instance: RemoteConfig;
  
  private config: GameConfigData;
  private version: number = 1;

  private constructor() {
    // Default Values
    this.config = {
      globalDamageMultiplier: 1.0,
      xpRateMultiplier: 1.0,
      dropRateLegendary: 0.01, // 1%
      goldInflationRate: 1.0,
      storeDiscountPct: 0,
      chatEnabled: true,
      maintenanceMode: false
    };
    
    // In prod, load from Redis/Consul on startup
    this.fetchLatest();
  }

  public static getInstance(): RemoteConfig {
    if (!RemoteConfig.instance) RemoteConfig.instance = new RemoteConfig();
    return RemoteConfig.instance;
  }

  private async fetchLatest() {
    // Simulate fetching from external service
    // this.config = await Redis.get('game_config');
    console.log("[RemoteConfig] Configuration loaded.");
  }

  public get<T>(key: keyof GameConfigData): T {
    return this.config[key];
  }

  /**
   * Admin method to update config at runtime.
   */
  public update(newValues: Partial<GameConfigData>) {
    this.config = { ...this.config, ...newValues };
    this.version++;
    console.log(`[RemoteConfig] Updated to v${this.version}. Changed: ${Object.keys(newValues).join(', ')}`);
    
    // Notify connected clients that config changed (so they can re-fetch)
    // SocketServer.broadcast('CONFIG_UPDATE', { version: this.version });
  }

  /**
   * Payload sent to client on login.
   */
  public getClientPayload() {
    return {
      version: this.version,
      // Only send safe values, hide server-side only logic if needed
      values: this.config 
    };
  }
}
