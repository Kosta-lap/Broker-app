import { ref } from "vue";
import { api } from "../api/http";

export interface AuthUser {
  id: number;
  name: string;
  isAdmin: boolean;
}

const currentUser = ref<AuthUser | null>(null);
const isLoaded = ref(false);

export function useAuth() {
  const fetchMe = async () => {
    if (isLoaded.value) return;
    try {
      const { data } = await api.get<AuthUser>("/auth/me");
      currentUser.value = data;
    } catch {
      currentUser.value = null;
    } finally {
      isLoaded.value = true;
    }
  };

  const login = async (name: string, password: string, isAdmin?: boolean) => {
    const { data } = await api.post<AuthUser>("/auth/login", { name, password, isAdmin });
    currentUser.value = data;
    isLoaded.value = true;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    currentUser.value = null;
    isLoaded.value = true;
  };

  return {
    currentUser,
    isLoaded,
    fetchMe,
    login,
    logout,
  };
}
