"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, BookOpen, MapPin, Phone, Mail, Calendar, UserCheck, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface SiswaProfileProps {
  data: any;
}

export default function SiswaProfile({ data }: SiswaProfileProps) {
  const profile = data.siswa;

  if (!profile) return <div>Data siswa tidak ditemukan.</div>;

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
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom Kiri: Foto & Status Utama */}
        <motion.div variants={cardVariants}>
          <Card className="h-full border-none shadow-sm bg-gradient-to-b from-green-50 to-white hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex flex-col items-center relative">
              
              {/* --- BAGIAN FOTO PROFIL YANG DIPERBARUI --- */}
              <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center border-4 border-white shadow-md overflow-hidden mb-4 transform hover:rotate-3 transition-transform relative">
                {profile.fotoProfil ? (
                  <>
                    <img 
                      src={(() => {
                        // 1. Ambil URL murni dari .env
                        let baseUrl = import.meta.env.VITE_URL_API || import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
                        
                        // 2. Bersihkan jika ada tambahan "/api" di belakangnya
                        baseUrl = baseUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
                        
                        // 3. Ambil HANYA nama filenya saja
                        const fileName = profile.fotoProfil.split('/').pop();
                        
                        // 4. Bentuk URL langsung ke folder uploads/siswa
                        return `${baseUrl}/uploads/siswa/${fileName}?t=${new Date().getTime()}`;
                      })()} 
                      alt={profile.nama} 
                      className="w-full h-full object-cover relative z-10"
                      onError={(e) => {
                        // Fallback jika gagal muat (hilangkan gambar, biarkan inisial terlihat di bawahnya)
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Inisial Fallback - Berada di bawah gambar, terlihat jika gambar gagal/hilang */}
                    <div className="absolute inset-0 flex items-center justify-center bg-green-100 z-0">
                       <span className="text-4xl font-bold text-green-600">
                        {profile.nama.charAt(0).toUpperCase()}
                       </span>
                    </div>
                  </>
                ) : (
                  <span className="text-4xl font-bold text-green-600">
                    {profile.nama.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {/* --- AKHIR BAGIAN FOTO PROFIL --- */}

              <h2 className="text-xl font-bold text-center mb-1">{profile.nama}</h2>
              <p className="text-sm text-muted-foreground mb-4">NIS: {profile.nis || "-"}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className="bg-white/80 border-green-200 text-green-700">
                  Siswa Aktif
                </Badge>
                {profile.kelas && (
                  <Badge variant="outline" className="bg-white/80 border-blue-200 text-blue-700">
                     Kelas {profile.kelas.namaKelas}
                  </Badge>
                )}
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
                  <BookOpen className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-lg">Informasi Akademik</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {infoItem(<ShieldCheck className="w-4 h-4" />, "NISN", profile.nisn)}
                {infoItem(<UserCheck className="w-4 h-4" />, "Tingkat", profile.kelas?.tingkat)}
                {infoItem(<User className="w-4 h-4" />, "Wali Kelas", profile.kelas?.guru?.nama)}
                {infoItem(<Mail className="w-4 h-4" />, "Email Akun", data.email)}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
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

          <motion.div variants={cardVariants}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-lg">Data Orang Tua</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {infoItem(<User className="w-4 h-4" />, "Nama Ayah", profile.namaAyah)}
                  {infoItem(<User className="w-4 h-4" />, "Nama Ibu", profile.namaIbu)}
                  {infoItem(<Phone className="w-4 h-4" />, "Kontak Darurat", profile.noTeleponOrtu)}
                  {infoItem(<BookOpen className="w-4 h-4" />, "Pekerjaan Ayah", profile.pekerjaanAyah)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}