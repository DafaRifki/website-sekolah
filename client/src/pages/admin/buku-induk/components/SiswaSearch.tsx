import { Input } from "@/components/ui/input";
import React from "react";

interface Props {
  search: string;
  setSearch: (v: string) => void;
}

export default function SiswaSearch({ search, setSearch }: Props) {
  return (
    <div className="flex gap-4 mb-4">
      <Input
        placeholder="Cari siswa..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-1/3"
      />
    </div>
  );
}
