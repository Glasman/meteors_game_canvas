const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

//documentation says to include this in the html
//but placing it here seems to fix some async issues
const socket = io.connect();

const devicePixelRatio = window.devicePixelRatio || 1;

canvas.width = innerWidth * devicePixelRatio;
canvas.height = innerHeight * devicePixelRatio;

const scoreEl = document.querySelector("#scoreEl");

const playerInputs = [];

//I believe these are legacy from when player was in the middle of the screen, to be deleted
// const x = canvas.width / 2;
// const y = canvas.height / 2;

const frontEndPlayers = {};
const frontEndProjectiles = {};

socket.on("connect", () => {
  socket.emit("initCanvas", {
    width: canvas.width,
    height: canvas.height,
    devicePixelRatio,
  });
});

socket.on("updateProjectiles", (backEndProjectiles) => {
  for (const id in backEndProjectiles) {
    const backEndProjectile = backEndProjectiles[id];

    if (!frontEndProjectiles[id]) {
      frontEndProjectiles[id] = new Projectile({
        x: backEndProjectile.x,
        y: backEndProjectile.y,
        radius: backEndProjectile.radius,

        //?. required as frontEndProjectiles may not load for other players immediately
        //leading to projectiles not being rendered on other screens
        //also, putting backendprojectiles.playerid in brackets gives just
        //the id number value, letting us use it with frontendplayers
        color: frontEndPlayers[backEndProjectile.playerId]?.color,
        velocity: backEndProjectile.velocity,
      });
    } else {
      frontEndProjectiles[id].x += backEndProjectiles[id].velocity.x;
      frontEndProjectiles[id].y += backEndProjectiles[id].velocity.y;
    }
  }

  for (const frontEndProjectileId in frontEndProjectiles) {
    if (!backEndProjectiles[frontEndProjectileId]) {
      delete frontEndProjectiles[frontEndProjectileId];
    }
  }
});

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
      document.querySelector(
        "#playerLabels"
        //player id and score of 0 are taken from the backendplayers object
        //and placed on the scoreboard on connection
      ).innerHTML += `<div data-id="${id}" data-score="${backEndPlayer.score}">${id}: ${backEndPlayer.score}</div>`;
    } else {
      //checks to see updated score from backend every frame
      //and places updated score on the board
      document.querySelector(
        `div[data-id="${id}"]`
      ).innerHTML = `${id}: ${backEndPlayer.score}`;

      //updates that same div by setting data-score attribute equal to player's current score
      document
        .querySelector(`div[data-id="${id}"]`)
        .setAttribute("data-score", backEndPlayer.score);

      //finds parent container div that holds all player div elements
      //assume all player entires are direct children in this container
      const parentDiv = document.querySelector("#playerLabels");

      //selects all immediate div children inside parent container
      //converts nodelist into proper array using .Array allowing for use of .sort()
      const childDivs = Array.from(parentDiv.querySelectorAll("div"));

      //sorts each div in descending order based on the data-score attribute
      childDivs.sort((a, b) => {
        const scoreA = Number(a.getAttribute("data-score"));
        const scoreB = Number(b.getAttribute("data-score"));
        return scoreB - scoreA;
      });

      //wipes all existing children of #playerLabels,
      //inserts all of the now sorted divs into #playerLabels
      parentDiv.replaceChildren(...childDivs);

      //player movement and server reconcilation in if statement
      //only applies changes to screen of individual client
      if (id === socket.id) {
        //if a player does exist

        //moves character to most recently updated location according to the server
        frontEndPlayers[id].x = backEndPlayer.x;
        frontEndPlayers[id].y = backEndPlayer.y;

        //finds the sequenceNumber of the most recent input tracked by the server
        //and kicked to the front end
        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return backEndPlayer.sequenceNumber === input.sequenceNumber;
        });
        //if lastBackEndInputIndex exists
        if (lastBackendInputIndex > -1)
          //remove all inputs that have been completed by the server
          playerInputs.splice(0, lastBackendInputIndex + 1);

        //server side reconciliation moves player to where they should be according to
        //client sides input that have not yet been processed by the server
        //and can smooth out rubberbanding when dealing with high ping
        playerInputs.forEach((input) => {
          frontEndPlayers[id].x += input.vx;
          frontEndPlayers[id].y += input.vy;
        });
      } else {
        //applies server controlled movement to all other players in game,
        //not just the individual client

        //interpolates enemy in instances of lag
        //in instances of disconnect between frontend and backend enemy locations
        //this provides a smooth animation instead of snapping them around
        gsap.to(frontEndPlayers[id], {
          x: backEndPlayer.x,
          y: backEndPlayer.y,
          duration: 0.015,
          ease: "linear",
        });
      }
    }
  }

  //if player is deleted from backend due to collision or disconnect,
  //aka if the id no longer exists on the backend
  //they are removed from both the leaderboard and the field
  for (const id in frontEndPlayers) {
    if (!backEndPlayers[id]) {
      const divToDelete = document.querySelector(`div[data-id="${id}"]`);
      divToDelete.remove();
      delete frontEndPlayers[id];
    }
  }
});

const particles = [];
let score = 0;
// scoreEl.innerHTML = score;

let animationId;

function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(0,0,0,0.08)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  //loops through every player in the player object and calls the draw method
  for (const id in frontEndPlayers) {
    const frontEndPlayer = frontEndPlayers[id];
    frontEndPlayer.draw();
  }
  for (const id in frontEndProjectiles) {
    const frontEndProjectile = frontEndProjectiles[id];
    frontEndProjectile.draw();
  }
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
let sequenceNumber = 0;
setInterval(() => {
  if (keys.w.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, vx: 0, vy: -SPEED });
    frontEndPlayers[socket.id].y -= SPEED;
    socket.emit("keydown", { key: "w", sequenceNumber });
  }
  if (keys.a.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, vx: -SPEED, vy: 0 });
    frontEndPlayers[socket.id].x -= SPEED;
    socket.emit("keydown", { key: "a", sequenceNumber });
  }
  if (keys.s.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, vx: 0, vy: SPEED });
    frontEndPlayers[socket.id].y += SPEED;
    socket.emit("keydown", { key: "s", sequenceNumber });
  }
  if (keys.d.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, vx: SPEED, vy: 0 });
    frontEndPlayers[socket.id].x += SPEED;
    socket.emit("keydown", { key: "d", sequenceNumber });
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
