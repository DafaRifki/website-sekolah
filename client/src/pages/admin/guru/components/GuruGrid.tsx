import React, { useEffect, useState } from "react";
import GuruCard from "./GuruCard";
// import apiClient from "@/config/axios";

interface Guru {
  id_guru: number;
  nama: string;
  jabatan?: string;
  noHP?: string;
  fotoProfil?: string;
  user?: { email: string; role: string };
}

interface Props {
  data: Guru[];
}

const GuruGrid: React.FC<Props> = ({ data }) => {
  const [guruList, setGuruList] = useState<Guru[]>(data);

  // const fetchGuru = async () => {
  //   const res = await apiClient.get("/guru");
  //   setGuruList(res.data.data);
  // };

  useEffect(() => {
    setGuruList(data);
  }, [data]);

  const handleGuruUpdated = (updatedGuru: Guru) => {
    setGuruList((prev) =>
      prev.map((g) => (g.id_guru === updatedGuru.id_guru ? updatedGuru : g))
    );
  };

  const handleGuruDeleted = (id: number) => {
    setGuruList((prev) => prev.filter((g) => g.id_guru !== id));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {guruList.length > 0 ? (
        guruList.map((g) => (
          <GuruCard
            key={g.id_guru}
            guru={g}
            onUpdated={handleGuruUpdated}
            onDeleted={handleGuruDeleted}
          />
        ))
      ) : (
        <p className="col-span-full text-center text-gray-500">
          Tidak ada data guru ditemukan
        </p>
      )}
    </div>
  );
};

export default GuruGrid;
