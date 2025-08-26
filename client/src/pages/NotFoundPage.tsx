import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
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
            <Link to="/dashboard">Kembali ke Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
