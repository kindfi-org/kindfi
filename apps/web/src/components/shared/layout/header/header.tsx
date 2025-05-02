'use client';

import { useAuth } from '@/hooks/use-auth';
// ... rest of your imports

export function Header() {
  const { user, loading } = useAuth();
  // ... rest of your component code
} 