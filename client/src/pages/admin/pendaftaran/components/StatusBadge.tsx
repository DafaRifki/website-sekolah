import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  value: string;
  type: "dokumen" | "pembayaran";
}

export function StatusBadge({ value, type }: StatusBadgeProps) {
  let color: string = "bg-gray-200 text-gray-800";

  if (type === "dokumen") {
    if (value === "LENGKAP") color = "bg-green-500 text-white";
    else if (value === "KURANG") color = "bg-amber-500 text-white";
    else color = "bg-red-500 text-white"; // BELUM_DITERIMA
  }

  if (type === "pembayaran") {
    if (value === "LUNAS") color = "bg-blue-500 text-white";
    else if (value === "CICIL") color = "bg-green-500 text-white";
    else color = "bg-red-500 text-white"; // BELUM_BAYAR
  }

  return <Badge className={color}>{value}</Badge>;
}
