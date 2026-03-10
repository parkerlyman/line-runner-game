const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

// --- Game state ---
let game = {
  running: false,
  score: 0,
  bestScore: parseInt(localStorage.getItem('lineRunnerBest')) || 0,
  speed: 5,
  frameCount: 0,
};

// --- Player ---
const player = {
  x: 120,
  y: 0,
  width: 30,
  height: 40,
  velocityY: 0,
  grounded: true,
  jumpForce: -13,
  gravity: 0.6,
  color: '#00d4ff',
  groundY: 0, // set on init
};

// --- Ground ---
const GROUND_Y = canvas.height - 60;

// --- Obstacles ---
let obstacles = [];

function spawnObstacle() {
  const types = [
    { width: 20, height: 40 },  // short spike
    { width: 20, height: 60 },  // tall spike
    { width: 40, height: 30 },  // wide block
  ];
  const type = types[Math.floor(Math.random() * types.length)];
  obstacles.push({
    x: canvas.width + 20,
    y: GROUND_Y - type.height,
    width: type.width,
    height: type.height,
  });
}

// --- Particles ---
let particles = [];

function spawnRunParticles() {
  if (!player.grounded) return;
  particles.push({
    x: player.x,
    y: GROUND_Y,
    vx: -Math.random() * 2 - 1,
    vy: -Math.random() * 2,
    life: 20,
    maxLife: 20,
    size: Math.random() * 3 + 1,
  });
}

function spawnJumpParticles() {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: player.x + player.width / 2,
      y: GROUND_Y,
      vx: (Math.random() - 0.5) * 6,
      vy: -Math.random() * 4 - 1,
      life: 25,
      maxLife: 25,
      size: Math.random() * 4 + 2,
    });
  }
}

function spawnDeathParticles() {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: player.x + player.width / 2,
      y: player.y + player.height / 2,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      life: 40,
      maxLife: 40,
      size: Math.random() * 5 + 2,
    });
  }
}

// --- Stars (background) ---
const stars = [];
for (let i = 0; i < 60; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * (GROUND_Y - 20),
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 0.5 + 0.2,
    brightness: Math.random(),
  });
}

// --- Input ---
let jumpPressed = false;

function handleJump() {
  if (!game.running) return;
  if (player.grounded) {
    player.velocityY = player.jumpForce;
    player.grounded = false;
    spawnJumpParticles();
  }
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    handleJump();
  }
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handleJump();
});

canvas.addEventListener('click', handleJump);

// --- UI ---
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const finalScoreEl = document.getElementById('final-score');
const bestScoreEl = document.getElementById('best-score');

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

function startGame() {
  // Reset state
  game.running = true;
  game.score = 0;
  game.speed = 5;
  game.frameCount = 0;
  player.y = GROUND_Y - player.height;
  player.velocityY = 0;
  player.grounded = true;
  obstacles = [];
  particles = [];

  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');

  gameLoop();
}

function gameOver() {
  game.running = false;
  spawnDeathParticles();

  if (game.score > game.bestScore) {
    game.bestScore = game.score;
    localStorage.setItem('lineRunnerBest', game.bestScore);
  }

  finalScoreEl.textContent = game.score;
  bestScoreEl.textContent = game.bestScore;

  // Small delay before showing game over screen
  setTimeout(() => {
    gameOverScreen.classList.remove('hidden');
  }, 500);
}

// --- Collision detection ---
function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

// --- Update ---
function update() {
  game.frameCount++;

  // Increase speed over time
  game.speed = 5 + game.frameCount * 0.002;

  // Score
  if (game.frameCount % 6 === 0) {
    game.score++;
  }

  // Player physics
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  if (player.y >= GROUND_Y - player.height) {
    player.y = GROUND_Y - player.height;
    player.velocityY = 0;
    player.grounded = true;
  }

  // Spawn obstacles
  const minGap = Math.max(60, 100 - game.speed * 2);
  if (game.frameCount % Math.floor(Math.max(minGap, 80 - game.speed)) === 0) {
    spawnObstacle();
  }

  // Update obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    obstacles[i].x -= game.speed;

    // Collision
    if (checkCollision(player, obstacles[i])) {
      gameOver();
      return;
    }

    // Remove off-screen
    if (obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1);
    }
  }

  // Run particles
  if (game.frameCount % 3 === 0) {
    spawnRunParticles();
  }

  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }

  // Update stars
  for (const star of stars) {
    star.x -= star.speed * (game.speed / 5);
    if (star.x < 0) {
      star.x = canvas.width;
      star.y = Math.random() * (GROUND_Y - 20);
    }
  }
}

// --- Draw ---
function draw() {
  // Background
  ctx.fillStyle = '#0a0a1e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stars
  for (const star of stars) {
    const flicker = 0.5 + Math.sin(game.frameCount * 0.05 + star.brightness * 10) * 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + flicker * 0.7})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ground line
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(canvas.width, GROUND_Y);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Ground grid lines (scrolling)
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
  ctx.lineWidth = 1;
  const gridOffset = (game.frameCount * game.speed) % 40;
  for (let x = -gridOffset; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x - 30, canvas.height);
    ctx.stroke();
  }

  // Particles
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Player
  ctx.fillStyle = player.color;
  ctx.shadowColor = player.color;
  ctx.shadowBlur = 15;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  // Player eye
  ctx.fillStyle = '#0a0a1e';
  ctx.shadowBlur = 0;
  ctx.fillRect(player.x + 18, player.y + 10, 8, 8);
  // Player glow outline
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);

  // Obstacles
  for (const obs of obstacles) {
    ctx.fillStyle = '#ff4757';
    ctx.shadowColor = '#ff4757';
    ctx.shadowBlur = 10;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    // Obstacle top highlight
    ctx.fillStyle = '#ff6b81';
    ctx.fillRect(obs.x, obs.y, obs.width, 4);
    ctx.shadowBlur = 0;
  }

  // Score
  ctx.fillStyle = '#fff';
  ctx.font = '20px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`Score: ${game.score}`, canvas.width - 20, 35);

  // Speed indicator
  ctx.fillStyle = '#666';
  ctx.font = '12px monospace';
  ctx.fillText(`Speed: ${game.speed.toFixed(1)}`, canvas.width - 20, 55);
}

// --- Game loop ---
function gameLoop() {
  if (!game.running) {
    draw(); // Draw one more frame (death particles)
    return;
  }
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Initial draw
player.y = GROUND_Y - player.height;
draw();
