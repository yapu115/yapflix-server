import express, { json } from "express";
import { corsMiddleware } from "./middlewares/cors.js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

// routers
import { createUserRouter } from "./routes/user.routes.js";
import { createPostRouter } from "./routes/posts.routes.js";
import { createStoryRouter } from "./routes/stories.routes.js";
import { createApisRouter } from "./routes/apis.routes.js";
import { createNotificationsRouter } from "./routes/notifications.routes.js";

export const createApp = ({
  userModel,
  postModel,
  storyModel,
  notificationModel,
}) => {
  // config
  const app = express();
  app.use(json({ limit: "100mb" }));
  app.use(corsMiddleware());
  app.disable("x-powered-by");
  app.use(cookieParser());

  app.use(express.urlencoded({ extended: true, limit: "100mb" }));

  const allowedOrigins = [
    "https://yapflix.vercel.app",
    "http://localhost:3000",
    "http://localhost:4200",
    "https://yapflix-yapus-projects.vercel.app",
  ];

  app.use((req, res, next) => {
    const origin = req.get("Origin");
    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin); // Permitir origen dinámico
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
      res.header("Access-Control-Allow-Credentials", "true");
    }
    next();
  });

  // routes
  app.use("/users", createUserRouter({ userModel }));
  app.use("/posts", createPostRouter({ postModel }));
  app.use("/stories", createStoryRouter({ storyModel }));
  app.use("/notifications", createNotificationsRouter({ notificationModel }));
  app.use("/apis", createApisRouter());

  // error
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Server error");
  });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};
