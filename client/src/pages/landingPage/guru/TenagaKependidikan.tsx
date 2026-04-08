import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '@/pages/layout/PublicLayout';
import { 
  Users, 
  Search,
  Phone,
  Mail,
  Award,
  BookOpen
} from 'lucide-react';

// --- KUNCI PERBAIKAN: Gunakan Port 3000 ---
const BACKEND_URL = "http://localhost:3000";
const API_URL = `${BACKEND_URL}/api/guru`;

const TenagaKependidikan = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- AMBIL DATA DARI API GURU ---
  useEffect(() => {
    const fetchGuru = async () => {
      try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const result = await response.json();

        // Ambil data array (mengatasi perbedaan struktur data antara axios dan fetch)
        let rawData = [];
        if (Array.isArray(result)) {
          rawData = result;
        } else if (Array.isArray(result.data?.data)) {
          rawData = result.data.data;
        } else if (Array.isArray(result.data)) {
          rawData = result.data;
        }

        // Format data sesuai kebutuhan UI
        const formattedStaff = rawData.map((guru: any) => {
          // Kategori otomatis (Admin = Administrasi, User biasa = Guru)
          const cat = guru.user?.role === "ADMIN" ? "Administrasi" : "Guru";

          return {
            id: guru.id_guru,
            name: guru.nama || "Tanpa Nama",
            position: guru.jabatan || "Guru Pengajar",
            category: cat,
            photo: guru.fotoProfil,
            email: guru.user?.email || "Tidak ada email",
            phone: guru.noHP || "Tidak ada nomor"
          };
        });

        setStaff(formattedStaff);
      } catch (error) {
        console.error("Gagal mengambil data guru:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuru();
  }, []);

  const categories = ["Semua", "Guru", "Administrasi"];

  const filteredStaff = staff.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          person.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || person.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { 
      icon: <Users size={32} />, 
      number: staff.filter(s => s.category === "Guru").length, 
      label: "Tenaga Pengajar",
      color: "from-blue-500 to-blue-600"
    },
    { 
      icon: <BookOpen size={32} />, 
      number: staff.filter(s => s.category === "Administrasi").length, 
      label: "Staf Administrasi",
      color: "from-purple-500 to-purple-600"
    },
    { 
      icon: <Award size={32} />, 
      number: staff.length, 
      label: "Total Pegawai",
      color: "from-emerald-500 to-emerald-600"
    }
  ];

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-500"></div>
            <p className="text-slate-500 font-medium animate-pulse">Menarik Data Guru...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 min-h-screen">
        <section className="relative py-20 px-6 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute w-96 h-96 bg-emerald-200/20 rounded-full -top-20 -left-20 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute w-96 h-96 bg-blue-200/20 rounded-full -bottom-20 -right-20 blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-center mb-12"
            >
              <span className="inline-block px-6 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
                Tim Kami
              </span>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent mb-4">
                Tenaga Kependidikan
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Mengenal lebih dekat para pendidik dan staf profesional kami.
              </p>
            </motion.div>

            <div className="flex justify-center flex-wrap gap-6 mb-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="relative group w-full sm:w-64"
                >
                  <div className={`absolute -inset-2 bg-gradient-to-r ${stat.color} rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300`}></div>
                  <div className="relative bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center text-center">
                    <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Cari nama atau jabatan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            {filteredStaff.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStaff.map((person, index) => (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                    <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 h-full flex flex-col">
                      
                      {/* Photo Section */}
                      <div className="relative h-64 bg-gradient-to-br from-emerald-100 to-teal-100 overflow-hidden shrink-0">
                        <img
                          src={person.photo ? `${BACKEND_URL}/uploads/guru/${person.photo}` : "/img/default-user.jpg"}
                          alt={person.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=10b981&color=fff`;
                          }}
                        />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-semibold text-emerald-700 shadow-sm">
                          {person.category}
                        </div>
                      </div>

                      {/* Info Section (Nama, Jabatan, Email, Telp) */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {person.name}
                        </h3>
                        <p className="text-emerald-600 font-medium mb-4 flex-1">
                          {person.position}
                        </p>

                        <div className="border-t pt-4 space-y-3">
                          <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                            <Mail size={18} className="text-gray-400 shrink-0" />
                            <span className="truncate">{person.email}</span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                            <Phone size={18} className="text-gray-400 shrink-0" />
                            <span>{person.phone}</span>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Tidak Ada Hasil
                </h3>
                <p className="text-gray-600">
                  Data belum masuk atau format tidak dikenali.
                </p>
              </motion.div>
            )}
          </div>
        </section>

      </div>
    </PublicLayout>
  );
};

export default TenagaKependidikan;