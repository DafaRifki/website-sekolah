import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone } from "lucide-react";
import defaultAvatar from "../../../../assets/avatar.png";
import React, { useState } from "react";
import EditGuruModal from "./EditGuruModal";
import GuruDetailModal from "./DetailGuruModal";

interface Guru {
  id_guru: number;
  nama: string;
  jabatan?: string;
  noHP?: string;
  fotoProfil?: string;
  user?: { email: string; role: string };
}

interface Props {
  guru: Guru;
  onUpdated: (guru: Guru) => void;
  onDeleted: (id: number) => void;
}

const GuruCard: React.FC<Props> = ({ guru, onUpdated, onDeleted }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <>
      <Card className="shadow-md rounded-2xl">
        <CardHeader className="flex flex-col items-center">
          <img
            src={
              guru.fotoProfil
                ? `http://localhost:3000/uploads/${guru.fotoProfil}`
                : defaultAvatar
            }
            alt={guru.nama}
            onError={(e) => (e.currentTarget.src = defaultAvatar)}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
          />
          <CardTitle className="mt-3 text-lg font-semibold">
            {guru.nama}
          </CardTitle>
          <Badge
            variant={guru.user?.role === "ADMIN" ? "destructive" : "secondary"}
            className="mt-2">
            {guru.user?.role || "GURU"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="flex items-center gap-2 text-gray-700">
            <Mail className="w-4 h-4" /> {guru.user?.email || "-"}
          </p>
          <p className="flex items-center gap-2 text-gray-700">
            <Phone className="w-4 h-4" /> {guru.noHP || "-"}
          </p>
          <p className="text-gray-700">Jabatan: {guru.jabatan || "-"}</p>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDetailOpen(true)}>
              Detail
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsEditOpen(true)}>
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <GuruDetailModal
        idGuru={guru.id_guru}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onDeleted={onDeleted}
      />

      {/* Edit Modal */}
      <EditGuruModal
        guru={guru}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdated={onUpdated}
      />
    </>
  );
};

export default GuruCard;
