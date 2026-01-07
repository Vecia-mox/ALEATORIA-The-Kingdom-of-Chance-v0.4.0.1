
/**
 * TITAN ENGINE: TEXTURE FALLBACK
 * Generates a high-contrast 2x2 Checkerboard (Black/Magenta)
 * Used when a texture fails to load to prevent black screen crashes.
 */

export class TextureFallback {
  private static fallbackUrl: string | null = null;

  /**
   * Returns a Data URI for a 64x64 checkerboard image.
   */
  public static get(): string {
    if (this.fallbackUrl) return this.fallbackUrl;

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Draw Magenta Background
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(0, 0, 64, 64);

      // Draw Black Checks
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillRect(32, 32, 32, 32);
      
      // Add text label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText('ERR', 4, 20);
    }

    this.fallbackUrl = canvas.toDataURL();
    return this.fallbackUrl;
  }

  /**
   * Creates a WebGL texture directly from the fallback data.
   */
  public static createWebGLTexture(gl: WebGL2RenderingContext): WebGLTexture {
    const texture = gl.createTexture();
    if (!texture) throw new Error("Failed to create fallback texture");

    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // 2x2 Magenta/Black pixels
    const data = new Uint8Array([
      0, 0, 0, 255,       255, 0, 255, 255, // Row 1: Black, Magenta
      255, 0, 255, 255,   0, 0, 0, 255      // Row 2: Magenta, Black
    ]);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    
    // Nearest neighbor for that "Missing Texture" pixelated look
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    return texture;
  }
}
