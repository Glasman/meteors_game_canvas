const express = require("express");
const app = express();
const { createServer } = require("node:http");
const server = createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = process.env.PORT || 3000;
const path = require("path");

const SPEED = 10;
let projectileId = 0;
// app.use(express.static('public'))
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const backEndPlayers = {};
const backEndProjectiles = {};

io.on("connect", (socket) => {
  console.log('A new player has connected!')
  backEndPlayers[socket.id] = {
    x: 500 * Math.random(),
    y: 500 * Math.random(),
    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
    sequenceNumber: 0,
  };

  io.emit("updatePlayers", backEndPlayers);

  socket.on("shoot", ({ x, y, angle }) => {
    projectileId++;
    let projectileSpeedFactor = 4.5;

    const velocity = {
      x: Math.cos(angle) * projectileSpeedFactor,
      y: Math.sin(angle) * projectileSpeedFactor,
    };

    backEndProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id,
    };
    console.log(backEndProjectiles);
  });

  socket.on("keydown", ({ key, sequenceNumber }) => {
    backEndPlayers[socket.id].sequenceNumber = sequenceNumber;
    switch (key) {
      case "w":
        backEndPlayers[socket.id].y -= SPEED;
        break;
      case "a":
        backEndPlayers[socket.id].x -= SPEED;
        break;
      case "s":
        backEndPlayers[socket.id].y += SPEED;
        break;
      case "d":
        backEndPlayers[socket.id].x += SPEED;
        break;
    }
  });

  socket.on("disconnect", () => {
    delete backEndPlayers[socket.id];
    console.log('A player has disconnected')
  });
});

//backend ticker placed outside io.on("connect") because otherwise each new player would have
//their own unique setInterval(), this way gives us just one interval ticker
//for the whole page
setInterval(() => {
  //update projectile position
  for (const id in backEndProjectiles) {
    backEndProjectiles[id].x += backEndProjectiles[id].velocity.x;
    backEndProjectiles[id].y += backEndProjectiles[id].velocity.y;
  }

  io.emit("updatePlayers", backEndPlayers);
  io.emit("updateProjectiles", backEndProjectiles);
}, 15);
//the 15 ms update rate allows for approximately 60 tics per second

server.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
