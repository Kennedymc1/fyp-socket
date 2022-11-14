
const { customAlphabet, urlAlphabet } = require('nanoid')

const nanoid = customAlphabet('1234567890abcdefghijklmno', 20)

module.exports.generateFileName = nanoid