const tf = require('@tensorflow/tfjs-node');
const { image } = require('./faceapiService')


let maskDetectionModel;
async function loadMaskDetectionModel() {
  console.log("loading mask detection model");
  await tf.loadLayersModel('file://./facemask-models/model.json').then(m => {
    maskDetectionModel = m;
    console.log("mask detection model loaded");
  });
}


async function getPrediction(tensor) {

  let predictions;


  try {
    predictions = await maskDetectionModel.predict(tensor).data();
    return predictions
  } catch (e) {
    console.log({ e })
    return;
  }

}




const detectFaceMask = async (imageData) => {

  await loadMaskDetectionModel();

  // const tensor = await image(imageData);
  const t = {}; // container that will hold all tensor variables
  t.decoded = tf.node.decodeJpeg(imageData);
  t.resized = tf.image.resizeBilinear(t.decoded, [224, 224]);
  t.expanded = tf.expandDims(t.resized, 0);


  const predictions = await getPrediction(t.expanded);
  const withMask = Math.floor(predictions[0] * 1000) / 10
  const withoutMask = Math.floor(predictions[1] * 1000) / 10


  return { withMask, withoutMask }
}

module.exports = { detectFaceMask };
