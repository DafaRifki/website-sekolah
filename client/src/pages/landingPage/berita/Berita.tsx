import PublicLayout from "@/pages/layout/PublicLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import apiClient from "@/config/axios";
import { Loader2, Newspaper } from "lucide-react";

export default function Berita() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<any | null>(null);

  const API_URL = import.meta.env.VITE_URL_API || "http://localhost:3000";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await apiClient.get("/berita");
        setNewsList(res.data.data);
      } catch (error) {
        console.error("Gagal mengambil berita:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Infrastruktur: "bg-blue-100 text-blue-700",
      Prestasi: "bg-yellow-100 text-yellow-700",
      Kegiatan: "bg-green-100 text-green-700",
      Pengumuman: "bg-purple-100 text-purple-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  return (
    <PublicLayout>
      <section className="min-h-screen py-20 relative overflow-hidden">
        {/* Enhanced Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none">
            <defs>
              <pattern id="news-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgb(16 185 129)" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#news-grid)" />
            <circle cx="150" cy="150" r="80" fill="url(#news-radial)" opacity="0.1" />
            <circle cx="1050" cy="650" r="120" fill="url(#news-radial)" opacity="0.1" />
            <defs>
              <radialGradient id="news-radial">
                <stop offset="0%" stopColor="rgb(16 185 129)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Enhanced Heading */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, type: "spring" }}
              className="mb-6"
            >
              <span className="inline-block px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-full mb-4">
                INFORMASI TERKINI
              </span>
              <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                BERITA & PENGUMUMAN
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 mx-auto rounded-full"></div>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="mt-6 max-w-2xl mx-auto text-gray-700 text-lg leading-relaxed"
            >
              Ikuti kabar terbaru seputar kegiatan, prestasi, dan informasi penting dari sekolah kami.
            </motion.p>
          </div>

          {/* Enhanced Grid Berita */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Memuat berita terbaru...</p>
            </div>
          ) : newsList.length === 0 ? (
            <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-emerald-200">
              <Newspaper className="w-16 h-16 text-emerald-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700">Belum Ada Berita</h3>
              <p className="text-slate-500">Nantikan informasi menarik lainnya dari sekolah kami.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsList.map((news, index) => (
                <motion.article
                  key={news.id}
                  initial={{ opacity: 0, y: 60, rotateX: 15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.15,
                    type: "spring",
                    stiffness: 100
                  }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  className="group bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 relative"
                  style={{
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5) inset'
                  }}
                >
                  {/* Decorative top accent */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500"></div>
                  
                  {/* Image with overlay effects */}
                  <div className="relative overflow-hidden">
                    <img
                      src={news.gambar ? `${API_URL}${news.gambar}` : "/img/default-news.jpg"}
                      alt={news.judul}
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Category badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(news.kategori)}`}>
                        {news.kategori}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Date and author */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h2a2 2 0 012 2v1m-6 0h6m-6 0L4 7v10a2 2 0 002 2h12a2 2 0 002-2V7l-2 0M8 7v5a2 2 0 002 2h4a2 2 0 002-2V7" />
                        </svg>
                        <p className="text-sm text-emerald-600 font-medium">{new Date(news.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-xs text-gray-700">{news.penulis}</p>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight group-hover:text-emerald-700 transition-colors duration-300">
                      {news.judul}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-800 mb-6 leading-relaxed line-clamp-3">
                      {news.isi}
                    </p>

                    {/* Enhanced CTA Button */}
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setSelectedNews(news)}
                        className="group/btn inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <span className="font-medium">Baca Selengkapnya</span>
                        <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      

                    </div>
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute bottom-4 right-4 w-2 h-2 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-150"></div>
                </motion.article>
              ))}
            </div>
          )}


        </div>

        {/* Modal untuk detail berita */}
        <AnimatePresence>
          {selectedNews && (
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNews(null)}
            >
              <motion.div
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
                initial={{ scale: 0.7, opacity: 0, rotateX: 15 }}
                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                exit={{ scale: 0.7, opacity: 0, rotateX: 15 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Modal content */}
                <div className="relative">
                  <img
                    src={selectedNews?.gambar ? `${API_URL}${selectedNews.gambar}` : "/img/default-news.jpg"}
                    alt={selectedNews?.judul || 'Berita'}
                    className="w-full h-64 object-cover rounded-t-3xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-t-3xl"></div>
                  <div className="absolute bottom-4 left-6">
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getCategoryColor(selectedNews?.kategori || '')}`}>
                      {selectedNews?.kategori || 'Berita'}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h2a2 2 0 012 2v1m-6 0h6m-6 0L4 7v10a2 2 0 002 2h12a2 2 0 002-2V7l-2 0M8 7v5a2 2 0 002 2h4a2 2 0 002-2V7" />
                      </svg>
                      <span>{new Date(selectedNews.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{selectedNews?.penulis || 'Admin'}</span>
                    </span>
                  </div>

                  <h2 className="text-3xl font-bold text-gray-800 mb-6 leading-tight">
                    {selectedNews?.judul || 'Judul Berita'}
                  </h2>

                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedNews?.isi}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </PublicLayout>
  );
}