"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Briefcase, MapPin, Phone, Mail, Calendar, BookOpen, GraduationCap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface GuruProfileProps {
  data: any;
}

export default function GuruProfile({ data }: GuruProfileProps) {
  const profile = data.guru;

  if (!profile) return <div>Data guru tidak ditemukan.</div>;

  const infoItem = (icon: React.ReactNode, label: string, value: string | null | undefined) => (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold">{value || "-"}</p>
      </div>
    </div>
  );

  const cardVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.1 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom Kiri: Foto & Status Utama */}
        <motion.div variants={cardVariants}>
          <Card className="h-full border-none shadow-sm bg-gradient-to-b from-blue-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex flex-col items-center relative">
              
              {/* --- BAGIAN FOTO PROFIL YANG DIPERBARUI --- */}
              <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-md overflow-hidden mb-4 transform hover:scale-105 transition-transform relative">
                {profile.fotoProfil ? (
                  <>
                    <img 
                      src={(() => {
                        // 1. Ambil URL murni dari .env
                        let baseUrl = import.meta.env.VITE_URL_API || import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
                        
                        // 2. Bersihkan '/api' di ujung jika ada
                        baseUrl = baseUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
                        
                        // 3. Ekstrak nama file saja
                        const fileName = profile.fotoProfil.split('/').pop();
                        
                        // 4. Arahkan ke folder uploads/guru
                        return `${baseUrl}/uploads/guru/${fileName}?t=${new Date().getTime()}`;
                      })()} 
                      alt={profile.nama} 
                      className="w-full h-full object-cover relative z-10"
                      onError={(e) => {
                        // Jika gambar gagal dimuat (hilang/rusak), sembunyikan img tag-nya
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Inisial Fallback (Tertutup gambar jika sukses, terlihat jika gambar gagal) */}
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-100 z-0">
                       <span className="text-4xl font-bold text-blue-600">
                        {profile.nama.charAt(0).toUpperCase()}
                       </span>
                    </div>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-blue-600">
                    {profile.nama.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {/* --- AKHIR BAGIAN FOTO PROFIL --- */}

              <h2 className="text-xl font-bold text-center mb-1">{profile.nama}</h2>
              <p className="text-sm text-muted-foreground mb-4">NIP: {profile.nip || "-"}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className="bg-white/80 border-blue-200 text-blue-700">
                  {profile.jabatan || "Tenaga Pendidik"}
                </Badge>
                <Badge variant="outline" className="bg-white/80 border-purple-200 text-purple-700">
                  {profile.statusKepegawaian || "Aktif"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Kolom Tengah & Kanan: Detail Informasi */}
        <div className="md:col-span-2 space-y-6">
          <motion.div variants={cardVariants}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">Informasi Kepegawaian</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {infoItem(<ShieldCheck className="w-4 h-4" />, "NIP", profile.nip)}
                  {infoItem(<GraduationCap className="w-4 h-4" />, "Pendidikan", profile.pendidikan)}
                  {infoItem(<Mail className="w-4 h-4" />, "Email Kerja", profile.email || data.email)}
                  {infoItem(<BookOpen className="w-4 h-4" />, "Status", profile.statusKepegawaian)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">Data Pribadi</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {infoItem(<Calendar className="w-4 h-4" />, "Tempat / Tgl Lahir", 
                    `${profile.tempatLahir || "-"}, ${profile.tanggalLahir ? new Date(profile.tanggalLahir).toLocaleDateString("id-ID") : "-"}`)}
                  {infoItem(<User className="w-4 h-4" />, "Jenis Kelamin", profile.jenisKelamin === "L" ? "Laki-laki" : profile.jenisKelamin === "P" ? "Perempuan" : "-")}
                  {infoItem(<MapPin className="w-4 h-4" />, "Alamat", profile.alamat)}
                  {infoItem(<Phone className="w-4 h-4" />, "No. HP", profile.noHP)}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mata Pelajaran & Kelas */}
          <motion.div variants={cardVariants}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">Tugas Mengajar</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.mengajarMapel?.length > 0 ? (
                    profile.mengajarMapel.map((mp: any, index: number) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-100 hover:scale-105 transition-transform">
                        {mp.mapel?.namaMapel} - {mp.kelas?.namaKelas}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Belum ada tugas mengajar yang tercatat.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}