import apiClient from "@/config/axios";

const isLoggedIn = async () => {
  try {
    // quick check: if there's no access token stored, user is not logged in
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    // call the profile endpoint which requires Authorization header
    const { data } = await apiClient.get("/auth/profile");
    // server returns profile in data.data (sendSuccess wrapper)
    return data?.data || null;
  } catch (err: unknown) {
    // treat any error as not logged in; log it for debugging
    console.error("Auth check failed:", err);
    return null;
  }
};

export default isLoggedIn;
