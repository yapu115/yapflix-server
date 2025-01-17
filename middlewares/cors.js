import cors from "cors";

const ACCEPTED_ORIGINS = [
  "http://localhost:8080",
  "http://localhost:3000",
  "http://localhost:4200",
  "http://localhost:1234",
  "https://midu.dev",
  "https://yapflix-server.onrender.com",
  "https://yapflix.vercel.app/",
  "https://yapflix-yapus-projects.vercel.app/",
];

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) =>
  cors({
    origin: (origin, callback) => {
      console.log("Request origin:", origin);
      if (acceptedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (!origin) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  });
