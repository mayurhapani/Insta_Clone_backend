const { Router } = require("express");
const { isAuth } = require("../middlewares/isAuth.middleware");
const { getOtherUser, getUserPosts, getUserPost } = require("../controllers/otherUser.controller");
const ouRouter = Router();

ouRouter.get("/getUser/:id", isAuth, getOtherUser);
ouRouter.get("/getUserPosts/:id", isAuth, getUserPosts);

ouRouter.get("/getUserPost/:id", isAuth, getUserPost);

module.exports = ouRouter;
