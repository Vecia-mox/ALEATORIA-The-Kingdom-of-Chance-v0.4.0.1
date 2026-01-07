
/**
 * TITAN ENGINE: PERMISSION MANAGER
 * Handles Microphone and Sensor permissions without crashing the app.
 */
export class PermissionManager {
  
  /**
   * Requests Microphone access for Voice Chat.
   * Returns true if granted, false if denied/error.
   * Does NOT throw.
   */
  static async requestMicrophone(): Promise<boolean> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("[Permission] Microphone API not supported.");
      return false;
    }

    try {
      console.log("[Permission] Requesting Microphone...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // We don't keep the stream here, just unlocking the permission.
      // The VoiceSystem will request it again (and get it instantly).
      stream.getTracks().forEach(t => t.stop());
      
      console.log("[Permission] Microphone Granted.");
      return true;
    } catch (e) {
      console.warn("[Permission] Microphone Denied or Failed:", e);
      return false;
    }
  }

  /**
   * Requests Device Orientation (Gyroscope) for VR/AR.
   */
  static async requestOrientation(): Promise<boolean> {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        console.log(`[Permission] Orientation: ${response}`);
        return response === 'granted';
      } catch (e) {
        console.warn("[Permission] Orientation Failed:", e);
        return false;
      }
    }
    return true; // Non-iOS devices usually don't need explicit permission
  }
}
