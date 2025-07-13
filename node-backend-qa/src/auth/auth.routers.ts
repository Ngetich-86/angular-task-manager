import { Hono } from "hono";
import { UserController } from "./auth.controllers";

const userController = new UserController();
const userRouter = new Hono();

userRouter.post("/register", (c) => userController.register(c));
userRouter.post("/login", (c) => userController.login(c));
userRouter.get("/allusers", (c) => userController.getAll(c));
userRouter.get("/user/:id", (c) => userController.getById(c));
userRouter.put("/user/:id", (c) => userController.update(c));

export default userRouter;
