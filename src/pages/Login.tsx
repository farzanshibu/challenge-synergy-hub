
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { AuthForm } from '@/components/auth/AuthForm';
import { Navbar } from '@/components/layout/Navbar';

export default function Login() {
  const { isAuthenticated } = useSupabaseAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthForm mode="login" />
        </div>
      </div>
    </div>
  );
}
