
/**
 * TITAN ENGINE: WORLD SCHEDULE
 * Triggers global events based on Real-World Time (UTC).
 */

import { ServerSimulator } from '../services/ServerSimulator';

export enum EventState {
  INACTIVE,
  WARMUP,   // 5-minute warning
  ACTIVE,   // Gameplay happening
  COOLDOWN  // Loot phase / despawn
}

export interface WorldEventConfig {
  id: string;
  name: string;
  zoneId: string;
  schedule: { hour: number, minute: number }[]; // UTC times
  duration: number; // Minutes
  onStart: () => void;
  onEnd: () => void;
}

export class WorldSchedule {
  private static instance: WorldSchedule;
  private server: ServerSimulator;
  
  private events: Map<string, WorldEventConfig> = new Map();
  private activeEventId: string | null = null;
  private currentState: EventState = EventState.INACTIVE;
  
  // Timer for state transitions
  private stateTimer: number = 0; 

  private constructor() {
    this.registerDefaults();
    // Check schedule every 10 seconds
    setInterval(() => this.checkSchedule(), 10000);
  }

  public static getInstance(): WorldSchedule {
    if (!WorldSchedule.instance) WorldSchedule.instance = new WorldSchedule();
    return WorldSchedule.instance;
  }

  public initialize(server: ServerSimulator) {
    this.server = server;
  }

  private registerDefaults() {
    this.events.set('HAUNTED_CARRIAGE', {
      id: 'HAUNTED_CARRIAGE',
      name: 'Haunted Carriage',
      zoneId: 'ASHWOLD_CEMETERY',
      schedule: [{ hour: 12, minute: 0 }, { hour: 20, minute: 0 }],
      duration: 15,
      onStart: () => console.log("[Event] The Carriage has spawned! Escort it to the crypts."),
      onEnd: () => console.log("[Event] The Carriage has reached its destination.")
    });

    this.events.set('ANCIENT_ARENA', {
      id: 'ANCIENT_ARENA',
      name: 'Ancient Arena',
      zoneId: 'BILEFEN',
      schedule: [{ hour: 21, minute: 30 }],
      duration: 20,
      onStart: () => console.log("[Event] The Arena is open! PvP Enabled."),
      onEnd: () => console.log("[Event] The Arena Champion has been crowned.")
    });
  }

  private checkSchedule() {
    if (this.currentState !== EventState.INACTIVE) return;

    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();

    for (const event of this.events.values()) {
      for (const time of event.schedule) {
        // Check for Warmup (5 mins before)
        const warmupMin = time.minute - 5; 
        
        // Exact match logic simplified for readability
        // In prod, handle hour wrap-around (e.g. 00:00 minus 5 min)
        if (currentHour === time.hour && currentMinute === warmupMin) {
          this.triggerWarmup(event);
          return;
        }
      }
    }
  }

  private triggerWarmup(event: WorldEventConfig) {
    this.activeEventId = event.id;
    this.currentState = EventState.WARMUP;
    this.stateTimer = 5 * 60 * 1000; // 5 mins
    
    // Broadcast Zone Alert
    console.log(`[World] ${event.name} starts in 5 minutes!`);
    // this.server.broadcast({ type: 'ZONE_ALERT', message: `${event.name} starts in 5 minutes!` });
  }

  public update(dt: number) {
    if (this.currentState === EventState.INACTIVE) return;

    this.stateTimer -= dt * 1000;

    if (this.stateTimer <= 0) {
      this.advanceState();
    }
  }

  private advanceState() {
    const event = this.events.get(this.activeEventId!);
    if (!event) return;

    switch (this.currentState) {
      case EventState.WARMUP:
        this.currentState = EventState.ACTIVE;
        this.stateTimer = event.duration * 60 * 1000;
        event.onStart();
        // this.server.broadcast({ type: 'EVENT_START', eventId: event.id });
        break;

      case EventState.ACTIVE:
        this.currentState = EventState.COOLDOWN;
        this.stateTimer = 60 * 1000; // 1 min loot time
        event.onEnd();
        break;

      case EventState.COOLDOWN:
        this.currentState = EventState.INACTIVE;
        this.activeEventId = null;
        console.log("[World] Event cycle complete.");
        break;
    }
  }
}
