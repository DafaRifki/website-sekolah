import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth"; // ← Gunakan hook ini!
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AuthLayout() {
  const { user, loading } = useAuth(); // ← Hanya cek sekali, cache otomatis
  const location = useLocation();

  // Loading state: tampilkan spinner sederhana
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600"></div>
          <p className="text-gray-600">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  // Jika tidak login → redirect ke login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Jika sudah login → render layout
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <span className="text-sm font-medium text-gray-700">
              Selamat datang, {user.name}
            </span>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Outlet akan menerima user via context jika perlu */}
          <Outlet context={{ user }} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
