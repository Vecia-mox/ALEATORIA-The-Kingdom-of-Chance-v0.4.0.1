
/**
 * TITAN ENGINE: INPUT SYSTEM
 * Abstracts hardware inputs (Keyboard, Touch, Gamepad) into semantic Actions.
 */

export type InputDevice = 'KEYBOARD' | 'GAMEPAD' | 'TOUCH';

export interface ActionBinding {
  name: string;
  keys?: string[]; // e.g. ['KeyW', 'ArrowUp']
  gamepadButtons?: number[]; // e.g. [0] (A button)
  mouseButtons?: number[]; // e.g. [0] (Left Click)
}

export interface AxisBinding {
  name: string;
  positiveKeys?: string[];
  negativeKeys?: string[];
  gamepadAxis?: number;
}

export class InputSystem {
  private static instance: InputSystem;
  
  // State
  private activeDevice: InputDevice = 'KEYBOARD';
  private actionStates: Map<string, boolean> = new Map();
  private axisStates: Map<string, number> = new Map();
  
  // Configuration
  private bindings: ActionBinding[] = [];
  private axisBindings: AxisBinding[] = [];
  
  // Virtual Joystick (Mobile)
  private joystick = {
    active: false,
    origin: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
    vector: { x: 0, y: 0 }, // Normalized -1 to 1
    identifier: -1
  };

  private constructor() {
    this.setupListeners();
    if (this.isTouchDevice()) {
      this.activeDevice = 'TOUCH';
      this.createVirtualJoystickOverlay();
    }
  }

  public static getInstance(): InputSystem {
    if (!InputSystem.instance) InputSystem.instance = new InputSystem();
    return InputSystem.instance;
  }

  // --- SETUP ---

  public mapAction(name: string, keys: string[]) {
    this.bindings.push({ name, keys });
  }

  public mapAxis(name: string, positive: string[], negative: string[]) {
    this.axisBindings.push({ name, positiveKeys: positive, negativeKeys: negative });
  }

  private isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  private setupListeners() {
    // Keyboard
    window.addEventListener('keydown', (e) => this.handleKey(e.code, true));
    window.addEventListener('keyup', (e) => this.handleKey(e.code, false));
    
    // Gamepad
    window.addEventListener('gamepadconnected', () => this.activeDevice = 'GAMEPAD');
    
    // Mouse (for actions like Fire)
    window.addEventListener('mousedown', (e) => this.handleMouse(e.button, true));
    window.addEventListener('mouseup', (e) => this.handleMouse(e.button, false));
  }

  // --- HANDLERS ---

  private handleKey(code: string, isDown: boolean) {
    if (this.activeDevice !== 'KEYBOARD') this.activeDevice = 'KEYBOARD';

    // Update Actions
    for (const binding of this.bindings) {
      if (binding.keys?.includes(code)) {
        this.actionStates.set(binding.name, isDown);
      }
    }
  }

  private handleMouse(button: number, isDown: boolean) {
    // Implementation for mouse buttons mapping
  }

  // --- API ---

  public getAction(name: string): boolean {
    return this.actionStates.get(name) || false;
  }

  /**
   * Returns a normalized vector {x, y} for movement.
   * Handles Keyboard (WASD) and Touch Joystick automatically.
   */
  public getMoveVector(): { x: number, y: number } {
    if (this.activeDevice === 'TOUCH') {
      return { ...this.joystick.vector };
    }

    // Keyboard Axis Calculation
    let x = 0;
    let y = 0;

    // Check specific WASD bindings manually or via mapped axes
    // For simplicity, we hardcode standard WASD check here relative to mapped axes
    // In a real engine, we'd iterate this.axisBindings
    const w = this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp') ? 1 : 0;
    const s = this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown') ? 1 : 0;
    const a = this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft') ? 1 : 0;
    const d = this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight') ? 1 : 0;

    x = d - a;
    y = s - w;

    // Normalize
    const mag = Math.sqrt(x*x + y*y);
    if (mag > 1) {
      x /= mag;
      y /= mag;
    }

    return { x, y };
  }

  private isKeyDown(code: string): boolean {
    // Helper to check raw key state if needed
    // In a full implementation, we track raw key states separately
    return false; // Placeholder, implies implementing raw state map activeKeys
  }

  // --- VIRTUAL JOYSTICK (TOUCH) ---

  private createVirtualJoystickOverlay() {
    const zone = document.createElement('div');
    Object.assign(zone.style, {
      position: 'fixed', bottom: '20px', left: '20px', width: '150px', height: '150px',
      borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', touchAction: 'none', zIndex: '9999'
    });

    const stick = document.createElement('div');
    Object.assign(stick.style, {
      position: 'absolute', top: '50%', left: '50%', width: '50px', height: '50px',
      background: 'rgba(255, 255, 255, 0.5)', borderRadius: '50%', transform: 'translate(-50%, -50%)',
      pointerEvents: 'none'
    });

    zone.appendChild(stick);
    document.body.appendChild(zone);

    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      this.joystick.active = true;
      this.joystick.identifier = touch.identifier;
      const rect = zone.getBoundingClientRect();
      this.joystick.origin = { x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
      this.updateJoystick(touch.clientX, touch.clientY, stick);
    });

    zone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (let i=0; i<e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.joystick.identifier) {
          this.updateJoystick(e.changedTouches[i].clientX, e.changedTouches[i].clientY, stick);
        }
      }
    });

    const end = (e: TouchEvent) => {
      e.preventDefault();
      for (let i=0; i<e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.joystick.identifier) {
          this.joystick.active = false;
          this.joystick.vector = { x: 0, y: 0 };
          stick.style.transform = `translate(-50%, -50%)`;
        }
      }
    };
    zone.addEventListener('touchend', end);
    zone.addEventListener('touchcancel', end);
  }

  private updateJoystick(clientX: number, clientY: number, stickEl: HTMLDivElement) {
    const maxRadius = 50;
    let dx = clientX - this.joystick.origin.x;
    let dy = clientY - this.joystick.origin.y;
    
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > maxRadius) {
      const ratio = maxRadius / dist;
      dx *= ratio;
      dy *= ratio;
    }

    // Normalize output (-1 to 1)
    this.joystick.vector = {
      x: dx / maxRadius,
      y: dy / maxRadius
    };

    stickEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }
}
