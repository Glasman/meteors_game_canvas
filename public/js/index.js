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

let particles = [];

function init() {
  player = new Player(x, y, 15, "white");
  projectiles = [];
  
  particles = [];
  score = 0;
  scoreEl.innerHTML = score;
  bigScoreEl.innerHTML = score;
}

let projectileSpeedFactor = 4.5;



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


}

startGameBtn.addEventListener("click", () => {

  projectileSpeedFactor = 4.5; // Double projectile speed for Easy Mode
  init();
  animate();
 
  modalEl.style.display = "none";
});

// Event listener for Easy Mode button
document.getElementById("easyModeBtn").addEventListener("click", () => {

  projectileSpeedFactor = 6.5; // Increases projectile speed for Easy Mode
  init();
  animate();
 
  modalEl.style.display = "none";
});
