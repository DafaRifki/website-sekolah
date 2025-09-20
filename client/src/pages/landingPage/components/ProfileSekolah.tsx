import React from "react";
import { motion } from "framer-motion";
import PublicLayout from "@/pages/layout/PublicLayout";
import { Eye, Target, Trophy,MapPin, Calendar, Building2,} from "lucide-react";
import { Award, GraduationCap, HeartHandshake, BookOpen} from "lucide-react";
import { useEffect, useState } from "react";

const ProfileSekolah: React.FC = () => {
const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    // Trigger animasi pertama kali halaman dibuka
    setPageLoaded(true);
  }, []);
  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 text-gray-900 min-h-screen">
        {/* Hero Section with Enhanced Design */}
   <section
  className="relative h-[60vh] w-screen flex items-center justify-center overflow-hidden bg-cover bg-center"
  style={{ backgroundImage: "url('/img/profil.jpg')" }}
>
  {/* Overlay Transparan */}
  <div className="absolute inset-0 bg-white/30 mix-blend-overlay"></div>

  {/* Elemen Background: Kotak Berputar (hilang di mobile) */}
  <motion.div
    className="hidden md:block absolute w-36 h-36 border-2 border-white rounded-lg top-25 left-20"
    animate={{ rotate: 360 }}
    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
  />
  <motion.div
    className="hidden md:block absolute w-28 h-28 border-2 border-emerald-200 rounded-lg bottom-20 right-20"
    animate={{ rotate: -360 }}
    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
  />

  {/* Elemen Background: Ikon Bergerak */}
  <motion.div
    className="absolute text-white/70 hidden sm:block"
    style={{ top: "30%", left: "25%" }}
    animate={{ y: [0, -20, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
  >
    <BookOpen size={40} className="md:w-14 md:h-14" />
  </motion.div>

  <motion.div
    className="absolute text-white/70 hidden md:block"
    style={{ top: "30%", right: "25%" }}
    animate={{ y: [0, 20, 0] }}
    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
  >
    <GraduationCap size={56} />
  </motion.div>

  <motion.div
    className="absolute text-white/60 hidden sm:block"
    style={{ top: "55%", left: "20%" }}
    animate={{ y: [0, -20, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
  >
    <GraduationCap size={40} className="md:w-14 md:h-14" />
  </motion.div>

  <motion.div
    className="absolute text-white/70 hidden md:block"
    style={{ bottom: "35%", right: "20%" }}
    animate={{ y: [0, -20, 0] }}
    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
  >
    <BookOpen size={56} />
  </motion.div>
  {/* Konten Utama */}
  <div className="relative z-10 text-center px-4 sm:px-6">
    {/* Judul */}
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="mb-6"
    >
      <h2 className="text-3xl sm:text-4xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-green-700 via-emerald-300 to-teal-400 bg-clip-text text-transparent drop-shadow-lg">
        Sekolah Islam Terpadu
      </h2>
      <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-yellow-400 drop-shadow-md">
        As-Sakinah
      </h1>
    </motion.div>

    {/* Deskripsi */}
    <motion.p
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 1, delay: 0.2 }}
      className="max-w-xl sm:max-w-2xl mx-auto text-sm sm:text-base md:text-lg font-medium leading-relaxed text-emerald-900"
    >
      Membentuk generasi unggul, berakhlak mulia, dan siap menghadapi
      tantangan zaman dengan penuh percaya diri.
    </motion.p>

    {/* Badge Prestasi */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="mt-8 sm:mt-10"
    >
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
        {[
          { icon: <Award size={16} />, text: "Prestasi Unggul" },
          { icon: <GraduationCap size={16} />, text: "Pendidikan Berkualitas" },
          { icon: <HeartHandshake size={16} />, text: "Akhlak Mulia" },
          { icon: <BookOpen size={16} />, text: "Ilmu & Kreativitas" },
        ].map((item, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 * index }}
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-white/30 backdrop-blur-md rounded-full border border-white/40 text-emerald-900 font-medium shadow-md cursor-pointer select-none text-xs sm:text-sm md:text-base"
          >
            {item.icon} {item.text}
          </motion.span>
        ))}
      </div>
    </motion.div>
  </div>
</section>



        {/* About Section with Modern Design */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl opacity-20 blur-lg"></div>
              <div className="relative">
                <img
                  src="./img/profilgmbr.jpg"
                  alt="Sekolah"
                  className="rounded-3xl shadow-2xl object-cover w-full aspect-[4/3] border-4 border-white"
                />
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-2xl shadow-xl">
                  <div className="text-3xl font-bold">2023</div>
                  <div className="text-sm opacity-90">Tahun Berdiri</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 1 }}
              className="space-y-6"
            >
              <div>
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
                  Tentang Kami
                </span>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-6">
                  Pendidikan Islam Terpadu Modern
                </h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 text-lg leading-relaxed">
                  Sekolah Islam Terpadu As-Sakinah adalah lembaga pendidikan yang
                  menggabungkan kurikulum nasional dengan nilai-nilai Islami. Dengan
                  fasilitas modern dan tenaga pengajar berpengalaman, kami berusaha
                  menciptakan lingkungan belajar yang nyaman dan inspiratif.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Kami percaya bahwa pendidikan bukan hanya tentang ilmu pengetahuan,
                  tetapi juga membentuk akhlak mulia dan karakter yang kuat.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Vision Mission Section with Cards */}
      <section className="py-24 px-6 bg-gradient-to-br from-white via-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full text-sm font-semibold mb-4 shadow-md">
            Visi & Misi Kami
          </span>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
            Landasan Pendidikan Kami
          </h2>
        </motion.div>

        <div className="space-y-12">
          {/* Vision */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="absolute -inset-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl opacity-20 blur-lg"></div>
            <div className="relative p-10 bg-white rounded-2xl shadow-xl border border-emerald-100">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center text-white">
                  <Eye size={28} />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-emerald-700 mb-4">
                    Visi
                  </h3>
                  <p className="text-lg text-gray-700 leading-relaxed font-medium">
                    Terwujudnya peserta didik yang Cerdas, Berprestasi Dan Berakhlak Mulia
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mission & Goals Grid */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl opacity-20 blur-lg"></div>
              <div className="relative p-8 bg-white rounded-2xl shadow-xl border border-emerald-100 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center text-white">
                    <Target size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-700">
                    Misi
                  </h3>
                </div>
                <ol className="space-y-3 text-gray-700">
                  {[
                    "Menumbuhkan semangat keunggulan prestasi di bidang Akademik.",
                    "Menciptakan suasana pembelajaran yang menantang, menyenangkan, komunikatif, tanpa takut salah, dan demokratis.",
                    "Mengembangkan sikap dan perilaku religius di lingkungan dalam dan luar sekolah.",
                    "Menumbuhkan sikap jujur, toleransi, disiplin, kerja keras, kreatif, mandiri, demokratis dan tanggung jawab.",
                    "Menumbuhkan disiplin yang tinggi dari seluruh warga sekolah.",
                    "Menciptakan suasana pergaulan sehari-hari yang berdasarkan keimanan dan ketaqwaan.",
                    "Menciptakan sikap kerja keras dan tanggungjawab serta menyelesaikan tugas tepat waktu.",
                    "Menumbuhkan semangat berkompetisi secara sehat dan efektif kepada seluruh warga sekolah.",
                    "Menciptakan pribadi yang trampil untuk hidup mandiri."
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-full flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>

            {/* Goals */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative"
            >
              <div className="absolute -inset-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl opacity-20 blur-lg"></div>
              <div className="relative p-8 bg-white rounded-2xl shadow-xl border border-emerald-100 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center text-white">
                    <Trophy size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-700">
                    Tujuan
                  </h3>
                </div>
                <ol className="space-y-3 text-gray-700">
                  {[
                    "Mencetak Semangat dalam prestasi yang diraih di bidang pendidikan.",
                    "Melahirkan suasana pembelajaran yang dapat membuat kepribadian tinggi dan berani.",
                    "Menghasilkan peserta didik yang mampu mengaplikasikan akhlak yang baik di luar sekolah.",
                    "Menghasilkan peserta didik yang mampu melaksanakan kejujuran dan berbakti terhadap orang tua.",
                    "Menghasilkan peserta didik yang mampu membaca, memahami, dan memiliki disiplin yang tinggi.",
                    "Menghasilkan peserta didik yang mampu selalu belajar melalui kebiasaan sehari-hari sesuai iman dan taqwa.",
                    "Menghasilkan peserta didik yang mampu tampil tanggung jawab sebagai pemimpin dan aktif dalam berorganisasi.",
                    "Menghasilkan peserta didik yang berprestasi dan siap melanjutkan ke jenjang pendidikan selanjutnya.",
                    "Menghasilkan siswa/i yang berbakat dalam semua bidang."
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-full flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>

        {/* Enhanced Address Section */}
        <section className="py-24 px-6 bg-gradient-to-br from-slate-50 to-emerald-50/40">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={pageLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="inline-block px-6 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-3">
            Lokasi Kami
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-green-800">
            Temukan Kami
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* School Info */}
          <motion.div
            initial={{ opacity: 0, x: -80, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full flex"
          >
            <div className="p-8 bg-white rounded-2xl shadow-md border border-slate-100 w-full">
              <h3 className="text-2xl font-bold text-emerald-700 mb-6">
                Informasi Sekolah
              </h3>

              <div className="space-y-5">
                {/* Nama Sekolah */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 mb-1">
                      Nama Sekolah
                    </div>
                    <div className="text-slate-700">SMA IT As-Sakinah</div>
                  </div>
                </div>

                {/* Alamat */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 mb-1">Alamat</div>
                    <div className="text-slate-700">
                      Kp Cempaka Putih Rt 001/006, Desa Cibening,
                      <br />
                      Kecamatan Pamijahan, Kabupaten Bogor
                    </div>
                  </div>
                </div>

                {/* Tahun Berdiri */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 mb-1">
                      Tahun Berdiri
                    </div>
                    <div className="text-slate-700">16 Juli 2023</div>
                  </div>
                </div>

                {/* Yayasan */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 text-orange-700 rounded-lg flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 mb-1">Yayasan</div>
                    <div className="text-slate-700">
                      Yayasan Nurul Hidayatul Mutmainnah
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full flex"
          >
            <div className="relative bg-white p-4 rounded-2xl shadow-md border border-slate-100 w-full">
              <div className="h-96 rounded-xl overflow-hidden shadow-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.8975329738123!2d106.6473!3d-6.5532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c5c2f1234567%3A0xabcdef123456789!2sCibening%2C%20Pamijahan%2C%20Bogor!5e0!3m2!1sid!2sid!4v1701234567890!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-xl"
                ></iframe>
              </div>
              <div className="mt-4 text-center">
                <span className="inline-block px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                  📍 Kunjungi Kami di Lokasi Ini
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>


        {/* Enhanced Foundation Image Section */}
        <section className="relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent z-10"></div>
            <img
              src="/img/yayasan.jpg"
              alt="Yayasan Nurul Hidayatul Mutmainnah"
              className="w-full h-auto md:h-[400px] object-cover"
            />
            
          </motion.div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default ProfileSekolah;