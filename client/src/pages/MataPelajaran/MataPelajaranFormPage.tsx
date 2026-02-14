import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/config/axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Loader2, ArrowLeft, Save } from "lucide-react";

const KELOMPOK_OPTIONS = [
  "Umum",
  "Peminatan",
  "Lintas Minat",
  "Muatan Lokal",
  "Pengembangan Diri",
];

export default function MataPelajaranFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [namaMapel, setNamaMapel] = useState("");
  const [kelompokMapel, setKelompokMapel] = useState("none");

  // Permission check
  useEffect(() => {
    if (authLoading) return;

    if (!user || !isAdmin) {
      navigate("/dashboard");
      toast.error("Akses ditolak. Halaman ini hanya untuk Admin.");
    }
  }, [user, authLoading, isAdmin, navigate]);

  const fetchMataPelajaran = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get(`/mata-pelajaran/${id}`);
      const mapel = data.data;

      setNamaMapel(mapel.namaMapel);
      setKelompokMapel(mapel.kelompokMapel || "none");
    } catch (error) {
      console.error("Failed to fetch mata pelajaran:", error);
      toast.error("Gagal memuat data mata pelajaran");
      navigate("/mata-pelajaran");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  // Fetch data if edit mode
  useEffect(() => {
    if (isEdit && id && user && isAdmin) {
      fetchMataPelajaran();
    }
  }, [isEdit, id, user, isAdmin, fetchMataPelajaran]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!namaMapel.trim()) {
      toast.error("Nama mata pelajaran wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        namaMapel: namaMapel.trim(),
        kelompokMapel: kelompokMapel === "none" ? null : kelompokMapel,
      };

      if (isEdit) {
        await apiClient.put(`/mata-pelajaran/${id}`, payload);
        toast.success("Mata pelajaran berhasil diupdate");
      } else {
        await apiClient.post("/mata-pelajaran", payload);
        toast.success("Mata pelajaran berhasil ditambahkan");
      }

      navigate("/mata-pelajaran");
    } catch (error: any) {
      console.error("Failed to save:", error);
      toast.error(
        error.response?.data?.message ||
          `Gagal ${isEdit ? "mengupdate" : "menambahkan"} mata pelajaran`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/mata-pelajaran")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit" : "Tambah"} Mata Pelajaran
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update informasi mata pelajaran"
              : "Tambahkan mata pelajaran baru"}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Mata Pelajaran</CardTitle>
          <CardDescription>
            Isi form di bawah untuk {isEdit ? "mengupdate" : "menambahkan"} mata
            pelajaran
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Mapel */}
            <div className="space-y-2">
              <Label htmlFor="namaMapel">
                Nama Mata Pelajaran <span className="text-red-500">*</span>
              </Label>
              <Input
                id="namaMapel"
                placeholder="Contoh: Matematika"
                value={namaMapel}
                onChange={(e) => setNamaMapel(e.target.value)}
                required
              />
            </div>

            {/* Kelompok Mapel */}
            <div className="space-y-2">
              <Label htmlFor="kelompokMapel">Kelompok Mata Pelajaran</Label>
              <Select value={kelompokMapel} onValueChange={setKelompokMapel}>
                <SelectTrigger id="kelompokMapel">
                  <SelectValue placeholder="Pilih kelompok (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada kelompok</SelectItem>
                  {KELOMPOK_OPTIONS.map((kelompok) => (
                    <SelectItem key={kelompok} value={kelompok}>
                      {kelompok}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Kelompok membantu mengelompokkan mata pelajaran (opsional)
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/mata-pelajaran")}
                disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
