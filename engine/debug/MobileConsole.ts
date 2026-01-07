
/**
 * TITAN ENGINE: MOBILE CONSOLE
 * Renders console logs directly to the screen for debugging without a PC.
 */
export class MobileConsole {
  private container: HTMLElement;
  private logList: HTMLElement;

  constructor() {
    this.createDOM();
    this.hookConsole();
    console.log("[MobileConsole] Debugger Active");
  }

  private createDOM() {
    this.container = document.createElement('div');
    Object.assign(this.container.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      maxHeight: '30vh',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: '#00ff00',
      fontFamily: 'monospace',
      fontSize: '10px',
      zIndex: '10000',
      overflowY: 'scroll',
      pointerEvents: 'none', // Click through
      whiteSpace: 'pre-wrap',
      padding: '5px'
    });

    this.logList = document.createElement('div');
    this.container.appendChild(this.logList);
    document.body.appendChild(this.container);
  }

  private hookConsole() {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      originalLog(...args);
      this.appendLog('LOG', args, '#ffffff');
    };

    console.warn = (...args) => {
      originalWarn(...args);
      this.appendLog('WARN', args, '#fbbf24');
    };

    console.error = (...args) => {
      originalError(...args);
      this.appendLog('ERROR', args, '#ef4444');
    };

    window.addEventListener('error', (e) => {
      this.appendLog('CRASH', [e.message, e.filename, e.lineno], '#ff00ff');
    });
  }

  private appendLog(type: string, args: any[], color: string) {
    const line = document.createElement('div');
    line.style.color = color;
    line.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
    
    const msg = args.map(a => {
      if (typeof a === 'object') return JSON.stringify(a);
      return String(a);
    }).join(' ');

    line.innerText = `[${type}] ${msg}`;
    this.logList.prepend(line); // Newest at top

    // Cap history
    if (this.logList.children.length > 50) {
      this.logList.lastChild?.remove();
    }
  }
}
