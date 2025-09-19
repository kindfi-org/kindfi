"use client";

import { useStellarSorobanAccount } from "@packages/lib/hooks";
import { createSupabaseBrowserClient } from "@packages/lib/supabase-client";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import type { User } from "next-auth";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";
import { logger } from "~/lib";

interface AuthContextType {
  isSupabaseUserLoading: boolean;
  stellar:
    | ReturnType<typeof useStellarSorobanAccount>
    | Record<string, unknown>;
  user?: User;
  supabaseUser?: SupabaseUser;
}

const AuthContext = createContext<AuthContextType>({
  isSupabaseUserLoading: true,
  stellar: {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use null as initial state to prevent hydration mismatch
  const { data: session } = useSession();
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | undefined>(
    undefined,
  );
  const [isSupabaseUserLoading, setIsSupabaseUserLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();
  const stellarSorobanAccountState = useStellarSorobanAccount(session?.user);

  // biome-ignore lint/correctness/useExhaustiveDependencies: any
  useEffect(() => {
    // Move session check to useEffect to avoid hydration mismatch
    const checkSession = async () => {
      try {
        console.log("🔑 Check User Data session result:", session);
        console.log(
          "🔑 Check User Data session decryption:",
          jwt.decode(session?.user.jwt || ""),
        );

        const {
          data: { session: supabaseSession },
        } = await supabase.auth.getSession();
        console.log("🔒 Supabase Session check result:", supabaseSession);
        setSupabaseUser(supabaseSession?.user);
      } catch (error) {
        logger.error({
          eventType: "Auth check failed",
          error: error,
          details: error,
        });
        setSupabaseUser(undefined);
      } finally {
        setIsSupabaseUserLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setSupabaseUser(session?.user);
        setIsSupabaseUserLoading(false);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [session]);

  // Always render children, but show loading state
  return (
    <AuthContext.Provider
      value={{
        user: session?.user,
        supabaseUser,
        isSupabaseUserLoading,
        stellar: stellarSorobanAccountState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
