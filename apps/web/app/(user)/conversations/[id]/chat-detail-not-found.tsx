export function ChatDetailNotFound() {
  return (
    <div className="flex h-full items-center justify-center bg-background px-4">
      <div className="text-center">
        <p className="text-base font-medium text-foreground">Không tồn tại</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Không tìm thấy cuộc trò chuyện hoặc bạn không có quyền truy cập.
        </p>
      </div>
    </div>
  )
}
