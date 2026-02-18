const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String, required: true },
  role:{
        type:String,
        enum:["ADMIN","USER"],
        default:"USER"
    },
    Fantasyteam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
});

module.exports = mongoose.model('User', UserSchema);
