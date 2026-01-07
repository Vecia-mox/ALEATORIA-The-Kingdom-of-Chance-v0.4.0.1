
/**
 * TITAN ENGINE: SKY GENERATOR
 * Generates seamless 360° skyboxes using Generative AI.
 */

import { GoogleGenAI } from "@google/genai";

export class SkyGenerator {
  private ai: GoogleGenAI;
  private gl: WebGL2RenderingContext;
  private skyMesh: any; // Sphere mesh
  private currentTexture: WebGLTexture | null = null;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.initSkySphere();
  }

  /**
   * Generates a new skybox based on biome parameters.
   */
  public async generateSky(biomeName: string, timeOfDay: 'DAY' | 'NIGHT' | 'DUSK'): Promise<void> {
    const prompt = this.constructPrompt(biomeName, timeOfDay);
    console.log(`[SkyGen] Generating sky for ${biomeName}: "${prompt}"`);

    try {
      // Use Imagen model for high quality texture generation
      const response = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9', // Wide aspect for equirectangular approximation
        },
      });

      const base64Data = response.generatedImages[0].image.imageBytes;
      await this.applyTexture(base64Data);
      
      // Update global lighting based on generated sky colors
      // this.updateAmbientLight(base64Data);

    } catch (e) {
      console.error("[SkyGen] Generation failed:", e);
    }
  }

  private constructPrompt(biome: string, time: string): string {
    let base = `360 degree equirectangular panorama skybox of a ${biome} alien planet landscape.`;
    
    if (time === 'DAY') base += " Bright sun, clear atmosphere, vibrant colors, sci-fi concept art, high definition, 8k.";
    if (time === 'NIGHT') base += " Starry cosmos, nebula clouds, two moons, bioluminescent atmosphere, dark blue and purple hues, 8k.";
    if (time === 'DUSK') base += " Golden hour, dramatic sunset, orange and teal gradient, atmospheric fog, 8k.";

    return base;
  }

  private async applyTexture(base64: string) {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (this.currentTexture) this.gl.deleteTexture(this.currentTexture);
        
        this.currentTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.currentTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);
        
        // Trilinear filtering for smooth sky
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT); // Wrap horizontally
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE); // Clamp poles
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        
        resolve();
      };
      img.src = `data:image/jpeg;base64,${base64}`;
    });
  }

  private initSkySphere() {
    // Create a large inverted sphere mesh for rendering
    // Buffer setup omitted for brevity
  }

  public render(viewMatrix: Float32Array, projMatrix: Float32Array) {
    if (!this.currentTexture) return;
    
    // Disable depth write so sky is always behind everything
    this.gl.depthMask(false);
    
    // Bind Texture & Shader
    // Draw Sphere
    
    this.gl.depthMask(true);
  }
}
