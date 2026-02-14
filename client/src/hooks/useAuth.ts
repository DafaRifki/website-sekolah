import { useState, useEffect } from "react";
import apiClient from "@/config/axios";

interface User {
  id: number;
  email: string;
  role: "ADMIN" | "GURU" | "SISWA";
  name: string;
  fotoProfil: string | null;
  siswaId?: number;
  guruId?: number;
  statusPendaftaran?: "PENDING_VERIFIKASI" | "DITERIMA";
  kelasWali?: { id_kelas: number; namaKelas: string }[];
  kelasAjar?: { id_kelas: number; namaKelas: string }[];
}

interface UserData {
  id: number;
  email: string;
  role: "ADMIN" | "GURU" | "SISWA";
  guruId?: number;
  siswaId?: number;
  guru?: {
    nama: string;
    fotoProfil: string | null;
    waliKelas?: { id_kelas: number; namaKelas: string }[];
    mengajarMapel?: {
      id_mapel: number;
      kelas: { id_kelas: number; namaKelas: string };
    }[];
  };
  siswa?: {
    nama: string;
    fotoProfil: string | null;
  };
}

let cachedUser: User | null = null;
let isChecking = false;
let promiseCache: Promise<User | null> | null = null;

const fetchUser = async (): Promise<User | null> => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const { data } = await apiClient.get("/auth/profile");
    const userData = data?.data as UserData;

    if (!userData) return null;

    let name = userData.email;
    let fotoProfil: string | null = null;
    let kelasWali: { id_kelas: number; namaKelas: string }[] = [];
    let kelasAjar: { id_kelas: number; namaKelas: string }[] = [];

    if (userData.role === "GURU" && userData.guru) {
      name = userData.guru.nama;
      fotoProfil = userData.guru.fotoProfil;
      if (userData.guru.waliKelas) {
        kelasWali = userData.guru.waliKelas;
      }
      if (userData.guru.mengajarMapel) {
        const mapelKelas = userData.guru.mengajarMapel.map((m) => m.kelas);
        kelasAjar = Array.from(
          new Map(mapelKelas.map((k) => [k.id_kelas, k])).values(),
        );
      }
    } else if (userData.role === "SISWA" && userData.siswa) {
      name = userData.siswa.nama;
      fotoProfil = userData.siswa.fotoProfil;
    } else if (userData.role === "ADMIN") {
      name = "Administrator";
    }

    const normalizedUser: User = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      guruId: userData.guruId,
      siswaId: userData.siswaId,
      name,
      fotoProfil,
      kelasWali,
      kelasAjar,
    };

    localStorage.setItem("user", JSON.stringify(normalizedUser));
    return normalizedUser;
  } catch (err: unknown) {
    if (err && typeof err === "object" && "response" in err) {
      const response = (err as { response: { status: number } }).response;
      if (response && [401, 403, 429].includes(response.status)) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        // Clear alert flags from sessionStorage so they show up again on next login
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith("overdue_alert_shown_")) {
            sessionStorage.removeItem(key);
          }
        });
      }
    }
    console.error("Auth check failed:", err);
    return null;
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [loading, setLoading] = useState(!cachedUser); // false kalau sudah ada cache

  useEffect(() => {
    if (cachedUser) {
      setUser(cachedUser);
      setLoading(false);
      return;
    }

    if (isChecking && promiseCache) {
      promiseCache.then((u) => {
        setUser(u);
        setLoading(false);
      });
      return;
    }

    isChecking = true;
    setLoading(true);

    promiseCache = fetchUser().then((u) => {
      cachedUser = u;
      setUser(u);
      setLoading(false);
      isChecking = false;
      promiseCache = null;
      return u;
    });
  }, []);

  const logout = (redirectToLogin = true) => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Clear alert flags from sessionStorage so they show up again on next login
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("overdue_alert_shown_")) {
        sessionStorage.removeItem(key);
      }
    });

    cachedUser = null;
    setUser(null);
    if (redirectToLogin) {
      window.location.href = "/login";
    }
  };

  const isAdmin = user?.role === "ADMIN";

  const isWaliKelasOf = (id_kelas: number | string) => {
    if (isAdmin) return true;
    if (!user?.kelasWali) return false;
    return user.kelasWali.some((k) => k.id_kelas === Number(id_kelas));
  };

  const isPengajarOf = (id_kelas: number | string) => {
    if (isAdmin) return true;
    if (!user?.kelasAjar) return false;
    return user.kelasAjar.some((k) => k.id_kelas === Number(id_kelas));
  };

  return { user, loading, logout, isAdmin, isWaliKelasOf, isPengajarOf };
};
