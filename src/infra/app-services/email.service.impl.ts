import type { EmailService } from "@application/services";
import type { User } from "@domain/entities/user";
import { createTransport, type Transporter } from "nodemailer";

export class EmailServiceImpl implements EmailService {
  private readonly transport: Transporter;
  private readonly baseUrl: string;
  private readonly user: string;
  constructor(baseUrl: string, user: string, password: string) {
    this.baseUrl = baseUrl;
    this.user = user;
    this.transport = createTransport({
      service: "gmail",
      auth: {
        user: user,
        pass: password,
      },
    });
  }

  async sendVerifyEmail(
    user: User,
    token: string,
    path: string,
  ): Promise<void> {
    checkPath(path);
    const message = {
      from: this.user,
      to: user.identifier.email,
      subject: "Email verification",
      text: `Enter this link for the verification: ${this.baseUrl}${path}?token=${token}`,
    };

    await this.transport.sendMail(message);
  }

  async sendRecoveryPassword(
    user: User,
    token: string,
    path: string,
  ): Promise<void> {
    checkPath(path);
    console.log(user, token, path);
  }
}

// Helper
const checkPath = (p: string) => {
  if (!p.startsWith("/") || p.endsWith("/")) {
    throw new Error("Invalid URL format");
  }
};
