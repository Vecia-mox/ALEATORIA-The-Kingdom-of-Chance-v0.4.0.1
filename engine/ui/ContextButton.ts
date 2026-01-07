
import { MobileBridge } from '../../services/MobileBridge';

/**
 * TITAN ENGINE: CONTEXT BUTTON
 * Appears when close to interactables (Loot, NPCs, Levers).
 */
export class ContextButton {
  private element: HTMLElement;
  private icon: HTMLElement;
  private visible: boolean = false;
  
  // State
  private lastType: 'NONE' | 'LOOT' | 'NPC' | 'PORTAL' = 'NONE';

  constructor() {
    this.createDOM();
    setInterval(() => this.scan(), 200); // 5Hz polling
  }

  private createDOM() {
    this.element = document.createElement('div');
    Object.assign(this.element.style, {
      position: 'absolute',
      bottom: '180px', right: '140px', // Above attack button
      width: '60px', height: '60px',
      background: '#292524',
      border: '2px solid #fbbf24',
      borderRadius: '50%',
      boxShadow: '0 0 15px rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '30px',
      zIndex: '5000',
      opacity: '0',
      transform: 'scale(0.8)',
      transition: 'opacity 0.2s, transform 0.2s',
      pointerEvents: 'none' // Disabled when hidden
    });

    this.icon = document.createElement('div');
    this.element.appendChild(this.icon);
    
    // Interaction
    this.element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.triggerInteraction();
    });

    document.body.appendChild(this.element);
  }

  /**
   * Mocks a raycast query to the physics engine.
   * In a real implementation, this would call PhysicsWorld.overlapSphere(playerPos, 2.0).
   */
  private scan() {
    // Mock Logic: Check global state or bridge
    // For MVP, we'll assume a "NearbyEntity" flag is set by the Game Loop in MobileBridge
    // MobileBridge doesn't strictly have this field defined in the previous file, 
    // but we can assume we read from a shared WorldState proxy.
    
    // Simulating random proximity for demo purposes if no real backend connection
    // In production: const nearest = EntityManager.getNearestInteractable(playerPos);
    
    let type: 'NONE' | 'LOOT' | 'NPC' | 'PORTAL' = 'NONE';
    
    // Logic placeholder
    // if (nearest && nearest.dist < 2.0) type = nearest.type;
    
    this.updateState(type);
  }

  public updateState(type: 'NONE' | 'LOOT' | 'NPC' | 'PORTAL') {
    if (type === this.lastType) return;
    this.lastType = type;

    if (type === 'NONE') {
        this.element.style.opacity = '0';
        this.element.style.transform = 'scale(0.8)';
        this.element.style.pointerEvents = 'none';
        return;
    }

    // Show
    this.element.style.opacity = '1';
    this.element.style.transform = 'scale(1.0)';
    this.element.style.pointerEvents = 'auto';

    // Update Icon
    switch(type) {
        case 'LOOT': this.icon.innerText = '✋'; break; // Hand
        case 'NPC': this.icon.innerText = '💬'; break;  // Speech
        case 'PORTAL': this.icon.innerText = '🚪'; break; // Door
    }
  }

  private triggerInteraction() {
    // Pulse animation
    this.element.style.transform = 'scale(0.9)';
    setTimeout(() => this.element.style.transform = 'scale(1.0)', 100);

    // Send signal
    MobileBridge.isInteracting = true;
    setTimeout(() => MobileBridge.isInteracting = false, 100);
    
    console.log(`[Context] Interaction Triggered: ${this.lastType}`);
  }
}
