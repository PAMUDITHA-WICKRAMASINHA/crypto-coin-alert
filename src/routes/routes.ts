import { Express, Request, Response } from "express";
import validateResource from "../midleware/validateResource";
import { createUserHandler } from "../controller/user.controller";
import { createUserSchema } from "../schema/user.schema";
import { createUserSessionHandler,genarateJWTHandler,getUserSessionHandler,deleteUserSessionHandler } from "../controller/session.controller"
import { createSessionSchema } from "../schema/session.schema"
import requireUser from '../midleware/requireUser'
import { createProductSchema, updateProductSchema, getProductSchema, deleteProductSchema } from "../schema/product.schema";
import { createProductHandler, getProductHandler, updateProductHandler, deleteProductHandler } from "../controller/product.controller";


// Register user
function routes(app: Express) {
  app.get("/heathcheck", (req: Request, res: Response) => res.sendStatus(200));
  app.post("/api/users", validateResource(createUserSchema), createUserHandler);

  app.get("/api/jwt/generate", genarateJWTHandler);
  app.post("/api/sessions", validateResource(createSessionSchema), createUserSessionHandler);
  app.get("/api/sessions", requireUser, getUserSessionHandler);
  app.delete("/api/sessions", requireUser, deleteUserSessionHandler);

  app.post("/api/products",[requireUser,validateResource(createProductSchema)],createProductHandler);
  app.put("/api/products/:productId",[requireUser,validateResource(updateProductSchema)],updateProductHandler);
  app.get("/api/products/:productId",validateResource(getProductSchema),getProductHandler);
  app.delete("/api/products/:productId",[requireUser,validateResource(deleteProductSchema)],deleteProductHandler);

}

export default routes;
