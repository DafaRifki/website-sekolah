import TahunAjaranCard from "./TahunAjaranCard";

interface TahunAjaranListProps {
  tahunAjaran: any;
}

export default function TahunAjaranList({ tahunAjaran }: TahunAjaranListProps) {
  if (!Array.isArray(tahunAjaran) || tahunAjaran.length === 0) {
    return (
      <p className="text-center text-gray-500">Belum ada data tahun ajaran</p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {tahunAjaran.map((item) => (
        <TahunAjaranCard key={item.id_tahun} data={item} />
      ))}
    </div>
  );
}
