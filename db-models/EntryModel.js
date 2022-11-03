const mongoose = require('mongoose');

const schema = mongoose.Schema({
	image: {
		name: String,
		data: String,
		contentType: String
	},
	temperature: String,
	banned: Boolean,
	age: String,
	gender: String
});

const model = mongoose.model('entries', schema);

module.exports = model;
