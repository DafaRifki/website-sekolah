import React from "react";
import { motion } from "framer-motion";
import PublicLayout from "@/pages/layout/PublicLayout";
import { School, MapPin, Calendar, Building2 } from "lucide-react";

const ProfileSekolah: React.FC = () => {
  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 text-gray-900 min-h-screen">
        {/* Hero Section with Enhanced Design */}
        <section
          className="relative bg-cover bg-center text-white py-32 px-6 text-center overflow-hidden"
          style={{ backgroundImage: "url('/img/pp1.jpg')" }}>

          {/* Enhanced Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/90 via-teal-700/85 to-blue-800/90"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-2xl mb-8 border border-white/20"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                Sekolah Islam Terpadu
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-emerald-200">
                As-Sakinah
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5 }}
              className="max-w-3xl mx-auto text-xl md:text-2xl font-medium leading-relaxed text-emerald-50"
            >
              Membentuk generasi unggul, berakhlak mulia, dan siap menghadapi
              tantangan zaman dengan penuh percaya diri.
            </motion.p>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-12"
            >
              <div className="inline-flex gap-4 flex-wrap justify-center">
                <span className="px-6 py-3 bg-emerald-500/20 backdrop-blur-sm rounded-full border border-emerald-300/30 text-emerald-100 font-medium">
                  🏆 Prestasi Unggul
                </span>
                <span className="px-6 py-3 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-300/30 text-blue-100 font-medium">
                  🎓 Pendidikan Berkualitas
                </span>
                <span className="px-6 py-3 bg-teal-500/20 backdrop-blur-sm rounded-full border border-teal-300/30 text-teal-100 font-medium">
                  🤲 Akhlak Mulia
                </span>
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

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="text-center p-4 bg-white rounded-2xl shadow-lg border border-emerald-100">
                  <div className="text-2xl font-bold text-emerald-600">100+</div>
                  <div className="text-sm text-gray-600">Siswa Aktif</div>
                </div>
                <div className="text-center p-4 bg-white rounded-2xl shadow-lg border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">15+</div>
                  <div className="text-sm text-gray-600">Guru Profesional</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Vision Mission Section with Cards */}
        <section className="py-24 px-6 bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/20">
  <div className="max-w-7xl mx-auto">
    {/* Section Header */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 1 }}
      className="text-center mb-16"
    >
      <span className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full text-sm font-semibold mb-4">
        Visi & Misi Kami
      </span>
      <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
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
        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl opacity-20 blur-lg"></div>
        <div className="relative p-10 bg-white rounded-3xl shadow-xl border border-emerald-100/50 backdrop-blur-sm">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              👁️
            </div>
            <div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent mb-4">
                Visi
              </h3>
              <p className="text-xl text-gray-700 leading-relaxed font-medium">
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
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl opacity-20 blur-lg"></div>
          <div className="relative p-8 bg-white rounded-3xl shadow-xl border border-emerald-100/50 backdrop-blur-sm h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl">
                🎯
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
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
                  <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold rounded-full flex items-center justify-center mt-0.5">
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
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl opacity-20 blur-lg"></div>
          <div className="relative p-8 bg-white rounded-3xl shadow-xl border border-emerald-100/50 backdrop-blur-sm h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl">
                🏆
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
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
                  <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold rounded-full flex items-center justify-center mt-0.5">
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
        <section className="py-24 px-6 bg-gradient-to-br from-slate-50 to-emerald-50/50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 1 }}
              className="text-center mb-16"
            >
              <span className="inline-block px-6 py-3 bg-gradient-to-r from-slate-600 to-emerald-600 text-white rounded-full text-sm font-semibold mb-4">
                Lokasi Kami
              </span>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-700 to-emerald-600 bg-clip-text text-transparent">
                Temukan Kami
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* School Info Cards */}
              
<motion.div
  initial={{ opacity: 0, x: -50 }}
  whileInView={{ opacity: 1, x: 0 }}
  viewport={{ once: false, amount: 0.3 }}
  transition={{ duration: 1 }}
  className="space-y-6"
>
  <div className="relative">
    <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl opacity-20 blur-lg"></div>
    <div className="relative p-8 bg-white rounded-3xl shadow-xl border border-emerald-100/50">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-6">
        Informasi Sekolah
      </h3>

      <div className="space-y-6">
        {/* Nama Sekolah */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-md">
            <School size={22} />
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-1">Nama Sekolah</div>
            <div className="text-gray-700">SMA IT As-Sakinah</div>
          </div>
        </div>

        {/* Alamat */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-md">
            <MapPin size={22} />
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-1">Alamat</div>
            <div className="text-gray-700">
              Kp Cempaka Putih Rt 001/006, Desa Cibening,<br />
              Kecamatan Pamijahan, Kabupaten Bogor
            </div>
          </div>
        </div>

        {/* Tahun Berdiri */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-md">
            <Calendar size={22} />
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-1">Tahun Berdiri</div>
            <div className="text-gray-700">16 Juli 2023</div>
          </div>
        </div>

        {/* Yayasan */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-md">
            <Building2 size={22} />
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-1">Yayasan</div>
            <div className="text-gray-700">Yayasan Nurul Hidayatul Mutmainnah</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</motion.div>

              {/* Enhanced Map */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 1 }}
                className="relative"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-3xl opacity-20 blur-lg"></div>
                <div className="relative bg-white p-4 rounded-3xl shadow-xl border border-blue-100/50">
                  <div className="h-96 rounded-2xl overflow-hidden shadow-lg">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.8975329738123!2d106.6473!3d-6.5532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c5c2f1234567%3A0xabcdef123456789!2sCibening%2C%20Pamijahan%2C%20Bogor!5e0!3m2!1sid!2sid!4v1701234567890!5m2!1sid!2sid"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-2xl"
                    ></iframe>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-emerald-100 text-blue-700 rounded-full text-sm font-medium">
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