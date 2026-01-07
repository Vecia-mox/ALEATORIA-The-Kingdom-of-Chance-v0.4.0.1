
/**
 * TITAN ENGINE: WORLD SERVER (Gateway & Orchestration)
 * Manages clusters, load balancing, and zone transitions.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { AuthService } from '../auth/AuthService';
import { SpatialGrid } from './SpatialGrid';

interface PlayerSession {
  socket: WebSocket;
  userId: string;
  characterId: string;
  zoneId: string;
  position: { x: number, y: number };
}

interface ZoneConfig {
  id: string;
  host: string;
  port: number;
  bounds: { xMin: number, xMax: number, yMin: number, yMax: number };
}

export class WorldServer {
  private wss: WebSocketServer;
  private players: Map<string, PlayerSession> = new Map();
  private grid: SpatialGrid;
  
  // Zone Configuration (Static for MVP, Dynamic in Prod via Redis/Consul)
  private zones: ZoneConfig[] = [
    { id: 'zone_town', host: '127.0.0.1', port: 8081, bounds: { xMin: 0, xMax: 1000, yMin: 0, yMax: 1000 } },
    { id: 'zone_wilds', host: '127.0.0.1', port: 8082, bounds: { xMin: 1000, xMax: 5000, yMin: 0, yMax: 5000 } }
  ];

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.grid = new SpatialGrid();
    
    this.wss.on('connection', (ws) => this.handleConnection(ws));
    console.log(`[WorldServer] Gateway listening on port ${port}`);
  }

  private handleConnection(ws: WebSocket) {
    let session: PlayerSession | null = null;

    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data.toString());

        // 1. HANDSHAKE / AUTH
        if (msg.type === 'AUTH') {
          const user = AuthService.verifyToken(msg.token);
          if (!user) {
            ws.send(JSON.stringify({ type: 'ERROR', code: 401, message: 'Invalid Token' }));
            ws.close();
            return;
          }
          
          session = {
            socket: ws,
            userId: user.id,
            characterId: msg.charId,
            zoneId: 'zone_town', // Default spawn
            position: { x: 500, y: 500 }
          };
          
          this.players.set(user.id, session);
          this.grid.addEntity(user.id, session.position.x, session.position.y);
          
          ws.send(JSON.stringify({ type: 'AUTH_OK', zone: session.zoneId }));
          console.log(`[WorldServer] Player ${user.id} connected.`);
        }

        // 2. MOVEMENT & HANDOVER
        if (msg.type === 'MOVE' && session) {
          const { x, y } = msg.payload;
          session.position = { x, y };
          
          // Spatial Update
          this.grid.updateEntity(session.userId, x, y);
          
          // Check Zone Boundary
          const newZone = this.checkZoneBoundary(x, y);
          if (newZone && newZone.id !== session.zoneId) {
            this.initiateHandover(session, newZone);
          } else {
            // Broadcast to neighbors (AOI)
            const neighbors = this.grid.getNearbyEntities(x, y);
            const updatePacket = JSON.stringify({ type: 'PLAYER_UPDATE', id: session.userId, pos: {x, y} });
            
            neighbors.forEach(neighborId => {
              const neighbor = this.players.get(neighborId);
              if (neighbor && neighbor.socket.readyState === WebSocket.OPEN) {
                neighbor.socket.send(updatePacket);
              }
            });
          }
        }

      } catch (e) {
        console.error('Packet Error:', e);
      }
    });

    ws.on('close', () => {
      if (session) {
        this.players.delete(session.userId);
        this.grid.removeEntity(session.userId);
        console.log(`[WorldServer] Player ${session.userId} disconnected.`);
      }
    });
  }

  private checkZoneBoundary(x: number, y: number): ZoneConfig | null {
    return this.zones.find(z => 
      x >= z.bounds.xMin && x < z.bounds.xMax &&
      y >= z.bounds.yMin && y < z.bounds.yMax
    ) || null;
  }

  private initiateHandover(session: PlayerSession, targetZone: ZoneConfig) {
    console.log(`[Handover] Transferring ${session.userId} to ${targetZone.id}`);
    
    // 1. Tell Client to reconnect to new server
    session.socket.send(JSON.stringify({
      type: 'HANDOVER',
      targetHost: targetZone.host,
      targetPort: targetZone.port,
      ticket: AuthService.generateOneTimeTicket(session.userId) // Secure transfer
    }));

    // 2. Save State to DB immediately (handled by DBManager in real flow)
    // DBManager.savePlayer(session.userId, session);

    // 3. Graceful Close
    // session.socket.close(); // Client initiates close after receiving handover
  }
}
