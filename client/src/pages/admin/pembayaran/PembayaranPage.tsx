import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CreditCard,
  RefreshCw,
  Receipt,
  Calendar,
  Banknote,
} from "lucide-react";
import apiClient from "@/config/axios";
import TambahPembayaranModal from "./components/TambahPembayaranModal";

interface Tarif {
  id_tarif: number;
  nominal: number;
  keterangan: string;
}

interface Pembayaran {
  id_pembayaran: number;
  siswaId: number;
  jumlahBayar: number;
  metode: string;
  tanggal: string;
  keterangan?: string;
  siswa?: {
    nama: string;
  };
  tarif?: Tarif;
}

interface PembayaranWithStatus extends Pembayaran {
  totalBayarTarif: number;
  status: "LUNAS" | "CICIL";
}

export default function PembayaranPage() {
  const [pembayaran, setPembayaran] = useState<Pembayaran[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/pembayaran");
      setPembayaran(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hitung status per transaksi
  const pembayaranWithStatus: PembayaranWithStatus[] = pembayaran.map(
    (item) => {
      const totalBayarTarif = pembayaran
        .filter(
          (p) =>
            p.siswaId === item.siswaId &&
            p.tarif?.id_tarif === item.tarif?.id_tarif
        )
        .reduce((sum, p) => sum + p.jumlahBayar, 0);

      const status: "LUNAS" | "CICIL" =
        item.tarif && totalBayarTarif >= item.tarif.nominal ? "LUNAS" : "CICIL";

      return { ...item, totalBayarTarif, status };
    }
  );

  // Statistik
  const totalPembayaran = pembayaran.length;
  const totalAmount = pembayaran.reduce(
    (sum, item) => sum + item.jumlahBayar,
    0
  );
  const metodeCounts = pembayaran.reduce((acc, item) => {
    acc[item.metode] = (acc[item.metode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-600" />
            Riwayat Pembayaran
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {totalPembayaran} transaksi • Rp
            {totalAmount.toLocaleString("id-ID")} total
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <TambahPembayaranModal onSuccess={fetchData} />
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && totalPembayaran > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4 flex items-center gap-3">
              <Receipt className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm">Total Transaksi</p>
                <p className="text-xl font-semibold">{totalPembayaran}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4 flex items-center gap-3">
              <Banknote className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm">Total Amount</p>
                <p className="text-xl font-semibold">
                  Rp{totalAmount.toLocaleString("id-ID")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm">Rata-rata</p>
                <p className="text-xl font-semibold">
                  Rp
                  {totalPembayaran > 0
                    ? Math.round(totalAmount / totalPembayaran).toLocaleString(
                        "id-ID"
                      )
                    : "0"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4 flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-orange-600" />
              <div>
                <p className="text-sm">Metode Populer</p>
                <p className="text-xl font-semibold">
                  {Object.keys(metodeCounts).length > 0
                    ? Object.entries(metodeCounts).sort(
                        ([, a], [, b]) => b - a
                      )[0][0]
                    : "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabel Pembayaran */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : pembayaranWithStatus.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm">Belum ada pembayaran</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>Tarif</TableHead>
                    <TableHead>Nominal Tarif</TableHead>
                    <TableHead>Jumlah Bayar</TableHead>
                    <TableHead>Total Bayar</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pembayaranWithStatus.map((item, idx) => (
                    <TableRow key={item.id_pembayaran}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{item.siswa?.nama || "-"}</TableCell>
                      <TableCell>{item.tarif?.keterangan || "-"}</TableCell>
                      <TableCell>
                        Rp
                        {item.tarif?.nominal.toLocaleString("id-ID") || "-"}
                      </TableCell>
                      <TableCell>
                        Rp{item.jumlahBayar.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        Rp{item.totalBayarTarif.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            item.status === "LUNAS"
                              ? "bg-green-600 text-white"
                              : "bg-amber-500 text-white"
                          }>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.metode}</TableCell>
                      <TableCell>
                        {new Date(item.tanggal).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell>{item.keterangan || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
