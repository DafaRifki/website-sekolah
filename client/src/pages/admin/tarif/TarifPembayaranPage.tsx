import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/config/axios";
import {
  DollarSign,
  Pencil,
  Plus,
  Receipt,
  Save,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface TarifPembayaran {
  id_tarif: number;
  namaTagihan: string;
  nominal: number;
  keterangan?: string;
  tahunAjaranId: number;
  tahunAjaran?: {
    id_tahun: number;
    namaTahun: string;
    semester: string;
  };
  totalTagihan?: number;
}

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
  semester: string;
  isActive: boolean;
}

interface EditingTarif {
  id_tarif: number;
  namaTagihan: string;
  nominal: string;
  keterangan: string;
}

export default function TarifPembayaranPage() {
  const [tarifList, setTarifList] = useState<TarifPembayaran[]>([]);
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  // State for inline editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<EditingTarif | null>(null);

  // State for add new tarif dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTarif, setNewTarif] = useState({
    namaTagihan: "",
    nominal: "",
    keterangan: "",
  });

  // Fetch tahun ajaran list
  useEffect(() => {
    fetchTahunAjaran();
  }, []);

  // Fetch tarif when tahun ajaran selected
  useEffect(() => {
    if (selectedTahunAjaran) {
      fetchTarifByTahunAjaran(selectedTahunAjaran);
    }
  }, [selectedTahunAjaran]);

  const fetchTahunAjaran = async () => {
    try {
      const response = await apiClient.get("/tahun-ajaran");
      if (response.data.success) {
        setTahunAjaranList(response.data.data);
        // Auto select active tahun ajaran
        const active = response.data.data.find(
          (ta: TahunAjaran) => ta.isActive,
        );
        if (active) {
          setSelectedTahunAjaran(active.id_tahun);
        }
      }
    } catch (error) {
      toast.error("Gagal memuat tahun ajaran");
      console.error(error);
    }
  };

  const fetchTarifByTahunAjaran = async (tahunAjaranId: number) => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/tarif-pembayaran/tahun-ajaran/${tahunAjaranId}`,
      );
      if (response.data.success) {
        setTarifList(response.data.data);
      }
    } catch (error) {
      toast.error("Gagal memuat tarif pembayaran");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Start editing
  const handleEdit = (tarif: TarifPembayaran) => {
    setEditingId(tarif.id_tarif);
    setEditingData({
      id_tarif: tarif.id_tarif,
      namaTagihan: tarif.namaTagihan,
      nominal: tarif.nominal.toString(),
      keterangan: tarif.keterangan || "",
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
  };

  // Save edited tarif
  const handleSaveEdit = async () => {
    if (!editingData) return;

    try {
      const response = await apiClient.put(
        `/tarif-pembayaran/${editingData.id_tarif}`,
        {
          namaTagihan: editingData.namaTagihan,
          nominal: parseFloat(editingData.nominal),
          keterangan: editingData.keterangan,
        },
      );

      if (response.data.success) {
        toast.success("Tarif berhasil diperbarui");
        setEditingId(null);
        setEditingData(null);
        if (selectedTahunAjaran) {
          fetchTarifByTahunAjaran(selectedTahunAjaran);
        }
      } else {
        toast.error(response.data.message || "Gagal memperbarui tarif");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Terjadi kesalahan saat memperbarui tarif",
      );
      console.error(error);
    }
  };

  // Delete tarif
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus tarif ini?")) return;

    try {
      const response = await apiClient.delete(`/tarif-pembayaran/${id}`);

      if (response.data.success) {
        toast.success("Tarif berhasil dihapus");
        if (selectedTahunAjaran) {
          fetchTarifByTahunAjaran(selectedTahunAjaran);
        }
      } else {
        toast.error(response.data.message || "Gagal menghapus tarif");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menghapus tarif",
      );
      console.error(error);
    }
  };

  // Add new tarif
  const handleAddTarif = async () => {
    if (!newTarif.namaTagihan || !newTarif.nominal || !selectedTahunAjaran) {
      toast.error("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    try {
      const response = await apiClient.post("/tarif-pembayaran", {
        namaTagihan: newTarif.namaTagihan,
        nominal: parseFloat(newTarif.nominal),
        keterangan: newTarif.keterangan,
        tahunAjaranId: selectedTahunAjaran,
      });

      if (response.data.success) {
        toast.success("Tarif berhasil ditambahkan");
        setShowAddDialog(false);
        setNewTarif({
          namaTagihan: "",
          nominal: "",
          keterangan: "",
        });
        if (selectedTahunAjaran) {
          fetchTarifByTahunAjaran(selectedTahunAjaran);
        }
      } else {
        toast.error(response.data.message || "Gagal menambahkan tarif");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menambahkan tarif",
      );
      console.error(error);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header Section - Internal to component */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Manajemen Tarif Pembayaran
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Kelola tarif pembayaran untuk setiap tahun ajaran
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Filter Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Filter Tahun Ajaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label className="text-slate-700 dark:text-slate-300 font-medium mb-2 block">
                Pilih Tahun Ajaran
              </Label>
              <Select
                value={selectedTahunAjaran?.toString() ?? ""}
                onValueChange={(value) =>
                  setSelectedTahunAjaran(parseInt(value))
                }>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tahun ajaran" />
                </SelectTrigger>
                <SelectContent>
                  {tahunAjaranList.map((ta) => (
                    <SelectItem
                      key={ta.id_tahun}
                      value={ta.id_tahun.toString()}>
                      <div className="flex items-center gap-2">
                        <span>
                          {ta.namaTahun} - Semester {ta.semester}
                        </span>
                        {ta.isActive && (
                          <Badge variant="default" className="text-xs">
                            Aktif
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              disabled={!selectedTahunAjaran}
              className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Tarif
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tarif Table */}
      <Card className="border-0 shadow-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            Daftar Tarif Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
              <span className="ml-3 text-lg text-slate-600 dark:text-slate-400">
                Memuat data...
              </span>
            </div>
          ) : !selectedTahunAjaran ? (
            <div className="text-center py-20">
              <Receipt className="h-16 w-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Pilih Tahun Ajaran
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Silakan pilih tahun ajaran untuk melihat tarif pembayaran
              </p>
            </div>
          ) : tarifList.length === 0 ? (
            <div className="text-center py-20">
              <DollarSign className="h-16 w-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Tidak ada tarif
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Belum ada tarif untuk tahun ajaran ini. Tambahkan tarif pertama.
              </p>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Tarif Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nama Tagihan</TableHead>
                    <TableHead>Nominal</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="w-32 text-center">
                      Total Tagihan
                    </TableHead>
                    <TableHead className="text-right w-32">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tarifList.map((tarif, index) => (
                    <TableRow key={tarif.id_tarif}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        {editingId === tarif.id_tarif ? (
                          <Input
                            value={editingData?.namaTagihan}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                namaTagihan: e.target.value,
                              })
                            }
                            className="max-w-xs"
                          />
                        ) : (
                          <span className="font-medium">
                            {tarif.namaTagihan}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === tarif.id_tarif ? (
                          <Input
                            type="number"
                            value={editingData?.nominal}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                nominal: e.target.value,
                              })
                            }
                            className="max-w-[150px]"
                          />
                        ) : (
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {formatCurrency(tarif.nominal)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === tarif.id_tarif ? (
                          <Input
                            value={editingData?.keterangan}
                            onChange={(e) =>
                              setEditingData({
                                ...editingData!,
                                keterangan: e.target.value,
                              })
                            }
                            className="max-w-xs"
                          />
                        ) : (
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {tarif.keterangan || "-"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-medium">
                          {tarif.totalTagihan || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {editingId === tarif.id_tarif ? (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={handleSaveEdit}
                              className="bg-green-600 hover:bg-green-700">
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(tarif)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(tarif.id_tarif)}
                              disabled={(tarif.totalTagihan || 0) > 0}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Tarif Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tambah Tarif Pembayaran</DialogTitle>
            <DialogDescription>
              Tambahkan tarif pembayaran baru untuk tahun ajaran yang dipilih
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="namaTagihan">
                Nama Tagihan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="namaTagihan"
                placeholder="Contoh: SPP Bulan Januari"
                value={newTarif.namaTagihan}
                onChange={(e) =>
                  setNewTarif({ ...newTarif, namaTagihan: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nominal">
                Nominal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nominal"
                type="number"
                placeholder="Contoh: 500000"
                value={newTarif.nominal}
                onChange={(e) =>
                  setNewTarif({ ...newTarif, nominal: e.target.value })
                }
              />
              {newTarif.nominal && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatCurrency(parseFloat(newTarif.nominal))}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan</Label>
              <Textarea
                id="keterangan"
                placeholder="Keterangan tambahan (opsional)"
                value={newTarif.keterangan}
                onChange={(e) =>
                  setNewTarif({ ...newTarif, keterangan: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Batal
            </Button>
            <Button
              onClick={handleAddTarif}
              className="bg-blue-600 hover:bg-blue-700">
              Tambah Tarif
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
