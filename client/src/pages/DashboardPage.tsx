import React, { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Calendar, Bell, FileText, Award } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import apiClient from "@/config/axios";

interface User {
  name: string;
  email: string;
  role: "ADMIN" | "GURU" | "SISWA";
}

interface CardStatProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const CardStat: React.FC<CardStatProps> = ({
  title,
  value,
  description,
  icon,
  color,
}) => (
  <Card
    className={`cursor-pointer transition-all duration-200 
      hover:bg-${color}-100 hover:shadow-md 
      active:scale-95 active:bg-${color}-200`}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-gray-600">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </CardContent>
  </Card>
);

const DashboardPage: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [totalSiswa, setTotalSiswa] = useState<number | null>(null);
  const [totalGuru, setTotalGuru] = useState<number | null>(null);
  const [totalKelas, setTotalKelas] = useState<number | null>(null);

  useEffect(() => {
    apiClient
      .get("/dashboard/summary")
      .then((res) => {
        setTotalSiswa(res.data.totalSiswa);
        setTotalGuru(res.data.totalGuru);
        setTotalKelas(res.data.totalKelas);
      })
      .catch((err) => console.error(err));
  }, []);

  const data = {
    ADMIN: [
      {
        title: "Total Siswa",
        value: totalSiswa !== null ? totalSiswa : "-",
        description: "Data siswa aktif",
        icon: <Users className="text-green-600" />,
        color: "green",
      },
      {
        title: "Guru",
        value: totalGuru !== null ? totalGuru : "-",
        description: "Data guru aktif",
        icon: <BookOpen className="text-yellow-600" />,
        color: "yellow",
      },
      {
        title: "Kelas",
        value: totalKelas !== null ? totalKelas : "-",
        description: "Jumlah kelas",
        icon: <Calendar className="text-green-500" />,
        color: "green",
      },
      {
        title: "Pengumuman",
        value: "5",
        description: "Pengumuman baru",
        icon: <Bell className="text-red-500" />,
        color: "red",
      },
    ],
    GURU: [
      {
        title: "Mata Pelajaran",
        value: "6",
        description: "Mapel yang diampu",
        icon: <BookOpen className="text-green-600" />,
        color: "green",
      },
      {
        title: "Jadwal Mengajar",
        value: "12",
        description: "Pertemuan minggu ini",
        icon: <Calendar className="text-blue-600" />,
        color: "blue",
      },
      {
        title: "Tugas Siswa",
        value: "24",
        description: "Menunggu penilaian",
        icon: <FileText className="text-red-500" />,
        color: "red",
      },
    ],
    SISWA: [
      {
        title: "Nilai Rata-rata",
        value: "87",
        description: "Semester ini",
        icon: <Award className="text-yellow-500" />,
        color: "yellow",
      },
      {
        title: "Kehadiran",
        value: "95%",
        description: "Tingkat kehadiran",
        icon: <Calendar className="text-green-500" />,
        color: "green",
      },
      {
        title: "Tugas",
        value: "3",
        description: "Tugas belum dikerjakan",
        icon: <FileText className="text-blue-500" />,
        color: "blue",
      },
    ],
  };

  return (
    <div className="p-6 bg-gradient-to-br">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-700">
          Dashboard {user?.role}
        </h1>
        <p className="text-gray-500">Selamat datang, {user?.name}</p>
      </div>

      <div
        className={`grid gap-6 ${
          user?.role === "ADMIN"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}>
        {user?.role &&
          data[user.role].map((item, idx) => <CardStat key={idx} {...item} />)}
      </div>
    </div>
  );
};

export default DashboardPage;
