import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { randomUUID } from "crypto"
import { Observable, Subject } from "rxjs"
import { mapAccountInfo } from "./helper"
import { ZaloInstanceRegistry } from "./zalo-instance.registry"
import { LinkAccountService } from "src/core/link-account/link-account.service"

type ZaloLoginStatus = "qr_ready" | "scanned" | "success" | "expired" | "declined" | "error"

export type ZaloLoginEvent = {
  status: ZaloLoginStatus
}

type ZaloLoginSession = {
  userId: string
  status: ZaloLoginStatus
  qrCode?: string
  events: Subject<ZaloLoginEvent>
  timeout: NodeJS.Timeout
}

@Injectable()
export class ZaloService {
  private readonly loginSessions = new Map<string, ZaloLoginSession>() //Phiên đăng nhập Zalo
  private readonly userLoginSessions = new Map<string, string>()
  private readonly logger = new Logger("ZaloPersonal")

  constructor(
    private readonly zaloInstanceRegistry: ZaloInstanceRegistry,
    private readonly linkAccountService: LinkAccountService
  ) {} //Registry để lưu trữ các instance Zalo

  async login(userId: string) {
    const existingSessionId = this.userLoginSessions.get(userId)
    const existingSession = existingSessionId ? this.loginSessions.get(existingSessionId) : null

    if (existingSession?.qrCode)
      return {
        sessionId: existingSessionId,
        userId,
        status: existingSession.status,
        qrCode: existingSession.qrCode,
      }

    const sessionId = randomUUID()
    const events = new Subject<ZaloLoginEvent>()
    const timeout = setTimeout(
      () => {
        this.emitLoginEvent(sessionId, { status: "expired" })
        this.closeLoginSession(sessionId)
      },
      5 * 60 * 1000
    )

    this.loginSessions.set(sessionId, {
      userId,
      status: "qr_ready",
      events,
      timeout,
    })

    const zcaJs = (await import("zca-js")) as any
    const zalo = new zcaJs.Zalo({ selfListen: true, logging: false })

    return await new Promise((resolve, reject) => {
      const loginPromise = zalo.loginQR({}, (event) => {
        const session = this.loginSessions.get(sessionId)
        if (!session) return
        if (event.type === zcaJs.LoginQRCallbackEventType.QRCodeGenerated) {
          const image = event.data?.image
          if (!image) {
            const error = new Error("Zalo QR payload does not include an image")
            this.emitLoginEvent(sessionId, { status: "error" })
            this.closeLoginSession(sessionId)
            reject(error)
            return
          }

          const qrCode = `data:image/png;base64,${image}`
          session.qrCode = qrCode
          this.userLoginSessions.set(userId, sessionId)
          this.emitLoginEvent(sessionId, { status: "qr_ready" })
          resolve({
            sessionId,
            userId,
            status: "qr_ready",
            qrCode,
          })
          return
        }

        if (event.type === zcaJs.LoginQRCallbackEventType.QRCodeScanned) {
          this.emitLoginEvent(sessionId, { status: "scanned" })
          return
        }

        if (event.type === zcaJs.LoginQRCallbackEventType.QRCodeExpired) {
          this.emitLoginEvent(sessionId, { status: "expired" })
          this.closeLoginSession(sessionId)
          return
        }
        if (event.type === zcaJs.LoginQRCallbackEventType.QRCodeDeclined) {
          this.emitLoginEvent(sessionId, { status: "declined" })
          this.closeLoginSession(sessionId)
        }
      })

      loginPromise
        .then(async (api) => {
          if (!this.loginSessions.has(sessionId)) return
          const accountInfo = await mapAccountInfo(api)
          const linkAccount = await this.linkAccountService.create({
            ...accountInfo,
            createdBy: userId,
          })
          this.zaloInstanceRegistry.set(linkAccount.accountId as string, api)
          this.emitLoginEvent(sessionId, { status: "success" })
          this.closeLoginSession(sessionId)
        })
        .catch((error: Error) => {
          this.logger.error(`Lỗi khi đăng nhập Zalo cá nhân: ${error.message}`)
          if (!this.loginSessions.has(sessionId)) return
          this.emitLoginEvent(sessionId, { status: "error" })
          this.closeLoginSession(sessionId)
          reject(error)
        })
    })
  }

  subscribeLoginEvents(sessionId: string): Observable<ZaloLoginEvent> {
    const session = this.loginSessions.get(sessionId)
    if (!session) throw new NotFoundException("Phiên đăng nhập Zalo không tồn tại hoặc đã kết thúc")

    return session.events.asObservable()
  }

  private emitLoginEvent(sessionId: string, event: ZaloLoginEvent) {
    const session = this.loginSessions.get(sessionId)
    if (!session) return

    session.status = event.status
    session.events.next(event)
  }

  private closeLoginSession(sessionId: string) {
    const session = this.loginSessions.get(sessionId)
    if (!session) return

    clearTimeout(session.timeout)
    session.events.complete()
    this.loginSessions.delete(sessionId)
    if (this.userLoginSessions.get(session.userId) === sessionId) {
      this.userLoginSessions.delete(session.userId)
    }
  }
}
