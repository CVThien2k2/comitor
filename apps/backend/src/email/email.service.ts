import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ResendService } from "nestjs-resend"
import { type EmailPayload, EmailType, getEmailBody } from "../utils/email"

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private readonly fromEmail: string

  constructor(
    private readonly resendService: ResendService,
    private readonly configService: ConfigService
  ) {
    this.fromEmail = this.configService.get<string>("EMAIL_FROM", "noreply@comitor.app")
  }

  async send(type: EmailType, payload: EmailPayload): Promise<void> {
    const body = getEmailBody(type, payload, this.fromEmail)
    try {
      const result = await this.resendService.emails.send(body)
      if (result.error) {
        this.logger.error(`[Resend] ${type} failed: ${result.error.name} - ${result.error.message}`)
        return
      }
      this.logger.log(`Email sent: ${type} to ${body.to}`)
    } catch (err) {
      this.logger.error(`[Resend] ${type} failed: ${(err as Error)?.message ?? err}`, (err as Error)?.stack)
    }
  }
}
