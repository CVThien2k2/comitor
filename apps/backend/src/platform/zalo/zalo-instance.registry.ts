import { Injectable } from "@nestjs/common"

@Injectable()
export class ZaloInstanceRegistry {
  private readonly instances = new Map<string, any>()

  set(userId: string, api: any) {
    this.instances.set(userId, api)
  }

  get(userId: string) {
    return this.instances.get(userId)
  }

  has(userId: string) {
    return this.instances.has(userId)
  }

  remove(userId: string) {
    this.instances.delete(userId)
  }

  size() {
    return this.instances.size
  }
}
