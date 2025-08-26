// import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import React from "react";
import Heading from "@/components/heading";

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings/profile",
    icon: null,
  },
  {
    title: "Password",
    href: "/settings/password",
    icon: null,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="px-4 py-6">
      <Heading
        title="Settings"
        description="Manage your profile, account and password settings"
      />

      <div className="flex flex-col lg:flex-row lg:space-x-12">
        {/* Sidebar kiri */}
        <aside className="w-full max-w-xl lg:w-48">
          <nav className="flex flex-col space-y-1 space-x-0">
            {sidebarNavItems.map((item, index) => (
              <Button
                key={`${item.href}-${index}`}
                size="sm"
                variant="ghost"
                asChild
                className={cn("w-full justify-start", {
                  "bg-muted": currentPath === item.href,
                })}>
                <Link to={item.href}>{item.title}</Link>
              </Button>
            ))}
          </nav>
        </aside>

        <Separator className="my-6 lg:hidden" />

        {/* Konten kanan */}
        <div className="flex-1 md:max-w-2xl">
          <section className="max-w-xl space-y-12">{children}</section>
        </div>
      </div>
    </div>
  );
}
