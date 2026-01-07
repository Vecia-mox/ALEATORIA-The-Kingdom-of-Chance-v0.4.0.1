
/**
 * TITAN ENGINE: VOICE CHAT
 * WebRTC Mesh Network + Web Audio API Panner for Spatial 3D Voice.
 */

import { AudioSystem } from './AudioSystem';
import { PhysicsWorld } from '../../engine/physics/PhysicsWorld';

export class VoiceChat {
  private audioCtx: AudioContext;
  private localStream: MediaStream | null = null;
  
  // Peer ID -> Connection Data
  private peers: Map<string, {
    connection: RTCPeerConnection;
    audioElem: HTMLAudioElement;
    sourceNode: MediaStreamAudioSourceNode;
    pannerNode: PannerNode;
    occlusionNode: BiquadFilterNode;
  }> = new Map();

  private physics: PhysicsWorld | null = null;

  constructor(audioSystem: AudioSystem, physics?: PhysicsWorld) {
    this.audioCtx = audioSystem.getContext();
    this.physics = physics || null;
  }

  public async enableMicrophone() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      console.log('[Voice] Microphone enabled.');
    } catch (e) {
      console.error('[Voice] Failed to access microphone:', e);
    }
  }

  /**
   * Called when a remote peer's stream is received via WebRTC.
   * Sets up the 3D Audio Graph: Source -> Filter (Occlusion) -> Panner (Spatial) -> Master.
   */
  public addPeer(peerId: string, stream: MediaStream) {
    if (this.peers.has(peerId)) return;

    // 1. Create HTML Audio Element (needed to decode stream)
    const audio = new Audio();
    audio.srcObject = stream;
    audio.play().catch(e => console.warn("Autoplay blocked", e));
    audio.volume = 1.0;
    audio.muted = true; // Mute DOM element, process via WebAudio

    // 2. Create Audio Nodes
    const source = this.audioCtx.createMediaStreamSource(stream);
    
    // Occlusion Filter (Lowpass)
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 22000; // Open by default

    // Spatial Panner
    const panner = this.audioCtx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'exponential';
    panner.refDistance = 2.0;
    panner.maxDistance = 50.0;
    panner.rolloffFactor = 1.5;

    // 3. Connect Graph
    source.connect(filter);
    filter.connect(panner);
    panner.connect(this.audioCtx.destination);

    this.peers.set(peerId, {
      connection: null as any, // Managed by signaling layer
      audioElem: audio,
      sourceNode: source,
      pannerNode: panner,
      occlusionNode: filter
    });
  }

  public removePeer(peerId: string) {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.sourceNode.disconnect();
      peer.pannerNode.disconnect();
      peer.occlusionNode.disconnect();
      peer.audioElem.srcObject = null;
      this.peers.delete(peerId);
    }
  }

  /**
   * Updates the 3D position of a peer speaking.
   * Should be called every frame with interpolated entity positions.
   */
  public updatePeerPosition(peerId: string, x: number, y: number, z: number) {
    const peer = this.peers.get(peerId);
    if (!peer) return;

    // Update Panner Position
    if (peer.pannerNode.positionX) {
      peer.pannerNode.positionX.value = x;
      peer.pannerNode.positionY.value = y;
      peer.pannerNode.positionZ.value = z;
    } else {
      // Legacy API
      peer.pannerNode.setPosition(x, y, z);
    }

    // Occlusion Logic
    this.calculateOcclusion(peer, x, y, z);
  }

  private calculateOcclusion(peer: any, tx: number, ty: number, tz: number) {
    if (!this.physics) return;

    const listener = this.audioCtx.listener;
    // Get listener pos (Assuming AudioSystem updates AudioListener)
    // This is tricky as AudioListener values are AudioParams, usually read-only.
    // We rely on the Engine's known camera position.
    
    // Mocking Camera Pos for logic
    const cx = 0, cy = 0, cz = 0; 

    // Raycast from Camera to Peer
    // const hit = this.physics.raycast([cx, cy, cz], dirToPeer, dist, WallLayer);
    
    const isOccluded = false; // hit.hit;

    // Smoothly transition filter
    const targetFreq = isOccluded ? 400 : 22000;
    const currentFreq = peer.occlusionNode.frequency.value;
    
    // Lerp approx
    peer.occlusionNode.frequency.value += (targetFreq - currentFreq) * 0.1;
  }
}
