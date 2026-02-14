"use client";

import { useState, useEffect, useRef } from "react";
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
import { Loader2, Plus, Search, X } from "lucide-react";
import apiClient from "@/config/axios";
import { AxiosError } from "axios";
import { cn } from "@/lib/utils";

interface Siswa {
  id_siswa: number;
  nama: string;
  nis?: string;
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

interface Tagihan {
  id_tagihan: number;
  status: string;
  sisaPembayaran: number;
  bulan: string | null;
  tarif: {
    id_tarif: number;
    namaTagihan: string;
  };
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

  // ✅ NEW: Search state
  const [siswaSearch, setSiswaSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    siswaId: "",
    tarifId: "",
    tahunAjaranId: "",
    jumlahBayar: "",
    metode: "",
    keterangan: "",
  });

  const [existingTagihan, setExistingTagihan] = useState<Tagihan | null>(null);
  const [checkLoading, setCheckLoading] = useState(false);

  const metodePembayaran = ["Transfer Bank", "Cash", "QRIS", "Virtual Account"];

  // ✅ Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Check for existing tagihan when selection changes
  useEffect(() => {
    const checkExistingTagihan = async () => {
      if (form.siswaId && form.tarifId && form.tahunAjaranId) {
        try {
          setCheckLoading(true);
          const res = await apiClient.get(`/tagihan/siswa/${form.siswaId}`, {
            params: { tahunAjaranId: form.tahunAjaranId },
          });

          const relevantBills = res.data.data.filter(
            (t: Tagihan) => t.tarif.id_tarif === Number(form.tarifId),
          );

          const found = relevantBills
            .sort((a: Tagihan, b: Tagihan) => a.id_tagihan - b.id_tagihan)
            .find((t: Tagihan) => t.status !== "LUNAS");

          if (found) {
            setExistingTagihan(found);
            if (found.sisaPembayaran > 0) {
              setForm((prev) => ({
                ...prev,
                jumlahBayar: found.sisaPembayaran.toLocaleString("id-ID"),
              }));
            }
          } else {
            setExistingTagihan(null);
            const tarif = tarifList.find(
              (t) => t.id_tarif === Number(form.tarifId),
            );
            if (tarif) {
              setForm((prev) => ({
                ...prev,
                jumlahBayar: tarif.nominal.toLocaleString("id-ID"),
              }));
            }
          }
        } catch (error) {
          console.error("Error checking existing tagihan:", error);
          setExistingTagihan(null);
        } finally {
          setCheckLoading(false);
        }
      } else {
        setExistingTagihan(null);
      }
    };

    checkExistingTagihan();
  }, [form.siswaId, form.tarifId, form.tahunAjaranId, tarifList]);

  // ✅ Filter siswa based on search
  const filteredSiswa = siswaList.filter((s) =>
    s.nama.toLowerCase().includes(siswaSearch.toLowerCase()),
  );

  // ✅ Handle siswa selection
  const handleSelectSiswa = (siswa: Siswa) => {
    setSelectedSiswa(siswa);
    setSiswaSearch(siswa.nama);
    setForm({ ...form, siswaId: String(siswa.id_siswa) });
    setShowSuggestions(false);
  };

  // ✅ Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSiswaSearch(value);
    setShowSuggestions(true);

