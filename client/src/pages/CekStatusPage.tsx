"use client";

import { useState } from "react";
import apiClient from "@/config/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Swal from "sweetalert2";

interface PendaftaranStatus {
  id_pendaftaran: number;
  nama: string;
  email: string;
  statusDokumen: "PENDING" | "LENGKAP" | "KURANG";
  statusPembayaran: "BELUM_BAYAR" | "SUDAH_BAYAR";
  tahunAjaran?: {
    namaTahun: string;
  };
}

export default function CekStatusPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PendaftaranStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await apiClient.get(`/pendaftaran/cek-status?email=${email}`);
      if (res.data.success) {
        const data: PendaftaranStatus = res.data.data;

        // SweetAlert2 untuk feedback
        if (data.statusDokumen === "LENGKAP") {
          await Swal.fire({
            title: "Selamat! Anda Diterima 🎉",
            html: `
              <p>Nama: <b>${data.nama}</b></p>
              <p>Status Pembayaran: <b>${data.statusPembayaran}</b></p>
              <hr/>
              <p>Silakan melakukan pembayaran ke rekening sekolah:</p>
              <b>Bank ABC - 123456789 a.n. Yayasan Sekolah</b>
            `,
            icon: "success",
            confirmButtonColor: "#16a34a",
          });
        } else if (data.statusDokumen === "KURANG") {
          await Swal.fire({
            title: "Mohon Maaf 🙏",
            text: "Pendaftaran Anda ditolak. Silakan hubungi admin sekolah.",
            icon: "error",
            confirmButtonColor: "#dc2626",
          });
        } else {
          await Swal.fire({
            title: "Menunggu Verifikasi",
            text: "Pendaftaran Anda masih dalam proses verifikasi admin.",
            icon: "info",
            confirmButtonColor: "#facc15",
          });
        }

        setResult(data);
      } else {
        setError(res.data.message || "Data tidak ditemukan");
      }
    } catch (err: any) {
      console.error("Error cek status:", err);
      setError(err.response?.data?.message || "Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-yellow-50 to-white">
      <div className="bg-white/90 p-10 rounded-2xl shadow-xl max-w-md w-full border border-green-100">
        {/* Judul */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-3xl font-extrabold text-green-600">
            Cek Status Pendaftaran
          </h1>
          <p className="text-gray-500 text-sm">
            Masukkan email / nomor pendaftaran untuk melihat status Anda
          </p>
        </div>

        {/* Input + Tombol */}
        <div className="flex gap-2 mb-4">
          <Input
            type="email"
            placeholder="Email / Nomor Pendaftaran"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus:ring-2 focus:ring-green-300"
            autoFocus
          />
          <Button
            onClick={handleCheck}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md">
            {loading ? "Mengecek..." : "Cek"}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Gagal</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Hasil detail */}
        {result && (
          <Card className="mt-4 border-green-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-green-700">
                Detail Pendaftaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium">Nama:</span> {result.nama}
              </p>
              <p>
                <span className="font-medium">Email:</span> {result.email}
              </p>
              <p>
                <span className="font-medium">Tahun Ajaran:</span>{" "}
                {result.tahunAjaran?.namaTahun || "-"}
              </p>
              <p>
                <span className="font-medium">Status Dokumen:</span>{" "}
                <Badge
                  variant={
                    result.statusDokumen === "LENGKAP"
                      ? "default"
                      : result.statusDokumen === "PENDING"
                      ? "secondary"
                      : "destructive"
                  }>
                  {result.statusDokumen}
                </Badge>
              </p>
              <p>
                <span className="font-medium">Status Pembayaran:</span>{" "}
                <Badge
                  variant={
                    result.statusPembayaran === "SUDAH_BAYAR"
                      ? "default"
                      : "secondary"
                  }>
                  {result.statusPembayaran}
                </Badge>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
