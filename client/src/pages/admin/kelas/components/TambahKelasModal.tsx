import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import apiClient from "@/config/axios";
import Swal from "sweetalert2";
import { Plus, GraduationCap, User } from "lucide-react";

interface Guru {
  id_guru: number;
  nama: string;
}

interface TambahKelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Pindahkan FormField keluar dari komponen utama
const FormField = ({
  label,
  children,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {children}
  </div>
);

export default function TambahKelasModal({
  isOpen,
  onClose,
  onSuccess,
}: TambahKelasModalProps) {
  const [namaKelas, setNamaKelas] = useState("");
  const [tingkat, setTingkat] = useState("");
  const [waliId, setWaliId] = useState<string>("none");
  const [guruList, setGuruList] = useState<Guru[]>([]);

  const resetForm = () => {
    setNamaKelas("");
    setTingkat("");
    setWaliId("none");
  };

  // Fetch daftar guru
  useEffect(() => {
    if (isOpen) {
      apiClient
        .get("/guru")
        .then((res) => setGuruList(res.data.data))
        .catch((err) => console.error("Gagal fetch guru:", err));
    }
  }, [isOpen]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!namaKelas.trim() || !tingkat.trim()) {
        Swal.fire("Error", "Nama kelas dan tingkat wajib diisi", "error");
        return;
      }

      Swal.fire({
        title: "Menyimpan...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      await apiClient.post("/kelas", {
        namaKelas: namaKelas.trim(),
        tingkat: tingkat.trim(),
        waliId: waliId === "none" ? null : parseInt(waliId),
      });

      Swal.fire("Berhasil!", "Kelas berhasil ditambahkan.", "success");

      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      Swal.fire(
        "Gagal!",
        error.response?.data?.message || error.message,
        "error"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Tambah Kelas Baru
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Lengkapi form di bawah untuk menambahkan kelas baru
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="py-4 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">
              Informasi Dasar
            </h4>

            <div className="grid grid-cols-1 gap-4">
              <FormField label="Nama Kelas" required>
                <Input
                  value={namaKelas}
                  onChange={(e) => setNamaKelas(e.target.value)}
                  placeholder="Contoh: X IPA 1, XI IPS 2"
                  required
                />
              </FormField>

              <FormField label="Tingkat" required>
                <Select value={tingkat} onValueChange={setTingkat} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tingkat kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="X">Kelas X</SelectItem>
                    <SelectItem value="XI">Kelas XI</SelectItem>
                    <SelectItem value="XII">Kelas XII</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>

          {/* Wali Kelas Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">
              Wali Kelas
            </h4>

            <FormField label="Pilih Wali Kelas">
              <Select value={waliId} onValueChange={setWaliId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih guru sebagai wali kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Belum ditentukan</span>
                    </div>
                  </SelectItem>
                  {guruList.map((g) => (
                    <SelectItem key={g.id_guru} value={g.id_guru.toString()}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {g.nama.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span>{g.nama}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Wali kelas dapat diubah kemudian jika diperlukan
              </p>
            </FormField>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Kelas
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
