const express = require('express')
const app = express()
const { createServer } = require('node:http');
const server = createServer(app)
const { Server } = require('socket.io');
const io = new Server(server);

// allegedly necessary to run socket.io but that seems to not be the case anymore
// const http = require('http')
// const server = http.createServer(app)



const port = process.env.PORT || 3000
const path = require('path')

// app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'public')))

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html')
// })

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})


io.on('connection', (socket) => {
  console.log('a user connected');
});

server.listen(port, () => {
  console.log(`App listening on port ${port}`)
})