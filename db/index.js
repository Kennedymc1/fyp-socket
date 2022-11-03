const mongoose = require('mongoose');

exports.connect = () => {
    const dbUrl = 'mongodb://dev:QyXzZWbVc4TTI6D2@cluster1-shard-00-00.hktaw.mongodb.net:27017,cluster1-shard-00-01.hktaw.mongodb.net:27017,cluster1-shard-00-02.hktaw.mongodb.net:27017/fyp?ssl=true&replicaSet=atlas-nba93o-shard-0&authSource=admin&retryWrites=true&w=majority';
    mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

    mongoose.connection.on('error', (err) => console.log(err));
    mongoose.connection.on('connected', () => console.log("MongoDb Connected!"));
    mongoose.connection.on('disconnected', () => console.log("MongoDb Disconnected"));
}