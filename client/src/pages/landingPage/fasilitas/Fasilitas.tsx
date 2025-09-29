import React, { useState } from "react";
import { motion } from "framer-motion";
import PublicLayout from "@/pages/layout/PublicLayout";

const fasilitasList = [
  {
    title: "Ruang Kelas Nyaman",
    img: "/img/kelas.jpg",
    description: "Ruang kelas dengan fasilitas modern dan suasana kondusif untuk pembelajaran optimal",
    category: "akademik"
  },
  {
    title: "Perpustakaan Modern",
    img: "/img/perpustakaan.jpg",
    description: "Perpustakaan digital dengan koleksi buku lengkap dan area baca yang nyaman",
    category: "akademik"
  },
  {
    title: "Laboratorium Sains",
    img: "/img/lab.jpg",
    description: "Laboratorium lengkap untuk praktikum IPA dengan peralatan modern",
    category: "akademik"
  },
  {
    title: "Lapangan Olahraga",
    img: "/img/lapangan.jpg",
    description: "Lapangan multifungsi untuk berbagai aktivitas olahraga dan kegiatan outdoor",
    category: "olahraga"
  },
  {
    title: "Mushola Sekolah",
    img: "/img/masjid.jpg",
    description: "Tempat ibadah yang nyaman dengan fasilitas wudhu dan sound system",
    category: "religius"
  },
  {
    title: "Ruang Komputer",
    img: "/img/komputer.jpg",
    description: "Lab komputer dengan perangkat terbaru dan koneksi internet high-speed",
    category: "teknologi"
  },
  {
    title: "Kamar Mandi Bersih",
    img: "/img/kamarmandi.jpg",
    description: "Fasilitas sanitasi yang bersih dan terawat untuk kenyamanan siswa",
    category: "umum"
  },
  {
    title: "Kantin Sehat",
    img: "/img/kantin.jpg",
    description: "Kantin dengan menu sehat dan bergizi serta suasana yang bersih",
    category: "umum"
  },
  {
    title: "Rak Sepatu Tertata",
    img: "/img/raksepatu.jpg",
    description: "Area penyimpanan sepatu yang rapi dan terorganisir dengan baik",
    category: "umum"
  },
  {
    title: "Ruang Guru Nyaman",
    img: "/img/ruangguru.jpg",
    description: "Ruang kerja guru yang nyaman dengan fasilitas lengkap",
    category: "akademik"
  },
  {
    title: "Aula Serbaguna",
    img: "/img/aula.jpg",
    description: "Ruang serbaguna untuk acara, seminar, dan kegiatan besar lainnya",
    category: "umum"
  },
  {
    title: "Koperasi",
    img: "/img/parkir.jpg",
    description: "Koperasi sekolah yang menyediakan kebutuhan siswa dan guru",
    category: "umum"
  },
];

const categories = [
  { key: "semua", label: "Semua Fasilitas", color: "bg-gradient-to-r from-blue-500 to-purple-600" },
  { key: "akademik", label: "Akademik", color: "bg-gradient-to-r from-green-500 to-emerald-600" },
  { key: "olahraga", label: "Olahraga", color: "bg-gradient-to-r from-orange-500 to-red-500" },
  { key: "teknologi", label: "Teknologi", color: "bg-gradient-to-r from-cyan-500 to-blue-600" },
  { key: "religius", label: "Religius", color: "bg-gradient-to-r from-amber-500 to-yellow-600" },
  { key: "umum", label: "Umum", color: "bg-gradient-to-r from-gray-500 to-slate-600" },
];

const Fasilitas: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("semua");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const filteredFasilitas = activeCategory === "semua" 
    ? fasilitasList 
    : fasilitasList.filter(item => item.category === activeCategory);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Hero Section */}
        <section className="relative py-24 px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-emerald-400/5"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-emerald-400/20 to-emerald-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-emerald-300/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6"
          >
            <span className="inline-block px-6 py-2 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 rounded-full text-sm font-semibold mb-4">
              ✨ Fasilitas Unggulan
            </span>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-emerald-900 via-emerald-700 to-emerald-500 bg-clip-text text-transparent leading-tight">
              Fasilitas
              <span className="block mt-2">Terdepan</span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
          >
            Nikmati pengalaman belajar terbaik dengan fasilitas modern, lengkap, dan terintegrasi 
            yang mendukung pengembangan akademik dan karakter islami siswa.
          </motion.p>
        </div>
      </section>


        {/* Category Filter */}
        <section className="px-4 mb-12">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap justify-center gap-3 mb-8"
            >
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={`px-6 py-3 rounded-2xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
                    activeCategory === category.key 
                      ? category.color + " shadow-2xl scale-105" 
                      : "bg-gray-400 hover:bg-gray-500"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Facilities Grid */}
        <section className="px-4 pb-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFasilitas.map((item, index) => (
              <motion.div
                key={`${activeCategory}-${index}`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: "easeOut" 
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Floating Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-lg">
                      #{index + 1}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {item.description}
                  </p>
                  
                  {/* Category Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                      categories.find(cat => cat.key === item.category)?.color || 'bg-gray-500'
                    }`}>
                      {categories.find(cat => cat.key === item.category)?.label}
                    </span>
                    
                    {/* Arrow Icon */}
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white transform transition-all duration-300 ${
                      hoveredIndex === index ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/20 group-hover:to-purple-400/20 transition-all duration-500 pointer-events-none"></div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
       
      </div>
    </PublicLayout>
  );
};

export default Fasilitas;