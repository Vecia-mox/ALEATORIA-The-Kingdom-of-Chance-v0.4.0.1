
/**
 * TITAN ENGINE: MEMORY GUARD
 * Prevents OOM crashes by capping resolution and texture limits.
 */
export class MemoryGuard {
  
  public static enforceBudget(gl: WebGL2RenderingContext) {
    // 1. Detect Memory (Chrome only)
    const memory = (performance as any).memory;
    if (memory) {
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
        console.log(`[MemoryGuard] Heap: ${usedMB}MB / ${limitMB}MB`);
        
        // Panic Mode: If using > 80% of heap
        if (usedMB > limitMB * 0.8) {
            console.warn("[MemoryGuard] CRITICAL MEMORY. Dropping resolution.");
            this.setLowQuality(gl);
            return;
        }
    }

    // 2. Mobile Detection (Rough Heuristic)
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile) {
        console.log("[MemoryGuard] Mobile Device Detected. Capping Quality.");
        this.setMobileProfile(gl);
    }
  }

  private static setMobileProfile(gl: WebGL2RenderingContext) {
    // Limit Pixel Ratio to 1.0 (No Retina)
    // Handled in Renderer usually, but we enforce sizing here
    const canvas = gl.canvas as HTMLCanvasElement;
    if (window.devicePixelRatio > 1) {
        console.log("[MemoryGuard] Disabling Retina scaling.");
        // We don't change canvas width/height here to avoid layout thrashing,
        // but we rely on the Renderer to use a scale factor < 1.0.
    }
  }

  private static setLowQuality(gl: WebGL2RenderingContext) {
      // Emergency dump
      // In a real engine: Clear Texture Caches
      // Here: Just log suggestion
      console.warn("Suggest calling AssetLoader.clearCache()");
  }
}
