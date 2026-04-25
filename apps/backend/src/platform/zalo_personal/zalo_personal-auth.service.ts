// import {
//   BadRequestException,
//   ConflictException,
//   ForbiddenException,
//   Injectable,
//   Logger,
//   NotFoundException,
// } from "@nestjs/common"
// import { randomUUID } from "crypto"
// import { PrismaService } from "src/database/prisma.service"
// import { PublicZaloPersonalLoginSession, ZaloPersonalAccountLinked, ZaloPersonalLoginSession } from "src/utils/types"
// import { ZaloPersonalClientFactory } from "./zalo_personal-client.factory"
// import { ZaloPersonalSessionService } from "./zalo_personal-session.service"
// import { buildZaloPersonalCredentialsPayload } from "./utils/credentials"
// import { formatZaloPersonalLoginError } from "./utils/error"

// @Injectable()
// export class ZaloPersonalAuthService {
//   private readonly logger = new Logger(ZaloPersonalAuthService.name)
//   private readonly sessions = new Map<string, ZaloPersonalLoginSession>()

//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly clientFactory: ZaloPersonalClientFactory,
//     private readonly sessionService: ZaloPersonalSessionService
//   ) {}

//   async getLinkedStatus(userId: string) {
//     const linkedAccount = await this.findLinkedAccountByUserId(userId)

//     return {
//       linked: !!linkedAccount,
//       linkedAccount,
//     }
//   }

//   async loginWithQR(userId: string) {
//     const existingLinkedAccount = await this.findLinkedAccountByUserId(userId)

//     if (existingLinkedAccount) {
//       throw new BadRequestException("Tài khoản Zalo cá nhân đã được liên kết")
//     }

//     const sessionId = randomUUID()
//     const { zcaJs, zalo } = await this.clientFactory.createClient()

//     const session: ZaloPersonalLoginSession = {
//       id: sessionId,
//       userId,
//       status: "pending",
//     }

//     this.sessions.set(sessionId, session)

//     return await new Promise<PublicZaloPersonalLoginSession>((resolve, reject) => {
//       let hasResolvedQr = false

//       // zalo
//       //   .loginQR({}, (event: any) => {
//       //     if (event.type === zcaJs.LoginQRCallbackEventType.QRCodeGenerated) {
//       //       session.qrImage = `data:image/png;base64,${event.data.image}`
//       //       session.status = "qr_ready"
//       //       this.logger.log(`Da tao ma QR Zalo Personal (sessionId=${session.id}, userId=${session.userId})`)

//       //       if (!hasResolvedQr) {
//       //         hasResolvedQr = true
//       //         resolve(this.serializeSession(session))
//       //       }
//       //     }

//       //     if (event.type === zcaJs.LoginQRCallbackEventType.QRCodeScanned) {
//       //       session.status = "scanned"
//       //       session.displayName = event.data.display_name
//       //       this.logger.log(
//       //         `Ma QR Zalo Personal da duoc quet (sessionId=${session.id}, userId=${session.userId}, displayName=${session.displayName ?? "unknown"})`
//       //       )
//       //     }

//       //     if (event.type === zcaJs.LoginQRCallbackEventType.QRCodeExpired) {
//       //       session.status = "failed"
//       //       session.error = "Mã QR đã hết hạn"
//       //       this.logger.warn(
//       //         `Ma QR dang nhap Zalo Personal da het han (sessionId=${session.id}, userId=${session.userId})`
//       //       )
//       //     }

//       //     if (event.type === zcaJs.LoginQRCallbackEventType.QRCodeDeclined) {
//       //       session.status = "failed"
//       //       session.error = "Mã QR đã bị từ chối"
//       //       this.logger.warn(
//       //         `Dang nhap Zalo Personal bi tu choi (sessionId=${session.id}, userId=${session.userId}, displayName=${session.displayName ?? "unknown"})`
//       //       )
//       //     }
//       //   })
//       //   .then(async (api: any) => {
//       //     session.ownId = api.getOwnId()

//       //     await this.prisma.client.$transaction(async (tx) => {
//       //       if (!session.ownId) {
//       //         throw new BadRequestException("Không lấy được ID tài khoản Zalo cá nhân")
//       //       }

//       //       const existingByAccount = await tx.linkAccount.findFirst({
//       //         where: {
//       //           provider: "zalo_personal",
//       //           accountId: session.ownId,
//       //         },
//       //       })

