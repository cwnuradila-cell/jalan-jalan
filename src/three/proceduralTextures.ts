import * as THREE from 'three';

// Procedural Canvas Textures for Mario World & Clay aesthetic
export function createCobblestoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FEF08A'; // Sunny Mario path
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = '#FDE047';
  const size = 64;
  for (let y = 0; y < 512; y += size) {
    const offsetX = (Math.floor(y / size) % 2 === 0) ? 0 : size / 2;
    for (let x = -size; x < 512 + size; x += size) {
      ctx.beginPath();
      ctx.roundRect(x + offsetX + 4, y + 4, size - 8, size - 8, 14);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Iconic Mario Question Mark Block (?)
export function createQuestionBlockTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Golden orange body
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(0, 0, 256, 256);

  // Beveled inner box
  ctx.fillStyle = '#FBBF24';
  ctx.fillRect(16, 16, 224, 224);

  // Dark border
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 242, 242);

  // 4 Corner bolts/rivets
  ctx.fillStyle = '#78350F';
  const bolts = [[26, 26], [230, 26], [26, 230], [230, 230]];
  bolts.forEach(([bx, by]) => {
    ctx.beginPath();
    ctx.arc(bx, by, 7, 0, Math.PI * 2);
    ctx.fill();
  });

  // White Question Mark with dark drop shadow
  ctx.font = '900 150px "Fredoka", "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Shadow
  ctx.fillStyle = '#78350F';
  ctx.fillText('?', 134, 134);

  // Front face
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('?', 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Iconic Mario Brick Block
export function createBrickBlockTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#9A3412'; // Brick border
  ctx.fillRect(0, 0, 256, 256);

  // 4 horizontal brick rows
  ctx.fillStyle = '#C2410C';
  const rows = 4;
  const h = 256 / rows;

  for (let r = 0; r < rows; r++) {
    const y = r * h;
    const isEven = r % 2 === 0;
    const w1 = isEven ? 120 : 60;
    const w2 = isEven ? 120 : 120;
    const w3 = isEven ? 0 : 60;

    // Row 1
    ctx.fillRect(6, y + 4, w1 - 8, h - 8);
    ctx.fillRect(w1 + 6, y + 4, w2 - 8, h - 8);
    if (w3 > 0) ctx.fillRect(w1 + w2 + 6, y + 4, w3 - 8, h - 8);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Mario Kart Checkered Crossing / Road
export function createZebraCrossingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1E293B';
  ctx.fillRect(0, 0, 512, 256);

  // Crisp Mario Kart Checkered Stripes
  const size = 32;
  for (let y = 16; y < 240; y += size) {
    for (let x = 16; x < 496; x += size) {
      if ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) {
        ctx.fillStyle = '#FFFFFF';
      } else {
        ctx.fillStyle = '#DC2626'; // Red and white racing curbs!
      }
      ctx.fillRect(x, y, size, size);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Super Mushroom Spots Texture
export function createMushroomCapTexture(baseColorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseColorHex;
  ctx.fillRect(0, 0, 512, 512);

  // Big white spots
  ctx.fillStyle = '#FFFFFF';
  const spots = [
    [256, 120, 80],
    [100, 256, 65],
    [412, 256, 65],
    [180, 400, 70],
    [332, 400, 70],
  ];

  spots.forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Mario Cloud with Cute Smiling Eyes
export function createCloudFaceTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 128);

  // Two cute vertical pill eyes
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.roundRect(85, 35, 16, 44, 8);
  ctx.roundRect(155, 35, 16, 44, 8);
  ctx.fill();

  // Eye shines
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(93, 45, 4, 0, Math.PI * 2);
  ctx.arc(163, 45, 4, 0, Math.PI * 2);
  ctx.fill();

  // Smiling mouth
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(128, 70, 18, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // Cheerful rosy cheeks
  ctx.fillStyle = '#FB7185';
  ctx.beginPath();
  ctx.arc(65, 68, 10, 0, Math.PI * 2);
  ctx.arc(191, 68, 10, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createClockTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 12;
  ctx.stroke();

  ctx.fillStyle = '#1E293B';
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const x = 128 + Math.cos(angle) * 90;
    const y = 128 + Math.sin(angle) * 90;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hands
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(128, 55);
  ctx.stroke();

  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(128, 128);
  ctx.lineTo(75, 160);
  ctx.stroke();

  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(128, 128, 10, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createTextSignTexture(
  text: string,
  bgColor: string,
  textColor: string,
  subtext?: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Chunky Mario rounded banner
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(10, 10, 492, 236, 32);
  ctx.fill();

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 10;
  ctx.stroke();

  // Dark outline
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, 480, 224);

  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 42px "Fredoka", "Arial Black", sans-serif';
  ctx.fillText(text, 256, subtext ? 100 : 128);

  if (subtext) {
    ctx.font = '800 24px "Fredoka", sans-serif';
    ctx.fillStyle = '#FEF08A';
    ctx.fillText(subtext, 256, 170);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Mario World Center Compass Rose
export function createCompassRoseTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.arc(256, 256, 240, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 14;
  ctx.stroke();

  // Center Super Star
  const points = 5;
  const outer = 95;
  const inner = 45;
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const x = 256 + Math.cos(a) * r;
    const y = 256 + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Star cute oval eyes
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.roundRect(242, 238, 8, 24, 4);
  ctx.roundRect(262, 238, 8, 24, 4);
  ctx.fill();

  // Labels
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 34px "Fredoka", sans-serif';

  ctx.fillStyle = '#DC2626';
  ctx.fillText('⭐ U : SEKOLAH', 256, 75);

  ctx.fillStyle = '#2563EB';
  ctx.fillText('🚦 S : JALAN RAYA', 256, 440);

  ctx.fillStyle = '#059669';
  ctx.fillText('🍄 T : RUMAH', 400, 256);

  ctx.fillStyle = '#EC4899';
  ctx.fillText('⭐ B : TAMAN', 110, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
