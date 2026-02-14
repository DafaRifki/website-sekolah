import * as React from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  PieChart,
  Bell,
  Notebook,
  FileUser,
  Banknote,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

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

type Role = "ADMIN" | "GURU" | "SISWA";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    email: string;
    role: Role;
  } | null;
};

type MenuSection = {
  type: "link" | "main";
  title: string;
  links?: { name: string; url: string; icon: LucideIcon }[];
  items?: {
    title: string;
    url: string;
    icon: LucideIcon;
    items?: { title: string; url: string }[];
  }[];
};

const menuItems: Record<Role, MenuSection[]> = {
  ADMIN: [
    {
      type: "link",
      title: "Dashboard",
      links: [
        {
          name: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      type: "main",
      title: "Kelola Data",
      items: [
        {
          title: "Kelola Data",
          url: "#",
          icon: Users,
          items: [
            { title: "Guru", url: "/guru" },
            { title: "Guru Mapel", url: "/guru-mapel" },
            { title: "Siswa", url: "/siswa" },
            { title: "Kelas", url: "/kelas" },
            { title: "Mata Pelajaran", url: "/mata-pelajaran" },
            { title: "Jadwal", url: "/jadwal" },
            { title: "Tahun Ajaran", url: "/tahun-ajaran" },
            { title: "E-Rapor", url: "/e-rapor" },
          ],
        },
      ],
    },
    {
      type: "link",
      title: "Administrasi & Keuangan",
      links: [
        {
          name: "Siswa Baru & Pembayaran",
          url: "/siswa-baru/pendaftaran",
          icon: FileUser,
        },
      ],
    },
    {
      type: "link",
      title: "Pengumuman",
      links: [{ name: "Pengumuman", url: "/pengumuman", icon: Bell }],
    },
    {
      type: "link",
      title: "Laporan Data",
      links: [{ name: "Buku Induk Siswa", url: "/buku-induk", icon: Notebook }],
    },
  ],
  GURU: [
    {
      type: "link",
      title: "Dashboard",
      links: [{ name: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
    },
    {
      type: "main",
      title: "Akademik",
      items: [
        {
          title: "Akademik",
          url: "#",
          icon: BookOpen,
          items: [
            { title: "Input Nilai", url: "/guru/nilai" },
            { title: "Jadwal", url: "/guru/jadwal" },
            { title: "Absensi", url: "/absensi" },
            { title: "E-Rapor", url: "/e-rapor" },
          ],
        },
      ],
    },
  ],
  SISWA: [
    {
      type: "link",
      title: "Dashboard",
      links: [{ name: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
    },
    {
      type: "main",
      title: "Menu Siswa",
      items: [
        {
          title: "Menu Siswa",
          url: "#",
          icon: PieChart,
          items: [
            { title: "Nilai Saya", url: "/nilai" },
            { title: "Jadwal", url: "/siswa/jadwal" },
          ],
        },
      ],
    },
    {
      type: "link",
      title: "Riwayat Pembayaran",
      links: [{ name: "Invoice", url: "/dashboard/tagihan", icon: Banknote }],
    },
    {
      type: "link",
      title: "Transkrip Nilai",
      links: [{ name: "E-Rapor", url: "/siswa/e-rapor", icon: BookOpen }],
    },
  ],
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const role = user?.role || "SISWA";
  const items = menuItems[role];
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
        {items.map((section, idx) =>
          section.type === "link" && section.links ? (
            <NavLinks key={idx} title={section.title} links={section.links} />
          ) : section.type === "main" && section.items ? (
            <NavMain key={idx} items={section.items} />
          ) : null,
        )}

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
