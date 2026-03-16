import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { ConfigService } from "@nestjs/config"
import { UsersService } from "../../core/users/users.service"
import { RedisService } from "../../redis"

export interface JwtPayload {
  userId: string
  email: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly cacheTtl: number

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly redisService: RedisService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET")!,
    })
    this.cacheTtl = configService.get<number>("REDIS_CACHE_TTL", 300)
  }

  async validate(payload: JwtPayload) {
    const cacheKey = `user:${payload.userId}`

    const cached = await this.redisService.get(cacheKey)
    if (cached) return cached

    const user = await this.usersService.findById(payload.userId)
    if (!user) throw new UnauthorizedException()

    await this.redisService.set(cacheKey, user, this.cacheTtl)
    return user
  }
}
