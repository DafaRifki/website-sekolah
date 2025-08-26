import * as React from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  PieChart,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
} from "lucide-react";

import { NavUser } from "@/components/nav-user";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavLinks } from "./nav-links";
import { TeamSwitcher } from "./team-switcher";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    email: string;
    role: "ADMIN" | "GURU" | "SISWA";
  } | null;
};

const menuItems = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  ADMIN: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Kelola Data",
      url: "#",
      icon: Users,
      items: [
        { title: "Guru", url: "/guru" },
        { title: "Siswa", url: "/siswa" },
        { title: "Kelas", url: "/kelas" },
      ],
    },
  ],
  GURU: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Akademik",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Input Nilai", url: "/nilai" },
        { title: "Absensi", url: "/absensi" },
      ],
    },
  ],
  SISWA: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Menu Siswa",
      url: "#",
      icon: PieChart,
      items: [
        { title: "Nilai Saya", url: "/nilai" },
        { title: "Jadwal", url: "/jadwal" },
      ],
    },
  ],
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const role = user?.role || "SISWA";
  const items = menuItems[role];

  // pisahkan dashboard menu di setiap role
  const dashboardLink = items.find((item) => item.title === "Dashboard");
  const roleMenus = items.filter((item) => item.title !== "Dashboard");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={[
            {
              name: "SMA IT As-Sakinah", // nama aplikasi
              logo: () => (
                <img
                  src="/img/logo.png"
                  alt="Logo"
                  className="rounded-md bg-white"
                />
              ),
              plan: "v1.0.0", // bisa diganti info versi / tagline
            },
          ]}
        />
        {/* <div className="flex items-center gap-2 px-2 py-3">
          <img src="/img/logo.png" alt="Logo" className="h-8 w-8 rounded" />
          <span className="font-bold text-lg">SMA IT As-Sakinah</span>
        </div> */}
      </SidebarHeader>
      <SidebarContent>
        {dashboardLink && (
          <NavLinks
            title="Dashboard"
            links={[
              {
                name: dashboardLink.title,
                url: dashboardLink.url,
                icon: dashboardLink.icon,
              },
            ]}
          />
        )}

        {roleMenus.length > 0 && <NavMain items={roleMenus} />}
        {/* <NavLinks
          title="Dashboard"
          links={[
            { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
          ]}
        /> */}
        {/* <NavMain items={items} /> */}
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
