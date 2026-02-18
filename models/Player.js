const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: String,
  number: Number
});

module.exports = mongoose.model('Player', playerSchema);
