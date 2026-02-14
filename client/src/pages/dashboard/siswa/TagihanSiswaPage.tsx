import { useEffect, useState, useCallback } from "react";
import { getMyTagihan } from "../services/dashboardService";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Wallet, 
  Receipt, 
  CreditCard,
  Filter,
  RotateCcw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/config/axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Tagihan {
  id_tagihan: number;
  tarif: {
    namaTagihan: string;
    nominal: number;
  };
  totalBayar: number;
  sisaPembayaran: number;
  status: "BELUM_BAYAR" | "CICIL" | "LUNAS";
  tahunAjaranId: number;
  tahunAjaran: {
    namaTahun: string;
    semester: number | string;
  };
  bulan?: string;
}

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
  semester: number;
  isActive: boolean;
}

const TagihanSiswaPage = () => {
  const [tagihanList, setTagihanList] = useState<Tagihan[]>([]);
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();

  // Filters
  const [tahunAjaranId, setTahunAjaranId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchTahunAjaran = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/tahun-ajaran", {
        params: { limit: 100 },
      });
      const tData = data.data;
      const list = Array.isArray(tData) ? tData : tData?.data || [];
      setTahunAjaranList(list);
    } catch (error) {
      console.error("Failed to fetch tahun ajaran:", error);
    }
  }, []);

  const fetchTagihan = useCallback(async () => {
    try {
      setFetching(true);
      const filters: { tahunAjaranId?: number; status?: string } = {};
      if (tahunAjaranId !== "all") filters.tahunAjaranId = parseInt(tahunAjaranId);
      if (statusFilter !== "all") filters.status = statusFilter;

      const data = await getMyTagihan(filters);
      // Backend returns array directly in data field as per service
      setTagihanList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch tagihan:", error);
    } finally {
      setFetching(false);
      setLoading(false);
    }
  }, [tahunAjaranId, statusFilter]);

  useEffect(() => {
    fetchTahunAjaran();
  }, [fetchTahunAjaran]);

  useEffect(() => {
    fetchTagihan();
  }, [fetchTagihan]);

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
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Lunas</Badge>;
      case "CICIL":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">Dicicil</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200">Belum Bayar</Badge>;
    }
  };

  // Calculations
  const totalTagihan = tagihanList.reduce((sum, t) => sum + t.tarif.nominal, 0);
  const totalTerbayar = tagihanList.reduce((sum, t) => sum + t.totalBayar, 0);
  const totalSisa = tagihanList.reduce((sum, t) => sum + t.sisaPembayaran, 0);

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
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tagihan Saya</h1>
            <p className="text-gray-500 font-medium">Pantau status pembayaran dan riwayat transaksi Anda</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          onClick={() => {
            setTahunAjaranId("all");
            setStatusFilter("all");
            fetchTagihan();
          }}
          className="text-gray-500 hover:text-green-600 self-end md:self-auto"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Filter
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-2 border-gray-100 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
            <Receipt className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-500" />
              Total Seluruh Tagihan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(totalTagihan)}</div>
            <p className="text-xs text-gray-400 mt-1">Total akumulasi berdasarkan filter</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-gray-100 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform text-green-600">
            <CheckCircle className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Total Terbayar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatRupiah(totalTerbayar)}</div>
            <p className="text-xs text-gray-400 mt-1">Pembayaran yang sudah terverifikasi</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-gray-100 shadow-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform text-red-600">
            <CreditCard className="h-16 w-16" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Sisa Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatRupiah(totalSisa)}</div>
            <p className="text-xs text-gray-400 mt-1">Jumlah yang harus dilunasi</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="border-none bg-gray-50/50 p-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">Filter:</span>
          </div>
          
          <div className="w-full md:w-64 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Tahun Ajaran</span>
            <Select value={tahunAjaranId} onValueChange={setTahunAjaranId}>
              <SelectTrigger className="bg-white shadow-sm border-gray-200">
                <SelectValue placeholder="Semua Tahun Ajaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tahun Ajaran</SelectItem>
                {tahunAjaranList.map((t) => (
                  <SelectItem key={t.id_tahun} value={t.id_tahun.toString()}>
                    {t.namaTahun} - Semester {t.semester} {t.isActive ? "(Aktif)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-48 space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Status</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white shadow-sm border-gray-200">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="BELUM_BAYAR">Belum Bayar</SelectItem>
                <SelectItem value="CICIL">Dicicil</SelectItem>
                <SelectItem value="LUNAS">Lunas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {fetching ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="text-gray-400 animate-pulse">Memperbarui data...</p>
        </div>
      ) : tagihanList.length === 0 ? (
        <Card className="border-dashed border-2 py-16">
          <CardContent className="flex flex-col items-center">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <FileText className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">Tidak ada data tagihan</h3>
            <p className="text-gray-500 max-w-sm text-center mt-1">
              Data tagihan tidak ditemukan untuk filter ini. Silakan ubah filter Anda.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {/* Active/Unpaid Bills */}
          {unpaidBills.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-bold flex items-center gap-3 text-red-700">
                  <div className="h-8 w-1 bg-red-600 rounded-full"></div>
                  Tagihan Aktif & Tertunggak
                </h2>
                <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-50 border-red-100">
                  {unpaidBills.length} Item
                </Badge>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {unpaidBills.map((item) => (
                  <Card key={item.id_tagihan} className="border-l-4 border-l-red-500 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden">
                    <CardHeader className="pb-2 border-b border-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-bold border-gray-200 text-gray-500">
                              {item.tahunAjaran.namaTahun}
                            </Badge>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                              SMT {item.tahunAjaran.semester}
                            </span>
                          </div>
                          <CardTitle className="text-xl text-gray-800">{item.tarif.namaTagihan}</CardTitle>
                          {item.bulan && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                              <Clock className="h-3.5 w-3.5" />
                              Bulan: <span className="capitalize text-gray-700">{item.bulan}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Total Tagihan</span>
                            <span className="font-bold text-gray-700">{formatRupiah(item.tarif.nominal)}</span>
                          </div>
                          <div className="p-3 bg-green-50/50 rounded-lg">
                            <span className="text-[10px] uppercase font-bold text-green-500 block mb-1">Sudah Dibayar</span>
                            <span className="font-bold text-green-600">{formatRupiah(item.totalBayar)}</span>
                          </div>
                        </div>
                        
                        <div className="pt-4 mt-2 border-t border-dashed border-gray-200 flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Sisa Pembayaran</span>
                            <span className="font-black text-2xl text-red-600 tracking-tight">
                              {formatRupiah(item.sisaPembayaran)}
                            </span>
                          </div>
                          <Button 
                            className="bg-green-600 hover:bg-green-700 text-white shadow-green-200 shadow-md font-bold px-6"
                            onClick={() => {
                              // Link to payment page or instructions
                              toast.info("Silakan hubungi bagian keuangan sekolah untuk melakukan pembayaran.");
                            }}
                          >
                            Bayar Sekarang
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Paid History Section */}
          {paidBills.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-xl font-bold flex items-center gap-3 text-green-800">
                  <div className="h-8 w-1 bg-green-600 rounded-full"></div>
                  Riwayat Tagihan Lunas
                </h2>
                <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-100">
                  {paidBills.length} Item Lunas
                </Badge>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/80 border-b">
                      <tr>
                        <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-widest text-[10px]">Detail Tagihan</th>
                        <th className="px-6 py-4 font-bold text-gray-600 uppercase tracking-widest text-[10px]">Tahun & Smt</th>
                        <th className="px-6 py-4 font-bold text-right text-gray-600 uppercase tracking-widest text-[10px]">Nominal Lunas</th>
                        <th className="px-6 py-4 font-bold text-center text-gray-600 uppercase tracking-widest text-[10px]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paidBills.map((item) => (
                        <tr key={item.id_tagihan} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-900 block">{item.tarif.namaTagihan}</span>
                            {item.bulan && <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter capitalize">{item.bulan}</span>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-gray-700 font-medium">{item.tahunAjaran.namaTahun}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">Semester {item.tahunAjaran.semester}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-gray-900">{formatRupiah(item.tarif.nominal)}</td>
                          <td className="px-6 py-4 text-center">
                            <Badge className="bg-green-50 text-green-600 border-green-100 shadow-none hover:bg-green-50 uppercase text-[9px] font-black tracking-widest">
                              Verified Lunas
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Footer Info */}
          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 flex gap-4">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900 uppercase tracking-tight mb-1">Informasi Pembayaran</h4>
              <p className="text-sm text-blue-700 leading-relaxed">
                Semua transaksi akan tercatat secara otomatis setelah dikonfirmasi oleh admin keuangan sekolah. 
                Jika terdapat ketidaksesuaian data, silakan ajukan pengecekan dengan membawa bukti bayar ke bagian Tata Usaha.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagihanSiswaPage;
