const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector("#scoreEl");

const x = canvas.width / 2;
const y = canvas.height / 2;

const frontEndPlayers = {};

socket.on("updatePlayers", (backEndPlayers) => {
  //loops through the backEndPlayers object
  for (const id in backEndPlayers) {
    const backEndPlayer = backEndPlayers[id];

    //if player does not exist, they get added to the frontEndPlayers obejct
    if (!frontEndPlayers[id]) {
      frontEndPlayers[id] = new Player({
        x: backEndPlayer.x,
        y: backEndPlayer.y,
        radius: 15,
        color: "hsl(0, 100%, 50%)",
      });
    }
  }

  //if an id no longer exists on the backend,
  //the associated  player is removed from the frontend
  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      delete frontEndPlayers[id];
    }
  }
});

socket.emit("requestPlayers");

const projectiles = [];
const particles = [];
let score = 0;
scoreEl.innerHTML = score;

let projectileSpeedFactor = 4.5;

let animationId;

function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(0,0,0,0.08)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  //loops through every player in the player object and calls the draw method
  for (const id in frontEndPlayers) {
    const player = frontEndPlayers[id];
    player.draw();
  }

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

animate();
