
/**
 * TITAN ENGINE: RIFT HUD
 * Client-side UI manager for the Rift Game Mode.
 * Handles Progress Bars, Timers, and Kill Streak Popups.
 */

export class RiftHUD {
  private container: HTMLElement;
  private progressBar: HTMLElement;
  private timerText: HTMLElement;
  private streakText: HTMLElement;
  
  // Streak Logic
  private killsInWindow: number = 0;
  private streakTimer: any = null;
  private readonly STREAK_WINDOW = 3000; // 3s to chain kills

  constructor() {
    this.createDOM();
  }

  private createDOM() {
    this.container = document.createElement('div');
    this.container.id = 'rift-hud';
    this.container.style.cssText = `
      position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
      width: 400px; text-align: center; pointer-events: none; z-index: 5000;
      display: none;
    `;

    // 1. Progress Bar Container
    const barWrap = document.createElement('div');
    barWrap.style.cssText = `
      width: 100%; height: 24px; background: #1a0b2e; 
      border: 2px solid #fbbf24; border-radius: 4px; overflow: hidden;
      position: relative; box-shadow: 0 0 15px #a855f7;
    `;

    // 2. Fill
    this.progressBar = document.createElement('div');
    this.progressBar.style.cssText = `
      width: 0%; height: 100%; background: linear-gradient(90deg, #6b21a8, #a855f7);
      transition: width 0.3s ease-out;
    `;
    
    // 3. Timer
    this.timerText = document.createElement('div');
    this.timerText.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Cinzel', serif; font-weight: bold; color: white;
      text-shadow: 0 2px 2px black; font-size: 14px;
    `;

    // 4. Streak Popup
    this.streakText = document.createElement('div');
    this.streakText.style.cssText = `
      margin-top: 60px; font-family: 'Cinzel', serif; font-size: 32px;
      color: #fbbf24; text-shadow: 0 0 10px #ef4444; font-weight: 900;
      opacity: 0; transition: opacity 0.5s; transform: scale(1);
    `;

    barWrap.appendChild(this.progressBar);
    barWrap.appendChild(this.timerText);
    this.container.appendChild(barWrap);
    this.container.appendChild(this.streakText);
    document.body.appendChild(this.container);
  }

  public setVisible(visible: boolean) {
    this.container.style.display = visible ? 'block' : 'none';
  }

  public update(progress: number, timeRemainingMs: number) {
    // Update Bar
    this.progressBar.style.width = `${Math.min(100, progress)}%`;
    
    // Update Time
    const mins = Math.floor(timeRemainingMs / 60000);
    const secs = Math.floor((timeRemainingMs % 60000) / 1000);
    const ms = Math.floor((timeRemainingMs % 1000) / 10);
    this.timerText.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    if (mins === 0 && secs < 30) {
      this.timerText.style.color = '#ef4444'; // Red panic
    }
  }

  public registerKill() {
    this.killsInWindow++;
    
    // Reset window
    if (this.streakTimer) clearTimeout(this.streakTimer);
    this.streakTimer = setTimeout(() => this.endStreak(), this.STREAK_WINDOW);

    // Show Notification
    if (this.killsInWindow >= 5) {
      this.showStreakPopup(this.killsInWindow);
    }
  }

  private showStreakPopup(count: number) {
    let title = "KILL STREAK";
    let color = "#fbbf24";

    if (count >= 10) { title = "MASSACRE"; color = "#ef4444"; }
    if (count >= 20) { title = "MAYHEM"; color = "#a855f7"; }
    if (count >= 50) { title = "ANNIHILATION"; color = "#ffffff"; }

    this.streakText.innerHTML = `${title}<br><span style="font-size:48px">${count} Kills</span>`;
    this.streakText.style.color = color;
    this.streakText.style.opacity = "1";
    this.streakText.style.transform = "scale(1.2)";
    
    // Pop effect
    setTimeout(() => this.streakText.style.transform = "scale(1.0)", 100);
  }

  private endStreak() {
    this.streakText.style.opacity = "0";
    this.killsInWindow = 0;
  }

  public showBossWarning() {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed; inset: 0; background: white; opacity: 0.5; pointer-events: none; z-index: 6000;
        transition: opacity 1s;
    `;
    document.body.appendChild(flash);
    
    setTimeout(() => flash.style.opacity = "0", 50);
    setTimeout(() => flash.remove(), 1000);

    const warning = document.createElement('div');
    warning.innerText = "RIFT GUARDIAN APPROACHES";
    warning.style.cssText = `
        position: fixed; top: 30%; left: 50%; transform: translate(-50%, -50%);
        font-family: 'Cinzel', serif; font-size: 48px; color: #a855f7;
        text-shadow: 0 0 20px black; font-weight: 900; z-index: 6000;
        animation: pulse 0.5s infinite alternate;
    `;
    document.body.appendChild(warning);
    setTimeout(() => warning.remove(), 3000);
  }
}
