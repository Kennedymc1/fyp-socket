const mongoose = require('mongoose');

exports.connect = () => {
    const dbUrl = 'mongosh "mongodb+srv://kennedychanda:mwenyakc@cluster0.hipglub.mongodb.net/?retryWrites=true&w=majority" --apiVersion 1 --username kennedychanda';
    mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

    mongoose.connection.on('error', (err) => console.log(err));
    mongoose.connection.on('connected', () => console.log("MongoDb Connected!"));
    mongoose.connection.on('disconnected', () => console.log("MongoDb Disconnected"));
}