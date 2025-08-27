import React from "react";
import { useOutletContext } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  BookOpen,
  Calendar,
  Bell,
  PieChart,
} from "lucide-react";

type User = {
  name: string;
  email: string;
  role: "ADMIN" | "GURU" | "SISWA";
};

function useAuthUser() {
  return useOutletContext<{ user: User | null }>().user;
}

const DashboardPage: React.FC = () => {
  const user = useAuthUser();
  const role = user?.role || "SISWA";

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* --- ADMIN DASHBOARD --- */}
      {role === "ADMIN" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manajemen User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Kelola data guru, siswa, dan admin.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Laporan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Lihat laporan kehadiran, nilai, dan aktivitas.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifikasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Kelola pengumuman untuk semua pengguna.</p>
            </CardContent>
          </Card>
        </>
      )}

      {/* --- GURU DASHBOARD --- */}
      {role === "GURU" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Mata Pelajaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Kelola materi dan nilai siswa.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Jadwal Mengajar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Lihat dan atur jadwal mengajar Anda.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Data Siswa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Lihat daftar siswa yang Anda ajar.</p>
            </CardContent>
          </Card>
        </>
      )}

      {/* --- SISWA DASHBOARD --- */}
      {role === "SISWA" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Materi Pelajaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Akses materi dan tugas yang diberikan guru.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Jadwal Kelas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Lihat jadwal pelajaran Anda.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Pengumuman
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Lihat pengumuman terbaru dari sekolah.</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
