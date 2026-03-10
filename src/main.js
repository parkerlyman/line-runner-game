import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, BASE_SPEED, SPEED_INCREMENT, COIN_SCORE, COLORS } from './constants.js';
import { GameStateMachine, GameState } from './state.js';
import { InputManager } from './input.js';
import { SpriteSheet } from './sprite.js';
import { Player } from './player.js';
import { ObstacleManager } from './obstacles.js';
import { CoinManager } from './coins.js';
import { ParticlePool } from './particles.js';
import { ParallaxBackground } from './background.js';
import { ComboSystem } from './combo.js';
import { MilestoneSystem } from './milestones.js';
import { AudioManager } from './audio.js';
import { HUD } from './hud.js';
import { Leaderboard } from './leaderboard.js';
import { UIManager } from './ui.js';
import { ScreenShake } from './screenshake.js';

// --- Canvas Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// --- Instantiate Systems ---
const stateMachine = new GameStateMachine();
const input = new InputManager(canvas);
const sprite = new SpriteSheet();
const player = new Player(sprite);
const obstacles = new ObstacleManager();
const coins = new CoinManager();
const particles = new ParticlePool();
const background = new ParallaxBackground();
const combo = new ComboSystem();
const milestones = new MilestoneSystem();
const audio = new AudioManager();
const shake = new ScreenShake();
const hud = new HUD();
const leaderboard = new Leaderboard();
const ui = new UIManager(stateMachine, leaderboard, audio);

// --- Game State ---
let gameSpeed = BASE_SPEED;
let distance = 0;
let score = 0;
let coinCount = 0;
let frameCount = 0;
let milestoneSpeedBonus = 0;
let wasAirborne = false;

// --- Wire UI start callback ---
ui.onStart = () => {
  audio.init();
  resetGame();
  audio.startBeat();
};

function resetGame() {
  gameSpeed = BASE_SPEED;
  distance = 0;
  score = 0;
  coinCount = 0;
  frameCount = 0;
  milestoneSpeedBonus = 0;
  wasAirborne = false;
  player.reset();
  obstacles.releaseAll();
  coins.releaseAll();
  particles.releaseAll();
  combo.reset();
  milestones.reset();
}

// --- Input Bindings ---
input.on('jump', () => {
  if (stateMachine.current !== GameState.PLAYING) return;
  const result = player.jump();
  if (result === 'jump') {
    audio.playJump();
    particles.spawnJumpBurst(player.x, player.y, player.width);
  }
  if (result === 'doubleJump') {
    audio.playDoubleJump();
    particles.spawnJumpBurst(player.x, player.y, player.width);
  }
});

input.on('duckStart', () => {
  if (stateMachine.current !== GameState.PLAYING) return;
  player.duck(true);
});

input.on('duckEnd', () => {
  if (stateMachine.current !== GameState.PLAYING) return;
  player.duck(false);
});

input.on('pause', () => {
  if (stateMachine.current === GameState.PLAYING) {
    stateMachine.transition(GameState.PAUSED);
    audio.stopBeat();
  } else if (stateMachine.current === GameState.PAUSED) {
    stateMachine.transition(GameState.PLAYING);
    audio.startBeat();
  }
});

// --- State Machine Callbacks ---
stateMachine.onEnter(GameState.GAME_OVER, () => {
  shake.trigger(10, 25);
  audio.playDeath();
  audio.stopBeat();
  player.animState = 'death';
  player.animFrame = 0;
  particles.spawnDeath(player.x, player.y, player.width, player.height);
  const isNewBest = leaderboard.addScore(score, distance, coinCount);
  ui.showGameOver(score, distance, coinCount, isNewBest);
});

// --- Update ---
function update() {
  frameCount++;

  // Speed: base + gradual ramp + milestone bonuses
  gameSpeed = BASE_SPEED + frameCount * SPEED_INCREMENT + milestoneSpeedBonus;

  // Distance
  distance += gameSpeed * 0.1;

  // Milestones
  const speedBump = milestones.update(distance);
  if (speedBump > 0) {
    milestoneSpeedBonus += speedBump;
    audio.playMilestone();
  }

  // Player
  const prevGrounded = player.grounded;
  player.update(gameSpeed);

  // Landing detection
  if (!prevGrounded && player.grounded && wasAirborne) {
    audio.playLand();
    particles.spawnLandBurst(player.x, player.y, player.width);
  }
  wasAirborne = !player.grounded;

  // Run dust
  if (frameCount % 3 === 0) {
    particles.spawnRunDust(player.x, player.grounded);
  }

  // Obstacles
  const obstacleResult = obstacles.update(gameSpeed, player.getHitbox(), distance);
  if (obstacleResult.collision) {
    stateMachine.transition(GameState.GAME_OVER);
    return;
  }
  for (const miss of obstacleResult.nearMisses) {
    combo.registerDodge(miss.distance, performance.now());
    if (combo.multiplier > 1) {
      audio.playCombo();
    }
  }

  // Coins
  const coinResult = coins.update(gameSpeed, player.getHitbox());
  if (coinResult.collected > 0) {
    coinCount += coinResult.collected;
    audio.playCoin();
    for (const pos of coinResult.positions) {
      particles.spawnCoinCollect(pos.x, pos.y);
    }
  }

  // Score: distance-based + coin bonuses
  score = Math.floor(distance * combo.multiplier) + coinCount * COIN_SCORE;

  // Update systems
  combo.update();
  particles.update();
  background.update(gameSpeed);
  shake.update();
  audio.updateBeatSpeed(gameSpeed);
}

// --- Draw ---
function draw() {
  ctx.save();
  ctx.translate(shake.offsetX, shake.offsetY);

  // Background
  ctx.fillStyle = COLORS.BG_DARK;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  background.draw(ctx);

  // Ground line
  ctx.strokeStyle = COLORS.NEON_BLUE;
  ctx.lineWidth = 2;
  ctx.shadowColor = COLORS.NEON_BLUE;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Ground grid
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
  ctx.lineWidth = 1;
  const gridOffset = (frameCount * gameSpeed) % 40;
  for (let x = -gridOffset; x < CANVAS_WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x - 30, CANVAS_HEIGHT);
    ctx.stroke();
  }

  // Game objects
  particles.draw(ctx);
  coins.draw(ctx);
  obstacles.draw(ctx);
  player.draw(ctx, gameSpeed);

  // Milestone flash
  milestones.drawFlash(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.restore();

  // HUD (not affected by screen shake)
  if (stateMachine.current === GameState.PLAYING || stateMachine.current === GameState.PAUSED) {
    hud.draw(ctx, score, distance, coinCount, combo, gameSpeed);
  }
}

// --- Game Loop (always runs) ---
function gameLoop() {
  if (stateMachine.current === GameState.PLAYING) {
    update();
  }

  // Always draw (menu shows background, game-over shows death frame)
  if (stateMachine.current !== GameState.MENU || frameCount === 0) {
    // Slowly animate background even on menu
    if (stateMachine.current === GameState.MENU) {
      background.update(1);
    }
  }

  draw();
  requestAnimationFrame(gameLoop);
}

// --- Boot ---
requestAnimationFrame(gameLoop);
