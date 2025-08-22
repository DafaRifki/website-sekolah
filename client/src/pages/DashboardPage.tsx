import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Calendar, Bell } from "lucide-react";

const DashboardPage: React.FC = () => {
  return (
    <div className="p-6 bg-gradient-to-br from-green-50 via-yellow-50 to-white min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-700">Dashboard Sekolah</h1>
        <p className="text-gray-500">Selamat datang di sistem informasi sekolah</p>
      </div>

      {/* Cards Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Siswa</CardTitle>
            <Users className="text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">1.250</p>
            <p className="text-xs text-gray-500">Total siswa aktif</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Guru</CardTitle>
            <BookOpen className="text-yellow-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">85</p>
            <p className="text-xs text-gray-500">Total guru aktif</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Kelas</CardTitle>
            <Calendar className="text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">32</p>
            <p className="text-xs text-gray-500">Jumlah kelas aktif</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pengumuman</CardTitle>
            <Bell className="text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">5</p>
            <p className="text-xs text-gray-500">Pengumuman baru</p>
          </CardContent>
        </Card>
      </div>

      {/* Seksi Bawah - Pengumuman & Jadwal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pengumuman */}
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-green-700">Pengumuman Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-gray-600">
              <li>📌 Ujian Tengah Semester dimulai tanggal 12 September</li>
              <li>📌 Pendaftaran ekstrakurikuler dibuka hingga 30 Agustus</li>
              <li>📌 Libur nasional: 17 Agustus</li>
            </ul>
          </CardContent>
        </Card>

        {/* Jadwal */}
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-green-700">Jadwal Kegiatan</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-gray-600">
              <li>📅 Senin - Upacara Bendera</li>
              <li>📅 Rabu - Rapat Guru</li>
              <li>📅 Jumat - Ekstrakurikuler Pramuka</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
