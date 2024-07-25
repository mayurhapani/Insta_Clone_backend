const postModel = require("../models/post.model");
const { extractPublicId, deleteImageByUrl } = require("../public/javascripts/image_functions");

const getPosts = async (req, res) => {
  try {
    const posts = await postModel
      .find({})
      .populate("user", "username image")
      .populate("comments.user", "username");
    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMyPost = async (req, res) => {
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

const createPost = async (req, res) => {
  const { disc, image } = req.body;
  const image_Id = extractPublicId(image);
  try {
    if (!image || !disc) return res.status(422).json({ message: "Fill all the inputs" });

    const user = req.user._id;
    const response = await postModel.create({ disc, image, user, image_Id });

    if (response) return res.status(201).json({ message: "Post Created Successfully" });
    else return res.status(422).json({ message: response.message });
  } catch (error) {
    if (image_Id) await deleteImageByUrl(`posts/${image_Id}`, res);
    return res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postModel.findById(id).populate("user", "_id");

    if (!post) return res.status(404).json({ message: "Post not found" });
    const publicId = post.image_Id;

    if (req.user._id.toString() != post.user._id.toString())
      return res.status(404).json({ message: "User Not Authorized" });

    // Delete post and image
    await postModel.findByIdAndDelete(id);
    await deleteImageByUrl(`posts/${publicId}`, res);

    return res.status(200).json({ message: "Post and image deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postModel.findOne({ _id: req.params.id });

    if (post.likes.indexOf(req.user._id) === -1) {
      post.likes.push(req.user._id);
      await post.save();
      return res.status(200).json({ Like: true, message: "Liked" });
    } else {
      post.likes.splice(post.likes.indexOf(req.user._id), 1);
      await post.save();
      return res.status(200).json({ Like: false, message: "Unlike" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postModel.findById(id);
    post.comments.push({ user: req.user._id, comment: req.body.comment });
    await post.save();

    return res.status(200).json({ message: "Post Done" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId, postId } = req.query;
    const post = await postModel.findById(postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    // Filter
    post.comments = post.comments.filter((comment) => comment._id.toString() !== commentId);
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const myFollowing = async (req, res) => {
  try {
    const followingPosts = await postModel
      .find({ user: { $in: req.user.following } })
      .populate("user");
    return res.status(200).json({ followingPosts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost,
  deletePost,
  getPosts,
  getMyPost,
  likePost,
  addComment,
  deleteComment,
  myFollowing,
};