//       //       if (existingByAccount && existingByAccount.linkedByUserId !== userId) {
//       //         throw new ConflictException("Tài khoản Zalo cá nhân này đã được liên kết bởi người dùng khác")
//       //       }

//       //       const existingByUser = await tx.linkAccount.findFirst({
//       //         where: {
//       //           provider: "zalo_personal",
//       //           linkedByUserId: userId,
//       //         },
//       //         orderBy: { createdAt: "desc" },
//       //       })

//       //       const linkedAccount = existingByUser
//       //         ? await tx.linkAccount.update({
//       //             where: { id: existingByUser.id },
//       //             data: {
//       //               accountId: session.ownId,
//       //               displayName: session.displayName ?? null,
//       //             },
//       //           })
//       //         : await tx.linkAccount.create({
//       //             data: {
//       //               provider: "zalo_personal",
//       //               linkedByUserId: userId,
//       //               accountId: session.ownId,
//       //               displayName: session.displayName ?? null,
//       //               providerCredentialsId: session.ownId,
//       //             },
//       //           })

//       //       session.linkedAccount = {
//       //         id: linkedAccount.id,
//       //         provider: "zalo_personal",
//       //         displayName: linkedAccount.displayName,
//       //         accountId: linkedAccount.accountId,
//       //         avatarUrl: linkedAccount.avatarUrl,
//       //       }

//       //       await tx.providerCredentials.upsert({
//       //         where: {
//       //           linkAccountId: linkedAccount.id,
//       //         },
//       //         create: {
//       //           credentialType: "browser_session",
//       //           credentialPayload: buildZaloPersonalCredentialsPayload(api),
//       //           linkAccountId: linkedAccount.id,
//       //         },
//       //         update: {
//       //           credentialPayload: buildZaloPersonalCredentialsPayload(api),
//       //         },
//       //       })
//       //     })

//       //     session.status = "authenticated"
//       //     this.logger.log(
//       //       `Dang nhap Zalo Personal thanh cong (sessionId=${session.id}, userId=${session.userId}, ownId=${session.ownId ?? "unknown"}, displayName=${session.displayName ?? "unknown"})`
//       //     )

//       //     if (!session.linkedAccount || !session.ownId) {
//       //       throw new BadRequestException("Không thể khởi tạo listener cho Zalo cá nhân")
//       //     }

//       //     this.sessionService.activateSession({
//       //       sessionKey: session.linkedAccount.id,
//       //       api,
//       //       accountId: session.ownId,
//       //       displayName: session.displayName ?? session.linkedAccount.displayName ?? null,
//       //       source: "qr_login",
//       //     })
//       //   })
//       //   .catch((error: unknown) => {
//       //     const message = error instanceof Error ? error.message : "Đăng nhập bằng mã QR thất bại"

//       //     session.status = "failed"
//       //     session.error = message

//       //     this.logger.error(
//       //       formatZaloPersonalLoginError(error, session),
//       //       error instanceof Error ? error.stack : undefined
//       //     )

//       //     if (!hasResolvedQr) {
//       //       reject(new Error(message))
//       //     }
//       //   })
//     })
//   }

//   getLoginStatus(userId: string, sessionId: string) {
//     const session = this.sessions.get(sessionId)

//     if (!session) {
//       throw new NotFoundException("Không tìm thấy phiên đăng nhập")
//     }

//     if (session.userId !== userId) {
//       throw new ForbiddenException("Bạn không có quyền xem phiên đăng nhập này")
//     }

//     return this.serializeSession(session)
//   }

//   private serializeSession(session: ZaloPersonalLoginSession): PublicZaloPersonalLoginSession {
//     return {
//       id: session.id,
//       qrImage: session.qrImage,
//       ownId: session.ownId,
//       displayName: session.displayName,
//       error: session.error,
//       status: session.status,
//       linkedAccount: session.linkedAccount,
//     }
//   }

//   private async findLinkedAccountByUserId(userId: string): Promise<ZaloPersonalAccountLinked | null> {
//     // const linkedAccount = await this.prisma.client.linkAccount.findFirst({
//     //   where: {
//     //     linkedByUserId: userId,
//     //     provider: "zalo_personal",
//     //   },
//     //   orderBy: { createdAt: "desc" },
//     // })

//     // if (!linkedAccount) {
//     return null
//     // }

//     // return {
//     //   id: linkedAccount.id,
//     //   provider: "zalo_personal",
//     //   displayName: linkedAccount.displayName,
//     //   accountId: linkedAccount.accountId,
//     //   avatarUrl: linkedAccount.avatarUrl,
//     // }
//   }
// }
