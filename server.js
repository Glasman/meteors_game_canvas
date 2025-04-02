const express = require("express");
const app = express();
const { createServer } = require("node:http");
const server = createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = process.env.PORT || 3000;
const path = require("path");

// app.use(express.static('public'))
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const backEndPlayers = {};

io.on("connect", (socket) => {
  backEndPlayers[socket.id] = {
    x: 500 * Math.random(),
    y: 500 * Math.random(),
    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
    sequenceNumber: 0,
  };

  io.emit("updatePlayers", backEndPlayers);

  const SPEED = 10;
  socket.on("keydown", ({ key, sequenceNumber }) => {
    backEndPlayers[socket.id].sequenceNumber = sequenceNumber
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
    io.emit("updatePlayers", backEndPlayers);
  });
});

//placed outside io.on("connect") because otherwise each new player would have
//their own unique setInterval(), this way gives us just one interval ticker
//for the whole page
setInterval(() => {
  io.emit("updatePlayers", backEndPlayers);
}, 15);
//the 15 ms update rate allows for approximately 60 tics per second

server.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
