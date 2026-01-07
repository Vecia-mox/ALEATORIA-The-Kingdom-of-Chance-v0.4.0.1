
/**
 * TITAN ENGINE: DUNGEON GENERATOR
 * Procedural room generation using socket matching.
 */

export interface Socket {
  position: [number, number, number]; // Relative to Room center
  direction: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
  type: 'DOOR' | 'OPEN';
}

export interface RoomTemplate {
  id: string;
  size: [number, number, number]; // AABB Size
  sockets: Socket[];
  prefabId: string;
}

export interface PlacedRoom {
  template: RoomTemplate;
  position: [number, number, number];
  rotation: number; // 0, 90, 180, 270
}

export class DungeonGenerator {
  private templates: RoomTemplate[] = [];
  private generatedRooms: PlacedRoom[] = [];
  private maxRooms: number = 20;

  constructor() {}

  public registerTemplate(template: RoomTemplate) {
    this.templates.push(template);
  }

  public generate(): PlacedRoom[] {
    this.generatedRooms = [];
    
    // 1. Place Start Room (0,0,0)
    const startRoom = this.findTemplate('Start');
    if (!startRoom) throw new Error("No Start Room template!");
    
    this.generatedRooms.push({
      template: startRoom,
      position: [0, 0, 0],
      rotation: 0
    });

    const openSockets: { roomIndex: number, socketIndex: number }[] = [];
    this.addSocketsToList(startRoom, 0, openSockets);

    // 2. Iteration Loop
    let attempts = 0;
    while (this.generatedRooms.length < this.maxRooms && openSockets.length > 0 && attempts < 1000) {
      attempts++;
      
      // Pick random socket
      const socketIdx = Math.floor(Math.random() * openSockets.length);
      const connector = openSockets[socketIdx];
      const parentRoom = this.generatedRooms[connector.roomIndex];
      const parentSocket = parentRoom.template.sockets[connector.socketIndex];

      // Calculate world position/direction of parent socket
      const socketWorldPos = this.getSocketWorldPos(parentRoom, parentSocket);
      const neededDirection = this.getOppositeDirection(parentSocket.direction); // Logic needs rotation support

      // Find compatible room
      const match = this.findMatchingRoom(socketWorldPos, neededDirection);
      
      if (match) {
        this.generatedRooms.push(match);
        openSockets.splice(socketIdx, 1); // Remove used socket
        this.addSocketsToList(match.template, this.generatedRooms.length - 1, openSockets);
      }
    }

    return this.generatedRooms;
  }

  private findMatchingRoom(targetPos: [number, number, number], neededDir: string): PlacedRoom | null {
    // Shuffle templates for variety
    const shuffled = [...this.templates].sort(() => Math.random() - 0.5);

    for (const temp of shuffled) {
      // Find a socket on this template that matches neededDir (inverse)
      // For simplicity, assuming 0 rotation alignment for MVP
      const validSocket = temp.sockets.find(s => s.direction === neededDir);
      
      if (validSocket) {
        // Calculate room position if we align validSocket to targetPos
        const roomPos: [number, number, number] = [
          targetPos[0] - validSocket.position[0],
          targetPos[1] - validSocket.position[1],
          targetPos[2] - validSocket.position[2]
        ];

        // Check Collision against existing rooms
        if (!this.checkCollision(temp, roomPos)) {
          return { template: temp, position: roomPos, rotation: 0 };
        }
      }
    }
    return null;
  }

  private checkCollision(temp: RoomTemplate, pos: [number, number, number]): boolean {
    const margin = 0.5;
    const minA = [pos[0] + margin, pos[2] + margin];
    const maxA = [pos[0] + temp.size[0] - margin, pos[2] + temp.size[2] - margin];

    for (const room of this.generatedRooms) {
      const minB = [room.position[0], room.position[2]];
      const maxB = [room.position[0] + room.template.size[0], room.position[2] + room.template.size[2]];

      // AABB overlap check
      if (maxA[0] > minB[0] && minA[0] < maxB[0] && maxA[1] > minB[1] && minA[1] < maxB[1]) {
        return true;
      }
    }
    return false;
  }

  private getSocketWorldPos(room: PlacedRoom, socket: Socket): [number, number, number] {
    // Rotation logic would apply here
    return [
      room.position[0] + socket.position[0],
      room.position[1] + socket.position[1],
      room.position[2] + socket.position[2]
    ];
  }

  private getOppositeDirection(dir: string): string {
    if (dir === 'NORTH') return 'SOUTH';
    if (dir === 'SOUTH') return 'NORTH';
    if (dir === 'EAST') return 'WEST';
    return 'EAST';
  }

  private addSocketsToList(temp: RoomTemplate, roomIndex: number, list: any[]) {
    temp.sockets.forEach((s, i) => list.push({ roomIndex, socketIndex: i }));
  }

  private findTemplate(id: string) {
    return this.templates.find(t => t.id === id);
  }
}
