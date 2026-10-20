import * as THREE from 'three';
import {
  createCobblestoneTexture,
  createZebraCrossingTexture,
  createClockTexture,
  createTextSignTexture,
  createCompassRoseTexture,
  createQuestionBlockTexture,
  createBrickBlockTexture,
  createMushroomCapTexture,
  createCloudFaceTexture,
} from './proceduralTextures';
import { QUESTIONS } from '../data/questionsData';

export interface ColliderBox {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  name: string;
}

export interface InteractiveStation {
  id: string;
  zoneId: string;
  stationIndex: number;
  position: THREE.Vector3;
  meshGroup: THREE.Group;
  promptMesh: THREE.Mesh;
  glowRing: THREE.Mesh;
  iconMesh: THREE.Mesh;
  label: string;
}

export interface TeleportPoint {
  id: string;
  name: string;
  position: THREE.Vector3;
  mesh: THREE.Group;
}

export class CityBuilder {
  public scene: THREE.Scene;
  public colliders: ColliderBox[] = [];
  public stations: InteractiveStation[] = [];
  public teleportPoints: TeleportPoint[] = [];
  public animatables: Array<{ update: (time: number, delta: number) => void }> = [];

  // Mario World Palette PBR Materials
  private matMarioGreen = new THREE.MeshStandardMaterial({ color: 0x22C55E, roughness: 0.65 });
  private matPipeGreen = new THREE.MeshStandardMaterial({ color: 0x16A34A, roughness: 0.35, metalness: 0.1 });
  private matPipeDark = new THREE.MeshStandardMaterial({ color: 0x052E16, roughness: 0.8 });
  private matMarioRed = new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.45 });
  private matMarioBlue = new THREE.MeshStandardMaterial({ color: 0x3B82F6, roughness: 0.45 });
  private matMarioYellow = new THREE.MeshStandardMaterial({ color: 0xFACC15, roughness: 0.35, metalness: 0.2 });
  private matMarioOrange = new THREE.MeshStandardMaterial({ color: 0xF97316, roughness: 0.5 });
  private matWhite = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.4 });
  private matWood = new THREE.MeshStandardMaterial({ color: 0x92400E, roughness: 0.8 });
  private matRoad = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.8 });
  private matGoldCoin = new THREE.MeshStandardMaterial({
    color: 0xFDE047,
    emissive: 0xEAB308,
    emissiveIntensity: 0.4,
    roughness: 0.25,
    metalness: 0.5,
  });

  // Textures
  private texQuestionBlock = createQuestionBlockTexture();
  private texBrickBlock = createBrickBlockTexture();
  private texMushroomRed = createMushroomCapTexture('#EF4444');
  private texMushroomGreen = createMushroomCapTexture('#10B981');
  private texCheckered = createZebraCrossingTexture();
  private texCobble = createCobblestoneTexture();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public buildAll() {
    this.buildTerrainAndSky();
    this.buildCenterPlaza();
    this.buildZone1CastleSchool();
    this.buildZone2MushroomHouse();
    this.buildZone3MarioKartRoad();
    this.buildZone4MarioPlayground();
    this.buildMarioFoliageAndProps();
    this.buildMarioQuestionStations();
    this.buildMarioWarpPipes();
  }

  public addCollider(minX: number, maxX: number, minZ: number, maxZ: number, name: string) {
    this.colliders.push({ minX, maxX, minZ, maxZ, name });
  }

  // 1. Mario World Terrain & Smiling Clouds
  private buildTerrainAndSky() {
    // Vibrant Mario Green Ground
    const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMesh = new THREE.Mesh(groundGeo, this.matMarioGreen);
    groundMesh.receiveShadow = true;
    groundMesh.position.y = -0.01;
    this.scene.add(groundMesh);

    // Iconic Mario layered rounded rolling hills on perimeter with dark green spots
    const hillSpotMat = new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.8 });
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI * 2) / 16;
      const dist = 76 + (i % 3) * 5;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      const hillRadius = 16 + (i % 3) * 4;
      const hillGeo = new THREE.SphereGeometry(hillRadius, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const hillMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x4ADE80 : 0x22C55E,
        roughness: 0.85,
      });
      const hill = new THREE.Mesh(hillGeo, hillMat);
      hill.position.set(x, -2, z);
      this.scene.add(hill);

      // Spots on hills
      const spot = new THREE.Mesh(new THREE.CircleGeometry(2.5, 12).rotateX(-Math.PI / 2.3), hillSpotMat);
      spot.position.set(x, hillRadius * 0.55, z);
      this.scene.add(spot);
    }

    // Mario Paved Avenues
    const sidewalkMat = new THREE.MeshStandardMaterial({ map: this.texCobble, roughness: 0.6 });
    const createWalkway = (w: number, d: number, x: number, z: number) => {
      const geo = new THREE.BoxGeometry(w, 0.1, d);
      const mesh = new THREE.Mesh(geo, sidewalkMat);
      mesh.position.set(x, 0.05, z);
      mesh.receiveShadow = true;
      this.scene.add(mesh);
    };

    createWalkway(8, 95, 0, 0); // North-South
    createWalkway(95, 8, 0, 0); // East-West

    // Floating Smiling Mario Clouds in the Sky
    const cloudFaceTex = createCloudFaceTexture();
    const cloudFaceMat = new THREE.MeshBasicMaterial({ map: cloudFaceTex, transparent: true });

    for (let i = 0; i < 9; i++) {
      const cloud = new THREE.Group();
      const cx = -50 + (i % 3) * 50 + (Math.random() - 0.5) * 15;
      const cz = -50 + Math.floor(i / 3) * 50 + (Math.random() - 0.5) * 15;
      const cy = 24 + (i % 3) * 4;

      // 3 overlapping cloud puffs
      const puff1 = new THREE.Mesh(new THREE.SphereGeometry(3.5, 14, 14), this.matWhite);
      cloud.add(puff1);
      const puff2 = new THREE.Mesh(new THREE.SphereGeometry(2.6, 12, 12), this.matWhite);
      puff2.position.set(-2.8, -0.6, 0);
      cloud.add(puff2);
      const puff3 = new THREE.Mesh(new THREE.SphereGeometry(2.6, 12, 12), this.matWhite);
      puff3.position.set(2.8, -0.6, 0);
      cloud.add(puff3);

      // Smiling face plane
      const faceMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.8), cloudFaceMat);
      faceMesh.position.set(0, -0.2, 3.52);
      cloud.add(faceMesh);

      cloud.position.set(cx, cy, cz);
      this.scene.add(cloud);

      // Gentle cloud drift
      this.animatables.push({
        update: (time) => {
          cloud.position.x = cx + Math.sin(time * 0.2 + i) * 6;
        },
      });
    }
  }

  // 2. Central Town Square with Mario Star & Fountain
  private buildCenterPlaza() {
    const plazaGroup = new THREE.Group();

    // Circular plaza
    const plazaGeo = new THREE.CylinderGeometry(11, 11.2, 0.12, 36);
    const plazaMat = new THREE.MeshStandardMaterial({ color: 0xFFFBEB, roughness: 0.5 });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.y = 0.06;
    plaza.receiveShadow = true;
    plazaGroup.add(plaza);

    // Super Star Compass Rose floor
    const compassGeo = new THREE.PlaneGeometry(8.5, 8.5);
    compassGeo.rotateX(-Math.PI / 2);
    const compassMat = new THREE.MeshBasicMaterial({
      map: createCompassRoseTexture(),
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const compass = new THREE.Mesh(compassGeo, compassMat);
    compass.position.y = 0.13;
    plazaGroup.add(compass);

    // Compact Center Fountain with Super Star on top
    const fountainGroup = new THREE.Group();
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.45, 20), this.matWhite);
    basin.position.y = 0.3;
    basin.castShadow = true;
    fountainGroup.add(basin);

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      roughness: 0.1,
      metalness: 0.5,
      transparent: true,
      opacity: 0.85,
    });
    const water = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.1, 20), waterMat);
    water.position.y = 0.52;
    fountainGroup.add(water);

    // Upper column
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 0.8, 12), this.matMarioYellow);
    ped.position.y = 0.85;
    fountainGroup.add(ped);

    // Golden Super Star centerpiece rotating on top of fountain
    const starShape = new THREE.Shape();
    const pts = 5;
    for (let i = 0; i < pts * 2; i++) {
      const r = i % 2 === 0 ? 0.45 : 0.2;
      const a = (i * Math.PI) / pts - Math.PI / 2;
      const sx = Math.cos(a) * r;
      const sy = Math.sin(a) * r;
      if (i === 0) starShape.moveTo(sx, sy);
      else starShape.lineTo(sx, sy);
    }
    starShape.closePath();
    const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03 });
    const centerStar = new THREE.Mesh(starGeo, this.matGoldCoin);
    centerStar.position.set(0, 1.5, -0.05);
    fountainGroup.add(centerStar);

    this.animatables.push({
      update: (time) => {
        centerStar.rotation.y = time * 2;
      },
    });

    plazaGroup.add(fountainGroup);
    this.addCollider(-1.8, 1.8, -1.8, 1.8, 'Air_Pancut_Pusat');

    // Directional signpost
    const postGroup = new THREE.Group();
    postGroup.position.set(4.5, 0, -4.5);
    const postPole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.2, 12), this.matWood);
    postPole.position.y = 1.6;
    postGroup.add(postPole);

    const createSign = (txt: string, col: string, rotY: number, y: number) => {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.4, 0.08),
        new THREE.MeshStandardMaterial({ map: createTextSignTexture(txt, col, '#FFFFFF'), roughness: 0.4 })
      );
      m.position.set(0.8, y, 0);
      m.rotation.y = rotY;
      postGroup.add(m);
    };

    createSign('⭐ Zon 1: Sekolah ➔', '#DC2626', -Math.PI / 2, 2.6);
    createSign('🍄 Zon 2: Rumah ➔', '#059669', 0, 2.2);
    createSign('🚦 Zon 3: Jalan Raya ➔', '#2563EB', Math.PI / 2, 1.8);
    createSign('⭐ Zon 4: Taman ➔', '#EC4899', Math.PI, 1.4);

    plazaGroup.add(postGroup);
    this.addCollider(3.8, 5.2, -5.2, -3.8, 'Papan_Arah');

    // Outer perimeter benches at radius 8.5m
    this.createClayBench(plazaGroup, -8.0, 0, 0, Math.PI / 2);
    this.createClayBench(plazaGroup, 8.0, 0, 0, -Math.PI / 2);
    this.createClayBench(plazaGroup, 0, 0, -8.0, Math.PI);

    this.scene.add(plazaGroup);
  }

  // 3. Zone 1: Sekolah Selamat (Mushroom Kingdom Castle School & Goal Flagpole)
  private buildZone1CastleSchool() {
    const schoolGroup = new THREE.Group();
    schoolGroup.position.set(0, 0, -38);

    // Castle Main Hall (White stone blocks + Red battlements)
    const mainHall = new THREE.Mesh(new THREE.BoxGeometry(20, 6.5, 10), this.matWhite);
    mainHall.position.set(0, 3.25, 0);
    mainHall.castShadow = true;
    mainHall.receiveShadow = true;
    schoolGroup.add(mainHall);

    // Red Castle Roof & Turrets
    const roof = new THREE.Mesh(new THREE.ConeGeometry(15, 3.5, 4).rotateY(Math.PI / 4), this.matMarioRed);
    roof.position.set(0, 8.2, 0);
    roof.scale.set(1.0, 1.0, 0.6);
    roof.castShadow = true;
    schoolGroup.add(roof);

    // Left and Right Turret Towers
    for (const tx of [-10, 10]) {
      const turretCol = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 7.5, 16), this.matWhite);
      turretCol.position.set(tx, 3.75, 0);
      schoolGroup.add(turretCol);

      const turretCone = new THREE.Mesh(new THREE.ConeGeometry(2.0, 3.0, 16), this.matMarioRed);
      turretCone.position.set(tx, 8.8, 0);
      schoolGroup.add(turretCone);

      const goldOrb = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), this.matMarioYellow);
      goldOrb.position.set(tx, 10.4, 0);
      schoolGroup.add(goldOrb);
    }

    // School Clock Tower
    const tower = new THREE.Mesh(new THREE.BoxGeometry(4.0, 4.0, 3.5), this.matMarioYellow);
    tower.position.set(0, 8.4, 0);
    schoolGroup.add(tower);

    const clockMesh = new THREE.Mesh(new THREE.CircleGeometry(1.2, 24), new THREE.MeshBasicMaterial({ map: createClockTexture() }));
    clockMesh.position.set(0, 8.5, 1.76);
    schoolGroup.add(clockMesh);

    // School Banner
    const banner = new THREE.Mesh(
      new THREE.BoxGeometry(9.0, 1.4, 0.15),
      new THREE.MeshStandardMaterial({ map: createTextSignTexture('SEKOLAH KEBANGSAAN', '#DC2626', '#FFFFFF', 'BANDAR SELAMAT MARIO') })
    );
    banner.position.set(0, 4.3, 5.1);
    schoolGroup.add(banner);

    // Arched Gate Entrance
    const door = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.8), new THREE.MeshStandardMaterial({ color: 0x78350F }));
    door.position.set(0, 1.4, 5.06);
    schoolGroup.add(door);

    // Windows
    for (let r = 0; r < 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (c === 0 && r === 0) continue;
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.4, 0.12), this.matMarioBlue);
        win.position.set(c * 3.4, 1.8 + r * 2.5, 5.06);
        schoolGroup.add(win);
      }
    }

    // Iconic Mario Goal Flagpole (Tiang Bendera Gol Mario)
    const flagGroup = new THREE.Group();
    flagGroup.position.set(-6.5, 0, 8.5);

    // Green stepped base hill
    const basePuff = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 0.4, 16), this.matMarioGreen);
    basePuff.position.y = 0.2;
    flagGroup.add(basePuff);

    // Tall white flagpole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 7.5, 12), this.matWhite);
    pole.position.y = 3.95;
    flagGroup.add(pole);

    // Golden ball on top
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), this.matGoldCoin);
    ball.position.y = 7.7;
    flagGroup.add(ball);

    // Triangle goal flag
    const flagShape = new THREE.Shape();
    flagShape.moveTo(0, 0);
    flagShape.lineTo(1.6, -0.6);
    flagShape.lineTo(0, -1.2);
    flagShape.closePath();
    const flagGeo = new THREE.ShapeGeometry(flagShape);
    const flagMesh = new THREE.Mesh(flagGeo, new THREE.MeshStandardMaterial({ color: 0x22C55E, side: THREE.DoubleSide }));
    flagMesh.position.set(0.08, 7.4, 0);
    flagGroup.add(flagMesh);

    schoolGroup.add(flagGroup);

    // Red basketball court & green soccer field
    const court = new THREE.Mesh(new THREE.BoxGeometry(16, 0.08, 12), new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.8 }));
    court.position.set(16, 0.04, 3);
    schoolGroup.add(court);

    const field = new THREE.Mesh(new THREE.BoxGeometry(16, 0.06, 12), new THREE.MeshStandardMaterial({ color: 0x10B981, roughness: 0.85 }));
    field.position.set(-16, 0.03, 3);
    schoolGroup.add(field);

    this.scene.add(schoolGroup);
    this.addCollider(-12, 12, -44, -32, 'Istana_Sekolah');
  }

  // 4. Zone 2: Rumah Selamat (Rumah Cendawan / Mushroom House)
  private buildZone2MushroomHouse() {
    const houseGroup = new THREE.Group();
    houseGroup.position.set(34, 0, 5);

    // Stem of Mushroom House (Beige / white clay cylinder)
    const stemGeo = new THREE.CylinderGeometry(5.2, 5.8, 4.2, 24);
    const stem = new THREE.Mesh(stemGeo, new THREE.MeshStandardMaterial({ color: 0xFEF3C7, roughness: 0.6 }));
    stem.position.y = 2.1;
    stem.castShadow = true;
    stem.receiveShadow = true;
    houseGroup.add(stem);

    // Giant Red Mushroom Cap Dome with Polka Dots
    const capGeo = new THREE.SphereGeometry(7.5, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const capMat = new THREE.MeshStandardMaterial({ map: this.texMushroomRed, roughness: 0.45 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 3.8;
    cap.castShadow = true;
    houseGroup.add(cap);

    // Yellow Chimney with cloud puff
    const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.5, 12), this.matMarioYellow);
    chimney.position.set(3.5, 8.5, -1.5);
    houseGroup.add(chimney);

    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), this.matWhite);
    puff.position.set(3.5, 10.2, -1.5);
    houseGroup.add(puff);

    // Front Porch Veranda
    const porch = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.2, 4.0), this.matWhite);
    porch.position.set(0, 0.1, 5.8);
    houseGroup.add(porch);

    // Front Door
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.4, 0.1), this.matWood);
    door.position.set(0, 1.2, 5.1);
    houseGroup.add(door);

    // Safety Items on Porch (Fire Extinguisher & First Aid Box)
    // 1. Red Fire Extinguisher (Pemadam Api)
    const extGroup = new THREE.Group();
    extGroup.position.set(-2.8, 0.9, 5.5);
    const extBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.85, 16), this.matMarioRed);
    extGroup.add(extBody);
    const extSign = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.35, 0.04),
      new THREE.MeshStandardMaterial({ map: createTextSignTexture('PEMADAM API', '#DC2626', '#FFFFFF') })
    );
    extSign.position.set(0, 0.7, 0.05);
    extGroup.add(extSign);
    houseGroup.add(extGroup);

    // 2. First Aid Medical Kit (Peti Kecemasan)
    const aidGroup = new THREE.Group();
    aidGroup.position.set(2.8, 1.2, 5.5);
    const aidBox = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.25), this.matWhite);
    aidGroup.add(aidBox);
    const cross1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.05), this.matMarioRed);
    cross1.position.z = 0.14;
    aidGroup.add(cross1);
    const cross2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.05), this.matMarioRed);
    cross2.position.z = 0.14;
    aidGroup.add(cross2);
    const aidSign = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.35, 0.04),
      new THREE.MeshStandardMaterial({ map: createTextSignTexture('PETI KECEMASAN', '#059669', '#FFFFFF') })
    );
    aidSign.position.set(0, 0.65, 0.05);
    aidGroup.add(aidSign);
    houseGroup.add(aidGroup);

    // House Name Sign
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 0.8, 0.08),
      new THREE.MeshStandardMaterial({ map: createTextSignTexture('RUMAH CENDAWAN', '#059669', '#FFFFFF', 'KEDIAMAN SELAMAT') })
    );
    sign.position.set(0, 2.8, 5.2);
    houseGroup.add(sign);

    this.scene.add(houseGroup);
    this.addCollider(28, 40, -1, 10, 'Rumah_Cendawan');
  }

  // 5. Zone 3: Jalan Raya Selamat (Mario Kart Circuit)
  private buildZone3MarioKartRoad() {
    const roadGroup = new THREE.Group();
    roadGroup.position.set(0, 0, 28);

    // Checkered Racing Crossings
    const zebraGeo = new THREE.PlaneGeometry(8, 6).rotateX(-Math.PI / 2);
    const zebraMat = new THREE.MeshBasicMaterial({ map: this.texCheckered });
    const cross1 = new THREE.Mesh(zebraGeo, zebraMat);
    cross1.position.set(0, 0.05, 0);
    roadGroup.add(cross1);

    const cross2 = new THREE.Mesh(zebraGeo, zebraMat);
    cross2.position.set(12, 0.05, 6);
    cross2.rotation.y = Math.PI / 2;
    roadGroup.add(cross2);

    // Mario Traffic Light
    this.createTrafficLight(roadGroup, -4.8, 0, -3.8);
    this.createTrafficLight(roadGroup, 4.8, 0, 3.8);

    // Caution Signs
    const s1 = this.createRoadSign('HATI-HATI: LINTASAN PEJALAN KAKI', '#DC2626', -6, 0, 2);
    roadGroup.add(s1);
    const s2 = this.createRoadSign('LITAR SELAMAT: HAD LAJU 30 KM/J', '#2563EB', 6, 0, -2);
    roadGroup.add(s2);

    // Cartoon Mario Kart Parked Safely (Red Kart with white racing number 1)
    const kartGroup = new THREE.Group();
    kartGroup.position.set(7.5, 0, 8);
    kartGroup.rotation.y = -Math.PI / 6;

    // Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.6, 3.4), this.matMarioRed);
    chassis.position.y = 0.5;
    kartGroup.add(chassis);

    // Spoiler wing
    const wing = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.6), this.matMarioYellow);
    wing.position.set(0, 1.1, -1.3);
    kartGroup.add(wing);

    // Kart big cartoon wheels
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 16).rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.8 });
    for (const [wx, wz] of [[-1.1, 1.0], [1.1, 1.0], [-1.1, -1.0], [1.1, -1.0]]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(wx, 0.38, wz);
      kartGroup.add(w);
    }
    roadGroup.add(kartGroup);
    this.addCollider(5.5, 9.5, 34, 38, 'Mario_Kart');

    this.scene.add(roadGroup);
  }

  // 6. Zone 4: Taman Permainan (Taman Riadah Mario & Giant Mushrooms)
  private buildZone4MarioPlayground() {
    const playGroup = new THREE.Group();
    playGroup.position.set(-32, 0, 8);

    // Safety turf circle
    const turf = new THREE.Mesh(new THREE.CylinderGeometry(15, 15.5, 0.1, 32), new THREE.MeshStandardMaterial({ color: 0xFACC15, roughness: 0.85 }));
    turf.position.y = 0.05;
    playGroup.add(turf);

    // 1. Giant Green 1-Up Mushroom Prop in Playground
    const mush1Up = new THREE.Group();
    mush1Up.position.set(5.5, 0, 6.5);
    const mStem = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 1.2, 16), new THREE.MeshStandardMaterial({ color: 0xFEF3C7 }));
    mStem.position.y = 0.6;
    mush1Up.add(mStem);
    const mCap = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
      new THREE.MeshStandardMaterial({ map: this.texMushroomGreen, roughness: 0.4 })
    );
    mCap.position.y = 1.3;
    mush1Up.add(mCap);
    playGroup.add(mush1Up);
    this.addCollider(-28, -25, 13, 16, 'Cendawan_1Up');

    // 2. Mario Playground Slide
    const slideGroup = new THREE.Group();
    slideGroup.position.set(-4, 0, -3);
    const tower = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.8, 2.4), this.matMarioBlue);
    tower.position.y = 1.4;
    slideGroup.add(tower);

    const chute = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 5.2).rotateX(Math.PI / 6), this.matMarioYellow);
    chute.position.set(0, 1.2, 2.8);
    slideGroup.add(chute);

    const tRoof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.6, 4).rotateY(Math.PI / 4), this.matMarioRed);
    tRoof.position.y = 3.6;
    slideGroup.add(tRoof);

    playGroup.add(slideGroup);
    this.addCollider(-39, -33, 2, 8, 'Menara_Gelongsor');

    // 3. Swings (Buaian)
    const swingGroup = new THREE.Group();
    swingGroup.position.set(5, 0, -2);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.6, 12).rotateZ(Math.PI / 2), this.matWhite);
    beam.position.y = 3.6;
    swingGroup.add(beam);

    for (const sx of [-1.2, 1.2]) {
      const seatPivot = new THREE.Group();
      seatPivot.position.set(sx, 3.5, 0);

      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.35), this.matMarioRed);
      seat.position.set(0, -2.6, 0);
      seatPivot.add(seat);

      swingGroup.add(seatPivot);
      this.animatables.push({
        update: (time) => {
          seatPivot.rotation.x = Math.sin(time * 2.5 + sx) * 0.25;
        },
      });
    }
    playGroup.add(swingGroup);
    this.addCollider(-30, -24, 4, 8, 'Set_Buaian');

    // Park Banner
    const parkSign = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 0.9, 0.1),
      new THREE.MeshStandardMaterial({ map: createTextSignTexture('TAMAN REKREASI MARIO', '#EC4899', '#FFFFFF', 'ZON RIADAH KANAK-KANAK') })
    );
    parkSign.position.set(0, 2.2, -8.5);
    playGroup.add(parkSign);

    this.scene.add(playGroup);
  }

  // 7. Mario World Foliage: Puffy Green Hills, Trees & Street Lamps
  private buildMarioFoliageAndProps() {
    const treeGroup = new THREE.Group();

    const treePositions: [number, number, string][] = [
      [-8, -8, '#22C55E'], [8, -8, '#16A34A'], [-8, 8, '#F59E0B'], [8, 8, '#EC4899'],
      [-14, -22, '#22C55E'], [14, -22, '#4ADE80'], [-20, -32, '#22C55E'], [20, -32, '#EC4899'],
      [22, -8, '#F59E0B'], [22, 16, '#22C55E'], [44, -4, '#EC4899'], [44, 14, '#16A34A'],
      [-14, 22, '#16A34A'], [14, 22, '#22C55E'], [-14, 38, '#F59E0B'], [14, 38, '#EC4899'],
      [-22, -4, '#EC4899'], [-44, -2, '#22C55E'], [-44, 18, '#4ADE80'], [-22, 16, '#F59E0B'],
    ];

    treePositions.forEach(([x, z, hexColor], idx) => {
      const tree = this.createMarioTree(hexColor, 0.85 + (idx % 3) * 0.15);
      tree.position.set(x, 0, z);
      treeGroup.add(tree);
      this.addCollider(x - 0.7, x + 0.7, z - 0.7, z + 0.7, `Pokok_${idx}`);
    });

    this.scene.add(treeGroup);
  }

  // 8. Mario Question Stations: Floating Golden '?' Blocks with Spinning Coins!
  private buildMarioQuestionStations() {
    QUESTIONS.forEach((q) => {
      const stationGroup = new THREE.Group();
      stationGroup.position.set(...q.position);

      // Mario Brick Block Pedestal
      const brickPed = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 1.0, 1.0),
        new THREE.MeshStandardMaterial({ map: this.texBrickBlock, roughness: 0.5 })
      );
      brickPed.position.y = 0.5;
      brickPed.castShadow = true;
      stationGroup.add(brickPed);

      // Floating Golden Mario '?' Block
      const qBlockGroup = new THREE.Group();
      qBlockGroup.position.y = 2.0;

      const qBox = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.2, 1.2),
        new THREE.MeshStandardMaterial({ map: this.texQuestionBlock, roughness: 0.35, metalness: 0.1 })
      );
      qBox.castShadow = true;
      qBlockGroup.add(qBox);

      // Floating spinning 3D Mario Golden Coin above the '?' Block
      const coin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.08, 16).rotateX(Math.PI / 2),
        this.matGoldCoin
      );
      coin.position.y = 1.1;
      qBlockGroup.add(coin);

      stationGroup.add(qBlockGroup);

      // Glowing Ground Ring
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.1, 1.5, 32).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0xFACC15, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
      );
      ring.position.y = 0.04;
      stationGroup.add(ring);

      // "JAWAB SOALAN" 3D Billboard Prompt Tag
      const promptMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.45, 0.08),
        new THREE.MeshStandardMaterial({
          map: createTextSignTexture(`MISI ${q.stationIndex}`, '#DC2626', '#FFFFFF', 'JAWAB SOALAN'),
          roughness: 0.3,
        })
      );
      promptMesh.position.set(0, 0.95, 0.65);
      stationGroup.add(promptMesh);

      this.scene.add(stationGroup);

      this.stations.push({
        id: q.id,
        zoneId: q.zoneId,
        stationIndex: q.stationIndex,
        position: new THREE.Vector3(...q.position),
        meshGroup: stationGroup,
        promptMesh,
        glowRing: ring,
        iconMesh: qBlockGroup as unknown as THREE.Mesh,
        label: q.title,
      });

      // Animate hovering '?' block & spinning coin
      this.animatables.push({
        update: (time) => {
          qBlockGroup.position.y = 2.0 + Math.sin(time * 3 + q.stationIndex) * 0.1;
          coin.rotation.y = time * 3.5;
          ring.scale.setScalar(1 + Math.sin(time * 4) * 0.06);
        },
      });

      this.addCollider(q.position[0] - 0.6, q.position[0] + 0.6, q.position[2] - 0.6, q.position[2] + 0.6, `Stesen_${q.id}`);
    });
  }

  // 9. Mario Warp Pipes (Paip Hijau Mario) as Teleportation Pads!
  private buildMarioWarpPipes() {
    const pipes = [
      { id: 'pusat', name: 'Dataran Pusat', pos: new THREE.Vector3(0, 0, 0) },
      { id: 'sekolah', name: 'Zon Sekolah', pos: new THREE.Vector3(0, 0, -22) },
      { id: 'rumah', name: 'Zon Rumah', pos: new THREE.Vector3(20, 0, 6) },
      { id: 'jalan', name: 'Zon Jalan Raya', pos: new THREE.Vector3(2, 0, 20) },
      { id: 'taman', name: 'Zon Taman', pos: new THREE.Vector3(-20, 0, 6) },
    ];

    pipes.forEach((p) => {
      const pipeGroup = new THREE.Group();
      pipeGroup.position.copy(p.pos);

      // Pipe main cylinder
      const pipeBody = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.7, 24), this.matPipeGreen);
      pipeBody.position.y = 0.35;
      pipeBody.castShadow = true;
      pipeGroup.add(pipeBody);

      // Pipe upper rim lip
      const pipeLip = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, 0.35, 24), this.matPipeGreen);
      pipeLip.position.y = 0.85;
      pipeLip.castShadow = true;
      pipeGroup.add(pipeLip);

      // Dark interior hole
      const pipeHole = new THREE.Mesh(new THREE.CircleGeometry(1.15, 24).rotateX(-Math.PI / 2), this.matPipeDark);
      pipeHole.position.y = 1.03;
      pipeGroup.add(pipeHole);

      this.scene.add(pipeGroup);
      this.teleportPoints.push({
        id: p.id,
        name: p.name,
        position: p.pos,
        mesh: pipeGroup,
      });
    });
  }

  // Helper Methods
  private createMarioTree(colorHex: string, scale: number = 1.0): THREE.Group {
    const tree = new THREE.Group();

    // Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 2.0 * scale, 12), this.matWood);
    trunk.position.y = 1.0 * scale;
    trunk.castShadow = true;
    tree.add(trunk);

    // Multi-puff layered cartoon foliage
    const leafMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(colorHex), roughness: 0.6 });
    const p1 = new THREE.Mesh(new THREE.SphereGeometry(1.2 * scale, 14, 14), leafMat);
    p1.position.set(0, 2.4 * scale, 0);
    p1.castShadow = true;
    tree.add(p1);

    const p2 = new THREE.Mesh(new THREE.SphereGeometry(0.9 * scale, 12, 12), leafMat);
    p2.position.set(0.35 * scale, 3.1 * scale, 0.1 * scale);
    p2.castShadow = true;
    tree.add(p2);

    return tree;
  }

  private createClayBench(parent: THREE.Group, x: number, y: number, z: number, rotY: number) {
    const bench = new THREE.Group();
    bench.position.set(x, y, z);
    bench.rotation.y = rotY;

    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.6), this.matWood);
    plank.position.set(0, 0.5, 0);
    bench.add(plank);

    const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 0.08), this.matWood);
    back.position.set(0, 0.85, -0.26);
    bench.add(back);

    parent.add(bench);
    this.addCollider(x - 0.9, x + 0.9, z - 0.4, z + 0.4, 'Bangku');
  }

  private createTrafficLight(parent: THREE.Group, x: number, y: number, z: number) {
    const tl = new THREE.Group();
    tl.position.set(x, y, z);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.0, 12), this.matRoad);
    pole.position.y = 2.0;
    tl.add(pole);

    const box = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.8, 0.45), this.matMarioYellow);
    box.position.set(0, 3.2, 0);
    tl.add(box);

    const rL = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 16).rotateX(Math.PI / 2), this.matMarioRed);
    rL.position.set(0, 3.7, 0.24);
    tl.add(rL);

    const yL = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 16).rotateX(Math.PI / 2), this.matMarioYellow);
    yL.position.set(0, 3.2, 0.24);
    tl.add(yL);

    const gL = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.06, 16).rotateX(Math.PI / 2), this.matMarioGreen);
    gL.position.set(0, 2.7, 0.24);
    tl.add(gL);

    parent.add(tl);
    this.addCollider(x - 0.4, x + 0.4, z - 0.4, z + 0.4, 'Lampu_Isyarat');
  }

  private createRoadSign(text: string, colorHex: string, x: number, y: number, z: number): THREE.Group {
    const sign = new THREE.Group();
    sign.position.set(x, y, z);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 12), this.matWhite);
    pole.position.y = 1.4;
    sign.add(pole);

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.9, 0.08),
      new THREE.MeshStandardMaterial({ map: createTextSignTexture(text, colorHex, '#FFFFFF'), roughness: 0.4 })
    );
    board.position.set(0, 2.2, 0);
    sign.add(board);

    this.addCollider(x - 0.4, x + 0.4, z - 0.4, z + 0.4, 'Papan_Tanda');
    return sign;
  }

  // Resolve collision with smooth sliding push-out
  public resolvePosition(x: number, z: number, radius: number = 0.4): { x: number; z: number; collided: boolean } {
    let curX = x;
    let curZ = z;
    let hasCollided = false;

    for (let iter = 0; iter < 2; iter++) {
      for (const c of this.colliders) {
        const closestX = Math.max(c.minX, Math.min(curX, c.maxX));
        const closestZ = Math.max(c.minZ, Math.min(curZ, c.maxZ));

        const dx = curX - closestX;
        const dz = curZ - closestZ;
        const distSq = dx * dx + dz * dz;

        if (distSq < radius * radius) {
          hasCollided = true;
          const dist = Math.sqrt(distSq);
          if (dist > 0.001) {
            const overlap = radius - dist;
            curX += (dx / dist) * overlap;
            curZ += (dz / dist) * overlap;
          } else {
            const distLeft = curX - c.minX;
            const distRight = c.maxX - curX;
            const distTop = curZ - c.minZ;
            const distBottom = c.maxZ - curZ;
            const minDist = Math.min(distLeft, distRight, distTop, distBottom);
            if (minDist === distLeft) curX = c.minX - radius;
            else if (minDist === distRight) curX = c.maxX + radius;
            else if (minDist === distTop) curZ = c.minZ - radius;
            else curZ = c.maxZ + radius;
          }
        }
      }
    }

    return { x: curX, z: curZ, collided: hasCollided };
  }

  public testCollision(x: number, z: number, radius: number = 0.5): boolean {
    return this.resolvePosition(x, z, radius).collided;
  }
}
