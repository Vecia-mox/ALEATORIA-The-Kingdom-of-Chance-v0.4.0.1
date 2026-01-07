
/**
 * TITAN ENGINE: ENVIRONMENT RIG
 * Handles Image-Based Lighting (IBL) using HDRI textures.
 * Provides the "Fill Light" that prevents pitch-black shadows.
 */

import { AssetLoader } from '../assets/AssetLoader';
import { Renderer3D } from './Renderer3D';

export class EnvironmentRig {
  private gl: WebGL2RenderingContext;
  private environmentMap: WebGLTexture | null = null;
  private irradianceMap: WebGLTexture | null = null; // Blurred version for diffuse
  
  // Settings
  public exposure: number = 2.0; // Boost brightness for dark dungeons
  public rotation: number = 0.0; // Rotate skybox

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  public async loadEnvironment(url: string) {
    console.log(`[EnvRig] Loading HDRI: ${url}`);
    
    // In a real engine, this loads an .exr or .hdr file.
    // For WebGL without heavy parsers, we often use pre-convoluted .png/.jpg sets (Cubemaps).
    // Here we assume AssetLoader returns a loaded WebGLTexture or Image.
    
    // Simulating AssetLoader call
    // const envImage = await AssetLoader.getInstance().loadAsset(url, 'TEXTURE');
    
    // Create Texture (Placeholder logic)
    this.environmentMap = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.environmentMap);
    // Set 1x1 pink pixel as placeholder indicating "Missing Texture" or "Loading"
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, new Uint8Array([50, 50, 60, 255]));
    
    // Bind to Renderer Global Uniforms (Mock)
    // Renderer3D.setGlobalTexture('uEnvMap', this.environmentMap);
    // Renderer3D.setGlobalFloat('uEnvExposure', this.exposure);
  }

  /**
   * Updates uniforms related to environment lighting.
   * Call this before the Lighting Pass.
   */
  public bind(program: WebGLProgram) {
    if (!this.environmentMap) return;

    // Bind Environment Map to Texture Unit 5 (Reserved for Sky)
    this.gl.activeTexture(this.gl.TEXTURE5);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.environmentMap);
    
    const locMap = this.gl.getUniformLocation(program, 'uEnvironmentMap');
    const locExp = this.gl.getUniformLocation(program, 'uExposure');
    const locRot = this.gl.getUniformLocation(program, 'uEnvRotation');

    if (locMap) this.gl.uniform1i(locMap, 5);
    if (locExp) this.gl.uniform1f(locExp, this.exposure);
    if (locRot) this.gl.uniform1f(locRot, this.rotation);
  }
}
