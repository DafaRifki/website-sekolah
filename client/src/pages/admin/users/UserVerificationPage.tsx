/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Add Input import
import { Check, X, UserCheck, Link as LinkIcon, ChevronsUpDown, Search, Shield, Users as UsersIcon, GraduationCap, ChevronLeft, ChevronRight, Edit, ShieldAlert, Save,Trash2 } from "lucide-react"; // Add icons
import apiClient from "@/config/axios";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";

interface PendingUser {
  id: number;
  email: string;
  createdAt: string;
  siswa: {
    id_siswa: number;
    nama: string;
    status: string;
  };
}

interface User {
  id: number;
  email: string;
  role: "ADMIN" | "GURU" | "SISWA";
  createdAt: string;
  siswa?: { nama: string; nis: string } | null;
  guru?: { nama: string; nip: string } | null;
}

interface UnlinkedData {
  siswa: {
    id_siswa: number;
    nama: string;
    nis: string;
    kelas?: { namaKelas: string };
    user?: { email: string } | null;
  }[];
  guru: {
    id_guru: number;
    nama: string;
    nip: string;
    user?: { email: string } | null;
  }[];
}

export default function UserVerificationPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [unlinkedData, setUnlinkedData] = useState<UnlinkedData>({
    siswa: [],
    guru: [],
  });
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [targetType, setTargetType] = useState<"SISWA" | "GURU" | "ADMIN">("SISWA");
  const [targetId, setTargetId] = useState<string>("");
  const [openCombobox, setOpenCombobox] = useState(false);

  // States for All Users List
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allUsersLoading, setAllUsersLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // States for Role Editing
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<"ADMIN" | "GURU" | "SISWA">("SISWA");
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchPendingUsers();
    fetchUnlinkedData();
    fetchAllUsers();
  }, []);

  useEffect(() => {
    // Debounce search for all users
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1); // Reset to page 1 on search
      else fetchAllUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchAllUsers();
  }, [page]);

  const handleUpdateRole = async () => {
    if (!editingUser) return;

    try {
      setUpdateLoading(true);
      const payload: any = { role: newRole };
      
      // We no longer automatically nullify guruId/siswaId for ADMINs.
      // This allows an ADMIN to remain linked to their Guru or Siswa record.

      const response = await apiClient.put(`/users/${editingUser.id}`, payload);
      
      if (response.data.success) {
        toast.success(`Role user ${editingUser.email} berhasil diubah menjadi ${newRole}`);
        setRoleDialogOpen(false);
        fetchAllUsers();
      }
    } catch (error: any) {
      console.error("Failed to update role:", error);
      toast.error(error.response?.data?.message || "Gagal mengubah role user");
    } finally {
      setUpdateLoading(false);
    }
  };

  const openRoleDialog = (user: User) => {
    setEditingUser(user);
    setNewRole(user.role);
    setRoleDialogOpen(true);
  };

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/users/pending");
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch pending users:", error);
      toast.error("Gagal memuat daftar user");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setAllUsersLoading(true);
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      
      const response = await apiClient.get("/users", {
        params,
      });
      if (response.data.success) {
        setAllUsers(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch all users:", error);
    } finally {
      setAllUsersLoading(false);
    }
  };

  const fetchUnlinkedData = async () => {
    try {
      const response = await apiClient.get("/users/unlinked-data");
      if (response.data.success) {
        setUnlinkedData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch unlinked data:", error);
    }
  };

  const handleVerify = async (userId: number, name: string) => {
    const result = await Swal.fire({
      title: "Verifikasi User Baru?",
      text: `Akun ${name} akan diaktifkan sebagai siswa baru.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Verifikasi",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10b981",
    });

    if (result.isConfirmed) {
      try {
        await apiClient.post(`/users/verify/${userId}`);
        toast.success(`User ${name} berhasil diverifikasi!`);
        fetchPendingUsers();
        fetchAllUsers();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Gagal verifikasi user");
      }
    }
  };

  const handleReject = async (userId: number, name: string) => {
    const result = await Swal.fire({
      title: "Tolak & Hapus?",
      text: `Akun ${name} akan dihapus permanen. Lanjutkan?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Tolak & Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        await apiClient.post(`/users/reject/${userId}`);
        toast.success(`User ${name} berhasil ditolak dan dihapus!`);
        fetchPendingUsers();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Gagal menolak user");
      }
    }
  };

  const openLinkDialog = (user: PendingUser) => {
    setSelectedUser(user);
    setTargetType("SISWA");
    setTargetId("");
    setOpenCombobox(false);
    setLinkDialogOpen(true);
  };

  const handleLinkUser = async () => {
    if ((targetType !== "ADMIN" && !targetId) || !selectedUser) {
      toast.error("Pilih data yang akan dihubungkan");
      return;
    }

    try {
      await apiClient.post(`/users/verify-link/${selectedUser.id}`, {
        targetId: targetType === "ADMIN" ? 0 : parseInt(targetId),
        targetType,
      });
      toast.success("User berhasil dihubungkan dan diverifikasi!");
      setLinkDialogOpen(false);
      fetchPendingUsers();
      fetchAllUsers();
      fetchUnlinkedData(); // Refresh unlinked data
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghubungi user");
    }
  };

  const handleDeleteUser = async (user: User) => {
  setRoleDialogOpen(false);
  const result = await Swal.fire({
    title: "Hapus User?",
    text: `Akun ${user.email} akan dihapus permanen.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus Permanen",
    cancelButtonText: "Batal",
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#64748b",
  });

  if (result.isConfirmed) {
    try {
      setUpdateLoading(true);
      const response = await apiClient.delete(`/users/${user.id}`);
      if (response.data.success) {
        toast.success(`User berhasil dihapus`);
        fetchAllUsers();
        fetchUnlinkedData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menghapus user");
    } finally {
      setUpdateLoading(false);
    }
  } else {
  }
};


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Manajemen User
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Verifikasi pendaftar baru dan kelola seluruh user sistem.
          </p>
        </div>
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
          <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pending ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              Tidak ada user yang menunggu verifikasi.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama Pendaftar</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      {user.siswa?.nama || "-"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-yellow-600 border-yellow-600 bg-yellow-50"
                      >
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          onClick={() => openLinkDialog(user)}
                          title="Hubungkan ke Data Lama"
                        >
                          <LinkIcon className="h-4 w-4 mr-1" /> Link
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() =>
                            handleVerify(user.id, user.siswa?.nama)
                          }
                          title="Verifikasi sebagai Baru"
                        >
                          <Check className="h-4 w-4 mr-1" /> Baru
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() =>
                            handleReject(user.id, user.siswa?.nama)
                          }
                          title="Tolak"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Semua User</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Cari nama atau email..."
              className="pl-8"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to page 1 on new search
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
           {allUsersLoading ? (
             <div className="text-center py-10">Loading...</div>
           ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                   <TableHead>Role</TableHead>
                   <TableHead>Terdaftar</TableHead>
                   <TableHead className="text-right">Aksi</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                       Tidak ada data user.
                     </TableCell>
                   </TableRow>
                ) : (
                  allUsers.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell>{(page - 1) * 10 + index + 1}</TableCell>
                     <TableCell className="font-medium">
                        {user.guru ? (
                          <span>{user.guru.nama}</span>
                        ) : user.siswa ? (
                          <span>{user.siswa.nama}</span>
                        ) : user.role === "ADMIN" ? (
                          <span>Administrator</span>
                        ) : (
                          <span className="text-slate-400 italic">Belum Terhubung</span>
                        )}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.role === "ADMIN" && <Badge className="bg-red-600"><Shield className="w-3 h-3 mr-1"/> Admin</Badge>}
                        {user.role === "GURU" && <Badge className="bg-blue-600"><UsersIcon className="w-3 h-3 mr-1"/> Guru</Badge>}
                        {user.role === "SISWA" && <Badge className="bg-green-600"><GraduationCap className="w-3 h-3 mr-1"/> Siswa</Badge>}
                      </TableCell>
                       <TableCell>
                         {new Date(user.createdAt).toLocaleDateString("id-ID")}
                       </TableCell>
                       <TableCell className="text-right">
                         <Button
                           variant="ghost"
                           size="sm"
                           className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                           onClick={() => openRoleDialog(user)}
                           title="Ubah Role"
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                       </TableCell>
                     </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            <div className="flex items-center justify-end space-x-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || allUsersLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0 || allUsersLoading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            </>
           )}
        </CardContent>
      </Card>

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md overflow-visible">
          <DialogHeader>
            <DialogTitle>Hubungkan User ke Data Ada</DialogTitle>
            <DialogDescription>
              Pilih data Siswa atau Guru yang sudah ada untuk dihubungkan dengan
              akun <strong>{selectedUser?.email}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Jadikan Sebagai:</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={targetType === "SISWA" ? "default" : "outline"}
                  onClick={() => {
                    setTargetType("SISWA");
                    setTargetId("");
                  }}
                  className="flex-1"
                >
                  Siswa
                </Button>
                <Button
                  type="button"
                  variant={targetType === "GURU" ? "default" : "outline"}
                  onClick={() => {
                    setTargetType("GURU");
                    setTargetId("");
                  }}
                  className="flex-1"
                >
                  Guru
                </Button>
                 <Button
                  type="button"
                  variant={targetType === "ADMIN" ? "default" : "outline"}
                  onClick={() => {
                    setTargetType("ADMIN");
                    setTargetId("0");
                  }}
                  className="flex-1"
                >
                  Admin
                </Button>
              </div>
            </div>

            {targetType !== "ADMIN" && (
            <div className="space-y-2 flex flex-col">
              <Label>Pilih {targetType === "SISWA" ? "Siswa" : "Guru"}</Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="justify-between w-full"
                  >
                    {targetId
                      ? targetType === "SISWA"
                        ? unlinkedData.siswa.find(
                            (item) => item.id_siswa.toString() === targetId
                          )?.nama
                        : unlinkedData.guru.find(
                            (item) => item.id_guru.toString() === targetId
                          )?.nama
                      : `Pilih ${targetType === "SISWA" ? "Siswa" : "Guru"}...`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder={`Cari ${targetType}...`} />
                    <CommandList>
                      <CommandEmpty>Data tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                      {targetType === "SISWA"
                        ? unlinkedData.siswa.map((item) => (
                            <CommandItem
                              key={item.id_siswa}
                              value={`${item.nama} ${item.nis}`} // Searchable string
                              onSelect={() => {
                                setTargetId(item.id_siswa.toString());
                                setOpenCombobox(false);
                                if (item.user) {
                                  toast.warning(`Perhatian: Siswa ini sudah memiliki akun (${item.user.email}). Akun lama akan dilepas.`);
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  targetId === item.id_siswa.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{item.nama} ({item.nis}) {item.kelas ? `- ${item.kelas.namaKelas}` : ""}</span>
                                {item.user && (
                                  <span className="text-xs text-orange-500 font-medium">
                                    Sudah ada akun: {item.user.email} (Akan diganti)
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))
                        : unlinkedData.guru.map((item) => (
                            <CommandItem
                              key={item.id_guru}
                              value={`${item.nama} ${item.nip}`} // Searchable string
                              onSelect={() => {
                                setTargetId(item.id_guru.toString());
                                setOpenCombobox(false);
                                if (item.user) {
                                  toast.warning(`Perhatian: Guru ini sudah memiliki akun (${item.user.email}). Akun lama akan dilepas.`);
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  targetId === item.id_guru.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{item.nama} ({item.nip})</span>
                                {item.user && (
                                   <span className="text-xs text-orange-500 font-medium">
                                    Sudah ada akun: {item.user.email} (Akan diganti)
                                   </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <p className="text-xs text-slate-500">
                Hanya menampilkan data yang belum memiliki akun user.
              </p>
            </div>
            )}

            {targetType === "ADMIN" && (
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm border border-yellow-200">
                <strong>Perhatian:</strong> Akun ini akan dijadikan <strong>ADMINISTRATOR</strong>.
                Data siswa sementara saat pendaftaran akan dihapus. Admin tidak tertaut dengan data Siswa atau Guru.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLinkDialogOpen(false)}
            >
              Batal
            </Button>
            <Button onClick={handleLinkUser} disabled={(targetType !== "ADMIN" && !targetId)}>
              Hubungkan & Verifikasi
            </Button>
          </DialogFooter>
        </DialogContent>
       </Dialog>

      {/* Role Edit Dialog */}
     <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-blue-600" />
              Ubah Role User
            </DialogTitle>
            <DialogDescription>
              Ubah hak akses untuk akun <strong>{editingUser?.email}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pilih Role Baru:</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["ADMIN", "GURU", "SISWA"] as const).map((r) => (
                  <Button
                    key={r}
                    type="button"
                    variant={newRole === r ? "default" : "outline"}
                    onClick={() => setNewRole(r)}
                    className={cn(
                      "flex flex-col h-20 gap-1 capitalize",
                      newRole === r && r === "ADMIN" && "bg-red-600 hover:bg-red-700",
                      newRole === r && r === "GURU" && "bg-blue-600 hover:bg-blue-700",
                      newRole === r && r === "SISWA" && "bg-green-600 hover:bg-green-700"
                    )}
                  >
                    {r === "ADMIN" && <Shield className="h-5 w-5" />}
                    {r === "GURU" && <UsersIcon className="h-5 w-5" />}
                    {r === "SISWA" && <GraduationCap className="h-5 w-5" />}
                    <span>{r.toLowerCase()}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* --- BAGIAN HAPUS USER (DANGER ZONE) --- */}
            <div className="pt-4 border-t">
              <Label className="text-red-600 font-semibold">Danger Zone</Label>
              <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-md flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-red-800">Hapus Akun Ini</p>
                  <p className="text-[10px] text-red-600">Data login akan dihapus permanen.</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  type="button"
                  className="h-8 text-xs bg-red-600 hover:bg-red-700"
                  onClick={() => editingUser && handleDeleteUser(editingUser)}
                  disabled={updateLoading}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => setRoleDialogOpen(false)}
              disabled={updateLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={updateLoading || editingUser?.role === newRole}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateLoading ? "Menyimpan..." : (
                <>
                  <Save className="h-4 w-4 mr-2" /> Simpan Perubahan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
