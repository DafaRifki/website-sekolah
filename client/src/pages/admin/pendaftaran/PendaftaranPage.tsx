"use client";

import apiClient from "@/config/axios";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, UserPlus, FileText, CreditCard } from "lucide-react";
import PendaftaranTable from "./components/PendaftaranTable";
import TambahPendaftaranModal from "./components/TambahPendaftaranModal";

interface Pendaftaran {
  id_pendaftaran: number;
  nama: string;
  email: string;
  tahunAjaran: {
    id_tahun: number;
    namaTahun: string;
  };
  statusDokumen: string;
  statusPembayaran: string;
}

export default function PendaftaranPage() {
  const [data, setData] = useState<Pendaftaran[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/pendaftaran");
      setData(res.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ handle status update
  const handleUpdate = async (
  id: number,
  field: "statusDokumen" | "statusPembayaran",
  value: string
) => {
  try {
    if (field === "statusDokumen") {
      if (value === "LENGKAP") {
        await apiClient.post(`/pendaftaran/${id}/approve`);
      } else if (value === "KURANG") {
        await apiClient.post(`/pendaftaran/${id}/reject`);
      } else {
        // BELUM_DITERIMA → update biasa
        await apiClient.put(`/pendaftaran/${id}`, {
          statusDokumen: value,
        });
      }
    } else {
      // pembayaran
      await apiClient.put(`/pendaftaran/${id}`, {
        statusPembayaran: value,
      });
    }

    fetchData();
  } catch (error) {
    console.error("Error updating data:", error);
  }
};

  // Calculate statistics
  const totalPendaftaran = data.length;
  const dokumenLengkap = data.filter(
    (item) => item.statusDokumen === "LENGKAP"
  ).length;
  const pembayaranLunas = data.filter(
    (item) => item.statusPembayaran === "LUNAS"
  ).length;

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Data Pendaftaran Siswa Baru
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Kelola dan pantau pendaftaran siswa baru untuk tahun ajaran aktif
            </p>
          </div>

          {/* Action Button */}
          <TambahPendaftaranModal onSuccess={fetchData} />
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Pendaftaran
              </CardTitle>
              <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {totalPendaftaran}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Siswa terdaftar
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Dokumen Lengkap
              </CardTitle>
              <FileText className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {dokumenLengkap}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Dari {totalPendaftaran} pendaftar
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Pembayaran Lunas
              </CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {pembayaranLunas}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Pembayaran selesai
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-white/50 backdrop-blur-sm dark:bg-slate-800/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Tingkat Kelengkapan
              </CardTitle>
              <UserPlus className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {totalPendaftaran > 0
                  ? Math.round((dokumenLengkap / totalPendaftaran) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Dokumen lengkap
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm dark:bg-slate-800/70">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
                  Daftar Pendaftaran
                </CardTitle>
                <CardDescription className="mt-1 text-slate-600 dark:text-slate-400">
                  Kelola status dokumen dan pembayaran siswa
                </CardDescription>
              </div>

              {/* Status Legend */}
              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Lengkap
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200">
                  Kurang
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200">
                  Lunas
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200">
                  Belum Lunas
                </Badge>
              </div>
            </div>
          </CardHeader>

          <Separator className="mb-4" />

          <CardContent className="p-6 pt-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
              </div>
            ) : (
              <PendaftaranTable data={data} onUpdate={handleUpdate} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
