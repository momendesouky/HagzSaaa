const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name:String,
  date: { type: Date, required: true },
  location: String,
  createdBy: String,
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }]
});

module.exports = mongoose.model('Hagz', bookingSchema);
