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
        nama: "Intan Rifa’atul Mutmainnah",
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

  // Card animasi default
  const Card: React.FC<Jabatan & { index: number }> = ({
    jabatan,
    nama,
    foto,
    index,
  }) => (
    <motion.div
      className="relative group bg-white shadow-md rounded-lg p-4 flex flex-col items-center cursor-pointer transform transition hover:scale-105 hover:shadow-xl"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      onClick={() => setSelected({ jabatan, nama, foto })}
    >
      <img
        src={foto}
        alt={jabatan}
        className="w-28 h-28 object-cover rounded-full border-4 border-green-700 mb-3"
      />

      <h4 className="font-semibold text-gray-700 text-center transition-all duration-300 group-hover:-translate-y-2">
        {jabatan}
      </h4>

      <p className="mt-2 text-green-600 font-bold text-sm text-center bg-white/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition duration-300">
        {nama}
      </p>
    </motion.div>
  );

  return (
    <PublicLayout>
      <section className="py-16 px-6 bg-gradient-to-b from-green-400 to-white">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2
            className="text-3xl font-bold text-yellow-500 mb-12 drop-shadow"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            STRUKTUR ORGANISASI <br /> SMA IT AS-SAKINAH
          </motion.h2>

          {/* Ketua Yayasan */}
          <div className="mb-12 flex justify-center">
            {data.ketuaYayasan.map((item, i) => (
              <Card key={i} {...item} index={i} />
            ))}
          </div>

          {/* Kepala Sekolah - Komite - TU */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {data.kepalaKomiteTU.map((item, i) => (
              <Card key={i} {...item} index={i} />
            ))}
          </div>

          {/* Wakasek & Bendahara */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {data.wakasek.map((item, i) => (
              <Card key={i} {...item} index={i} />
            ))}
          </div>
            {/*staff*/}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {data.staff.map((item, i) => (
              <Card key={i} {...item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Modal detail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg max-w-3xl w-full flex flex-col md:flex-row overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Foto kiri */}
              <div className="md:w-1/3 bg-green-100 flex items-center justify-center p-6">
                <img
                  src={selected.foto}
                  alt={selected.jabatan}
                  className="w-40 h-40 object-cover rounded-full border-4 border-green-700"
                />
              </div>

              {/* Detail kanan */}
              <div className="md:w-2/3 p-6 text-left">
                <h3 className="text-xl font-bold text-green-700 mb-2">
                  {selected.jabatan}
                </h3>
                <p className="text-lg font-semibold text-gray-800 mb-4">
                  {selected.nama}
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    <strong>Tempat, Tanggal Lahir:</strong>{" "}
                    {selected.ttl || "-"}
                  </li>
                  <li>
                    <strong>Alamat:</strong> {selected.alamat || "-"}
                  </li>
                  <li>
                    <strong>No. Telepon:</strong> {selected.telp || "-"}
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PublicLayout>
  );
};

export default StrukturOrganisasi;
