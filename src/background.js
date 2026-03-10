import { CANVAS_WIDTH, GROUND_Y } from './constants.js';
import { randomRange } from './utils.js';

export class ParallaxBackground {
  constructor() {
    this._layers = [
      { speedFactor: 0.1, offsetX: 0 },  // far skyline
      { speedFactor: 0.3, offsetX: 0 },  // mid buildings
      { speedFactor: 0.6, offsetX: 0 },  // near ground details
    ];

    // Stars
    this._stars = [];
    for (let i = 0; i < 60; i++) {
      this._stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * (GROUND_Y - 40),
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Pre-generate building patterns
    this._skylinePattern = [60, 95, 45, 115, 70, 55, 100, 40, 85, 65, 105, 50, 78, 88];
    this._buildingPattern = [40, 58, 32, 68, 52, 28, 48, 62, 35, 55];

    this._frameCount = 0;
  }

  update(gameSpeed) {
    this._frameCount++;
    for (const layer of this._layers) {
      layer.offsetX += gameSpeed * layer.speedFactor;
    }
    // Stars scroll very slowly
    for (const star of this._stars) {
      star.x -= star.speed * (gameSpeed / 5);
      if (star.x < 0) {
        star.x = CANVAS_WIDTH;
        star.y = Math.random() * (GROUND_Y - 40);
      }
    }
  }

  draw(ctx) {
    // Stars (furthest back)
    for (const star of this._stars) {
      const flicker = 0.5 + Math.sin(this._frameCount * 0.05 + star.phase) * 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + flicker * 0.5})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Layer 0: Far skyline
    this._drawSkyline(ctx, this._layers[0].offsetX);

    // Layer 1: Mid buildings
    this._drawBuildings(ctx, this._layers[1].offsetX);

    // Layer 2: Near ground details
    this._drawGroundDetails(ctx, this._layers[2].offsetX);
  }

  _drawSkyline(ctx, offset) {
    const pat = this._skylinePattern;
    const bw = 50;
    const totalW = pat.length * bw;

    for (let x = -(offset % totalW) - bw; x < CANVAS_WIDTH + bw; x += bw) {
      const idx = Math.floor(((x + offset) % totalW + totalW) / bw) % pat.length;
      const h = pat[idx];

      // Building silhouette
      ctx.fillStyle = '#111128';
      ctx.fillRect(x, GROUND_Y - h, bw - 5, h);

      // Occasional windows
      if (h > 60) {
        ctx.fillStyle = 'rgba(0, 212, 255, 0.04)';
        for (let wy = GROUND_Y - h + 12; wy < GROUND_Y - 12; wy += 16) {
          ctx.fillRect(x + 8, wy, 4, 6);
          ctx.fillRect(x + 22, wy, 4, 6);
          if (bw > 40) ctx.fillRect(x + 36, wy, 4, 6);
        }
      }

      // Antenna on tall buildings
      if (h > 90) {
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + bw / 2 - 2, GROUND_Y - h);
        ctx.lineTo(x + bw / 2 - 2, GROUND_Y - h - 15);
        ctx.stroke();
        // Blinking light
        if (this._frameCount % 60 < 30) {
          ctx.fillStyle = 'rgba(255, 50, 50, 0.3)';
          ctx.beginPath();
          ctx.arc(x + bw / 2 - 2, GROUND_Y - h - 15, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  _drawBuildings(ctx, offset) {
    const pat = this._buildingPattern;
    const bw = 70;
    const totalW = pat.length * bw;

    for (let x = -(offset % totalW) - bw; x < CANVAS_WIDTH + bw; x += bw) {
      const idx = Math.floor(((x + offset) % totalW + totalW) / bw) % pat.length;
      const h = pat[idx];

      ctx.fillStyle = '#0d0d22';
      ctx.fillRect(x, GROUND_Y - h, bw - 10, h);

      // Windows
      ctx.fillStyle = 'rgba(0, 212, 255, 0.06)';
      for (let wy = GROUND_Y - h + 8; wy < GROUND_Y - 8; wy += 13) {
        for (let wx = x + 6; wx < x + bw - 16; wx += 15) {
          ctx.fillRect(wx, wy, 6, 5);
        }
      }
    }
  }

  _drawGroundDetails(ctx, offset) {
    const lampSpacing = 200;
    const totalW = lampSpacing * 5;

    for (let x = -(offset % totalW); x < CANVAS_WIDTH + lampSpacing; x += lampSpacing) {
      // Lamp post
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y);
      ctx.lineTo(x, GROUND_Y - 28);
      ctx.lineTo(x + 8, GROUND_Y - 28);
      ctx.stroke();

      // Lamp glow
      ctx.fillStyle = 'rgba(0, 212, 255, 0.04)';
      ctx.beginPath();
      ctx.arc(x + 8, GROUND_Y - 28, 10, 0, Math.PI * 2);
      ctx.fill();

      // Ground cracks between lamps
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 60, GROUND_Y + 5);
      ctx.lineTo(x + 75, GROUND_Y + 12);
      ctx.lineTo(x + 90, GROUND_Y + 8);
      ctx.stroke();
    }
  }
}
