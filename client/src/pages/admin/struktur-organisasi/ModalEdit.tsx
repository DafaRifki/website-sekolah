import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";

// Sesuai .env kamu (Port 3000)
const BACKEND_URL = "http://localhost:3000";

interface ModalProps {
  data: any; 
  onClose: () => void;
  onSuccess: () => void;
}

const ModalEdit = ({ data, onClose, onSuccess }: ModalProps) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inisialisasi state kosong terlebih dahulu
  const [formData, setFormData] = useState({
    kategori: "staff",
    jabatan: "",
    nama: "",
    ttl: "",
    alamat: "",
    telp: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // PENTING: Gunakan useEffect untuk mendengarkan perubahan data props
  useEffect(() => {
    if (data) {
      setFormData({
        kategori: data.kategori || "staff",
        jabatan: data.jabatan || "",
        nama: data.nama || "",
        ttl: data.ttl || "",
        alamat: data.alamat || "",
        telp: data.telp || "",
      });

      // Set preview foto lama
      if (data.foto) {
        setPreviewUrl(`${BACKEND_URL}/${data.foto.replace(/^\//, '')}`);
      }
    }
  }, [data]); // Akan berjalan setiap kali 'data' dari parent berubah

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Revoke URL lama jika ada untuk mencegah memory leak
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = new FormData();
      
      // Masukkan semua field teks
      Object.entries(formData).forEach(([key, value]) => {
        dataToSend.append(key, value);
      });
      
      // Jika ada file baru, lampirkan
      if (selectedFile) {
        dataToSend.append("foto", selectedFile);
      }

      const response = await fetch(`${BACKEND_URL}/api/struktur-organisasi/${data.id}`, {
        method: "PUT",
        body: dataToSend,
      });

      if (response.ok) {
        onSuccess();
      } else {
        const result = await response.json();
        alert(result.message || "Gagal memperbarui data.");
      }
    } catch (err) { 
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="text-2xl font-bold text-slate-800">Edit Data Pejabat</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-2xl transition-all"
          >
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-10 py-8 overflow-y-auto space-y-6 custom-scrollbar">
          
          {/* Foto Section */}
          <div className="flex flex-col items-center justify-center bg-slate-50 py-8 rounded-[2rem] border-2 border-dashed border-slate-200">
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="w-32 h-32 rounded-[2.5rem] bg-white shadow-xl border-4 border-white flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform group relative"
            >
              <img 
                src={previewUrl || ""} 
                className="w-full h-full object-cover" 
                onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.nama)}&background=random`; }} 
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold">GANTI</span>
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <p className="mt-4 text-xs font-black text-slate-400 uppercase tracking-widest">Klik foto untuk mengganti</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Bagian</label>
              <select 
                name="kategori" 
                value={formData.kategori} 
                onChange={handleChange} 
                className="w-full mt-2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
              >
                <option value="ketuaYayasan">Ketua Yayasan</option>
                <option value="kepalaKomiteTU">Kepala Sekolah / TU</option>
                <option value="wakasek">Wakasek / Bendahara</option>
                <option value="staff">Staff & Guru</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <input 
                type="text" 
                name="nama" 
                value={formData.nama} 
                onChange={handleChange} 
                required 
                className="w-full mt-2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium" 
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Jabatan</label>
              <input 
                type="text" 
                name="jabatan" 
                value={formData.jabatan} 
                onChange={handleChange} 
                required 
                className="w-full mt-2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tempat, Tanggal Lahir</label>
              <input 
                type="text" 
                name="ttl" 
                value={formData.ttl} 
                onChange={handleChange} 
                className="w-full mt-2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium" 
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">No. Telp</label>
              <input 
                type="text" 
                name="telp" 
                value={formData.telp} 
                onChange={handleChange} 
                className="w-full mt-2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium" 
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Singkat</label>
              <input 
                type="text" 
                name="alamat" 
                value={formData.alamat} 
                onChange={handleChange} 
                className="w-full mt-2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium" 
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-slate-50">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4.5 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 py-4.5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-100 disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? "Menyimpan..." : "Update Pejabat"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ModalEdit;