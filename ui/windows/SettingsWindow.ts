
import { AudioManager } from '../../engine/audio/AudioManager';

export class SettingsWindow {
    // A lightweight handler for the audio toggle since the UI is embedded in HUD
    public static toggleMute(): boolean {
        const am = AudioManager.getInstance();
        const isMuted = am.toggleMute();
        console.log(`[Audio] Muted: ${isMuted}`);
        return isMuted;
    }
}
