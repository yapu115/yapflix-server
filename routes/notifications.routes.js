import { Router } from "express";
import { NotificationsController } from "../controllers/notifications.controller.js";

export const createNotificationsRouter = ({ notificationModel }) => {
  const notificationsRouter = Router();

  const notificationsController = new NotificationsController({
    notificationModel,
  });

  // create
  notificationsRouter.post(
    "/create",
    notificationsController.createNotification
  );

  // get all from userId
  notificationsRouter.get(
    "/getAll/:userId",
    notificationsController.getUserNotifications
  );

  return notificationsRouter;
};
