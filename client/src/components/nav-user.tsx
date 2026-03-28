"use client";

import { ChevronsUpDown, LogOut, Settings2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "@/config/axios";
import { toast } from "sonner";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    fotoProfil?: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { logout } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  const handleLogout = async () => {
    try {
      try {
        await apiClient.post("/auth/logout");
      } catch (apiError) {
        console.log("Logout API call failed (non-critical):", apiError);
      }

      logout(false); 

      setOpenDialog(false);

      toast.success("Logout berhasil");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);

      logout(false);
      setOpenDialog(false);
      toast.error("Terjadi kesalahan saat logout");
      navigate("/login", { replace: true });
    }
  };

  // --- FUNGSI HELPER ANTI-NYASAR ---
  const getProfileUrl = (path?: string) => {
    if (!path) return "";
    let baseUrl = import.meta.env.VITE_URL_API || import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    baseUrl = baseUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
    const fileName = path.split('/').pop();
    
    // Kita tebak pertama ke folder guru
    return `${baseUrl}/uploads/guru/${fileName}?t=${new Date().getTime()}`;
  };

  // --- LOGIC FALLBACK JIKA TEBAKAN PERTAMA GAGAL ---
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    if (target.src.includes('/uploads/guru/')) {
      // Jika nyari di folder guru gagal, otomatis coba cari di folder siswa!
      target.src = target.src.replace('/uploads/guru/', '/uploads/siswa/');
    } else {
      // Jika di siswa juga tidak ada, baru sembunyikan gambar agar inisial muncul
      target.style.display = 'none';
    }
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                
                {/* AVATAR DI SIDEBAR BAWAH */}
                <Avatar className="h-8 w-8 rounded-lg relative bg-blue-100 flex items-center justify-center">
                  {user.fotoProfil ? (
                    <>
                      <img 
                        src={getProfileUrl(user.fotoProfil)} 
                        alt={user.name} 
                        className="w-full h-full object-cover rounded-lg absolute z-10"
                        onError={handleImageError}
                      />
                      <span className="text-xs font-bold text-blue-600 z-0">{initials}</span>
                    </>
                  ) : (
                    <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600 font-bold">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  
                  {/* AVATAR DI DALAM DROPDOWN MENU */}
                  <Avatar className="h-8 w-8 rounded-lg relative bg-blue-100 flex items-center justify-center">
                    {user.fotoProfil ? (
                      <>
                        <img 
                          src={getProfileUrl(user.fotoProfil)} 
                          alt={user.name} 
                          className="w-full h-full object-cover rounded-lg absolute z-10"
                          onError={handleImageError}
                        />
                        <span className="text-xs font-bold text-blue-600 z-0">{initials}</span>
                      </>
                    ) : (
                      <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600 font-bold">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings/profile"
                    className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    <span>Setting</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setOpenDialog(true)}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Dialog Konfirmasi Logout */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-green-600">
              Konfirmasi Logout
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Apakah kamu yakin ingin keluar dari akun ini? Semua sesi yang
              sedang berjalan akan dihentikan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Ya, Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}