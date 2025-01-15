import { Router } from "express";
import { ApisController } from "../controllers/apis.controller.js";

export const createApisRouter = () => {
  const apisRouter = Router();

  const apisController = new ApisController();

  apisRouter.get("/movies", apisController.callMovies);
  apisRouter.get("/videogames", apisController.callVideogames);
  apisRouter.get("/books", apisController.callBooks);
  apisRouter.get("/music", apisController.callMusic);

  return apisRouter;
};
