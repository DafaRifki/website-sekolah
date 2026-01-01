"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
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
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus } from "lucide-react";
import apiClient from "@/config/axios";

interface Siswa {
  id_siswa: number;
  nama: string;
}

interface Tarif {
  id_tarif: number;
  namaTagihan: string;
  nominal: number;
}

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
  semester: number;
  isActive: boolean;
}

interface TambahPembayaranModalProps {
  onSuccess: () => void;
}

export default function TambahPembayaranModal({
  onSuccess,
}: TambahPembayaranModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [tarifList, setTarifList] = useState<Tarif[]>([]);
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);

  const [form, setForm] = useState({
    siswaId: "",
    tarifId: "",
    tahunAjaranId: "",
    jumlahBayar: "",
    metode: "",
    keterangan: "",
  });

  const metodePembayaran = ["Transfer Bank", "Cash", "QRIS", "Virtual Account"];

  // Fetch data saat modal dibuka
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          setFetchLoading(true);
          const [siswaRes, tarifRes, tahunRes] = await Promise.all([
            apiClient.get("/siswa"),
            apiClient.get("/tarif-pembayaran"),
            apiClient.get("/tahun-ajaran"),
          ]);

          setSiswaList(siswaRes.data.data || []);
          setTarifList(tarifRes.data.data || []);

          const years = tahunRes.data.data || [];
          setTahunAjaranList(years);

          // Auto select active year
          const activeYear = years.find((y: TahunAjaran) => y.isActive);
          if (activeYear) {
            setForm((prev) => ({
              ...prev,
              tahunAjaranId: String(activeYear.id_tahun),
            }));
          }
        } catch {
          toast.error("Gagal memuat data pendukung");
        } finally {
          setFetchLoading(false);
        }
      };
      fetchData();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.siswaId ||
      !form.tarifId ||
      !form.tahunAjaranId ||
      !form.jumlahBayar ||
      !form.metode
    ) {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
      return;
    }

    try {
      setLoading(true);
      let tagihanId: number;

      // STEP 1: Cek apakah tagihan sudah ada
      try {
        const res = await apiClient.get(`/tagihan/siswa/${form.siswaId}`, {
          params: {
            tahunAjaranId: form.tahunAjaranId,
          },
        });

        const existingTagihan = res.data.data.find(
          (t: any) => t.tarif.id_tarif === Number(form.tarifId)
        );

        if (existingTagihan) {
          tagihanId = existingTagihan.id_tagihan;
        } else {
          throw new Error("Tagihan belum ada");
        }
      } catch {
        // Buat tagihan baru jika belum ada
        const createRes = await apiClient.post("/tagihan", {
          id_siswa: Number(form.siswaId),
          tarifId: Number(form.tarifId),
          tahunAjaranId: Number(form.tahunAjaranId),
        });

        tagihanId = createRes.data.data.id_tagihan;
      }

      // STEP 2: Buat pembayaran
      await apiClient.post("/pembayaran", {
        tagihanId,
        jumlahBayar: Number(form.jumlahBayar.replace(/\D/g, "")),
        metode: form.metode,
        keterangan: form.keterangan || undefined,
      });

      // STEP 3: Auto update status tagihan
      await apiClient.put(`/tagihan/${tagihanId}/auto-update-status`);

      toast.success("Pembayaran berhasil disimpan");

      // Reset form (keep active year if possible)
      setForm((prev) => ({
        ...prev,
        siswaId: "",
        tarifId: "",
        jumlahBayar: "",
        metode: "",
        keterangan: "",
      }));

      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error(error);
      toast.error("Gagal menyimpan pembayaran", {
        description:
          error.response?.data?.message || "Terjadi kesalahan sistem",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedTarif = tarifList.find(
    (t) => t.id_tarif === Number(form.tarifId)
  );

  const handleJumlahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = raw ? Number(raw).toLocaleString("id-ID") : "";
    setForm({ ...form, jumlahBayar: formatted });
  };

  const handleTarifChange = (value: string) => {
    const tarif = tarifList.find((t) => t.id_tarif === Number(value));
    setForm({
      ...form,
      tarifId: value,
      jumlahBayar: tarif
        ? String(tarif.nominal.toLocaleString("id-ID"))
        : form.jumlahBayar,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pembayaran
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Tambah Pembayaran</DialogTitle>
          <DialogDescription>
            Masukkan data pembayaran siswa baru. Tagihan akan dibuat otomatis
            jika belum tersedia.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {fetchLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Memuat data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              {/* Grid 2 Kolom: Siswa & Tahun Ajaran */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Siswa <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={form.siswaId}
                    onValueChange={(v) => setForm({ ...form, siswaId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih siswa..." />
                    </SelectTrigger>
                    <SelectContent>
                      {siswaList.map((s) => (
                        <SelectItem key={s.id_siswa} value={String(s.id_siswa)}>
                          {s.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    Tahun Ajaran <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={form.tahunAjaranId}
                    onValueChange={(v) =>
                      setForm({ ...form, tahunAjaranId: v })
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tahun ajaran..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tahunAjaranList.map((ta) => (
                        <SelectItem
                          key={ta.id_tahun}
                          value={String(ta.id_tahun)}>
                          {ta.namaTahun} (
                          {ta.semester === 1 ? "Ganjil" : "Genap"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Grid 2 Kolom: Tarif & Metode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Kategori Tagihan <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={form.tarifId}
                    onValueChange={handleTarifChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tarifList.map((t) => (
                        <SelectItem key={t.id_tarif} value={String(t.id_tarif)}>
                          {t.namaTagihan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTarif && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Nominal baku: Rp{" "}
                      {selectedTarif.nominal.toLocaleString("id-ID")}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Metode Pembayaran <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={form.metode}
                    onValueChange={(v) => setForm({ ...form, metode: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih metode..." />
                    </SelectTrigger>
                    <SelectContent>
                      {metodePembayaran.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Input Nominal Pembayaran (Highlight) */}
              <div className="space-y-2">
                <Label className="text-base">
                  Nominal yang Dibayarkan (Rp)
                </Label>
                <div className="relative">
                  <Input
                    placeholder="0"
                    value={form.jumlahBayar}
                    onChange={handleJumlahChange}
                    className="text-lg font-medium h-12 pl-4"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Pastikan nominal sesuai dengan bukti pembayaran.
                </p>
              </div>

              {/* Keterangan */}
              <div className="space-y-2">
                <Label>Keterangan (Opsional)</Label>
                <Input
                  placeholder="Contoh: Lunas, Cicilan pertama, dll"
                  value={form.keterangan}
                  onChange={(e) =>
                    setForm({ ...form, keterangan: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter className="p-6 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Pembayaran
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
