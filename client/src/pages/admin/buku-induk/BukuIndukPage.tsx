// import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { UserPlus2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import SiswaSearch from "./components/SiswaSearch";
import apiClient from "@/config/axios";
import SiswaTable from "./components/SiswaTable";
import { useNavigate } from "react-router-dom";

interface Siswa {
  id_siswa: number;
  nis: string;
  nama: string;
  jenisKelamin?: string;
  fotoProfil?: string;
  kelas?: { namaKelas: string };
}

export default function BukuIndukPage() {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get("/siswa").then((res) => setSiswaList(res.data.data));
  }, []);

  // Filter Data
  const filtered = siswaList.filter((s) =>
    s.nama.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <Card className="p-4 shadow-lg rounded-2xl">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-xl font-bold">Buku Induk Siswa</CardTitle>
        {/* <Button>
          <UserPlus2 />
          Tambah Siswa
        </Button> */}
      </CardHeader>
      <CardContent>
        <SiswaSearch search={search} setSearch={setSearch} />
        <SiswaTable
          siswaList={filtered}
          onDetail={(id) => navigate(`/buku-induk/${id}`)}
        />
      </CardContent>
    </Card>
  );
}
