import Phaser from 'phaser';

// Simple tegninger af landskabet. Hver funktion tegner omkring (0, 0), hvor y er bunden.

export function drawHill(scene: Phaser.Scene, x: number, y: number, width: number, height: number, color = 0xa3b18a) {
  return scene.add.graphics({ x, y }).fillStyle(color).fillEllipse(0, 0, width, height);
}

export function drawAcacia(scene: Phaser.Scene, x: number, y: number, scale = 1) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0x6b4423).fillRect(-8, -110, 16, 110);
  g.lineStyle(10, 0x6b4423).lineBetween(0, -80, -45, -125).lineBetween(0, -90, 40, -125);
  g.fillStyle(0x52734d).fillEllipse(0, -135, 230, 45).fillEllipse(-45, -125, 120, 35).fillEllipse(50, -128, 130, 35);
  return g.setScale(scale);
}

export function drawBush(scene: Phaser.Scene, x: number, y: number, scale = 1) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0x6a994e).fillEllipse(-40, 0, 110, 70).fillEllipse(30, -10, 120, 85).fillEllipse(80, 5, 90, 60);
  return g.setScale(scale);
}

// Vandhul med mudret bred. (x, y) er midten af vandet.
export function drawWaterhole(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0xc9a96e).fillEllipse(0, 0, width + 30, height + 16);
  g.fillStyle(0x5fa8d3).fillEllipse(0, 0, width, height);
  g.fillStyle(0x9ccfe8).fillEllipse(-width * 0.15, -height * 0.15, width * 0.5, height * 0.35);
  return g;
}

// Iskiosk med stribet markise
export function drawKiosk(scene: Phaser.Scene, x: number, y: number) {
  const g = scene.add.graphics();
  g.fillStyle(0xffffff).fillRect(-110, -160, 220, 160);
  g.fillStyle(0xf4a6c1).fillRect(-110, -60, 220, 60);
  const stripes = 6;
  const stripeWidth = 260 / stripes;
  for (let i = 0; i < stripes; i++) {
    g.fillStyle(i % 2 === 0 ? 0xe63946 : 0xffffff).fillRect(-130 + i * stripeWidth, -200, stripeWidth, 45);
  }
  const sign = scene.add.text(0, -240, '🍦', { fontSize: '70px', padding: { x: 6, y: 6 } }).setOrigin(0.5);
  return scene.add.container(x, y, [g, sign]);
}
