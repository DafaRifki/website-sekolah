import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; // ← Gunakan hook ini!

export default function NotFoundPage() {
  const { user, loading } = useAuth(); // ← Hanya 1 request, cache otomatis
  const location = useLocation();

  // Loading state sederhana
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-indigo-600"></div>
          <p className="text-gray-600">Memeriksa status...</p>
        </div>
      </div>
    );
  }

  // Tentukan kemana redirect: dashboard jika login, beranda jika tidak
  const redirectPath = user ? "/dashboard" : "/";
  const buttonText = user ? "Kembali ke Dashboard" : "Kembali ke Beranda";

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md shadow-xl rounded-2xl border border-border">
        <CardContent className="flex flex-col items-center text-center p-10">
          <AlertTriangle className="h-20 w-20 text-red-500 mb-6" />

          <h1 className="text-4xl font-bold text-foreground mb-3">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Halaman Tidak Ditemukan
          </h2>

          <p className="text-muted-foreground max-w-sm mb-8">
            Maaf, halaman yang kamu cari tidak ada atau telah dipindahkan.
          </p>

          <Button asChild size="lg" className="w-full max-w-xs">
            <Link to={redirectPath}>{buttonText}</Link>
          </Button>

          {/* Optional: Tampilkan path yang salah */}
          {import.meta.env.DEV && (
            <p className="text-xs text-muted-foreground mt-6">
              Path: {location.pathname}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
