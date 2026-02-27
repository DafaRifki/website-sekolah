"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, Lock, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface AdminProfileProps {
  data: any;
}

export default function AdminProfile({ data }: AdminProfileProps) {
  const infoItem = (icon: React.ReactNode, label: string, value: string | null | undefined) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors px-2 -mx-2 rounded-lg">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold">{value || "-"}</p>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <Card className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
        <div className="h-24 bg-gradient-to-r from-red-600 to-red-400 group-hover:from-red-700 group-hover:to-red-500 transition-all duration-500" />
        <CardContent className="relative pt-12 pb-6">
          <div className="absolute -top-12 left-6">
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg"
            >
              <div className="w-full h-full rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                <Shield className="w-12 h-12" />
              </div>
            </motion.div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">Administrator</h2>
              <p className="text-muted-foreground">{data.email}</p>
            </div>
            <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none px-4 py-1.5 text-sm font-bold transition-colors">
              SUPER ADMIN
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle className="text-lg">Informasi Akun</CardTitle>
              <CardDescription>Detail kredensial akses sistem</CardDescription>
            </CardHeader>
            <CardContent>
              {infoItem(<Mail className="w-4 h-4" />, "Alamat Email", data.email)}
              {infoItem(<Shield className="w-4 h-4" />, "Role Akses", data.role)}
              {infoItem(<CheckCircle2 className="w-4 h-4" />, "Status Akun", "Terverifikasi")}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow h-full">
            <CardHeader>
              <CardTitle className="text-lg">Keamanan & Aktivitas</CardTitle>
              <CardDescription>Informasi terkait keamanan akun</CardDescription>
            </CardHeader>
            <CardContent>
              {infoItem(<Lock className="w-4 h-4" />, "Password", "••••••••••••")}
              {infoItem(<Clock className="w-4 h-4" />, "Terakhir Login", "Hari ini")}
              <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100 transform hover:scale-[1.02] transition-transform">
                <p className="text-xs text-blue-700 flex items-center gap-2 font-medium">
                  <Lock className="w-3 h-3" /> Rekomendasi Keamanan
                </p>
                <p className="text-[11px] text-blue-600 mt-1 leading-relaxed">
                  Gunakan otentikasi dua faktor untuk mengamankan akses administratif Anda ke sistem sekolah.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
