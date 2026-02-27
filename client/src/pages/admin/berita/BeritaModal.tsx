import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/config/axios";
import Swal from "sweetalert2";
import { Loader2, Upload } from "lucide-react";

interface BeritaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
}

const BeritaModal: React.FC<BeritaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editData,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    judul: "",
    isi: "",
    kategori: "Kegiatan",
    penulis: "Admin",
    tanggal: new Date().toISOString().split("T")[0],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (editData) {
      setFormData({
        judul: editData.judul || "",
        isi: editData.isi || "",
        kategori: editData.kategori || "Kegiatan",
        penulis: editData.penulis || "Admin",
        tanggal: editData.tanggal ? new Date(editData.tanggal).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      });
      setPreviewUrl(editData.gambar ? `${import.meta.env.VITE_URL_API || "http://localhost:3000"}${editData.gambar}` : null);
    } else {
      setFormData({
        judul: "",
        isi: "",
        kategori: "Kegiatan",
        penulis: "Admin",
        tanggal: new Date().toISOString().split("T")[0],
      });
      setImageFile(null);
      setPreviewUrl(null);
    }
  }, [editData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("judul", formData.judul);
    data.append("isi", formData.isi);
    data.append("kategori", formData.kategori);
    data.append("penulis", formData.penulis);
    data.append("tanggal", formData.tanggal);
    if (imageFile) {
      data.append("gambar", imageFile);
    }

    try {
      if (editData) {
        await apiClient.put(`/berita/${editData.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Berhasil!", "Berita berhasil diperbarui", "success");
      } else {
        await apiClient.post("/berita", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Berhasil!", "Berita berhasil ditambahkan", "success");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      Swal.fire("Gagal!", error.response?.data?.message || "Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Berita" : "Tambah Berita baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="judul">Judul Berita</Label>
            <Input
              id="judul"
              placeholder="Masukkan judul berita"
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select
                value={formData.kategori}
                onValueChange={(value) => setFormData({ ...formData, kategori: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Infrastruktur">Infrastruktur</SelectItem>
                  <SelectItem value="Prestasi">Prestasi</SelectItem>
                  <SelectItem value="Kegiatan">Kegiatan</SelectItem>
                  <SelectItem value="Pengumuman">Pengumuman</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="isi">Isi Berita</Label>
            <Textarea
              id="isi"
              placeholder="Tuliskan detail berita di sini..."
              className="min-h-[150px]"
              value={formData.isi}
              onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gambar">Gambar Berita</Label>
            <div className="flex flex-col items-center gap-4 p-4 border-2 border-dashed rounded-lg hover:bg-slate-50 transition-colors">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <Upload className="w-8 h-8" />
                  <p className="text-sm text-center">Klik untuk upload gambar berita</p>
                </div>
              )}
              <Input
                id="gambar"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("gambar")?.click()}
              >
                Pilih File
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editData ? "Simpan Perubahan" : "Simpan Berita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BeritaModal;
