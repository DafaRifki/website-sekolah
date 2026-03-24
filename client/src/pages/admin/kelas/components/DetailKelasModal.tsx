import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Guru {
  id_guru: number;
  nama: string;
  nip: string;
  jabatan?: string;
  email?: string;
  noHP?: string;
}

interface Siswa {
  id_siswa: number;
  nama: string;
  nis: string;
  jenisKelamin?: string;
  alamat?: string;
}

// PERBAIKAN: Sesuaikan interface Kelas dengan respons backend
interface Kelas {
  id_kelas: number;
  namaKelas: string;
  tingkat: string;
  waliKelas?: Guru | null; // Diganti dari 'guru'
  jumlahSiswa?: number;    // Diganti dari '_count'
  tahunAjaran?: string | null; // Backend mengirimkan ini sebagai string langsung
  siswa?: Siswa[];
}

interface DetailKelasModalProps {
  kelas: Kelas | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DetailKelasModal({
  kelas,
  isOpen,
  onClose,
}: DetailKelasModalProps) {
  if (!kelas) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Detail Kelas
          </DialogTitle>
          <DialogDescription>
            Menampilkan detail kelas, wali kelas, serta jumlah siswa yang
            terdaftar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Nama Kelas
              </label>
              <div className="p-2 bg-gray-50 rounded-lg font-medium">
                {kelas.namaKelas}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Tingkat
              </label>
              <div className="p-2 bg-gray-50 rounded-lg">
                <Badge variant="outline">{kelas.tingkat}</Badge>
              </div>
            </div>

            {/* PERBAIKAN: Tahun Ajaran Aktif */}
            {kelas.tahunAjaran && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tahun Ajaran
                </label>
                <div className="p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                  <span className="font-medium">
                    {kelas.tahunAjaran}
                  </span>
                  <Badge variant="secondary">Aktif</Badge>
                </div>
              </div>
            )}
          </div>

          {/* PERBAIKAN: Wali Kelas */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Wali Kelas
            </label>
            <div className="p-3 bg-gray-50 rounded-lg space-y-1">
              {kelas.waliKelas ? (
                <>
                  <p className="font-medium">{kelas.waliKelas.nama}</p>
                  <p className="text-sm text-gray-600">NIP: {kelas.waliKelas.nip || "-"}</p>
                  {kelas.waliKelas.jabatan && (
                     <p className="text-sm text-gray-600">
                       Jabatan: {kelas.waliKelas.jabatan}
                     </p>
                  )}
                  {kelas.waliKelas.email && (
                    <p className="text-sm text-gray-600">
                      Email: {kelas.waliKelas.email}
                    </p>
                  )}
                  {kelas.waliKelas.noHP && (
                    <p className="text-sm text-gray-600">
                      No HP: {kelas.waliKelas.noHP}
                    </p>
                  )}
                </>
              ) : (
                <span className="text-gray-500 italic">Belum ditentukan</span>
              )}
            </div>
          </div>

          {/* PERBAIKAN: Statistik Siswa */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Jumlah Siswa
            </label>
            <div className="p-2 bg-gray-50 rounded-lg font-medium">
              {kelas.jumlahSiswa || 0} siswa
            </div>
          </div>

          {/* Preview Siswa */}
          {/* Catatan: Bagian ini kemungkinan tidak akan muncul karena backend 'getAll' tidak mengirimkan daftar siswa secara spesifik. */}
          {kelas.siswa && kelas.siswa.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Daftar Siswa (max 3)
              </label>
              <ul className="p-2 bg-gray-50 rounded-lg space-y-1 text-sm">
                {kelas.siswa.slice(0, 3).map((s) => (
                  <li key={s.id_siswa} className="flex justify-between">
                    <span>{s.nama}</span>
                    <Badge variant="secondary">{s.nis}</Badge>
                  </li>
                ))}
                {kelas.siswa.length > 3 && (
                  <li className="text-gray-500 italic">
                    +{kelas.siswa.length - 3} siswa lainnya
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}