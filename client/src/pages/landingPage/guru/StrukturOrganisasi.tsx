import PublicLayout from "@/pages/layout/PublicLayout";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Jabatan = {
  jabatan: string;
  nama: string;
  foto: string;
  ttl?: string;
  alamat?: string;
  telp?: string;
};

const StrukturOrganisasi: React.FC = () => {
  const data: { [key: string]: Jabatan[] } = {
    ketuaYayasan: [
      {
        jabatan: "Ketua Yayasan",
        nama: "Elis Tsamrotul Aeni, M.Pd",
        foto: "/foto/ketua-yayasan.jpg",
        ttl: "Bogor, 12 Mei 1980",
        alamat: "Jl. Merdeka No. 45, Pamijahan",
        telp: "0812-3456-7890",
      },
    ],
    kepalaKomiteTU: [
      {
        jabatan: "Kepala Sekolah",
        nama: "Komarudin, S.Pd",
        foto: "/img/guru/kepala-sekolah.jpg",
        ttl: "Bogor, 01 Januari 1975",
        alamat: "Cibungbulang, Bogor",
        telp: "0812-8888-7777",
      },
      {
        jabatan: "Ketua Komite",
        nama: "Nuryadin Lutfi",
        foto: "/foto/komite.jpg",
        ttl: "Bogor, 10 Maret 1970",
        alamat: "Pamijahan, Bogor",
        telp: "0813-4444-5555",
      },
      {
        jabatan: "Tata Usaha",
        nama: "Nur Zakky Fadlani",
        foto: "/foto/tu.jpg",
        ttl: "Bogor, 23 Agustus 1995",
        alamat: "Ciampea, Bogor",
        telp: "0812-9999-2222",
      },
    ],
    wakasek: [
      {
        jabatan: "Wakasek Kurikulum",
        nama: "Abdul Hakim, M.Pd",
        foto: "/foto/kurikulum.jpg",
        ttl: "Bogor, 5 Juli 1982",
        alamat: "Cibinong, Bogor",
        telp: "0813-1234-5678",
      },
      {
        jabatan: "Wakasek Kesiswaan",
        nama: "Robihudin, S.Pd",
        foto: "/foto/kesiswaan.jpg",
        ttl: "Bogor, 18 Mei 1987",
        alamat: "Dramaga, Bogor",
        telp: "0812-2222-3333",
      },
      {
        jabatan: "Wakasek Sarpras",
        nama: "Jamaludin, S.Pd",
        foto: "/foto/sarpras.jpg",
        ttl: "Bogor, 30 September 1983",
        alamat: "Caringin, Bogor",
        telp: "0812-1111-9999",
      },
      {
        jabatan: "Bendahara",
        nama: "Intan Rifa'atul Mutmainnah",
        foto: "/foto/bendahara.jpg",
        ttl: "Bogor, 25 Desember 1990",
        alamat: "Leuwiliang, Bogor",
        telp: "0813-6666-0000",
      },
    ],
    staff: [
      {
        jabatan: "Pembina Osis",
        nama: "Burhan Nawawi",
        foto: "/img/guru/osis.jpg",
        ttl: "Bogor, 5 Juli 1982",
        alamat: "Cibinong, Bogor",
        telp: "0813-1234-5678",
      },
      {
        jabatan: "Ka. Perpustakaan",
        nama: "Mario Febrio",
        foto: "/foto/kesiswaan.jpg",
        ttl: "Bogor, 18 Mei 1987",
        alamat: "Dramaga, Bogor",
        telp: "0812-2222-3333",
      },
      {
        jabatan: "Guru BK/BP",
        nama: "Kholifah Maulidina, S.Pd",
        foto: "/foto/sarpras.jpg",
        ttl: "Bogor, 30 September 1983",
        alamat: "Caringin, Bogor",
        telp: "0812-1111-9999",
      },
    ],
  };

  const [selected, setSelected] = useState<Jabatan | null>(null);

  // Enhanced Card dengan design yang lebih modern
  const Card: React.FC<Jabatan & { index: number; level?: 'top' | 'middle' | 'bottom' }> = ({
    jabatan,
    nama,
    foto,
    index,
    level = 'middle',
  }) => {
    const cardSizes = {
      top: 'w-80 h-96 max-w-full',
      middle: 'w-72 h-88 max-w-full', 
      bottom: 'w-64 h-80 max-w-full sm:w-56 sm:h-72'
    };

    const photoSizes = {
      top: 'w-32 h-32',
      middle: 'w-28 h-28',
      bottom: 'w-24 h-24'
    };

    return (
      <motion.div
        className={`relative group bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl p-6 flex flex-col items-center cursor-pointer overflow-hidden ${cardSizes[level]} transition-all duration-300`}
        initial={{ opacity: 0, y: 60, rotateX: 15 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ 
          duration: 0.8, 
          delay: index * 0.1,
          type: "spring",
          stiffness: 100
        }}
        whileHover={{ 
          y: -8, 
          scale: 1.02,
          rotateY: 5,
          transition: { duration: 0.3 }
        }}
        onClick={() => setSelected({ jabatan, nama, foto })}
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5) inset'
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500"></div>
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-100 to-transparent rounded-bl-full"></div>
        
        {/* Photo with enhanced styling */}
        <div className="relative mb-4">
          <div className={`${photoSizes[level]} rounded-full bg-gradient-to-br from-emerald-200 to-teal-300 p-1`}>
            <img
              src={foto}
              alt={jabatan}
              className={`${photoSizes[level]} object-cover rounded-full border-2 border-white shadow-lg`}
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
        </div>

        {/* Position title */}
        <div className="text-center mb-3">
          <h4 className="font-bold text-gray-800 text-sm leading-tight mb-1 group-hover:text-emerald-700 transition-colors duration-300">
            {jabatan}
          </h4>
          <div className="w-12 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 mx-auto"></div>
        </div>

        {/* Name with hover effect */}
        <div className="relative">
          <p className="text-xs font-semibold text-gray-600 text-center px-3 py-2 rounded-lg bg-gray-50 group-hover:bg-emerald-50 transition-all duration-300 group-hover:text-emerald-700">
            {nama}
          </p>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl"></div>
        
        {/* Click indicator */}
        <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
      </motion.div>
    );
  };

  return (
    <PublicLayout>
      <section className="min-h-screen py-16 px-6 relative overflow-hidden">
        {/* Enhanced background with geometric patterns */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgb(16 185 129)" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <circle cx="200" cy="200" r="100" fill="url(#radial-gradient)" opacity="0.1" />
            <circle cx="1000" cy="600" r="150" fill="url(#radial-gradient)" opacity="0.1" />
            <defs>
              <radialGradient id="radial-gradient">
                <stop offset="0%" stopColor="rgb(16 185 129)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Enhanced title */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, type: "spring" }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              STRUKTUR ORGANISASI
            </h2>
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
              SMA IT AS-SAKINAH
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 mx-auto rounded-full"></div>
          </motion.div>

          {/* Ketua Yayasan - Top Level */}
          <div className="mb-16 flex justify-center">
            {data.ketuaYayasan.map((item, i) => (
              <Card key={i} {...item} index={i} level="top" />
            ))}
          </div>

          {/* Connection lines */}
          <div className="flex justify-center mb-8">
            <div className="w-px h-8 bg-gradient-to-b from-emerald-400 to-teal-500"></div>
          </div>

          {/* Kepala Sekolah - Komite - TU */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 justify-items-center">
            {data.kepalaKomiteTU.map((item, i) => (
              <Card key={i} {...item} index={i} level="middle" />
            ))}
          </div>

          {/* Connection lines */}
          <div className="flex justify-center mb-8">
            <div className="w-px h-8 bg-gradient-to-b from-emerald-400 to-teal-500"></div>
          </div>

          {/* Wakasek & Bendahara */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 justify-items-center">
            {data.wakasek.map((item, i) => (
              <Card key={i} {...item} index={i} level="bottom" />
            ))}
          </div>

          {/* Staff */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 justify-items-center">
            {data.staff.map((item, i) => (
              <Card key={i} {...item} index={i} level="bottom" />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col md:flex-row overflow-hidden relative"
              initial={{ scale: 0.7, opacity: 0, rotateX: 15 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.7, opacity: 0, rotateX: 15 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button 
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Photo section dengan gradient background */}
              <div className="md:w-2/5 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 flex items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    <defs>
                      <pattern id="modal-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="1" fill="rgb(16 185 129)" opacity="0.3"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#modal-pattern)"/>
                  </svg>
                </div>
                <div className="relative">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-emerald-200 to-teal-300 p-2">
                    <img
                      src={selected.foto}
                      alt={selected.jabatan}
                      className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Detail section dengan design yang lebih modern */}
              <div className="md:w-3/5 p-8 text-left bg-gradient-to-br from-white to-gray-50">
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full mb-3">
                    PROFIL PEJABAT
                  </span>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 leading-tight">
                    {selected.jabatan}
                  </h3>
                  <p className="text-xl font-semibold text-emerald-600 mb-6">
                    {selected.nama}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h2a2 2 0 012 2v1m-6 0h6m-6 0L4 7v10a2 2 0 002 2h12a2 2 0 002-2V7l-2 0M8 7v5a2 2 0 002 2h4a2 2 0 002-2V7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600 text-sm">Tempat, Tanggal Lahir</p>
                      <p className="text-gray-800 font-semibold">{selected.ttl || "Tidak tersedia"}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600 text-sm">Alamat</p>
                      <p className="text-gray-800 font-semibold">{selected.alamat || "Tidak tersedia"}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600 text-sm">No. Telepon</p>
                      <p className="text-gray-800 font-semibold">{selected.telp || "Tidak tersedia"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PublicLayout>
  );
};

export default StrukturOrganisasi;