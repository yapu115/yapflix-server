import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.js";

export const createUserRouter = ({ userModel }) => {
  const userRouter = Router();

  const userController = new UserController({ userModel });

  // get all
  userRouter.get("/getAll/:userId", userController.getAllUsers);

  // authentication
  userRouter.post("/signup", userController.createUser);
  userRouter.post("/signin", userController.getUser);
  userRouter.get("/logged", userController.verifySigned);
  userRouter.post("/logout", userController.deleteSigned);

  // verify followers/follows
  userRouter.get("/:userId/followers", userController.verifyFollowers);
  userRouter.get("/:userId/following", userController.verifyFollowing);

  // follow / unfollow
  userRouter.post("/:userId/follow", userController.followUser);
  userRouter.post("/:userId/unfollow", userController.unfollowUser);

  // Avatar
  userRouter.post(
    "/avatar",
    upload.single("avatar"),
    userController.saveAvatar
  );

  return userRouter;
};
