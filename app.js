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
  };

  io.emit("updatePlayers", backEndPlayers);

  //I think I'll socket.emit is better here but I'm not sure
  // socket.on("requestPlayers", () => {
  //   socket.emit("updatePlayers", backEndPlayers);
  // });
  socket.on("requestPlayers", () => {
    io.emit("updatePlayers", backEndPlayers);
  });

  socket.on("disconnect", () => {
    delete backEndPlayers[socket.id];
    io.emit("updatePlayers", backEndPlayers);
  });
});

server.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
