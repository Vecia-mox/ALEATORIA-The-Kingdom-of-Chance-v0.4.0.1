
/**
 * TITAN ENGINE: ERROR TRAP
 * Catches silent failures and forces them to appear as alerts.
 * Essential for debugging "Black Screens" on mobile where console is hidden.
 */
export class ErrorTrap {
  static init() {
    window.onerror = (message, source, lineno, colno, error) => {
      const msg = `CRASH: ${message}\nLine: ${lineno}\nSource: ${source}`;
      console.error(msg);
      
      // Create visible error overlay
      const div = document.createElement('div');
      div.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(100, 0, 0, 0.9); color: white; z-index: 20000;
        padding: 20px; font-family: monospace; white-space: pre-wrap; overflow: auto;
      `;
      div.innerText = msg + "\n\n" + (error?.stack || "");
      document.body.appendChild(div);
      
      return false;
    };

    // Trap Unhandled Promise Rejections (Async/Await errors)
    window.addEventListener('unhandledrejection', (event) => {
      console.error("Unhandled Rejection:", event.reason);
      const div = document.createElement('div');
      div.style.cssText = `
        position: fixed; bottom: 0; left: 0; width: 100%; max-height: 50%;
        background: rgba(255, 100, 0, 0.9); color: black; z-index: 20000;
        padding: 10px; font-family: monospace; border-top: 4px solid white;
      `;
      div.innerText = `ASYNC ERROR: ${event.reason}`;
      document.body.appendChild(div);
    });
    
    console.log("[ErrorTrap] Active.");
  }
}
