import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CityBuilder, InteractiveStation } from './cityBuilder';
import { RobiCompanion } from './robotCompanion';
import { StarCelebration } from './starCelebration';
import { sound } from '../audio/soundEffects';

export interface WorldManagerCallbacks {
  onNearbyStation: (station: InteractiveStation | null) => void;
  onGazeProgress: (progress: number, targetName: string | null) => void;
  onPlayerMoved: (x: number, z: number, rotationY: number) => void;
}

export class WorldManager {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public city: CityBuilder;
  public robi: RobiCompanion;
  public starCelebration: StarCelebration;

  // Player state
  public playerPosition = new THREE.Vector3(0, 1.6, 6.0);
  public playerRotation = { yaw: Math.PI, pitch: 0 };
  private moveSpeed = 6.0;
  private playerRadius = 0.4;
  private seatedEyeHeight = 1.6;

  // Input states
  private keysPressed: Record<string, boolean> = {};
  public joystickVector = { x: 0, y: 0 };
  public dpadVector = { x: 0, y: 0 };
  private isPointerDown = false;
  private lastPointerPos = { x: 0, y: 0 };
  private walkCycle = 0;
  private footstepTimer = 0;

  // VR Modes
  public vrMode: 'none' | 'stereo' | 'webxr' = 'none';
  private stereoCamera: THREE.StereoCamera;
  private gazeTarget: InteractiveStation | null = null;
  private gazeTimer = 0;
  private readonly GAZE_TRIGGER_TIME = 1.4; // 1.4 seconds gaze trigger

  // Animation & timing
  private clock = new THREE.Clock();
  private animationFrameId: number | null = null;
  private callbacks: WorldManagerCallbacks;

  // Raycaster for gaze & click interaction
  private raycaster = new THREE.Raycaster();
  private centerCoord = new THREE.Vector2(0, 0);

