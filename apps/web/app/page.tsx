import { UserRole } from "@workspace/shared/enums"
import type { ApiResponse, UserProfile } from "@workspace/shared/types"

async function getUsers(): Promise<UserProfile[]> {
  try {
    const res = await fetch("http://localhost:8000/users", {
      cache: "no-store",
    })
    const json: ApiResponse<UserProfile[]> = (await res.json()) as ApiResponse<
      UserProfile[]
    >
    return json.data ?? []
  } catch {
    return []
  }
}

const roleColors: Record<UserRole, string> = {
  [UserRole.ADMIN]: "bg-red-100 text-red-700",
  [UserRole.USER]: "bg-blue-100 text-blue-700",
  [UserRole.GUEST]: "bg-gray-100 text-gray-600",
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
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${roleColors[user.role]}`}
                >
                  {user.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
