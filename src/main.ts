import { HashServiceImpl } from "@infra/app-services/hash.service.impl";
import { TokenServiceImpl } from "@infra/app-services/token.service.impl";
import { IdServiceImpl } from "@infra/app-services/uuid.service.impl";
import { connectMongo } from "@infra/database/connection";
import { UserRepositoryImpl } from "@infra/database/repositories";
import { userModel } from "@infra/database/models/user/user.model";
import { AuthenticationUseCase, RecoveryUseCase } from "@application/use-cases";
import { TwoFactorServiceImpl } from "@infra/app-services/two-factor.service.impl";
import { AuthControllers } from "@interfaces/controllers/auth.controllers";
import { RecoveryControllers } from "@interfaces/controllers/recovery.controllers";
import { EmailServiceImpl } from "@infra/app-services/email.service.impl";
import { setupRoutes } from "./routes";
import { createServer } from "node:http";

const main = async () => {
  try {
    // Database
    await connectMongo(
      getEnv("DATABASE_URI", "mongodb://localhost:27017/api_auth"),
    );

    // Services
    const userRepo = new UserRepositoryImpl(userModel);
    const idService = new IdServiceImpl();
    const hashService = new HashServiceImpl();
    const tokenService = new TokenServiceImpl({
      secretKey: getEnv("SECRET_KEY", "secretKey"),
      accessExp: getEnv("ACCESS_TOKEN_EXPIRES", "15m"),
      refreshExp: getEnv("REFRESH_TOKEN_EXPIRES", "7d"),
    });
    const tfaService = new TwoFactorServiceImpl();
    const emailService = new EmailServiceImpl({
      baseUrl: getEnv("FRONTEND_BASE_URL", "http://localhost:3000"),
      user: getEnv("APP_EMAIL_NAME", ""),
      password: getEnv("APP_EMAIL_PASSWORD", ""),
    });

    // Application
    const authentication = new AuthenticationUseCase(
      userRepo,
      idService,
      hashService,
      tokenService,
      tfaService,
    );
    const recovery = new RecoveryUseCase(userRepo, tokenService, emailService);

    // Controllers
    const authControllers = new AuthControllers(authentication);
    const recoveryControllers = new RecoveryControllers(recovery);

    // Routes
    const routes = setupRoutes({
      auth: authControllers,
      recovery: recoveryControllers,
    });

    // Server
    const server = createServer(routes);

    server.listen(
      getEnv("SERVER_PORT", 3000),
      getEnv("SERVER_HOST", "localhost"),
      () => console.log("Server running"),
    );
  } catch (err) {
    console.error(err);
  }
};
main();

function getEnv(key: string, fallback: string): string;
function getEnv(key: string, fallback: number): number;
function getEnv(key: string, fallback: string | number): string | number {
  const value = process.env[key];
  if (!value) return fallback;

  if (typeof fallback === "string") return value;

  const int = Number.parseInt(value);
  return Number.isNaN(int) ? fallback : int;
}
