import { AuthenticationUseCase } from "@application/use-cases";
import { HashServiceImpl } from "@infra/app-services/hash.service.impl";
import { TokenServiceImpl } from "@infra/app-services/token.service.impl";
import { IdServiceImpl } from "@infra/app-services/uuid.service.impl";
import { connectMongo } from "@infra/database/connection";
import { userModel } from "@infra/database/models";
import { UserRepositoryImpl } from "@infra/database/repository";
import { RequestImpl, ResponseImpl } from "@infra/http/context.http.impl";
import { AuthControllers } from "@interfaces/controllers/auth.controllers";
import express from "express";

const app = express();

const main = async () => {
  try {
    await connectMongo("mongodb://localhost:27017");

    // Repository
    const repo = new UserRepositoryImpl(userModel);

    // Dependencies
    const uuidSvc = new IdServiceImpl();
    const hashSvc = new HashServiceImpl();
    const tokenSvc = new TokenServiceImpl("secretKey");

    // HTTP
    app.use(express.json());

    app.use(express.json());
    const useCase = new AuthenticationUseCase(repo, uuidSvc, hashSvc, tokenSvc);
    const contro = new AuthControllers(useCase);

    app.post("/register", (req, res) => {
      const reqq = new RequestImpl(req);
      const ress = new ResponseImpl(res);
      contro.register(reqq, ress);
    });

    app.post("/login", (req, res) => {
      const reqq = new RequestImpl(req);
      const ress = new ResponseImpl(res);
      contro.login(reqq, ress);
    });

    app.get("/user/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const u = await repo.getUserByEmail(email);
        if (!u) throw new Error("not found");

        res.status(200).json({ user: u });
      } catch (err) {
        res.status(400).json({ msg: String(err) });
      }
    });

    app.listen(3000, () => console.log("lets pray"));
  } catch (err) {
    console.error(err);
  }
};
main();
