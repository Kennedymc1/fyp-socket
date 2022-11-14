const AWS = require('aws-sdk');
const axios = require('axios');
const fs = require('fs');

const s3 = new AWS.S3({
    accessKeyId: "AKIA2DSQK5JIJ6XWDH4V",
    secretAccessKey: "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"
});
/**
 * get the data of a file as a string in utf8 format
 */
const getFileData = async (file) => {
    // let filedata
    const filename = Date.now().toString()
    // const response = await file;

    // if (response && response.createReadStream) {

    //     function streamToString() {
    //         const stream = response.createReadStream()
    //         const chunks = [];
    //         return new Promise((resolve, reject) => {
    //             stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    //             stream.on('error', (err) => reject(err));
    //             stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    //         })
    //     }

    //     filedata = await streamToString()

    //     // console.log({ filedata }, "check here")
    // } else {
    //     if (response !== null) {
    //         filedata = file
    //     }
    // }
    // console.log( "check file")
    // [TODO: refactor] refeactor and include a catch for error
    const { Location } = await pushToS3(file, filename);

    return { filepath: Location }
}


const pushToS3 = async (data, filename) => {

    // const buf = Buffer.from(
    //     data.data.replace(/^data:image\/\w+;base64,/, ""),
    //     "base64"
    // );
    const params = {
        Key: `${filename}.jpeg`,
        Body: data.data,
        ContentEncoding: data.encoding,
        ContentType: data.mimetype,
        Bucket: 'fyp-mundia',
    };
    const response = await s3.upload(params).promise();
    // console.log(response, "check response in callback")
    return response;
};



const downloadImage = async (url) => {
    console.log({ downloadImagePath: __dirname + "/../out/download.jpg" })
    
    axios({
        url,
        responseType: 'stream',
    }).then(
        response =>
            new Promise((resolve, reject) => {
                response.data
                    .pipe(fs.createWriteStream(__dirname + "/../out/download.jpg"))
                    .on('finish', () => resolve())
                    .on('error', e => reject(e));
            }),
    );
}
module.exports = {
    getFileData,
    downloadImage
}