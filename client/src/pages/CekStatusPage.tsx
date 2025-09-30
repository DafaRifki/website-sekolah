"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "LENGKAP":
      case "SUDAH_BAYAR":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
      case "BELUM_BAYAR":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "KURANG":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Cek Status Pendaftaran
          </h1>
          <p className="text-gray-600 text-sm">
            Masukkan email untuk melihat status pendaftaran Anda
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Pendaftaran
              </label>
              <Input
                type="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus:ring-2 focus:ring-green-500"
                autoFocus
              />
            </div>

            <Button
              onClick={handleCheck}
              disabled={loading || !email}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white">
              {loading ? "Mengecek..." : "Cek Status"}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Terjadi Kesalahan</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Result Card */}
        {result && (
          <Card className="mb-6 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
                Detail Pendaftaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Nama</span>
                <span className="font-medium text-gray-800">{result.nama}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Email</span>
                <span className="font-medium text-gray-800">
                  {result.email}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Tahun Ajaran</span>
                <span className="font-medium text-gray-800">
                  {result.tahunAjaran?.namaTahun || "-"}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Status Dokumen</span>
                <Badge
                  variant={
                    result.statusDokumen === "LENGKAP"
                      ? "default"
                      : result.statusDokumen === "PENDING"
                      ? "secondary"
                      : "destructive"
                  }
                  className={getStatusColor(result.statusDokumen)}>
                  {result.statusDokumen}
                </Badge>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Status Pembayaran</span>
                <Badge
                  variant={
                    result.statusPembayaran === "SUDAH_BAYAR"
                      ? "default"
                      : "secondary"
                  }
                  className={getStatusColor(result.statusPembayaran)}>
                  {result.statusPembayaran}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Sudah terverifikasi?{" "}
            <Link
              to="/login"
              className="text-green-600 hover:text-green-700 font-medium">
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
