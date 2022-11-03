const path = require("path");

const tf = require("@tensorflow/tfjs-node");

const faceapi = require("@vladmandic/face-api/dist/face-api.node.js");
const modelPathRoot = "./models";

const canvas = require("canvas");
const { saveFile } = require("./saveFile");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let optionsSSDMobileNet;

async function image(file) {
    try {
        const decoded = tf.node.decodeImage(file);
        const casted = decoded.toFloat();
        const result = casted.expandDims(0);
        decoded.dispose();
        casted.dispose();
        return result;
    } catch (e) {
        return null
    }
}

async function detect(tensor) {
    const result = await faceapi.detectAllFaces(tensor, optionsSSDMobileNet).withFaceLandmarks().withFaceDescriptors().withAgeAndGender()

    return result;
}

async function main(file) {

    await faceapi.tf.setBackend("tensorflow");
    await faceapi.tf.enableProdMode();
    await faceapi.tf.ENV.set("DEBUG", false);
    await faceapi.tf.ready();

    // console.log(
    //     `Version: TensorFlow/JS ${faceapi.tf?.version_core} FaceAPI ${faceapi.version.faceapi
    //     } Backend: ${faceapi.tf?.getBackend()}`
    // );

    // console.log("Loading FaceAPI models");
    const modelPath = path.join(__dirname, modelPathRoot);
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.ageGenderNet.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath)
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);



    optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
        minConfidence: 0.7,
    });

    const tensor = await image(file);
    if (!tensor) return
    const result = await detect(tensor);
    console.log("Detected faces:", result.length);

    tensor.dispose();


    console.log("beginning canvas draw")
    const canvasImg = await canvas.loadImage("http://ec2-18-188-141-169.us-east-2.compute.amazonaws.com/image.jpg");
    console.log("1")
    const out = await faceapi.createCanvasFromMedia(canvasImg);
    console.log("2")
    faceapi.draw.drawDetections(out, result);
    console.log("3")
    faceapi.draw.drawFaceLandmarks(out, result)
    console.log("completed canvas draw")

    saveFile("image.jpg", out.toBuffer("image/jpeg"));

    return {
        result,
        image: out.toBuffer("image/jpeg")
    };
}


/**
 * 
 * @param {img} existingImage image file we are comparing with 
 * @param {obj} result the result from the processed image from the server
 * 
 */
const matchFace = async ({ existingImage, result }) => {

    const faceMatcher = new faceapi.FaceMatcher(result)
    const tensor = await image(existingImage);
    if (!tensor) return
    const singleResult = await faceapi
        .detectSingleFace(tensor)
        .withFaceLandmarks()
        .withFaceDescriptor()


    if (singleResult) {
        const bestMatch = faceMatcher.findBestMatch(singleResult.descriptor)
        return bestMatch
    }

    return null

}
module.exports = {
    detect: main,
    matchFace
};