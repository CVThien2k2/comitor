import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ResendService } from "nestjs-resend"

@Injectable()
export class EmailService {
  private readonly fromEmail: string
  private readonly frontendUrl: string

  constructor(
    private readonly resendService: ResendService,
    private readonly configService: ConfigService
  ) {
    this.fromEmail = this.configService.get<string>(
      "EMAIL_FROM",
      "noreply@comitor.app"
    )
    this.frontendUrl = this.configService.get<string>(
      "FRONTEND_URL",
      "http://localhost:3000"
    )
  }

  /** Send a raw email */
  async send(params: {
    from?: string
    to: string
    subject: string
    html: string
  }) {
    return this.resendService.emails.send({
      from: params.from || this.fromEmail,
      to: params.to,
      subject: params.subject,
      html: params.html,
    })
  }
}
