
/**
 * TITAN ENGINE: CANVAS DOCTOR
 * Diagnoses why the Canvas might be invisible (0 size, hidden, z-index).
 */
export class CanvasDoctor {
  
  public static diagnose(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    
    if (!canvas) {
        this.alert("CRITICAL: Canvas element not found in DOM.");
        return;
    }

    const style = window.getComputedStyle(canvas);
    const rect = canvas.getBoundingClientRect();

    console.log("[CanvasDoctor] Diagnostics:", {
        id: canvasId,
        width: canvas.width,
        height: canvas.height,
        cssWidth: rect.width,
        cssHeight: rect.height,
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        zIndex: style.zIndex,
        position: style.position
    });

    // 1. Check Dimensions
    if (canvas.width === 0 || canvas.height === 0) {
        this.alert("Canvas Internal Resolution is 0. Resizing...");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    if (rect.width === 0 || rect.height === 0) {
        this.alert("Canvas CSS Size is 0. Forcing Style...");
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
    }

    // 2. Check Visibility
    if (style.display === 'none') {
        this.alert("Canvas is Display:None. Fixing...");
        canvas.style.display = 'block';
    }
    
    if (style.opacity === '0') {
        this.alert("Canvas is Transparent. Fixing...");
        canvas.style.opacity = '1';
    }

    // 3. Force Z-Index
    if (style.zIndex === 'auto' || parseInt(style.zIndex) < 0) {
        console.warn("[CanvasDoctor] Z-Index low. Bringing to front.");
        canvas.style.zIndex = '1'; // Above background, below UI
    }
    
    // 4. Force Background Color (Visual debug)
    // If WebGL fails transparently, we should at least see Red background
    canvas.style.backgroundColor = '#220000'; 
  }

  private static alert(msg: string) {
      console.error(`[CanvasDoctor] ${msg}`);
      const div = document.createElement('div');
      div.style.cssText = "position:fixed; top:0; left:0; background:red; color:white; padding:10px; z-index:99999;";
      div.innerText = msg;
      document.body.appendChild(div);
      setTimeout(() => div.remove(), 5000);
  }
}
