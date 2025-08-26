import apiClient from "@/config/axios";

const isLoggedIn = async () => {
  try {
    const { data } = await apiClient.get("/auth/whoami", {
      withCredentials: true,
    });
    return data.user;
  } catch (error: any) {
    if (error.response?.status !== 401) {
      console.error("Auth check failed:", error);
    }
    return null;
  }
};

export default isLoggedIn;
