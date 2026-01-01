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
}

let cachedUser: User | null = null;
let isChecking = false;
let promiseCache: Promise<User | null> | null = null;

const fetchUser = async (): Promise<User | null> => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const { data } = await apiClient.get("/auth/profile");
    const userData = data?.data;

    if (!userData) return null;

    let name = userData.email;
    let fotoProfil: string | null = null;

    if (userData.role === "GURU" && userData.guru) {
      name = userData.guru.nama;
      fotoProfil = userData.guru.fotoProfil;
    } else if (userData.role === "SISWA" && userData.siswa) {
      name = userData.siswa.nama;
      fotoProfil = userData.siswa.fotoProfil;
    } else if (userData.role === "ADMIN") {
      name = "Administrator";
    }

    const normalizedUser: User = {
      ...userData,
      name,
      fotoProfil,
    };

    localStorage.setItem("user", JSON.stringify(normalizedUser));
    return normalizedUser;
  } catch (err: any) {
    if ([401, 403, 429].includes(err.response?.status)) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
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
    cachedUser = null;
    setUser(null);
    if (redirectToLogin) {
      window.location.href = "/login";
    }
  };

  return { user, loading, logout };
};
