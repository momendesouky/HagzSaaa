// Match.js
const mongoose = require('mongoose');
const matchSchema = new mongoose.Schema({
  hagz: { type: mongoose.Schema.Types.ObjectId, ref: 'Hagz' },
  teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  scoreA:{ type: Number, default: 0 },
  scoreB: { type: Number, default: 0 },
  stats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MatchStat' }]
});
module.exports = mongoose.model('Match', matchSchema);
