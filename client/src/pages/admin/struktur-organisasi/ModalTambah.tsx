import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

interface ModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

// Sesuaikan URL Backend kamu
const BACKEND_URL = "http://localhost:3000";

const ModalTambah = ({ onClose, onSuccess }: ModalProps) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    kategori: "staff",
    jabatan: "",
    nama: "",
    ttl: "",
    alamat: "",
    telp: "",
    sambutan: "" // Kita siapkan agar tidak error di Backend
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validasi foto wajib ada
    if (!selectedFile) {
      return Swal.fire({
        icon: 'warning',
        title: 'Foto Belum Ada',
        text: 'Maulana, silakan pilih foto pejabat dulu ya!',
        confirmButtonColor: '#10b981'
      });
    }
    
    setLoading(true);
    try {
      const dataToSend = new FormData();
      // Masukkan semua teks field
      Object.entries(formData).forEach(([key, value]) => dataToSend.append(key, value));
      // Masukkan file foto
      dataToSend.append("foto", selectedFile);

      const response = await fetch(`${BACKEND_URL}/api/struktur-organisasi`, {
        method: "POST",
        body: dataToSend,
        // JANGAN tambah headers Content-Type kalau pakai FormData, biar browser yang atur otomatis
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data Pejabat telah aman tersimpan.',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-[2rem]' }
        });
        onSuccess();
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Gagal Simpan',
          text: errorData.message || 'Ada masalah saat simpan ke database.',
          confirmButtonColor: '#ef4444'
        });
      }
    } catch (err) { 
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Koneksi Putus',
        text: 'Server Backend mungkin mati atau token bermasalah.',
        confirmButtonColor: '#ef4444'
      });
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white">
          <h3 className="text-2xl font-bold text-slate-800">Tambah Pejabat</h3>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-10 py-8 overflow-y-auto space-y-8 custom-scrollbar">
          {/* Foto Section */}
          <div className="flex flex-col items-center justify-center bg-slate-50 py-8 rounded-[2rem] border-2 border-dashed border-slate-200">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 rounded-[2.5rem] bg-white shadow-xl border-4 border-white flex items-center justify-center overflow-hidden cursor-pointer hover:scale-105 transition-transform"
            >
              {previewUrl ? (
                <img src={previewUrl} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <p className="mt-4 text-sm font-bold text-slate-500">Klik kotak untuk unggah foto</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Bagian</label>
              <select name="kategori" value={formData.kategori} onChange={handleChange} className="w-full mt-2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium">
                <option value="ketuaYayasan">Ketua Yayasan</option>
                <option value="kepalaKomiteTU">Kepala Sekolah / Komite / TU</option>
                <option value="wakasek">Wakil Kepala Sekolah & Bendahara</option>
                <option value="staff">Staff / Guru / Lainnya</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <input type="text" name="nama" value={formData.nama} onChange={handleChange} required className="w-full mt-2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium" placeholder="Nama Beserta Gelar" />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Jabatan Spesifik</label>
              <input type="text" name="jabatan" value={formData.jabatan} onChange={handleChange} required className="w-full mt-2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium" placeholder="Contoh: Wakasek Kesiswaan" />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tempat, Tanggal Lahir</label>
              <input type="text" name="ttl" value={formData.ttl} onChange={handleChange} className="w-full mt-2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium" placeholder="Bogor, 12 Mei 1980" />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">No. WhatsApp</label>
              <input type="text" name="telp" value={formData.telp} onChange={handleChange} className="w-full mt-2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium" placeholder="0812..." />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Singkat</label>
              <input type="text" name="alamat" value={formData.alamat} onChange={handleChange} className="w-full mt-2 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 transition-all font-medium" placeholder="Kecamatan, Kota" />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4.5 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 py-4.5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-100 disabled:opacity-50 transition-all active:scale-95">
              {loading ? "Proses..." : "Simpan Pejabat"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ModalTambah;