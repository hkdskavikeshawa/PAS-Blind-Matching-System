import {
  FileText, Search, BookOpen, Users, Settings, LayoutDashboard,
  Tag, GitCompare, Shield, Activity, UserPlus, Eye
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

const NAV_ITEMS: Record<UserRole, { title: string; url: string; icon: React.ElementType }[]> = {
  student: [
    { title: "My Proposals", url: "/student/proposals", icon: FileText },
    { title: "New Proposal", url: "/student/proposals/new", icon: UserPlus },
  ],
  supervisor: [
    { title: "Blind Review", url: "/supervisor/review", icon: Eye },
    { title: "My Matches", url: "/supervisor/matches", icon: GitCompare },
    { title: "Expertise", url: "/supervisor/expertise", icon: Tag },
  ],
  module_leader: [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Allocations", url: "/admin/allocations", icon: GitCompare },
    { title: "Research Areas", url: "/admin/research-areas", icon: BookOpen },
    { title: "Users", url: "/admin/users", icon: Users },
  ],
  system_admin: [
    { title: "Users & Roles", url: "/sysadmin/users", icon: Shield },
    { title: "Configuration", url: "/sysadmin/config", icon: Settings },
    { title: "Activity Log", url: "/sysadmin/activity", icon: Activity },
  ],
};

const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  supervisor: "Supervisor",
  module_leader: "Module Leader",
  system_admin: "System Admin",
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  const items = NAV_ITEMS[user.role];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Search className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-sidebar-foreground">BlindMatch</h2>
              <p className="text-xs text-sidebar-foreground/60">PAS</p>
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{ROLE_LABELS[user.role]}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink to={item.url} className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-sidebar-primary text-sidebar-primary-foreground">
                {user.avatarInitials}
              </AvatarFallback>
            </Avatar>
            <div className="truncate">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/60 truncate">{user.email}</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
