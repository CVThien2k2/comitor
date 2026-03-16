import { Eye, EyeOff, Mail, Lock, Loader2, type LucideProps } from "lucide-react"

export type Icon = React.ComponentType<LucideProps>

export const Icons = {
  eye: Eye,
  eyeOff: EyeOff,
  mail: Mail,
  lock: Lock,
  spinner: Loader2,
}
