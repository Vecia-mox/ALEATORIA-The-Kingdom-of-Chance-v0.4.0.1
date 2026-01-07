
/**
 * TITAN ENGINE: TRAFFIC MANAGER
 * Spline-based traffic simulation with intersections.
 */

export interface RoadSpline {
  id: string;
  points: {x: number, y: number, z: number}[];
  length: number;
  nextRoadIds: string[]; // Connections
}

export interface TrafficLight {
  id: string;
  position: {x: number, y: number, z: number};
  state: 'RED' | 'YELLOW' | 'GREEN';
  timer: number;
}

export interface CarAgent {
  id: string;
  currentRoadId: string;
  distanceOnSpline: number; // t (0 to length)
  speed: number;
}

export class TrafficManager {
  private roads: Map<string, RoadSpline> = new Map();
  private lights: Map<string, TrafficLight> = new Map();
  private cars: CarAgent[] = [];

  constructor() {
      // Initialize loop for lights
      setInterval(() => this.updateLights(), 5000);
  }

  public registerRoad(road: RoadSpline) {
      this.roads.set(road.id, road);
  }

  public registerLight(id: string, x: number, y: number, z: number) {
      this.lights.set(id, {
          id, position: {x,y,z}, state: 'RED', timer: 0
      });
  }

  public update(dt: number) {
      for(const car of this.cars) {
          const road = this.roads.get(car.currentRoadId);
          if (!road) continue;

          // 1. Raycast / Gap Check
          // Ideally check car ahead on same spline
          
          // 2. Intersection Check
          // If near end of spline, check connected light
          const distToEnd = road.length - car.distanceOnSpline;
          if (distToEnd < 10 && this.isLightRed(car.currentRoadId)) {
              // Brake
              car.speed = Math.max(0, car.speed - 10 * dt);
          } else {
              // Accelerate
              car.speed = Math.min(20, car.speed + 5 * dt);
          }

          // 3. Move
          car.distanceOnSpline += car.speed * dt;

          // 4. Switch Road
          if (car.distanceOnSpline >= road.length) {
              const nextIds = road.nextRoadIds;
              if (nextIds.length > 0) {
                  const nextId = nextIds[Math.floor(Math.random() * nextIds.length)];
                  car.currentRoadId = nextId;
                  car.distanceOnSpline = 0;
              } else {
                  // Despawn or U-turn
                  car.distanceOnSpline = road.length;
                  car.speed = 0;
              }
          }
      }
  }

  private isLightRed(roadId: string): boolean {
      // Naive: Map road ID to Light ID. 
      // For now, assume a light exists with same ID if it's an intersection approach
      const light = this.lights.get(roadId);
      if (light && light.state === 'RED') return true;
      return false;
  }

  private updateLights() {
      // Cycle lights
      this.lights.forEach(light => {
          light.state = light.state === 'RED' ? 'GREEN' : 'RED'; // Simple toggle
      });
  }
}
