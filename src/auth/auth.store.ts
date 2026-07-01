import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { User } from "./auth.types";
import * as authService from "./auth.service";

import { getApiErrorMessage } from "@/lib/api/api-error";

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  clearError: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  loadSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      setUser: (user) => {
        set({
          user,
          loading: false,
          error: null,
          isAuthenticated: Boolean(user),
        });
      },

      clearError: () => {
        set({ error: null });
      },

      login: async (credentials) => {
        set({
          loading: true,
          error: null,
        });

        try {
          const user = await authService.loginWithCredentials(credentials);

          set({
            user,
            loading: false,
            error: null,
            isAuthenticated: true,
          });
        } catch (error) {
          set({
            user: null,
            loading: false,
            isAuthenticated: false,
            error: getApiErrorMessage(error) || "خطایی در ورود رخ داد.",
          });
        }
      },

      loadSession: async () => {
        set({
          loading: true,
          error: null,
        });

        try {
          const user = await authService.getSession();

          set({
            user,
            loading: false,
            error: null,
            isAuthenticated: Boolean(user),
          });
        } catch {
          set({
            user: null,
            loading: false,
            error: null,
            isAuthenticated: false,
          });
        }
      },

      logout: async () => {
        set({
          loading: true,
          error: null,
        });

        try {
          await authService.logout();
        } catch {
          // authService.logout خودش در finally سشن local را پاک می‌کند.
          // اینجا عمداً خطا را به کاربر نشان نمی‌دهیم چون خروج باید قطعی انجام شود.
        } finally {
          set({
            user: null,
            loading: false,
            error: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: "auth-storage",

      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),

      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loading = false;
          state.error = null;
          state.isAuthenticated = Boolean(state.user);
        }
      },
    }
  )
);