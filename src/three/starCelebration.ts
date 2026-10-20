import * as THREE from 'three';

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  rotSpeed: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class StarCelebration {
  public group: THREE.Group;
  private particles: Particle[] = [];
  private starGeometry: THREE.BufferGeometry;
  private coinGeometry: THREE.BufferGeometry;
  private starMaterial: THREE.MeshStandardMaterial;
  private coinMaterial: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();

    // 1. Super Star 5-pointed shape
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.28;
    const innerRadius = 0.12;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    this.starGeometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });

    this.starMaterial = new THREE.MeshStandardMaterial({
      color: 0xFACC15,
      emissive: 0xF59E0B,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.4,
    });

    // 2. Mario Golden Coin Geometry
    this.coinGeometry = new THREE.CylinderGeometry(0.22, 0.22, 0.05, 16);
    this.coinGeometry.rotateX(Math.PI / 2);
    this.coinMaterial = new THREE.MeshStandardMaterial({
      color: 0xFDE047,
      emissive: 0xEAB308,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.6,
    });
  }

  public burst(pos: THREE.Vector3, count: number = 20) {
    for (let i = 0; i < count; i++) {
      const isCoin = i % 2 === 0;
      const geo = isCoin ? this.coinGeometry : this.starGeometry;
      const mat = isCoin ? this.coinMaterial : this.starMaterial;

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.scale.setScalar(0.8 + Math.random() * 0.5);

      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 3.5;
      const up = 2.5 + Math.random() * 3.5;

      const particle: Particle = {
        mesh,
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          up,
          Math.sin(angle) * speed
        ),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        ),
        life: 0,
        maxLife: 1.2 + Math.random() * 0.5,
      };

      this.group.add(mesh);
      this.particles.push(particle);
    }
  }

  public update(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;
      if (p.life >= p.maxLife) {
        this.group.remove(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }

      p.velocity.y -= 8.5 * delta;
      p.mesh.position.addScaledVector(p.velocity, delta);

      p.mesh.rotation.x += p.rotSpeed.x * delta;
      p.mesh.rotation.y += p.rotSpeed.y * delta;
      p.mesh.rotation.z += p.rotSpeed.z * delta;

      const progress = p.life / p.maxLife;
      const s = Math.max(0, 1 - progress);
      p.mesh.scale.setScalar(s);
    }
  }
}
