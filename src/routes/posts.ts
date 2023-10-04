import express from "express";
import controller from "../controllers/posts";
import path from "path";
const router = express.Router();

router.get("/posts", controller.getPosts);

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

export = router;
