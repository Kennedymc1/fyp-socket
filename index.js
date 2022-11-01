const express = require('express');
const app = express();
const http = require('http');
const dotenv = require('dotenv');
const fileUpload = require("express-fileupload");
const faceapiService = require('./faceapiService');
const { matchFace } = require('./faceapiService');


const MAX_ROLL = 23
const MIN_ROLL = -23
const MAX_PITCH = 17
const MIN_PITCH = -17
const MAX_YAW = 300
const MIN_YAW = -300

const MATCH_MAX_LIMIT = 0.45

app.use(fileUpload());

app.post("/upload", async (req, res) => {
  const { file, existingImage } = req.files;

  const response = await faceapiService.detect(file.data);

  const faceMatch = await matchFace({ existingImage: existingImage.data, result: response.result })

  console.log({ result: response.result })

  const detectedFaces = response.result.length

  if (detectedFaces == 1) {
    res.json({
      detectedFaces,
      faceMatch,
      numberOfLandmarks: response.result[0].landmarks._positions.length,
      numberOfUnshiftedLandmarks: response.result[0].unshiftedLandmarks._positions.length,
      angle: response.result[0].angle
    });
  } else {
    res.json({
      detectedFaces,
      faceMatch
    });
  }
});

app.get("/trigger", async (req, res) => {
  io.emit("trigger", { trigger: true })
  res.send("triggered")
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
      io.emit('showStream', result.image)

    } catch (e) {
      console.log({ e })
    }
  }
  )
})

const port = process.env.PORT || 4000

server.listen(port, () => {
  console.log('listening socket microservice on port ' + port);
});