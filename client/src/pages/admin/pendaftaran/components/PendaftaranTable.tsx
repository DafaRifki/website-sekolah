import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { EditableSelect } from "./EditableSelect";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
}

interface Pendaftaran {
  id_pendaftaran: number;
  nama: string;
  email: string;
  tahunAjaran: TahunAjaran;
  statusDokumen: string;
  statusPembayaran: string;
  siswaId: number | null;
}

interface Props {
  data: Pendaftaran[];
  onUpdate: (
    id: number,
    field: "statusDokumen" | "statusPembayaran",
    value: string,
  ) => void;
  onDelete: (id: number) => void;
}

export default function PendaftaranTable({ data, onUpdate, onDelete }: Props) {
  const dokumenOptions = ["BELUM_DITERIMA", "LENGKAP", "KURANG"];
  const pembayaranOptions = ["BELUM_BAYAR", "CICIL", "LUNAS"];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No</TableHead>
          <TableHead>Nama</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Tahun Ajaran</TableHead>
          <TableHead>Status Dokumen</TableHead>
          <TableHead>Status Pembayaran</TableHead>
          <TableHead>...</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((row, idx) => (
          <TableRow key={row.id_pendaftaran}>
            <TableCell>{idx + 1}</TableCell>
            <TableCell>{row.nama}</TableCell>
            <TableCell>{row.email}</TableCell>
            <TableCell>{row.tahunAjaran?.namaTahun || "-"}</TableCell>

            <TableCell>
              <div className="flex items-center gap-2">
                <StatusBadge value={row.statusDokumen} type="dokumen" />
                <EditableSelect
                  value={row.statusDokumen}
                  options={dokumenOptions}
                  disabled={row.siswaId !== null}
                  onChange={(val) =>
                    onUpdate(row.id_pendaftaran, "statusDokumen", val)
                  }
                />
              </div>
            </TableCell>

            <TableCell>
              <div className="flex items-center gap-2">
                <StatusBadge value={row.statusPembayaran} type="pembayaran" />
                <EditableSelect
                  value={row.statusPembayaran}
                  options={pembayaranOptions}
                  disabled={row.siswaId !== null}
                  onChange={(val) =>
                    onUpdate(row.id_pendaftaran, "statusPembayaran", val)
                  }
                />
              </div>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(row.id_pendaftaran)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
