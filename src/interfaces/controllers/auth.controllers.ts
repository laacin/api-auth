import type { AuthenticationUseCase } from "@application/use-cases";
import { LoginDto } from "@interfaces/dtos/auth/login.dto";
import { RegisterDto } from "@interfaces/dtos/auth/register.dto";
import type { Controller } from "@interfaces/http";

export class AuthControllers {
  constructor(private readonly authUseCase: AuthenticationUseCase) {}

  // Register
  register(): Controller {
    return async (req, res) => {
      try {
        // Read body
        const data = await req.body();
        const dto = RegisterDto.create(data);

        // Use case
        await this.authUseCase.createAccount(dto);

        // Response
        res.sendSuccess(201, "Register successfully");
      } catch (err) {
        res.sendThrow(err);
      }
    };
  }

  // Login
  login(): Controller {
    return async (req, res) => {
      try {
        // Read body
        const data = await req.body();
        const dto = LoginDto.create(data);

        // Use case
        const token = await this.authUseCase.login(dto.identifier);

        // Response
        res.sendSuccess(200, { token }, "Login successfully");
      } catch (err) {
        res.sendThrow(err);
      }
    };
  }
}
