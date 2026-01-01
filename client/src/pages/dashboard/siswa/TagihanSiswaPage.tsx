import React, { useEffect, useState } from "react";
import { getMyTagihan } from "../services/dashboardService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Tagihan {
  id_tagihan: number;
  tarif: {
    namaTagihan: string;
    nominal: number;
  };
  totalBayar: number;
  sisaPembayaran: number;
  status: "BELUM_BAYAR" | "CICIL" | "LUNAS";
  tahunAjaran: {
    namaTahun: string;
    semester: string;
  };
  bulan?: string;
}

const TagihanSiswaPage = () => {
  const [tagihanList, setTagihanList] = useState<Tagihan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTagihan();
  }, []);

  const fetchTagihan = async () => {
    try {
      setLoading(true);
      const data = await getMyTagihan();
      // data might be { data: [...] } or just [...] depending on controller?
      // controller returns `sendSuccess(..., result.data || result)`
      // TagihanService.getBySiswa returns array directly usually, or { count, rows } ?
      // TagihanService.getBySiswa returns `prisma.tagihan.findMany(...)` so it is an array.
      setTagihanList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch tagihan:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LUNAS":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Lunas</Badge>;
      case "CICIL":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Dicicil</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Belum Bayar</Badge>;
    }
  };

  // Separate lists
  const unpaidBills = tagihanList.filter((t) => t.status !== "LUNAS");
  const paidBills = tagihanList.filter((t) => t.status === "LUNAS");

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detail Tagihan Siswa</h1>
          <p className="text-gray-500">Informasi pembayaran SPP dan tagihan lainnya</p>
        </div>
      </div>

      {tagihanList.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600">Tidak ada data tagihan</h3>
          <p className="text-gray-400">Anda belum memiliki riwayat tagihan apapun.</p>
        </div>
      ) : (
        <>
          {/* Tagihan Belum Lunas */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Perlu Dibayar
            </h2>
            
            {unpaidBills.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {unpaidBills.map((item) => (
                  <Card key={item.id_tagihan} className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <Badge variant="outline" className="mb-2 border-gray-300 text-gray-600">
                            {item.tahunAjaran.namaTahun} - {item.tahunAjaran.semester}
                          </Badge>
                          <CardTitle className="text-lg">{item.tarif.namaTagihan}</CardTitle>
                          {item.bulan && <p className="text-sm text-gray-500 mt-1 capitalize">Bulan: {item.bulan}</p>}
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 mt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Nominal Tagihan:</span>
                          <span className="font-medium">{formatRupiah(item.tarif.nominal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Sudah Dibayar:</span>
                          <span className="text-green-600">{formatRupiah(item.totalBayar)}</span>
                        </div>
                        <div className="pt-2 border-t flex justify-between items-center">
                          <span className="font-semibold text-gray-700">Sisa Pembayaran:</span>
                          <span className="font-bold text-red-600 text-lg">
                            {formatRupiah(item.sisaPembayaran)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-green-50 rounded-xl border border-green-100 flex items-center gap-3 text-green-700">
                <CheckCircle className="h-6 w-6" />
                <span>Tidak ada tagihan tertunggak. Terima kasih!</span>
              </div>
            )}
          </div>

          {/* Riwayat / Lunas */}
          {paidBills.length > 0 && (
            <div className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-green-700">
                <Clock className="h-5 w-5" />
                Riwayat Lunas
              </h2>
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 font-medium text-gray-700">Tagihan</th>
                        <th className="px-6 py-3 font-medium text-gray-700">Bulan & Tahun</th>
                        <th className="px-6 py-3 font-medium text-right text-gray-700">Nominal</th>
                        <th className="px-6 py-3 font-medium text-center text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paidBills.map((item) => (
                        <tr key={item.id_tagihan} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium">{item.tarif.namaTagihan}</td>
                          <td className="px-6 py-4 text-gray-500">
                            {item.bulan ? <span className="capitalize">{item.bulan}, </span> : ""}
                            {item.tahunAjaran.namaTahun}
                          </td>
                          <td className="px-6 py-4 text-right">{formatRupiah(item.tarif.nominal)}</td>
                          <td className="px-6 py-4 text-center">{getStatusBadge(item.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TagihanSiswaPage;
