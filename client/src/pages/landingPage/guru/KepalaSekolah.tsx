import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PublicLayout from "@/pages/layout/PublicLayout";
import { Quote, Award, Target, Users, BookOpen, Heart } from "lucide-react";

// Port backend kamu
const BACKEND_URL = "http://localhost:3000";

const KepalaSekolah: React.FC = () => {
  const [kepsek, setKepsek] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. Ambil data Kepala Sekolah dari API
  const fetchKepsek = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/struktur-organisasi`);
      const result = await response.json();
      
      if (result.success && result.data.kepalaKomiteTU) {
        // Cari data yang jabatannya "Kepala Sekolah"
        const dataFound = result.data.kepalaKomiteTU.find((item: any) => 
          item.jabatan.toLowerCase().includes("kepala sekolah")
        );
        setKepsek(dataFound);
      }
    } catch (error) {
      console.error("Gagal memuat data Kepala Sekolah:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKepsek();
  }, []);

  // Jika sedang loading, tampilkan skeleton atau spinner sederhana
  if (loading) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 min-h-screen">
        <section className="relative py-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            
            {/* Title Section */}
            <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
              <span className="inline-block px-6 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
                Pemimpin Kami
              </span>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-4">
                Kepala Sekolah
              </h1>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              
              {/* Photo Section - DINAMIS */}
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="relative">
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white">
                  <img
                      // PERHATIKAN: Saya menambahkan /uploads/ di sini agar sama dengan Dashboard
                      src={kepsek?.foto ? `${BACKEND_URL}/uploads/${kepsek.foto.replace(/^\//, '')}` : "/img/default-kepsek.jpg"}
                      alt={kepsek?.nama || "Kepala Sekolah"}
                      className="w-full h-[600px] object-cover"
                      onError={(e) => { 
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(kepsek?.nama || 'Kepala Sekolah')}&background=10b981&color=fff`; 
                      }}
                    />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-900/95 to-transparent p-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {kepsek?.nama || "Nama Kepala Sekolah"}
                    </h2>
                    <p className="text-emerald-100 text-lg">
                      {kepsek?.jabatan || "Kepala Sekolah SMA IT As-Sakinah"}
                    </p>
                  </div>
                </div>
                
                {/* Badge Pengalaman - Bisa disesuaikan atau tetap static */}
                <div className="absolute -bottom-5 -right-6 bg-gradient-to-br from-yellow-400 to-orange-400 text-white p-4 rounded-xl shadow-2xl">
                  <Award size={32} className="mb-2" />
                  <div className="text-2xl font-bold">{kepsek?.ttl?.split(',')[0] ? "Aktif" : "7+"}</div>
                  <div className="text-sm">Dedikasi Tinggi</div>
                </div>
              </motion.div>

              {/* Message Section - DINAMIS */}
              <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="relative bg-white rounded-2xl shadow-lg p-8 border border-emerald-100">
                  <Quote className="absolute top-4 right-4 text-emerald-200" size={48} />
                  
                  <div className="relative space-y-4 text-gray-700 leading-relaxed whitespace-pre-line">
                    {/* Gunakan whitespace-pre-line agar Enter/Paragraf 
                        yang diketik di Modal Admin tetap terbaca di sini 
                    */}
                    {kepsek?.sambutan || "Belum ada sambutan yang ditambahkan."}
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-gradient-to-br from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl shadow-lg">
                    <div className="font-bold text-lg">{kepsek?.nama}</div>
                    <div className="text-sm opacity-90">Kepala Sekolah</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Vision & Leadership Section */}
        <section className="py-20 px-6 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-4">
                Visi Kepemimpinan
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Komitmen kami dalam membangun pendidikan berkualitas
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Target size={32} />,
                  title: "Visi Jelas",
                  desc: "Mewujudkan sekolah Islam terpadu yang unggul dalam prestasi dan akhlak",
                  color: "from-blue-500 to-blue-600"
                },
                {
                  icon: <Users size={32} />,
                  title: "Kolaboratif",
                  desc: "Membangun kerjasama harmonis antara guru, siswa, dan orang tua",
                  color: "from-emerald-500 to-emerald-600"
                },
                {
                  icon: <BookOpen size={32} />,
                  title: "Inovatif",
                  desc: "Menerapkan metode pembelajaran modern berbasis teknologi dan nilai Islami",
                  color: "from-purple-500 to-purple-600"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  whileHover={{ y: -8 }}
                  className="relative group"
                >
                  <div className={`absolute -inset-2 bg-gradient-to-r ${item.color} rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300`}></div>
                  <div className="relative bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full">
                    <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-4">
                Nilai-Nilai Kepemimpinan
              </h2>
              <p className="text-gray-600 text-lg">
                Prinsip yang kami pegang dalam memimpin
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "🎯", title: "Integritas", desc: "Konsisten antara ucapan dan tindakan" },
                { icon: "❤️", title: "Empati", desc: "Memahami dan peduli pada setiap individu" },
                { icon: "📚", title: "Profesional", desc: "Kompeten dan bertanggung jawab" },
                { icon: "🤝", title: "Keteladanan", desc: "Menjadi panutan yang baik" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white p-6 rounded-2xl shadow-md border border-emerald-100 text-center hover:shadow-xl transition-shadow"
                >
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing Message */}
       <section className="py-20 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1 }}
            className="max-w-3xl mx-auto"
          >
            <Heart className="mx-auto mb-6 text-emerald-600" size={48} />
            <h2 className="text-3xl font-bold mb-4 text-emerald-700">
              Bersama Membangun Generasi Unggul
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Mari kita bersama-sama menciptakan lingkungan pendidikan yang islami, 
              inspiratif, dan inovatif untuk masa depan anak-anak kita.
            </p>
          </motion.div>
        </section>

      </div>
    </PublicLayout>
  );
};

export default KepalaSekolah;