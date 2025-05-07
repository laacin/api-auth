import { Router } from "@infra/http/framework";
import { RequestImpl } from "@infra/http/request.impl";
import { ResponseImpl } from "@infra/http/response.impl";
import type { AuthControllers } from "@interfaces/controllers/auth.controllers";
import type { RecoveryControllers } from "@interfaces/controllers/recovery.controllers";
import { IncomingMessage, ServerResponse } from "node:http";

type Routes = (req: IncomingMessage, res: ServerResponse) => void;

interface Controllers {
  auth: AuthControllers;
  recovery: RecoveryControllers;
}

export const setupRoutes = (controller: Controllers): Routes => {
  return async (sReq, sRes) => {
    // Setup
    const req = new RequestImpl(sReq);
    const res = new ResponseImpl(sRes);

    const api = Router.create(req, res, "/api");

    // Auth
    const auth = api.subRouter("/auth");
    auth.post("/register", controller.auth.register());
    auth.post("/login", controller.auth.login());
    auth.get(
      "/validate-email",
      controller.recovery.sendEmailVerificationToken("/email-validation"),
    );

    // Recovery
    const recovery = api.subRouter("/recovery");
    recovery.post("/");

    // Run
    await api.execute();
  };
};
