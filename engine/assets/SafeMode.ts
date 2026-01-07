
import { AssetLoader } from './AssetLoader';

/**
 * TITAN ENGINE: SAFE MODE
 * Intercepts asset requests and returns lightweight dummies.
 * Prevents "Using all data" and OOM crashes during debugging.
 */
export class SafeMode {
  
  public static enable() {
    console.warn("[SafeMode] ENABLING ASSET BYPASS. No files will be downloaded.");

    const loader = AssetLoader.getInstance();

    // Monkey-patch the loadAsset method
    (loader as any).loadAsset = (url: string, type: 'MODEL' | 'TEXTURE'): Promise<any> => {
        console.log(`[SafeMode] Mocking: ${url}`);
        
        return new Promise((resolve) => {
            if (type === 'MODEL') {
                // Return a simple Cube definition (Mock GLTF)
                resolve({
                    vertices: new Float32Array([
                        -1, -1, 1,  1, -1, 1,  1, 1, 1,  -1, 1, 1, // Front
                        -1, -1, -1, -1, 1, -1, 1, 1, -1,  1, -1, -1 // Back
                    ]),
                    indices: new Uint16Array([
                        0, 1, 2, 0, 2, 3, 
                        4, 5, 6, 4, 6, 7
                    ]),
                    normals: new Float32Array(24),
                    uvs: new Float32Array(16)
                });
            } else {
                // Return a 1x1 Red Pixel Texture
                // We return the raw buffer, AssetLoader handles binding
                resolve(new Uint8Array([255, 0, 0, 255])); 
            }
        });
    };

    // Override streamTexture to return a procedural checkerboard instantly
    (loader as any).streamTexture = (gl: WebGL2RenderingContext, url: string): WebGLTexture => {
        const texture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // 2x2 Checkerboard (Red/Black)
        const data = new Uint8Array([
            255, 0, 0, 255,   0, 0, 0, 255,
            0, 0, 0, 255,     255, 0, 0, 255
        ]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        return texture;
    };
  }
}
