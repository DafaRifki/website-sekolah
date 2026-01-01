import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, loading } = useAuth(); // ← Hanya cek sekali, cache otomatis
  const location = useLocation();

  // Tampilkan loading sederhana saat cek auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-indigo-600"></div>
          <p className="text-gray-600 text-sm">Memeriksa status login...</p>
        </div>
      </div>
    );
  }

  // Jika sudah login → redirect ke dashboard
  if (user) {
    // Simpan lokasi asal agar bisa kembali setelah login (opsional)
    const from =
      (location.state as { from?: Location })?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  // Jika belum login → tampilkan halaman publik (login, dll)
  return <>{children}</>;
};

export default PublicRoute;
