import React from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '@/pages/layout/PublicLayout';
import { 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  Users, 
  Award,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';

const Pendaftaran = () => {
  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 min-h-screen">
        {/* Hero Section with Image */}
        <section className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden">
          {/* Background Image */}
         {/* <div className="relative w-full h-[500px] overflow-hidden"> */}

          {/* Background Utama */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/img/pendaftaran-hero.jpg')" }}
          >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/70 via-emerald-800/60 to-emerald-900/80"></div>
          </div>

          {/* Foto Promosi Kiri */}
          <img
            src="/img/anak-belajar-kiri.png"
            alt="Anak Belajar"
            className="absolute left-17 top-[75%] -translate-y-1/2 w-110 h-130 object-cover rounded-2xl hidden md:block"
          />

          {/* Foto Promosi Kanan */}
          <img
            src="/img/anak-belajar-kanan.png"
            alt="Anak Belajar"
            className="absolute right-18 top-[68%] -translate-y-1/2 w-80 h-100 object-cover rounded-2xl hidden md:block"
          />

          {/* Decorative Elements */}
          <motion.div
            className="absolute w-64 h-64 border-2 border-white/20 rounded-full top-10 right-20 hidden lg:block"
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-40 h-40 border-2 border-yellow-300/30 rounded-full bottom-20 left-20 hidden lg:block"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Floating Icons */}
          <motion.div
            className="absolute text-white/30 hidden md:block"
            style={{ top: "20%", left: "15%" }}
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Award size={48} />
          </motion.div>

          <motion.div
            className="absolute text-yellow-300/30 hidden md:block"
            style={{ top: "30%", right: "15%" }}
            animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles size={56} />
          </motion.div>

          {/* Content */}
          <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <span className="inline-block px-6 py-2 bg-yellow-400 text-emerald-900 rounded-full text-sm font-bold mb-6 shadow-lg">
                🎓 Sekolah Islam Terpadu
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight"
            >
              Bergabunglah Bersama
              <span className="block text-yellow-300 mt-2">
                SMA IT As-Sakinah
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed"
            >
              Wujudkan impian pendidikan terbaik untuk masa depan cemerlang. 
              Daftar sekarang dan raih kesempatan emas menjadi bagian dari keluarga besar kami!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-4 text-white/80 text-sm sm:text-base"
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Calendar size={20} />
                <span>Pendaftaran Dibuka</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock size={20} />
                <span>Proses Cepat & Mudah</span>
              </div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
              <motion.div
                className="w-1.5 h-3 bg-white rounded-full"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-emerald-800 mb-4">
                Mengapa Memilih Kami?
              </h2>
              <p className="text-gray-800 text-lg max-w-2xl mx-auto">
                Berbagai keunggulan dan fasilitas terbaik menanti Anda
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Award size={32} />,
                  title: "Prestasi Unggulan",
                  desc: "Raih prestasi akademik dan non-akademik",
                  color: "from-blue-500 to-blue-600"
                },
                {
                  icon: <Users size={32} />,
                  title: "Tenaga Pengajar Profesional",
                  desc: "Guru berpengalaman dan berdedikasi tinggi",
                  color: "from-emerald-500 to-emerald-600"
                },
                {
                  icon: <FileText size={32} />,
                  title: "Kurikulum Terpadu",
                  desc: "Kombinasi kurikulum nasional dan nilai Islami",
                  color: "from-purple-500 to-purple-600"
                },
                {
                  icon: <Sparkles size={32} />,
                  title: "Fasilitas Modern",
                  desc: "Gedung dan peralatan pembelajaran terkini",
                  color: "from-orange-500 to-orange-600"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="relative group"
                >
                  <div className="absolute -inset-2 bg-gradient-to-r opacity-0 group-hover:opacity-100 rounded-2xl blur-xl transition-opacity duration-300"
                    style={{ background: `linear-gradient(to right, ${item.color})` }}
                  ></div>
                  <div className="relative bg-white p-8 rounded-2xl shadow-md border border-gray-100 h-full">
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

        {/* Requirements Section */}
        <section className="py-20 px-6 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-emerald-800 mb-4">
                Persyaratan Pendaftaran
              </h2>
              <p className="text-gray-800 text-lg">
                Siapkan dokumen-dokumen berikut untuk proses pendaftaran
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "Fotocopy Ijazah/SKL",
                "Fotocopy SKHUN",
                "Fotocopy Kartu Keluarga",
                "Fotocopy Akta Kelahiran",
                "Pas Foto 3x4 (3 lembar)",
                "Fotocopy KTP OrangTua"
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm border border-emerald-100 hover:shadow-md transition-shadow"
                >
                  <CheckCircle className="text-emerald-600 flex-shrink-0 mt-1" size={24} />
                  <span className="text-gray-700 font-medium">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl opacity-20 blur-2xl"></div>
              <div className="relative bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-12 text-center text-white shadow-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Siap Bergabung?
                  </h2>
                  <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                    Jangan lewatkan kesempatan emas ini! Daftar sekarang dan mulai perjalanan menuju masa depan cemerlang.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                <motion.a
                    href="https://forms.gle/e1DDv3sDtkewZWBW7" // ganti dengan URL tujuan
                    target="_blank" // biar buka tab baru (opsional)
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group bg-white text-emerald-700 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-3"
                    >
                    Daftar Sekarang
                    <ArrowRight
                        className="group-hover:translate-x-1 transition-transform"
                        size={24}
                    />
                    </motion.a>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/80"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} />
                    <span>Proses Cepat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} />
                    <span>100% Aman</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="pb-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1 }}
            className="max-w-4xl mx-auto text-center bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Butuh Bantuan?
            </h3>
            <p className="text-gray-600 mb-6">
              Tim kami siap membantu Anda dalam proses pendaftaran
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-gray-700">
              <div className="flex items-center gap-2">
                <span className="font-semibold">📞 Telepon:</span>
                <span>(0251) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">✉️ Email:</span>
                <span>info@smait-assakinah.sch.id</span>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default Pendaftaran;