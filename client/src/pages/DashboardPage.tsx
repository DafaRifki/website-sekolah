import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Calendar, Bell, FileText, Award } from "lucide-react";
import { useOutletContext } from "react-router-dom";

interface User {
  name: string;
  email: string;
  role: "ADMIN" | "GURU" | "SISWA";
}

const DashboardPage: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();

  const renderAdmin = () => (
    <>
      {/* Cards Statistik Admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 ">
        <Card className="cursor-pointer transition-all duration-200 hover:bg-green-100 hover:shadow-md active:scale-95 active:bg-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Siswa
            </CardTitle>
            <Users className="text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">1.250</p>
            <p className="text-xs text-gray-500">Data siswa aktif</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all duration-200 hover:bg-orange-100 hover:shadow-md active:scale-95 active:bg-orange-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Guru
            </CardTitle>
            <BookOpen className="text-yellow-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">85</p>
            <p className="text-xs text-gray-500">Data guru aktif</p>
          </CardContent>
        </Card>

        <Card className=" cursor-pointer transition-all duration-200 hover:bg-green-100 hover:shadow-md active:scale-95 active:bg-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Kelas
            </CardTitle>
            <Calendar className="text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">32</p>
            <p className="text-xs text-gray-500">Jumlah kelas</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all duration-200 hover:bg-red-100 hover:shadow-md active:scale-95 active:bg-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pengumuman
            </CardTitle>
            <Bell className="text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">5</p>
            <p className="text-xs text-gray-500">Pengumuman baru</p>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderGuru = () => (
    <>
      {/* Cards Statistik Guru */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="cursor-pointer transition-all duration-200 hover:bg-green-100 hover:shadow-md active:scale-95 active:bg-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Mata Pelajaran
            </CardTitle>
            <BookOpen className="text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-700">6</p>
            <p className="text-xs text-gray-500">Mapel yang diampu</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:shadow-md active:scale-95 active:bg-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Jadwal Mengajar
            </CardTitle>
            <Calendar className="text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">12</p>
            <p className="text-xs text-gray-500">Pertemuan minggu ini</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all duration-200 hover:bg-red-100 hover:shadow-md active:scale-95 active:bg-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tugas Siswa
            </CardTitle>
            <FileText className="text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">24</p>
            <p className="text-xs text-gray-500">Menunggu penilaian</p>
          </CardContent>
        </Card>
      </div>
    </>
  );

  const renderSiswa = () => (
    <>
      {/* Cards Statistik Siswa */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="cursor-pointer transition-all duration-200 hover:bg-yellow-100 hover:shadow-md active:scale-95 active:bg-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Nilai Rata-rata
            </CardTitle>
            <Award className="text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-500">87</p>
            <p className="text-xs text-gray-500">Semester ini</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all duration-200 hover:bg-green-100 hover:shadow-md active:scale-95 active:bg-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Kehadiran
            </CardTitle>
            <Calendar className="text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">95%</p>
            <p className="text-xs text-gray-500">Tingkat kehadiran</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all duration-200 hover:bg-blue-100 hover:shadow-md active:scale-95 active:bg-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tugas
            </CardTitle>
            <FileText className="text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-500">3</p>
            <p className="text-xs text-gray-500">Tugas belum dikerjakan</p>
          </CardContent>
        </Card>
      </div>
    </>
  );

  return (
    <div className="p-6 bg-gradient-to-br">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-700">
          Dashboard {user?.role}
        </h1>
        <p className="text-gray-500">Selamat datang, {user?.name}</p>
      </div>

      {user?.role === "ADMIN" && renderAdmin()}
      {user?.role === "GURU" && renderGuru()}
      {user?.role === "SISWA" && renderSiswa()}
    </div>
  );
};

export default DashboardPage;
