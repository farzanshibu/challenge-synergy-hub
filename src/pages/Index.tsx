import { useEffect } from "react";
import { useNavigate, Link, redirect } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { supabase } from "@/lib/supabase";

export default function Index() {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, isLoading, navigate]);

  async function handleSignInWithGoogle(response: any) {
    const { data, error } = await supabase.auth.signInWithIdToken({
      token: response.credential,
      nonce: "NONCE", // must be the same one as provided in data-nonce (if any)
      provider: "google",
    });
    if (error) {
      console.error(error);
    } else {
      console.log(data);
      redirect("/home");
    }
  }

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // @ts-expect-error
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID,
        callback: handleSignInWithGoogle,
      });
      // @ts-expect-error
      window.google.accounts.id.prompt();
    };

    document.body.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="container mx-auto max-w-5xl px-4 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12 md:gap-16">
          <div className="flex-1 animate-fade-in">
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20">
              <p className="text-sm text-accent">
                Ultimate Streaming Challenge Tracker
              </p>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Elevate Your Stream With Interactive Challenges
            </h1>
            <p className="text-lg text-zinc-400 mb-8 max-w-xl">
              Create, manage, and display dynamic challenge progress bars for
              your stream overlay with real-time updates and beautiful visuals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-white w-full sm:w-auto"
                >
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white w-full sm:w-auto"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div className="mb-2 rounded-full bg-zinc-800 w-8 h-8 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-zinc-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-zinc-200 font-medium">Real-time Updates</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Changes reflect instantly in your overlay without refreshing
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div className="mb-2 rounded-full bg-zinc-800 w-8 h-8 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-zinc-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                </div>
                <h3 className="text-zinc-200 font-medium">Custom Layouts</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Sleek, minimal design that fits perfectly with your stream
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div className="mb-2 rounded-full bg-zinc-800 w-8 h-8 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-zinc-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-zinc-200 font-medium">Progress Tracking</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Track multiple challenges simultaneously with visual progress
                </p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/5 lg:w-1/3 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl animate-fade-in">
            <div className="h-12 bg-zinc-800 border-b border-zinc-700 flex items-center px-4">
              <div className="w-3 h-3 rounded-full bg-zinc-600 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-zinc-600 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-zinc-600"></div>
              <div className="ml-auto text-xs text-zinc-400">
                Stream Overlay
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-white">
                    Follower Goal
                  </h3>
                  <div className="px-2 py-0.5 text-xs rounded-full bg-zinc-700 text-zinc-300">
                    Daily
                  </div>
                </div>
                <div className="h-2 w-full bg-zinc-700 rounded-full overflow-hidden">
                  <div className="h-full bg-accent w-3/4 rounded-full"></div>
                </div>
                <div className="text-xs text-zinc-400 mt-1.5 flex justify-end">
                  <span>75 / 100</span>
                </div>
              </div>

              <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-white">
                    Donation Goal
                  </h3>
                  <div className="px-2 py-0.5 text-xs rounded-full bg-zinc-700 text-zinc-300">
                    Monthly
                  </div>
                </div>
                <div className="h-2 w-full bg-zinc-700 rounded-full overflow-hidden">
                  <div className="h-full bg-challenge-info w-1/3 rounded-full"></div>
                </div>
                <div className="text-xs text-zinc-400 mt-1.5 flex justify-end">
                  <span>$150 / $500</span>
                </div>
              </div>

              <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 animate-pulse-subtle">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-white">Sub Train</h3>
                  <div className="px-2 py-0.5 text-xs rounded-full bg-zinc-700 text-zinc-300">
                    Active
                  </div>
                </div>
                <div className="h-2 w-full bg-zinc-700 rounded-full overflow-hidden">
                  <div className="h-full bg-challenge w-2/3 rounded-full"></div>
                </div>
                <div className="text-xs text-zinc-400 mt-1.5 flex justify-end">
                  <span>12 / 20</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
