const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector("#scoreEl");
const startGameBtn = document.querySelector("#startGameBtn");
const modalEl = document.querySelector("#modalEl");
const bigScoreEl = document.querySelector("#bigScoreEl");

const x = canvas.width / 2;
const y = canvas.height / 2;


let player = new Player(x, y, 15, "white");
let projectiles = [];
let enemies = [];
let particles = [];

function init() {
  player = new Player(x, y, 15, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  scoreEl.innerHTML = score;
  bigScoreEl.innerHTML = score;
}
let enemySpawnRate = 1000; // Default spawn rate: 1 second
let projectileSpeedFactor = 4.5;

function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * 33 + 8;

    let x;
    let y;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

    let speedFactor = 0.9;
    const velocity = {
      x: Math.cos(angle) * speedFactor,
      y: Math.sin(angle) * speedFactor,
    };
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, enemySpawnRate);
}

let animationId;
let score = 0;
function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(0,0,0,0.08)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  });
  projectiles.forEach((projectile, projectileIndex) => {
    projectile.update();

    //remove from edges of screen
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(projectileIndex, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, enemyIndex) => {
    enemy.update();

    //dist between player and enemy
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    //ends the game
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId);
      modalEl.style.display = "flex";
      bigScoreEl.innerHTML = score;
    }

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      //when projectiles touch enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        //create explosions
        for (let index = 0; index < enemy.radius * 2; index++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 8),
                y: (Math.random() - 0.5) * (Math.random() * 8),
              }
            )
          );
        }
        if (enemy.radius - 10 > 10) {
          //increases score
          score += 100;
          scoreEl.innerHTML = score;

          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });

          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          //remove from scene altogether
          score += 250;
          scoreEl.innerHTML = score;
          setTimeout(() => {
            enemies.splice(enemyIndex, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  });
}

startGameBtn.addEventListener("click", () => {
  enemySpawnRate = 1000;
  projectileSpeedFactor = 4.5; // Double projectile speed for Easy Mode
  init();
  animate();
  spawnEnemies();
  modalEl.style.display = "none";
});

// Event listener for Easy Mode button
document.getElementById("easyModeBtn").addEventListener("click", () => {
  enemySpawnRate = 2000; // Change spawn rate to 2 seconds
  projectileSpeedFactor = 6.5; // Increases projectile speed for Easy Mode
  init();
  animate();
  spawnEnemies();
  modalEl.style.display = "none";
});
