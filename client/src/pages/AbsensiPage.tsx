import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function AbsensiPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Absensi Harian</h1>
      
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <CardTitle className="text-yellow-800">Segera Hadir</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700">
            Fitur absensi digital sedang dalam tahap pengembangan. Untuk sementara, silakan lakukan absensi secara manual melalui buku jurnal kelas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
