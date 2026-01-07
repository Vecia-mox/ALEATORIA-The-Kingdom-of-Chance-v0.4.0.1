
import * as THREE from 'three';
import { DungeonDirector } from '../generation/DungeonDirector'; 
import { SimpleAI } from '../ai/SimpleAI'; 
import { BossAI } from '../ai/BossAI';
import { MobileBridge } from '../../services/MobileBridge';
import { CombatSystem } from '../combat/CombatSystem'; 
import { HUDController } from '../../ui/controllers/HUDController';
import { MinimapController } from '../../ui/controllers/MinimapController'; 
import { BossHUD } from '../../ui/controllers/BossHUD';
import { GameDirector } from './GameDirector'; 
import { PlayerStats } from './PlayerStats';
import { DeathScreen } from '../../ui/windows/DeathScreen';
import { TimeManager } from './TimeManager';
import { FloatingTextManager } from '../../ui/vfx/FloatingTextManager';
import { ShadowSystem } from '../graphics/ShadowSystem';
import { QuestArrow } from '../vfx/QuestArrow';
import { PlayerEntity } from '../entities/PlayerEntity'; 
import { AnimationSystem } from '../graphics/AnimationSystem'; 
import { LightingSystem } from '../graphics/LightingSystem';
import { SkillSystem } from '../combat/SkillSystem';
import { ProjectileSystem } from '../combat/ProjectileSystem';
import { BuffManager } from '../combat/BuffManager'; 
import { GravitySystem } from '../physics/GravitySystem';
import { VoidNet } from '../physics/VoidNet';
import { PanicButton } from '../debug/PanicButton';
import { InventoryManager } from '../items/InventoryManager';
import { InventoryWindow } from '../../ui/windows/InventoryWindow';
import { EconomyManager } from '../economy/EconomyManager';
import { ShopWindow } from '../../ui/windows/ShopWindow';
import { SaveData } from './SaveManager';
import { DungeonArchitect } from '../generation/DungeonArchitect';
import { EnemyHealthBar } from '../../ui/vfx/EnemyHealthBar';
import { LootSystem } from '../items/LootSystem'; 
import { QuestManager } from '../systems/QuestManager';
import { PostProcessing } from '../graphics/PostProcessing';
import { CameraSystem } from './CameraSystem';
import { MapSystem } from '../systems/MapSystem';
import { InteractionSystem } from '../systems/InteractionSystem'; 
import { MerchantEntity } from '../entities/MerchantEntity'; 

export class GameLoop {
    private container: HTMLElement;
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private clock: THREE.Clock;
    
    private player: PlayerEntity; 
    private enemies: THREE.Group[] = [];
    private boss: THREE.Group | null = null;
    
    private debugLine: THREE.Line;
    
    private isRunning: boolean = false;
    private animationId: number;
    private isAttackCooldown: boolean = false;
    private frameCount: number = 0; // For throttling UI

    private skillSystem: SkillSystem;
    private projectileSystem: ProjectileSystem;
    private lootSystem: LootSystem; 
    private questArrow: QuestArrow;
    private inventoryManager: InventoryManager;
    private economyManager: EconomyManager;
    private inventoryWindow: InventoryWindow;
    private shopWindow: ShopWindow;
    private cameraSystem: CameraSystem;
    
    public initialSaveData: SaveData | null = null;

    constructor(container: HTMLElement) {
        this.container = container;
        this.clock = new THREE.Clock();
    }

