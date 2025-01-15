import { Router } from "express";
import { PostController } from "../controllers/post.controller.js";
import upload from "../middlewares/multer.js";

export const createPostRouter = ({ postModel }) => {
  const postRouter = Router();

  const postController = new PostController({ postModel });

  // Create
  postRouter.post(
    "/create",
    upload.array("pictures", 10),
    postController.createPost
  );
  // Read
  postRouter.get("/:userId/read", postController.getAllPosts);
  postRouter.get("/read/:id/user", postController.getPostsByUser);

  // Update
  postRouter.post("/:id/like", postController.updateLikes);
  postRouter.post("/:postId/comments", postController.uploadComment);

  return postRouter;
};
