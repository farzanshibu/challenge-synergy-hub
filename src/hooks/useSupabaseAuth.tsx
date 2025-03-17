import { useState, useEffect, createContext, useContext } from "react";
import {
  User,
  Session,
  AuthChangeEvent,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  Provider,
} from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
};

type AuthContextType = AuthState & {
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<void>;
  signUp: (credentials: SignUpWithPasswordCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithOneTapGoogle: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session) {
          setState({
            user: session.user,
            session,
            isLoading: false,
          });
        } else {
          setState({
            user: null,
            session: null,
            isLoading: false,
          });
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user || null,
        session,
        isLoading: false,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (
    credentials: SignInWithPasswordCredentials
  ): Promise<void> => {
    await toast.promise(
      (async () => {
        const { error } = await supabase.auth.signInWithPassword(credentials);
        if (error) throw error;
      })(),
      {
        loading: "Signing in...",
        success:
          "Successfully signed in. Welcome back to your challenge dashboard!",
        error: (error) => `Error signing in: ${error.message}`,
      }
    );
  };

  const signUp = async (
    credentials: SignUpWithPasswordCredentials
  ): Promise<void> => {
    await toast.promise(
      (async () => {
        const { error } = await supabase.auth.signUp(credentials);
        if (error) throw error;
      })(),
      {
        loading: "Creating account...",
        success:
          "Account created successfully. Please check your email for verification link.",
        error: (error) => `Error creating account: ${error.message}`,
      }
    );
  };

  const signOut = async (): Promise<void> => {
    await toast.promise(
      (async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      })(),
      {
        loading: "Signing out...",
        success: "Signed out successfully.",
        error: (error) => `Error signing out: ${error.message}`,
      }
    );
  };

  const signInWithOneTapGoogle = async (): Promise<void> => {
    await toast.promise(
      (async () => {
        try {
          // @ts-ignore - Google One Tap types
          const response = await window.google.accounts.id.prompt();
          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: response.credential,
            nonce: 'NONCE', // must be the same one as provided in data-nonce
          });
          if (error) throw error;
        } catch (error: any) {
          throw new Error(error.message || 'Failed to sign in with Google One Tap');
        }
      })(),
      {
        loading: "Signing in with Google One Tap...",
        success: "Successfully signed in with Google One Tap.",
        error: (error) => `Error signing in with Google One Tap: ${error.message}`,
      }
    );
  };

  const signInWithGoogle = async (): Promise<void> => {
    await toast.promise(
      (async () => {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            queryParams: {
              access_type: "offline",
              prompt: "consent",
            },
          },
        });
        if (error) throw error;
      })(),
      {
        loading: "Signing in with Google...",
        success: "Successfully signed in with Google.",
        error: (error) => `Error signing in with Google: ${error.message}`,
      }
    );
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        signInWithOneTapGoogle,
        signInWithGoogle,
        isAuthenticated: !!state.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within an AuthProvider");
  }
  return context;
};
