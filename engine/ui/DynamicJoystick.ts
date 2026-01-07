
import { MobileBridge } from '../../services/MobileBridge';

/**
 * TITAN ENGINE: DYNAMIC JOYSTICK
 * A floating virtual stick that appears on touch and fades out on release.
 * Updates the global MobileBridge state.
 */
export class DynamicJoystick {
  private container: HTMLElement;
  private base: HTMLElement;
  private knob: HTMLElement;
  
  // Configuration
  private readonly MAX_RADIUS = 60; // Pixels
  private readonly FADE_DURATION = '0.2s';
  
  // State
  private isActive: boolean = false;
  private origin = { x: 0, y: 0 };
  private touchId: number | null = null;

  constructor() {
    this.createDOM();
    this.attachListeners();
  }

  private createDOM() {
    this.container = document.createElement('div');
    Object.assign(this.container.style, {
      position: 'absolute',
      top: '0', left: '0', width: '50%', height: '100%', // Left half of screen
      touchAction: 'none',
      zIndex: '5000',
      pointerEvents: 'auto' // Catch touches
    });

    this.base = document.createElement('div');
    Object.assign(this.base.style, {
      position: 'absolute',
      width: '120px', height: '120px',
      borderRadius: '50%',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.4) 100%)',
      transform: 'translate(-50%, -50%)',
      opacity: '0',
      transition: `opacity ${this.FADE_DURATION}`,
      pointerEvents: 'none'
    });

    this.knob = document.createElement('div');
    Object.assign(this.knob.style, {
      position: 'absolute',
      width: '50px', height: '50px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)',
      boxShadow: '0 0 15px rgba(251, 191, 36, 0.5)',
      transform: 'translate(-50%, -50%)',
      opacity: '0',
      transition: `opacity ${this.FADE_DURATION}`,
      pointerEvents: 'none'
    });

    this.container.appendChild(this.base);
    this.container.appendChild(this.knob);
    document.body.appendChild(this.container);
  }

  private attachListeners() {
    this.container.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
    this.container.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
    this.container.addEventListener('touchend', this.handleEnd.bind(this));
    this.container.addEventListener('touchcancel', this.handleEnd.bind(this));
  }

  private handleStart(e: TouchEvent) {
    e.preventDefault();
    if (this.isActive) return;

    const touch = e.changedTouches[0];
    this.touchId = touch.identifier;
    this.isActive = true;

    // Set Origin
    this.origin = { x: touch.clientX, y: touch.clientY };
    this.updateVisuals(touch.clientX, touch.clientY);

    // Show
    this.base.style.opacity = '1';
    this.knob.style.opacity = '1';
    
    // Initial Move Update (Zero)
    MobileBridge.moveDir = { x: 0, y: 0 };
  }

  private updateVisuals(x: number, y: number) {
    this.base.style.left = `${this.origin.x}px`;
    this.base.style.top = `${this.origin.y}px`;
    this.knob.style.left = `${x}px`;
    this.knob.style.top = `${y}px`;
  }

  private handleMove(e: TouchEvent) {
    e.preventDefault();
    if (!this.isActive) return;

    // Find our touch
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.touchId) {
        const touch = e.changedTouches[i];
        
        const dx = touch.clientX - this.origin.x;
        const dy = touch.clientY - this.origin.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Clamp visuals
        let visualX = dx;
        let visualY = dy;
        
        if (dist > this.MAX_RADIUS) {
          const ratio = this.MAX_RADIUS / dist;
          visualX *= ratio;
          visualY *= ratio;
        }

        this.knob.style.left = `${this.origin.x + visualX}px`;
        this.knob.style.top = `${this.origin.y + visualY}px`;

        // Update Logic (Normalized Vector)
        MobileBridge.moveDir = {
          x: dx / this.MAX_RADIUS, // Can exceed 1.0 logic-side for running thresholds
          y: dy / this.MAX_RADIUS
        };
        
        // Clamp output vector to length 1.0 usually
        const len = Math.sqrt(MobileBridge.moveDir.x**2 + MobileBridge.moveDir.y**2);
        if (len > 1.0) {
            MobileBridge.moveDir.x /= len;
            MobileBridge.moveDir.y /= len;
        }
        break;
      }
    }
  }

  private handleEnd(e: TouchEvent) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.touchId) {
        this.isActive = false;
        this.touchId = null;
        
        // Hide
        this.base.style.opacity = '0';
        this.knob.style.opacity = '0';
        
        // Reset Logic
        MobileBridge.moveDir = { x: 0, y: 0 };
        break;
      }
    }
  }

  public destroy() {
    this.container.remove();
  }
}
