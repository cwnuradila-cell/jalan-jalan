import * as THREE from 'three';

export class RobiCompanion {
  public group: THREE.Group;
  private head: THREE.Group;
  private body: THREE.Mesh;
  private leftHand: THREE.Mesh;
  private rightHand: THREE.Mesh;
  private eyeScreen: THREE.Mesh;
  private eyeTextureCanvas: HTMLCanvasElement;
  private eyeTextureContext: CanvasRenderingContext2D;
  private eyeTexture: THREE.CanvasTexture;
  private cloudBase: THREE.Group;

  private hoverTime: number = 0;
  private blinkTimer: number = 0;
  private expression: 'happy' | 'thinking' | 'cheer' = 'happy';
  public isVisible: boolean = true;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'Robi_Pemeri_Mario';

    // Materials: Mario palette PBR
    const matMarioRed = new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.4 });
    const matMarioBlue = new THREE.MeshStandardMaterial({ color: 0x2563EB, roughness: 0.4 });
    const matMarioYellow = new THREE.MeshStandardMaterial({ color: 0xFACC15, roughness: 0.3 });
    const matWhite = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.35 });

    // 1. Lakitu-style small fluffy smiling cloud on which Robi hovers
    this.cloudBase = new THREE.Group();
    for (let c = 0; c < 5; c++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.22 + (c % 2) * 0.08, 14, 14), matWhite);
      puff.position.set((c - 2) * 0.18, 0.15, (c % 2) * 0.06);
      puff.castShadow = true;
      this.cloudBase.add(puff);
    }
    this.group.add(this.cloudBase);

    // 2. Robot Body (Blue overalls style)
    const bodyGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.45, 20);
    this.body = new THREE.Mesh(bodyGeo, matMarioBlue);
    this.body.position.y = 0.5;
    this.body.castShadow = true;
    this.group.add(this.body);

    // Yellow buttons on overalls
    const btnGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12).rotateX(Math.PI / 2);
    const btnL = new THREE.Mesh(btnGeo, matMarioYellow);
    btnL.position.set(-0.1, 0.58, 0.21);
    this.group.add(btnL);

    const btnR = btnL.clone();
    btnR.position.x = 0.1;
    this.group.add(btnR);

    // 3. Head group
    this.head = new THREE.Group();
    this.head.position.y = 0.9;

    const headGeo = new THREE.BoxGeometry(0.48, 0.36, 0.4);
    const headMesh = new THREE.Mesh(headGeo, matWhite);
    headMesh.castShadow = true;
    this.head.add(headMesh);

    // Mario Cap on Robi's head
    const capGroup = new THREE.Group();
    capGroup.position.y = 0.22;

    const capDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
      matMarioRed
    );
    capGroup.add(capDome);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.22), matMarioRed);
    visor.position.set(0, 0, 0.22);
    capGroup.add(visor);

    // Cap white emblem badge with "P" (Pemeri)
    const emblem = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), matWhite);
    emblem.position.set(0, 0.14, 0.25);
    capGroup.add(emblem);

    this.head.add(capGroup);

    // Expressive face visor screen
    this.eyeTextureCanvas = document.createElement('canvas');
    this.eyeTextureCanvas.width = 256;
    this.eyeTextureCanvas.height = 128;
    this.eyeTextureContext = this.eyeTextureCanvas.getContext('2d')!;
    this.eyeTexture = new THREE.CanvasTexture(this.eyeTextureCanvas);
    this.eyeTexture.colorSpace = THREE.SRGBColorSpace;
    this.drawFace('happy');

    const screenGeo = new THREE.PlaneGeometry(0.4, 0.24);
    const screenMat = new THREE.MeshBasicMaterial({ map: this.eyeTexture, transparent: true });
    this.eyeScreen = new THREE.Mesh(screenGeo, screenMat);
    this.eyeScreen.position.set(0, 0, 0.205);
    this.head.add(this.eyeScreen);

    this.group.add(this.head);

    // 4. White cartoon gloves / hands
    const handGeo = new THREE.SphereGeometry(0.09, 12, 12);
    this.leftHand = new THREE.Mesh(handGeo, matWhite);
    this.leftHand.position.set(-0.35, 0.5, 0);
    this.group.add(this.leftHand);

    this.rightHand = new THREE.Mesh(handGeo, matWhite);
    this.rightHand.position.set(0.35, 0.5, 0);
    this.group.add(this.rightHand);

    // Scale appropriately (compact so it's unobtrusive)
    this.group.scale.setScalar(0.75);

    // Position politely to the side (never in front of player's view!)
    this.group.position.set(3, 1.2, 7.5);
  }

  public setVisible(visible: boolean) {
    this.isVisible = visible;
    this.group.visible = visible;
  }

  public drawFace(state: 'happy' | 'thinking' | 'cheer' | 'blink') {
    const ctx = this.eyeTextureContext;
    ctx.clearRect(0, 0, 256, 128);

    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, 0, 256, 128);

    ctx.fillStyle = '#38BDF8';
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';

    if (state === 'blink') {
      ctx.beginPath();
      ctx.moveTo(60, 64);
      ctx.lineTo(100, 64);
      ctx.moveTo(156, 64);
      ctx.lineTo(196, 64);
      ctx.stroke();
    } else if (state === 'cheer') {
      ctx.beginPath();
      ctx.arc(80, 72, 22, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(176, 72, 22, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      ctx.fillStyle = '#F43F5E';
      ctx.beginPath();
      ctx.arc(48, 88, 10, 0, Math.PI * 2);
      ctx.arc(208, 88, 10, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.roundRect(64, 42, 34, 46, 16);
      ctx.roundRect(158, 42, 34, 46, 16);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(74, 52, 6, 0, Math.PI * 2);
      ctx.arc(168, 52, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    this.eyeTexture.needsUpdate = true;
  }

  public setExpression(exp: 'happy' | 'thinking' | 'cheer') {
    this.expression = exp;
    this.drawFace(exp);
  }

  public update(delta: number, playerPos: THREE.Vector3, playerYaw: number) {
    if (!this.isVisible) return;

    this.hoverTime += delta * 3;
    this.blinkTimer += delta;

    // Hover bobbing
    const bob = Math.sin(this.hoverTime) * 0.06;
    this.head.position.y = 0.9 + bob * 0.4;
    this.body.position.y = 0.5 + bob;
    this.cloudBase.position.y = 0.15 + bob * 0.6;
    this.leftHand.position.y = 0.5 + Math.sin(this.hoverTime + 1) * 0.05;
    this.rightHand.position.y = 0.5 + Math.cos(this.hoverTime + 1) * 0.05;

    // Blink periodically
    if (this.blinkTimer > 3.5) {
      this.drawFace('blink');
      if (this.blinkTimer > 3.7) {
        this.drawFace(this.expression);
        this.blinkTimer = 0;
      }
    }

    // CRITICAL: Position Robi strictly to the RIGHT and SLIGHTLY BEHIND the player,
    // so Robi NEVER enters the camera forward sight line!
    const rightSideAngle = playerYaw - Math.PI / 2.5; // Offset 72 degrees to the side
    const followDist = 2.4;
    const targetX = playerPos.x + Math.sin(rightSideAngle) * followDist;
    const targetZ = playerPos.z + Math.cos(rightSideAngle) * followDist;
    const targetY = playerPos.y + 0.1;

    // Smoothly glide companion to target position
    this.group.position.x = THREE.MathUtils.damp(this.group.position.x, targetX, 3.5, delta);
    this.group.position.y = THREE.MathUtils.damp(this.group.position.y, targetY, 3.5, delta);
    this.group.position.z = THREE.MathUtils.damp(this.group.position.z, targetZ, 3.5, delta);

    // Gently face towards player
    const dx = playerPos.x - this.group.position.x;
    const dz = playerPos.z - this.group.position.z;
    const targetAngle = Math.atan2(dx, dz);
    this.group.rotation.y = THREE.MathUtils.damp(this.group.rotation.y, targetAngle, 4, delta);
  }

  public teleportNear(x: number, z: number) {
    // Teleport to side-rear
    this.group.position.set(x + 2.2, 1.2, z + 1.8);
    this.setExpression('cheer');
    setTimeout(() => this.setExpression('happy'), 2000);
  }
}
