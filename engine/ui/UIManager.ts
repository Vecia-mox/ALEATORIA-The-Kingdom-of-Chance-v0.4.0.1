
/**
 * TITAN ENGINE: UI MANAGER
 * Hybrid UI system for overlaying DOM elements on the 3D Canvas.
 */

export type UILayer = 'WORLD' | 'HUD' | 'MENU' | 'OVERLAY';

export abstract class UIWidget {
  public id: string;
  public element: HTMLElement;
  protected visible: boolean = true;

  constructor(id: string, template: string) {
    this.id = id;
    this.element = document.createElement('div');
    this.element.id = `ui-${id}`;
    this.element.innerHTML = template;
    this.element.style.position = 'absolute';
    this.element.style.pointerEvents = 'none'; // Pass through clicks by default
  }

  show() {
    this.visible = true;
    this.element.style.display = 'block';
  }

  hide() {
    this.visible = false;
    this.element.style.display = 'none';
  }

  abstract update(dt: number): void;
}

export class UIManager {
  private static instance: UIManager;
  private root: HTMLElement;
  private layers: Record<UILayer, HTMLElement>;
  private widgets: UIWidget[] = [];

  private constructor() {
    this.root = document.createElement('div');
    this.root.id = 'titan-ui-root';
    Object.assign(this.root.style, {
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      pointerEvents: 'none', overflow: 'hidden'
    });
    document.body.appendChild(this.root);

    this.layers = {
      WORLD: this.createLayer(10),
      HUD: this.createLayer(20),
      MENU: this.createLayer(30),
      OVERLAY: this.createLayer(40)
    };
  }

  public static getInstance(): UIManager {
    if (!UIManager.instance) UIManager.instance = new UIManager();
    return UIManager.instance;
  }

  private createLayer(zIndex: number): HTMLElement {
    const layer = document.createElement('div');
    layer.style.position = 'absolute';
    layer.style.width = '100%';
    layer.style.height = '100%';
    layer.style.zIndex = zIndex.toString();
    this.root.appendChild(layer);
    return layer;
  }

  public addWidget(widget: UIWidget, layer: UILayer = 'HUD') {
    this.widgets.push(widget);
    this.layers[layer].appendChild(widget.element);
  }

  public removeWidget(widget: UIWidget) {
    if (widget.element.parentElement) {
      widget.element.parentElement.removeChild(widget.element);
    }
    this.widgets = this.widgets.filter(w => w !== widget);
  }

  /**
   * Main update loop.
   * worldToScreenFn: Callback to project 3D coordinates to 2D screen space.
   */
  public update(dt: number, worldToScreenFn?: (pos: Float32Array) => {x:number, y:number}) {
    for (const widget of this.widgets) {
      // Pass projection function to World Space widgets
      if (worldToScreenFn && (widget as any).setScreenPosition) {
        // This is where we'd sync World Space UI logic
      }
      widget.update(dt);
    }
  }
}

// --- EXAMPLE COMPONENT: HEALTH BAR ---
export class HealthBarWidget extends UIWidget {
  private fill: HTMLElement;
  private pct: number = 1.0;

  constructor(id: string) {
    super(id, `
      <div style="width:50px; height:6px; background:#333; border:1px solid #000;">
        <div class="fill" style="width:100%; height:100%; background:#f00;"></div>
      </div>
    `);
    this.fill = this.element.querySelector('.fill') as HTMLElement;
  }

  setHealth(current: number, max: number) {
    this.pct = Math.max(0, Math.min(1, current / max));
  }

  update(dt: number): void {
    this.fill.style.width = `${this.pct * 100}%`;
  }
}
