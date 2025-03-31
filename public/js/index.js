const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

const devicePixelRatio = window.devicePixelRatio || 1;

canvas.width = innerWidth * devicePixelRatio;
canvas.height = innerHeight * devicePixelRatio;

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
        color: backEndPlayer.color,
      });
    } else {
      //if a player does exist
      frontEndPlayers[id].x = backEndPlayer.x;
      frontEndPlayers[id].y = backEndPlayer.y;
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

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

const SPEED = 10;
setInterval(() => {
  if (keys.w.pressed) {
    frontEndPlayers[socket.id].y -= SPEED;
    socket.emit("keydown", "w");
  }
  if (keys.a.pressed) {
    frontEndPlayers[socket.id].x -= SPEED;
    socket.emit("keydown", "a");
  }
  if (keys.s.pressed) {
    frontEndPlayers[socket.id].y += SPEED;
    socket.emit("keydown", "s");
  }
  if (keys.d.pressed) {
    frontEndPlayers[socket.id].x += SPEED;
    socket.emit("keydown", "d");
  }
}, 15);

window.addEventListener("keydown", (e) => {
  //in the event that player starts providing input before the page fully loads,
  //this prevents errors
  if (!frontEndPlayers[socket.id]) return;

  switch (e.key) {
    case "w":
      keys.w.pressed = true;
      break;
    case "a":
      keys.a.pressed = true;
      break;
    case "s":
      keys.s.pressed = true;
      break;
    case "d":
      keys.d.pressed = true;
      break;
  }
});
window.addEventListener("keyup", (e) => {
  //in the event that player starts providing input before the page fully loads,
  //this prevents errors
  if (!frontEndPlayers[socket.id]) return;

  switch (e.key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
  }
});
