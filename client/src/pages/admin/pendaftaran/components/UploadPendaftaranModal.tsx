import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import apiClient from "@/config/axios";
import { toast } from "sonner";

interface UploadPendaftaranModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
  semester: number;
}

export default function UploadPendaftaranModal({
  isOpen,
  onClose,
  onSuccess,
}: UploadPendaftaranModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [tahunAjaranId, setTahunAjaranId] = useState<string>("");
  const [tahunAjaran, setTahunAjaran] = useState<TahunAjaran[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTahunAjaran();
    }
  }, [isOpen]);

  const fetchTahunAjaran = async () => {
    try {
      const res = await apiClient.get("/tahun-ajaran");
      const data = res.data.data?.data || res.data.data || [];
      setTahunAjaran(data);
    } catch (error) {
      console.error("Failed to fetch tahun ajaran:", error);
      toast.error("Gagal memuat data tahun ajaran");
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const allowedExtensions = ["csv", "xlsx", "xls"];
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      toast.error(
        "Format file tidak valid. Hanya CSV dan Excel yang diperbolehkan"
      );
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setFile(selectedFile);
    toast.success("File berhasil dipilih");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await apiClient.get("/pendaftaran/template", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "template_pendaftaran.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Template berhasil diunduh");
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error("Gagal mengunduh template");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Pilih file terlebih dahulu");
      return;
    }

    if (!tahunAjaranId) {
      toast.error("Pilih tahun ajaran terlebih dahulu");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("tahunAjaranId", tahunAjaranId);

      const res = await apiClient.post("/pendaftaran/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = res.data.data;

      // Show detailed results
      if (result.failed > 0) {
        const errorList = result.errors
          .slice(0, 5)
          .map((err: any) => `Baris ${err.row}: ${err.error}`)
          .join("\n");

        const moreErrors =
          result.errors.length > 5
            ? `\n... dan ${result.errors.length - 5} error lainnya`
            : "";

        toast.warning("Upload Selesai dengan Error", {
          description: (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Berhasil: {result.success} data</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Gagal: {result.failed} data</span>
              </div>
              {result.errors.length > 0 && (
                <details className="mt-2 p-2 bg-gray-50 rounded">
                  <summary className="cursor-pointer font-medium text-sm">
                    Lihat Error
                  </summary>
                  <pre className="mt-2 text-xs whitespace-pre-wrap">
                    {errorList}
                    {moreErrors}
                  </pre>
                </details>
              )}
            </div>
          ),
          duration: 10000,
        });
      } else {
        toast.success(`${result.success} data pendaftaran berhasil diupload!`, {
          description: "Semua data berhasil diproses",
        });
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Gagal mengupload file");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setTahunAjaranId("");
    setDragActive(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Upload className="w-6 h-6 text-blue-600" />
            Upload Data Pendaftaran
          </DialogTitle>
          <DialogDescription className="text-base">
            Upload file CSV atau Excel untuk menambahkan data pendaftaran secara
            massal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">
                  Belum punya template?
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Download template CSV terlebih dahulu dan isi data sesuai
                  format yang tersedia
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="gap-2 border-blue-300 hover:bg-blue-100">
                  <Download className="w-4 h-4" />
                  Download Template
                </Button>
              </div>
            </div>
          </div>

          {/* Tahun Ajaran Selector */}
          <div className="space-y-2">
            <Label htmlFor="tahunAjaran" className="text-base font-medium">
              Tahun Ajaran <span className="text-red-500">*</span>
            </Label>
            <Select value={tahunAjaranId} onValueChange={setTahunAjaranId}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Pilih Tahun Ajaran" />
              </SelectTrigger>
              <SelectContent>
                {tahunAjaran.map((ta) => (
                  <SelectItem key={ta.id_tahun} value={ta.id_tahun.toString()}>
                    {ta.namaTahun} - Semester {ta.semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload Area */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              File <span className="text-red-500">*</span>
            </Label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                dragActive
                  ? "border-blue-500 bg-blue-50 scale-105"
                  : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}>
              {file ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-lg">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}>
                    Ganti File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium text-lg">
                      Drag & drop file atau klik untuk browse
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Format: CSV, Excel (XLSX, XLS) • Maksimal 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                    className="mt-2">
                    Pilih File
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Catatan Penting
            </h4>
            <ul className="text-sm text-amber-800 space-y-1 ml-6 list-disc">
              <li>
                Pastikan format file sesuai dengan template yang disediakan
              </li>
              <li>
                Field <strong>nama</strong> wajib diisi
              </li>
              <li>Format tanggal: YYYY-MM-DD (contoh: 2024-01-15)</li>
              <li>
                Data yang tidak valid akan dilewati dan ditampilkan dalam
                laporan error
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={loading || !file || !tahunAjaranId}
            className="gap-2 min-w-[120px]">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Mengupload...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
