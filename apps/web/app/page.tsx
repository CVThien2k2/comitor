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
        <h1 className="mb-6 text-2xl font-semibold">Users</h1>

        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Không có dữ liệu — hãy chắc backend đang chạy trên port 8000.
          </p>
        ) : (
          <ul className="space-y-3">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
