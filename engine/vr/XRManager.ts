
/**
 * TITAN ENGINE: XR MANAGER
 * Handles WebXR Sessions (VR/AR), Reference Spaces, and Render Loops.
 */

// --- WebXR Type Polyfills ---
declare global {
  interface Navigator {
    xr: XRSystem;
  }
  class XRSystem {
    isSessionSupported(mode: string): Promise<boolean>;
    requestSession(mode: string, options?: any): Promise<XRSession>;
  }
  class XRSession {
    inputSources: XRInputSource[];
    renderState: XRRenderState;
    requestReferenceSpace(type: string): Promise<XRReferenceSpace>;
    updateRenderState(state: any): void;
    requestAnimationFrame(callback: (time: number, frame: XRFrame) => void): number;
    end(): Promise<void>;
    addEventListener(type: string, listener: (evt: any) => void): void;
  }
  class XRRenderState {
    baseLayer?: XRWebGLLayer;
  }
  class XRReferenceSpace extends XRSpace {
    getOffsetReferenceSpace(transform: XRRigidTransform): XRReferenceSpace;
  }
  class XRFrame {
    getViewerPose(referenceSpace: XRReferenceSpace): XRViewerPose | null;
    getPose(space: XRSpace, baseSpace: XRReferenceSpace): XRPose | null;
  }
  class XRViewerPose extends XRPose {
    views: XRView[];
  }
  class XRPose {
    transform: XRRigidTransform;
  }
  class XRSpace {}
  class XRView {
    transform: XRRigidTransform;
    projectionMatrix: Float32Array;
  }
  class XRInputSource {
    hand: any;
    gamepad: Gamepad | null;
    handedness: 'none' | 'left' | 'right';
    gripSpace?: XRSpace;
    targetRaySpace?: XRSpace;
  }
  class XRWebGLLayer {
    constructor(session: XRSession, context: WebGLRenderingContext | WebGL2RenderingContext);
    framebuffer: WebGLFramebuffer;
  }
  class XRRigidTransform {
    constructor(position?: {x:number, y:number, z:number}, orientation?: {x:number, y:number, z:number, w:number});
    matrix: Float32Array;
  }
  interface WebGL2RenderingContext {
    makeXRCompatible(): Promise<void>;
  }
}

export class XRManager {
  private gl: WebGL2RenderingContext;
  private session: XRSession | null = null;
  private referenceSpace: XRReferenceSpace | null = null;
  private viewerPose: XRViewerPose | null = null;
  
  public onSessionStart: (() => void) | null = null;
  public onSessionEnd: (() => void) | null = null;
  public onFrame: ((time: number, frame: XRFrame, pose: XRViewerPose) => void) | null = null;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  public async isSupported(mode: 'immersive-vr' | 'immersive-ar'): Promise<boolean> {
    if (!navigator.xr) return false;
    return navigator.xr.isSessionSupported(mode);
  }

  public async startSession(mode: 'immersive-vr' | 'immersive-ar') {
    if (this.session) return;

    try {
      const session = await navigator.xr.requestSession(mode, {
        requiredFeatures: ['local-floor'],
        optionalFeatures: ['bounded-floor', 'hand-tracking']
      });

      this.session = session;
      
      // Hook into WebGL context
      await this.gl.makeXRCompatible();
      
      // Setup Render Layer
      const layer = new XRWebGLLayer(this.session!, this.gl);
      session.updateRenderState({ baseLayer: layer });

      // Get Reference Space (Local Floor is standard for standing VR)
      this.referenceSpace = await session.requestReferenceSpace('local-floor');

      // Loop
      session.requestAnimationFrame(this.renderLoop.bind(this));
      session.addEventListener('end', this.onEnd.bind(this));

      if (this.onSessionStart) this.onSessionStart();
      console.log(`[XR] Started ${mode} session.`);

    } catch (e) {
      console.error('[XR] Failed to start session:', e);
    }
  }

  public endSession() {
    if (this.session) {
      this.session.end();
    }
  }

  private onEnd() {
    this.session = null;
    this.referenceSpace = null;
    this.viewerPose = null;
    if (this.onSessionEnd) this.onSessionEnd();
  }

  private renderLoop(time: number, frame: XRFrame) {
    if (!this.session) return; // Session ended

    // Schedule next frame immediately
    this.session.requestAnimationFrame(this.renderLoop.bind(this));

    const pose = frame.getViewerPose(this.referenceSpace!);
    if (pose) {
      this.viewerPose = pose;
      
      // Prepare Framebuffer
      const layer = this.session.renderState.baseLayer!;
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, layer.framebuffer);

      // Clear (Important for AR transparency)
      this.gl.clearColor(0, 0, 0, 0); 
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

      // Callback to Main Renderer
      if (this.onFrame) {
        this.onFrame(time, frame, pose);
      }
    }
  }

  public getViewerPose(): XRViewerPose | null {
    return this.viewerPose;
  }

  public getReferenceSpace(): XRReferenceSpace | null {
    return this.referenceSpace;
  }
}
