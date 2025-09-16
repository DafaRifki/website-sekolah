import apiClient from "@/config/axios";

export const getDashboardSummary = async () => {
  try {
    const res = await apiClient.get("/dashboard/summary");
    return res.data;
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw error;
  }
};
