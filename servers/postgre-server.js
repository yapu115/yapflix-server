import { createApp } from "../app.js";
import { UserModel } from "../models/user.model.js";
import { PostModel } from "../models/post.model.js";
import { StoryModel } from "../models/story.model.js";
import { notificationsModel } from "../models/notifications.model.js";

// Postgre db
createApp({
  userModel: UserModel,
  postModel: PostModel,
  storyModel: StoryModel,
  notificationModel: notificationsModel,
});
