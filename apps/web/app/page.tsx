import LoginZaloOA from "@/components/LoginZaloOA"
import type { User } from "@workspace/database"
import type { ApiResponse } from "@workspace/shared/types"

type UserItem = Pick<User, "id" | "email" | "username">

async function getUsers(): Promise<UserItem[]> {
  try {
    const res = await fetch("http://localhost:8000/users", {
      cache: "no-store",
    })
    const json = (await res.json()) as ApiResponse<UserItem[]>
    return json.data ?? []
  } catch {
    return []
  }
}

export default async function Page() {
  const users = await getUsers()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-2xl">
        <LoginZaloOA />
      </div>
    </div>
  )
}
