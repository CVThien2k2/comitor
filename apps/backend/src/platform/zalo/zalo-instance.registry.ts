import { Injectable } from "@nestjs/common"

@Injectable()
export class ZaloInstanceRegistry {
  private readonly instances = new Map<string, any>()

  set(id: string, api: any) {
    this.instances.set(id, api)
  }

  get(id: string) {
    return this.instances.get(id)
  }

  has(id: string) {
    return this.instances.has(id)
  }

  remove(id: string) {
    this.instances.delete(id)
  }

  size() {
    return this.instances.size
  }
}
