import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import isLoggedIn from "../hooks/useAuth"; // path sesuai punyamu

export default function NotFoundPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authUser = await isLoggedIn();
      setUser(authUser);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const redirectPath = user ? "/dashboard" : "/";

  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/30">
      <Card className="w-[420px] shadow-lg rounded-2xl">
        <CardContent className="flex flex-col items-center text-center p-8">
          <AlertTriangle className="h-14 w-14 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
          <p className="text-muted-foreground mt-2">
            Maaf, halaman yang kamu cari tidak ditemukan.
          </p>

          <Button asChild className="mt-6 w-full">
            <Link to={redirectPath}>
              {user ? "Kembali ke Dashboard" : "Kembali ke Beranda"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
