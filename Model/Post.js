const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  photo: [],

  title: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

mongoose.model("posts", PostSchema);
