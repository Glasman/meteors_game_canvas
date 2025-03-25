const express = require('express')
const app = express()
const { createServer } = require('node:http');
const server = createServer(app)
const { Server } = require('socket.io');
const io = new Server(server);


const port = process.env.PORT || 3000
const path = require('path')

// app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const players = {}

io.on('connection', (socket) => {
  console.log('a user connected');
  players[socket.id] = {
    x:100,
    y:100
  }
  io.emit('updatePlayers', players)
  console.log(players)
});

server.listen(port, () => {
  console.log(`App listening on port ${port}`)
})