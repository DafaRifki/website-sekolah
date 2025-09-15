import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail, Phone, Briefcase, Edit3, Eye } from "lucide-react";
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
      <Card className="h-full hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col items-center text-center space-y-3">
            <img
              src={
                guru.fotoProfil
                  ? `http://localhost:3000/uploads/${guru.fotoProfil}`
                  : defaultAvatar
              }
              alt={guru.nama}
              onError={(e) => (e.currentTarget.src = defaultAvatar)}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
            />
            <div className="space-y-1">
              <h3 className="font-medium text-base text-gray-900 leading-tight">
                {guru.nama}
              </h3>
              <Badge
                variant={
                  guru.user?.role === "ADMIN" ? "destructive" : "secondary"
                }
                className="text-xs">
                {guru.user?.role || "GURU"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{guru.user?.email || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{guru.noHP || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{guru.jabatan || "-"}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDetailOpen(true)}
              className="flex-1 h-8 text-xs">
              <Eye className="w-3 h-3 mr-1" />
              Detail
            </Button>
            <Button
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="flex-1 h-8 text-xs">
              <Edit3 className="w-3 h-3 mr-1" />
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
