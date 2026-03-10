import { ObjectPool } from './pool.js';
import { CANVAS_WIDTH, GROUND_Y, OBSTACLE_TIERS } from './constants.js';
import { aabbCollision } from './utils.js';

// Obstacle type definitions per tier
const GROUND_TYPES = [
  { width: 20, height: 40 },   // short spike
  { width: 20, height: 60 },   // tall spike
  { width: 40, height: 30 },   // wide block
];

const AERIAL_TYPE = { width: 60, height: 18, aerial: true, y: GROUND_Y - 55 };
const DOUBLE_GROUND = 'double';
const COMBO_TYPE = 'combo'; // aerial + ground together

export class ObstacleManager {
  constructor() {
    this._pool = new ObjectPool(
      () => ({
        x: 0, y: 0, width: 0, height: 0,
        type: null, tier: 0, color: '', glowColor: '',
        passed: false, aerial: false,
      }),
      (o) => {
        o.x = 0; o.y = 0; o.width = 0; o.height = 0;
        o.passed = false; o.aerial = false;
      },
      15
    );
    this._spawnTimer = 0;
    this._lastSpawnX = CANVAS_WIDTH;
  }

  update(gameSpeed, playerHitbox, distance) {
    this._spawnTimer++;
    const minGap = Math.max(55, 90 - gameSpeed * 2);
    if (this._spawnTimer >= minGap) {
      this._spawnTimer = 0;
      this._spawn(distance, gameSpeed);
    }

    let collision = false;
    const nearMisses = [];

    this._pool.updateAndSweep((obs) => {
      obs.x -= gameSpeed;

      // Check collision
      if (aabbCollision(playerHitbox, obs)) {
        collision = true;
      }

      // Check if obstacle just passed behind player
      if (!obs.passed && obs.x + obs.width < playerHitbox.x) {
        obs.passed = true;
        // Calculate near-miss distance
        const dx = playerHitbox.x - (obs.x + obs.width);
        let dy;
        if (obs.aerial) {
          // For aerial: vertical distance from player top to obstacle bottom
          dy = Math.abs((playerHitbox.y + playerHitbox.height) - obs.y);
        } else {
          // For ground: vertical distance from player bottom to obstacle top
          dy = Math.abs(playerHitbox.y - obs.y);
        }
        const missDistance = Math.min(dx, dy);
        nearMisses.push({ distance: missDistance });
      }

      // Remove if off-screen
      return obs.x + obs.width < -20;
    });

    return { collision, nearMisses };
  }

  _spawn(distance, gameSpeed) {
    // Determine current tier
    let maxTier = 0;
    for (let i = OBSTACLE_TIERS.length - 1; i >= 0; i--) {
      if (distance >= OBSTACLE_TIERS[i].minDistance) {
        maxTier = i;
        break;
      }
    }

    const tierInfo = OBSTACLE_TIERS[Math.min(maxTier, OBSTACLE_TIERS.length - 1)];
    const roll = Math.random();

    if (maxTier >= 3 && roll < 0.15) {
      // Tier 4: aerial + ground combo
      this._spawnGround(tierInfo, gameSpeed);
      this._spawnAerial(tierInfo, 40);
    } else if (maxTier >= 2 && roll < 0.2) {
      // Tier 3: double ground obstacle
      this._spawnGround(tierInfo, gameSpeed);
      this._spawnGround(tierInfo, gameSpeed, 50);
    } else if (maxTier >= 1 && roll < 0.3) {
      // Tier 2+: aerial obstacle
      this._spawnAerial(tierInfo, 0);
    } else {
      // Standard ground obstacle
      this._spawnGround(tierInfo, gameSpeed);
    }
  }

  _spawnGround(tierInfo, gameSpeed, extraOffset = 0) {
    const type = GROUND_TYPES[Math.floor(Math.random() * GROUND_TYPES.length)];
    const obs = this._pool.acquire();
    obs.x = CANVAS_WIDTH + 20 + extraOffset;
    obs.y = GROUND_Y - type.height;
    obs.width = type.width;
    obs.height = type.height;
    obs.color = tierInfo.color;
    obs.glowColor = tierInfo.glowColor;
    obs.aerial = false;
    obs.passed = false;
  }

  _spawnAerial(tierInfo, extraOffset) {
    const obs = this._pool.acquire();
    obs.x = CANVAS_WIDTH + 20 + extraOffset;
    obs.y = GROUND_Y - 55;
    obs.width = AERIAL_TYPE.width;
    obs.height = AERIAL_TYPE.height;
    obs.color = tierInfo.color;
    obs.glowColor = tierInfo.glowColor;
    obs.aerial = true;
    obs.passed = false;
  }

  draw(ctx) {
    for (const obs of this._pool.active) {
      ctx.fillStyle = obs.color;
      ctx.shadowColor = obs.color;
      ctx.shadowBlur = 10;
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      // Top highlight
      ctx.fillStyle = obs.glowColor;
      ctx.fillRect(obs.x, obs.y, obs.width, 3);
      ctx.shadowBlur = 0;

      // Aerial indicator: small down arrows
      if (obs.aerial) {
        ctx.fillStyle = obs.color;
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('▼ DUCK ▼', obs.x + obs.width / 2, obs.y - 5);
      }
    }
    ctx.textAlign = 'left';
  }

  releaseAll() {
    this._pool.releaseAll();
    this._spawnTimer = 0;
  }
}
