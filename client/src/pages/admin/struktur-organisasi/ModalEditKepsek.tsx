import { useState, useRef, useEffect, type FormEvent } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

const BACKEND_URL = "http://localhost:3000";

const ModalEditKepsek = ({ data, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({ nama: "", sambutan: "", jabatan: "", kategori: "" });
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (data) {
      setFormData({ nama: data.nama || "", sambutan: data.sambutan || "", jabatan: data.jabatan || "", kategori: data.kategori || "" });
      setPreview(`${BACKEND_URL}/${data.foto?.replace(/^\//, '')}`);
    }
  }, [data]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const body = new FormData();
    Object.entries(formData).forEach(([key, value]) => body.append(key, value));
    if (selectedFile) body.append("foto", selectedFile);

    try {
      const res = await fetch(`${BACKEND_URL}/api/struktur-organisasi/${data.id}`, { method: "PUT", body });
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil Diperbarui',
          text: 'Profil Kepala Sekolah sudah update.',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-[2rem]' }
        });
        onSuccess();
      } else { throw new Error(); }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Terjadi kesalahan sistem.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-10 py-8 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Profil Utama Kepala Sekolah</h3>
            <p className="text-sm text-slate-400 font-medium">Edit foto, nama, dan kata sambutan resmi</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-2xl transition-all">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-8 custom-scrollbar">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center gap-6">
              <div onClick={() => fileInputRef.current?.click()} className="w-64 h-80 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl cursor-pointer relative group transition-all hover:scale-[1.02]">
                <img src={preview || ""} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                   <span className="text-white font-black tracking-widest text-xs">GANTI FOTO</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} hidden onChange={(e) => { if(e.target.files?.[0]) { setSelectedFile(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); } }} />
            </div>
            <div className="md:col-span-2 space-y-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nama Lengkap & Gelar</label>
                <input type="text" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full mt-2 px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-emerald-500 outline-none font-bold text-slate-700 text-lg shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Pesan Sambutan (Muncul di Landing Page)</label>
                <textarea rows={12} value={formData.sambutan} onChange={(e) => setFormData({...formData, sambutan: e.target.value})} className="w-full mt-2 px-6 py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:border-emerald-500 outline-none font-medium text-slate-600 leading-relaxed shadow-sm" placeholder="Tulis kata sambutan yang hangat..." />
              </div>
            </div>
          </div>
          <div className="flex gap-4 pt-6 border-t">
            <button type="button" onClick={onClose} className="flex-1 py-5 font-bold text-slate-400">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 py-5 bg-emerald-600 text-white rounded-[1.5rem] font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all active:scale-95">
              {loading ? "Menyimpan Perubahan..." : "Update Profil Kepsek"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ModalEditKepsek;