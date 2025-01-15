export class NotificationsController {
  constructor({ notificationModel }) {
    this.notificationModel = notificationModel;
  }

  // Create new notification
  createNotification = async (req, res) => {
    const { userId, type, content, senderId } = req.body;

    if (!userId || !type || !content) {
      return res.status(400).json({ message: "All fields are obligatory." });
    }

    const notificationData = {
      userId,
      type,
      content,
      senderId,
    };

    try {
      const notification = await this.notificationModel.create({
        notificationData,
      });

      res.status(201).json({ notification });
    } catch (error) {
      console.log(error.message);
      res.status(400).send(error.message);
    }
  };

  // Get all user notifications by Id
  getUserNotifications = async (req, res) => {
    const { userId } = req.params;

    try {
      const notifications = await this.notificationModel.getAll({ userId });

      res.status(201).json({ notifications });
    } catch (error) {
      console.log(error.message);
      res.status(400).send(error.message);
    }
  };
}
