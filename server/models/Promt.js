//genrate model mongoose schema Promt with fields (title, description, image, date, author, tags, likes, comments)
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PromtSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Promt', PromtSchema);