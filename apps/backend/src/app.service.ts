import { Injectable } from "@nestjs/common"
import { UserRole } from "@workspace/shared/enums"
import type { ApiResponse, UserProfile } from "@workspace/shared/types"

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!"
  }

  getUsers(): ApiResponse<UserProfile[]> {
    return {
      success: true,
      data: [
        {
          id: "1",
          email: "admin@example.com",
          avatarUrl: "https://example.com/avatar.png",
          role: UserRole.ADMIN,
        },
        {
          id: "2",
          email: "alice@example.com",
          avatarUrl: "https://example.com/avatar.png",
          role: UserRole.USER,
        },
        {
          id: "3",
          email: "guest@example.com",
          avatarUrl: "https://example.com/avatar.png",
          role: UserRole.GUEST,
        },
      ],
    }
  }
}
