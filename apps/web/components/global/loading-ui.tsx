export default function LoadingUI() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="relative h-32 w-32">
        {/* Outer rotating ring */}
        <div className="animate-spin-slow absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary" />

        {/* Middle rotating ring with reverse direction */}
        <div
          className="animate-spin-slow absolute inset-4 rounded-full border-2 border-transparent border-b-primary border-l-primary"
          style={{ animationDirection: "reverse" }}
        />

        {/* Inner pulsing circle */}
        <div className="animate-pulse-glow absolute inset-8 rounded-full bg-primary/10" />

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}
