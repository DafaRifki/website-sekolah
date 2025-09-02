import React from "react";
import { motion } from "framer-motion";
import PublicLayout from "@/pages/layout/PublicLayout";

const KepalaSekolah: React.FC = () => {
  return (
    <PublicLayout>
    <div className="bg-hite text-gray-800 min-h-screen py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Judul */}
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl font-bold text-center text-green-700 mb-12"
        >
          Kepala Sekolah
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Foto Kepala Sekolah */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="flex justify-center"
          >
            <img
              src="/img/kepsek.jpg"
              alt="Kepala Sekolah"
              className="w-100 h-100 object-cover rounded-2xl shadow-lg border-4 border-green-200"
            />
          </motion.div>

          {/* Identitas & Sambutan */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-2xl font-bold text-green-700 mb-4">
             Ust Komarudin S.Pd
            </h2>
            <p className="text-gray-600 mb-6">Kepala Sekolah SIT As-Sakinah</p>

            <p className="text-gray-700 leading-relaxed mb-4">
              Assalamu’alaikum warahmatullahi wabarakatuh,
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Segala puji bagi Allah SWT, Tuhan semesta alam. Shalawat serta salam
              semoga senantiasa tercurah kepada Nabi Muhammad SAW, keluarga, sahabat,
              serta kita semua sebagai pengikutnya.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Dengan hadirnya website resmi sekolah ini, kami berharap dapat menjadi
              sarana informasi, komunikasi, serta media pembelajaran yang bermanfaat
              bagi seluruh siswa, orang tua, dan masyarakat. Kami berkomitmen untuk
              membimbing generasi muda agar menjadi insan yang beriman, berilmu, dan
              berakhlak mulia.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Wassalamu’alaikum warahmatullahi wabarakatuh.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
    </PublicLayout>
  );
};

export default KepalaSekolah;