    // Clear selection if user is typing
    if (selectedSiswa && value !== selectedSiswa.nama) {
      setSelectedSiswa(null);
      setForm({ ...form, siswaId: "" });
    }
  };

  // ✅ Clear search
  const handleClearSearch = () => {
    setSiswaSearch("");
    setSelectedSiswa(null);
    setForm({ ...form, siswaId: "" });
    setShowSuggestions(false);
  };

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

    const amount = Number(form.jumlahBayar.replace(/\D/g, ""));
    if (existingTagihan && amount > existingTagihan.sisaPembayaran) {
      toast.error("Jumlah melebihi nominal", {
        description: `Sisa tagihan ini adalah Rp ${existingTagihan.sisaPembayaran.toLocaleString("id-ID")}`,
      });
      return;
    }

    try {
      setLoading(true);
      let tagihanId: number;

      if (
        existingTagihan &&
        Number(form.tarifId) === existingTagihan.tarif.id_tarif
      ) {
        tagihanId = existingTagihan.id_tagihan;
      } else {
        try {
          const res = await apiClient.get(`/tagihan/siswa/${form.siswaId}`, {
            params: { tahunAjaranId: form.tahunAjaranId },
          });

          const relevantBills = res.data.data.filter(
            (t: Tagihan) => t.tarif.id_tarif === Number(form.tarifId),
          );

          const found = relevantBills
            .sort((a: Tagihan, b: Tagihan) => a.id_tagihan - b.id_tagihan)
            .find((t: Tagihan) => t.status !== "LUNAS");

          if (found) {
            tagihanId = found.id_tagihan;
          } else {
            const createRes = await apiClient.post("/tagihan", {
              id_siswa: Number(form.siswaId),
              tarifId: Number(form.tarifId),
              tahunAjaranId: Number(form.tahunAjaranId),
            });
            tagihanId = createRes.data.data.id_tagihan;
          }
        } catch (err: any) {
          throw new Error(
            err.response?.data?.message || "Gagal memproses tagihan",
          );
        }
      }

      await apiClient.post("/pembayaran", {
        tagihanId,
        jumlahBayar: Number(form.jumlahBayar.replace(/\D/g, "")),
        metode: form.metode,
        keterangan: form.keterangan || undefined,
      });

      await apiClient.put(`/tagihan/${tagihanId}/auto-update-status`);

      toast.success("Pembayaran berhasil disimpan");

      // Reset form
      setForm((prev) => ({
        ...prev,
        siswaId: "",
        tarifId: "",
        jumlahBayar: "",
        metode: "",
        keterangan: "",
      }));
      setSiswaSearch("");
      setSelectedSiswa(null);

      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error(error);
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error("Gagal menyimpan pembayaran", {
        description:
          axiosError.response?.data?.message || "Terjadi kesalahan sistem",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedTarif = tarifList.find(
    (t) => t.id_tarif === Number(form.tarifId),
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
                {/* ✅ NEW: Direct Search Input (No Popover) */}
                <div className="space-y-2" ref={searchRef}>
                  <Label>
                    Siswa <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Ketik nama siswa..."
                      value={siswaSearch}
                      onChange={handleSearchChange}
                      onFocus={() => setShowSuggestions(true)}
                      className={cn(
                        "pl-9",
                        siswaSearch && !selectedSiswa && "pr-9",
                      )}
                    />
                    {siswaSearch && !selectedSiswa && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && siswaSearch && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-input rounded-md shadow-lg max-h-[200px] overflow-auto">
                      {filteredSiswa.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Siswa tidak ditemukan
                        </div>
                      ) : (
                        <div className="py-1">
                          {filteredSiswa.map((siswa) => (
                            <button
                              key={siswa.id_siswa}
                              type="button"
                              onClick={() => handleSelectSiswa(siswa)}
                              className={cn(
                                "w-full px-3 py-2 text-left hover:bg-accent transition-colors",
                                selectedSiswa?.id_siswa === siswa.id_siswa &&
                                  "bg-accent",
                              )}>
                              <div className="font-medium text-sm">
                                {siswa.nama}
                              </div>
                              {siswa.nis && (
                                <div className="text-xs text-muted-foreground">
                                  NIS: {siswa.nis}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selected Siswa Badge */}
                  {selectedSiswa && (
                    <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm">
                      <span className="text-green-700 font-medium">
                        ✓ {selectedSiswa.nama}
                      </span>
                    </div>
                  )}
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
                    <div className="flex flex-col gap-1 mt-1">
                      <p className="text-xs text-muted-foreground">
                        Nominal baku: Rp{" "}
                        {selectedTarif.nominal.toLocaleString("id-ID")}
                      </p>
                      {checkLoading ? (
                        <div className="flex items-center gap-2 text-xs text-blue-600 animate-pulse">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Mengecek tagihan...</span>
                        </div>
                      ) : existingTagihan ? (
                        <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-lg mt-1">
                          <div className="flex items-center justify-between text-[11px] mb-2">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-blue-900">
                                Tagihan Terdeteksi
                              </span>
                              {existingTagihan.bulan && (
                                <span className="text-blue-600 font-medium">
                                  Periode: {existingTagihan.bulan}
                                </span>
                              )}
                            </div>
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full font-bold uppercase text-[9px]",
                                existingTagihan.status === "LUNAS"
                                  ? "bg-green-100 text-green-700"
                                  : existingTagihan.status === "CICIL"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700",
                              )}>
                              {existingTagihan.status.replace("_", " ")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs mt-1 pt-1 border-t border-blue-100/30">
                            <span className="text-blue-600 font-medium">
                              Sisa Tagihan:
                            </span>
                            <span className="font-black text-blue-900 text-sm">
                              Rp{" "}
                              {existingTagihan.sisaPembayaran.toLocaleString(
                                "id-ID",
                              )}
                            </span>
                          </div>
                        </div>
                      ) : null}
                    </div>
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

              {/* Input Nominal Pembayaran */}
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
                {form.jumlahBayar && (
                  <p className="text-xs font-medium text-green-600 mt-1">
                    Terbilang: Rp {form.jumlahBayar}
                  </p>
                )}
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
