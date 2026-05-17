import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  verified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user, token) => {
    Cookies.set('belife_token', token, { expires: 7 });
    set({ user, token });
  },
  logout: () => {
    Cookies.remove('belife_token');
    set({ user: null, token: null });
  },
}));