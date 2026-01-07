/**
 * TITAN ENGINE: DATA WIPER
 * The Nuclear Option. Clears all persistence layers to recover from
 * corrupt save states or schema mismatches.
 */
export class DataWiper {
  
  public static nuke() {
    console.warn("%c☢️ INITIATING DATA PURGE ☢️", "color: red; font-size: 20px; font-weight: bold;");
    
    try {
      // 1. Local Storage
      const lsCount = localStorage.length;
      localStorage.clear();
      console.log(`[DataWiper] Cleared ${lsCount} LocalStorage keys.`);

      // 2. Session Storage
      const ssCount = sessionStorage.length;
      sessionStorage.clear();
      console.log(`[DataWiper] Cleared ${ssCount} SessionStorage keys.`);

      // 3. Cookies (Best Effort)
      document.cookie.split(";").forEach((c) => { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      console.log("[DataWiper] Attempted Cookie Purge.");

      // 4. Force Garbage Collection hint (if available/relevant context)
      if ((window as any).gc) {
        (window as any).gc();
      }

      console.log("%c✅ DATA PURGED. SYSTEM CLEAN.", "color: #4ade80; font-weight: bold;");
    } catch (e) {
      console.error("[DataWiper] Purge failed:", e);
    }
  }
}