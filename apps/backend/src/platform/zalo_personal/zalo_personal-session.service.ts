import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common"
import { PrismaService } from "../../database/prisma.service"
import { ActiveZaloPersonalSession, ZaloPersonalUserProfile } from "../../utils/types"
import { parseZaloPersonalCredentials } from "./utils/credentials"
import { stringifyUnknownError } from "./utils/error"
import { ZaloPersonalClientFactory } from "./zalo_personal-client.factory"
import { ZaloPersonalListenerParams, ZaloPersonalListenerService } from "./zalo_personal-listener.service"

@Injectable()
export class ZaloPersonalSessionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ZaloPersonalSessionService.name)
  private readonly activeSessions = new Map<string, ActiveZaloPersonalSession>()

  constructor(
    private readonly prisma: PrismaService,
    private readonly clientFactory: ZaloPersonalClientFactory,
    private readonly listenerService: ZaloPersonalListenerService
  ) {}

  async onModuleInit() {
    await this.restoreActiveSessions()
  }

  onModuleDestroy() {
    for (const [sessionKey, session] of this.activeSessions.entries()) {
      this.stopExistingSession(sessionKey, session)
    }
  }

  async getUserProfile(userId: string, linkedAccountId: string): Promise<ZaloPersonalUserProfile> {
    const normalizedUserId = String(userId).trim()

    if (!normalizedUserId) {
      throw new BadRequestException("Thiếu userId Zalo Personal để lấy hồ sơ")
    }

    const session = await this.ensureActiveSession(linkedAccountId)
    const response = await session.api.getUserInfo(normalizedUserId)
    const changedProfiles = response?.changed_profiles ?? {}
    const normalizedLookupId = normalizedUserId.includes("_") ? normalizedUserId : `${normalizedUserId}_0`
    const profile =
      changedProfiles[normalizedLookupId] ??
      changedProfiles[normalizedUserId] ??
      Object.values(changedProfiles).find((item) => item && typeof item === "object")

    if (!profile) {
      throw new NotFoundException(`Không tìm thấy hồ sơ Zalo Personal cho user ${normalizedUserId}`)
    }

    return profile as ZaloPersonalUserProfile
  }

  async getGroupConversationName(
    groupId: string,
    linkedAccountId: string
  ): Promise<{ name: string; avatarUrl: string }> {
    const normalizedGroupId = String(groupId).trim()

    if (!normalizedGroupId) {
      throw new BadRequestException("Thiếu groupId Zalo Personal để lấy tên cuộc hội thoại nhóm")
    }

    const session = await this.ensureActiveSession(linkedAccountId)
    const response = await session.api.getGroupInfo(normalizedGroupId)
    console.log("response", JSON.stringify(response, null, 2))
    const groupInfoMap = response?.gridInfoMap ?? {}
    const groupInfo = groupInfoMap[normalizedGroupId] ?? Object.values(groupInfoMap)[0]

    if (!groupInfo) {
      throw new NotFoundException(`Không tìm thấy thông tin nhóm Zalo Personal cho group ${normalizedGroupId}`)
    }

    return { name: groupInfo["name"] ?? `Nhóm ${normalizedGroupId}`, avatarUrl: groupInfo["fullAvt"] ?? null }
  }

  activateSession(params: ZaloPersonalListenerParams) {
    const existingSession = this.activeSessions.get(params.sessionKey)

    if (existingSession?.api && existingSession.api !== params.api) {
      this.stopExistingSession(params.sessionKey, existingSession)
    }

    this.listenerService.start(params)

    this.activeSessions.set(params.sessionKey, {
      id: params.sessionKey,
      status: "authenticated",
      api: params.api,
      accountId: params.accountId,
      displayName: params.displayName,
    })
  }

  disconnectSession(linkedAccountId: string) {
    const session = this.activeSessions.get(linkedAccountId)

    if (!session) {
      return
    }

    this.stopExistingSession(linkedAccountId, session)
    this.activeSessions.delete(linkedAccountId)
  }

  async ensureActiveSession(linkedAccountId: string): Promise<ActiveZaloPersonalSession> {
    const activeSession = this.activeSessions.get(linkedAccountId)

    if (activeSession?.api) {
      return activeSession
    }

    const linkedAccount = await this.prisma.client.linkAccount.findUnique({
      where: { id: linkedAccountId },
      include: {
        providerCredentials: true,
      },
    })

    if (!linkedAccount || linkedAccount.provider !== "zalo_personal") {
      throw new NotFoundException("Không tìm thấy tài khoản Zalo Personal đã liên kết")
    }

    if (!linkedAccount.providerCredentials?.credentialPayload) {
      throw new NotFoundException("Tài khoản Zalo Personal chưa có credentials để khôi phục phiên")
    }

    const credentials = parseZaloPersonalCredentials(linkedAccount.providerCredentials.credentialPayload)

    if (!credentials) {
      throw new BadRequestException("Credentials Zalo Personal không hợp lệ")
    }

    try {
      const api = await this.clientFactory.loginWithCredentials(credentials)
      const accountId = api.getOwnId?.() ?? linkedAccount.accountId

      this.activateSession({
        sessionKey: linkedAccount.id,
        api,
        accountId,
        displayName: linkedAccount.displayName,
        source: "restore",
      })
    } catch (error) {
      throw new BadRequestException(`Không thể khôi phục phiên Zalo Personal: ${stringifyUnknownError(error)}`)
    }

    const restoredSession = this.activeSessions.get(linkedAccountId)

    if (!restoredSession?.api) {
      throw new NotFoundException("Không thể khởi tạo phiên Zalo Personal đang hoạt động")
    }

    return restoredSession
  }

  private normalizeAttachmentFilename(fileName?: string): `${string}.${string}` {
    const normalizedFileName = fileName?.trim() || "attachment.bin"

    if (normalizedFileName.includes(".") && !normalizedFileName.endsWith(".")) {
      return normalizedFileName as `${string}.${string}`
    }

    return `${normalizedFileName}.bin` as `${string}.${string}`
  }

  private async restoreActiveSessions() {
    const linkedAccounts = await this.prisma.client.linkAccount.findMany({
      where: {
        provider: "zalo_personal",
        accountId: {
          not: null,
        },
      },
      include: {
        providerCredentials: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    if (linkedAccounts.length === 0) {
      this.logger.log("Khong tim thay tai khoan Zalo Personal nao can khoi phuc listener")
      return
    }

    for (const linkedAccount of linkedAccounts) {
      if (!linkedAccount.providerCredentials?.credentialPayload) {
        this.logger.warn(`Bo qua khoi phuc Zalo Personal do thieu credentials (linkedAccountId=${linkedAccount.id})`)
        continue
      }

      const credentials = parseZaloPersonalCredentials(linkedAccount.providerCredentials.credentialPayload)

      if (!credentials) {
        this.logger.warn(`Credentials Zalo Personal khong hop le (linkedAccountId=${linkedAccount.id})`)
        continue
      }

      try {
        const api = await this.clientFactory.loginWithCredentials(credentials)
        const ownId = api.getOwnId?.() ?? linkedAccount.accountId

        this.activateSession({
          sessionKey: linkedAccount.id,
          api,
          accountId: ownId ?? linkedAccount.accountId,
          displayName: linkedAccount.displayName,
          source: "restore",
        })
      } catch (error) {
        this.logger.error(
          `Khoi phuc listener Zalo Personal that bai (linkedAccountId=${linkedAccount.id}, accountId=${linkedAccount.accountId ?? "unknown"}): ${stringifyUnknownError(error)}`,
          error instanceof Error ? error.stack : undefined
        )
      }
    }
  }

  private stopExistingSession(sessionKey: string, session: ActiveZaloPersonalSession) {
    try {
      session.api?.listener?.stop?.()
    } catch (error) {
      this.logger.warn(
        `Khong the dung listener cu truoc khi thay the (sessionKey=${sessionKey}): ${stringifyUnknownError(error)}`
      )
    }
  }
}
