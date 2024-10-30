//Tạo models mongose sesion bao gồm các trường: sessionId, userId, firstMess
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSchema = new Schema({

  sessionId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  firstMess: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Session', SessionSchema);
