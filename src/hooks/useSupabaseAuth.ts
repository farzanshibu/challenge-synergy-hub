
import { useState, useEffect, createContext, useContext } from 'react';
import { 
  User, 
  Session, 
  AuthChangeEvent, 
  SignInWithPasswordCredentials, 
  SignUpWithPasswordCredentials 
} from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
};

type AuthContextType = AuthState & {
  signIn: (credentials: SignInWithPasswordCredentials) => Promise<void>;
  signUp: (credentials: SignUpWithPasswordCredentials) => Promise<void>;
  signOut: () => Promise<void>;
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session) {
          setState({ 
            user: session.user, 
            session, 
            isLoading: false 
          });
        } else {
          setState({ 
            user: null, 
            session: null, 
            isLoading: false 
          });
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ 
        user: session?.user || null, 
        session, 
        isLoading: false 
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (credentials: SignInWithPasswordCredentials) => {
    try {
      const { error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      toast({
        title: "Successfully signed in",
        description: "Welcome back to your challenge dashboard",
      });
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (credentials: SignUpWithPasswordCredentials) => {
    try {
      const { error } = await supabase.auth.signUp(credentials);
      if (error) throw error;
      toast({
        title: "Account created successfully",
        description: "Please check your email for verification link",
      });
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
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
    throw new Error('useSupabaseAuth must be used within an AuthProvider');
  }
  return context;
};
