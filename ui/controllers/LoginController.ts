
/**
 * TITAN ENGINE: LOGIN CONTROLLER
 * Isolated UI logic for the entry gate.
 * Decoupled from the 3D Engine to ensure stability.
 */
export class LoginController {
  private container: HTMLElement;

  constructor() {}

  public init(root: HTMLElement) {
    this.container = document.createElement('div');
    Object.assign(this.container.style, {
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#050505',
      backgroundImage: 'radial-gradient(circle at center, #1a0b2e 0%, #000000 100%)',
      fontFamily: "'Cinzel', serif",
      color: '#fbbf24',
      overflow: 'hidden'
    });

    this.renderForm();
    root.appendChild(this.container);
  }

  private renderForm() {
    const card = document.createElement('div');
    Object.assign(card.style, {
      width: '320px',
      padding: '40px',
      border: '2px solid #444',
      borderTop: '4px solid #fbbf24',
      backgroundColor: 'rgba(0,0,0,0.85)',
      boxShadow: '0 0 50px rgba(0,0,0,0.8)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    });

    // Header
    const title = document.createElement('h1');
    title.innerText = "ALEATORIA";
    title.style.fontSize = '32px';
    title.style.textAlign = 'center';
    title.style.marginBottom = '10px';
    title.style.letterSpacing = '0.2em';
    title.style.textShadow = '0 0 20px #fbbf24';

    // Inputs
    const emailInput = this.createInput('Scribe Email', 'email');
    const passInput = this.createInput('Secret Sigil', 'password');

    // Button
    const btn = document.createElement('button');
    btn.innerText = "ENTER WORLD";
    Object.assign(btn.style, {
      padding: '15px',
      marginTop: '10px',
      backgroundColor: '#fbbf24',
      color: '#000',
      border: 'none',
      fontWeight: '900',
      fontSize: '14px',
      letterSpacing: '0.1em',
      cursor: 'pointer',
      transition: 'transform 0.1s'
    });

    btn.onmouseover = () => btn.style.backgroundColor = '#f59e0b';
    btn.onmouseout = () => btn.style.backgroundColor = '#fbbf24';
    
    btn.onclick = () => {
      const email = (emailInput.querySelector('input') as HTMLInputElement).value;
      const pass = (passInput.querySelector('input') as HTMLInputElement).value;
      this.attemptLogin(email, pass, btn);
    };

    card.appendChild(title);
    card.appendChild(emailInput);
    card.appendChild(passInput);
    card.appendChild(btn);
    this.container.appendChild(card);

    // Version Tag
    const version = document.createElement('div');
    version.innerText = "Titan Engine v0.3.0 (Safe Mode)";
    version.style.position = 'absolute';
    version.style.bottom = '20px';
    version.style.opacity = '0.3';
    version.style.fontSize = '10px';
    this.container.appendChild(version);
  }

  private createInput(placeholder: string, type: string): HTMLElement {
    const wrapper = document.createElement('div');
    const input = document.createElement('input');
    input.type = type;
    input.placeholder = placeholder;
    Object.assign(input.style, {
      width: '100%',
      padding: '12px',
      backgroundColor: '#111',
      border: '1px solid #333',
      color: '#e5e5e5',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box'
    });
    
    input.onfocus = () => input.style.borderColor = '#fbbf24';
    input.onblur = () => input.style.borderColor = '#333';

    wrapper.appendChild(input);
    return wrapper;
  }

  private attemptLogin(email: string, pass: string, btn: HTMLButtonElement) {
    if (!email || !pass) {
      alert("The gate requires a Key (Email) and a Sigil (Password).");
      return;
    }

    btn.innerText = "COMMUNING...";
    btn.style.opacity = '0.5';
    btn.style.pointerEvents = 'none';

    console.log(`[Login] Attempting auth for: ${email}`);

    // Simulate API delay
    setTimeout(() => {
      console.log("🚀 PHASE 43: LOGIN SUCCESS");
      
      // Dispatch Event for Main Controller
      const event = new CustomEvent('LOGIN_SUCCESS', { detail: { email } });
      document.dispatchEvent(event);

      // Visual Feedback
      btn.innerText = "ACCESS GRANTED";
      btn.style.backgroundColor = '#10b981';
    }, 1000);
  }
}