  // Device orientation (for Phone VR Box gyro)
  private hasDeviceOrientation = false;
  private deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };

  constructor(container: HTMLElement, callbacks: WorldManagerCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    // 1. Scene & Atmosphere (Mario World Sky)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38BDF8); // Vivid Mario Sky Blue
    this.scene.fog = new THREE.FogExp2(0x38BDF8, 0.009);

    // 2. Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(72, aspect, 0.1, 200);
    this.camera.position.copy(this.playerPosition);

    this.stereoCamera = new THREE.StereoCamera();
    this.stereoCamera.aspect = aspect / 2;
    this.stereoCamera.eyeSep = 0.064; // Standard 64mm IPD

    // 3. Renderer with PBR Physical standards
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // WebXR preparation
    this.renderer.xr.enabled = true;

    container.appendChild(this.renderer.domElement);

    // 4. Studio Environment map via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Balanced Lighting (Key Sun + Cool Fill Hemisphere)
    const sunLight = new THREE.DirectionalLight(0xFFFBEB, 1.6);
    sunLight.position.set(25, 45, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.02;
    this.scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xE0F2FE, 0x86EFAC, 0.85);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    // 6. Build 3D City & Actors
    this.city = new CityBuilder(this.scene);
    this.city.buildAll();

    this.robi = new RobiCompanion();
    this.scene.add(this.robi.group);

    this.starCelebration = new StarCelebration();
    this.scene.add(this.starCelebration.group);

    // 7. Event Listeners
    this.setupInputs();

    // 8. Start Game Loop
    this.startLoop();
  }

  private setupInputs() {
    // Keyboard
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    // Mouse / Touch Look
    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);

    // Resize
    window.addEventListener('resize', this.onResize);

    // Device orientation for cardboard gyro
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', this.onDeviceOrientation, false);
    }
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = true;
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = false;
  };

  private onPointerDown = (e: PointerEvent) => {
    this.isPointerDown = true;
    this.lastPointerPos = { x: e.clientX, y: e.clientY };
    try {
      (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    } catch {
      // Ignored if not supported
    }
    window.focus();
  };

  public turn(yawDelta: number) {
    this.playerRotation.yaw += yawDelta;
  }

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown) return;
    const dx = e.clientX - this.lastPointerPos.x;
    const dy = e.clientY - this.lastPointerPos.y;
    this.lastPointerPos = { x: e.clientX, y: e.clientY };

    // Update yaw and pitch
    const sensitivity = 0.0035;
    this.playerRotation.yaw -= dx * sensitivity;
    this.playerRotation.pitch -= dy * sensitivity;
    this.playerRotation.pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, this.playerRotation.pitch));
  };

  private onPointerUp = () => {
    this.isPointerDown = false;
  };

  private onDeviceOrientation = (e: DeviceOrientationEvent) => {
    if (e.alpha !== null && e.beta !== null && e.gamma !== null) {
      this.hasDeviceOrientation = true;
      this.deviceOrientation = {
        alpha: e.alpha,
        beta: e.beta,
        gamma: e.gamma,
      };
    }
  };

  public requestGyroPermission(): Promise<boolean> {
    return new Promise((resolve) => {
      const DeviceOrientationEventAny = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      if (typeof DeviceOrientationEventAny.requestPermission === 'function') {
        DeviceOrientationEventAny.requestPermission()
          .then((response) => resolve(response === 'granted'))
          .catch(() => resolve(false));
      } else {
        resolve(true);
      }
    });
  }

  public setVRMode(mode: 'none' | 'stereo' | 'webxr') {
    this.vrMode = mode;
    this.onResize();

    if (mode === 'webxr') {
      // In WebXR mode, WebXR session is managed by WebXR manager
      if (navigator.xr) {
        navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
          if (supported) {
            navigator.xr!.requestSession('immersive-vr', {
              optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
            }).then((session) => {
              this.renderer.xr.setSession(session);
            }).catch((err) => {
              console.warn('WebXR session request failed:', err);
              this.setVRMode('stereo'); // fallback to high-quality phone stereo
            });
          } else {
            this.setVRMode('stereo');
          }
        });
      } else {
        this.setVRMode('stereo');
      }
    }
  }

  public setSeatedMode(seated: boolean) {
    this.seatedEyeHeight = seated ? 1.2 : 1.65;
    this.playerPosition.y = this.seatedEyeHeight;
  }

  public setMoveSpeed(mult: number) {
    this.moveSpeed = 6.0 * mult;
  }

  public setRobiVisible(visible: boolean) {
    this.robi.setVisible(visible);
  }

  public teleportTo(x: number, y: number, z: number) {
    this.playerPosition.set(x, this.seatedEyeHeight, z);
    this.camera.position.copy(this.playerPosition);
    this.robi.teleportNear(x + 1.6, z - 1.2);
    sound.playTeleport();
  }

  public triggerStarBurstAt(stationId: string) {
    const station = this.city.stations.find((s) => s.id === stationId);
    if (station) {
      this.starCelebration.burst(new THREE.Vector3(station.position.x, 2.2, station.position.z), 24);
      this.robi.setExpression('cheer');
      sound.playCorrect();
    }
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.stereoCamera.aspect = (width / 2) / height;
    this.renderer.setSize(width, height);
  };

  private startLoop() {
    this.renderer.setAnimationLoop(() => {
      this.tick();
    });
  }

  private tick() {
    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // 1. Update Player Movement & Collisions
    this.updatePlayerMovement(delta);

    // 2. Update Camera Orientation
    this.updateCamera();

    // 3. Update Robi Companion & Stars
    this.robi.update(delta, this.playerPosition, this.playerRotation.yaw);
    this.starCelebration.update(delta);

    // 4. Update City Animations (Fountain, Swings, etc.)
    for (const anim of this.city.animatables) {
      anim.update(time, delta);
    }

    // 5. Station Proximity & Gaze Raycasting Check
    this.checkInteractions(delta);

    // 6. Notify HUD of Player Movement
    this.callbacks.onPlayerMoved(this.playerPosition.x, this.playerPosition.z, this.playerRotation.yaw);

    // 7. Render (Standard vs Stereoscopic)
    if (this.vrMode === 'stereo') {
      this.renderStereo();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private updatePlayerMovement(delta: number) {
    // Gather directional input (Keyboard + Virtual Joystick + On-screen D-Pad)
    let moveForward = 0;
    let moveRight = 0;

    if (this.keysPressed['KeyW'] || this.keysPressed['ArrowUp']) moveForward += 1;
    if (this.keysPressed['KeyS'] || this.keysPressed['ArrowDown']) moveForward -= 1;
    if (this.keysPressed['KeyA'] || this.keysPressed['ArrowLeft']) moveRight -= 1;
    if (this.keysPressed['KeyD'] || this.keysPressed['ArrowRight']) moveRight += 1;

    // Keyboard rotation with Q / E
    if (this.keysPressed['KeyQ']) this.playerRotation.yaw += 1.8 * delta;
    if (this.keysPressed['KeyE']) this.playerRotation.yaw -= 1.8 * delta;

    // Joystick input
    if (Math.abs(this.joystickVector.x) > 0.05 || Math.abs(this.joystickVector.y) > 0.05) {
      moveRight += this.joystickVector.x;
      moveForward += this.joystickVector.y;
    }

    // On-screen D-Pad input
    if (Math.abs(this.dpadVector.x) > 0.05 || Math.abs(this.dpadVector.y) > 0.05) {
      moveRight += this.dpadVector.x;
      moveForward += this.dpadVector.y;
    }

    const isMoving = (moveForward !== 0 || moveRight !== 0);
    if (!isMoving) {
      // Smoothly return eye height to resting position
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.seatedEyeHeight, 10, delta);
      return;
    }

    // Normalize
    const length = Math.hypot(moveForward, moveRight);
    if (length > 1) {
      moveForward /= length;
      moveRight /= length;
    }

    // Walking animation: head bobbing & audio footstep rhythm
    this.walkCycle += delta * (this.moveSpeed * 1.5);
    const headBob = Math.sin(this.walkCycle) * 0.045;
    this.camera.position.y = this.seatedEyeHeight + headBob;

    this.footstepTimer += delta;
    if (this.footstepTimer > 0.36) {
      sound.playStep();
      this.footstepTimer = 0;
    }

    // Direction relative to camera yaw
    const forwardVec = new THREE.Vector3(-Math.sin(this.playerRotation.yaw), 0, -Math.cos(this.playerRotation.yaw));
    const rightVec = new THREE.Vector3(Math.cos(this.playerRotation.yaw), 0, -Math.sin(this.playerRotation.yaw));

    const deltaX = (forwardVec.x * moveForward + rightVec.x * moveRight) * this.moveSpeed * delta;
    const deltaZ = (forwardVec.z * moveForward + rightVec.z * moveRight) * this.moveSpeed * delta;

    const currentX = this.playerPosition.x;
    const currentZ = this.playerPosition.z;

    // Calculate target position
    const targetX = currentX + deltaX;
    const targetZ = currentZ + deltaZ;

    // Boundary limits (Playable city area within -65 to 65)
    const clampedX = Math.max(-65, Math.min(65, targetX));
    const clampedZ = Math.max(-65, Math.min(65, targetZ));

    // Resolve collision with smooth sliding push-out
    const resolved = this.city.resolvePosition(clampedX, clampedZ, this.playerRadius);
    this.playerPosition.x = resolved.x;
    this.playerPosition.z = resolved.z;
    this.playerPosition.y = this.seatedEyeHeight;

    this.camera.position.x = this.playerPosition.x;
    this.camera.position.z = this.playerPosition.z;
  }



  private updateCamera() {
    if (this.vrMode === 'webxr' && this.renderer.xr.isPresenting) {
      // In WebXR, head tracking is handled directly by WebXR pose
      return;
    }

    if (this.vrMode === 'stereo' && this.hasDeviceOrientation) {
      // Calculate gyro orientation
      const degToRad = Math.PI / 180;
      const alpha = this.deviceOrientation.alpha * degToRad;
      const beta = this.deviceOrientation.beta * degToRad;
      const gamma = this.deviceOrientation.gamma * degToRad;

      const euler = new THREE.Euler(beta, alpha, -gamma, 'YXZ');
      this.camera.quaternion.setFromEuler(euler);
      return;
    }

    // Standard desktop / mobile camera rotation
    const euler = new THREE.Euler(this.playerRotation.pitch, this.playerRotation.yaw, 0, 'YXZ');
    this.camera.quaternion.setFromEuler(euler);
  }

  private checkInteractions(delta: number) {
    // 1. Proximity check to all stations
    let nearestStation: InteractiveStation | null = null;
    let nearestDist = Infinity;

    for (const station of this.city.stations) {
      const dist = this.playerPosition.distanceTo(station.position);
      if (dist < 4.2 && dist < nearestDist) {
        nearestDist = dist;
        nearestStation = station;
      }

      // Billboard facing camera
      station.promptMesh.lookAt(this.camera.position);
    }

    this.callbacks.onNearbyStation(nearestStation);

    // 2. Gaze Raycasting (Center of screen in VR / Mobile Cardboard)
    this.raycaster.setFromCamera(this.centerCoord, this.camera);
    const stationMeshes = this.city.stations.map((s) => s.meshGroup);
    const intersects = this.raycaster.intersectObjects(stationMeshes, true);

    let lookedStation: InteractiveStation | null = null;
    if (intersects.length > 0) {
      let root = intersects[0].object;
      while (root.parent && root.parent !== this.scene) {
        root = root.parent;
      }
      lookedStation = this.city.stations.find((s) => s.meshGroup === root) || null;
    }

    if (lookedStation) {
      if (this.gazeTarget === lookedStation) {
        this.gazeTimer += delta;
        const progress = Math.min(1.0, this.gazeTimer / this.GAZE_TRIGGER_TIME);
        this.callbacks.onGazeProgress(progress, lookedStation.label);

        if (progress >= 1.0) {
          // Gaze triggered!
          this.callbacks.onNearbyStation(lookedStation);
          this.gazeTimer = 0;
          sound.playClick();
        }
      } else {
        this.gazeTarget = lookedStation;
        this.gazeTimer = 0;
        this.callbacks.onGazeProgress(0, lookedStation.label);
      }
    } else {
      this.gazeTarget = null;
      this.gazeTimer = 0;
      this.callbacks.onGazeProgress(0, null);
    }
  }

  // Stereoscopic split-screen rendering for Phone VR Box
  private renderStereo() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const halfWidth = Math.floor(width / 2);

    this.stereoCamera.update(this.camera);

    this.renderer.setScissorTest(true);

    // Left eye
    this.renderer.setScissor(0, 0, halfWidth, height);
    this.renderer.setViewport(0, 0, halfWidth, height);
    this.renderer.render(this.scene, this.stereoCamera.cameraL);

    // Right eye
    this.renderer.setScissor(halfWidth, 0, halfWidth, height);
    this.renderer.setViewport(halfWidth, 0, halfWidth, height);
    this.renderer.render(this.scene, this.stereoCamera.cameraR);

    this.renderer.setScissorTest(false);
  }

  public dispose() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.renderer.setAnimationLoop(null);

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('deviceorientation', this.onDeviceOrientation);

    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
