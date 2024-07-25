const postModel = require("../models/post.model");
const userModel = require("../models/user.model");

const getOtherUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const posts = await postModel.find({ user: id }).populate("user");

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUserPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postModel
      .findById(id)
      .populate("user", "username image")
      .populate("comments.user", "username");

    return res.json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getOtherUser, getUserPosts, getUserPost };
