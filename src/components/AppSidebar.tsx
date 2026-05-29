import {
  BookOpen,
  Crown,
  Disc3,
  Home,
  Music,
  Settings,
  Wand2,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Create Song", url: "/create", icon: Music, primary: true },
  { title: "Quick Lyrics", url: "/studio", icon: Wand2 },
  { title: "Beat Browser", url: "/beats", icon: Disc3 },
  { title: "My Library", url: "/library", icon: BookOpen },
];

const bottomItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-[rgba(212,175,55,0.06)] px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B8960F] flex items-center justify-center">
            <Crown className="size-4 text-[#070B14]" />
          </div>
          <div>
            <span className="font-bold text-sm text-[#FFF8E7] tracking-tight">
              Centillion Music
            </span>
            <p className="text-[9px] text-[#D4AF37]/50 tracking-wider uppercase">
              Kissi Kingdom
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[#D4AF37]/40 text-[10px] tracking-wider uppercase">
            Studio
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.url ||
                  (item.url !== "/dashboard" &&
                    location.pathname.startsWith(item.url));
                const isPrimary = "primary" in item && item.primary;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={
                        isActive
                          ? "bg-[rgba(212,175,55,0.1)] text-[#E5C158] border-r-2 border-[#D4AF37]"
                          : isPrimary
                            ? "text-[#D4AF37] hover:text-[#E5C158] hover:bg-[rgba(212,175,55,0.08)] font-semibold"
                            : "text-[#8B9BB4] hover:text-[#E5C158] hover:bg-[rgba(212,175,55,0.05)]"
                      }
                    >
                      <Link to={item.url}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[rgba(212,175,55,0.06)]">
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === item.url}
                className={
                  location.pathname === item.url
                    ? "bg-[rgba(212,175,55,0.1)] text-[#E5C158]"
                    : "text-[#8B9BB4] hover:text-[#E5C158] hover:bg-[rgba(212,175,55,0.05)]"
                }
              >
                <Link to={item.url}>
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
