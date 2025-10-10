import React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '@/pages/layout/PublicLayout';
import { 
  Users, 
  GraduationCap, 
  Award,
  BookOpen,
  Search,
  Mail,
  Phone,
} from 'lucide-react';

const TenagaKependidikan = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Data Tenaga Kependidikan
  const staff = [
    {
      id: 1,
      name: "Ust. Ahmad Fauzi, S.Pd.I",
      position: "Guru Pendidikan Agama Islam",
      category: "Guru",
      photo: "/img/tenagapendidik.jpg",
      email: "ahmad.fauzi@smait-assakinah.sch.id",
      phone: "0812-3456-7890",
      education: "S1 Pendidikan Agama Islam",
      experience: "8 Tahun"
    },
    {
      id: 2,
      name: "Ustadzah Siti Fatimah, S.Pd",
      position: "Guru Bahasa Indonesia",
      category: "Guru",
      photo: "/img/tenagapendidik.jpg",
      email: "siti.fatimah@smait-assakinah.sch.id",
      phone: "0813-4567-8901",
      education: "S1 Pendidikan Bahasa Indonesia",
      experience: "6 Tahun"
    },
    {
      id: 3,
      name: "Ust. Budi Santoso, S.Si",
      position: "Guru Matematika",
      category: "Guru",
      photo: "/img/tenagapendidik.jpg",
      email: "budi.santoso@smait-assakinah.sch.id",
      phone: "0814-5678-9012",
      education: "S1 Matematika",
      experience: "10 Tahun"
    },
    {
      id: 4,
      name: "Ustadzah Nur Hasanah, S.Pd",
      position: "Guru Bahasa Inggris",
      category: "Guru",
      photo: "/img/tenagapendidik.jpg",
      email: "nur.hasanah@smait-assakinah.sch.id",
      phone: "0815-6789-0123",
      education: "S1 Pendidikan Bahasa Inggris",
      experience: "7 Tahun"
    },
    {
      id: 5,
      name: "Ust. Rizki Ramadhan, S.Kom",
      position: "Guru TIK & Multimedia",
      category: "Guru",
      photo: "/img/tenagapendidik.jpg",
      email: "rizki.ramadhan@smait-assakinah.sch.id",
      phone: "0816-7890-1234",
      education: "S1 Teknik Informatika",
      experience: "5 Tahun"
    },
    {
      id: 6,
      name: "Ustadzah Dewi Lestari, S.Pd",
      position: "Guru Biologi",
      category: "Guru",
      photo: "/img/tenagapendidik.jpg",
      email: "dewi.lestari@smait-assakinah.sch.id",
      phone: "0817-8901-2345",
      education: "S1 Pendidikan Biologi",
      experience: "6 Tahun"
    },
    {
      id: 7,
      name: "Ibu Ratna Sari",
      position: "Staf Administrasi",
      category: "Administrasi",
      photo: "/img/tenagapendidik.jpg",
      email: "ratna.sari@smait-assakinah.sch.id",
      phone: "0818-9012-3456",
      education: "D3 Administrasi",
      experience: "4 Tahun"
    },
    {
      id: 8,
      name: "Bapak Joko Susilo",
      position: "Staf Keuangan",
      category: "Administrasi",
      photo: "/img/tenagapendidik.jpg",
      email: "joko.susilo@smait-assakinah.sch.id",
      phone: "0819-0123-4567",
      education: "S1 Akuntansi",
      experience: "5 Tahun"
    },
    {
      id: 9,
      name: "Bapak Usman",
      position: "Kepala Bagian Kebersihan",
      category: "Pendukung",
      photo: "/img/tenagapendidik.jpg",
      email: "-",
      phone: "0820-1234-5678",
      education: "SMA",
      experience: "3 Tahun"
    }
  ];

  const categories = ["Semua", "Guru", "Administrasi", "Pendukung"];

  // Filter staff based on search and category
  const filteredStaff = staff.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || person.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Statistics
  const stats = [
    { 
      icon: <Users size={32} />, 
      number: staff.filter(s => s.category === "Guru").length, 
      label: "Tenaga Pengajar",
      color: "from-blue-500 to-blue-600"
    },
    { 
      icon: <Award size={32} />, 
      number: "95%", 
      label: "Bersertifikat",
      color: "from-emerald-500 to-emerald-600"
    },
    { 
      icon: <GraduationCap size={32} />, 
      number: staff.filter(s => s.category === "Administrasi").length, 
      label: "Staf Administrasi",
      color: "from-purple-500 to-purple-600"
    },
    { 
      icon: <BookOpen size={32} />, 
      number: "10+", 
      label: "Tahun Pengalaman",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 px-6 overflow-hidden">
          {/* Decorative Background */}
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
            {/* Title */}
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
                Tenaga profesional dan berdedikasi untuk pendidikan berkualitas
              </p>
            </motion.div>

            {/* Statistics */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="relative group"
                >
                  <div className={`absolute -inset-2 bg-gradient-to-r ${stat.color} rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300`}></div>
                  <div className="relative bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
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

            {/* Search and Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Cari nama atau posisi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Category Filter */}
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

        {/* Staff Grid */}
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
                    <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 h-full">
                      {/* Photo */}
                      <div className="relative h-64 bg-gradient-to-br from-emerald-100 to-teal-100 overflow-hidden">
                        <img
                          src={person.photo}
                          alt={person.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e0e7ff" width="200" height="200"/%3E%3Ctext fill="%236366f1" font-family="Arial" font-size="80" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E' + person.name.charAt(0) + '%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        {/* Category Badge */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-semibold text-emerald-700">
                          {person.category}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {person.name}
                        </h3>
                        <p className="text-emerald-600 font-medium mb-4">
                          {person.position}
                        </p>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <GraduationCap size={16} className="text-emerald-600" />
                            <span>{person.education}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Award size={16} className="text-emerald-600" />
                            <span>Pengalaman: {person.experience}</span>
                          </div>
                        </div>

                        <div className="border-t pt-4 space-y-2">
                          {person.email !== "-" && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail size={16} className="text-gray-400" />
                              <span className="truncate">{person.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={16} className="text-gray-400" />
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
                  Coba ubah kata kunci pencarian atau filter kategori
                </p>
              </motion.div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl opacity-20 blur-2xl"></div>
              <div className="relative bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-12 text-center text-white shadow-2xl">
                <Users className="mx-auto mb-6" size={48} />
                <h2 className="text-3xl font-bold mb-4">
                  Bergabung dengan Tim Kami
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Kami selalu mencari individu berbakat dan berdedikasi untuk bergabung 
                  dalam misi pendidikan berkualitas
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-emerald-700 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
                >
                  Kirim Lamaran
                </motion.button>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default TenagaKependidikan;