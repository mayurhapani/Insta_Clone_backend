const express = require("express");
const app = express();
const db = require("./config/database");
require("dotenv").config();

port = process.env.PORT;

const cors = require("cors");
const cookieParser = require("cookie-parser");
const uRouter = require("./routers/user.router");
const pRouter = require("./routers/post.router");
const ouRouter = require("./routers/otherUser.router");

const allowedOrigins = [
  "https://insta-clone-frontend-five.vercel.app",
  "https://insta-clone-frontend-sand.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", uRouter);
app.use("/post", pRouter);
app.use("/oUser", ouRouter);

app.listen(port, () => {
  db();
  console.log("server stated on http://localhost:" + port);
});
