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

interface TahunAjaran {
  id_tahun: number;
  namaTahun: string;
}

interface Pendaftaran {
  id_pendaftaran: number;
  nama: string;
  email: string;
  tahunAjaran: TahunAjaran; // ✅ object
  statusDokumen: string;
  statusPembayaran: string;
}

interface Props {
  data: Pendaftaran[];
  onUpdate: (
    id: number,
    field: "statusDokumen" | "statusPembayaran",
    value: string
  ) => void;
}
export default function PendaftaranTable({ data, onUpdate }: Props) {
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, idx) => (
          <TableRow key={row.id_pendaftaran}>
            <TableCell>{idx + 1}</TableCell>
            <TableCell>{row.nama}</TableCell>
            <TableCell>{row.email}</TableCell>
            <TableCell>{row.tahunAjaran?.namaTahun}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <StatusBadge value={row.statusDokumen} type="dokumen" />
                <EditableSelect
                  value={row.statusDokumen}
                  options={dokumenOptions}
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
                  onChange={(val) =>
                    onUpdate(row.id_pendaftaran, "statusPembayaran", val)
                  }
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
