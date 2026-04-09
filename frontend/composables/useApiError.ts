import type { ApiError } from "~/types/api";

export const useApiError = () => {
  const toast = useToast();

  const handleApiCall = async <T>(
    apiCall: () => Promise<T>,
  ): Promise<{ data: T | null; error: ApiError | null }> => {
    try {
      const data = await apiCall();
      return { data, error: null };
    } catch (err: any) {
      const status = err?.status || err?.statusCode || 500;
      const error: ApiError = {
        status,
        error: err?.data?.error || err?.message || "เกิดข้อผิดพลาด",
        message: err?.data?.message,
      };

      if (status === 401) {
        const authStore = useAuthStore();
        authStore.logout();
      }

      return { data: null, error };
    }
  };

  const showError = (error: ApiError) => {
    toast.add({
      title: "เกิดข้อผิดพลาด",
      description: error.message || error.error,
      color: "red",
    });
  };

  const showSuccess = (message: string) => {
    toast.add({
      title: "สำเร็จ",
      description: message,
      color: "green",
    });
  };

  return { handleApiCall, showError, showSuccess };
};
