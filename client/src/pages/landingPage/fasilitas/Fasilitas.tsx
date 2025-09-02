import React from "react";
import { motion } from "framer-motion";
import PublicLayout from "@/pages/layout/PublicLayout";

const fasilitasList = [
  {
    title: "Ruang Kelas Nyaman",
    img: "/img/kelas.jpg",
  },
  {
    title: "Perpustakaan Modern",
    img: "/img/perpustakaan.jpg",
  },
  {
    title: "Laboratorium Sains",
    img: "/img/lab.jpg",
  },
  {
    title: "Lapangan Olahraga",
    img: "/img/lapangan.jpg",
  },
  {
    title: "Mushola Sekolah",
    img: "/img/masjid.jpg",
  },
  {
    title: "Ruang Komputer",
    img: "/img/komputer.jpg",
  },
  {
    title: "Kamar Mandi Bersih",
    img: "/img/kamarmandi.jpg",
  },
  {
    title: "Kantin Sehat",
    img: "/img/kantin.jpg",
  },
  {
    title: "Rak Sepatu Tertata",
    img: "/img/raksepatu.jpg",
  },
  {
    title: "Ruang Guru Nyaman",
    img: "/img/ruangguru.jpg",
  },
  {
    title: "Aula Serbaguna",
    img: "/img/aula.jpg",
  },
  {
    title: "Koperasi",
    img: "/img/parkir.jpg",
  },
];

const Fasilitas: React.FC = () => {
  return (
    <PublicLayout>
      <section className="relative py-20 px-4 bg-gray-100">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-700 via-emerald-500 to-yellow-400 bg-clip-text text-transparent"
          >
            Fasilitas Sekolah
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mt-4 max-w-2xl mx-auto text-gray-600 text-lg"
          >
            Kami menyediakan berbagai fasilitas unggulan untuk mendukung proses
            belajar mengajar yang nyaman, modern, dan islami.
          </motion.p>
        </div>

        {/* Grid Fasilitas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {fasilitasList.map((item, index) => (
            <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }} // mulai dari bawah dengan opacity 0
            whileInView={{ opacity: 1, y: 0 }} // animasi muncul ke atas
            viewport={{ once: true, amount: 0.2 }} // sekali saja, muncul saat 20% elemen masuk viewport
            transition={{ duration: 0.6, delay: index * 0.1 }} // delay biar muncul bertahap
            className="relative group rounded-2xl overflow-hidden shadow-lg cursor-pointer"
            >
            <img
                src={item.img}
                alt={item.title}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                <h3 className="text-white text-xl font-semibold">{item.title}</h3>
            </div>
            </motion.div> 
             
          ))}
        </div>
      </section>
    </PublicLayout>
  );
};

export default Fasilitas;
