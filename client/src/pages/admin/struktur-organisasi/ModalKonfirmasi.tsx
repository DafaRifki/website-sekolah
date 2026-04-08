import { motion } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const ModalKonfirmasi = ({ isOpen, onClose, onConfirm, loading }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl text-center"
      >
        {/* Ikon Tanda Seru Orange */}
        <div className="w-20 h-20 border-4 border-orange-100 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-orange-400">!</span>
        </div>

        <h3 className="text-2xl font-bold text-slate-800 mb-2">Yakin hapus?</h3>
        <p className="text-slate-500 mb-8 px-4">
          Data pejabat yang dihapus tidak bisa dikembalikan!
        </p>

        <div className="flex gap-3">
          <button 
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Menghapus..." : "Ya, hapus"}
          </button>
          <button 
            disabled={loading}
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all"
          >
            Batal
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ModalKonfirmasi;