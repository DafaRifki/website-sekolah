import React from "react";
import { motion } from "framer-motion";
import PublicLayout from "@/pages/layout/PublicLayout";

const ProfileSekolah: React.FC = () => {
  return (
    <PublicLayout>
      <div className="bg-gray-50 text-gray-900">
        {/* Hero Section */}
        <section
          className="relative bg-cover bg-center text-green-800 py-24 px-6 text-center"
          style={{ backgroundImage: "url('/img/pp1.jpg')" }}>

          {/* Overlay biar teks tetap jelas */}
          <div className="absolute inset-0"></div>

          <div className="relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              Profil Sekolah Islam Terpadu As-Sakinah
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="max-w-2xl mx-auto text-black text-lg md:text-xl"
            >
              Membentuk generasi unggul, berakhlak mulia, dan siap menghadapi
              tantangan zaman dengan penuh percaya diri.
            </motion.p>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1 }}
            className="flex justify-center"
          >
            <img
              src="./img/profilgmbr.jpg"
              alt="Sekolah"
              className="rounded-2xl shadow-lg object-cover w-full max-w-md"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-3xl font-bold text-green-700 mb-4">Tentang Kami</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Sekolah Islam Terpadu As-Sakinah adalah lembaga pendidikan yang
              menggabungkan kurikulum nasional dengan nilai-nilai Islami. Dengan
              fasilitas modern dan tenaga pengajar berpengalaman, kami berusaha
              menciptakan lingkungan belajar yang nyaman dan inspiratif.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Kami percaya bahwa pendidikan bukan hanya tentang ilmu pengetahuan,
              tetapi juga membentuk akhlak mulia dan karakter yang kuat.
            </p>
          </motion.div>
        </section>

        {/* Visi & Misi */}
       <section className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Visi */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1 }}
          className="p-8 bg-green-100 rounded-xl shadow hover:shadow-lg transition"
        >
          <h3 className="text-2xl font-bold text-green-700 mb-4">Visi</h3>
          <p>Terwujudnya peserta didik yang Cerdas, Berprestasi Dan Beraklak Mulia</p>
        </motion.div>

    {/* Misi & Tujuan */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Misi */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="p-8 bg-green-100 rounded-xl shadow hover:shadow-lg transition"
      >
        <h3 className="text-2xl font-bold text-green-700 mb-4">Misi</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Menumbuhkan semangat keunggulan prestasi di bidang Akademik.</li>
          <li>Menciptakan suasana pembelajaran yang menantang, menyenangkan, komunikatif, tanpa takut salah, dan demokratis.</li>
          <li>Mengembangkan sikap dan perilaku religius di lingkungan dalam dan luar sekolah.</li>
          <li>Menumbuhkan sikap jujur, toleransi, disiplin, kerja keras, kreatif, mandiri, demokratis dan tanggung jawab.</li>
          <li>Menumbuhkan disiplin yang tinggi dari seluruh warga sekolah.</li>
          <li>Menciptakan suasana pergaulan sehari-hari yang berdasarkan keimanan dan ketaqwaan.</li>
          <li>Menciptakan sikap kerja keras dan tanggungjawab serta menyelesaikan tugas tepat waktu.</li>
          <li>Menumbuhkan semangat berkompetisi secara sehat dan efektif kepada seluruh warga sekolah.</li>
          <li>Menciptakan pribadi yang trampil untuk hidup mandiri.</li>
        </ol>
      </motion.div>

          {/* Tujuan */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="p-8 bg-green-100 rounded-xl shadow hover:shadow-lg transition"
      >
        <h3 className="text-2xl font-bold text-green-700 mb-4">Tujuan</h3>
        <ol className="list-decimal list-inside space-y-2">
          <li>Mencetak Semangat dalam prestasi yang diraih di bidang pendidikan.</li>
          <li>Melahirkan suasana pembelajaran yang dapat membuat kepribadian tinggi dan berani.</li>
          <li>Menghasilkan peserta didik yang mampu mengaplikasikan akhlak yang baik di luar sekolah.</li>
          <li>Menghasilkan peserta didik yang mampu melaksanakan kejujuran dan berbakti terhadap orang tua.</li>
          <li>Menghasilkan peserta didik yang mampu membaca, memahami, dan memiliki disiplin yang tinggi.</li>
          <li>Menghasilkan peserta didik yang mampu selalu belajar melalui kebiasaan sehari-hari sesuai iman dan taqwa.</li>
          <li>Menghasilkan peserta didik yang mampu tampil tanggung jawab sebagai pemimpin dan aktif dalam berorganisasi.</li>
          <li>Menghasilkan peserta didik yang berprestasi dan siap melanjutkan ke jenjang pendidikan selanjutnya.</li>
          <li>Menghasilkan siswa/i yang berbakat dalam semua bidang.</li>
        </ol>
      </motion.div>

        </div>
      </div>
    </section>


    {/*alamat */}
        <section className="bg-white py-10 px-6 pt-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Deskripsi Alamat */}
            <div className="md:w-1/2">
              <h3 className="text-2xl font-bold text-green-700 mb-4">Alamat Sekolah</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                <span className="font-semibold">Nama Sekolah:</span> SMA IT As-Sakinah
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <span className="font-semibold">Alamat:</span> Kp Cempaka Putih Rt 001/006, Desa Cibening,  
                Kecamatan Pamijahan, Kabupaten Bogor
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                <span className="font-semibold">Tahun Berdiri:</span> 16 Juli 2023
              </p>
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold">Yayasan:</span> Yayasan Nurul Hidayatul Mutmainnah
              </p>
            </div>

            {/* Google Map */}
            <div className="md:w-1/2 h-80 rounded-xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.8975329738123!2d106.6473!3d-6.5532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c5c2f1234567%3A0xabcdef123456789!2sCibening%2C%20Pamijahan%2C%20Bogor!5e0!3m2!1sid!2sid!4v1701234567890!5m2!1sid!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </section>


        {/* Fasilitas */}
        <section className="py-0 px-0">
          <img
            src="/img/yayasan.jpg"
            alt="Fasilitas Sekolah"
            className="w-full h-auto md:h-[300px] object-contain md:object-cover"
          />
        </section>
      </div>
    </PublicLayout>
  );
};

export default ProfileSekolah;
