
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function Navbar() {
  const { isAuthenticated, signOut } = useSupabaseAuth();

  return (
    <header className="w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md fixed top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-accent font-bold text-sm">OC</span>
            </div>
            <span className="font-semibold text-white tracking-tight">OBS Challenge</span>
          </Link>
        </div>
        
        <nav className="flex items-center gap-6">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/home" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link to="/overlay" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Overlay
              </Link>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => signOut()}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
