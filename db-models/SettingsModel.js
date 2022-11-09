const mongoose = require('mongoose');

const schema = mongoose.Schema({
    masterEmail: String,
    facemaskMode: Boolean


})

const model = mongoose.model('settings', schema);

module.exports = model;
