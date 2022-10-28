const express = require('express');
const app = express();
const http = require('http');
const dotenv = require('dotenv');
const fileUpload = require("express-fileupload");
const faceapiService = require('./faceapiService');

app.use(fileUpload());

app.post("/upload", async (req, res) => {
  const { file } = req.files;

  const result = await faceapiService.detect(file.data);

  console.log({ result })

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

  socket.on("liveStream", async (data) => {
    try {
      console.log("received stream")
      var bytes = new Uint8Array(data);

      const result = await faceapiService.detect(bytes);

      let age, gender

      if (result.length == 1) {
        age = result[0].age
        gender = result[0].gender

      }

      io.emit('faceData', {
        detectedFaces: result.length,
        age,
        gender
      })

      //send the same data out
      io.emit('showStream', data)

    } catch (e) {
      console.log({ e })
    }
  }
  )
})

const port = process.env.PORT || 80

server.listen(port, () => {
  console.log('listening socket microservice on port ' + port);
});