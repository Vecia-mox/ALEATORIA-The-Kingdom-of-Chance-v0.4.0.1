
/**
 * TITAN ENGINE: HAPTICS MANAGER
 * Provides tactile feedback for combat events.
 */

import { SettingsManager } from '../../services/SettingsManager';

export type HapticType = 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'SUCCESS' | 'ERROR';

export class HapticsManager {
  private static lastTrigger: number = 0;
  private static readonly COOLDOWN = 80; // ms

  public static trigger(type: HapticType) {
    // 1. Check Settings
    const settings = SettingsManager.getSettings();
    if (!settings.vibration) return;

    // 2. Check Cooldown
    const now = Date.now();
    if (now - this.lastTrigger < this.COOLDOWN) return;
    this.lastTrigger = now;

    // 3. Trigger Pattern
    if (!navigator.vibrate) return;

    try {
        switch (type) {
            case 'LIGHT':
                navigator.vibrate(10); // UI Click
                break;
            case 'MEDIUM':
                navigator.vibrate(25); // Hit Enemy
                break;
            case 'HEAVY':
                navigator.vibrate([40, 20, 30]); // Took Damage / Ultimate
                break;
            case 'SUCCESS':
                navigator.vibrate([10, 30, 10]); // Craft / Level Up
                break;
            case 'ERROR':
                navigator.vibrate([30, 50, 30]); // Skill on Cooldown
                break;
        }
    } catch (e) {
        // Ignore vibration errors (user interaction requirements)
    }
  }
}
