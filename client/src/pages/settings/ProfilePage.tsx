"use client";

import { useEffect, useState, useCallback } from "react";
import SettingsLayout from "../layout/settings/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import apiClient from "@/config/axios";
import { toast } from "sonner";
import { AlertCircleIcon, User as UserIcon, Settings as SettingsIcon } from "lucide-react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Loading from "@/components/Loading";
import Swal from "sweetalert2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

// Import role-specific components
import AdminProfile from "./components/AdminProfile";
import GuruProfile from "./components/GuruProfile";
import SiswaProfile from "./components/SiswaProfile";

const formSchema = z.object({
  email: z.string().email().min(1, { message: "Email is required" }),
  name: z.string().min(1, { message: "Name is required" }),
});

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("overview");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/auth/profile");
      const profile = data.data;
      setUser(profile);

      const name = profile.guru?.nama || profile.siswa?.nama || "Administrator";

      form.reset({
        name: name,
        email: profile.email || "",
      });
    } catch {
      toast.error("Gagal mengambil user");
    } finally {
      // Small delay for smooth transition
      setTimeout(() => setLoading(false), 500);
    }
  }, [form]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleUpdate = async (values: z.infer<typeof formSchema>) => {
    setUpdateLoading(true);
    try {
      await apiClient.patch("/auth/update-profile", values);
      toast.success("Update Berhasil");
      fetchUser();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal update profil user";
      toast.error(msg);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    const result = await Swal.fire({
      title: "Yakin ingin menghapus akun ini?",
      text: "Tindakan ini tidak bisa dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/auth/profile`);
        toast.success("Akun berhasil dihapus");
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Gagal menghapus akun");
      }
    }
  };

  const renderProfileByRole = () => {
    switch (user?.role) {
      case "ADMIN":
        return <AdminProfile data={user} />;
      case "GURU":
        return <GuruProfile data={user} />;
      case "SISWA":
        return <SiswaProfile data={user} />;
      default:
        return <div>Role tidak dikenal.</div>;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  if (loading) {
    return (
      <SettingsLayout>
        <div className="p-4 md:p-8 space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-xl" />
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          </div>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="p-4 md:p-8 max-w-full mx-auto"
      >
        <div className="flex flex-col gap-1 mb-8">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600"
          >
            Profil Pengguna
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            Kelola informasi profil dan pengaturan akun Anda secara dinamis.
          </motion.p>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="space-y-6"
        >
          <TabsList className="bg-muted/50 p-1 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <UserIcon className="w-4 h-4" />
              <span>Profil Saya</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <SettingsIcon className="w-4 h-4" />
              <span>Pengaturan Akun</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="overview" className="mt-0 border-none p-0 outline-none">
                {renderProfileByRole()}
              </TabsContent>

              <TabsContent value="settings" className="mt-0 border-none p-0 outline-none space-y-6">
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle>Informasi Dasar</CardTitle>
                    <CardDescription>
                      Perbarui nama tampilan dan alamat email Anda.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4 max-w-md">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nama Lengkap</FormLabel>
                              <FormControl>
                                <Input className="focus-visible:ring-green-500" placeholder="Masukkan nama" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alamat Email</FormLabel>
                              <FormControl>
                                <Input className="focus-visible:ring-green-500" type="email" placeholder="Masukkan email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={updateLoading} className="bg-green-600 hover:bg-green-700 transition-all duration-300 transform active:scale-95">
                          {updateLoading ? <Loading /> : "Simpan Perubahan"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm border-red-100 bg-red-50/10 hover:bg-red-50/20 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                      <AlertCircleIcon className="w-5 h-5" />
                      Zona Berbahaya
                    </CardTitle>
                    <CardDescription>
                      Tindakan ini permanen dan tidak dapat dibatalkan.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert variant="destructive" className="bg-white border-red-200">
                      <AlertCircleIcon className="w-4 h-4" />
                      <AlertTitle>Peringatan Akun</AlertTitle>
                      <AlertDescription>
                        Menghapus akun akan menghapus semua data terkait secara permanen dari sistem kami.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                  <CardFooter>
                    <Button variant="destructive" onClick={handleDelete} className="hover:bg-red-700 transition-all">
                      Hapus Selamanya
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </SettingsLayout>
  );
};

export default ProfilePage;
