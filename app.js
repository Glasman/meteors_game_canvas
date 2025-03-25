const express = require('express')
const app = express()
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})