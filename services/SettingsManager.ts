
export type GraphicsQuality = 'LOW' | 'MEDIUM' | 'HIGH';
export type HUDLayout = 'ARC' | 'CLASSIC';

export interface GameSettings {
  // Graphics
  quality: GraphicsQuality;
  bloom: boolean;
  fpsCap: 30 | 60;
  resolution: number; // 0.5 to 1.0
  shadows: boolean;
  particles: boolean;
  
  // Audio
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;

  // Gameplay
  showDamageNumbers: boolean;
  autoLoot: boolean;
  vibration: boolean;

  // Controls
  hudLayout: HUDLayout;
  joystickSize: number; // 50-150%
  joystickOpacity: number; // 0-1
}

type SettingKey = keyof GameSettings;
type SettingListener = (key: SettingKey, value: any) => void;

export class SettingsManager {
  private static KEY = 'aleatoria_settings_v3'; // Bump version
  private static listeners: SettingListener[] = [];

  private static DEFAULT: GameSettings = { 
    quality: 'HIGH',
    bloom: true,
    fpsCap: 60,
    resolution: 1.0,
    shadows: true,
    particles: true,
    masterVolume: 1.0,
    musicVolume: 0.6,
    sfxVolume: 0.8,
    showDamageNumbers: true,
    autoLoot: false,
    vibration: true,
    hudLayout: 'ARC',
    joystickSize: 100,
    joystickOpacity: 0.8
  };

  private static currentSettings: GameSettings = { ...SettingsManager.DEFAULT };

  static init() {
    this.currentSettings = this.load();
  }

  private static load(): GameSettings {
    try {
      const stored = localStorage.getItem(this.KEY);
      return stored ? { ...this.DEFAULT, ...JSON.parse(stored) } : { ...this.DEFAULT };
    } catch {
      return { ...this.DEFAULT };
    }
  }

  static getSettings(): GameSettings {
    if (!this.currentSettings) this.init();
    return { ...this.currentSettings };
  }

  static get<K extends SettingKey>(key: K): GameSettings[K] {
    return this.currentSettings[key];
  }

  static set<K extends SettingKey>(key: K, value: GameSettings[K]) {
    this.currentSettings[key] = value;
    this.save();
    this.emit(key, value);
  }

  // Update multiple settings (e.g. from React state)
  static update(newSettings: Partial<GameSettings>) {
    Object.entries(newSettings).forEach(([key, value]) => {
      const k = key as SettingKey;
      if (this.currentSettings[k] !== value) {
        // Fix: Cast to any to avoid TS error: Type 'any' is not assignable to type 'never'.
        (this.currentSettings as any)[k] = value;
        this.emit(k, value);
      }
    });
    this.save();
  }

  // Helper for Legacy compatibility
  static setQuality(quality: GraphicsQuality) {
    this.set('quality', quality);
  }

  private static save() {
    localStorage.setItem(this.KEY, JSON.stringify(this.currentSettings));
  }

  static onChange(callback: SettingListener) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private static emit(key: SettingKey, value: any) {
    this.listeners.forEach(cb => cb(key, value));
  }

  // Called by GameCanvas on create
  static applyAll() {
    // Re-emit all current settings to ensure game systems sync up
    Object.keys(this.currentSettings).forEach(key => {
        const k = key as SettingKey;
        this.emit(k, this.currentSettings[k]);
    });
  }
}

// Initialize immediately
SettingsManager.init();
