import {
  Activity,
  Award,
  BarChart3,
  Boxes,
  ClipboardCheck,
  ClipboardList,
  FolderKanban,
  GraduationCap,
  HeartPulse,
  Image,
  LayoutDashboard,
  PhoneCall,
  Settings,
  UserCog,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

// One entry per top-level `app/(app)/<module>` directory from SPEC §4.7's target tree.
// Deeper subtrees (e.g. hr/leave, finance/vouchers) are added by the phase task that
// actually builds that screen, not pre-created here.
export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Beneficiaries", href: "/beneficiaries", icon: Users },
  { label: "Education", href: "/education", icon: GraduationCap },
  { label: "Activities", href: "/activities", icon: Activity },
  { label: "Health", href: "/health", icon: HeartPulse },
  { label: "Vocational", href: "/vocational", icon: Wrench },
  { label: "Attendance", href: "/attendance", icon: ClipboardCheck },
  { label: "Assessments", href: "/assessments", icon: ClipboardList },
  { label: "Certificates", href: "/certificates", icon: Award },
  { label: "Follow-up", href: "/follow-up", icon: PhoneCall },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Media", href: "/media", icon: Image },
  { label: "HR", href: "/hr", icon: UserCog },
  { label: "Admin", href: "/admin", icon: Boxes },
  { label: "Finance", href: "/finance", icon: Wallet },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
]
