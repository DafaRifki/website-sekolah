import React, { useEffect, useState } from "react";
import PublicLayout from "../layout/PublicLayout";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Users, GraduationCap, School, Trophy,Award } from "lucide-react";
import { useInView } from "react-intersection-observer"; // ✅ tambahan

// Komponen Counter
interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  start?: boolean; // ✅ kontrol kapan mulai
}

const Counter: React.FC<CounterProps> = ({ from = 0, to, duration = 2, start = false }) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.floor(latest));

  useEffect(() => {
    if (!start) return; // hanya mulai jika start = true
    const controls = animate(count, to, { duration, ease: "easeOut" });
    return controls.stop;
  }, [count, to, duration, start]);

  return <motion.span>{rounded}</motion.span>;
};

const LandingPage: React.FC = () => {
  const lines = ["Tetap Istiqomah", "Pantang Menyerah", "Masa Depan Cerah"];

  const stats = [
    { value: 1200, label: "Siswa", icon: Users },
    { value: 3500, label: "Alumni", icon: GraduationCap },
    { value: 45, label: "Guru", icon: School },
    { value: 20, label: "Prestasi", icon: Trophy },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section
        className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('/img/download1.jpg')" }}
      >
        <div className="absolute inset-0"></div>

        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center leading-snug">
            {lines.map((line, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.6 }}
                className="block 
                  bg-gradient-to-r from-green-700 via-emerald-500 to-yellow-400 
                  bg-clip-text text-transparent 
                  bg-[length:200%_200%] animate-gradient"
              >
                {line}
              </motion.span>
            ))}
          </h2>

          <p className="text-black-500 mb-8 max-w-2xl mx-auto">
            Nikmati pengalaman belajar interaktif dengan fitur modern, akses
            mudah, dan desain yang ramah pengguna.
          </p>
        </div>
      </section>

      {/* Section Konten 1 */}
      <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        
        {/* Gambar Sekolah */}
        <motion.div
          className="relative group"
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-teal-400 rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur"></div>
          <div className="relative">
            <motion.img
              src="./img/landingprofil.jpg"
              alt="Profil Sekolah"
              className="rounded-2xl shadow-2xl object-cover w-full h-96 transform group-hover:scale-105 transition-transform duration-500"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
            />

            {/* Floating Stats Cards */}
            <motion.div
              className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 transform rotate-3 hover:rotate-0 transition-transform duration-300"
              initial={{ opacity: 0, y: -40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <div className="text-sm">
                  <div className="font-bold text-gray-800">15+</div>
                  <div className="text-gray-600">Prestasi</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <div className="text-sm">
                  <div className="font-bold text-gray-800">100+</div>
                  <div className="text-gray-600">Siswa</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Deskripsi Sekolah */}
        <motion.div
          className="text-left"
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1 }}
        >
          <h3 className="text-3xl font-bold text-green-700 mb-4">
            Profil Sekolah
          </h3>
          <p className="text-gray-800 leading-relaxed mb-4">
            Sekolah Islam Terpadu As-Sakinah merupakan lembaga pendidikan yang
            berkomitmen untuk mencetak generasi unggul, berakhlak mulia, dan
            berprestasi. Dengan kurikulum terpadu, fasilitas modern, serta tenaga
            pendidik yang berpengalaman, kami berusaha memberikan lingkungan
            belajar yang nyaman dan inspiratif.
          </p>
          <p className="text-gray-800 leading-relaxed mb-6">
            Kami percaya bahwa pendidikan adalah kunci untuk membangun masa depan
            cerah bagi peserta didik agar siap menghadapi tantangan zaman.
          </p>
          <Link
            to="/profil-sekolah"
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg shadow hover:bg-green-800 transition inline-block"
          >
            Lihat Selengkapnya
          </Link>
        </motion.div>
      </div>
    </section>

      {/* Section Konten 2 */}
      <section className="py-20 px-6 bg-gray-50 text-center">
        <h3 className="text-2xl font-semibold text-green-700 mb-4">
          Mengapa Memilih Kami?
        </h3>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Dengan pengalaman panjang dalam dunia pendidikan dan teknologi, kami
          memberikan solusi terbaik untuk kebutuhan belajar modern.
        </p>
      </section>

      {/* Counter Section */}
      <section className="relative py-10 px-6 bg-yellow-400 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
          {stats.map((stat, index) => {
            const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 }); // ✅
            return (
              <motion.div
                key={index}
                ref={ref}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1.6, delay: index * 0.2 }}
                className="flex flex-col items-center"
              >
                {/* Icon */}
                <stat.icon className="w-10 h-10 mb-3 text-white/90" />
                <h3 className="text-2xl md:text-3xl font-bold">
                  <Counter to={stat.value} duration={3.5} start={inView} /> {/* ✅ hanya jalan saat visible */}
                </h3>
                <p className="mt-2 text-lg">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

   <section className="py-12 bg-white text-gray-800">
  <div className="max-w-7xl mx-auto px-6">
    
    {/* 📱 Mobile: Bagian 1 (foto kiri + teks utama) */}
    <div className="flex md:hidden items-center gap-6 mb-10">
      {/* Foto Kiri */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="w-1/2"
      >
        <img 
          src="/img/siswa-kiri2.jpg" 
          alt="Siswa Membaca" 
          className="w-full h-60 object-cover rounded-2xl hover:scale-105 transition-transform duration-500"
        />
      </motion.div>

      {/* Teks Utama */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        viewport={{ once: true }}
        className="w-1/2"
      >
        <h3 className="text-xl font-bold text-green-700 mb-3 leading-snug">
          Generasi Berprestasi <br /> & Berakhlak Islami
        </h3>
        <p className="text-sm text-gray-800">
          Bergabunglah bersama kami untuk meraih ilmu pengetahuan dan akhlak mulia.
        </p>
      </motion.div>
    </div>

    {/* 📱 Mobile: Bagian 2 (foto kanan + teks tambahan) */}
    <div className="flex md:hidden items-center gap-6">
      {/* Foto Kanan */}
       <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-1/2 order-2"
        >
          <img 
            src="/img/siswa-kanan.jpg" 
            alt="Siswa Membaca" 
            className="w-full h-60 object-cover rounded-2xl hover:scale-105 transition-transform duration-500"
          />
        </motion.div>

        {/* Kata-kata Tambahan */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="w-1/2 order-1"
        >
          <h3 className="text-xl font-bold text-green-700 mb-3 leading-snug">
            Belajar dengan Nyaman <br /> dalam Lingkungan Islami
          </h3>
          <p className="text-sm text-gray-800">
            Kami hadirkan suasana belajar modern, islami, dan penuh semangat kebersamaan.
          </p>
        </motion.div>
    </div>

    {/* 💻 Desktop: Foto kiri – teks – foto kanan */}
    <div className="hidden md:grid grid-cols-3 items-center gap-10 mt-12">
      {/* Foto Kiri */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="flex justify-center"
      >
        <img 
          src="/img/siswa-kiri2.jpg" 
          alt="Siswa Membaca" 
          className="w-72 h-96 object-cover rounded-3xl hover:scale-105 transition-transform duration-500"
        />
      </motion.div>

      {/* Teks Tengah */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        viewport={{ once: true }}
        className="text-center md:px-8"
      >
        <h3 className="text-4xl font-bold text-green-700 mb-6 leading-snug">
          Membangun Generasi Berprestasi<br /> Berakhlak Islami
        </h3>
        <p className="mb-8 text-lg text-gray-800">
          Bergabunglah bersama kami untuk meraih ilmu pengetahuan yang luas, 
          iman yang kuat, serta akhlak mulia demi masa depan yang gemilang.
        </p>
      </motion.div>

      {/* Foto Kanan */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="flex justify-center"
      >
        <img 
          src="/img/siswa-kanan.jpg" 
          alt="Siswa Membaca" 
          className="w-72 h-96 object-cover rounded-3xl hover:scale-105 transition-transform duration-500"
        />
      </motion.div>
    </div>
  </div>
</section>


       {/* Footer-like Section */}
     <section className="px-4 pb-20">
               <div className="max-w-4xl mx-auto">
                 <motion.div
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.8 }}
                   className="bg-gradient-to-r from-sky-400 to-cyan-500 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl"
                 >
                   <h3 className="text-3xl md:text-4xl font-bold mb-4">
                     Ayo Mulai Sekarang!
                   </h3>
                   <p className="text-xl mb-8 opacity-90">
                     Bergabunglah Dengan Pelajar Yang Berakhlak Mulia
                   </p>
                   <button className="bg-white text-sky-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-sky-50 transform hover:scale-105 transition-all duration-300 shadow-lg">
                     Daftar
                   </button>
                 </motion.div>
               </div>
             </section>
    </PublicLayout>
  );
};

export default LandingPage;
