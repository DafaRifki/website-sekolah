import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  BookOpen,
  Clock,
  ChevronRight,
  CheckCircle,
  Info,
  History,
  Search,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AbsensiService } from "@/services/absensi.service";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StatItem {
  hadir: number;
  sakit: number;
  izin: number;
  alpha: number;
  total: number;
}

interface RiwayatItem {
  id: number;
  pertemuanKe: number;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  mapel: string;
  kelas: string;
  materi: string | null;
  statusPertemuan: "DRAFT" | "COMPLETED";
  stats: StatItem;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// Stat bubble (hadir/sakit/izin/alpha)
const statBubbles = [
  {
    key: "hadir",
    color: "bg-emerald-500",
    ring: "ring-emerald-100",
    label: "Hadir",
  },
  { key: "sakit", color: "bg-blue-500", ring: "ring-blue-100", label: "Sakit" },
  { key: "izin", color: "bg-amber-500", ring: "ring-amber-100", label: "Izin" },
  { key: "alpha", color: "bg-rose-500", ring: "ring-rose-100", label: "Alpha" },
] as const;

function StatBubbles({ stats }: { stats: StatItem }) {
  return (
    <div className="flex -space-x-1.5">
      {statBubbles.map(({ key, color, ring, label }) => (
        <div
          key={key}
          title={label}
          className={`w-8 h-8 border-2 border-white rounded-full ${color} ${ring} ring-1 flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
          {stats[key]}
        </div>
      ))}
    </div>
  );
}

// Skeleton loader card
function SkeletonCard() {
  return (
    <div className="h-44 rounded-xl bg-white border border-slate-200 animate-pulse" />
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-12 text-center">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <History className="h-6 w-6 text-slate-400" />
      </div>
      <p className="font-semibold text-slate-700">Belum Ada Riwayat</p>
      <p className="text-sm text-slate-400 mt-1">
        Pertemuan yang sudah selesai akan muncul di sini.
      </p>
    </div>
  );
}

// Single riwayat card
function RiwayatCard({
  item,
  onClick,
}: {
  item: RiwayatItem;
  onClick: () => void;
}) {
  const isCompleted = item.statusPertemuan === "COMPLETED";

  return (
    <div
      onClick={onClick}
      className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-100 rounded-lg shrink-0">
            <BookOpen className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                className={`text-[10px] font-semibold shadow-none border px-2 py-0 ${
                  isCompleted
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                {isCompleted ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1 inline" />
                    Selesai
                  </>
                ) : (
                  <>
                    <Info className="h-3 w-3 mr-1 inline" />
                    Draft
                  </>
                )}
              </Badge>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {item.jamMulai} – {item.jamSelesai}
              </span>
            </div>
            <p className="font-semibold text-slate-800 line-clamp-1 group-hover:text-slate-900">
              {item.mapel}
            </p>
            <p className="text-sm text-slate-400">Kelas {item.kelas}</p>
          </div>
        </div>

        {/* Arrow */}
        <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors shrink-0">
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Materi */}
      {item.materi && (
        <p className="text-xs text-slate-500 italic bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 mb-3 line-clamp-2">
          {item.materi}
        </p>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar className="h-3.5 w-3.5" />
          {formatTanggal(item.tanggal)}
        </div>
        <StatBubbles stats={item.stats} />
      </div>
    </div>
  );
}

// Pagination
function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onPage: (p: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        disabled={page === 1}
        onClick={onPrev}
        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-300 transition-all">
        <ChevronRight className="h-5 w-5 rotate-180" />
      </button>

      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          onClick={() => onPage(i + 1)}
          className={`min-w-[36px] h-9 rounded-lg text-sm font-semibold transition-all border ${
            page === i + 1
              ? "bg-slate-800 text-white border-slate-800"
              : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
          }`}>
          {i + 1}
        </button>
      ))}

      <button
        disabled={page === totalPages}
        onClick={onNext}
        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-300 transition-all">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RiwayatMengajar() {
  const [riwayatList, setRiwayatList] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchRiwayat();
  }, [page]);

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        toast.error("Sesi berakhir, silakan login kembali");
        return;
      }

      const user = JSON.parse(userStr);
      const guruId = user.guruId || user.id_guru;
      if (!guruId) {
        toast.error("ID Guru tidak ditemukan");
        return;
      }

      const response = await AbsensiService.getRiwayatMengajar(guruId, {
        page,
        limit: 10,
      });
      if (response.success) {
        setRiwayatList(response.data.riwayat);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memuat riwayat mengajar",
      );
    } finally {
      setLoading(false);
    }
  };

  const filtered = riwayatList.filter(
    (item) =>
      item.mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kelas.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full px-6 py-8 space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Riwayat Mengajar
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Daftar pertemuan yang telah dilaksanakan beserta statistik
              kehadiran siswa.
            </p>
          </div>

          {/* Total pertemuan */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Calendar className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">
                Total Pertemuan
              </p>
              <p className="text-xl font-bold text-slate-800 tabular-nums">
                {riwayatList.length}
              </p>
            </div>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari mapel atau kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-slate-400 transition-colors"
          />
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loading ? (
            [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((item) => (
              <RiwayatCard
                key={item.id}
                item={item}
                onClick={() => navigate(`/guru/absensi/pertemuan/${item.id}`)}
              />
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
            onPage={setPage}
          />
        )}
      </div>
    </div>
  );
}
