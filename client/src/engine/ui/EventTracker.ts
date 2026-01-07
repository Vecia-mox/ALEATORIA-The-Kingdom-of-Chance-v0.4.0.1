
/**
 * TITAN ENGINE: EVENT TRACKER UI
 * Displays active quest objectives, timers, and progress bars.
 */

export interface EventStatus {
  id: string;
  name: string;
  description: string;
  progress: number; // 0-100
  timeRemaining: number; // Seconds
  isActive: boolean;
}

export class EventTracker {
  private container: HTMLElement;
  private titleEl: HTMLElement;
  private descEl: HTMLElement;
  private progressFill: HTMLElement;
  private timerEl: HTMLElement;

  constructor() {
    this.createDOM();
  }

  private createDOM() {
    this.container = document.createElement('div');
    this.container.id = 'event-tracker';
    this.container.style.cssText = `
      position: absolute; top: 80px; left: 20px; width: 280px;
      background: linear-gradient(90deg, rgba(0,0,0,0.8), rgba(0,0,0,0));
      border-left: 4px solid #fbbf24; padding: 10px;
      font-family: 'Cinzel', serif; color: white; display: none; pointer-events: none;
    `;

    this.titleEl = document.createElement('div');
    this.titleEl.style.cssText = "font-weight: 900; color: #fbbf24; font-size: 16px; margin-bottom: 4px; text-shadow: 0 2px 4px black;";
    
    this.descEl = document.createElement('div');
    this.descEl.style.cssText = "font-size: 11px; color: #e5e5e5; margin-bottom: 8px; font-family: sans-serif;";

    const barBg = document.createElement('div');
    barBg.style.cssText = "width: 100%; height: 6px; background: #333; margin-bottom: 4px; border-radius: 2px;";
    
    this.progressFill = document.createElement('div');
    this.progressFill.style.cssText = "width: 0%; height: 100%; background: #fbbf24; transition: width 0.3s; border-radius: 2px;";
    barBg.appendChild(this.progressFill);

    this.timerEl = document.createElement('div');
    this.timerEl.style.cssText = "font-size: 12px; font-weight: bold; color: #ef4444; text-align: right;";

    this.container.appendChild(this.titleEl);
    this.container.appendChild(this.descEl);
    this.container.appendChild(barBg);
    this.container.appendChild(this.timerEl);
    document.body.appendChild(this.container);
  }

  public update(status: EventStatus) {
    if (!status.isActive) {
      this.container.style.display = 'none';
      return;
    }

    this.container.style.display = 'block';
    this.titleEl.innerText = status.name;
    this.descEl.innerText = status.description;
    this.progressFill.style.width = `${Math.min(100, Math.max(0, status.progress))}%`;
    
    const mins = Math.floor(status.timeRemaining / 60);
    const secs = Math.floor(status.timeRemaining % 60);
    this.timerEl.innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
