import PublicLayout from "@/pages/layout/PublicLayout";
import { motion } from "framer-motion";

const newsData = [
  {
    id: 1,
    title: "Peresmian Gedung Baru Sekolah",
    date: "12 September 2025",
    desc: "Sekolah Islam kami meresmikan gedung baru untuk menunjang kegiatan belajar yang lebih nyaman dan modern.",
    image: "/img/berita1.jpg",
  },
  {
    id: 2,
    title: "Prestasi Santri di Olimpiade Sains",
    date: "5 September 2025",
    desc: "Santri kami berhasil meraih medali emas dalam ajang Olimpiade Sains tingkat nasional.",
    image: "/img/berita2.jpg",
  },
  {
    id: 3,
    title: "Kegiatan Pesantren Ramadhan",
    date: "1 September 2025",
    desc: "Pesantren Ramadhan sukses diselenggarakan dengan penuh semangat dan kebersamaan.",
    image: "/img/berita3.jpg",
  },
];

export default function Berita() {
  return (
    <PublicLayout>
    <section className="py-20 bg-gradient-to-b from-green-100 to-white text-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-12">
            <motion.h3
                  initial={{ opacity: 0, y: -40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-700 via-emerald-500 to-yellow-400 bg-clip-text text-transparent" >
                      Berita & Pengumuman
                 </motion.h3>
            <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="mt-4 max-w-2xl mx-auto text-gray-800 text-lg" >
                      Ikuti kabar terbaru seputar kegiatan, prestasi, dan informasi penting dari sekolah kami.
                </motion.p>
        </div>

        {/* Grid Berita */}
        <div className="grid md:grid-cols-3 gap-8">
          {newsData.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-56 object-cover"
              />
              <div className="p-6">
                <p className="text-sm text-yellow-600 font-medium mb-2">{news.date}</p>
                <h3 className="text-xl font-bold text-green-700 mb-3">{news.title}</h3>
                <p className="text-gray-700 mb-4">{news.desc}</p>
                <a
                  href="#"
                  className="inline-block px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Baca Selengkapnya
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    </PublicLayout>
  );
}
