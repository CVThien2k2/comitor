import { Injectable, NotFoundException } from "@nestjs/common"
import { randomUUID } from "crypto"
import { Observable, Subject } from "rxjs"
import { ZaloInstanceRegistry } from "./zalo-instance.registry"

type ZaloLoginStatus = "qr_ready" | "scanned" | "success" | "expired" | "declined" | "error"

export type ZaloLoginEvent = {
  status: ZaloLoginStatus
}

type ZaloLoginSession = {
  userId: string
  events: Subject<ZaloLoginEvent>
  timeout: NodeJS.Timeout
}

@Injectable()
export class ZaloService {
  private readonly loginSessions = new Map<string, ZaloLoginSession>()

  constructor(private readonly zaloInstanceRegistry: ZaloInstanceRegistry) {}

  async login(userId: string) {
    const sessionId = randomUUID()
    const events = new Subject<ZaloLoginEvent>()
    const timeout = setTimeout(() => {
      this.emitLoginEvent(sessionId, { status: "expired" })
      this.closeLoginSession(sessionId)
    }, 5 * 60 * 1000)

    this.loginSessions.set(sessionId, { userId, events, timeout })

    const zcaJs = (await import("zca-js")) as any
    const zalo = new zcaJs.Zalo({ selfListen: true })

    return await new Promise((resolve, reject) => {
      const loginPromise = zalo.loginQR({}, (event) => {
        if (event.type === zcaJs.LoginQRCallbackEventType.QRCodeGenerated) {
          const image = event.data?.image
          if (!image) {
            const error = new Error("Zalo QR payload does not include an image")
            this.emitLoginEvent(sessionId, { status: "error" })
            this.closeLoginSession(sessionId)
            reject(error)
            return
          }

          this.emitLoginEvent(sessionId, { status: "qr_ready" })
          resolve({
            sessionId,
            userId,
            status: "qr_ready",
            qrCode: `data:image/png;base64,${image}`,
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
        .then((api) => {
          if (!this.loginSessions.has(sessionId)) return
          this.zaloInstanceRegistry.set(userId, api)
          this.emitLoginEvent(sessionId, { status: "success" })
          this.closeLoginSession(sessionId)
        })
        .catch((error: Error) => {
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
    this.loginSessions.get(sessionId)?.events.next(event)
  }

  private closeLoginSession(sessionId: string) {
    const session = this.loginSessions.get(sessionId)
    if (!session) return

    clearTimeout(session.timeout)
    session.events.complete()
    this.loginSessions.delete(sessionId)
  }
}
