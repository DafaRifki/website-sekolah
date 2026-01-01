import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils"; // helper optional, bisa pakai clsx atau bikin sendiri

export default function SiswaBaruLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Menu Pendaftaran Siswa Baru & Keuangan
        </h1>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700">
          <Link
            to="/siswa-baru/pendaftaran"
            className={cn(
              "px-3 py-2 text-sm font-medium",
              location.pathname.includes("/siswa-baru/pendaftaran")
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}>
            Pendaftaran
          </Link>
          <Link
            to="/siswa-baru/tagihan"
            className={cn(
              "px-3 py-2 text-sm font-medium",
              location.pathname.includes("/siswa-baru/tagihan")
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}>
            Tagihan
          </Link>
          <Link
            to="/siswa-baru/pembayaran"
            className={cn(
              "px-3 py-2 text-sm font-medium",
              location.pathname.includes("/siswa-baru/pembayaran")
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}>
            Pembayaran
          </Link>
        </div>

        {/* Tempat render sub-routes */}
        <div className="pt-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
