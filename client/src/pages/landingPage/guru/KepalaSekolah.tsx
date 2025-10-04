import React from "react";
import { motion } from "framer-motion";
import PublicLayout from "@/pages/layout/PublicLayout";
import { Quote, Award, Target, Users, BookOpen, Heart } from "lucide-react";

const KepalaSekolah: React.FC = () => {
  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/40 min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 px-6 overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute w-72 h-72 bg-emerald-200/20 rounded-full -top-20 -left-20 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-96 h-96 bg-teal-200/20 rounded-full -bottom-20 -right-20 blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center mb-16"
            >
              <span className="inline-block px-6 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
                Pemimpin Kami
              </span>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-4">
                Kepala Sekolah
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Dedikasi dan visi untuk membentuk generasi berakhlak mulia
              </p>
            </motion.div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Photo Section */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative"
              >
                <div className="relative">
                  {/* Decorative Border */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl opacity-20 blur-xl"></div>
                  
                  {/* Photo Card */}
                  <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white">
                    <img
                      src="/img/kepsek.jpg"
                      alt="Kepala Sekolah"
                      className="w-full h-auto object-cover"
                    />
                    
                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-900/95 to-transparent p-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Ust Komarudin, S.Pd
                      </h2>
                      <p className="text-emerald-100 text-lg">
                        Kepala Sekolah SMA IT As-Sakinah
                      </p>
                    </div>
                  </div>

                  {/* Achievement Badges */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="absolute -bottom-5 -right-6 bg-gradient-to-br from-yellow-400 to-orange-400 text-white p-4 rounded-xl shadow-2xl"
                  >
                    <Award size={32} className="mb-2" />
                    <div className="text-2xl font-bold">7+</div>
                    <div className="text-sm opacity-100">Tahun Pengalaman</div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Message Section */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="space-y-6"
              >
                {/* Quote Card */}
                <div className="relative bg-white rounded-2xl shadow-lg p-8 border border-emerald-100">
                  <Quote className="absolute top-4 right-4 text-emerald-200" size={48} />
                  
                  <div className="relative space-y-4">
                    <p className="text-gray-700 leading-relaxed font-medium text-lg">
                      <span className="text-emerald-700 font-semibold">
                        Assalamu'alaikum warahmatullahi wabarakatuh,
                      </span>
                    </p>
                    
                    <p className="text-gray-700 leading-relaxed">
                      Segala puji bagi Allah SWT, Tuhan semesta alam. Shalawat serta salam
                      semoga senantiasa tercurah kepada Nabi Muhammad SAW, keluarga, sahabat,
                      serta kita semua sebagai pengikutnya.
                    </p>
                    
                    <p className="text-gray-700 leading-relaxed">
                      Dengan hadirnya website resmi sekolah ini, kami berharap dapat menjadi
                      sarana informasi, komunikasi, serta media pembelajaran yang bermanfaat
                      bagi seluruh siswa, orang tua, dan masyarakat.
                    </p>
                    
                    <p className="text-gray-700 leading-relaxed">
                      Kami berkomitmen untuk membimbing generasi muda agar menjadi insan yang
                      <span className="text-emerald-700 font-semibold"> beriman, berilmu, dan berakhlak mulia</span>. 
                      Pendidikan di sekolah kami tidak hanya fokus pada pencapaian akademik, tetapi juga 
                      pembentukan karakter Islami yang kuat dan siap menghadapi tantangan zaman.
                    </p>
                    
                    <p className="text-gray-700 leading-relaxed">
                      Mari bersama-sama kita wujudkan visi mulia ini demi masa depan generasi 
                      yang lebih baik dan penuh berkah.
                    </p>
                    
                    <p className="text-emerald-700 font-semibold text-lg mt-6">
                      Wassalamu'alaikum warahmatullahi wabarakatuh.
                    </p>
                  </div>
                </div>

                {/* Signature */}
                <div className="text-right">
                  <div className="inline-block bg-gradient-to-br from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl shadow-lg">
                    <div className="font-bold text-lg">Ust Komarudin, S.Pd</div>
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