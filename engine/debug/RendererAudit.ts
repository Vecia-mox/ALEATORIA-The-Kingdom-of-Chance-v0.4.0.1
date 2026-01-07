
/**
 * TITAN ENGINE: RENDERER AUDIT
 * Used to verify the WebGL Context is active and drawing.
 * Usage: RendererAudit.run(gl);
 */
export class RendererAudit {
  
  /**
   * Forces the entire screen to Green.
   * If the screen remains Black after calling this loop, the Canvas is not in the DOM
   * or is covered by another element.
   */
  public static run(gl: WebGL2RenderingContext) {
    console.log("%c[RendererAudit] FORCING GREEN SCREEN TEST", "color: #0f0; background: #000; font-size: 16px");

    const loop = () => {
        // 1. Reset State
        gl.disable(gl.SCISSOR_TEST);
        gl.colorMask(true, true, true, true);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Target Screen
        
        // 2. Set Clear Color (Neon Green)
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.0, 1.0, 0.0, 1.0); 
        gl.clear(gl.COLOR_BUFFER_BIT);

        requestAnimationFrame(loop);
    };
    
    loop();
  }

  /**
   * Checks for specific WebGL errors that cause black screens.
   */
  public static checkErrors(gl: WebGL2RenderingContext) {
      const error = gl.getError();
      if (error !== gl.NO_ERROR) {
          console.error(`[RendererAudit] WebGL Error: ${error}`);
          return false;
      }
      
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      if (status !== gl.FRAMEBUFFER_COMPLETE) {
          console.error(`[RendererAudit] Framebuffer Incomplete: ${status}`);
          return false;
      }

      return true;
  }
}
