import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Users,
  Settings,
  CheckCircle,
  AlertCircle,
  Plus,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import TambahKelasBulkModal from "./TambahKelasBulkModal";
import KelolaKelasModal from "./KelolaKelasModal";
import { useState } from "react";

interface TahunAjaranCardProps {
  data: {
    data: {
      id_tahun: number;
      namaTahun: string;
      kelasRel: {
        isActive: boolean;
        kelas: {
          id_kelas: number;
          namaKelas: string;
          tingkat: string;
        };
      };
    }[];
  };
}

export default function TahunAjaranCard({ data }: TahunAjaranCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const totalKelas = data.data.kelasRel.length;
  const kelasAktif = data.kelasRel.filter((rel) => rel.isActive).length;
  const persentaseAktif =
    totalKelas > 0 ? Math.round((kelasAktif / totalKelas) * 100) : 0;

  // Group classes by tingkat
  const kelasByTingkat = data.kelasRel.reduce((acc, rel) => {
    const tingkat = rel.kelas.tingkat;
    if (!acc[tingkat]) {
      acc[tingkat] = [];
    }
    acc[tingkat].push(rel);
    return acc;
  }, {} as Record<string, typeof data.kelasRel>);

  const tingkatOrder = ["X", "XI", "XII"];
  const sortedTingkat = Object.keys(kelasByTingkat).sort((a, b) => {
    const indexA = tingkatOrder.indexOf(a);
    const indexB = tingkatOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-800 border-0 shadow-md">
      {/* Professional Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {data.namaTahun}
              </CardTitle>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {totalKelas} kelas
                </span>
                {kelasAktif > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400">
                    {kelasAktif} aktif
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="opacity-60 group-hover:opacity-100 transition-opacity">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Indicator */}
        {totalKelas > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Status Kelas
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {persentaseAktif}% Aktif
              </span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 rounded-full"
                style={{ width: `${persentaseAktif}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <Separator className="mx-6" />

      {/* Content */}
      <CardContent className="pt-4">
        {totalKelas === 0 ? (
          /* Professional Empty State */
          <div className="text-center py-8">
            <div className="h-12 w-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
              <BookOpen className="h-6 w-6 text-slate-400" />
            </div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
              Belum ada kelas
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Tambahkan kelas untuk tahun ajaran ini
            </p>
            <Button size="sm" variant="outline" className="shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Kelas
            </Button>
          </div>
        ) : (
          /* Professional Class List */
          <div className="space-y-4">
            {sortedTingkat.map((tingkat) => (
              <div key={tingkat} className="space-y-2">
                {/* Tingkat Header */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-purple-500" />
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Kelas {tingkat}
                    </h4>
                  </div>
                  <Badge variant="outline" className="text-xs px-2">
                    {kelasByTingkat[tingkat].length}
                  </Badge>
                </div>

                {/* Classes */}
                <div className="space-y-2">
                  {kelasByTingkat[tingkat].map((rel) => (
                    <div
                      key={rel.kelas.id_kelas}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            rel.isActive
                              ? "bg-emerald-500 shadow-sm"
                              : "bg-slate-400"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                            {rel.kelas.namaKelas}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Tingkat {rel.kelas.tingkat}
                          </p>
                        </div>
                      </div>

                      <Badge
                        variant={rel.isActive ? "default" : "secondary"}
                        className="text-xs">
                        {rel.isActive ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Nonaktif
                          </>
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Professional Action Section */}
        {totalKelas > 0 && (
          <>
            <Separator className="my-4" />
            <div className="flex gap-2">
              <TambahKelasBulkModal
                tahunAjaranId={data.id_tahun}
                onSuccess={() => {
                  window.location.reload();
                }}
              />
              {/* <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs shadow-sm">
                <Plus className="h-3 w-3 mr-1" />
                Tambah Kelas
              </Button> */}

              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs shadow-sm"
                onClick={() => setIsModalOpen(true)}>
                <Settings className="h-3 w-3 mr-1" />
                Kelola
              </Button>
              <KelolaKelasModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                tahunAjaranId={data.id_tahun}
                onSuccess={() => window.location.reload()}
              />
            </div>
          </>
        )}
      </CardContent>

      {/* Professional Footer */}
      {totalKelas > 0 && (
        <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                Total:{" "}
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {totalKelas}
                </span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400">
                Aktif: <span className="font-medium">{kelasAktif}</span>
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ID #{data.id_tahun}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
