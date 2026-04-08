import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import ModalTambah from "./ModalTambah";
import ModalEdit from "./ModalEdit";
import ModalEditKepsek from "./ModalEditKepsek"; // Import modal khusus Kepsek
import ModalKonfirmasi from "./ModalKonfirmasi";

// Sesuai dengan .env kamu: PORT=3000
const BACKEND_URL = "http://localhost:3000";

const IndexStrukturOrganisasi = () => {
  // --- STATES ---
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditKepsekOpen, setIsEditKepsekOpen] = useState(false); // Modal khusus kepsek
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // State Data Terpilih
  const [selectedData, setSelectedData] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // --- FUNCTIONS ---

  // 1. Ambil Data dari Server
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/struktur-organisasi`);
      if (!response.ok) throw new Error("Gagal mengambil data");
      
      const result = await response.json();
      
      if (result && result.data) {
        const g = result.data;
        const all = [
          ...(Array.isArray(g.ketuaYayasan) ? g.ketuaYayasan : []),
          ...(Array.isArray(g.kepalaKomiteTU) ? g.kepalaKomiteTU : []),
          ...(Array.isArray(g.wakasek) ? g.wakasek : []),
          ...(Array.isArray(g.staff) ? g.staff : [])
        ];
        setData(all);
      }
    } catch (err) {
      console.error("Error fetchData:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handler Hapus
  const openDeleteModal = (id: number) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const processDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/struktur-organisasi/${deleteId}`, { 
        method: 'DELETE' 
      });
      if (response.ok) {
        setIsDeleteModalOpen(false);
        fetchData(); 
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus data.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // 3. Handler Edit (Logika Percabangan)
  const handleEditAction = (item: any) => {
  setSelectedData(item);
  
  // Deteksi: Apakah jabatannya mengandung kata "Kepala Sekolah"?
  const isKepsek = item.jabatan.toLowerCase().includes("kepala sekolah");
  
  if (isKepsek) {
    setIsEditKepsekOpen(true); // Membuka ModalEditKepsek (Lebar + Ada Sambutan)
  } else {
    setIsEditModalOpen(true); // Membuka ModalEdit biasa
  }
};

  // 4. Helper Format Teks Kategori
  const formatKategori = (kat: string) => {
    const names: any = {
      ketuaYayasan: 'Ketua Yayasan',
      kepalaKomiteTU: 'Kepala Sekolah / TU',
      wakasek: 'Wakasek / Bendahara',
      staff: 'Staff & Guru'
    };
    return names[kat] || kat;
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-8 w-full mx-auto min-h-screen bg-slate-50/50">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Struktur Organisasi</h1>
          <p className="text-slate-500 text-lg mt-1 text-balance">Kelola jajaran pejabat SMA IT As-Sakinah</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-semibold shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 active:scale-95 w-full md:w-auto justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pejabat
        </button>
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-slate-400 uppercase text-xs font-bold tracking-widest">Profil Pejabat</th>
                <th className="px-8 py-5 text-slate-400 uppercase text-xs font-bold tracking-widest">Kategori</th>
                <th className="px-8 py-5 text-slate-400 uppercase text-xs font-bold tracking-widest">Kontak</th>
                <th className="px-8 py-5 text-slate-400 uppercase text-xs font-bold tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-32 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="animate-pulse">Menghubungkan ke server...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-32 text-center text-slate-400 font-medium italic">
                    Belum ada data struktur organisasi.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100 flex-shrink-0">
                        <img 
                          // Hasilnya: http://localhost:3000/uploads/guru/nama-file.jpg
                          src={`${BACKEND_URL}/uploads/${item.foto}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nama)}&background=10b981&color=fff`;
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-base">{item.nama}</p>
                        <p className="text-emerald-600 font-semibold text-sm">{item.jabatan}</p>
                      </div>
                    </td>

                    <td className="px-8 py-5">
                      <span className="px-4 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">
                        {formatKategori(item.kategori)}
                      </span>
                    </td>

                    <td className="px-8 py-5 text-slate-500 text-sm font-medium">
                      <p className="text-slate-700 font-bold">{item.telp || "-"}</p>
                      <p className="text-xs text-slate-400 italic truncate max-w-[200px]" title={item.alamat}>
                        {item.alamat || "Alamat tidak tersedia"}
                      </p>
                    </td>

                    <td className="px-8 py-5">
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => handleEditAction(item)} 
                          className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                          title="Edit Pejabat"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => openDeleteModal(item.id)} 
                          className="p-2.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-all active:scale-90"
                          title="Hapus Pejabat"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {/* 1. Modal Tambah */}
        {isModalOpen && (
          <ModalTambah 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => { setIsModalOpen(false); fetchData(); }} 
          />
        )}

        {/* 2. Modal Edit Biasa (Guru/Staff) */}
        {isEditModalOpen && (
          <ModalEdit 
            data={selectedData}
            onClose={() => setIsEditModalOpen(false)} 
            onSuccess={() => { setIsEditModalOpen(false); fetchData(); }} 
          />
        )}

        {/* 3. Modal Edit Khusus Kepsek (Sambutan) */}
        {isEditKepsekOpen && (
            <ModalEditKepsek 
                data={selectedData}
                onClose={() => setIsEditKepsekOpen(false)}
                onSuccess={() => { setIsEditKepsekOpen(false); fetchData(); }}
            />
        )}

        {/* 4. Modal Konfirmasi Hapus */}
        <ModalKonfirmasi 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={processDelete}
          loading={deleteLoading}
        />
      </AnimatePresence>
    </div>
  );
};

export default IndexStrukturOrganisasi;