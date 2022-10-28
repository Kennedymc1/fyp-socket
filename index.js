const express = require('express');
const app = express();
const http = require('http');
const dotenv = require('dotenv');
const fileUpload = require("express-fileupload");
const faceapiService = require('./faceapiService');

app.use(fileUpload());

app.post("/upload", async (req, res) => {
  const { file } = req.files;

  console.log({file})
  const result = await faceapiService.detect(file.data);

  res.json({
    detectedFaces: result.length,
  });
});

dotenv.config({ path: '../.env' });

const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }


});




/**
 * io connection
 */

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on("liveStream", (data) => {

    
    console.log({ data })
    //send the same data out
    io.emit('showStream', data)
    return
  }
  )
})

server.listen(process.env.SOCKET_PORT, () => {
  console.log('listening socket microservice on port ' + process.env.SOCKET_PORT);
});