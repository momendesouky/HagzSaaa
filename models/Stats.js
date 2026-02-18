// MatchStat.js
const mongoose = require('mongoose');
const matchStatSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  goals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 }
});
module.exports = mongoose.model('MatchStat', matchStatSchema);
