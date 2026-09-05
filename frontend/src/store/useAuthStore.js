import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../features/auth/services/authService';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      organization: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const data = await authService.login(credentials);
        set({
          user: data.user,
          organization: data.organization,
          accessToken: data.tokens.access_token,
          refreshToken: data.tokens.refresh_token,
          isAuthenticated: true,
        });
        return data;
      },

      register: async (registrationData) => {
        const data = await authService.register(registrationData);
        set({
          user: data.user,
          organization: data.organization,
          accessToken: data.tokens.access_token,
          refreshToken: data.tokens.refresh_token,
          isAuthenticated: true,
        });
        return data;
      },

      logout: () => {
        set({
          user: null,
          organization: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },
      
      fetchMe: async () => {
        try {
          const profile = await authService.getMe();
          // The backend returns UserProfileResponse which has organization nested.
          set({
            user: profile,
            organization: profile.organization,
            isAuthenticated: true,
          });
        } catch (error) {
          get().logout();
          throw error;
        }
      }
    }),
    {
      name: 'wagewise-auth', // key in local storage
    }
  )
);
