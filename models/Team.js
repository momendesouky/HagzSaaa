const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  hagz: { type: mongoose.Schema.Types.ObjectId, ref: 'Hagz' }
});

module.exports = mongoose.model('Team', teamSchema);
