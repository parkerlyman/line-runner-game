import {
  PLAYER_X, PLAYER_WIDTH, PLAYER_HEIGHT,
  DUCK_WIDTH, DUCK_HEIGHT, GROUND_Y,
  GRAVITY, JUMP_FORCE, DOUBLE_JUMP_FORCE, FAST_FALL_ACCEL,
  TRAIL_SPEED_THRESHOLD, COLORS,
} from './constants.js';

export class Player {
  constructor(spriteSheet) {
    this._sprite = spriteSheet;
    this.x = PLAYER_X;
    this.y = GROUND_Y - PLAYER_HEIGHT;
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
    this.velocityY = 0;
    this.grounded = true;
    this.isDucking = false;
    this.hasDoubleJump = true;
    this.animState = 'run';
    this.animFrame = 0;
    this.animTimer = 0;
  }

  jump() {
    if (this.grounded) {
      this.velocityY = JUMP_FORCE;
      this.grounded = false;
      this.hasDoubleJump = true;
      this.isDucking = false;
      this.width = PLAYER_WIDTH;
      this.height = PLAYER_HEIGHT;
      this.animState = 'jump';
      this.animFrame = 0;
      return 'jump';
    } else if (this.hasDoubleJump) {
      this.velocityY = DOUBLE_JUMP_FORCE;
      this.hasDoubleJump = false;
      this.animFrame = 0;
      return 'doubleJump';
    }
    return null;
  }

  duck(active) {
    if (active) {
      if (this.grounded) {
        this.isDucking = true;
        this.width = DUCK_WIDTH;
        this.height = DUCK_HEIGHT;
        this.y = GROUND_Y - DUCK_HEIGHT;
        this.animState = 'duck';
        this.animFrame = 0;
      } else {
        // Fast-fall when pressing down in air
        this.velocityY += FAST_FALL_ACCEL;
      }
    } else {
      if (this.isDucking) {
        this.isDucking = false;
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
        this.y = GROUND_Y - PLAYER_HEIGHT;
        this.animState = this.grounded ? 'run' : 'jump';
        this.animFrame = 0;
      }
    }
  }

  update(gameSpeed) {
    // Gravity
    this.velocityY += GRAVITY;
    this.y += this.velocityY;

    // Ground check
    const groundLevel = this.isDucking ? GROUND_Y - DUCK_HEIGHT : GROUND_Y - PLAYER_HEIGHT;
    if (this.y >= groundLevel) {
      this.y = groundLevel;
      this.velocityY = 0;
      const wasAirborne = !this.grounded;
      this.grounded = true;
      this.hasDoubleJump = true;
      if (wasAirborne && !this.isDucking) {
        this.animState = 'run';
        this.animFrame = 0;
      }
    }

    // Animation
    this.animTimer++;
    let duration = this._sprite.getFrameDuration(this.animState);
    // Speed up run animation with game speed
    if (this.animState === 'run') {
      duration = Math.max(3, Math.floor(duration - (gameSpeed - 5) * 0.3));
    }
    if (this.animTimer >= duration) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % this._sprite.getFrameCount(this.animState);
    }
  }

  draw(ctx, gameSpeed) {
    // Trail/afterimage at high speed
    if (gameSpeed > TRAIL_SPEED_THRESHOLD) {
      const trailCount = Math.min(Math.floor((gameSpeed - TRAIL_SPEED_THRESHOLD) / 2) + 1, 4);
      for (let i = trailCount; i >= 1; i--) {
        ctx.globalAlpha = 0.08 * (trailCount - i + 1) / trailCount;
        this._sprite.drawFrame(ctx, this.animState, this.animFrame, this.x - i * 8, this.y);
      }
      ctx.globalAlpha = 1.0;
    }

    // Glow
    ctx.shadowColor = COLORS.NEON_BLUE;
    ctx.shadowBlur = 12;
    this._sprite.drawFrame(ctx, this.animState, this.animFrame, this.x, this.y);
    ctx.shadowBlur = 0;

    // Glow outline
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
  }

  getHitbox() {
    return {
      x: this.x + 2,
      y: this.y + 2,
      width: this.width - 4,
      height: this.height - 4,
    };
  }

  reset() {
    this.y = GROUND_Y - PLAYER_HEIGHT;
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
    this.velocityY = 0;
    this.grounded = true;
    this.isDucking = false;
    this.hasDoubleJump = true;
    this.animState = 'run';
    this.animFrame = 0;
    this.animTimer = 0;
  }
}
