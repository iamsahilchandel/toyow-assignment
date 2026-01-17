import * as React from "react";
import { LayoutDashboard, GitBranch, Play, Workflow, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../ui/sidebar";
import { useAppSelector } from "../../app/hooks";
import { isAdmin } from "../constants/roles";
import { useNavigate } from "react-router-dom";

// Navigation data
const navMain = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Workflows",
    url: "/workflows",
    icon: GitBranch,
  },
  {
    title: "Runs",
    url: "/runs",
    icon: Play,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const isUserAdmin = user ? isAdmin(user.role) : false;

  const navigation = isUserAdmin
    ? [
        ...navMain,
        {
          title: "Plugins",
          url: "/plugins",
          icon: Settings,
        },
      ]
    : navMain;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Workflow className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    Workflow Platform
                  </span>
                  <span className="truncate text-xs">Automation</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                onClick={() => navigate(item.url)}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* User info can be added here */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
