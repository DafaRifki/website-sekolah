import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail, Phone, Briefcase } from "lucide-react";
import defaultAvatar from "../../../../assets/avatar.png";
import type { Guru } from "./DetailGuruModal";

interface Props {
  guru: Guru;
}

const GuruCard: React.FC<Props> = ({ guru }) => {
  return (
    <Card className="h-full border-none shadow-none bg-transparent hover:bg-transparent">
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
              className="text-xs"
            >
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
      </CardContent>
    </Card>
  );
};

export default GuruCard;