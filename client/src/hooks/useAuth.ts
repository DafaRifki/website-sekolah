import apiClient from "@/config/axios";

const isLoggedIn = async () => {
  try {
    // quick check: if there's no access token stored, user is not logged in
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    // call the profile endpoint which requires Authorization header
    const { data } = await apiClient.get("/auth/profile");
    const userData = data?.data;

    if (userData) {
      // Normalize name and photo based on role
      let name = userData.email;
      let fotoProfil = null;

      if (userData.role === "GURU" && userData.guru) {
        name = userData.guru.nama;
        fotoProfil = userData.guru.fotoProfil;
      } else if (userData.role === "SISWA" && userData.siswa) {
        name = userData.siswa.nama;
        fotoProfil = userData.siswa.fotoProfil;
      } else if (userData.role === "ADMIN") {
        name = "Administrator";
        // fotoProfil = userData.siswa.fotoProfil
      }
      return {
        ...userData,
        name,
        fotoProfil,
      };
    }

    return null;
  } catch (err: unknown) {
    // treat any error as not logged in; log it for debugging
    console.error("Auth check failed:", err);
    return null;
  }
};

export default isLoggedIn;
