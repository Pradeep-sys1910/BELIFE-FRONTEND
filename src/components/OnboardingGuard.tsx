'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const SKIP = ['/onboarding', '/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user }  = useAuthStore();
  const pathname  = usePathname();
  const router    = useRouter();

  useEffect(() => {
    if (user && !user.onboarded && !SKIP.some(p => pathname.startsWith(p))) {
      router.replace('/onboarding');
    }
  }, [user, pathname]);

  return <>{children}</>;
}
