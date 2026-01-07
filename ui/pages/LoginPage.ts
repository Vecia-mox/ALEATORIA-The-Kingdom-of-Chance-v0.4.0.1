
/**
 * PHASE 1: LOGIN PAGE
 * Pure HTML/CSS. If this fails, the browser engine is broken.
 */
export class LoginPage {
  private parent: HTMLElement;
  private onLoginSuccess: () => void;

  constructor(parent: HTMLElement, onSuccess: () => void) {
    this.parent = parent;
    this.onLoginSuccess = onSuccess;
  }

  public render() {
    const container = document.createElement('div');
    Object.assign(container.style, {
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(to bottom, #1a0b2e, #000000)',
      fontFamily: 'serif', color: '#fbbf24'
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
      width: '300px', padding: '40px',
      border: '2px solid #444',
      backgroundColor: 'rgba(0,0,0,0.8)',
      textAlign: 'center',
      boxShadow: '0 0 50px rgba(0,0,0,0.5)'
    });

    const title = document.createElement('h1');
    title.innerText = "ALEATORIA";
    title.style.letterSpacing = '5px';
    title.style.marginBottom = '30px';

    const inputStyle = `
      width: 100%; padding: 10px; margin-bottom: 15px;
      background: #111; border: 1px solid #555; color: white;
      box-sizing: border-box;
    `;

    const email = document.createElement('input');
    email.placeholder = "Scribe Email";
    email.style.cssText = inputStyle;

    const pass = document.createElement('input');
    pass.type = "password";
    pass.placeholder = "Secret Sigil";
    pass.style.cssText = inputStyle;

    const btn = document.createElement('button');
    btn.innerText = "ENTER REALM";
    btn.style.cssText = `
      width: 100%; padding: 15px;
      background: #fbbf24; color: black; border: none;
      font-weight: bold; cursor: pointer; margin-top: 10px;
    `;
    btn.onclick = () => {
      if(email.value.length > 3) {
        // Save session
        sessionStorage.setItem('aleatoria_user', email.value);
        this.onLoginSuccess();
      } else {
        email.style.borderColor = 'red';
      }
    };

    box.appendChild(title);
    box.appendChild(email);
    box.appendChild(pass);
    box.appendChild(btn);
    container.appendChild(box);
    this.parent.appendChild(container);
  }
}
