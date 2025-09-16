import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import avatarDefault from "../../../../assets/avatar.png";

interface Siswa {
  id_siswa: number;
  nis: string;
  nama: string;
  jenisKelamin?: string;
  fotoProfil?: string;
  kelas?: { namaKelas: string };
}

interface Props {
  siswaList: Siswa[];
  onDetail: (id: number) => void;
}

export default function SiswaTable({ siswaList, onDetail }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Foto</TableHead>
          <TableHead>NIS</TableHead>
          <TableHead>Nama</TableHead>
          <TableHead>Jenis Kelamin</TableHead>
          <TableHead>Kelas</TableHead>
          <TableHead>Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {siswaList.map((siswa) => (
          <TableRow key={siswa.id_siswa}>
            <TableCell>
              <img
                src={
                  siswa.fotoProfil
                    ? `${
                        import.meta.env.VITE_API_BASE_URL ||
                        "http://localhost:3000/uploads/"
                      }${siswa.fotoProfil}`
                    : avatarDefault
                }
                alt={siswa.nama}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  // Fallback ke avatar default jika gambar gagal dimuat
                  (e.target as HTMLImageElement).src = avatarDefault;
                }}
              />
            </TableCell>
            <TableCell>{siswa.nis}</TableCell>
            <TableCell>{siswa.nama}</TableCell>
            <TableCell>{siswa.jenisKelamin}</TableCell>
            <TableCell>{siswa.kelas?.namaKelas}</TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDetail(siswa.id_siswa)}>
                Detail
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
