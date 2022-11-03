const express = require('express');
const app = express();
const http = require('http');
const dotenv = require('dotenv');
const fileUpload = require("express-fileupload");
const faceapiService = require('./faceapiService');
const { matchFace } = require('./faceapiService');
const e = require('express');


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

app.get("/denied", async (req, res) => {
  io.emit("denied", { denied: true })
  res.send("denied")
});

app.get("/approved", async (req, res) => {
  io.emit("approved", { approved: true })
  res.send("approved")
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

      const response = await faceapiService.detect(bytes);

      if (response) {
        let age, gender

        console.log({ length: response.result.length })

        if (response.result.length === 1) {

          const face = response.result[0]
          age = face.age
          gender = face.gender

          let approved = true
          if (angle.roll > MAX_ROLL || angle.roll < MIN_ROLL) {
            console.log("wrong roll " + angle.roll)
            approved = false
          }

          if (angle.yaw > MAX_YAW || angle.yaw < MIN_YAW) {
            console.log("wrong yaw " + angle.yaw)
            approved = false
          }

          if (angle.pitch > MAX_PITCH || angle.pitch < MIN_PITCH) {
            console.log("wrong pitch " + angle.pitch)
            approved = false
          }

          //todo scan through banned images in database to check for a face match
          if (approved) {
            console.log("approved face")
            io.emit("approved", { approved: true })
          }

        }


        io.emit('faceData', {
          detectedFaces: response.result.length,
          age,
          gender
        })

        //send the same data out
        io.emit('showStream', response.image)
      } else {
        console.log("image null")
      }

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