import { Router } from "express";
import { StoryController } from "../controllers/story.controller.js";
import upload from "../middlewares/multer.js";

export const createStoryRouter = ({ storyModel }) => {
  const storyRouter = Router();

  const storyController = new StoryController({ storyModel });

  // Create
  storyRouter.post(
    "/create",
    upload.single("media"),
    storyController.createStory
  );

  // Read
  storyRouter.get("/:userId/read", storyController.getAllStories);

  return storyRouter;
};
