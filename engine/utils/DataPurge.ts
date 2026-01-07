
/**
 * TITAN ENGINE: DATA PURGE
 * Emergency utility to wipe corrupt LocalStorage/Session data.
 */
export class DataPurge {
  public static run() {
    console.warn("⚠️ TITAN ENGINE: EXECUTING DATA PURGE ⚠️");

    try {
      // 1. Clear Storage
      localStorage.clear();
      sessionStorage.clear();
      console.log("[DataPurge] Local & Session Storage cleared.");

      // 2. Clear URL Hash (often used for routing/state)
      if (window.location.hash) {
        history.pushState("", document.title, window.location.pathname + window.location.search);
        console.log("[DataPurge] URL Hash reset.");
      }

      // 3. Force Audio Context Unlock (iOS/Mobile)
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        ctx.resume();
        console.log("[DataPurge] Audio Context Attempted Unlock.");
      }

    } catch (e) {
      console.error("[DataPurge] Failed during purge sequence:", e);
    }
  }
}
