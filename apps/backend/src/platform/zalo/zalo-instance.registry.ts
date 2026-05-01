/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Logger } from "@nestjs/common"
import { LinkAccountService } from "src/core/link-account/link-account.service"
import { QueueService } from "src/queue/queue.service"
import { mapMessage } from "./helper"

@Injectable()
export class ZaloInstanceRegistry {
  private readonly logger = new Logger("ZaloPersonal")
  private readonly instances = new Map<string, any>()

  constructor(
    private readonly linkAccountService: LinkAccountService,
    private readonly queueService: QueueService
  ) {}

  set(id: string, api: any) {
    const existingApi = this.instances.get(id)
    if (existingApi) {
      this.disposeApi(id, existingApi)
    }
    this.instances.set(id, api)
    this.startListening(id, api)
  }

  get(id: string) {
    return this.instances.get(id)
  }

  has(id: string) {
    return this.instances.has(id)
  }

  remove(id: string) {
    const api = this.instances.get(id)
    if (api) {
      this.disposeApi(id, api)
    }
    this.instances.delete(id)
  }

  size() {
    return this.instances.size
  }

  startListening(id: string, api: any) {
    try {
      api.listener.on("connected", () => {})
      api.listener.on("message", async (message) => {
        try {
          const messagePlatform = mapMessage(message, id)
          if (messagePlatform) await this.queueService.addIncomingMessage(messagePlatform)
          else this.logger.error(`Không thể map tin nhắn Zalo: ${JSON.stringify(message)}`)
        } catch (error) {
          this.logger.error(`Không thể map tin nhắn Zalo: ${JSON.stringify(message)}`)
        }
      })
      api.listener.on("old_messages", (messages, type) => {})
      api.listener.on("delivered_messages", (messages) => {})
      api.listener.on("reaction", (reaction) => {})
      api.listener.on("old_reactions", (reactions, isGroup) => {})
      api.listener.on("typing", (typing) => {})
      api.listener.on("upload_attachment", (data) => {})
      api.listener.on("undo", (undo) => {})
      api.listener.on("friend_event", (data) => {})
      api.listener.on("group_event", (data) => {})
      // api.listener.on("cipher_key", (key) => {
      //   console.log("cipher_key", key)
      // })
      api.listener.on("error", (error) => {
        this.logger.error(`Zalo cá nhân bị lỗi, tài khoản ${id}: ${JSON.stringify(error)}`)
      })
      api.listener.on("closed", (code, reason) => {
        this.logger.warn(`Zalo cá nhân bị đóng, tài khoản ${id}: ${code} ${reason}`)
      })
      api.listener.on("disconnected", async (code, reason) => {
        try {
          console.log("disconnected", code, reason)
          if (typeof reason === "string" && reason.includes("KICKOUT_BY_WORKER")) {
            await this.linkAccountService.updateStatus(id, "inactive")
          }
          this.logger.warn(`Zalo cá nhân bị ngắt kết nối, tài khoản ${id}`)
        } catch {
          this.logger.error(`Không thể cập nhật inactive cho tài khoản ${id} `)
        } finally {
          this.remove(id)
        }
      })

      api.listener.start()
    } catch {
      this.logger.error("Mất kết nối với Zalo cá nhân")
    }
  }

  private disposeApi(id: string, api: any) {
    try {
      const listener = api?.listener
      if (listener) {
        if (typeof listener.stop === "function") {
          listener.stop()
        }
        if (typeof listener.removeAllListeners === "function") {
          listener.removeAllListeners()
        }
      }
      if (typeof api?.logout === "function") {
        void api.logout().catch?.(() => undefined)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error"
      this.logger.warn(`Không thể dispose socket Zalo cho tài khoản ${id}: ${message}`)
    }
  }
}
