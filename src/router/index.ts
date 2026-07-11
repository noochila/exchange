import { Router } from "express";
import type { Request, Response } from "express";

export const loginRouter: Router = Router();

// POST /api/v1/signup - Lets a user signup
loginRouter.post("/signup", (req: Request, res: Response) => {
  // TODO: implement signup




});

// POST /api/v1/signin - Lets a user signin, returns a jwt
loginRouter.post("/signin", (req: Request, res: Response) => {
  // TODO: implement signin

});
