
import { AudioManager } from '../audio/AudioManager';
import { PermissionManager } from '../utils/PermissionManager';
import { ResizeHandler } from '../graphics/ResizeHandler';

/**
 * TITAN ENGINE: START GATE
 * Blocks game execution until User Interaction occurs.
 * This is required to:
 * 1. Unlock WebAudio Context (Autoplay Policy).
 * 2. Request Permissions (Microphone).
 * 3. Ensure Window Dimensions are valid.
 */
export class StartGate {
  private container: HTMLElement;
  private button: HTMLElement;
  private onStartCallback: () => void;
  private resizer: ResizeHandler | null = null;

  constructor(onStart: () => void) {
    this.onStartCallback = onStart;
    this.createDOM();
  }

  public setResizer(resizer: ResizeHandler) {
    this.resizer = resizer;
  }

  private createDOM() {
    this.container = document.createElement('div');
    Object.assign(this.container.style, {
      position: 'fixed',
      top: '0', left: '0', width: '100%', height: '100%',
      backgroundColor: '#000000',
      zIndex: '20000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'opacity 0.5s ease-out'
    });

    const title = document.createElement('h1');
    title.innerText = "ALEATORIA";
    title.style.color = '#fbbf24';
    title.style.fontFamily = 'serif';
    title.style.fontSize = '48px';
    title.style.letterSpacing = '8px';
    title.style.marginBottom = '40px';
    title.style.textShadow = '0 0 20px #b45309';

    this.button = document.createElement('button');
    this.button.innerText = "ENTER REALM";
    Object.assign(this.button.style, {
      padding: '20px 40px',
      fontSize: '18px',
      fontWeight: '900',
      letterSpacing: '2px',
      color: '#000',
      backgroundColor: '#fbbf24',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 0 30px rgba(251, 191, 36, 0.6)'
    });

    this.button.addEventListener('click', () => this.unlockAndStart());
    this.button.addEventListener('touchstart', () => this.unlockAndStart());

    this.container.appendChild(title);
    this.container.appendChild(this.button);
    document.body.appendChild(this.container);
  }

  private async unlockAndStart() {
    console.log("[StartGate] Interaction detected. Unlocking systems...");
    
    // Disable button to prevent double clicks
    this.button.style.pointerEvents = 'none';
    this.button.innerText = "INITIALIZING...";

    // 1. Unlock Audio
    const audio = AudioManager.getInstance();
    if (audio.ctx.state === 'suspended') {
        try {
            await audio.ctx.resume();
            console.log("[StartGate] Audio Context Resumed.");
        } catch (e) {
            console.warn("[StartGate] Audio resume failed:", e);
        }
    }

    // 2. Request Permissions (Don't await if you want fast start, but here we await to ensure mic ready)
    await PermissionManager.requestMicrophone();

    // 3. Force Resize (Fixes Black Screen on mobile iframe)
    if (this.resizer) {
        this.resizer.forceResize();
    }

    // 4. Fade Out
    this.container.style.opacity = '0';
    setTimeout(() => {
        if (this.container.parentElement) {
            this.container.parentElement.removeChild(this.container);
        }
        // 5. Start Game Loop
        this.onStartCallback();
    }, 500);
  }
}
