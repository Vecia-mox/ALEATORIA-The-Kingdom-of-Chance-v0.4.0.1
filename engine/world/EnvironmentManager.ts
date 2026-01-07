
/**
 * TITAN ENGINE: ENVIRONMENT MANAGER
 * Controls Time of Day, Sun Position, Lighting, and Weather States.
 */

export type WeatherType = 'CLEAR' | 'RAIN' | 'STORM' | 'FOG';

export interface EnvironmentState {
  timeOfDay: number; // 0.0 to 24.0
  sunDirection: Float32Array; // x,y,z
  sunColor: Float32Array; // r,g,b
  ambientColor: Float32Array;
  fogDensity: number;
  rainIntensity: number; // 0.0 to 1.0
  wetness: number; // Affects material roughness
}

export class EnvironmentManager {
  private static DAY_DURATION = 300; // Seconds for a full day (5 mins)
  private time: number = 12.0; // Start at Noon
  private currentWeather: WeatherType = 'CLEAR';
  
  // Current interpolated state
  public state: EnvironmentState;

  constructor() {
    this.state = {
      timeOfDay: 12,
      sunDirection: new Float32Array([0, -1, 0]),
      sunColor: new Float32Array([1, 1, 1]),
      ambientColor: new Float32Array([0.2, 0.2, 0.2]),
      fogDensity: 0.0,
      rainIntensity: 0.0,
      wetness: 0.0
    };
  }

  public update(dt: number) {
    // 1. Advance Time
    const timeStep = (dt / EnvironmentManager.DAY_DURATION) * 24.0;
    this.time = (this.time + timeStep) % 24.0;
    this.state.timeOfDay = this.time;

    // 2. Calculate Sun Position
    this.updateSun();

    // 3. Update Weather Logic
    this.updateWeather(dt);
  }

  public setWeather(type: WeatherType) {
    this.currentWeather = type;
    console.log(`[Env] Weather changed to ${type}`);
  }

  private updateSun() {
    // Simple orbital mechanics
    // 6 AM = Sunrise (X+), 12 PM = Noon (Y+), 6 PM = Sunset (X-), 12 AM = Midnight (Y-)
    // Angle in radians. 0 = 6 AM.
    const angle = ((this.time - 6) / 24.0) * Math.PI * 2;
    
    // Sun moves in XY plane (East -> Up -> West -> Down)
    // Z component allows for seasonal tilt
    this.state.sunDirection[0] = Math.cos(angle);
    this.state.sunDirection[1] = Math.sin(angle);
    this.state.sunDirection[2] = 0.2; // Slight tilt

    // Calculate Sun Color based on height (Y)
    const height = this.state.sunDirection[1];
    
    if (height > 0.1) {
      // Day
      this.setColor(this.state.sunColor, 1.0, 0.95, 0.8); // Warm White
      this.setColor(this.state.ambientColor, 0.2, 0.2, 0.25);
    } else if (height > -0.1) {
      // Sunset / Sunrise (Orange/Red)
      this.setColor(this.state.sunColor, 1.0, 0.4, 0.1); 
      this.setColor(this.state.ambientColor, 0.1, 0.1, 0.2);
    } else {
      // Night (Moonlight - Blueish)
      this.state.sunDirection[0] *= -1; // Moon is opposite sun
      this.state.sunDirection[1] *= -1;
      this.setColor(this.state.sunColor, 0.1, 0.2, 0.4); 
      this.setColor(this.state.ambientColor, 0.05, 0.05, 0.1);
    }
  }

  private updateWeather(dt: number) {
    const targetRain = (this.currentWeather === 'RAIN' || this.currentWeather === 'STORM') ? 1.0 : 0.0;
    const targetFog = (this.currentWeather === 'FOG' || this.currentWeather === 'STORM') ? 0.05 : 0.0;
    
    // Lerp values
    this.state.rainIntensity = this.lerp(this.state.rainIntensity, targetRain, dt * 0.5);
    this.state.fogDensity = this.lerp(this.state.fogDensity, targetFog, dt * 0.2);
    
    // Wetness accumulates when raining, dries slowly when clear
    if (this.state.rainIntensity > 0.1) {
      this.state.wetness = Math.min(1.0, this.state.wetness + dt * 0.1);
    } else {
      this.state.wetness = Math.max(0.0, this.state.wetness - dt * 0.05);
    }
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private setColor(target: Float32Array, r: number, g: number, b: number) {
    target[0] = r;
    target[1] = g;
    target[2] = b;
  }
}
