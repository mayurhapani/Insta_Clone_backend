const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { extractPublicId, deleteImageByUrl } = require("../public/javascripts/image_functions");
const postModel = require("../models/post.model");
const defaultImag =
  "https://res.cloudinary.com/instaclone21/image/upload/v1721210287/users/u0qrfanxqztl61j37odp.png";

const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(422).json({ message: "Invalid input" });
    }

    const existingUser = await userModel.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(422).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.create({
      name,
      username,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    } else {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "None",
      });

      return res.status(200).json({ token, user, message: "Login Successfully" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = req.user;
    const myPost = await postModel.find({ user: user._id }).populate("user");
    return res.status(200).json({ user, myPost });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "None",
    });
    res.status(200).json({ message: "Logged out successfully!!!!" });
  } catch (error) {
    return res.status(500).json({ message: "logout : " + error.message });
  }
};

const follow = async (req, res) => {
  try {
    const { id } = req.params;
    const otherUser = await userModel.findById(id);
    if (!otherUser) return res.status(404).json({ message: "User not found" });

    if (otherUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }
    if (otherUser.followers.includes(req.user._id.toString())) {
      return res.status(400).json({ message: "You are already following this user" }); // This user has already followed this user. This check is added to prevent duplicate followers.  // This check is added to prevent duplicate followers.  // This check is added to prevent duplicate followers.  // This check is added to prevent duplicate followers.  // This check is added to prevent duplicate followers.  // This check is added to prevent duplicate followers.  // This check is added to prevent duplicate followers.  // This check is added to prevent duplicate followers.  // This check is added to prevent duplicate followers.  // This check is added to prevent duplicate followers.  // This check is added to prevent duplicate followers.  // This check is added to prevent duplicate followers.  // This check is added to prevent duplicate followers.  // This check is added to prevent duplicate followers.  //
    }
    otherUser.followers.push(req.user._id);
    req.user.following.push(otherUser._id);
    await otherUser.save();
    await req.user.save();

    return res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const unfollow = async (req, res) => {
  try {
    const { id } = req.params;
    const otherUser = await userModel.findById(id);
    if (!otherUser) return res.status(404).json({ message: "User not found" });

    if (otherUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot unfollow yourself" });
    }

    if (!otherUser.followers.includes(req.user._id.toString())) {
      return res.status(400).json({ message: "You are not following this user" });
    }

    otherUser.followers.splice(req.user._id, 1);
    req.user.following.splice(otherUser._id, 1);
    await otherUser.save();
    await req.user.save();

    return res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const profilePic = async (req, res) => {
  const { image } = req.body;
  const image_Id = extractPublicId(image);

  try {
    if (!image) return res.status(422).json({ message: "Fill all the inputs" });

    const OldImage = req.user.image ? extractPublicId(req.user.image) : null;
    if (OldImage) await deleteImageByUrl(`users/${OldImage}`, res);

    const response = await userModel.findByIdAndUpdate(
      req.user._id,
      { $set: { image } },
      {
        new: true,
      }
    );

    if (response) return res.status(201).json({ message: "Profile Picture Uploaded Successfully" });
    else return res.status(422).json({ message: response.message });
  } catch (error) {
    if (image_Id) await deleteImageByUrl(`users/${image_Id}`, res);
    return res.status(500).json({ message: error.message });
  }
};

const removeProfilePic = async (req, res) => {
  try {
    const OldImage = req.user.image ? extractPublicId(req.user.image) : null;
    if (OldImage) await deleteImageByUrl(`users/${OldImage}`, res);

    const response = await userModel.findByIdAndUpdate(
      req.user._id,
      { $set: { image: defaultImag } },
      {
        new: true,
      }
    );

    if (response) return res.status(201).json({ message: "Profile Picture Removed Successfully" });
    else return res.status(422).json({ message: response.message });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login, getUser, logout, follow, unfollow, profilePic, removeProfilePic };
