const mongoose = require('mongoose');

const schema = mongoose.Schema({
	image: {
		name: String,
		data: String,
		contentType: String
	},
	temperature: String
});

const model = mongoose.model('entries', schema);

module.exports = model;
