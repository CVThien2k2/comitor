import * as React from "react"
import {
  AlertCircle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpDown,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Building2,
  Calendar,
  Check,
  CheckCheck,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Copy,
  CreditCard,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Gift,
  Globe,
  History,
  Inbox,
  Link2,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Monitor,
  Moon,
  MoreHorizontal,
  PanelLeft,
  PanelLeftClose,
  PanelRight,
  Paperclip,
  Phone,
  Plane,
  Plus,
  Puzzle,
  Radio,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  Smile,
  Sparkles,
  Sun,
  Tag,
  Trash2,
  TrendingUp,
  Unplug,
  Upload,
  User,
  Users,
  Video,
  Volume2,
  Workflow,
  X,
  XCircle,
  Zap,
  type LucideProps,
} from "lucide-react"

export type Icon = React.ComponentType<LucideProps>

const Zalo = ({ className }: LucideProps) => (
  <svg viewBox="0 0 24 24" className={className ?? "size-3.5"} fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 17.785c-.066.037-.273.15-.493.15-.266 0-.463-.135-.59-.405l-1.477-3.13h-5.74l-.003.007-1.46 3.104c-.13.277-.335.424-.612.424-.213 0-.42-.108-.488-.147-.332-.188-.535-.543-.535-.947 0-.16.04-.324.122-.5l4.47-9.297c.174-.36.5-.58.88-.58.382 0 .71.22.884.583l4.47 9.294c.082.176.123.34.123.5 0 .404-.202.76-.551.944zM12 6.82l-2.238 4.643h4.476L12 6.82z" />
  </svg>
)

const Facebook = ({ className }: LucideProps) => (
  <svg viewBox="0 0 24 24" className={className ?? "size-3.5"} fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const Gmail = ({ className }: LucideProps) => (
  <svg viewBox="0 0 24 24" className={className ?? "size-3.5"} fill="currentColor">
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
  </svg>
)

const PhoneChannel = ({ className }: LucideProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className ?? "size-3.5"}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const Website = ({ className }: LucideProps) => (
  <svg
    viewBox="0 0 24 24"
    className={className ?? "size-3.5"}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

export const Icons = {
  alertCircle: AlertCircle,
  arrowDownRight: ArrowDownRight,
  arrowLeft: ArrowLeft,
  arrowUpDown: ArrowUpDown,
  arrowUpRight: ArrowUpRight,
  barChart3: BarChart3,
  bell: Bell,
  bookOpen: BookOpen,
  bot: Bot,
  building2: Building2,
  calendar: Calendar,
  check: Check,
  checkCheck: CheckCheck,
  checkCircle: CheckCircle,
  checkCircle2: CheckCircle2,
  checkSquare: CheckSquare,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  circle: Circle,
  clock: Clock,
  copy: Copy,
  creditCard: CreditCard,
  download: Download,
  edit: Edit3,
  externalLink: ExternalLink,
  eye: Eye,
  eyeOff: EyeOff,
  fileText: FileText,
  filter: Filter,
  gift: Gift,
  globe: Globe,
  history: History,
  inbox: Inbox,
  link: Link2,
  lock: Lock,
  logOut: LogOut,
  mail: Mail,
  mapPin: MapPin,
  menu: Menu,
  messageCircle: MessageCircle,
  messageSquare: MessageSquare,
  messagesSquare: MessagesSquare,
  monitor: Monitor,
  moon: Moon,
  moreHorizontal: MoreHorizontal,
  panelLeft: PanelLeft,
  panelLeftClose: PanelLeftClose,
  panelRight: PanelRight,
  paperclip: Paperclip,
  phone: Phone,
  plane: Plane,
  plus: Plus,
  puzzle: Puzzle,
  radio: Radio,
  refreshCw: RefreshCw,
  search: Search,
  send: Send,
  settings: Settings,
  shield: Shield,
  smile: Smile,
  sparkles: Sparkles,
  spinner: Loader2,
  sun: Sun,
  tag: Tag,
  trash: Trash2,
  trendingUp: TrendingUp,
  unplug: Unplug,
  upload: Upload,
  user: User,
  users: Users,
  video: Video,
  volume2: Volume2,
  workflow: Workflow,
  x: X,
  xCircle: XCircle,
  zap: Zap,
  zalo: Zalo,
  facebook: Facebook,
  gmail: Gmail,
  phoneChannel: PhoneChannel,
  website: Website,
}
