// src/pages/Rapor/components/GenerateRaporModal.tsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, Search, X } from "lucide-react";
import apiClient from "@/config/axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface GenerateRaporModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tahunAjaran: any[];
  selectedTahunAjaran: string;
  selectedSemester: string;
}

interface SiswaOption {
  id_siswa: number;
  nis: string;
  nama: string;
  kelas?: {
    namaKelas: string;
    tingkat: string;
  };
}

export default function GenerateRaporModal({
  isOpen,
  onClose,
  onSuccess,
  tahunAjaran,
  selectedTahunAjaran,
  selectedSemester,
}: GenerateRaporModalProps) {
  const [siswaId, setSiswaId] = useState("");
  const [siswaList, setSiswaList] = useState<SiswaOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSiswa, setFetchingSiswa] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<SiswaOption | null>(null);
  const [filteredSiswa, setFilteredSiswa] = useState<SiswaOption[]>([]);

  useEffect(() => {
    if (!isOpen || !selectedTahunAjaran || !selectedSemester) return;

    const fetchSiswa = async () => {
      setFetchingSiswa(true);
      try {
        const res = await apiClient.get("/siswa", {
          params: {
            status: "AKTIF",
            tahunAjaranId: selectedTahunAjaran,
            semester: selectedSemester,
          },
        });

        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setSiswaList(data);
        setFilteredSiswa(data);
      } catch (error) {
        console.error("Gagal memuat daftar siswa", error);
        toast.error("Gagal memuat daftar siswa");
        setSiswaList([]);
        setFilteredSiswa([]);
      } finally {
        setFetchingSiswa(false);
      }
    };

    fetchSiswa();
  }, [isOpen, selectedTahunAjaran]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSiswa(siswaList);
      return;
    }

    const query = searchQuery.toLocaleLowerCase();
    const filtered = siswaList.filter(
      (siswa) =>
        siswa.nama.toLowerCase().includes(query) ||
        siswa.nis.toLowerCase().includes(query) ||
        siswa.kelas?.namaKelas.toLowerCase().includes(query),
    );

    setFilteredSiswa(filtered);
  }, [searchQuery, siswaList]);

  const handleSelectSiswa = (siswa: SiswaOption) => {
    setSelectedSiswa(siswa);
    setSiswaId(siswa.id_siswa.toString());
    setSearchQuery(`${siswa.nis} - ${siswa.nama}`);
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedSiswa(null);
    setSiswaId("");
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleSubmit = async () => {
    if (!siswaId) {
      toast.error("Pilih siswa terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id_siswa: Number(siswaId),
        tahunId: Number(selectedTahunAjaran),
        semester: selectedSemester,
      };

      const response = await apiClient.post("/rapor/generate-single", payload);

      if (response.data.success) {
        toast.success("Rapor berhasil digenerate!", {
          description: response.data.message || "Status: DRAFT",
        });
        onSuccess();
        handleClose();
      }
    } catch (error: any) {
      console.error("Generate rapor error:", error);

      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Gagal generate rapor. Coba lagi nanti.";

      if (error.response?.status === 409) {
        toast.warning(errMsg);
      } else {
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    handleClearSelection();
    onClose();
  };

  const tahunAjaranName =
    tahunAjaran.find((ta) => ta.id_tahun.toString() === selectedTahunAjaran)
      ?.namaTahun || selectedTahunAjaran;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Generate Rapor Siswa
          </DialogTitle>
          <DialogDescription>
            Pilih siswa untuk generate rapor. Sistem akan otomatis menghitung
            nilai dan kehadiran.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tahun Ajaran - Read Only */}
          <div className="space-y-2">
            <Label>Tahun Ajaran</Label>
            <div className="flex items-center h-10 px-3 py-2 border border-input rounded-md bg-muted">
              <span className="text-sm font-medium">{tahunAjaranName}</span>
            </div>
          </div>

          {/* Semester - Read Only */}
          <div className="space-y-2">
            <Label>Semester</Label>
            <div className="flex items-center h-10 px-3 py-2 border border-input rounded-md bg-muted">
              <span className="text-sm font-medium">
                Semester {selectedSemester}
              </span>
            </div>
          </div>

          {/* Siswa Search/Select */}
          <div className="space-y-2">
            <Label>
              Cari Siswa <span className="text-red-500">*</span>
            </Label>

            {fetchingSiswa ? (
              <div className="flex items-center justify-center h-10 border border-input rounded-md bg-muted">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Memuat siswa...
                </span>
              </div>
            ) : (
              <div className="relative">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari nama atau NIS siswa..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="pl-9 pr-9"
                  />
                  {selectedSiswa && (
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Dropdown Results */}
                {showDropdown && !selectedSiswa && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-input rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredSiswa.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        {searchQuery
                          ? "Tidak ada siswa yang cocok dengan pencarian"
                          : "Tidak ada siswa tersedia"}
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
                              "flex flex-col gap-0.5",
                            )}>
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                {siswa.nama}
                              </span>
                              {siswa.kelas && (
                                <span className="text-xs text-muted-foreground">
                                  {siswa.kelas.namaKelas}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              NIS: {siswa.nis}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Info text */}
            <p className="text-xs text-muted-foreground">
              {siswaList.length > 0
                ? `${siswaList.length} siswa tersedia untuk ${tahunAjaranName} Semester ${selectedSemester}`
                : "Belum ada siswa untuk periode ini"}
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Info:</strong> Rapor akan dibuat otomatis berdasarkan data
              nilai dan absensi siswa yang sudah ada.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={!siswaId || loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Rapor"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
