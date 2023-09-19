const mongoose = require('mongoose');

exports.connect = () => {
    const dbUrl = 'mongodb+srv://kennedychanda:kennedychanda@cluster0.hipglub.mongodb.net/?retryWrites=true&w=majority';

    mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

    mongoose.connection.on('error', (err) => console.log(err));
    mongoose.connection.on('connected', () => console.log("MongoDb Connected!"));
    mongoose.connection.on('disconnected', () => console.log("MongoDb Disconnected"));
}