    public start() {
        if (this.isRunning) return;
        this.isRunning = true;

        // 1. Setup Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
        this.renderer.setClearColor(0x050510);
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.toneMappingExposure = 2.0;

        this.container.appendChild(this.renderer.domElement);

        // 2. Setup Scene
        this.scene = new THREE.Scene();
        LightingSystem.init(this.scene);
        this.scene.fog = new THREE.FogExp2(0x050510, 0.02);
        this.scene.background = new THREE.Color(0x050510);

        // 3. Setup Camera
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
        
        // 4. Init Post Processing
        PostProcessing.init(this.renderer, this.scene, this.camera);

        // 5. Init UI & Managers
        FloatingTextManager.init(this.camera); 
        EnemyHealthBar.init(); 
        MapSystem.init(); 
        
        this.inventoryManager = new InventoryManager();
        this.economyManager = new EconomyManager(100);
        this.lootSystem = new LootSystem(this.scene); 
        this.lootSystem.init(this.inventoryManager, this.economyManager);

        this.inventoryWindow = new InventoryWindow(this.inventoryManager);
        this.shopWindow = new ShopWindow(this.economyManager, this.inventoryManager);
        
        InteractionSystem.init(this.shopWindow); 

        BossHUD.init(); 
        DeathScreen.init(); 

        // 6. Spawn Player
        this.spawnPlayer();
        PlayerStats.init(this.player.bodyMesh, this.camera);
        
        // Initialize Camera System
        this.cameraSystem = new CameraSystem(this.camera, this.player.mesh);

        // 7. Init Director
        GameDirector.init(this.lootSystem, this.player, this.inventoryManager, this.economyManager); 
        GameDirector.setResetCallback(() => {
            MapSystem.init(); 
            this.loadLevel();
            BossAI.reset(); 
        });

        // 8. Generate Level
        this.loadLevel();

        // 9. Init Systems
        this.projectileSystem = new ProjectileSystem(this.scene, this.camera);
        this.projectileSystem.setLootSystem(this.lootSystem); 
        this.skillSystem = new SkillSystem(this.scene, this.projectileSystem);

        // 10. Debug Line
        const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0)]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xff0000 });
        this.debugLine = new THREE.Line(lineGeo, lineMat);
        this.scene.add(this.debugLine);

        // Initial HUD
        HUDController.init();
        HUDController.addInventoryButton(() => this.inventoryWindow.toggle());
        PanicButton.init(this.scene, this.camera, this.player.mesh);

        // REGISTER GLOBAL REFS
        CombatSystem.player = this.player;

        this.loop();
        window.addEventListener('resize', this.onResize);
    }

    private loadLevel() {
        InteractionSystem.clear(); 

        const result = DungeonDirector.generateLevel(this.scene);
        this.enemies = result.enemies;
        this.boss = result.boss;
        this.player.position.copy(result.startPos);
        
        // Init Minimap UI
        MinimapController.init(DungeonArchitect.grid, 50);
        
        ShadowSystem.clear();
        ShadowSystem.add(this.player.bodyMesh);
        this.enemies.forEach(e => ShadowSystem.add(e));
        
        // Explore spawn area immediately
        MapSystem.explore(this.player.position);
    }

    private spawnPlayer() {
        this.player = new PlayerEntity(this.scene, new THREE.Vector3(0, 1, 0));
        this.questArrow = new QuestArrow(this.player.bodyMesh);
        this.scene.add(this.questArrow.mesh);
        setTimeout(() => {
            const pos = this.player.position.clone().add(new THREE.Vector3(2, 0, 2));
            this.lootSystem.spawnWorldItem(pos, 'Mithril Sword', 'LEGENDARY', 1);
        }, 1000);
    }

    private loop = () => {
        if (!this.isRunning) return;
        
        let dt = this.clock.getDelta() * TimeManager.timeScale; 
        if (dt > 0.1) dt = 0.1;
        const time = this.clock.getElapsedTime();

        this.update(dt, time);
        PostProcessing.render();
        
        this.animationId = requestAnimationFrame(this.loop);
    }

    private update(dt: number, time: number) {
        if (this.player.userData.hp <= 0) return;

        const input = MobileBridge.moveDir;
        if (!this.skillSystem.isLeaping) {
            this.player.move(input, dt);
        }
        
        // INTERACTION CHECK (Pass player entity and scene for portal logic)
        InteractionSystem.update(this.player.position, this.player, this.scene);

        // UPDATE DUNGEON DIRECTOR (For Portal Animation)
        DungeonDirector.update(dt, time);

        // MAP DISCOVERY
        if (this.frameCount % 5 === 0) { 
            MapSystem.explore(this.player.position);
        }

        this.player.update(dt, time);
        GravitySystem.update(this.player.mesh, this.enemies, dt);
        VoidNet.check(this.player.mesh, 'Player');

        // Update Camera via System
        this.cameraSystem.update(dt);

        // AI
        SimpleAI.update(this.enemies.filter(e => !e.userData.isBoss), this.player.mesh, dt);
        if (this.boss) {
            BossAI.update(this.boss, this.player.mesh, dt, this.scene);
        }
        
        // Global Combat Updates (Regen)
        CombatSystem.update(dt);

        // Combat
        if (MobileBridge.isAttacking && !this.isAttackCooldown) {
            CombatSystem.performAttack(
                this.player.mesh, 
                this.enemies, 
                this.cameraSystem, 
                this.scene, 
                this.lootSystem
            );
            this.player.triggerAttackAnim();
            this.isAttackCooldown = true;
            setTimeout(() => this.isAttackCooldown = false, 400); 
            MobileBridge.isAttacking = false; 
        }

        this.skillSystem.update(this.player.bodyMesh, this.enemies, this.camera, dt);
        this.projectileSystem.update(dt, this.enemies, this.player.bodyMesh);
        this.lootSystem.update(this.player.position); 
        
        GameDirector.update(dt, this.player.position);
        EnemyHealthBar.update(this.enemies, this.camera);

        // UI Updates (Throttled)
        if (this.frameCount % 10 === 0) {
            HUDController.checkLowHealth(this.player.userData.hp || 100, this.player.userData.maxHp || 100);
            HUDController.updateGold(this.economyManager.gold); 
            
            // MINIMAP UPDATE
            MinimapController.update(
                this.player.position, 
                this.player.mesh.rotation.y, // Pass rotation for arrow
                DungeonArchitect.grid, 
                this.enemies, 
                (this.lootSystem as any).items // Access internal items
            );
        }
        
        if (QuestManager.targetPos) {
            this.questArrow.mesh.lookAt(QuestManager.targetPos.x, this.player.position.y, QuestManager.targetPos.z);
        } else if (this.enemies.length > 0) {
            const target = this.boss ? this.boss.position : this.enemies[0].position;
            this.questArrow.mesh.lookAt(target);
        }
        this.questArrow.update(dt);

        this.frameCount++;
    }

    private onResize = () => {
        if (!this.camera) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        PostProcessing.resize(window.innerWidth, window.innerHeight);
    }

    public stop() {
        this.isRunning = false;
        cancelAnimationFrame(this.animationId);
        this.container.innerHTML = '';
        window.removeEventListener('resize', this.onResize);
    }
}
