const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  disc: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  image_Id: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "USER",
    required: true,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "USER",
    },
  ],
  comments: [
    {
      comment: String,
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
      },
    },
  ],
});

const postModel = mongoose.model("POST", postSchema);

module.exports = postModel;
