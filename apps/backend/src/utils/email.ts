export type EmailPayload = {
  email: string
  firstName?: string
  otp?: string
  url?: string
  verificationCode?: string
  title?: string
  content?: string
  trackingCode?: string
  frontendUrl?: string
}

export enum EmailType {
  RESET_PASSWORD = "RESET_PASSWORD",
}

type EmailBody = {
  from: string
  to: string
  subject: string
  html: string
}

export function getEmailBody(type: EmailType, payload: EmailPayload, from: string): EmailBody {
  switch (type) {
    case EmailType.RESET_PASSWORD:
      return {
        from,
        to: payload.email,
        subject: "Đặt lại mật khẩu - Comitor",
        html: resetPasswordHtml(payload),
      }
  }
}

function resetPasswordHtml(payload: EmailPayload): string {
  const { firstName, url } = payload
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Đặt lại mật khẩu</h2>
      <p>Xin chào <strong>${firstName ?? ""}</strong>,</p>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
      <p>
        <a href="${url}"
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">
          Đặt lại mật khẩu
        </a>
      </p>
      <p style="color: #6b7280; font-size: 14px;">Link này sẽ hết hạn sau 15 phút.</p>
      <p style="color: #6b7280; font-size: 14px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
    </div>
  `
}
