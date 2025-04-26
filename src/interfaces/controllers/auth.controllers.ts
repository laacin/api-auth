import type { AuthenticationUseCase } from "@application/use-cases";
import { LoginDto } from "@interfaces/dtos/auth/login.dto";
import { RegisterDto } from "@interfaces/dtos/auth/register.dto";
import type { Request, Response } from "@interfaces/http/context";

export class AuthControllers {
  constructor(private readonly authUseCase: AuthenticationUseCase) {}

  // Register
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Read body
      const dto = RegisterDto.create(await req.body());

      console.log(dto);

      // Use case
      await this.authUseCase.createAccount(dto);

      // Response
      res.sendSuccess(201, "Register successfully");
    } catch (err) {
      res.sendThrow(err);
    }
  }

  // Login
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Read body
      const dto = LoginDto.create(await req.body());

      // Use case
      const token = await this.authUseCase.login(dto.identifier);

      // Response
      res.sendSuccess(200, { token }, "Login successfully");
    } catch (err) {
      res.sendThrow(err);
    }
  }
}
